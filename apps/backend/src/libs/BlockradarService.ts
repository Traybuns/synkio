import { logger } from '../utils/logger';

export interface BlockradarConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
  masterWalletId?: string;
}

export interface BlockradarResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}

export interface BlockradarMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface BlockradarWallet {
  id: string;
  address: string;
  network: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockradarAddress {
  id: string;
  address: string;
  network: string;
  label?: string;
  createdAt: string;
}

export interface BlockradarBalance {
  asset: string;
  balance: string;
  available: string;
  locked: string;
}

export interface BlockradarTransaction {
  id: string;
  type: string;
  status: string;
  amount: string;
  asset: string;
  from: string;
  to: string;
  network: string;
  hash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressParams {
  network: string;
  label?: string;
}

export interface WithdrawParams {
  address: string;
  amount: string;
  asset: string;
  network: string;
  memo?: string;
}

export interface SwapQuoteParams {
  fromAsset: string;
  toAsset: string;
  amount: string;
  network: string;
}

export interface SwapQuote {
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  networkFee: string;
  exchangeRate: string;
  estimatedTime: number;
}

export class BlockradarService {
  private config: BlockradarConfig;
  private baseUrl: string;

  constructor(config: BlockradarConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.blockradar.co/v1';
    
    if (!config.apiKey || !config.apiSecret) {
      logger.warn('Blockradar API credentials not fully configured');
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    params?: Record<string, string>
  ): Promise<BlockradarResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Secret': this.config.apiSecret,
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), options);
      const data = await response.json();

      if (!response.ok) {
        logger.error(`Blockradar API error: ${data.message || response.statusText}`, {
          status: response.status,
          endpoint,
          method
        });
        throw new Error(data.message || `Blockradar API error: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      logger.error(`Blockradar API request failed: ${error.message}`, {
        endpoint,
        method,
        error: error.message
      });
      throw error;
    }
  }

  async getMasterWallet(): Promise<BlockradarWallet> {
    const response = await this.request<BlockradarWallet>('GET', '/master-wallet');
    return response.data;
  }

  async getMasterWalletBalance(asset?: string): Promise<BlockradarBalance | BlockradarBalance[]> {
    const params: Record<string, string> = {};
    if (asset) {
      params.asset = asset;
    }
    const response = await this.request<BlockradarBalance | BlockradarBalance[]>(
      'GET',
      '/master-wallet/balance',
      undefined,
      Object.keys(params).length > 0 ? params : undefined
    );
    return response.data;
  }

  async generateAddress(network: string, label?: string): Promise<BlockradarAddress> {
    const response = await this.request<BlockradarAddress>(
      'POST',
      '/address/generate',
      { network, label }
    );
    return response.data;
  }

  async getAddresses(network?: string): Promise<BlockradarAddress[]> {
    const params: Record<string, string> = {};
    if (network) {
      params.network = network;
    }
    const response = await this.request<BlockradarAddress[]>(
      'GET',
      '/address',
      undefined,
      Object.keys(params).length > 0 ? params : undefined
    );
    return Array.isArray(response.data) ? response.data : [response.data];
  }

  async getAddress(addressId: string): Promise<BlockradarAddress> {
    const response = await this.request<BlockradarAddress>('GET', `/address/${addressId}`);
    return response.data;
  }

  async getAddressBalance(addressId: string, asset?: string): Promise<BlockradarBalance | BlockradarBalance[]> {
    const params: Record<string, string> = {};
    if (asset) {
      params.asset = asset;
    }
    const response = await this.request<BlockradarBalance | BlockradarBalance[]>(
      'GET',
      `/address/${addressId}/balance`,
      undefined,
      Object.keys(params).length > 0 ? params : undefined
    );
    return response.data;
  }

  async withdrawFromMasterWallet(params: WithdrawParams): Promise<BlockradarTransaction> {
    const response = await this.request<BlockradarTransaction>(
      'POST',
      '/withdraw/master-wallet',
      params
    );
    return response.data;
  }

  async withdrawFromAddress(addressId: string, params: WithdrawParams): Promise<BlockradarTransaction> {
    const response = await this.request<BlockradarTransaction>(
      'POST',
      `/withdraw/child-address/${addressId}`,
      params
    );
    return response.data;
  }

  async getSwapQuote(params: SwapQuoteParams): Promise<SwapQuote> {
    const response = await this.request<SwapQuote>(
      'POST',
      '/swap/master-wallet/quote',
      params
    );
    return response.data;
  }

  async executeSwap(params: SwapQuoteParams & { quoteId?: string }): Promise<BlockradarTransaction> {
    const response = await this.request<BlockradarTransaction>(
      'POST',
      '/swap/master-wallet/execute',
      params
    );
    return response.data;
  }

  async getTransactions(
    addressId?: string,
    limit?: number,
    page?: number
  ): Promise<{ transactions: BlockradarTransaction[]; meta?: BlockradarMeta }> {
    const params: Record<string, string> = {};
    if (addressId) params.addressId = addressId;
    if (limit) params.limit = limit.toString();
    if (page) params.page = page.toString();

    const response = await this.request<{
      transactions: BlockradarTransaction[];
      meta?: BlockradarMeta;
    }>('GET', '/transactions', undefined, Object.keys(params).length > 0 ? params : undefined);
    
    return response.data;
  }

  async getTransaction(transactionId: string): Promise<BlockradarTransaction> {
    const response = await this.request<BlockradarTransaction>(
      'GET',
      `/transactions/${transactionId}`
    );
    return response.data;
  }

  async getAssets(): Promise<any[]> {
    const response = await this.request<any[]>('GET', '/assets');
    return Array.isArray(response.data) ? response.data : [response.data];
  }

  async getBlockchains(): Promise<any[]> {
    const response = await this.request<any[]>('GET', '/blockchains');
    return Array.isArray(response.data) ? response.data : [response.data];
  }
}
