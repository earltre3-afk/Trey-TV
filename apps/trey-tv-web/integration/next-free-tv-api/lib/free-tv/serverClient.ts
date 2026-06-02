type ProviderRequest = {
  path: string;
  searchParams?: URLSearchParams;
  signal?: AbortSignal;
};

type ProviderConfig = {
  baseUrl: string;
  apiKey: string;
  accessToken: string;
  provider: string;
};

export class FreeTvConfigurationError extends Error {
  constructor() {
    super("Free TV provider is not configured.");
    this.name = "FreeTvConfigurationError";
  }
}

export class FreeTvProviderError extends Error {
  status: number;

  constructor(status: number) {
    super("Free TV provider request failed.");
    this.name = "FreeTvProviderError";
    this.status = status;
  }
}

export function getFreeTvConfig(): ProviderConfig {
  const baseUrl = process.env.FREE_TV_API_BASE_URL;
  const apiKey = process.env.FREE_TV_API_KEY;
  const accessToken = process.env.FREE_TV_ACCESS_TOKEN;
  const provider = process.env.FREE_TV_PROVIDER || "custom-free-tv";

  if (!baseUrl || !apiKey || !accessToken) {
    throw new FreeTvConfigurationError();
  }

  return { baseUrl, apiKey, accessToken, provider };
}

export async function requestFreeTvProvider({
  path,
  searchParams,
  signal,
}: ProviderRequest): Promise<unknown> {
  const config = getFreeTvConfig();
  const url = new URL(path.replace(/^\/+/, ""), `${config.baseUrl.replace(/\/+$/, "")}/`);

  searchParams?.forEach((value, key) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.accessToken}`,
      "x-api-key": config.apiKey,
    },
    signal,
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new FreeTvProviderError(response.status);
  }

  return response.json();
}
