export interface Tenant {
  _id: string;
  name: string;
  logoUrl: string;
  sinchApiKey: string;
  sinchApiSecret: string;
  retentionPeriodYears: number;
  featureToggles: {
    messages: boolean;
    contacts: boolean;
    voicemail: boolean;
    phone: boolean;
  };
}
