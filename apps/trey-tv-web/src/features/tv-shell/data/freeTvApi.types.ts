export type FreeTvProgram = {
  id?: string;
  title: string;
  time: string;
  live?: boolean;
  startTime?: string;
  endTime?: string;
  description?: string;
  imageUrl?: string;
  genres?: string[];
};

export type FreeTvGuideChannel = {
  id: string;
  num: string;
  name: string;
  logoUrl?: string;
  category?: string;
  country?: string;
  language?: string;
  programs: FreeTvProgram[];
};

export type FreeTvProviderStatus = {
  configured: boolean;
  reachable: boolean;
  provider: string;
  message: string;
};

export type UseFreeTvGuideState = {
  channels: FreeTvGuideChannel[];
  loading: boolean;
  error: string | null;
  source: "api" | "fallback";
};
