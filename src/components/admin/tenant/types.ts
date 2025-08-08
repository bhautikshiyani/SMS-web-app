export interface FeatureToggles {
  messages: boolean;
  contacts: boolean;
  voicemail: boolean;
  phone: boolean;
}

export interface Tenant {
  _id: string;
  name: string;
  logoUrl: string;
  sinchApiKey: string;
  sinchApiSecret: string;
  retentionPeriodYears: number;
  featureToggles: FeatureToggles;
  isDeleted: boolean;
}
