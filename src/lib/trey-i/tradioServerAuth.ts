export type TradioServerAuthError = {
  message?: string;
};

export type TradioServerAuthClient = {
  auth: {
    getUser: (accessToken: string) => Promise<{
      data?: { user?: { id: string } | null } | null;
      error?: TradioServerAuthError | null;
    }>;
  };
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data?: unknown; error?: TradioServerAuthError | null }>;
};

export type TradioAuthenticatedInput = {
  accessToken: string;
};

export async function verifyTradioAccessToken(
  accessToken: string,
  client: TradioServerAuthClient,
): Promise<{ verifiedUserId: string }> {
  const token = accessToken.trim();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await client.auth.getUser(token);
  const verifiedUserId = data?.user?.id;
  if (error || !verifiedUserId) {
    throw new Error('Not authenticated');
  }

  return { verifiedUserId };
}

export async function verifyTradioAdminAccess(
  accessToken: string,
  client: TradioServerAuthClient,
): Promise<{ verifiedUserId: string }> {
  const { verifiedUserId } = await verifyTradioAccessToken(accessToken, client);
  const { data: isAdmin, error } = await client.rpc('is_admin', {
    _user_id: verifiedUserId,
  });

  if (error || isAdmin !== true) {
    throw new Error('Admin access required');
  }

  return { verifiedUserId };
}
