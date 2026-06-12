import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CREATE_TYPES,
  DEFAULT_CREATE_TYPE,
  readLastCreateType,
  writeLastCreateType,
  type CreateType,
} from './last-create-type.ts';

function withMockStorage(fn: () => void) {
  const store = new Map<string, string>();
  const original = globalThis.localStorage;
  // @ts-expect-error — test shim
  globalThis.localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  };
  try {
    fn();
  } finally {
    // @ts-expect-error — restore
    globalThis.localStorage = original;
  }
}

test('CREATE_TYPES lists the four formats', () => {
  assert.deepEqual([...CREATE_TYPES], ['photo', 'video', 'story', 'reel']);
});

test('DEFAULT_CREATE_TYPE is photo', () => {
  assert.equal(DEFAULT_CREATE_TYPE, 'photo');
});

test('readLastCreateType returns default when storage empty', () => {
  withMockStorage(() => {
    assert.equal(readLastCreateType(), 'photo');
  });
});

test('writeLastCreateType + readLastCreateType round-trip', () => {
  withMockStorage(() => {
    writeLastCreateType('video');
    assert.equal(readLastCreateType(), 'video');
    writeLastCreateType('reel');
    assert.equal(readLastCreateType(), 'reel');
  });
});

test('readLastCreateType returns default for invalid stored value', () => {
  withMockStorage(() => {
    localStorage.setItem('treytv.create.lastType', 'BOGUS');
    assert.equal(readLastCreateType(), 'photo');
  });
});

test('readLastCreateType returns default when localStorage throws', () => {
  const original = globalThis.localStorage;
  // @ts-expect-error — test shim that throws
  globalThis.localStorage = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
  };
  try {
    assert.equal(readLastCreateType(), 'photo');
  } finally {
    // @ts-expect-error — restore
    globalThis.localStorage = original;
  }
});

test('writeLastCreateType silently no-ops when localStorage throws', () => {
  const original = globalThis.localStorage;
  // @ts-expect-error — test shim that throws
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => { throw new Error('blocked'); },
  };
  try {
    assert.doesNotThrow(() => writeLastCreateType('story'));
  } finally {
    // @ts-expect-error — restore
    globalThis.localStorage = original;
  }
});

test('CreateType union is the four formats', () => {
  const ok: CreateType[] = ['photo', 'video', 'story', 'reel'];
  assert.equal(ok.length, 4);
});
