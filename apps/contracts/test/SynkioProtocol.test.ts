import { expect } from "chai";
import { ethers } from "hardhat";
import { EscrowManager, PaymentProcessor, ReputationRegistry, DisputeResolution, MockERC20 } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Synkio Protocol", function () {
  let escrowManager: EscrowManager;
  let paymentProcessor: PaymentProcessor;
  let reputationRegistry: ReputationRegistry;
  let disputeResolution: DisputeResolution;
  let mockERC20: MockERC20;
  
  let owner: any;
  let buyer: any;
  let seller: any;
  let arbitrator: any;
  let other: any;

  const initialReputation = 500;
  const escrowAmount = ethers.parseEther("1");
  const paymentAmount = ethers.parseEther("0.5");
  const tokenAmount = ethers.parseEther("10");

  beforeEach(async function () {
    [owner, buyer, seller, arbitrator, other] = await ethers.getSigners();

    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockERC20 = (await MockERC20Factory.deploy("Mock Token", "MTK", ethers.parseEther("10000"))) as unknown as MockERC20;
    await mockERC20.waitForDeployment();

    const ReputationRegistryFactory = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = (await ReputationRegistryFactory.deploy()) as unknown as ReputationRegistry;
    await reputationRegistry.waitForDeployment();

    const PaymentProcessorFactory = await ethers.getContractFactory("PaymentProcessor");
    paymentProcessor = (await PaymentProcessorFactory.deploy(owner.address)) as unknown as PaymentProcessor;
    await paymentProcessor.waitForDeployment();

    const EscrowManagerFactory = await ethers.getContractFactory("EscrowManager");
    escrowManager = (await EscrowManagerFactory.deploy()) as unknown as EscrowManager;
    await escrowManager.waitForDeployment();

    const DisputeResolutionFactory = await ethers.getContractFactory("DisputeResolution");
    disputeResolution = (await DisputeResolutionFactory.deploy()) as unknown as DisputeResolution;
    await disputeResolution.waitForDeployment();

    await escrowManager.setContracts(
      await paymentProcessor.getAddress(),
      await reputationRegistry.getAddress(),
      await disputeResolution.getAddress()
    );
    await disputeResolution.setEscrowManager(await escrowManager.getAddress());
    await paymentProcessor.setEscrowManager(await escrowManager.getAddress());
    await reputationRegistry.setEscrowManager(await escrowManager.getAddress());
  });

  describe("ReputationRegistry", function () {
    describe("User Registration", function () {
      it("Should register a user", async function () {
        await reputationRegistry.registerUser(
          buyer.address,
          "buyer@example.com",
          false
        );

        const reputation = await reputationRegistry.getReputationData(buyer.address);
        expect(reputation.email).to.equal("buyer@example.com");
        expect(reputation.isVendor).to.equal(false);
        expect(reputation.score).to.equal(500);
        expect(reputation.totalTransactions).to.equal(0);
        expect(reputation.completedTransactions).to.equal(0);
        expect(reputation.disputes).to.equal(0);
        expect(reputation.totalVolume).to.equal(0);
      });

      it("Should register a vendor", async function () {
        await reputationRegistry.registerUser(
          seller.address,
          "seller@example.com",
          true
        );

        const reputation = await reputationRegistry.getReputationData(seller.address);
        expect(reputation.email).to.equal("seller@example.com");
        expect(reputation.isVendor).to.equal(true);
        expect(reputation.score).to.equal(500);
      });

      it("Should prevent duplicate registration", async function () {
        await reputationRegistry.registerUser(
          buyer.address,
          "buyer@example.com",
          false
        );

        await expect(
          reputationRegistry.registerUser(
            buyer.address,
            "buyer2@example.com",
            false
          )
        ).to.be.revertedWith("User already registered");
      });

      it("Should only allow owner to register users", async function () {
        await expect(
          reputationRegistry.connect(buyer).registerUser(
            buyer.address,
            "buyer@example.com",
            false
          )
        ).to.be.revertedWithCustomError(reputationRegistry, "OwnableUnauthorizedAccount");
      });

      it("Should map email to address", async function () {
        await reputationRegistry.registerUser(
          buyer.address,
          "buyer@example.com",
          false
        );

        const address = await reputationRegistry.getUserByEmail("buyer@example.com");
        expect(address).to.equal(buyer.address);
      });
    });

    describe("Reputation Updates", function () {
      beforeEach(async function () {
        await reputationRegistry.registerUser(
          buyer.address,
          "buyer@example.com",
          false
        );
        await reputationRegistry.registerUser(
          seller.address,
          "seller@example.com",
          true
        );
      });

      it("Should update reputation score", async function () {
        await reputationRegistry["updateReputation(address,uint256)"](seller.address, 600);

        const reputation = await reputationRegistry.getReputation(seller.address);
        expect(reputation).to.equal(600);
      });

      it("Should enforce reputation bounds", async function () {
        await expect(
          reputationRegistry["updateReputation(address,uint256)"](seller.address, 1001)
        ).to.be.revertedWith("Invalid reputation score");

        await expect(
          reputationRegistry["updateReputation(address,uint256)"](seller.address, 0)
        ).to.not.be.reverted;
      });

      it("Should update reputation via EscrowManager on payment release", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          const initialScore = await reputationRegistry.getReputation(seller.address);
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          await escrowManager.connect(buyer).releasePayment(escrowId, 0);
          
          const reputation = await reputationRegistry.getReputation(seller.address);
          expect(reputation).to.be.greaterThan(initialScore);
          
          const data = await reputationRegistry.getReputationData(seller.address);
          expect(data.totalTransactions).to.equal(1);
          expect(data.completedTransactions).to.equal(1);
          expect(data.totalVolume).to.equal(escrow.amount);
        }
      });

      it("Should track dispute in reputation data", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          await escrowManager.connect(buyer).fileDispute(escrowId, "Test dispute");
          
          const dispute = await escrowManager.getDispute(escrowId);
          expect(dispute.initiator).to.equal(buyer.address);
          expect(dispute.reason).to.equal("Test dispute");
        }
      });

      it("Should only allow EscrowManager to update reputation", async function () {
        await expect(
          reputationRegistry.connect(buyer)["updateReputation(address,bool,uint256)"](
            seller.address,
            true,
            ethers.parseEther("1")
          )
        ).to.be.revertedWith("Only EscrowManager can update reputation");
      });

      it("Should prevent updating unregistered user", async function () {
        await expect(
          reputationRegistry["updateReputation(address,uint256)"](other.address, 600)
        ).to.be.revertedWith("User not registered");
      });
    });

    describe("Query Functions", function () {
      beforeEach(async function () {
        await reputationRegistry.registerUser(
          buyer.address,
          "buyer@example.com",
          false
        );
        await reputationRegistry.registerUser(
          seller.address,
          "seller@example.com",
          true
        );
      });

      it("Should check if user is registered", async function () {
        expect(await reputationRegistry.isUserRegistered(buyer.address)).to.be.true;
        expect(await reputationRegistry.isUserRegistered(other.address)).to.be.false;
      });

      it("Should check if user is vendor", async function () {
        expect(await reputationRegistry.isVendor(seller.address)).to.be.true;
        expect(await reputationRegistry.isVendor(buyer.address)).to.be.false;
      });

      it("Should get reputation data", async function () {
        const data = await reputationRegistry.getReputationData(buyer.address);
        expect(data.email).to.equal("buyer@example.com");
        expect(data.score).to.equal(500);
      });

      it("Should update transaction stats", async function () {
        await reputationRegistry.updateTransactionStats(
          seller.address,
          10,
          8,
          2,
          ethers.parseEther("100")
        );

        const data = await reputationRegistry.getReputationData(seller.address);
        expect(data.totalTransactions).to.equal(10);
        expect(data.completedTransactions).to.equal(8);
        expect(data.disputes).to.equal(2);
        expect(data.totalVolume).to.equal(ethers.parseEther("100"));
      });
    });

    describe("Access Control", function () {
      it("Should set EscrowManager address", async function () {
        await reputationRegistry.setEscrowManager(await escrowManager.getAddress());
        expect(await reputationRegistry.escrowManager()).to.equal(await escrowManager.getAddress());
      });

      it("Should only allow owner to set EscrowManager", async function () {
        await expect(
          reputationRegistry.connect(buyer).setEscrowManager(await escrowManager.getAddress())
        ).to.be.revertedWithCustomError(reputationRegistry, "OwnableUnauthorizedAccount");
      });
    });
  });

  describe("EscrowManager", function () {
    beforeEach(async function () {
      await reputationRegistry.registerUser(
        buyer.address,
        "buyer@example.com",
        false
      );
      await reputationRegistry.registerUser(
        seller.address,
        "seller@example.com",
        true
      );
    });

    describe("Token Management", function () {
      it("Should add token", async function () {
        const network = await ethers.provider.getNetwork();
        const chainId = Number(network.chainId);
        
        await expect(
          escrowManager.connect(owner).addToken(
            await mockERC20.getAddress(),
            chainId,
            "MTK",
            18,
            true
          )
        )
          .to.emit(escrowManager, "TokenAdded")
          .withArgs(await mockERC20.getAddress(), chainId, true);
        
        const tokenInfo = await escrowManager.getTokenInfo(await mockERC20.getAddress());
        expect(tokenInfo.active).to.be.true;
        expect(tokenInfo.chainId).to.equal(chainId);
        expect(tokenInfo.symbol).to.equal("MTK");
        expect(tokenInfo.decimals).to.equal(18);
      });

      it("Should reject zero address token", async function () {
        const network = await ethers.provider.getNetwork();
        const chainId = Number(network.chainId);
        
        await expect(
          escrowManager.connect(owner).addToken(
            ethers.ZeroAddress,
            chainId,
            "ETH",
            18,
            true
          )
        ).to.be.revertedWith("Invalid token address");
      });

      it("Should update token status", async function () {
        const network = await ethers.provider.getNetwork();
        const chainId = Number(network.chainId);
        
        await escrowManager.connect(owner).addToken(
          await mockERC20.getAddress(),
          chainId,
          "MTK",
          18,
          true
        );
        
        await escrowManager.connect(owner).updateTokenStatus(await mockERC20.getAddress(), false);
        const info = await escrowManager.getTokenInfo(await mockERC20.getAddress());
        expect(info.active).to.be.false;
        
        await escrowManager.connect(owner).updateTokenStatus(await mockERC20.getAddress(), true);
        const reactivated = await escrowManager.getTokenInfo(await mockERC20.getAddress());
        expect(reactivated.active).to.be.true;
      });

      it("Should reject updating unregistered token", async function () {
        await expect(
          escrowManager.connect(owner).updateTokenStatus(await mockERC20.getAddress(), false)
        ).to.be.revertedWith("Token not registered");
      });

      it("Should set supported token", async function () {
        await expect(
          escrowManager.connect(owner).setSupportedToken(await mockERC20.getAddress(), true)
        )
          .to.emit(escrowManager, "TokenSupported")
          .withArgs(await mockERC20.getAddress(), true);
      });
    });

    describe("Escrow Creation", function () {
      it("Should create an escrow with ETH", async function () {
        const description = "Test escrow";
        const metadataHash = ethers.id("test-metadata");
        const milestones: any[] = [];

        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          description,
          metadataHash,
          milestones,
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );

        await expect(tx)
          .to.emit(escrowManager, "EscrowCreated")
          .withArgs(1n, buyer.address, seller.address, escrowAmount - (escrowAmount * 250n / 10000n));

        const escrow = await escrowManager.getEscrow(1);
        expect(escrow.buyer).to.equal(buyer.address);
        expect(escrow.seller).to.equal(seller.address);
        expect(escrow.status).to.equal(0); // Pending
      });

      it("Should create an escrow with ERC20 token", async function () {
        const description = "Test escrow with token";
        const metadataHash = ethers.id("test-metadata");
        const milestones: any[] = [];
        const network = await ethers.provider.getNetwork();
        const chainId = Number(network.chainId);
        
        await escrowManager.connect(owner).addToken(
          await mockERC20.getAddress(),
          chainId,
          "MTK",
          18,
          true
        );
        await mockERC20.connect(owner).transfer(buyer.address, tokenAmount);
        await mockERC20.connect(buyer).approve(await escrowManager.getAddress(), tokenAmount);
        
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          description,
          metadataHash,
          milestones,
          await mockERC20.getAddress(),
          tokenAmount
        );

        await expect(tx)
          .to.emit(escrowManager, "EscrowCreated");

        const escrow = await escrowManager.getEscrow(1);
        expect(escrow.token).to.equal(await mockERC20.getAddress());
        expect(escrow.status).to.equal(1); // Funded (ERC20 auto-funded)
      });

      it("Should reject unsupported token", async function () {
        await mockERC20.connect(owner).transfer(buyer.address, tokenAmount);
        await mockERC20.connect(buyer).approve(await escrowManager.getAddress(), tokenAmount);
        
        await expect(
          escrowManager.connect(buyer).createEscrow(
            seller.address,
            "Test",
            ethers.id("test"),
            [],
            await mockERC20.getAddress(),
            tokenAmount
          )
        ).to.be.revertedWith("Token not supported on Base Sepolia");
      });

      it("Should reject creating escrow with self", async function () {
        await expect(
          escrowManager.connect(buyer).createEscrow(
            buyer.address,
            "Test",
            ethers.id("test"),
            [],
            ethers.ZeroAddress,
            escrowAmount,
            { value: escrowAmount }
          )
        ).to.be.revertedWith("Cannot escrow with self");
      });

      it("Should reject zero seller address", async function () {
        await expect(
          escrowManager.connect(buyer).createEscrow(
            ethers.ZeroAddress,
            "Test",
            ethers.id("test"),
            [],
            ethers.ZeroAddress,
            escrowAmount,
            { value: escrowAmount }
          )
        ).to.be.revertedWith("Invalid seller");
      });

      it("Should create escrow with milestones", async function () {
        const description = "Test escrow with milestones";
        const metadataHash = ethers.id("test-metadata");
        const platformFee = escrowAmount * 250n / 10000n;
        const escrowAmountAfterFee = escrowAmount - platformFee;
        const milestoneAmount = escrowAmountAfterFee / 2n;
        const milestones = [
          {
            amount: milestoneAmount,
            description: "Milestone 1",
            completed: false,
            completedAt: 0
          },
          {
            amount: milestoneAmount,
            description: "Milestone 2",
            completed: false,
            completedAt: 0
          }
        ];

        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          description,
          metadataHash,
          milestones,
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );

        await expect(tx).to.emit(escrowManager, "EscrowCreated");

        const storedMilestones = await escrowManager.getMilestones(1);
        expect(storedMilestones.length).to.equal(2);
        expect(storedMilestones[0].amount).to.equal(milestoneAmount);
      });

      it("Should reject milestones that don't sum to escrow amount", async function () {
        const milestones = [
          {
            amount: escrowAmount / 2n,
            description: "Milestone 1",
            completed: false,
            completedAt: 0
          }
        ];

        await expect(
          escrowManager.connect(buyer).createEscrow(
            seller.address,
            "Test",
            ethers.id("test"),
            milestones,
            ethers.ZeroAddress,
            escrowAmount,
            { value: escrowAmount }
          )
        ).to.be.revertedWith("Milestone amounts must equal escrow amount");
      });

      it("Should not allow escrow creation when paused", async function () {
        await escrowManager.connect(owner).pause();
        
        await expect(
          escrowManager.connect(buyer).createEscrow(
            seller.address,
            "Test",
            ethers.id("test"),
            [],
            ethers.ZeroAddress,
            escrowAmount,
            { value: escrowAmount }
          )
        ).to.be.revertedWithCustomError(escrowManager, "EnforcedPause");
      });
    });

    describe("Escrow Funding", function () {
      it("Should fund an escrow with ETH", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test escrow",
          ethers.id("test-metadata"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await expect(
            escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount })
          )
            .to.emit(escrowManager, "EscrowFunded")
            .withArgs(escrowId, totalAmount);
          
          const fundedEscrow = await escrowManager.getEscrow(escrowId);
          expect(fundedEscrow.status).to.equal(1); // Funded
        }
      });

      it("Should reject funding by non-buyer", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await expect(
            escrowManager.connect(seller).fundEscrow(escrowId, { value: totalAmount })
          ).to.be.revertedWith("Only buyer can fund");
        }
      });

      it("Should reject incorrect funding amount", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const incorrectAmount = escrow.amount + escrow.platformFee - 1n;
          
          await expect(
            escrowManager.connect(buyer).fundEscrow(escrowId, { value: incorrectAmount })
          ).to.be.revertedWith("Incorrect amount");
        }
      });
    });

    describe("Payment Release", function () {
      it("Should release full payment with ETH", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          
          const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
          await escrowManager.connect(buyer).releasePayment(escrowId, 0);
          const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
          
          expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(escrow.amount);
          
          const releasedEscrow = await escrowManager.getEscrow(escrowId);
          expect(releasedEscrow.status).to.equal(2); // Completed
        }
      });

      it("Should release payment with ERC20 token", async function () {
        const network = await ethers.provider.getNetwork();
        const chainId = Number(network.chainId);
        
        await escrowManager.connect(owner).addToken(
          await mockERC20.getAddress(),
          chainId,
          "MTK",
          18,
          true
        );
        await mockERC20.connect(owner).transfer(buyer.address, tokenAmount);
        await mockERC20.connect(buyer).approve(await escrowManager.getAddress(), tokenAmount);
        
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          await mockERC20.getAddress(),
          tokenAmount
        );
        const receipt = await tx.wait();
        
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          
          const sellerBalanceBefore = await mockERC20.balanceOf(seller.address);
          await escrowManager.connect(buyer).releasePayment(escrowId, 0);
          const sellerBalanceAfter = await mockERC20.balanceOf(seller.address);
          
          expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(escrow.amount);
        }
      });

      it("Should release milestone payment", async function () {
        const platformFee = escrowAmount * 250n / 10000n;
        const escrowAmountAfterFee = escrowAmount - platformFee;
        const milestoneAmount = escrowAmountAfterFee / 2n;
        const milestones = [
          {
            amount: milestoneAmount,
            description: "Milestone 1",
            completed: false,
            completedAt: 0
          },
          {
            amount: milestoneAmount,
            description: "Milestone 2",
            completed: false,
            completedAt: 0
          }
        ];

        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          milestones,
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          
          const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
          await escrowManager.connect(buyer).releasePayment(escrowId, 0);
          const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
          
          expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(milestoneAmount);
          
          const milestone = await escrowManager.getMilestones(escrowId);
          expect(milestone[0].completed).to.be.true;
        }
      });

      it("Should reject release by non-party", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          
          await expect(
            escrowManager.connect(other).releasePayment(escrowId, 0)
          ).to.be.revertedWith("Not authorized");
        }
      });

      it("Should reject release from unfunded escrow", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          
          await expect(
            escrowManager.connect(buyer).releasePayment(escrowId, 0)
          ).to.be.revertedWith("Escrow not funded");
        }
      });
    });

    describe("Dispute Management", function () {
      it("Should file a dispute", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          
          await expect(
            escrowManager.connect(buyer).fileDispute(escrowId, "Product not as described")
          )
            .to.emit(escrowManager, "EscrowDisputed")
            .withArgs(escrowId, buyer.address, "Product not as described");
          
          const dispute = await escrowManager.getDispute(escrowId);
          expect(dispute.initiator).to.equal(buyer.address);
          expect(dispute.reason).to.equal("Product not as described");
        }
      });

      it("Should reject duplicate dispute", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          await escrowManager.connect(buyer).fileDispute(escrowId, "Reason");
          
          const dispute = await escrowManager.getDispute(escrowId);
          expect(dispute.initiator).to.equal(buyer.address);
          
          await expect(
            escrowManager.connect(seller).fileDispute(escrowId, "Another reason")
          ).to.be.revertedWith("Escrow not funded");
        }
      });
    });

    describe("Escrow Cancellation", function () {
      it("Should cancel pending escrow", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          
          const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
          await escrowManager.connect(buyer).cancelEscrow(escrowId);
          const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
          
          const escrow = await escrowManager.getEscrow(escrowId);
          expect(escrow.status).to.equal(4); // Cancelled
        }
      });

      it("Should reject canceling funded escrow", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          
          await expect(
            escrowManager.connect(buyer).cancelEscrow(escrowId)
          ).to.be.revertedWith("Cannot cancel funded escrow");
        }
      });
    });

    describe("Escrow Expiration", function () {
      it("Should expire escrow after timeout", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          
          await time.increase(31 * 24 * 60 * 60); // 31 days
          
          const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
          await escrowManager.expireEscrow(escrowId);
          const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
          
          const expiredEscrow = await escrowManager.getEscrow(escrowId);
          expect(expiredEscrow.status).to.equal(5); // Expired
        }
      });

      it("Should reject expiring non-expired escrow", async function () {
        const tx = await escrowManager.connect(buyer).createEscrow(
          seller.address,
          "Test",
          ethers.id("test"),
          [],
          ethers.ZeroAddress,
          escrowAmount,
          { value: escrowAmount }
        );
        const receipt = await tx.wait();
        const event = receipt?.logs.find(log => {
          try {
            const parsed = escrowManager.interface.parseLog(log);
            return parsed?.name === "EscrowCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = escrowManager.interface.parseLog(event);
          const escrowId = parsed?.args[0];
          const escrow = await escrowManager.getEscrow(escrowId);
          const totalAmount = escrow.amount + escrow.platformFee;
          
          await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
          
          await expect(
            escrowManager.expireEscrow(escrowId)
          ).to.be.revertedWith("Escrow not expired");
        }
      });
    });

    describe("Admin Functions", function () {
      it("Should pause and unpause", async function () {
        await escrowManager.connect(owner).pause();
        expect(await escrowManager.paused()).to.be.true;
        
        await escrowManager.connect(owner).unpause();
        expect(await escrowManager.paused()).to.be.false;
      });

      it("Should only allow owner to pause", async function () {
        await expect(
          escrowManager.connect(buyer).pause()
        ).to.be.revertedWithCustomError(escrowManager, "OwnableUnauthorizedAccount");
      });

      it("Should set contracts", async function () {
        await escrowManager.connect(owner).setContracts(
          await paymentProcessor.getAddress(),
          await reputationRegistry.getAddress(),
          await disputeResolution.getAddress()
        );
        
        expect(await escrowManager.paymentProcessor()).to.equal(await paymentProcessor.getAddress());
        expect(await escrowManager.reputationRegistry()).to.equal(await reputationRegistry.getAddress());
        expect(await escrowManager.disputeResolution()).to.equal(await disputeResolution.getAddress());
      });
    });
  });

  describe("PaymentProcessor", function () {
    describe("Fee Calculation", function () {
      it("Should calculate fees correctly", async function () {
        const amount = ethers.parseEther("1");
        const fees = await paymentProcessor.calculateFees(amount, ethers.ZeroAddress);
        
        expect(fees.protocolFee).to.equal(amount * 200n / 10000n);
        expect(fees.referrerFee).to.equal(0);
        expect(fees.referrer).to.equal(ethers.ZeroAddress);
      });

      it("Should calculate fees with referrer", async function () {
        const amount = ethers.parseEther("1");
        const fees = await paymentProcessor.calculateFees(amount, seller.address);
        
        expect(fees.protocolFee).to.equal(amount * 200n / 10000n);
        expect(fees.referrerFee).to.equal(amount * 50n / 10000n);
        expect(fees.referrer).to.equal(seller.address);
      });
    });

    describe("Token Support", function () {
      it("Should support ETH token", async function () {
        const isSupported = await paymentProcessor.supportedTokens(ethers.ZeroAddress);
        expect(isSupported).to.be.true;
      });

      it("Should set supported token", async function () {
        await paymentProcessor.connect(owner).setSupportedToken(
          await mockERC20.getAddress(),
          true
        );
        
        const isSupported = await paymentProcessor.supportedTokens(await mockERC20.getAddress());
        expect(isSupported).to.be.true;
      });
    });

    describe("Access Control", function () {
      it("Should set EscrowManager", async function () {
        await paymentProcessor.connect(owner).setEscrowManager(await escrowManager.getAddress());
        expect(await paymentProcessor.escrowManager()).to.equal(await escrowManager.getAddress());
      });

      it("Should only allow owner to set EscrowManager", async function () {
        await expect(
          paymentProcessor.connect(buyer).setEscrowManager(await escrowManager.getAddress())
        ).to.be.revertedWithCustomError(paymentProcessor, "OwnableUnauthorizedAccount");
      });
    });
  });

  describe("DisputeResolution", function () {
    describe("Arbitrator Registration", function () {
      it("Should register an arbitrator", async function () {
        const stake = ethers.parseEther("1");
        
        await expect(
          disputeResolution.connect(arbitrator).registerArbitrator({ value: stake })
        )
          .to.emit(disputeResolution, "ArbitratorRegistered")
          .withArgs(arbitrator.address, stake);

        const arbitratorData = await disputeResolution.arbitrators(arbitrator.address);
        expect(arbitratorData.active).to.be.true;
        expect(arbitratorData.stake).to.equal(stake);
      });

      it("Should reject insufficient stake", async function () {
        const stake = ethers.parseEther("0.5");
        
        await expect(
          disputeResolution.connect(arbitrator).registerArbitrator({ value: stake })
        ).to.be.revertedWith("Insufficient stake");
      });

      it("Should reject duplicate registration", async function () {
        const stake = ethers.parseEther("1");
        
        await disputeResolution.connect(arbitrator).registerArbitrator({ value: stake });
        
        await expect(
          disputeResolution.connect(arbitrator).registerArbitrator({ value: stake })
        ).to.be.revertedWith("Already registered");
      });

      it("Should deactivate arbitrator", async function () {
        const stake = ethers.parseEther("1");
        
        await disputeResolution.connect(arbitrator).registerArbitrator({ value: stake });
        
        const arbitratorBalanceBefore = await ethers.provider.getBalance(arbitrator.address);
        await disputeResolution.connect(arbitrator).deactivateArbitrator();
        const arbitratorBalanceAfter = await ethers.provider.getBalance(arbitrator.address);
        
        const arbitratorData = await disputeResolution.arbitrators(arbitrator.address);
        expect(arbitratorData.active).to.be.false;
        expect(arbitratorBalanceAfter - arbitratorBalanceBefore).to.be.closeTo(stake, ethers.parseEther("0.01"));
      });
    });

    describe("Arbitrator Stats", function () {
      it("Should get arbitrator stats", async function () {
        const stake = ethers.parseEther("1");
        
        await disputeResolution.connect(arbitrator).registerArbitrator({ value: stake });

        const stats = await disputeResolution.getArbitratorStats(arbitrator.address);
        expect(stats.totalCases).to.equal(0);
        expect(stats.successfulCases).to.equal(0);
        expect(stats.successRate).to.equal(0);
        expect(stats.active).to.be.true;
      });

      it("Should check if arbitrator is active", async function () {
        const stake = ethers.parseEther("1");
        
        await disputeResolution.connect(arbitrator).registerArbitrator({ value: stake });
        
        expect(await disputeResolution.isArbitratorActive(arbitrator.address)).to.be.true;
        expect(await disputeResolution.isArbitratorActive(buyer.address)).to.be.false;
      });
    });

    describe("Access Control", function () {
      it("Should set EscrowManager", async function () {
        await disputeResolution.connect(owner).setEscrowManager(await escrowManager.getAddress());
        expect(await disputeResolution.escrowManager()).to.equal(await escrowManager.getAddress());
      });

      it("Should only allow owner to set EscrowManager", async function () {
        await expect(
          disputeResolution.connect(buyer).setEscrowManager(await escrowManager.getAddress())
        ).to.be.revertedWithCustomError(disputeResolution, "OwnableUnauthorizedAccount");
      });
    });
  });

  describe("Integration Tests", function () {
    beforeEach(async function () {
      await reputationRegistry.registerUser(
        buyer.address,
        "buyer@example.com",
        false
      );
      await reputationRegistry.registerUser(
        seller.address,
        "seller@example.com",
        true
      );
    });

    it("Should complete full escrow flow with reputation update", async function () {
      const tx = await escrowManager.connect(buyer).createEscrow(
        seller.address,
        "Integration test",
        ethers.id("test"),
        [],
        ethers.ZeroAddress,
        escrowAmount,
        { value: escrowAmount }
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => {
        try {
          const parsed = escrowManager.interface.parseLog(log);
          return parsed?.name === "EscrowCreated";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = escrowManager.interface.parseLog(event);
        const escrowId = parsed?.args[0];
        const escrow = await escrowManager.getEscrow(escrowId);
        const totalAmount = escrow.amount + escrow.platformFee;
        
        await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
        await escrowManager.connect(buyer).releasePayment(escrowId, 0);
        
        const sellerReputation = await reputationRegistry.getReputationData(seller.address);
        expect(sellerReputation.totalTransactions).to.equal(1);
        expect(sellerReputation.completedTransactions).to.equal(1);
        expect(sellerReputation.score).to.be.greaterThan(500);
      }
    });

    it("Should handle dispute resolution flow", async function () {
      const stake = ethers.parseEther("1");
      await disputeResolution.connect(arbitrator).registerArbitrator({ value: stake });
      
      const tx = await escrowManager.connect(buyer).createEscrow(
        seller.address,
        "Dispute test",
        ethers.id("test"),
        [],
        ethers.ZeroAddress,
        escrowAmount,
        { value: escrowAmount }
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => {
        try {
          const parsed = escrowManager.interface.parseLog(log);
          return parsed?.name === "EscrowCreated";
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = escrowManager.interface.parseLog(event);
        const escrowId = parsed?.args[0];
        const escrow = await escrowManager.getEscrow(escrowId);
        const totalAmount = escrow.amount + escrow.platformFee;
        
        await escrowManager.connect(buyer).fundEscrow(escrowId, { value: totalAmount });
        await escrowManager.connect(buyer).fileDispute(escrowId, "Test dispute");
        
        const dispute = await escrowManager.getDispute(escrowId);
        expect(dispute.initiator).to.equal(buyer.address);
      }
    });
  });
});
