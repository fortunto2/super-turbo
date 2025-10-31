import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'o3-reasoning',
      'o3-pro-reasoning',
      'gemini-2.5-flash-lite',
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'o3-reasoning',
      'o3-pro-reasoning',
      'gemini-2.5-flash-lite',
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
