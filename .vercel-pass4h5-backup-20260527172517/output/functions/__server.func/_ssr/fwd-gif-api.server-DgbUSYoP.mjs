import { c as createServerRpc, a as createServerFn, v as verifyTreyIUser, g as getTreyIServiceClient } from "./index.mjs";
import "../_libs/react.mjs";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
function getFwdIntegrationUrl(route) {
  const base = (process.env.FWD_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}/functions/v1/fwd-trey-tv-integration/${route}`;
}
async function getTreyTvUid(userId) {
  const service = getTreyIServiceClient();
  const {
    data,
    error
  } = await service.from("profiles").select("public_profile_uid").eq("id", userId).maybeSingle();
  if (error || !data?.public_profile_uid) return null;
  return data.public_profile_uid;
}
async function fwdFetch(route, treyTvUid, method, body, params) {
  const integrationKey = process.env.FWD_INTEGRATION_KEY?.trim();
  if (!integrationKey) {
    return {
      ok: false,
      error: "FWD integration not configured."
    };
  }
  if (!process.env.FWD_SUPABASE_URL?.trim()) {
    return {
      ok: false,
      error: "FWD Supabase URL not configured."
    };
  }
  let url = getFwdIntegrationUrl(route);
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url = `${url}?${qs}`;
  }
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Integration-Key": integrationKey,
        "X-Trey-Tv-Uid": treyTvUid
      },
      ...body ? {
        body: JSON.stringify(body)
      } : {}
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      return {
        ok: false,
        error: String(json.error || "FWD API error")
      };
    }
    return {
      ok: true,
      data: json
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error"
    };
  }
}
const checkFwdStatus_createServerFn_handler = createServerRpc({
  id: "06a0d65f0ee9964b1057da423bf5f82363dfe36707ad356b5bc532e0cabaa011",
  name: "checkFwdStatus",
  filename: "src/lib/fwd-gif-api.server.ts"
}, (opts) => checkFwdStatus.__executeServer(opts));
const checkFwdStatus = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(checkFwdStatus_createServerFn_handler, async ({
  data: input
}) => {
  const {
    user
  } = await verifyTreyIUser(input.accessToken);
  const treyTvUid = await getTreyTvUid(user.id);
  return {
    ok: true,
    connected: !!treyTvUid,
    treyTvUid: treyTvUid ?? null
  };
});
const getFwdGifLibrary_createServerFn_handler = createServerRpc({
  id: "54efd8c34512ab5d550c885c1d487179ec2953c31767915a3c6b956f7be02128",
  name: "getFwdGifLibrary",
  filename: "src/lib/fwd-gif-api.server.ts"
}, (opts) => getFwdGifLibrary.__executeServer(opts));
const getFwdGifLibrary = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(getFwdGifLibrary_createServerFn_handler, async ({
  data: input
}) => {
  const {
    user
  } = await verifyTreyIUser(input.accessToken);
  const treyTvUid = await getTreyTvUid(user.id);
  if (!treyTvUid) return {
    ok: false,
    error: "No Trey TV UID on profile."
  };
  return fwdFetch("library", treyTvUid, "GET", void 0, {
    tab: input.tab,
    limit: String(input.limit ?? 48),
    offset: String(input.offset ?? 0),
    ...input.query?.trim() ? {
      q: input.query.trim().slice(0, 80)
    } : {}
  });
});
const captureFwdGif_createServerFn_handler = createServerRpc({
  id: "dd3c9541a8d81125574f1d4b830e129188bd2faf8b14db608176faabcbe86b31",
  name: "captureFwdGif",
  filename: "src/lib/fwd-gif-api.server.ts"
}, (opts) => captureFwdGif.__executeServer(opts));
const captureFwdGif = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(captureFwdGif_createServerFn_handler, async ({
  data: input
}) => {
  const {
    user
  } = await verifyTreyIUser(input.accessToken);
  const treyTvUid = await getTreyTvUid(user.id);
  if (!treyTvUid) return {
    ok: false,
    error: "No Trey TV UID on profile."
  };
  const {
    accessToken: _at,
    ...body
  } = input;
  return fwdFetch("capture", treyTvUid, "POST", body);
});
const saveFwdGif_createServerFn_handler = createServerRpc({
  id: "a660a9c29f5e8bb4a89d30dac8d895f3d9f67f76b80cbe0b9488fe0d11596c43",
  name: "saveFwdGif",
  filename: "src/lib/fwd-gif-api.server.ts"
}, (opts) => saveFwdGif.__executeServer(opts));
const saveFwdGif = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(saveFwdGif_createServerFn_handler, async ({
  data: input
}) => {
  const {
    user
  } = await verifyTreyIUser(input.accessToken);
  const treyTvUid = await getTreyTvUid(user.id);
  if (!treyTvUid) return {
    ok: false,
    error: "No Trey TV UID on profile."
  };
  return fwdFetch("save", treyTvUid, "POST", {
    id: input.id
  });
});
const markFwdGifUsed_createServerFn_handler = createServerRpc({
  id: "80d3dacfe34600be625cfe556ae54069067d4aa3a6f0c2bf0a0ab328468705ac",
  name: "markFwdGifUsed",
  filename: "src/lib/fwd-gif-api.server.ts"
}, (opts) => markFwdGifUsed.__executeServer(opts));
const markFwdGifUsed = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(markFwdGifUsed_createServerFn_handler, async ({
  data: input
}) => {
  const {
    user
  } = await verifyTreyIUser(input.accessToken);
  const treyTvUid = await getTreyTvUid(user.id);
  if (!treyTvUid) return {
    ok: false,
    error: "No Trey TV UID on profile."
  };
  return fwdFetch("mark-used", treyTvUid, "POST", {
    ...input.id ? {
      id: input.id
    } : {},
    ...input.gif_url ? {
      gif_url: input.gif_url
    } : {}
  });
});
const removeFwdGif_createServerFn_handler = createServerRpc({
  id: "38781efe225655552b421e825b71f0406713442aef6542b84eb03562c2b94db2",
  name: "removeFwdGif",
  filename: "src/lib/fwd-gif-api.server.ts"
}, (opts) => removeFwdGif.__executeServer(opts));
const removeFwdGif = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(removeFwdGif_createServerFn_handler, async ({
  data: input
}) => {
  const {
    user
  } = await verifyTreyIUser(input.accessToken);
  const treyTvUid = await getTreyTvUid(user.id);
  if (!treyTvUid) return {
    ok: false,
    error: "No Trey TV UID on profile."
  };
  return fwdFetch("remove", treyTvUid, "POST", {
    id: input.id
  });
});
export {
  captureFwdGif_createServerFn_handler,
  checkFwdStatus_createServerFn_handler,
  getFwdGifLibrary_createServerFn_handler,
  markFwdGifUsed_createServerFn_handler,
  removeFwdGif_createServerFn_handler,
  saveFwdGif_createServerFn_handler
};
