// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ISynkioProtocol.sol";

contract EscrowManager is ReentrancyGuard, Ownable, Pausable, ISynkioProtocol {
    using SafeERC20 for IERC20;
    uint256 public constant PLATFORM_FEE_PERCENT = 250; // 2.5%
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant ESCROW_TIMEOUT = 30 days;
    
    uint256 public nextEscrowId = 1;
    uint256 public totalVolume;
    uint256 public totalFees;
    
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Milestone[]) public milestones;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256) public userEscrowCount;
    mapping(address => bool) public supportedTokens;
    mapping(address => TokenInfo) public tokenInfo;
    
    address public paymentProcessor;
    address public reputationRegistry;
    address public disputeResolution;
    
    modifier onlyEscrowParty(uint256 escrowId) {
        Escrow memory escrow = escrows[escrowId];
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not authorized"
        );
        _;
    }
    
    modifier onlyValidEscrow(uint256 escrowId) {
        require(escrowId > 0 && escrowId < nextEscrowId, "Invalid escrow");
        _;
    }
    
    modifier onlySupportedTokens(address token) {
        require(
            token == address(0) || supportedTokens[token],
            "Token not supported on Base Sepolia"
        );
        _;
    }

    constructor() Ownable(msg.sender) {
    }

    function setContracts(
        address _paymentProcessor,
        address _reputationRegistry,
        address _disputeResolution
    ) external onlyOwner {
        paymentProcessor = _paymentProcessor;
        reputationRegistry = _reputationRegistry;
        disputeResolution = _disputeResolution;
    }
    
    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }
    
    function addToken(
        address token,
        uint256 chainId,
        string memory symbol,
        uint8 decimals,
        bool active
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        tokenInfo[token] = TokenInfo({
            token: token,
            chainId: chainId,
            symbol: symbol,
            decimals: decimals,
            active: active
        });
        supportedTokens[token] = active;
        emit TokenAdded(token, chainId, active);
    }
    
    function getTokenInfo(address token) external view returns (TokenInfo memory) {
        return tokenInfo[token];
    }
    
    function updateTokenStatus(address token, bool active) external onlyOwner {
        require(tokenInfo[token].token != address(0), "Token not registered");
        tokenInfo[token].active = active;
        supportedTokens[token] = active;
        emit TokenSupported(token, active);
    }

    function createEscrow(
        address seller,
        string memory description,
        bytes32 metadataHash,
        Milestone[] memory _milestones,
        address token,
        uint256 amount
    ) external payable whenNotPaused onlySupportedTokens(token) returns (uint256) {
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Cannot escrow with self");
        
        uint256 escrowAmount;
        uint256 platformFee;
        
        bool isERC20 = token != address(0);
        
        if (token == address(0)) {
            require(msg.value > 0, "Amount must be greater than 0");
            platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 10000;
            escrowAmount = msg.value - platformFee;
        } else {
            require(amount > 0, "Amount must be greater than 0");
            require(supportedTokens[token], "Token not supported");
            platformFee = (amount * PLATFORM_FEE_PERCENT) / 10000;
            escrowAmount = amount - platformFee;
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
        
        uint256 escrowId = nextEscrowId++;
        
        escrows[escrowId] = Escrow({
            id: escrowId,
            buyer: msg.sender,
            seller: seller,
            amount: escrowAmount,
            platformFee: platformFee,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + ESCROW_TIMEOUT,
            status: isERC20 ? EscrowStatus.Funded : EscrowStatus.Pending,
            description: description,
            metadataHash: metadataHash,
            token: token
        });
        
        // Add milestones if provided
        if (_milestones.length > 0) {
            uint256 totalMilestoneAmount = 0;
            for (uint256 i = 0; i < _milestones.length; i++) {
                milestones[escrowId].push(_milestones[i]);
                totalMilestoneAmount += _milestones[i].amount;
            }
            require(totalMilestoneAmount == escrowAmount, "Milestone amounts must equal escrow amount");
        }
        
        userEscrowCount[msg.sender]++;
        userEscrowCount[seller]++;
        totalVolume += isERC20 ? amount : msg.value;
        totalFees += platformFee;
        
        emit EscrowCreated(escrowId, msg.sender, seller, escrowAmount);
        
        if (isERC20) {
            emit EscrowFunded(escrowId, amount);
        }
        
        return escrowId;
    }

    function fundEscrow(uint256 escrowId) 
        external 
        payable 
        onlyValidEscrow(escrowId)
        whenNotPaused 
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Pending, "Escrow not pending");
        require(msg.sender == escrow.buyer, "Only buyer can fund");
        require(msg.value == escrow.amount + escrow.platformFee, "Incorrect amount");
        
        escrow.status = EscrowStatus.Funded;
        
        emit EscrowFunded(escrowId, msg.value);
    }

    function releasePayment(uint256 escrowId, uint256 milestoneIndex) 
        external 
        onlyValidEscrow(escrowId)
        nonReentrant
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(block.timestamp <= escrow.expiresAt, "Escrow expired");
        require(msg.sender == escrow.buyer, "Only buyer can release payment");
        
        uint256 releaseAmount;
        
        if (milestones[escrowId].length > 0) {
            require(milestoneIndex < milestones[escrowId].length, "Invalid milestone");
            Milestone storage milestone = milestones[escrowId][milestoneIndex];
            require(!milestone.completed, "Milestone already completed");
            
            milestone.completed = true;
            milestone.completedAt = block.timestamp;
            releaseAmount = milestone.amount;
            
            bool allMilestonesCompleted = true;
            for (uint256 i = 0; i < milestones[escrowId].length; i++) {
                if (!milestones[escrowId][i].completed) {
                    allMilestonesCompleted = false;
                    break;
                }
            }
            
            if (allMilestonesCompleted) {
                escrow.status = EscrowStatus.Completed;
            }
        } else {
            releaseAmount = escrow.amount;
            escrow.status = EscrowStatus.Completed;
        }
        
        if (escrow.token == address(0)) {
            (bool success, ) = escrow.seller.call{value: releaseAmount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(escrow.token).safeTransfer(escrow.seller, releaseAmount);
        }
        
        emit EscrowCompleted(escrowId, releaseAmount);
        
        // Update reputation
        if (reputationRegistry != address(0)) {
            IReputationRegistry(reputationRegistry).updateReputation(
                escrow.seller,
                true,
                releaseAmount
            );
        }
    }

    function fileDispute(uint256 escrowId, string memory reason) 
        external 
        onlyValidEscrow(escrowId)
        onlyEscrowParty(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(disputes[escrowId].createdAt == 0, "Dispute already filed");
        
        disputes[escrowId] = Dispute({
            escrowId: escrowId,
            initiator: msg.sender,
            reason: reason,
            createdAt: block.timestamp,
            status: DisputeStatus.Pending,
            arbitrator: address(0)
        });
        
        escrow.status = EscrowStatus.Disputed;
        
        emit EscrowDisputed(escrowId, msg.sender, reason);
    }

    function resolveDispute(uint256 escrowId, bool buyerWins) 
        external 
        onlyValidEscrow(escrowId)
    {
        require(msg.sender == disputeResolution, "Only dispute resolution contract");
        
        Escrow storage escrow = escrows[escrowId];
        Dispute storage dispute = disputes[escrowId];
        
        require(escrow.status == EscrowStatus.Disputed, "No active dispute");
        require(dispute.status == DisputeStatus.Pending, "Dispute already resolved");
        
        dispute.status = DisputeStatus.Resolved;
        dispute.arbitrator = msg.sender;
        
        address winner = buyerWins ? escrow.buyer : escrow.seller;
        address loser = buyerWins ? escrow.seller : escrow.buyer;
        
        if (escrow.token == address(0)) {
            (bool success, ) = winner.call{value: escrow.amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(escrow.token).safeTransfer(winner, escrow.amount);
        }
        
        escrow.status = EscrowStatus.Completed;
        
        emit DisputeResolved(escrowId, msg.sender, buyerWins);
        
        // Update reputation
        if (reputationRegistry != address(0)) {
            IReputationRegistry(reputationRegistry).updateReputation(winner, true, escrow.amount);
            IReputationRegistry(reputationRegistry).updateReputation(loser, false, escrow.amount);
        }
    }

    function cancelEscrow(uint256 escrowId) 
        external 
        onlyValidEscrow(escrowId)
        onlyEscrowParty(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Pending, "Cannot cancel funded escrow");
        
        escrow.status = EscrowStatus.Cancelled;
        
        if (escrow.token == address(0)) {
            (bool success, ) = escrow.buyer.call{value: escrow.amount + escrow.platformFee}("");
            require(success, "Refund failed");
        } else {
            IERC20(escrow.token).safeTransfer(escrow.buyer, escrow.amount + escrow.platformFee);
        }
    }

    function expireEscrow(uint256 escrowId) 
        external 
        onlyValidEscrow(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded, "Escrow not funded");
        require(block.timestamp > escrow.expiresAt, "Escrow not expired");
        
        escrow.status = EscrowStatus.Expired;
        
        if (escrow.token == address(0)) {
            (bool success, ) = escrow.buyer.call{value: escrow.amount}("");
            require(success, "Refund failed");
        } else {
            IERC20(escrow.token).safeTransfer(escrow.buyer, escrow.amount);
        }
    }

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    function getMilestones(uint256 escrowId) external view returns (Milestone[] memory) {
        return milestones[escrowId];
    }

    function getDispute(uint256 escrowId) external view returns (Dispute memory) {
        return disputes[escrowId];
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}

interface IReputationRegistry {
    function updateReputation(address user, bool success, uint256 amount) external;
}
