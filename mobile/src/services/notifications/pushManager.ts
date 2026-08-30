// Safe stub for Expo Go - hardware push notifications require a custom development build (EAS build) in SDK 53+
export const pushManager = {
  async registerForPushNotificationsAsync(): Promise<string | null> {
    // Disabled in Expo Go
    return null;
  },
};
