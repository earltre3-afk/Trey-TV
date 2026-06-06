import assert from 'node:assert/strict';
import test from 'node:test';
import {
  reviewPendingClipForAdmin,
  verifyClipReviewAdmin,
} from './broadcastClipReviewRules.ts';

function createAdminClientMock(options: { userId?: string; isAdmin?: boolean }) {
  const calls: {
    token?: string;
    rpcArgs?: Record<string, unknown>;
    updatePatch?: Record<string, unknown>;
    filters: Array<[string, unknown]>;
  } = { filters: [] };

  const query = {
    update(patch: Record<string, unknown>) {
      calls.updatePatch = patch;
      return this;
    },
    eq(column: string, value: unknown) {
      calls.filters.push([column, value]);
      return this;
    },
    select() {
      return this;
    },
    maybeSingle() {
      return Promise.resolve({ data: { id: 'clip-1', clip_status: 'approved' }, error: null });
    },
  };

  const client = {
    auth: {
      getUser(token: string) {
        calls.token = token;
        return Promise.resolve({
          data: { user: options.userId ? { id: options.userId } : null },
          error: options.userId ? null : { message: 'invalid token' },
        });
      },
    },
    rpc(name: string, args: Record<string, unknown>) {
      calls.rpcArgs = { name, ...args };
      return Promise.resolve({ data: options.isAdmin === true, error: null });
    },
    from(table: string) {
      assert.equal(table, 'tradio_live_highlight_clips');
      return query;
    },
  };

  return { client, calls };
}

test('clip review admin verification rejects missing or non-admin tokens', async () => {
  const missing = createAdminClientMock({ userId: undefined, isAdmin: false });
  await assert.rejects(
    () => verifyClipReviewAdmin('', missing.client),
    /Admin access required/,
  );

  const nonAdmin = createAdminClientMock({ userId: 'user-1', isAdmin: false });
  await assert.rejects(
    () => verifyClipReviewAdmin('token-1', nonAdmin.client),
    /Admin access required/,
  );
  assert.deepEqual(nonAdmin.calls.rpcArgs, { name: 'is_admin', _user_id: 'user-1' });
});

test('admin clip review verifies token and updates only pending review clips', async () => {
  const { client, calls } = createAdminClientMock({ userId: 'admin-1', isAdmin: true });

  const result = await reviewPendingClipForAdmin(
    {
      accessToken: 'token-1',
      clipId: 'clip-1',
      reviewNotes: 'Clear to publish.',
      status: 'approved',
    },
    client,
    () => '2026-06-05T12:00:00.000Z',
  );

  assert.equal(result.success, true);
  assert.equal(calls.token, 'token-1');
  assert.deepEqual(calls.updatePatch, {
    clip_status: 'approved',
    review_notes: 'Clear to publish.',
    updated_at: '2026-06-05T12:00:00.000Z',
  });
  assert.deepEqual(calls.filters, [
    ['id', 'clip-1'],
    ['clip_status', 'pending_review'],
  ]);
});
