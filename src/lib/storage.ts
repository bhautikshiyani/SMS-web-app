const userSettings: Record<string, { apiKey: string }> = {};

export function saveApiKey(userId: string, apiKey: string) {
  userSettings[userId] = { apiKey };
}

export function getApiKey(userId: string): string | undefined {
  return userSettings[userId]?.apiKey;
}
