import assert from 'node:assert/strict';
import test from 'node:test';
import {
  verifyTradioAccessToken,
  verifyTradioAdminAccess,
  type TradioServerAuthClient,
} from './tradioServerAuth.ts';

function createClient(options?: {
  userId?: string | null;
  authError?: string;
  isAdmin?: boolean;
  adminError?: string;
}) {
  const calls: Array<[string, unknown]> = [];
  const client: TradioServerAuthClient = {
    auth: {
      getUser: async (token: string) => {
        calls.push(['getUser', token]);
        return {
          data: { user: options?.userId ? { id: options.userId } : null },
          error: options?.authError ? { message: options.authError } : null,
        };
      },
    },
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push([name, args]);
      return {
        data: options?.isAdmin ?? false,
        error: options?.adminError ? { message: options.adminError } : null,
      };
    },
  };

  return { client, calls };
}

test('creator auth rejects missing and invalid access tokens', async () => {
  const missing = createClient({ userId: 'user-1' });
  await assert.rejects(
    verifyTradioAccessToken('  ', missing.client),
    /Not authenticated/,
  );
  assert.deepEqual(missing.calls, []);

  const invalid = createClient({ authError: 'invalid jwt' });
  await assert.rejects(
    verifyTradioAccessToken('bad-token', invalid.client),
    /Not authenticated/,
  );
  assert.deepEqual(invalid.calls, [['getUser', 'bad-token']]);
});

test('creator auth derives verifiedUserId from the verified token', async () => {
  const { client, calls } = createClient({ userId: 'verified-user' });
  const result = await verifyTradioAccessToken('access-token', client);

  assert.deepEqual(result, { verifiedUserId: 'verified-user' });
  assert.deepEqual(calls, [['getUser', 'access-token']]);
});

test('admin auth checks trusted is_admin with the token-derived user id', async () => {
  const { client, calls } = createClient({ userId: 'admin-user', isAdmin: true });
  const result = await verifyTradioAdminAccess('admin-token', client);

  assert.deepEqual(result, { verifiedUserId: 'admin-user' });
  assert.deepEqual(calls, [
    ['getUser', 'admin-token'],
    ['is_admin', { _user_id: 'admin-user' }],
  ]);
});

test('admin auth rejects a verified non-admin user', async () => {
  const { client } = createClient({ userId: 'creator-user', isAdmin: false });
  await assert.rejects(
    verifyTradioAdminAccess('creator-token', client),
    /Admin access required/,
  );
});
