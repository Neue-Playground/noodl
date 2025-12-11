export type NeueSession = {
  email: string;
  refreshToken: string;
  token: string;
  tokenUpdatedAt: number;
  tokenExpiresAt: number;
  aiTokenExpiresAt?: number;
  aiToken?: string;
};

export type NeueDevice = {
  id: string;
  name: string;
  description: string;
  environmentId: string;
  config: string;
  flow: string;
};

export type NeueFlow = {
  id: string;
  data: string;
};

export type NeueEnvironment = {
  devices: NeueDevice[];
  flows: string[];
};
