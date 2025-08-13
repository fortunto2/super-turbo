import {
  UserBalance,
  CreditTransaction,
  CreditUsage,
  BalanceConfig,
} from "./types";
import { superDuperAIClient } from "@turbo-super/api";

export class BalanceService {
  private client = superDuperAIClient;

  async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      const response = await this.client.request<UserBalance>({
        method: "GET",
        url: `/user/${userId}/balance`,
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get user balance: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async addCredits(
    userId: string,
    amount: number,
    type: "purchase" | "bonus"
  ): Promise<CreditTransaction> {
    try {
      const response = await this.client.request<CreditTransaction>({
        method: "POST",
        url: `/user/${userId}/credits`,
        data: {
          amount,
          type,
          description: `${type === "purchase" ? "Credit purchase" : "Bonus credits"}`,
        },
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to add credits: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async useCredits(
    userId: string,
    usage: CreditUsage
  ): Promise<CreditTransaction> {
    try {
      const response = await this.client.request<CreditTransaction>({
        method: "POST",
        url: `/user/${userId}/credits/use`,
        data: usage,
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to use credits: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getTransactionHistory(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<CreditTransaction[]> {
    try {
      const response = await this.client.request<CreditTransaction[]>({
        method: "GET",
        url: `/user/${userId}/transactions`,
        params: { limit, offset },
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get transaction history: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getBalanceConfig(): Promise<BalanceConfig> {
    try {
      const response = await this.client.request<BalanceConfig>({
        method: "GET",
        url: "/config/balance",
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get balance config: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Export default instance
export const balanceService = new BalanceService();
