import { randomBytes, createHash, timingSafeEqual, createHmac } from "node:crypto";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
import { Readable, PassThrough } from "node:stream";
import { r as renderRouterToStream, R as RouterProvider } from "../_libs/tanstack__react-router.mjs";
import { w as defineHandlerCallback } from "../_libs/tanstack__router-core.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { j as RoomConfiguration, k as RoomAgentDispatch } from "../_libs/livekit__protocol.mjs";
import { A as AccessToken, R as RoomServiceClient } from "../_libs/livekit-server-sdk.mjs";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
const manifest = {
  "03fa936e1fa0237d732fa54077b4b7792692f4db1803b1d147ebff32b07995ab": {
    functionName: "createWatchParty_createServerFn_handler",
    importer: () => import("./party.server-Dm5uBmdX.mjs")
  },
  "06a0d65f0ee9964b1057da423bf5f82363dfe36707ad356b5bc532e0cabaa011": {
    functionName: "checkFwdStatus_createServerFn_handler",
    importer: () => import("./fwd-gif-api.server-DgbUSYoP.mjs")
  },
  "096bcdbce722acde5178a5e7a0db5a6b749ccb7acf34224f54863b1759861d4e": {
    functionName: "listDeveloperDashboard_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "0fe2ec5475917eb3f8d1f4ac2dd622ce0b61561000de63b9adff572ffb5878bf": {
    functionName: "validateFwdOAuthAuthorizeRequest_createServerFn_handler",
    importer: () => import("./oauth.server-FOraQo6o.mjs")
  },
  "14250ff0c506277113440b0dc94265ef0d9033ca18eaf3a790c9abf2e7c76b82": {
    functionName: "approveOAuthAuthorization_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "148e48d6c0a10c56b17563b0cc6cb1af5cb3dd147af07e390d5c64a303ecb22c": {
    functionName: "generateAdminReviewDraft_createServerFn_handler",
    importer: () => import("./vertex.server-CccJYk3n.mjs")
  },
  "158d5275b118404c6378c88b6bbc169c097dd89e1e74e7566f776cd1160aa210": {
    functionName: "chooseOnboardingMethod_createServerFn_handler",
    importer: () => import("./onboarding.server-C2FgIOnP.mjs")
  },
  "17b10bb5598753fba536d07e14923d7c22663af25668f440ba8ff661a0e5dd58": {
    functionName: "requestDirectUpload_createServerFn_handler",
    importer: () => import("./upload.server-C9GXCd8R.mjs")
  },
  "182b583c26d2258ad5be9766f418e8841ba3ac4b337fff97600af640b6f7da8c": {
    functionName: "updateDeveloperApp_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "1dc211957eed47e3bbaefba9d598b628d20ea7eaaf5e3eafe8499ec1998ea9b2": {
    functionName: "listAdminDeveloperApps_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "2013fb9d641643a76de9394cb914e45d53fc33f2ac8dc4d3a3526038b4b3fda4": {
    functionName: "saveImportDraft_createServerFn_handler",
    importer: () => import("./import-screenshot.server-Ch1RtKHc.mjs")
  },
  "264431b7c48ff4fbd07e06660b3ffb7277dfd50a7e5a999347f19c353806337d": {
    functionName: "approveFwdOAuthAuthorization_createServerFn_handler",
    importer: () => import("./oauth.server-FOraQo6o.mjs")
  },
  "2b8b306f4f6a5f94d8629aa686e95e9546aac0ecacf45d111e9d469c0009e5bf": {
    functionName: "validateOAuthAuthorizeRequest_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "3159d595375b826eefa825c4544b69c4bfd27bc69bd36b05c30b5a809595876a": {
    functionName: "publishImportProfile_createServerFn_handler",
    importer: () => import("./import-screenshot.server-Ch1RtKHc.mjs")
  },
  "32425a5c968d0592c182959d85048eed9e3e9223581aee743a986a97cae431e6": {
    functionName: "treyIElevenLabsOnboardingSession_createServerFn_handler",
    importer: () => import("./elevenlabs-session.server-BZU8-mAU.mjs")
  },
  "38781efe225655552b421e825b71f0406713442aef6542b84eb03562c2b94db2": {
    functionName: "removeFwdGif_createServerFn_handler",
    importer: () => import("./fwd-gif-api.server-DgbUSYoP.mjs")
  },
  "44b7ca2ab9f6c0db3ecdd5c41d9577de228d125fbdbe6d300bb4eaa221bd60d2": {
    functionName: "treyICheckUsername_createServerFn_handler",
    importer: () => import("./onboarding.server-C2FgIOnP.mjs")
  },
  "4a4eba1ddc908c8b0d90e2cdb9733e3a40ba166d58868dc7ac094c4adfd33ba3": {
    functionName: "getDailyZodiacReading_createServerFn_handler",
    importer: () => import("./zodiac.server-CirmiC_B.mjs")
  },
  "4f8aba627b247a17f0161277dcbe6297bca258746df33920039b3efbda01f966": {
    functionName: "revokeConnectedApp_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "508930475d7de99c560021a0f87f1bee2f9ab4c0f14689329153505ea2576e35": {
    functionName: "endWatchParty_createServerFn_handler",
    importer: () => import("./party.server-Dm5uBmdX.mjs")
  },
  "515a67968b03b8f15f89ca070e32d586db154658ba442692129c5b8c642e43c8": {
    functionName: "listConnectedApps_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "54efd8c34512ab5d550c885c1d487179ec2953c31767915a3c6b956f7be02128": {
    functionName: "getFwdGifLibrary_createServerFn_handler",
    importer: () => import("./fwd-gif-api.server-DgbUSYoP.mjs")
  },
  "5e28f59458ac6712a2f5be2846fd68c5c14950d0bcea190f00ad578824d7d6db": {
    functionName: "changePartyChannel_createServerFn_handler",
    importer: () => import("./party.server-Dm5uBmdX.mjs")
  },
  "616699ed6892ddd3f1f73adca5ab09feae022407cd58be36c9e5746f2d15ddfd": {
    functionName: "startImportJob_createServerFn_handler",
    importer: () => import("./import-screenshot.server-Ch1RtKHc.mjs")
  },
  "6e0b427c068764957f473644cb3275e727da2c8b14da409f491c1f658e6a5f49": {
    functionName: "previewZodiacIdentity_createServerFn_handler",
    importer: () => import("./zodiac.server-CirmiC_B.mjs")
  },
  "80d3dacfe34600be625cfe556ae54069067d4aa3a6f0c2bf0a0ab328468705ac": {
    functionName: "markFwdGifUsed_createServerFn_handler",
    importer: () => import("./fwd-gif-api.server-DgbUSYoP.mjs")
  },
  "8c3c3cad9ad0fabc6045fd491b744fd2a03840891ddcbdae73994749203284aa": {
    functionName: "confirmZodiacIdentity_createServerFn_handler",
    importer: () => import("./zodiac.server-CirmiC_B.mjs")
  },
  "8e4d801f9b3e10ed1072006f13fab119f227bd6219edd9a9ce8e28a9e2f825d1": {
    functionName: "revokeApiKey_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "9622aea28e9112208b3685ae3b990230c14b9729f7d320441e916891037c4a87": {
    functionName: "getAdminPostQueue_createServerFn_handler",
    importer: () => import("./post-queue.server-9S5CFS20.mjs")
  },
  "9f00c8564e148c83c17a18b551a7e490f87de0ee8797abfaea71782551973e2a": {
    functionName: "extractScreenshot_createServerFn_handler",
    importer: () => import("./import-screenshot.server-Ch1RtKHc.mjs")
  },
  "a2871da9ab0f867f3b2063e9c94156fc8b10bf0bb78537c73e929cd1e5cdd2ba": {
    functionName: "createApiKey_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "a521bd0c0f9b13430bd87e32d02f2b3fa1fca84e9b3342ce415da37ebfecf808": {
    functionName: "treyITts_createServerFn_handler",
    importer: () => import("./tts.server-BsjOrSA1.mjs")
  },
  "a660a9c29f5e8bb4a89d30dac8d895f3d9f67f76b80cbe0b9488fe0d11596c43": {
    functionName: "saveFwdGif_createServerFn_handler",
    importer: () => import("./fwd-gif-api.server-DgbUSYoP.mjs")
  },
  "a8614b6b3521a713ff26ecf2c8fb931e8fbc75cd86c5b61f202b696062b0f8cb": {
    functionName: "hostAddMember_createServerFn_handler",
    importer: () => import("./party.server-Dm5uBmdX.mjs")
  },
  "ac12d50256cc12339275595886c33298dabab01860dcb25c8e45de4dcf88bf49": {
    functionName: "searchTmdbContent_createServerFn_handler",
    importer: () => import("./tmdb-scout.server-CJOwQXeJ.mjs")
  },
  "ad1bda8976de22f0ab9942c4b3e01863d0a7b6d223b682eaa4f514bc67151af3": {
    functionName: "finalizeOnboarding_createServerFn_handler",
    importer: () => import("./onboarding.server-C2FgIOnP.mjs")
  },
  "be466318f3125b2b277a7c76d42c8686888399849371b42c3fcd7c3a75497e14": {
    functionName: "postChatMessage_createServerFn_handler",
    importer: () => import("./party.server-Dm5uBmdX.mjs")
  },
  "c586ee5e863f87df437cff5077ef812e4211bcc7ce9841448565a58383c7d6e9": {
    functionName: "reviewAdminPostQueue_createServerFn_handler",
    importer: () => import("./post-queue.server-9S5CFS20.mjs")
  },
  "c85bf694fccd0a3e8a45a91529b7b3a160673fd31f95fb459cc095d4c2d5268d": {
    functionName: "setMemberFlag_createServerFn_handler",
    importer: () => import("./party.server-Dm5uBmdX.mjs")
  },
  "ce6e1ae3f8f6a403b0b9ec3ee718291529aa9c34ca8c3d7364e47f9e8f084405": {
    functionName: "revokeDeveloperApp_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "d51fe542052974c790acdd8555c752ea03188b7163304a8b5de332f1ae633013": {
    functionName: "getAdminPostQueueItem_createServerFn_handler",
    importer: () => import("./post-queue.server-9S5CFS20.mjs")
  },
  "dac76c0ff93707f6b85830d7d7232f7123e0a736bbe9feb64af062bccfb40e8a": {
    functionName: "rotateDeveloperSecret_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "dc9fdbe4622900b26d16a070da5d890bba29d2a01a406bb052087c871e4eaa97": {
    functionName: "treyIGenerate_createServerFn_handler",
    importer: () => import("./vertex.server-CccJYk3n.mjs")
  },
  "dd1287e471e65d20cbc5c4dc956ad27b11fa01674c048d20656dfe3221e0c3e9": {
    functionName: "treyIElevenLabsSession_createServerFn_handler",
    importer: () => import("./elevenlabs-session.server-BZU8-mAU.mjs")
  },
  "dd3c9541a8d81125574f1d4b830e129188bd2faf8b14db608176faabcbe86b31": {
    functionName: "captureFwdGif_createServerFn_handler",
    importer: () => import("./fwd-gif-api.server-DgbUSYoP.mjs")
  },
  "e6a5e262b25266990d1b2c2552e6673cb2fb4243392f5fa31d7e6763d93556aa": {
    functionName: "captureTmdbContent_createServerFn_handler",
    importer: () => import("./tmdb-scout.server-CJOwQXeJ.mjs")
  },
  "e6faa3368ecd54bb4167f72663dc2bfc157d118957498a35784db1e49a31c399": {
    functionName: "generateMusicReviewInsight_createServerFn_handler",
    importer: () => import("./vertex.server-CccJYk3n.mjs")
  },
  "ebecc3428588a244ac9f03595413ab71cd40a36c4eabb152d1e7c87db01eeb08": {
    functionName: "createDeveloperApp_createServerFn_handler",
    importer: () => import("./oauth.server-Dchjb0et.mjs")
  },
  "ee8b3768d932f58400099b58152e01782f4d4a5673faed875138eec78b1986b3": {
    functionName: "acceptPartyInvite_createServerFn_handler",
    importer: () => import("./party.server-Dm5uBmdX.mjs")
  },
  "fb0adceaa37358e61cbaee59ae5cad610e70c9f11a784fd1e737be5bce2e6436": {
    functionName: "saveOnboardingProfile_createServerFn_handler",
    importer: () => import("./onboarding.server-C2FgIOnP.mjs")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FrameType = {
  JSON: 0,
  CHUNK: 1,
  END: 2,
  ERROR: 3
};
var FRAME_HEADER_SIZE = 9;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_STORAGE_KEY]) globalObj$1[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj$1[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn2) {
  return startStorage.run(context, fn2);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
function splitSetCookieString(cookiesString) {
  if (Array.isArray(cookiesString)) return cookiesString.flatMap((c2) => splitSetCookieString(c2));
  if (typeof cookiesString !== "string") return [];
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) pos += 1;
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else pos = lastComma + 1;
      } else pos += 1;
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.slice(start));
  }
  return cookiesStrings;
}
function toHeadersInstance(init) {
  if (init instanceof Headers) return init;
  else if (Array.isArray(init)) return new Headers(init);
  else if (typeof init === "object") return new Headers(init);
  else return null;
}
function mergeHeaders(...headers) {
  return headers.reduce((acc, header) => {
    const headersInstance = toHeadersInstance(header);
    if (!headersInstance) return acc;
    for (const [key, value] of headersInstance.entries()) if (key === "set-cookie") splitSetCookieString(value).forEach((cookie) => acc.append("set-cookie", cookie));
    else acc.set(key, value);
    return acc;
  }, new Headers());
}
function sanitizePathSegment(segment) {
  return segment.replace(/[\x00-\x1f\x7f]/g, "");
}
function decodeSegment(segment) {
  let decoded;
  try {
    decoded = decodeURI(segment);
  } catch {
    decoded = segment.replaceAll(/%[0-9A-F]{2}/gi, (match) => {
      try {
        return decodeURI(match);
      } catch {
        return match;
      }
    });
  }
  return sanitizePathSegment(decoded);
}
function decodePath(path) {
  if (!path) return {
    path,
    handledProtocolRelativeURL: false
  };
  if (!/[%\\\x00-\x1f\x7f]/.test(path) && !path.startsWith("//")) return {
    path,
    handledProtocolRelativeURL: false
  };
  const re2 = /%25|%5C/gi;
  let cursor = 0;
  let result = "";
  let match;
  while (null !== (match = re2.exec(path))) {
    result += decodeSegment(path.slice(cursor, match.index)) + match[0];
    cursor = re2.lastIndex;
  }
  result = result + decodeSegment(cursor ? path.slice(cursor) : path);
  let handledProtocolRelativeURL = false;
  if (result.startsWith("//")) {
    handledProtocolRelativeURL = true;
    result = "/" + result.replace(/^\/+/, "");
  }
  return {
    path: result,
    handledProtocolRelativeURL
  };
}
function invariant() {
  throw new Error("Invariant failed");
}
function isNotFound(obj) {
  return obj?.isNotFound === true;
}
function dehydrateSsrMatchId(id) {
  return id.replaceAll("/", "\0");
}
function createLRUCache(max) {
  const cache = /* @__PURE__ */ new Map();
  let oldest;
  let newest;
  const touch = (entry) => {
    if (!entry.next) return;
    if (!entry.prev) {
      entry.next.prev = void 0;
      oldest = entry.next;
      entry.next = void 0;
      if (newest) {
        entry.prev = newest;
        newest.next = entry;
      }
    } else {
      entry.prev.next = entry.next;
      entry.next.prev = entry.prev;
      entry.next = void 0;
      if (newest) {
        newest.next = entry;
        entry.prev = newest;
      }
    }
    newest = entry;
  };
  return {
    get(key) {
      const entry = cache.get(key);
      if (!entry) return void 0;
      touch(entry);
      return entry.value;
    },
    set(key, value) {
      if (cache.size >= max && oldest) {
        const toDelete = oldest;
        cache.delete(toDelete.key);
        if (toDelete.next) {
          oldest = toDelete.next;
          toDelete.next.prev = void 0;
        }
        if (toDelete === newest) newest = void 0;
      }
      const existing = cache.get(key);
      if (existing) {
        existing.value = value;
        touch(existing);
      } else {
        const entry = {
          key,
          value,
          prev: newest
        };
        if (newest) newest.next = entry;
        newest = entry;
        if (!oldest) oldest = entry;
        cache.set(key, entry);
      }
    },
    clear() {
      cache.clear();
      oldest = void 0;
      newest = void 0;
    }
  };
}
const rootRouteId = "__root__";
function redirect(opts) {
  opts.statusCode = opts.statusCode || opts.code || 307;
  if (!opts._builtLocation && !opts.reloadDocument && typeof opts.href === "string") try {
    new URL(opts.href);
    opts.reloadDocument = true;
  } catch {
  }
  const headers = new Headers(opts.headers);
  if (opts.href && headers.get("Location") === null) headers.set("Location", opts.href);
  const response = new Response(null, {
    status: opts.statusCode,
    headers
  });
  response.options = opts;
  if (opts.throw) throw response;
  return response;
}
function isRedirect(obj) {
  return obj instanceof Response && !!obj.options;
}
function isResolvedRedirect(obj) {
  return isRedirect(obj) && !!obj.options.href;
}
function parseRedirect(obj) {
  if (obj !== null && typeof obj === "object" && obj.isSerializedRedirect) return redirect(obj);
}
function executeRewriteInput(rewrite, url) {
  const res = rewrite?.input?.({ url });
  if (res) {
    if (typeof res === "string") return new URL(res);
    else if (res instanceof URL) return res;
  }
  return url;
}
var stateIndexKey = "__TSR_index";
function createHistory(opts) {
  let location = opts.getLocation();
  const subscribers = /* @__PURE__ */ new Set();
  const notify = (action) => {
    location = opts.getLocation();
    subscribers.forEach((subscriber) => subscriber({
      location,
      action
    }));
  };
  const handleIndexChange = (action) => {
    if (opts.notifyOnIndexChange ?? true) notify(action);
    else location = opts.getLocation();
  };
  const tryNavigation = async ({ task, navigateOpts, ...actionInfo }) => {
    if (navigateOpts?.ignoreBlocker ?? false) {
      task();
      return;
    }
    const blockers = opts.getBlockers?.() ?? [];
    const isPushOrReplace = actionInfo.type === "PUSH" || actionInfo.type === "REPLACE";
    if (typeof document !== "undefined" && blockers.length && isPushOrReplace) for (const blocker of blockers) {
      const nextLocation = parseHref(actionInfo.path, actionInfo.state);
      if (await blocker.blockerFn({
        currentLocation: location,
        nextLocation,
        action: actionInfo.type
      })) {
        opts.onBlocked?.();
        return;
      }
    }
    task();
  };
  return {
    get location() {
      return location;
    },
    get length() {
      return opts.getLength();
    },
    subscribers,
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    push: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex + 1, state);
      tryNavigation({
        task: () => {
          opts.pushState(path, state);
          notify({ type: "PUSH" });
        },
        navigateOpts,
        type: "PUSH",
        path,
        state
      });
    },
    replace: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex, state);
      tryNavigation({
        task: () => {
          opts.replaceState(path, state);
          notify({ type: "REPLACE" });
        },
        navigateOpts,
        type: "REPLACE",
        path,
        state
      });
    },
    go: (index2, navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.go(index2);
          handleIndexChange({
            type: "GO",
            index: index2
          });
        },
        navigateOpts,
        type: "GO"
      });
    },
    back: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.back(navigateOpts?.ignoreBlocker ?? false);
          handleIndexChange({ type: "BACK" });
        },
        navigateOpts,
        type: "BACK"
      });
    },
    forward: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.forward(navigateOpts?.ignoreBlocker ?? false);
          handleIndexChange({ type: "FORWARD" });
        },
        navigateOpts,
        type: "FORWARD"
      });
    },
    canGoBack: () => location.state[stateIndexKey] !== 0,
    createHref: (str) => opts.createHref(str),
    block: (blocker) => {
      if (!opts.setBlockers) return () => {
      };
      const blockers = opts.getBlockers?.() ?? [];
      opts.setBlockers([...blockers, blocker]);
      return () => {
        const blockers2 = opts.getBlockers?.() ?? [];
        opts.setBlockers?.(blockers2.filter((b2) => b2 !== blocker));
      };
    },
    flush: () => opts.flush?.(),
    destroy: () => opts.destroy?.(),
    notify
  };
}
function assignKeyAndIndex(index2, state) {
  if (!state) state = {};
  const key = createRandomKey();
  return {
    ...state,
    key,
    __TSR_key: key,
    [stateIndexKey]: index2
  };
}
function createMemoryHistory(opts = { initialEntries: ["/"] }) {
  const entries = opts.initialEntries;
  let index2 = opts.initialIndex ? Math.min(Math.max(opts.initialIndex, 0), entries.length - 1) : entries.length - 1;
  const states = entries.map((_entry, index22) => assignKeyAndIndex(index22, void 0));
  const getLocation = () => parseHref(entries[index2], states[index2]);
  let blockers = [];
  const _getBlockers = () => blockers;
  const _setBlockers = (newBlockers) => blockers = newBlockers;
  return createHistory({
    getLocation,
    getLength: () => entries.length,
    pushState: (path, state) => {
      if (index2 < entries.length - 1) {
        entries.splice(index2 + 1);
        states.splice(index2 + 1);
      }
      states.push(state);
      entries.push(path);
      index2 = Math.max(entries.length - 1, 0);
    },
    replaceState: (path, state) => {
      states[index2] = state;
      entries[index2] = path;
    },
    back: () => {
      index2 = Math.max(index2 - 1, 0);
    },
    forward: () => {
      index2 = Math.min(index2 + 1, entries.length - 1);
    },
    go: (n2) => {
      index2 = Math.min(Math.max(index2 + n2, 0), entries.length - 1);
    },
    createHref: (path) => path,
    getBlockers: _getBlockers,
    setBlockers: _setBlockers
  });
}
function sanitizePath(path) {
  let sanitized = path.replace(/[\x00-\x1f\x7f]/g, "");
  if (sanitized.startsWith("//")) sanitized = "/" + sanitized.replace(/^\/+/, "");
  return sanitized;
}
function parseHref(href, state) {
  const sanitizedHref = sanitizePath(href);
  const hashIndex = sanitizedHref.indexOf("#");
  const searchIndex = sanitizedHref.indexOf("?");
  const addedKey = createRandomKey();
  return {
    href: sanitizedHref,
    pathname: sanitizedHref.substring(0, hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : sanitizedHref.length),
    hash: hashIndex > -1 ? sanitizedHref.substring(hashIndex) : "",
    search: searchIndex > -1 ? sanitizedHref.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
    state: state || {
      [stateIndexKey]: 0,
      key: addedKey,
      __TSR_key: addedKey
    }
  };
}
function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7);
}
function resolveManifestAssetLink(link) {
  if (typeof link === "string") return {
    href: link,
    crossOrigin: void 0
  };
  return link;
}
function getStylesheetHref(asset) {
  if (asset.tag !== "link") return void 0;
  const rel = asset.attrs?.rel;
  const href = asset.attrs?.href;
  if (typeof href !== "string") return void 0;
  if (!(typeof rel === "string" ? rel.split(/\s+/) : []).includes("stylesheet")) return void 0;
  return href;
}
function isInlinableStylesheet(manifest2, asset) {
  const href = getStylesheetHref(asset);
  return !!href && manifest2?.inlineCss?.styles[href] !== void 0;
}
function createInlineCssStyleAsset(css) {
  return {
    tag: "style",
    attrs: { suppressHydrationWarning: true },
    inlineCss: true,
    children: css
  };
}
function createInlineCssPlaceholderAsset() {
  return {
    tag: "style",
    attrs: { suppressHydrationWarning: true },
    inlineCss: true
  };
}
const GLOBAL_TSR = "$_TSR";
const TSR_SCRIPT_BARRIER_ID = "$tsr-stream-barrier";
var M = ((i) => (i[i.AggregateError = 1] = "AggregateError", i[i.ArrowFunction = 2] = "ArrowFunction", i[i.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", i[i.ObjectAssign = 8] = "ObjectAssign", i[i.BigIntTypedArray = 16] = "BigIntTypedArray", i[i.RegExp = 32] = "RegExp", i))(M || {});
var v = Symbol.asyncIterator, pr = Symbol.hasInstance, R = Symbol.isConcatSpreadable, C = Symbol.iterator, dr = Symbol.match, gr = Symbol.matchAll, yr = Symbol.replace, Nr = Symbol.search, br = Symbol.species, vr = Symbol.split, Cr = Symbol.toPrimitive, P$1 = Symbol.toStringTag, Ar = Symbol.unscopables;
var tt = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" }, ve = { [v]: 0, [pr]: 1, [R]: 2, [C]: 3, [dr]: 4, [gr]: 5, [yr]: 6, [Nr]: 7, [br]: 8, [vr]: 9, [Cr]: 10, [P$1]: 11, [Ar]: 12 }, nt = { 0: v, 1: pr, 2: R, 3: C, 4: dr, 5: gr, 6: yr, 7: Nr, 8: br, 9: vr, 10: Cr, 11: P$1, 12: Ar }, ot = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" }, o = void 0, at$1 = { 2: true, 3: false, 1: o, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN };
var Ce = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" }, st = { 0: Error, 1: EvalError, 2: RangeError, 3: ReferenceError, 4: SyntaxError, 5: TypeError, 6: URIError };
function c(e, r, t, n2, a, s, i, u, l, g, S, d) {
  return { t: e, i: r, s: t, c: n2, m: a, p: s, e: i, a: u, f: l, b: g, o: S, l: d };
}
function B(e) {
  return c(2, o, e, o, o, o, o, o, o, o, o, o);
}
var H = B(2), J = B(3), Ae = B(1), Ee = B(0), it = B(4), ut = B(5), lt = B(6), ct = B(7);
function mn(e) {
  switch (e) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case `
`:
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return o;
  }
}
function y(e) {
  let r = "", t = 0, n2;
  for (let a = 0, s = e.length; a < s; a++) n2 = mn(e[a]), n2 && (r += e.slice(t, a) + n2, t = a + 1);
  return t === 0 ? r = e : r += e.slice(t), r;
}
function pn(e) {
  switch (e) {
    case "\\\\":
      return "\\";
    case '\\"':
      return '"';
    case "\\n":
      return `
`;
    case "\\r":
      return "\r";
    case "\\b":
      return "\b";
    case "\\t":
      return "	";
    case "\\f":
      return "\f";
    case "\\x3C":
      return "<";
    case "\\u2028":
      return "\u2028";
    case "\\u2029":
      return "\u2029";
    default:
      return e;
  }
}
function D(e) {
  return e.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, pn);
}
var L = "__SEROVAL_REFS__", le = "$R", Ie = `self.${le}`;
function dn(e) {
  return `(${Ie}=${Ie}||{})["${y(e)}"]=[]`;
}
var Er = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Map();
function Ir(e) {
  return Er.has(e);
}
function yn(e) {
  return U.has(e);
}
function ft(e) {
  if (Ir(e)) return Er.get(e);
  throw new Re(e);
}
function St(e) {
  if (yn(e)) return U.get(e);
  throw new Pe(e);
}
typeof globalThis != "undefined" ? Object.defineProperty(globalThis, L, { value: U, configurable: true, writable: false, enumerable: false }) : typeof window != "undefined" ? Object.defineProperty(window, L, { value: U, configurable: true, writable: false, enumerable: false }) : typeof self != "undefined" ? Object.defineProperty(self, L, { value: U, configurable: true, writable: false, enumerable: false }) : typeof global != "undefined" && Object.defineProperty(global, L, { value: U, configurable: true, writable: false, enumerable: false });
function xe(e) {
  return e instanceof EvalError ? 1 : e instanceof RangeError ? 2 : e instanceof ReferenceError ? 3 : e instanceof SyntaxError ? 4 : e instanceof TypeError ? 5 : e instanceof URIError ? 6 : 0;
}
function Nn(e) {
  let r = Ce[xe(e)];
  return e.name !== r ? { name: e.name } : e.constructor.name !== r ? { name: e.constructor.name } : {};
}
function Z(e, r) {
  let t = Nn(e), n2 = Object.getOwnPropertyNames(e);
  for (let a = 0, s = n2.length, i; a < s; a++) i = n2[a], i !== "name" && i !== "message" && (i === "stack" ? r & 4 && (t = t || {}, t[i] = e[i]) : (t = t || {}, t[i] = e[i]));
  return t;
}
function Te(e) {
  return Object.isFrozen(e) ? 3 : Object.isSealed(e) ? 2 : Object.isExtensible(e) ? 0 : 1;
}
function Oe(e) {
  switch (e) {
    case Number.POSITIVE_INFINITY:
      return ut;
    case Number.NEGATIVE_INFINITY:
      return lt;
  }
  return e !== e ? ct : Object.is(e, -0) ? it : c(0, o, e, o, o, o, o, o, o, o, o, o);
}
function $(e) {
  return c(1, o, y(e), o, o, o, o, o, o, o, o, o);
}
function we(e) {
  return c(3, o, "" + e, o, o, o, o, o, o, o, o, o);
}
function pt(e) {
  return c(4, e, o, o, o, o, o, o, o, o, o, o);
}
function he(e, r) {
  let t = r.valueOf();
  return c(5, e, t !== t ? "" : r.toISOString(), o, o, o, o, o, o, o, o, o);
}
function ze(e, r) {
  return c(6, e, o, y(r.source), r.flags, o, o, o, o, o, o, o);
}
function dt(e, r) {
  return c(17, e, ve[r], o, o, o, o, o, o, o, o, o);
}
function gt(e, r) {
  return c(18, e, y(ft(r)), o, o, o, o, o, o, o, o, o);
}
function ce(e, r, t) {
  return c(25, e, t, y(r), o, o, o, o, o, o, o, o);
}
function _e(e, r, t) {
  return c(9, e, o, o, o, o, o, t, o, o, Te(r), o);
}
function ke(e, r) {
  return c(21, e, o, o, o, o, o, o, r, o, o, o);
}
function De(e, r, t) {
  return c(15, e, o, r.constructor.name, o, o, o, o, t, r.byteOffset, o, r.length);
}
function Fe(e, r, t) {
  return c(16, e, o, r.constructor.name, o, o, o, o, t, r.byteOffset, o, r.byteLength);
}
function Be(e, r, t) {
  return c(20, e, o, o, o, o, o, o, t, r.byteOffset, o, r.byteLength);
}
function Ve(e, r, t) {
  return c(13, e, xe(r), o, y(r.message), t, o, o, o, o, o, o);
}
function Me(e, r, t) {
  return c(14, e, xe(r), o, y(r.message), t, o, o, o, o, o, o);
}
function Le(e, r) {
  return c(7, e, o, o, o, o, o, r, o, o, o, o);
}
function Ue(e, r) {
  return c(28, o, o, o, o, o, o, [e, r], o, o, o, o);
}
function je(e, r) {
  return c(30, o, o, o, o, o, o, [e, r], o, o, o, o);
}
function Ye(e, r, t) {
  return c(31, e, o, o, o, o, o, t, r, o, o, o);
}
function qe(e, r) {
  return c(32, e, o, o, o, o, o, o, r, o, o, o);
}
function We(e, r) {
  return c(33, e, o, o, o, o, o, o, r, o, o, o);
}
function Ge(e, r) {
  return c(34, e, o, o, o, o, o, o, r, o, o, o);
}
function Ke(e, r, t, n2) {
  return c(35, e, t, o, o, o, o, r, o, o, o, n2);
}
var bn = { parsing: 1, serialization: 2, deserialization: 3 };
function vn(e) {
  return `Seroval Error (step: ${bn[e]})`;
}
var Cn = (e, r) => vn(e), fe = class extends Error {
  constructor(t, n2) {
    super(Cn(t));
    this.cause = n2;
  }
}, z = class extends fe {
  constructor(r) {
    super("parsing", r);
  }
}, He = class extends fe {
  constructor(r) {
    super("deserialization", r);
  }
};
function _(e) {
  return `Seroval Error (specific: ${e})`;
}
var x$1 = class x extends Error {
  constructor(t) {
    super(_(1));
    this.value = t;
  }
}, h = class extends Error {
  constructor(r) {
    super(_(2));
  }
}, X = class extends Error {
  constructor(r) {
    super(_(3));
  }
}, V = class extends Error {
  constructor(r) {
    super(_(4));
  }
}, Re = class extends Error {
  constructor(t) {
    super(_(5));
    this.value = t;
  }
}, Pe = class extends Error {
  constructor(r) {
    super(_(6));
  }
}, Je = class extends Error {
  constructor(r) {
    super(_(7));
  }
}, O = class extends Error {
  constructor(r) {
    super(_(8));
  }
}, Q = class extends Error {
  constructor(r) {
    super(_(9));
  }
};
var j = class {
  constructor(r, t) {
    this.value = r;
    this.replacement = t;
  }
};
var ee$1 = () => {
  let e = { p: 0, s: 0, f: 0 };
  return e.p = new Promise((r, t) => {
    e.s = r, e.f = t;
  }), e;
}, An = (e, r) => {
  e.s(r), e.p.s = 1, e.p.v = r;
}, En = (e, r) => {
  e.f(r), e.p.s = 2, e.p.v = r;
}, Nt = ee$1.toString(), bt = An.toString(), vt = En.toString(), Pr = () => {
  let e = [], r = [], t = true, n2 = false, a = 0, s = (l, g, S) => {
    for (S = 0; S < a; S++) r[S] && r[S][g](l);
  }, i = (l, g, S, d) => {
    for (g = 0, S = e.length; g < S; g++) d = e[g], !t && g === S - 1 ? l[n2 ? "return" : "throw"](d) : l.next(d);
  }, u = (l, g) => (t && (g = a++, r[g] = l), i(l), () => {
    t && (r[g] = r[a], r[a--] = void 0);
  });
  return { __SEROVAL_STREAM__: true, on: (l) => u(l), next: (l) => {
    t && (e.push(l), s(l, "next"));
  }, throw: (l) => {
    t && (e.push(l), s(l, "throw"), t = false, n2 = false, r.length = 0);
  }, return: (l) => {
    t && (e.push(l), s(l, "return"), t = false, n2 = true, r.length = 0);
  } };
}, Ct = Pr.toString(), xr = (e) => (r) => () => {
  let t = 0, n2 = { [e]: () => n2, next: () => {
    if (t > r.d) return { done: true, value: void 0 };
    let a = t++, s = r.v[a];
    if (a === r.t) throw s;
    return { done: a === r.d, value: s };
  } };
  return n2;
}, At = xr.toString(), Tr = (e, r) => (t) => () => {
  let n2 = 0, a = -1, s = false, i = [], u = [], l = (S = 0, d = u.length) => {
    for (; S < d; S++) u[S].s({ done: true, value: void 0 });
  };
  t.on({ next: (S) => {
    let d = u.shift();
    d && d.s({ done: false, value: S }), i.push(S);
  }, throw: (S) => {
    let d = u.shift();
    d && d.f(S), l(), a = i.length, s = true, i.push(S);
  }, return: (S) => {
    let d = u.shift();
    d && d.s({ done: true, value: S }), l(), a = i.length, i.push(S);
  } });
  let g = { [e]: () => g, next: () => {
    if (a === -1) {
      let G = n2++;
      if (G >= i.length) {
        let rt = r();
        return u.push(rt), rt.p;
      }
      return { done: false, value: i[G] };
    }
    if (n2 > a) return { done: true, value: void 0 };
    let S = n2++, d = i[S];
    if (S !== a) return { done: false, value: d };
    if (s) throw d;
    return { done: true, value: d };
  } };
  return g;
}, Et = Tr.toString(), Or = (e) => {
  let r = atob(e), t = r.length, n2 = new Uint8Array(t);
  for (let a = 0; a < t; a++) n2[a] = r.charCodeAt(a);
  return n2.buffer;
}, It = Or.toString();
function Ze(e) {
  return "__SEROVAL_SEQUENCE__" in e;
}
function wr(e, r, t) {
  return { __SEROVAL_SEQUENCE__: true, v: e, t: r, d: t };
}
function $e(e) {
  let r = [], t = -1, n2 = -1, a = e[C]();
  for (; ; ) try {
    let s = a.next();
    if (r.push(s.value), s.done) {
      n2 = r.length - 1;
      break;
    }
  } catch (s) {
    t = r.length, r.push(s);
  }
  return wr(r, t, n2);
}
var In = xr(C);
function Rt(e) {
  return In(e);
}
var Pt = {}, xt = {};
var Tt = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }, Ot = { 0: "[]", 1: Nt, 2: bt, 3: vt, 4: Ct, 5: It };
function Xe(e) {
  return "__SEROVAL_STREAM__" in e;
}
function re() {
  return Pr();
}
function Qe(e) {
  let r = re(), t = e[v]();
  async function n2() {
    try {
      let a = await t.next();
      a.done ? r.return(a.value) : (r.next(a.value), await n2());
    } catch (a) {
      r.throw(a);
    }
  }
  return n2().catch(() => {
  }), r;
}
var Rn = Tr(v, ee$1);
function wt(e) {
  return Rn(e);
}
async function hr(e) {
  try {
    return [1, await e];
  } catch (r) {
    return [0, r];
  }
}
function me(e, r) {
  return { plugins: r.plugins, mode: e, marked: /* @__PURE__ */ new Set(), features: 63 ^ (r.disabledFeatures || 0), refs: r.refs || /* @__PURE__ */ new Map(), depthLimit: r.depthLimit || 1e3 };
}
function pe(e, r) {
  e.marked.add(r);
}
function zr(e, r) {
  let t = e.refs.size;
  return e.refs.set(r, t), t;
}
function er(e, r) {
  let t = e.refs.get(r);
  return t != null ? (pe(e, t), { type: 1, value: pt(t) }) : { type: 0, value: zr(e, r) };
}
function Y(e, r) {
  let t = er(e, r);
  return t.type === 1 ? t : Ir(r) ? { type: 2, value: gt(t.value, r) } : t;
}
function I(e, r) {
  let t = Y(e, r);
  if (t.type !== 0) return t.value;
  if (r in ve) return dt(t.value, r);
  throw new x$1(r);
}
function k(e, r) {
  let t = er(e, Tt[r]);
  return t.type === 1 ? t.value : c(26, t.value, r, o, o, o, o, o, o, o, o, o);
}
function rr(e) {
  let r = er(e, Pt);
  return r.type === 1 ? r.value : c(27, r.value, o, o, o, o, o, o, I(e, C), o, o, o);
}
function tr(e) {
  let r = er(e, xt);
  return r.type === 1 ? r.value : c(29, r.value, o, o, o, o, o, [k(e, 1), I(e, v)], o, o, o, o);
}
function nr(e, r, t, n2) {
  return c(t ? 11 : 10, e, o, o, o, n2, o, o, o, o, Te(r), o);
}
function or(e, r, t, n2) {
  return c(8, r, o, o, o, o, { k: t, v: n2 }, o, k(e, 0), o, o, o);
}
function zt(e, r, t) {
  return c(22, r, t, o, o, o, o, o, k(e, 1), o, o, o);
}
function ar(e, r, t) {
  let n2 = new Uint8Array(t), a = "";
  for (let s = 0, i = n2.length; s < i; s++) a += String.fromCharCode(n2[s]);
  return c(19, r, y(btoa(a)), o, o, o, o, o, k(e, 5), o, o, o);
}
function te(e, r) {
  return { base: me(e, r), child: void 0 };
}
var kr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return N(this._p, this.depth, r);
  }
};
async function xn(e, r, t) {
  let n2 = [];
  for (let a = 0, s = t.length; a < s; a++) a in t ? n2[a] = await N(e, r, t[a]) : n2[a] = 0;
  return n2;
}
async function Tn(e, r, t, n2) {
  return _e(t, n2, await xn(e, r, n2));
}
async function Dr(e, r, t) {
  let n2 = Object.entries(t), a = [], s = [];
  for (let i = 0, u = n2.length; i < u; i++) a.push(y(n2[i][0])), s.push(await N(e, r, n2[i][1]));
  return C in t && (a.push(I(e.base, C)), s.push(Ue(rr(e.base), await N(e, r, $e(t))))), v in t && (a.push(I(e.base, v)), s.push(je(tr(e.base), await N(e, r, Qe(t))))), P$1 in t && (a.push(I(e.base, P$1)), s.push($(t[P$1]))), R in t && (a.push(I(e.base, R)), s.push(t[R] ? H : J)), { k: a, v: s };
}
async function _r(e, r, t, n2, a) {
  return nr(t, n2, a, await Dr(e, r, n2));
}
async function On(e, r, t, n2) {
  return ke(t, await N(e, r, n2.valueOf()));
}
async function wn(e, r, t, n2) {
  return De(t, n2, await N(e, r, n2.buffer));
}
async function hn(e, r, t, n2) {
  return Fe(t, n2, await N(e, r, n2.buffer));
}
async function zn(e, r, t, n2) {
  return Be(t, n2, await N(e, r, n2.buffer));
}
async function _t(e, r, t, n2) {
  let a = Z(n2, e.base.features);
  return Ve(t, n2, a ? await Dr(e, r, a) : o);
}
async function _n(e, r, t, n2) {
  let a = Z(n2, e.base.features);
  return Me(t, n2, a ? await Dr(e, r, a) : o);
}
async function kn(e, r, t, n2) {
  let a = [], s = [];
  for (let [i, u] of n2.entries()) a.push(await N(e, r, i)), s.push(await N(e, r, u));
  return or(e.base, t, a, s);
}
async function Dn(e, r, t, n2) {
  let a = [];
  for (let s of n2.keys()) a.push(await N(e, r, s));
  return Le(t, a);
}
async function kt(e, r, t, n2) {
  let a = e.base.plugins;
  if (a) for (let s = 0, i = a.length; s < i; s++) {
    let u = a[s];
    if (u.parse.async && u.test(n2)) return ce(t, u.tag, await u.parse.async(n2, new kr(e, r), { id: t }));
  }
  return o;
}
async function Fn(e, r, t, n2) {
  let [a, s] = await hr(n2);
  return c(12, t, a, o, o, o, o, o, await N(e, r, s), o, o, o);
}
function Bn(e, r, t, n2, a) {
  let s = [], i = t.on({ next: (u) => {
    pe(this.base, r), N(this, e, u).then((l) => {
      s.push(qe(r, l));
    }, (l) => {
      a(l), i();
    });
  }, throw: (u) => {
    pe(this.base, r), N(this, e, u).then((l) => {
      s.push(We(r, l)), n2(s), i();
    }, (l) => {
      a(l), i();
    });
  }, return: (u) => {
    pe(this.base, r), N(this, e, u).then((l) => {
      s.push(Ge(r, l)), n2(s), i();
    }, (l) => {
      a(l), i();
    });
  } });
}
async function Vn(e, r, t, n2) {
  return Ye(t, k(e.base, 4), await new Promise(Bn.bind(e, r, t, n2)));
}
async function Mn(e, r, t, n2) {
  let a = [];
  for (let s = 0, i = n2.v.length; s < i; s++) a[s] = await N(e, r, n2.v[s]);
  return Ke(t, a, n2.t, n2.d);
}
async function Ln(e, r, t, n2) {
  if (Array.isArray(n2)) return Tn(e, r, t, n2);
  if (Xe(n2)) return Vn(e, r, t, n2);
  if (Ze(n2)) return Mn(e, r, t, n2);
  let a = n2.constructor;
  if (a === j) return N(e, r, n2.replacement);
  let s = await kt(e, r, t, n2);
  if (s) return s;
  switch (a) {
    case Object:
      return _r(e, r, t, n2, false);
    case o:
      return _r(e, r, t, n2, true);
    case Date:
      return he(t, n2);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return _t(e, r, t, n2);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return On(e, r, t, n2);
    case ArrayBuffer:
      return ar(e.base, t, n2);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return wn(e, r, t, n2);
    case DataView:
      return zn(e, r, t, n2);
    case Map:
      return kn(e, r, t, n2);
    case Set:
      return Dn(e, r, t, n2);
  }
  if (a === Promise || n2 instanceof Promise) return Fn(e, r, t, n2);
  let i = e.base.features;
  if (i & 32 && a === RegExp) return ze(t, n2);
  if (i & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return hn(e, r, t, n2);
  }
  if (i & 1 && typeof AggregateError != "undefined" && (a === AggregateError || n2 instanceof AggregateError)) return _n(e, r, t, n2);
  if (n2 instanceof Error) return _t(e, r, t, n2);
  if (C in n2 || v in n2) return _r(e, r, t, n2, !!a);
  throw new x$1(n2);
}
async function Un(e, r, t) {
  let n2 = Y(e.base, t);
  if (n2.type !== 0) return n2.value;
  let a = await kt(e, r, n2.value, t);
  if (a) return a;
  throw new x$1(t);
}
async function N(e, r, t) {
  switch (typeof t) {
    case "boolean":
      return t ? H : J;
    case "undefined":
      return Ae;
    case "string":
      return $(t);
    case "number":
      return Oe(t);
    case "bigint":
      return we(t);
    case "object": {
      if (t) {
        let n2 = Y(e.base, t);
        return n2.type === 0 ? await Ln(e, r + 1, n2.value, t) : n2.value;
      }
      return Ee;
    }
    case "symbol":
      return I(e.base, t);
    case "function":
      return Un(e, r, t);
    default:
      throw new x$1(t);
  }
}
async function ne(e, r) {
  try {
    return await N(e, 0, r);
  } catch (t) {
    throw t instanceof z ? t : new z(t);
  }
}
var oe = ((t) => (t[t.Vanilla = 1] = "Vanilla", t[t.Cross = 2] = "Cross", t))(oe || {});
function ai(e) {
  return e;
}
function Dt(e, r) {
  for (let t = 0, n2 = r.length; t < n2; t++) {
    let a = r[t];
    e.has(a) || (e.add(a), a.extends && Dt(e, a.extends));
  }
}
function A(e) {
  if (e) {
    let r = /* @__PURE__ */ new Set();
    return Dt(r, e), [...r];
  }
}
function Ft(e) {
  switch (e) {
    case "Int8Array":
      return Int8Array;
    case "Int16Array":
      return Int16Array;
    case "Int32Array":
      return Int32Array;
    case "Uint8Array":
      return Uint8Array;
    case "Uint16Array":
      return Uint16Array;
    case "Uint32Array":
      return Uint32Array;
    case "Uint8ClampedArray":
      return Uint8ClampedArray;
    case "Float32Array":
      return Float32Array;
    case "Float64Array":
      return Float64Array;
    case "BigInt64Array":
      return BigInt64Array;
    case "BigUint64Array":
      return BigUint64Array;
    default:
      throw new Je(e);
  }
}
var jn = 1e6, Yn = 1e4, qn = 2e4;
function Vt(e, r) {
  switch (r) {
    case 3:
      return Object.freeze(e);
    case 1:
      return Object.preventExtensions(e);
    case 2:
      return Object.seal(e);
    default:
      return e;
  }
}
var Wn = 1e3;
function Mt(e, r) {
  var n2;
  let t = r.refs || /* @__PURE__ */ new Map();
  return "types" in t || Object.assign(t, { types: /* @__PURE__ */ new Map() }), { mode: e, plugins: r.plugins, refs: t, features: (n2 = r.features) != null ? n2 : 63 ^ (r.disabledFeatures || 0), depthLimit: r.depthLimit || Wn };
}
function Lt(e) {
  return { mode: 1, base: Mt(1, e), child: o, state: { marked: new Set(e.markedRefs) } };
}
var Fr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  deserialize(r) {
    return p$1(this._p, this.depth, r);
  }
};
function jt(e, r) {
  if (r < 0 || !Number.isFinite(r) || !Number.isInteger(r)) throw new O({ t: 4, i: r });
  if (e.refs.has(r)) throw new Error("Conflicted ref id: " + r);
}
function Gn(e, r, t) {
  return jt(e.base, r), e.state.marked.has(r) && e.base.refs.set(r, t), t;
}
function Kn(e, r, t) {
  return jt(e.base, r), e.base.refs.set(r, t), t;
}
function b(e, r, t) {
  return e.mode === 1 ? Gn(e, r, t) : Kn(e, r, t);
}
function Br(e, r, t) {
  if (Object.hasOwn(r, t)) return r[t];
  throw new O(e);
}
function Hn(e, r) {
  return b(e, r.i, St(D(r.s)));
}
function Jn(e, r, t) {
  let n2 = t.a, a = n2.length, s = b(e, t.i, new Array(a));
  for (let i = 0, u; i < a; i++) u = n2[i], u && (s[i] = p$1(e, r, u));
  return Vt(s, t.o), s;
}
function Zn(e) {
  switch (e) {
    case "constructor":
    case "__proto__":
    case "prototype":
    case "__defineGetter__":
    case "__defineSetter__":
    case "__lookupGetter__":
    case "__lookupSetter__":
      return false;
    default:
      return true;
  }
}
function $n(e) {
  switch (e) {
    case v:
    case R:
    case P$1:
    case C:
      return true;
    default:
      return false;
  }
}
function Bt(e, r, t) {
  Zn(r) ? e[r] = t : Object.defineProperty(e, r, { value: t, configurable: true, enumerable: true, writable: true });
}
function Xn(e, r, t, n2, a) {
  if (typeof n2 == "string") Bt(t, D(n2), p$1(e, r, a));
  else {
    let s = p$1(e, r, n2);
    switch (typeof s) {
      case "string":
        Bt(t, s, p$1(e, r, a));
        break;
      case "symbol":
        $n(s) && (t[s] = p$1(e, r, a));
        break;
      default:
        throw new O(n2);
    }
  }
}
function Yt(e, r, t) {
  e.base.refs.types.set(r, t);
}
function de(e, r, t, n2) {
  if (e.base.refs.types.get(t) !== n2) throw new O(r);
}
function qt(e, r, t, n2) {
  let a = t.k;
  if (a.length > 0) for (let i = 0, u = t.v, l = a.length; i < l; i++) Xn(e, r, n2, a[i], u[i]);
  return n2;
}
function Qn(e, r, t) {
  let n2 = b(e, t.i, t.t === 10 ? {} : /* @__PURE__ */ Object.create(null));
  return qt(e, r, t.p, n2), Vt(n2, t.o), n2;
}
function eo(e, r) {
  return b(e, r.i, new Date(r.s));
}
function ro(e, r) {
  if (e.base.features & 32) {
    let t = D(r.c);
    if (t.length > qn) throw new O(r);
    return b(e, r.i, new RegExp(t, r.m));
  }
  throw new h(r);
}
function to(e, r, t) {
  let n2 = b(e, t.i, /* @__PURE__ */ new Set());
  for (let a = 0, s = t.a, i = s.length; a < i; a++) n2.add(p$1(e, r, s[a]));
  return n2;
}
function no(e, r, t) {
  let n2 = b(e, t.i, /* @__PURE__ */ new Map());
  for (let a = 0, s = t.e.k, i = t.e.v, u = s.length; a < u; a++) n2.set(p$1(e, r, s[a]), p$1(e, r, i[a]));
  return n2;
}
function oo(e, r) {
  if (r.s.length > jn) throw new O(r);
  return b(e, r.i, Or(D(r.s)));
}
function ao(e, r, t) {
  var u;
  let n2 = Ft(t.c), a = p$1(e, r, t.f), s = (u = t.b) != null ? u : 0;
  if (s < 0 || s > a.byteLength) throw new O(t);
  return b(e, t.i, new n2(a, s, t.l));
}
function so(e, r, t) {
  var i;
  let n2 = p$1(e, r, t.f), a = (i = t.b) != null ? i : 0;
  if (a < 0 || a > n2.byteLength) throw new O(t);
  return b(e, t.i, new DataView(n2, a, t.l));
}
function Wt(e, r, t, n2) {
  if (t.p) {
    let a = qt(e, r, t.p, {});
    Object.defineProperties(n2, Object.getOwnPropertyDescriptors(a));
  }
  return n2;
}
function io(e, r, t) {
  let n2 = b(e, t.i, new AggregateError([], D(t.m)));
  return Wt(e, r, t, n2);
}
function uo(e, r, t) {
  let n2 = Br(t, st, t.s), a = b(e, t.i, new n2(D(t.m)));
  return Wt(e, r, t, a);
}
function lo(e, r, t) {
  let n2 = ee$1(), a = b(e, t.i, n2.p), s = p$1(e, r, t.f);
  return t.s ? n2.s(s) : n2.f(s), a;
}
function co(e, r, t) {
  return b(e, t.i, Object(p$1(e, r, t.f)));
}
function fo(e, r, t) {
  let n2 = e.base.plugins;
  if (n2) {
    let a = D(t.c);
    for (let s = 0, i = n2.length; s < i; s++) {
      let u = n2[s];
      if (u.tag === a) return b(e, t.i, u.deserialize(t.s, new Fr(e, r), { id: t.i }));
    }
  }
  throw new X(t.c);
}
function So(e, r) {
  let t = b(e, r.i, b(e, r.s, ee$1()).p);
  return Yt(e, r.s, 22), t;
}
function mo(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 22), n2.s(p$1(e, r, t.a[1])), o;
  throw new V("Promise");
}
function po(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 22), n2.f(p$1(e, r, t.a[1])), o;
  throw new V("Promise");
}
function go(e, r, t) {
  p$1(e, r, t.a[0]);
  let n2 = p$1(e, r, t.a[1]);
  return Rt(n2);
}
function yo(e, r, t) {
  p$1(e, r, t.a[0]);
  let n2 = p$1(e, r, t.a[1]);
  return wt(n2);
}
function No(e, r, t) {
  let n2 = b(e, t.i, re());
  Yt(e, t.i, 31);
  let a = t.a, s = a.length;
  if (s) for (let i = 0; i < s; i++) p$1(e, r, a[i]);
  return n2;
}
function bo(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 31), n2.next(p$1(e, r, t.f)), o;
  throw new V("Stream");
}
function vo(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 31), n2.throw(p$1(e, r, t.f)), o;
  throw new V("Stream");
}
function Co(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 31), n2.return(p$1(e, r, t.f)), o;
  throw new V("Stream");
}
function Ao(e, r, t) {
  return p$1(e, r, t.f), o;
}
function Eo(e, r, t) {
  return p$1(e, r, t.a[1]), o;
}
function Io(e, r, t) {
  let n2 = b(e, t.i, wr([], t.s, t.l));
  for (let a = 0, s = t.a.length; a < s; a++) n2.v[a] = p$1(e, r, t.a[a]);
  return n2;
}
function p$1(e, r, t) {
  if (r > e.base.depthLimit) throw new Q(e.base.depthLimit);
  switch (r += 1, t.t) {
    case 2:
      return Br(t, at$1, t.s);
    case 0:
      return Number(t.s);
    case 1:
      return D(String(t.s));
    case 3:
      if (String(t.s).length > Yn) throw new O(t);
      return BigInt(t.s);
    case 4:
      return e.base.refs.get(t.i);
    case 18:
      return Hn(e, t);
    case 9:
      return Jn(e, r, t);
    case 10:
    case 11:
      return Qn(e, r, t);
    case 5:
      return eo(e, t);
    case 6:
      return ro(e, t);
    case 7:
      return to(e, r, t);
    case 8:
      return no(e, r, t);
    case 19:
      return oo(e, t);
    case 16:
    case 15:
      return ao(e, r, t);
    case 20:
      return so(e, r, t);
    case 14:
      return io(e, r, t);
    case 13:
      return uo(e, r, t);
    case 12:
      return lo(e, r, t);
    case 17:
      return Br(t, nt, t.s);
    case 21:
      return co(e, r, t);
    case 25:
      return fo(e, r, t);
    case 22:
      return So(e, t);
    case 23:
      return mo(e, r, t);
    case 24:
      return po(e, r, t);
    case 28:
      return go(e, r, t);
    case 30:
      return yo(e, r, t);
    case 31:
      return No(e, r, t);
    case 32:
      return bo(e, r, t);
    case 33:
      return vo(e, r, t);
    case 34:
      return Co(e, r, t);
    case 27:
      return Ao(e, r, t);
    case 29:
      return Eo(e, r, t);
    case 35:
      return Io(e, r, t);
    default:
      throw new h(t);
  }
}
function sr(e, r) {
  try {
    return p$1(e, 0, r);
  } catch (t) {
    throw new He(t);
  }
}
var Ro = () => T, Po = Ro.toString(), Gt = /=>/.test(Po);
function ir(e, r) {
  return Gt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (r.startsWith("{") ? "(" + r + ")" : r) : "function(" + e.join(",") + "){return " + r + "}";
}
function Kt(e, r) {
  return Gt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + r + "}" : "function(" + e.join(",") + "){" + r + "}";
}
var Zt = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_", Ht = Zt.length, $t = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_", Jt = $t.length;
function Vr(e) {
  let r = e % Ht, t = Zt[r];
  for (e = (e - r) / Ht; e > 0; ) r = e % Jt, t += $t[r], e = (e - r) / Jt;
  return t;
}
var xo = /^[$A-Z_][0-9A-Z_$]*$/i;
function Mr(e) {
  let r = e[0];
  return (r === "$" || r === "_" || r >= "A" && r <= "Z" || r >= "a" && r <= "z") && xo.test(e);
}
function ye(e) {
  switch (e.t) {
    case 0:
      return e.s + "=" + e.v;
    case 2:
      return e.s + ".set(" + e.k + "," + e.v + ")";
    case 1:
      return e.s + ".add(" + e.v + ")";
    case 3:
      return e.s + ".delete(" + e.k + ")";
  }
}
function To(e) {
  let r = [], t = e[0];
  for (let n2 = 1, a = e.length, s, i = t; n2 < a; n2++) s = e[n2], s.t === 0 && s.v === i.v ? t = { t: 0, s: s.s, k: o, v: ye(t) } : s.t === 2 && s.s === i.s ? t = { t: 2, s: ye(t), k: s.k, v: s.v } : s.t === 1 && s.s === i.s ? t = { t: 1, s: ye(t), k: o, v: s.v } : s.t === 3 && s.s === i.s ? t = { t: 3, s: ye(t), k: s.k, v: o } : (r.push(t), t = s), i = s;
  return r.push(t), r;
}
function on(e) {
  if (e.length) {
    let r = "", t = To(e);
    for (let n2 = 0, a = t.length; n2 < a; n2++) r += ye(t[n2]) + ",";
    return r;
  }
  return o;
}
var Oo = "Object.create(null)", wo = "new Set", ho = "new Map", zo = "Promise.resolve", _o = "Promise.reject", ko = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: o };
function an(e, r) {
  return { mode: e, plugins: r.plugins, features: r.features, marked: new Set(r.markedRefs), stack: [], flags: [], assignments: [] };
}
function lr(e) {
  return { mode: 2, base: an(2, e), state: e, child: o };
}
var Lr = class {
  constructor(r) {
    this._p = r;
  }
  serialize(r) {
    return f(this._p, r);
  }
};
function Fo(e, r) {
  let t = e.valid.get(r);
  t == null && (t = e.valid.size, e.valid.set(r, t));
  let n2 = e.vars[t];
  return n2 == null && (n2 = Vr(t), e.vars[t] = n2), n2;
}
function Bo(e) {
  return le + "[" + e + "]";
}
function m(e, r) {
  return e.mode === 1 ? Fo(e.state, r) : Bo(r);
}
function w$1(e, r) {
  e.marked.add(r);
}
function Ur(e, r) {
  return e.marked.has(r);
}
function Yr(e, r, t) {
  r !== 0 && (w$1(e.base, t), e.base.flags.push({ type: r, value: m(e, t) }));
}
function Vo(e) {
  let r = "";
  for (let t = 0, n2 = e.flags, a = n2.length; t < a; t++) {
    let s = n2[t];
    r += ko[s.type] + "(" + s.value + "),";
  }
  return r;
}
function sn(e) {
  let r = on(e.assignments), t = Vo(e);
  return r ? t ? r + t : r : t;
}
function qr(e, r, t) {
  e.assignments.push({ t: 0, s: r, k: o, v: t });
}
function Mo(e, r, t) {
  e.base.assignments.push({ t: 1, s: m(e, r), k: o, v: t });
}
function ge(e, r, t, n2) {
  e.base.assignments.push({ t: 2, s: m(e, r), k: t, v: n2 });
}
function Xt(e, r, t) {
  e.base.assignments.push({ t: 3, s: m(e, r), k: t, v: o });
}
function Ne(e, r, t, n2) {
  qr(e.base, m(e, r) + "[" + t + "]", n2);
}
function jr(e, r, t, n2) {
  qr(e.base, m(e, r) + "." + t, n2);
}
function Lo(e, r, t, n2) {
  qr(e.base, m(e, r) + ".v[" + t + "]", n2);
}
function F(e, r) {
  return r.t === 4 && e.stack.includes(r.i);
}
function ae(e, r, t) {
  return e.mode === 1 && !Ur(e.base, r) ? t : m(e, r) + "=" + t;
}
function Uo(e) {
  return L + '.get("' + e.s + '")';
}
function Qt(e, r, t, n2) {
  return t ? F(e.base, t) ? (w$1(e.base, r), Ne(e, r, n2, m(e, t.i)), "") : f(e, t) : "";
}
function jo(e, r) {
  let t = r.i, n2 = r.a, a = n2.length;
  if (a > 0) {
    e.base.stack.push(t);
    let s = Qt(e, t, n2[0], 0), i = s === "";
    for (let u = 1, l; u < a; u++) l = Qt(e, t, n2[u], u), s += "," + l, i = l === "";
    return e.base.stack.pop(), Yr(e, r.o, r.i), "[" + s + (i ? ",]" : "]");
  }
  return "[]";
}
function en(e, r, t, n2) {
  if (typeof t == "string") {
    let a = Number(t), s = a >= 0 && a.toString() === t || Mr(t);
    if (F(e.base, n2)) {
      let i = m(e, n2.i);
      return w$1(e.base, r.i), s && a !== a ? jr(e, r.i, t, i) : Ne(e, r.i, s ? t : '"' + t + '"', i), "";
    }
    return (s ? t : '"' + t + '"') + ":" + f(e, n2);
  }
  return "[" + f(e, t) + "]:" + f(e, n2);
}
function un(e, r, t) {
  let n2 = t.k, a = n2.length;
  if (a > 0) {
    let s = t.v;
    e.base.stack.push(r.i);
    let i = en(e, r, n2[0], s[0]);
    for (let u = 1, l = i; u < a; u++) l = en(e, r, n2[u], s[u]), i += (l && i && ",") + l;
    return e.base.stack.pop(), "{" + i + "}";
  }
  return "{}";
}
function Yo(e, r) {
  return Yr(e, r.o, r.i), un(e, r, r.p);
}
function qo(e, r, t, n2) {
  let a = un(e, r, t);
  return a !== "{}" ? "Object.assign(" + n2 + "," + a + ")" : n2;
}
function Wo(e, r, t, n2, a) {
  let s = e.base, i = f(e, a), u = Number(n2), l = u >= 0 && u.toString() === n2 || Mr(n2);
  if (F(s, a)) l && u !== u ? jr(e, r.i, n2, i) : Ne(e, r.i, l ? n2 : '"' + n2 + '"', i);
  else {
    let g = s.assignments;
    s.assignments = t, l && u !== u ? jr(e, r.i, n2, i) : Ne(e, r.i, l ? n2 : '"' + n2 + '"', i), s.assignments = g;
  }
}
function Go(e, r, t, n2, a) {
  if (typeof n2 == "string") Wo(e, r, t, n2, a);
  else {
    let s = e.base, i = s.stack;
    s.stack = [];
    let u = f(e, a);
    s.stack = i;
    let l = s.assignments;
    s.assignments = t, Ne(e, r.i, f(e, n2), u), s.assignments = l;
  }
}
function Ko(e, r, t) {
  let n2 = t.k, a = n2.length;
  if (a > 0) {
    let s = [], i = t.v;
    e.base.stack.push(r.i);
    for (let u = 0; u < a; u++) Go(e, r, s, n2[u], i[u]);
    return e.base.stack.pop(), on(s);
  }
  return o;
}
function Wr(e, r, t) {
  if (r.p) {
    let n2 = e.base;
    if (n2.features & 8) t = qo(e, r, r.p, t);
    else {
      w$1(n2, r.i);
      let a = Ko(e, r, r.p);
      if (a) return "(" + ae(e, r.i, t) + "," + a + m(e, r.i) + ")";
    }
  }
  return t;
}
function Ho(e, r) {
  return Yr(e, r.o, r.i), Wr(e, r, Oo);
}
function Jo(e) {
  return 'new Date("' + e.s + '")';
}
function Zo(e, r) {
  if (e.base.features & 32) return "/" + r.c + "/" + r.m;
  throw new h(r);
}
function rn(e, r, t) {
  let n2 = e.base;
  return F(n2, t) ? (w$1(n2, r), Mo(e, r, m(e, t.i)), "") : f(e, t);
}
function $o(e, r) {
  let t = wo, n2 = r.a, a = n2.length, s = r.i;
  if (a > 0) {
    e.base.stack.push(s);
    let i = rn(e, s, n2[0]);
    for (let u = 1, l = i; u < a; u++) l = rn(e, s, n2[u]), i += (l && i && ",") + l;
    e.base.stack.pop(), i && (t += "([" + i + "])");
  }
  return t;
}
function tn(e, r, t, n2, a) {
  let s = e.base;
  if (F(s, t)) {
    let i = m(e, t.i);
    if (w$1(s, r), F(s, n2)) {
      let l = m(e, n2.i);
      return ge(e, r, i, l), "";
    }
    if (n2.t !== 4 && n2.i != null && Ur(s, n2.i)) {
      let l = "(" + f(e, n2) + ",[" + a + "," + a + "])";
      return ge(e, r, i, m(e, n2.i)), Xt(e, r, a), l;
    }
    let u = s.stack;
    return s.stack = [], ge(e, r, i, f(e, n2)), s.stack = u, "";
  }
  if (F(s, n2)) {
    let i = m(e, n2.i);
    if (w$1(s, r), t.t !== 4 && t.i != null && Ur(s, t.i)) {
      let l = "(" + f(e, t) + ",[" + a + "," + a + "])";
      return ge(e, r, m(e, t.i), i), Xt(e, r, a), l;
    }
    let u = s.stack;
    return s.stack = [], ge(e, r, f(e, t), i), s.stack = u, "";
  }
  return "[" + f(e, t) + "," + f(e, n2) + "]";
}
function Xo(e, r) {
  let t = ho, n2 = r.e.k, a = n2.length, s = r.i, i = r.f, u = m(e, i.i), l = e.base;
  if (a > 0) {
    let g = r.e.v;
    l.stack.push(s);
    let S = tn(e, s, n2[0], g[0], u);
    for (let d = 1, G = S; d < a; d++) G = tn(e, s, n2[d], g[d], u), S += (G && S && ",") + G;
    l.stack.pop(), S && (t += "([" + S + "])");
  }
  return i.t === 26 && (w$1(l, i.i), t = "(" + f(e, i) + "," + t + ")"), t;
}
function Qo(e, r) {
  return q(e, r.f) + '("' + r.s + '")';
}
function ea(e, r) {
  return "new " + r.c + "(" + f(e, r.f) + "," + r.b + "," + r.l + ")";
}
function ra(e, r) {
  return "new DataView(" + f(e, r.f) + "," + r.b + "," + r.l + ")";
}
function ta(e, r) {
  let t = r.i;
  e.base.stack.push(t);
  let n2 = Wr(e, r, 'new AggregateError([],"' + r.m + '")');
  return e.base.stack.pop(), n2;
}
function na(e, r) {
  return Wr(e, r, "new " + Ce[r.s] + '("' + r.m + '")');
}
function oa(e, r) {
  let t, n2 = r.f, a = r.i, s = r.s ? zo : _o, i = e.base;
  if (F(i, n2)) {
    let u = m(e, n2.i);
    t = s + (r.s ? "().then(" + ir([], u) + ")" : "().catch(" + Kt([], "throw " + u) + ")");
  } else {
    i.stack.push(a);
    let u = f(e, n2);
    i.stack.pop(), t = s + "(" + u + ")";
  }
  return t;
}
function aa(e, r) {
  return "Object(" + f(e, r.f) + ")";
}
function q(e, r) {
  let t = f(e, r);
  return r.t === 4 ? t : "(" + t + ")";
}
function sa(e, r) {
  if (e.mode === 1) throw new h(r);
  return "(" + ae(e, r.s, q(e, r.f) + "()") + ").p";
}
function ia(e, r) {
  if (e.mode === 1) throw new h(r);
  return q(e, r.a[0]) + "(" + m(e, r.i) + "," + f(e, r.a[1]) + ")";
}
function ua(e, r) {
  if (e.mode === 1) throw new h(r);
  return q(e, r.a[0]) + "(" + m(e, r.i) + "," + f(e, r.a[1]) + ")";
}
function la(e, r) {
  let t = e.base.plugins;
  if (t) for (let n2 = 0, a = t.length; n2 < a; n2++) {
    let s = t[n2];
    if (s.tag === r.c) return e.child == null && (e.child = new Lr(e)), s.serialize(r.s, e.child, { id: r.i });
  }
  throw new X(r.c);
}
function ca(e, r) {
  let t = "", n2 = false;
  return r.f.t !== 4 && (w$1(e.base, r.f.i), t = "(" + f(e, r.f) + ",", n2 = true), t += ae(e, r.i, "(" + At + ")(" + m(e, r.f.i) + ")"), n2 && (t += ")"), t;
}
function fa(e, r) {
  return q(e, r.a[0]) + "(" + f(e, r.a[1]) + ")";
}
function Sa(e, r) {
  let t = r.a[0], n2 = r.a[1], a = e.base, s = "";
  t.t !== 4 && (w$1(a, t.i), s += "(" + f(e, t)), n2.t !== 4 && (w$1(a, n2.i), s += (s ? "," : "(") + f(e, n2)), s && (s += ",");
  let i = ae(e, r.i, "(" + Et + ")(" + m(e, n2.i) + "," + m(e, t.i) + ")");
  return s ? s + i + ")" : i;
}
function ma(e, r) {
  return q(e, r.a[0]) + "(" + f(e, r.a[1]) + ")";
}
function pa(e, r) {
  let t = ae(e, r.i, q(e, r.f) + "()"), n2 = r.a.length;
  if (n2) {
    let a = f(e, r.a[0]);
    for (let s = 1; s < n2; s++) a += "," + f(e, r.a[s]);
    return "(" + t + "," + a + "," + m(e, r.i) + ")";
  }
  return t;
}
function da(e, r) {
  return m(e, r.i) + ".next(" + f(e, r.f) + ")";
}
function ga(e, r) {
  return m(e, r.i) + ".throw(" + f(e, r.f) + ")";
}
function ya(e, r) {
  return m(e, r.i) + ".return(" + f(e, r.f) + ")";
}
function nn(e, r, t, n2) {
  let a = e.base;
  return F(a, n2) ? (w$1(a, r), Lo(e, r, t, m(e, n2.i)), "") : f(e, n2);
}
function Na(e, r) {
  let t = r.a, n2 = t.length, a = r.i;
  if (n2 > 0) {
    e.base.stack.push(a);
    let s = nn(e, a, 0, t[0]);
    for (let i = 1, u = s; i < n2; i++) u = nn(e, a, i, t[i]), s += (u && s && ",") + u;
    if (e.base.stack.pop(), s) return "{__SEROVAL_SEQUENCE__:!0,v:[" + s + "],t:" + r.s + ",d:" + r.l + "}";
  }
  return "{__SEROVAL_SEQUENCE__:!0,v:[],t:-1,d:0}";
}
function ba(e, r) {
  switch (r.t) {
    case 17:
      return tt[r.s];
    case 18:
      return Uo(r);
    case 9:
      return jo(e, r);
    case 10:
      return Yo(e, r);
    case 11:
      return Ho(e, r);
    case 5:
      return Jo(r);
    case 6:
      return Zo(e, r);
    case 7:
      return $o(e, r);
    case 8:
      return Xo(e, r);
    case 19:
      return Qo(e, r);
    case 16:
    case 15:
      return ea(e, r);
    case 20:
      return ra(e, r);
    case 14:
      return ta(e, r);
    case 13:
      return na(e, r);
    case 12:
      return oa(e, r);
    case 21:
      return aa(e, r);
    case 22:
      return sa(e, r);
    case 25:
      return la(e, r);
    case 26:
      return Ot[r.s];
    case 35:
      return Na(e, r);
    default:
      throw new h(r);
  }
}
function f(e, r) {
  switch (r.t) {
    case 2:
      return ot[r.s];
    case 0:
      return "" + r.s;
    case 1:
      return '"' + r.s + '"';
    case 3:
      return r.s + "n";
    case 4:
      return m(e, r.i);
    case 23:
      return ia(e, r);
    case 24:
      return ua(e, r);
    case 27:
      return ca(e, r);
    case 28:
      return fa(e, r);
    case 29:
      return Sa(e, r);
    case 30:
      return ma(e, r);
    case 31:
      return pa(e, r);
    case 32:
      return da(e, r);
    case 33:
      return ga(e, r);
    case 34:
      return ya(e, r);
    default:
      return ae(e, r.i, ba(e, r));
  }
}
function fr(e, r) {
  let t = f(e, r), n2 = r.i;
  if (n2 == null) return t;
  let a = sn(e.base), s = m(e, n2), i = e.state.scopeId, u = i == null ? "" : le, l = a ? "(" + t + "," + a + s + ")" : t;
  if (u === "") return r.t === 10 && !a ? "(" + l + ")" : l;
  let g = i == null ? "()" : "(" + le + '["' + y(i) + '"])';
  return "(" + ir([u], l) + ")" + g;
}
var Kr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return E(this._p, this.depth, r);
  }
}, Hr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return E(this._p, this.depth, r);
  }
  parseWithError(r) {
    return W(this._p, this.depth, r);
  }
  isAlive() {
    return this._p.state.alive;
  }
  pushPendingState() {
    Qr(this._p);
  }
  popPendingState() {
    be(this._p);
  }
  onParse(r) {
    se(this._p, r);
  }
  onError(r) {
    $r(this._p, r);
  }
};
function va(e) {
  return { alive: true, pending: 0, initial: true, buffer: [], onParse: e.onParse, onError: e.onError, onDone: e.onDone };
}
function Jr(e) {
  return { type: 2, base: me(2, e), state: va(e) };
}
function Ca(e, r, t) {
  let n2 = [];
  for (let a = 0, s = t.length; a < s; a++) a in t ? n2[a] = E(e, r, t[a]) : n2[a] = 0;
  return n2;
}
function Aa(e, r, t, n2) {
  return _e(t, n2, Ca(e, r, n2));
}
function Zr(e, r, t) {
  let n2 = Object.entries(t), a = [], s = [];
  for (let i = 0, u = n2.length; i < u; i++) a.push(y(n2[i][0])), s.push(E(e, r, n2[i][1]));
  return C in t && (a.push(I(e.base, C)), s.push(Ue(rr(e.base), E(e, r, $e(t))))), v in t && (a.push(I(e.base, v)), s.push(je(tr(e.base), E(e, r, e.type === 1 ? re() : Qe(t))))), P$1 in t && (a.push(I(e.base, P$1)), s.push($(t[P$1]))), R in t && (a.push(I(e.base, R)), s.push(t[R] ? H : J)), { k: a, v: s };
}
function Gr(e, r, t, n2, a) {
  return nr(t, n2, a, Zr(e, r, n2));
}
function Ea(e, r, t, n2) {
  return ke(t, E(e, r, n2.valueOf()));
}
function Ia(e, r, t, n2) {
  return De(t, n2, E(e, r, n2.buffer));
}
function Ra(e, r, t, n2) {
  return Fe(t, n2, E(e, r, n2.buffer));
}
function Pa(e, r, t, n2) {
  return Be(t, n2, E(e, r, n2.buffer));
}
function ln(e, r, t, n2) {
  let a = Z(n2, e.base.features);
  return Ve(t, n2, a ? Zr(e, r, a) : o);
}
function xa(e, r, t, n2) {
  let a = Z(n2, e.base.features);
  return Me(t, n2, a ? Zr(e, r, a) : o);
}
function Ta(e, r, t, n2) {
  let a = [], s = [];
  for (let [i, u] of n2.entries()) a.push(E(e, r, i)), s.push(E(e, r, u));
  return or(e.base, t, a, s);
}
function Oa(e, r, t, n2) {
  let a = [];
  for (let s of n2.keys()) a.push(E(e, r, s));
  return Le(t, a);
}
function wa(e, r, t, n2) {
  let a = Ye(t, k(e.base, 4), []);
  return e.type === 1 || (Qr(e), n2.on({ next: (s) => {
    if (e.state.alive) {
      let i = W(e, r, s);
      i && se(e, qe(t, i));
    }
  }, throw: (s) => {
    if (e.state.alive) {
      let i = W(e, r, s);
      i && se(e, We(t, i));
    }
    be(e);
  }, return: (s) => {
    if (e.state.alive) {
      let i = W(e, r, s);
      i && se(e, Ge(t, i));
    }
    be(e);
  } })), a;
}
function ha(e, r, t) {
  if (this.state.alive) {
    let n2 = W(this, r, t);
    n2 && se(this, c(23, e, o, o, o, o, o, [k(this.base, 2), n2], o, o, o, o)), be(this);
  }
}
function za(e, r, t) {
  if (this.state.alive) {
    let n2 = W(this, r, t);
    n2 && se(this, c(24, e, o, o, o, o, o, [k(this.base, 3), n2], o, o, o, o));
  }
  be(this);
}
function _a(e, r, t, n2) {
  let a = zr(e.base, {});
  return e.type === 2 && (Qr(e), n2.then(ha.bind(e, a, r), za.bind(e, a, r))), zt(e.base, t, a);
}
function ka(e, r, t, n2, a) {
  for (let s = 0, i = a.length; s < i; s++) {
    let u = a[s];
    if (u.parse.sync && u.test(n2)) return ce(t, u.tag, u.parse.sync(n2, new Kr(e, r), { id: t }));
  }
  return o;
}
function Da(e, r, t, n2, a) {
  for (let s = 0, i = a.length; s < i; s++) {
    let u = a[s];
    if (u.parse.stream && u.test(n2)) return ce(t, u.tag, u.parse.stream(n2, new Hr(e, r), { id: t }));
  }
  return o;
}
function cn(e, r, t, n2) {
  let a = e.base.plugins;
  return a ? e.type === 1 ? ka(e, r, t, n2, a) : Da(e, r, t, n2, a) : o;
}
function Fa(e, r, t, n2) {
  let a = [];
  for (let s = 0, i = n2.v.length; s < i; s++) a[s] = E(e, r, n2.v[s]);
  return Ke(t, a, n2.t, n2.d);
}
function Ba(e, r, t, n2, a) {
  switch (a) {
    case Object:
      return Gr(e, r, t, n2, false);
    case o:
      return Gr(e, r, t, n2, true);
    case Date:
      return he(t, n2);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return ln(e, r, t, n2);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return Ea(e, r, t, n2);
    case ArrayBuffer:
      return ar(e.base, t, n2);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return Ia(e, r, t, n2);
    case DataView:
      return Pa(e, r, t, n2);
    case Map:
      return Ta(e, r, t, n2);
    case Set:
      return Oa(e, r, t, n2);
  }
  if (a === Promise || n2 instanceof Promise) return _a(e, r, t, n2);
  let s = e.base.features;
  if (s & 32 && a === RegExp) return ze(t, n2);
  if (s & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return Ra(e, r, t, n2);
  }
  if (s & 1 && typeof AggregateError != "undefined" && (a === AggregateError || n2 instanceof AggregateError)) return xa(e, r, t, n2);
  if (n2 instanceof Error) return ln(e, r, t, n2);
  if (C in n2 || v in n2) return Gr(e, r, t, n2, !!a);
  throw new x$1(n2);
}
function Va(e, r, t, n2) {
  if (Array.isArray(n2)) return Aa(e, r, t, n2);
  if (Xe(n2)) return wa(e, r, t, n2);
  if (Ze(n2)) return Fa(e, r, t, n2);
  let a = n2.constructor;
  if (a === j) return E(e, r, n2.replacement);
  let s = cn(e, r, t, n2);
  return s || Ba(e, r, t, n2, a);
}
function Ma(e, r, t) {
  let n2 = Y(e.base, t);
  if (n2.type !== 0) return n2.value;
  let a = cn(e, r, n2.value, t);
  if (a) return a;
  throw new x$1(t);
}
function E(e, r, t) {
  if (r >= e.base.depthLimit) throw new Q(e.base.depthLimit);
  switch (typeof t) {
    case "boolean":
      return t ? H : J;
    case "undefined":
      return Ae;
    case "string":
      return $(t);
    case "number":
      return Oe(t);
    case "bigint":
      return we(t);
    case "object": {
      if (t) {
        let n2 = Y(e.base, t);
        return n2.type === 0 ? Va(e, r + 1, n2.value, t) : n2.value;
      }
      return Ee;
    }
    case "symbol":
      return I(e.base, t);
    case "function":
      return Ma(e, r, t);
    default:
      throw new x$1(t);
  }
}
function se(e, r) {
  e.state.initial ? e.state.buffer.push(r) : Xr(e, r, false);
}
function $r(e, r) {
  if (e.state.onError) e.state.onError(r);
  else throw r instanceof z ? r : new z(r);
}
function fn(e) {
  e.state.onDone && e.state.onDone();
}
function Xr(e, r, t) {
  try {
    e.state.onParse(r, t);
  } catch (n2) {
    $r(e, n2);
  }
}
function Qr(e) {
  e.state.pending++;
}
function be(e) {
  --e.state.pending <= 0 && fn(e);
}
function W(e, r, t) {
  try {
    return E(e, r, t);
  } catch (n2) {
    return $r(e, n2), o;
  }
}
function et(e, r) {
  let t = W(e, 0, r);
  t && (Xr(e, t, true), e.state.initial = false, La(e, e.state), e.state.pending <= 0 && Sr(e));
}
function La(e, r) {
  for (let t = 0, n2 = r.buffer.length; t < n2; t++) Xr(e, r.buffer[t], false);
}
function Sr(e) {
  e.state.alive && (fn(e), e.state.alive = false);
}
async function su(e, r = {}) {
  let t = A(r.plugins), n2 = te(2, { plugins: t, disabledFeatures: r.disabledFeatures, refs: r.refs });
  return await ne(n2, e);
}
function Sn(e, r) {
  let t = A(r.plugins), n2 = Jr({ plugins: t, refs: r.refs, disabledFeatures: r.disabledFeatures, onParse(a, s) {
    let i = lr({ plugins: t, features: n2.base.features, scopeId: r.scopeId, markedRefs: n2.base.marked }), u;
    try {
      u = fr(i, a);
    } catch (l) {
      r.onError && r.onError(l);
      return;
    }
    r.onSerialize(u, s);
  }, onError: r.onError, onDone: r.onDone });
  return et(n2, e), Sr.bind(null, n2);
}
function iu(e, r) {
  let t = A(r.plugins), n2 = Jr({ plugins: t, refs: r.refs, disabledFeatures: r.disabledFeatures, depthLimit: r.depthLimit, onParse: r.onParse, onError: r.onError, onDone: r.onDone });
  return et(n2, e), Sr.bind(null, n2);
}
function Pu(e, r = {}) {
  var i;
  let t = A(r.plugins), n2 = r.disabledFeatures || 0, a = (i = e.f) != null ? i : 63, s = Lt({ plugins: t, markedRefs: e.m, features: a & ~n2, disabledFeatures: n2 });
  return sr(s, e.t);
}
function createSerializationAdapter(opts) {
  return opts;
}
// @__NO_SIDE_EFFECTS__
function makeSsrSerovalPlugin(serializationAdapter, options) {
  return /* @__PURE__ */ ai({
    tag: "$TSR/t/" + serializationAdapter.key,
    test: serializationAdapter.test,
    parse: { stream(value, ctx, _data) {
      return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
    } },
    serialize(node, ctx, _data) {
      options.didRun = true;
      return GLOBAL_TSR + '.t.get("' + serializationAdapter.key + '")(' + ctx.serialize(node.v) + ")";
    },
    deserialize: void 0
  });
}
// @__NO_SIDE_EFFECTS__
function makeSerovalPlugin(serializationAdapter) {
  return /* @__PURE__ */ ai({
    tag: "$TSR/t/" + serializationAdapter.key,
    test: serializationAdapter.test,
    parse: {
      sync(value, ctx, _data) {
        return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
      },
      async async(value, ctx, _data) {
        return { v: await ctx.parse(serializationAdapter.toSerializable(value)) };
      },
      stream(value, ctx, _data) {
        return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
      }
    },
    serialize: void 0,
    deserialize(node, ctx, _data) {
      return serializationAdapter.fromSerializable(ctx.deserialize(node.v));
    }
  });
}
var RawStream = class {
  constructor(stream, options) {
    this.stream = stream;
    this.hint = options?.hint ?? "binary";
  }
};
const BufferCtor = globalThis.Buffer;
const hasNodeBuffer = !!BufferCtor && typeof BufferCtor.from === "function";
function uint8ArrayToBase64(bytes) {
  if (bytes.length === 0) return "";
  if (hasNodeBuffer) return BufferCtor.from(bytes).toString("base64");
  const CHUNK_SIZE = 32768;
  const chunks = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    chunks.push(String.fromCharCode.apply(null, chunk));
  }
  return btoa(chunks.join(""));
}
function base64ToUint8Array(base64) {
  if (base64.length === 0) return new Uint8Array(0);
  if (hasNodeBuffer) {
    const buf = BufferCtor.from(base64, "base64");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
const RAW_STREAM_FACTORY_BINARY = /* @__PURE__ */ Object.create(null);
const RAW_STREAM_FACTORY_TEXT = /* @__PURE__ */ Object.create(null);
const RAW_STREAM_FACTORY_CONSTRUCTOR_BINARY = (stream) => new ReadableStream({ start(controller) {
  stream.on({
    next(base64) {
      try {
        controller.enqueue(base64ToUint8Array(base64));
      } catch {
      }
    },
    throw(error) {
      controller.error(error);
    },
    return() {
      try {
        controller.close();
      } catch {
      }
    }
  });
} });
const textEncoderForFactory = new TextEncoder();
const RAW_STREAM_FACTORY_CONSTRUCTOR_TEXT = (stream) => {
  return new ReadableStream({ start(controller) {
    stream.on({
      next(value) {
        try {
          if (typeof value === "string") controller.enqueue(textEncoderForFactory.encode(value));
          else controller.enqueue(base64ToUint8Array(value.$b64));
        } catch {
        }
      },
      throw(error) {
        controller.error(error);
      },
      return() {
        try {
          controller.close();
        } catch {
        }
      }
    });
  } });
};
const FACTORY_BINARY = `(s=>new ReadableStream({start(c){s.on({next(b){try{const d=atob(b),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}catch(_){}},throw(e){c.error(e)},return(){try{c.close()}catch(_){}}})}}))`;
const FACTORY_TEXT = `(s=>{const e=new TextEncoder();return new ReadableStream({start(c){s.on({next(v){try{if(typeof v==='string'){c.enqueue(e.encode(v))}else{const d=atob(v.$b64),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}}catch(_){}},throw(x){c.error(x)},return(){try{c.close()}catch(_){}}})}})})`;
function toBinaryStream(readable) {
  const stream = re();
  const reader = readable.getReader();
  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          stream.return(void 0);
          break;
        }
        stream.next(uint8ArrayToBase64(value));
      }
    } catch (error) {
      stream.throw(error);
    } finally {
      reader.releaseLock();
    }
  })();
  return stream;
}
function toTextStream(readable) {
  const stream = re();
  const reader = readable.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          try {
            const remaining = decoder.decode();
            if (remaining.length > 0) stream.next(remaining);
          } catch {
          }
          stream.return(void 0);
          break;
        }
        try {
          const text = decoder.decode(value, { stream: true });
          if (text.length > 0) stream.next(text);
        } catch {
          stream.next({ $b64: uint8ArrayToBase64(value) });
        }
      }
    } catch (error) {
      stream.throw(error);
    } finally {
      reader.releaseLock();
    }
  })();
  return stream;
}
const RawStreamSSRPlugin = /* @__PURE__ */ ai({
  tag: "tss/RawStream",
  extends: [/* @__PURE__ */ ai({
    tag: "tss/RawStreamFactory",
    test(value) {
      return value === RAW_STREAM_FACTORY_BINARY;
    },
    parse: {
      sync(_value, _ctx, _data) {
        return {};
      },
      async async(_value, _ctx, _data) {
        return {};
      },
      stream(_value, _ctx, _data) {
        return {};
      }
    },
    serialize(_node, _ctx, _data) {
      return FACTORY_BINARY;
    },
    deserialize(_node, _ctx, _data) {
      return RAW_STREAM_FACTORY_BINARY;
    }
  }), /* @__PURE__ */ ai({
    tag: "tss/RawStreamFactoryText",
    test(value) {
      return value === RAW_STREAM_FACTORY_TEXT;
    },
    parse: {
      sync(_value, _ctx, _data) {
        return {};
      },
      async async(_value, _ctx, _data) {
        return {};
      },
      stream(_value, _ctx, _data) {
        return {};
      }
    },
    serialize(_node, _ctx, _data) {
      return FACTORY_TEXT;
    },
    deserialize(_node, _ctx, _data) {
      return RAW_STREAM_FACTORY_TEXT;
    }
  })],
  test(value) {
    return value instanceof RawStream;
  },
  parse: {
    sync(value, ctx, _data) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      return {
        hint: ctx.parse(value.hint),
        factory: ctx.parse(factory),
        stream: ctx.parse(re())
      };
    },
    async async(value, ctx, _data) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      const encodedStream = value.hint === "text" ? toTextStream(value.stream) : toBinaryStream(value.stream);
      return {
        hint: await ctx.parse(value.hint),
        factory: await ctx.parse(factory),
        stream: await ctx.parse(encodedStream)
      };
    },
    stream(value, ctx, _data) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      const encodedStream = value.hint === "text" ? toTextStream(value.stream) : toBinaryStream(value.stream);
      return {
        hint: ctx.parse(value.hint),
        factory: ctx.parse(factory),
        stream: ctx.parse(encodedStream)
      };
    }
  },
  serialize(node, ctx, _data) {
    return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.stream) + ")";
  },
  deserialize(node, ctx, _data) {
    const stream = ctx.deserialize(node.stream);
    return ctx.deserialize(node.hint) === "text" ? RAW_STREAM_FACTORY_CONSTRUCTOR_TEXT(stream) : RAW_STREAM_FACTORY_CONSTRUCTOR_BINARY(stream);
  }
});
// @__NO_SIDE_EFFECTS__
function createRawStreamRPCPlugin(onRawStream) {
  let nextStreamId = 1;
  return /* @__PURE__ */ ai({
    tag: "tss/RawStream",
    test(value) {
      return value instanceof RawStream;
    },
    parse: {
      async async(value, ctx, _data) {
        const streamId = nextStreamId++;
        onRawStream(streamId, value.stream);
        return { streamId: await ctx.parse(streamId) };
      },
      stream(value, ctx, _data) {
        const streamId = nextStreamId++;
        onRawStream(streamId, value.stream);
        return { streamId: ctx.parse(streamId) };
      }
    },
    serialize() {
      throw new Error("RawStreamRPCPlugin.serialize should not be called. RPC uses JSON serialization, not JS code generation.");
    },
    deserialize() {
      throw new Error("RawStreamRPCPlugin.deserialize should not be called. Use createRawStreamDeserializePlugin on client.");
    }
  });
}
const ShallowErrorPlugin = /* @__PURE__ */ ai({
  tag: "$TSR/Error",
  test(value) {
    return value instanceof Error;
  },
  parse: {
    sync(value, ctx) {
      return { message: ctx.parse(value.message) };
    },
    async async(value, ctx) {
      return { message: await ctx.parse(value.message) };
    },
    stream(value, ctx) {
      return { message: ctx.parse(value.message) };
    }
  },
  serialize(node, ctx) {
    return "new Error(" + ctx.serialize(node.message) + ")";
  },
  deserialize(node, ctx) {
    return new Error(ctx.deserialize(node.message));
  }
});
var n = {}, P = (e) => new ReadableStream({ start: (r) => {
  e.on({ next: (a) => {
    try {
      r.enqueue(a);
    } catch (t) {
    }
  }, throw: (a) => {
    r.error(a);
  }, return: () => {
    try {
      r.close();
    } catch (a) {
    }
  } });
} }), x2 = ai({ tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === n;
}, parse: { sync() {
  return n;
}, async async() {
  return await Promise.resolve(n);
}, stream() {
  return n;
} }, serialize() {
  return P.toString();
}, deserialize() {
  return n;
} });
function w(e) {
  let r = re(), a = e.getReader();
  async function t() {
    try {
      let s = await a.read();
      s.done ? r.return(s.value) : (r.next(s.value), await t());
    } catch (s) {
      r.throw(s);
    }
  }
  return t().catch(() => {
  }), r;
}
var ee = ai({ tag: "seroval/plugins/web/ReadableStream", extends: [x2], test(e) {
  return typeof ReadableStream == "undefined" ? false : e instanceof ReadableStream;
}, parse: { sync(e, r) {
  return { factory: r.parse(n), stream: r.parse(re()) };
}, async async(e, r) {
  return { factory: await r.parse(n), stream: await r.parse(w(e)) };
}, stream(e, r) {
  return { factory: r.parse(n), stream: r.parse(w(e)) };
} }, serialize(e, r) {
  return "(" + r.serialize(e.factory) + ")(" + r.serialize(e.stream) + ")";
}, deserialize(e, r) {
  let a = r.deserialize(e.stream);
  return P(a);
} }), p = ee;
const defaultSerovalPlugins = [
  ShallowErrorPlugin,
  RawStreamSSRPlugin,
  p
];
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m2) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m2) {
          if (m2.options.middleware) newMiddleware.push(...m2.options.middleware);
        } else newMiddleware.push(m2);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    inputValidator: (inputValidator) => {
      return createServerFn(void 0, {
        ...resolvedOptions,
        inputValidator
      });
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect2 = parseRedirect(result.error);
        if (redirect2) throw redirect2;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware$1(resolvedMiddleware, "server", {
            ...extractedFn,
            ...opts,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m2) => !startContext.executedRequestMiddlewares.has(m2));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      if ("inputValidator" in nextMiddleware.options && nextMiddleware.options.inputValidator && env === "server") ctx.data = await execValidator(nextMiddleware.options.inputValidator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m2) => {
      if (m2.options.middleware) recurse(m2.options.middleware, depth + 1);
      if (!seen.has(m2)) {
        seen.add(m2);
        flattened.push(m2);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.inputValidator,
      client: async ({ next, sendContext, fetch: fetch2, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch: fetch2
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
var createMiddleware = (options, __opts) => {
  const resolvedOptions = {
    type: "request",
    ...__opts || options
  };
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
    },
    inputValidator: (inputValidator) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { inputValidator }));
    },
    client: (client) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { client }));
    },
    server: (server2) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { server: server2 }));
    }
  };
};
function dedupeSerializationAdapters(deduped, serializationAdapters) {
  for (let i = 0, len = serializationAdapters.length; i < len; i++) {
    const current = serializationAdapters[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
    }
  }
}
var createStart = (getOptions) => {
  return {
    getOptions: async () => {
      const options = await getOptions();
      if (options.serializationAdapters) {
        const deduped = /* @__PURE__ */ new Set();
        dedupeSerializationAdapters(deduped, options.serializationAdapters);
        options.serializationAdapters = Array.from(deduped);
      }
      return options;
    },
    createMiddleware
  };
};
function getDefaultSerovalPlugins() {
  return [...getStartOptions()?.serializationAdapters?.map(makeSerovalPlugin) ?? [], ...defaultSerovalPlugins];
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn2 = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn2, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
function StartServer(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterProvider, { router: props.router });
}
var defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({
  request,
  router,
  responseHeaders,
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(StartServer, { router })
}));
const NullProtoObj = /* @__PURE__ */ (() => {
  const e = function() {
  };
  return e.prototype = /* @__PURE__ */ Object.create(null), Object.freeze(e.prototype), e;
})();
function lazyInherit(target, source, sourceKey) {
  for (const key of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
    if (key === "constructor") continue;
    const targetDesc = Object.getOwnPropertyDescriptor(target, key);
    const desc = Object.getOwnPropertyDescriptor(source, key);
    let modified = false;
    if (desc.get) {
      modified = true;
      desc.get = targetDesc?.get || function() {
        return this[sourceKey][key];
      };
    }
    if (desc.set) {
      modified = true;
      desc.set = targetDesc?.set || function(value) {
        this[sourceKey][key] = value;
      };
    }
    if (!targetDesc?.value && typeof desc.value === "function") {
      modified = true;
      desc.value = function(...args) {
        return this[sourceKey][key](...args);
      };
    }
    if (modified) Object.defineProperty(target, key, desc);
  }
}
const _needsNormRE = /(?:(?:^|\/)(?:\.|\.\.|%2e|%2e\.|\.%2e|%2e%2e)(?:\/|$))|[\\^\x80-\uffff]/i;
const FastURL = /* @__PURE__ */ (() => {
  const NativeURL = globalThis.URL;
  const FastURL2 = class URL {
    #url;
    #href;
    #protocol;
    #host;
    #pathname;
    #search;
    #searchParams;
    #pos;
    constructor(url) {
      if (typeof url === "string") if (url[0] === "/") this.#href = url;
      else this.#url = new NativeURL(url);
      else if (_needsNormRE.test(url.pathname)) this.#url = new NativeURL(`${url.protocol || "http:"}//${url.host || "localhost"}${url.pathname}${url.search || ""}`);
      else {
        this.#protocol = url.protocol;
        this.#host = url.host;
        this.#pathname = url.pathname;
        this.#search = url.search;
      }
    }
    static [Symbol.hasInstance](val) {
      return val instanceof NativeURL;
    }
    get _url() {
      if (this.#url) return this.#url;
      this.#url = new NativeURL(this.href);
      this.#href = void 0;
      this.#protocol = void 0;
      this.#host = void 0;
      this.#pathname = void 0;
      this.#search = void 0;
      this.#searchParams = void 0;
      this.#pos = void 0;
      return this.#url;
    }
    get href() {
      if (this.#url) return this.#url.href;
      if (!this.#href) this.#href = `${this.#protocol || "http:"}//${this.#host || "localhost"}${this.#pathname || "/"}${this.#search || ""}`;
      return this.#href;
    }
    #getPos() {
      if (!this.#pos) {
        const url = this.href;
        const protoIndex = url.indexOf("://");
        const pathnameIndex = protoIndex === -1 ? -1 : url.indexOf("/", protoIndex + 4);
        this.#pos = [
          protoIndex,
          pathnameIndex,
          pathnameIndex === -1 ? -1 : url.indexOf("?", pathnameIndex)
        ];
      }
      return this.#pos;
    }
    get pathname() {
      if (this.#url) return this.#url.pathname;
      if (this.#pathname === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.pathname;
        this.#pathname = this.href.slice(pathnameIndex, queryIndex === -1 ? void 0 : queryIndex);
      }
      return this.#pathname;
    }
    get search() {
      if (this.#url) return this.#url.search;
      if (this.#search === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.search;
        const url = this.href;
        this.#search = queryIndex === -1 || queryIndex === url.length - 1 ? "" : url.slice(queryIndex);
      }
      return this.#search;
    }
    get searchParams() {
      if (this.#url) return this.#url.searchParams;
      if (!this.#searchParams) this.#searchParams = new URLSearchParams(this.search);
      return this.#searchParams;
    }
    get protocol() {
      if (this.#url) return this.#url.protocol;
      if (this.#protocol === void 0) {
        const [protocolIndex] = this.#getPos();
        if (protocolIndex === -1) return this._url.protocol;
        this.#protocol = this.href.slice(0, protocolIndex + 1);
      }
      return this.#protocol;
    }
    toString() {
      return this.href;
    }
    toJSON() {
      return this.href;
    }
  };
  lazyInherit(FastURL2.prototype, NativeURL.prototype, "_url");
  Object.setPrototypeOf(FastURL2.prototype, NativeURL.prototype);
  Object.setPrototypeOf(FastURL2, NativeURL);
  return FastURL2;
})();
const NodeResponse = /* @__PURE__ */ (() => {
  const NativeResponse = globalThis.Response;
  const STATUS_CODES = globalThis.process?.getBuiltinModule?.("node:http")?.STATUS_CODES || {};
  class NodeResponse2 {
    #body;
    #init;
    #headers;
    #response;
    constructor(body, init) {
      this.#body = body;
      this.#init = init;
    }
    static [Symbol.hasInstance](val) {
      return val instanceof NativeResponse;
    }
    get status() {
      return this.#response?.status || this.#init?.status || 200;
    }
    get statusText() {
      return this.#response?.statusText || this.#init?.statusText || STATUS_CODES[this.status] || "";
    }
    get headers() {
      if (this.#response) return this.#response.headers;
      if (this.#headers) return this.#headers;
      const initHeaders = this.#init?.headers;
      return this.#headers = initHeaders instanceof Headers ? initHeaders : new Headers(initHeaders);
    }
    get ok() {
      if (this.#response) return this.#response.ok;
      const status = this.status;
      return status >= 200 && status < 300;
    }
    get _response() {
      if (this.#response) return this.#response;
      let body = this.#body;
      if (body && typeof body.pipe === "function" && !(body instanceof Readable)) {
        const stream = new PassThrough();
        body.pipe(stream);
        const abort = body.abort;
        if (abort) stream.once("close", () => abort());
        body = stream;
      }
      this.#response = new NativeResponse(body, this.#headers ? {
        ...this.#init,
        headers: this.#headers
      } : this.#init);
      this.#init = void 0;
      this.#headers = void 0;
      this.#body = void 0;
      return this.#response;
    }
    _toNodeResponse() {
      const status = this.status;
      const statusText = this.statusText;
      let body;
      let contentType;
      let contentLength;
      if (this.#response) body = this.#response.body;
      else if (this.#body) if (this.#body instanceof ReadableStream) body = this.#body;
      else if (typeof this.#body === "string") {
        body = this.#body;
        contentType = "text/plain; charset=UTF-8";
        contentLength = Buffer.byteLength(this.#body);
      } else if (this.#body instanceof ArrayBuffer) {
        body = Buffer.from(this.#body);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Uint8Array) {
        body = this.#body;
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof DataView) {
        body = Buffer.from(this.#body.buffer);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Blob) {
        body = this.#body.stream();
        contentType = this.#body.type;
        contentLength = this.#body.size;
      } else if (typeof this.#body.pipe === "function") body = this.#body;
      else body = this._response.body;
      const headers = [];
      const initHeaders = this.#init?.headers;
      const headerEntries = this.#response?.headers || this.#headers || (initHeaders ? Array.isArray(initHeaders) ? initHeaders : initHeaders?.entries ? initHeaders.entries() : Object.entries(initHeaders).map(([k2, v2]) => [k2.toLowerCase(), v2]) : void 0);
      let hasContentTypeHeader;
      let hasContentLength;
      if (headerEntries) for (const [key, value] of headerEntries) {
        if (Array.isArray(value)) for (const v2 of value) headers.push([key, v2]);
        else headers.push([key, value]);
        if (key === "content-type") hasContentTypeHeader = true;
        else if (key === "content-length") hasContentLength = true;
      }
      if (contentType && !hasContentTypeHeader) headers.push(["content-type", contentType]);
      if (contentLength && !hasContentLength) headers.push(["content-length", String(contentLength)]);
      this.#init = void 0;
      this.#headers = void 0;
      this.#response = void 0;
      this.#body = void 0;
      return {
        status,
        statusText,
        headers,
        body
      };
    }
  }
  lazyInherit(NodeResponse2.prototype, NativeResponse.prototype, "_response");
  Object.setPrototypeOf(NodeResponse2, NativeResponse);
  Object.setPrototypeOf(NodeResponse2.prototype, NativeResponse.prototype);
  return NodeResponse2;
})();
function decodePathname(pathname) {
  return decodeURI(pathname.includes("%25") ? pathname.replace(/%25/g, "%2525") : pathname);
}
const kEventNS = "h3.internal.event.";
const kEventRes = /* @__PURE__ */ Symbol.for(`${kEventNS}res`);
const kEventResHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.headers`);
const kEventResErrHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.err.headers`);
var H3Event = class {
  app;
  req;
  url;
  context;
  static __is_event__ = true;
  constructor(req, context, app) {
    this.context = context || req.context || new NullProtoObj();
    this.req = req;
    this.app = app;
    const _url = req._url;
    const url = _url && _url instanceof URL ? _url : new FastURL(req.url);
    if (url.pathname.includes("%")) url.pathname = decodePathname(url.pathname);
    this.url = url;
  }
  get res() {
    return this[kEventRes] ||= new H3EventResponse();
  }
  get runtime() {
    return this.req.runtime;
  }
  waitUntil(promise) {
    this.req.waitUntil?.(promise);
  }
  toString() {
    return `[${this.req.method}] ${this.req.url}`;
  }
  toJSON() {
    return this.toString();
  }
  get node() {
    return this.req.runtime?.node;
  }
  get headers() {
    return this.req.headers;
  }
  get path() {
    return this.url.pathname + this.url.search;
  }
  get method() {
    return this.req.method;
  }
};
var H3EventResponse = class {
  status;
  statusText;
  get headers() {
    return this[kEventResHeaders] ||= new Headers();
  }
  get errHeaders() {
    return this[kEventResErrHeaders] ||= new Headers();
  }
};
const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) return defaultStatusCode;
  if (typeof statusCode === "string") statusCode = +statusCode;
  if (statusCode < 100 || statusCode > 599) return defaultStatusCode;
  return statusCode;
}
var HTTPError = class HTTPError2 extends Error {
  get name() {
    return "HTTPError";
  }
  status;
  statusText;
  headers;
  cause;
  data;
  body;
  unhandled;
  static isError(input) {
    return input instanceof Error && input?.name === "HTTPError";
  }
  static status(status, statusText, details) {
    return new HTTPError2({
      ...details,
      statusText,
      status
    });
  }
  constructor(arg1, arg2) {
    let messageInput;
    let details;
    if (typeof arg1 === "string") {
      messageInput = arg1;
      details = arg2;
    } else details = arg1;
    const status = sanitizeStatusCode(details?.status || details?.statusCode || details?.cause?.status || details?.cause?.statusCode, 500);
    const statusText = sanitizeStatusMessage(details?.statusText || details?.statusMessage || details?.cause?.statusText || details?.cause?.statusMessage);
    const message = messageInput || details?.message || details?.cause?.message || details?.statusText || details?.statusMessage || [
      "HTTPError",
      status,
      statusText
    ].filter(Boolean).join(" ");
    super(message, { cause: details });
    this.cause = details;
    this.status = status;
    this.statusText = statusText || void 0;
    const rawHeaders = details?.headers || details?.cause?.headers;
    this.headers = rawHeaders ? new Headers(rawHeaders) : void 0;
    this.unhandled = details?.unhandled ?? details?.cause?.unhandled ?? void 0;
    this.data = details?.data;
    this.body = details?.body;
  }
  get statusCode() {
    return this.status;
  }
  get statusMessage() {
    return this.statusText;
  }
  toJSON() {
    const unhandled = this.unhandled;
    return {
      status: this.status,
      statusText: this.statusText,
      unhandled,
      message: unhandled ? "HTTPError" : this.message,
      data: unhandled ? void 0 : this.data,
      ...unhandled ? void 0 : this.body
    };
  }
};
function isJSONSerializable(value, _type) {
  if (value === null || value === void 0) return true;
  if (_type !== "object") return _type === "boolean" || _type === "number" || _type === "string";
  if (typeof value.toJSON === "function") return true;
  if (Array.isArray(value)) return true;
  if (typeof value.pipe === "function" || typeof value.pipeTo === "function") return false;
  if (value instanceof NullProtoObj) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
const kNotFound = /* @__PURE__ */ Symbol.for("h3.notFound");
const kHandled = /* @__PURE__ */ Symbol.for("h3.handled");
function toResponse(val, event, config = {}) {
  if (typeof val?.then === "function") return (val.catch?.((error) => error) || Promise.resolve(val)).then((resolvedVal) => toResponse(resolvedVal, event, config));
  const response = prepareResponse(val, event, config);
  if (typeof response?.then === "function") return toResponse(response, event, config);
  const { onResponse } = config;
  return onResponse ? Promise.resolve(onResponse(response, event)).then(() => response) : response;
}
var HTTPResponse = class {
  #headers;
  #init;
  body;
  constructor(body, init) {
    this.body = body;
    this.#init = init;
  }
  get status() {
    return this.#init?.status || 200;
  }
  get statusText() {
    return this.#init?.statusText || "OK";
  }
  get headers() {
    return this.#headers ||= new Headers(this.#init?.headers);
  }
};
function prepareResponse(val, event, config, nested) {
  if (val === kHandled) return new NodeResponse(null);
  if (val === kNotFound) val = new HTTPError({
    status: 404,
    message: `Cannot find any route matching [${event.req.method}] ${event.url}`
  });
  if (val && val instanceof Error) {
    const isHTTPError = HTTPError.isError(val);
    const error = isHTTPError ? val : new HTTPError(val);
    if (!isHTTPError) {
      error.unhandled = true;
      if (val?.stack) error.stack = val.stack;
    }
    if (error.unhandled && !config.silent) console.error(error);
    const { onError } = config;
    const errHeaders = event[kEventRes]?.[kEventResErrHeaders];
    return onError && !nested ? Promise.resolve(onError(error, event)).catch((error2) => error2).then((newVal) => prepareResponse(newVal ?? val, event, config, true)) : errorResponse(error, config.debug, errHeaders);
  }
  const preparedRes = event[kEventRes];
  const preparedHeaders = preparedRes?.[kEventResHeaders];
  event[kEventRes] = void 0;
  if (!(val instanceof Response)) {
    const res = prepareResponseBody(val, event, config);
    const status = res.status || preparedRes?.status;
    return new NodeResponse(nullBody(event.req.method, status) ? null : res.body, {
      status,
      statusText: res.statusText || preparedRes?.statusText,
      headers: res.headers && preparedHeaders ? mergeHeaders$1(res.headers, preparedHeaders) : res.headers || preparedHeaders
    });
  }
  if (!preparedHeaders || nested || !val.ok) return val;
  try {
    mergeHeaders$1(val.headers, preparedHeaders, val.headers);
    return val;
  } catch {
    return new NodeResponse(nullBody(event.req.method, val.status) ? null : val.body, {
      status: val.status,
      statusText: val.statusText,
      headers: mergeHeaders$1(val.headers, preparedHeaders)
    });
  }
}
function mergeHeaders$1(base, overrides, target = new Headers(base)) {
  for (const [name, value] of overrides) if (name === "set-cookie") target.append(name, value);
  else target.set(name, value);
  return target;
}
const frozen = (name) => (...args) => {
  throw new Error(`Headers are frozen (${name} ${args.join(", ")})`);
};
var FrozenHeaders = class extends Headers {
  set = frozen("set");
  append = frozen("append");
  delete = frozen("delete");
};
const emptyHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-length": "0" });
const jsonHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-type": "application/json;charset=UTF-8" });
function prepareResponseBody(val, event, config) {
  if (val === null || val === void 0) return {
    body: "",
    headers: emptyHeaders
  };
  const valType = typeof val;
  if (valType === "string") return { body: val };
  if (val instanceof Uint8Array) {
    event.res.headers.set("content-length", val.byteLength.toString());
    return { body: val };
  }
  if (val instanceof HTTPResponse || val?.constructor?.name === "HTTPResponse") return val;
  if (isJSONSerializable(val, valType)) return {
    body: JSON.stringify(val, void 0, config.debug ? 2 : void 0),
    headers: jsonHeaders
  };
  if (valType === "bigint") return {
    body: val.toString(),
    headers: jsonHeaders
  };
  if (val instanceof Blob) {
    const headers = new Headers({
      "content-type": val.type,
      "content-length": val.size.toString()
    });
    let filename = val.name;
    if (filename) {
      filename = encodeURIComponent(filename);
      headers.set("content-disposition", `filename="${filename}"; filename*=UTF-8''${filename}`);
    }
    return {
      body: val.stream(),
      headers
    };
  }
  if (valType === "symbol") return { body: val.toString() };
  if (valType === "function") return { body: `${val.name}()` };
  return { body: val };
}
function nullBody(method, status) {
  return method === "HEAD" || status === 100 || status === 101 || status === 102 || status === 204 || status === 205 || status === 304;
}
function errorResponse(error, debug, errHeaders) {
  let headers = error.headers ? mergeHeaders$1(jsonHeaders, error.headers) : new Headers(jsonHeaders);
  if (errHeaders) headers = mergeHeaders$1(headers, errHeaders);
  return new NodeResponse(JSON.stringify({
    ...error.toJSON(),
    stack: debug && error.stack ? error.stack.split("\n").map((l) => l.trim()) : void 0
  }, void 0, debug ? 2 : void 0), {
    status: error.status,
    statusText: error.statusText,
    headers
  });
}
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj = globalThis;
if (!globalObj[GLOBAL_EVENT_STORAGE_KEY]) globalObj[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) return value.then((resolved) => {
    if (resolved instanceof Response) mergeEventResponseHeaders(resolved, event);
    return resolved;
  });
  if (value instanceof Response) mergeEventResponseHeaders(value, event);
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    return toResponse(attachResponseHeaders(eventStorage.run({ h3Event }, () => handler(request, requestOpts)), h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function getResponse() {
  return getH3Event().res;
}
var HEADERS = { TSS_SHELL: "X-TSS_SHELL" };
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("../_tanstack-start-manifest_v-D7NxpN4l.mjs");
  const startManifest = tsrStartManifest();
  const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  let injectedHeadScripts;
  return {
    manifest: {
      inlineCss: startManifest.inlineCss,
      routes: Object.fromEntries(Object.entries(startManifest.routes).flatMap(([k2, v2]) => {
        const result = {};
        let hasData = false;
        if (v2.preloads && v2.preloads.length > 0) {
          result["preloads"] = v2.preloads;
          hasData = true;
        }
        if (v2.assets && v2.assets.length > 0) {
          result["assets"] = v2.assets;
          hasData = true;
        }
        if (!hasData) return [];
        return [[k2, result]];
      }))
    },
    clientEntry: startManifest.clientEntry,
    injectedHeadScripts
  };
}
var textEncoder = new TextEncoder();
var EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json2) {
  return encodeFrame(FrameType.JSON, 0, textEncoder.encode(json2));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams, lateStreamSource) {
  let controller;
  let cancelled = false;
  const readers = [];
  const enqueue = (frame) => {
    if (cancelled) return false;
    try {
      controller.enqueue(frame);
      return true;
    } catch {
      return false;
    }
  };
  const errorOutput = (error) => {
    if (cancelled) return;
    cancelled = true;
    try {
      controller.error(error);
    } catch {
    }
    for (const reader of readers) reader.cancel().catch(() => {
    });
  };
  async function pumpRawStream(streamId, stream) {
    const reader = stream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) {
          enqueue(encodeEndFrame(streamId));
          return;
        }
        if (!enqueue(encodeChunkFrame(streamId, value))) return;
      }
    } catch (error) {
      enqueue(encodeErrorFrame(streamId, error));
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpJSON() {
    const reader = jsonStream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) return;
        if (!enqueue(encodeJSONFrame(value))) return;
      }
    } catch (error) {
      errorOutput(error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpLateStreams() {
    if (!lateStreamSource) return [];
    const lateStreamPumps = [];
    const reader = lateStreamSource.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        lateStreamPumps.push(pumpRawStream(value.id, value.stream));
      }
    } finally {
      reader.releaseLock();
    }
    return lateStreamPumps;
  }
  return new ReadableStream({
    async start(ctrl) {
      controller = ctrl;
      const pumps = [pumpJSON()];
      for (const [streamId, stream] of rawStreams) pumps.push(pumpRawStream(streamId, stream));
      if (lateStreamSource) pumps.push(pumpLateStreams());
      try {
        const latePumps = (await Promise.all(pumps)).find(Array.isArray);
        if (latePumps && latePumps.length > 0) await Promise.all(latePumps);
        if (!cancelled) try {
          controller.close();
        } catch {
        }
      } catch {
      }
    },
    cancel() {
      cancelled = true;
      for (const reader of readers) reader.cancel().catch(() => {
      });
      readers.length = 0;
    }
  });
}
var serovalPlugins = void 0;
var FORM_DATA_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
var MAX_PAYLOAD_SIZE = 1e6;
var handleServerAction = async ({ request, context, serverFnId }) => {
  const methodUpper = request.method.toUpperCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  if (action.method && methodUpper !== action.method) return new Response(`expected ${action.method} method. Got ${methodUpper}`, {
    status: 405,
    headers: { Allow: action.method }
  });
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) serovalPlugins = getDefaultSerovalPlugins();
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    return Pu(payload, { plugins: serovalPlugins });
  }
  return await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          let initialPhase = true;
          let lateStreamWriter;
          let lateStreamReadable = void 0;
          const pendingLateStreams = [];
          const plugins = [/* @__PURE__ */ createRawStreamRPCPlugin((id, stream) => {
            if (initialPhase) {
              rawStreams.set(id, stream);
              return;
            }
            if (lateStreamWriter) {
              lateStreamWriter.write({
                id,
                stream
              }).catch(() => {
              });
              return;
            }
            pendingLateStreams.push({
              id,
              stream
            });
          }), ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error) => {
              throw error;
            }
          };
          iu(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error) => {
              callbacks.onError(error);
            }
          });
          initialPhase = false;
          if (done && rawStreams.size === 0) return new Response(nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/json",
              [X_TSS_SERIALIZED]: "true"
            }
          });
          const { readable, writable } = new TransformStream();
          lateStreamReadable = readable;
          lateStreamWriter = writable.getWriter();
          for (const registration of pendingLateStreams) lateStreamWriter.write(registration).catch(() => {
          });
          pendingLateStreams.length = 0;
          const multiplexedStream = createMultiplexedStream(new ReadableStream({
            start(controller) {
              callbacks.onParse = (value) => {
                controller.enqueue(JSON.stringify(value) + "\n");
              };
              callbacks.onDone = () => {
                try {
                  controller.close();
                } catch {
                }
                lateStreamWriter?.close().catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              callbacks.onError = (error) => {
                controller.error(error);
                lateStreamWriter?.abort(error).catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              if (nonStreamingBody !== void 0) callbacks.onParse(nonStreamingBody);
              if (done) callbacks.onDone();
            },
            cancel() {
              lateStreamWriter?.abort().catch(() => {
              });
              lateStreamWriter = void 0;
            }
          }), rawStreams, lateStreamReadable);
          return new Response(multiplexedStream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some((type) => contentType && contentType.includes(type))) {
          if (methodUpper === "GET") {
            if (false) ;
            invariant();
          }
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData,
            method: methodUpper
          };
          if (typeof serializedContext === "string") try {
            const deserializedContext = Pu(JSON.parse(serializedContext), { plugins: serovalPlugins });
            if (typeof deserializedContext === "object" && deserializedContext) params.context = safeObjectMerge(deserializedContext, context);
          } catch (e) {
            if (false) ;
          }
          return await action(params);
        }
        if (methodUpper === "GET") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) throw new Error("Payload too large");
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(payload2.context, context);
          payload2.method = methodUpper;
          return await action(payload2);
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) jsonPayload = await request.json();
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        payload.method = methodUpper;
        return await action(payload);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) res = isNotFoundResponse(res);
      if (!isServerFn) return unwrapped;
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) return unwrapped;
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error) {
      if (error instanceof Response) return error;
      if (isNotFound(error)) return isNotFoundResponse(error);
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(await Promise.resolve(su(error, {
        refs: /* @__PURE__ */ new Map(),
        plugins: serovalPlugins
      })));
      const response = getResponse();
      return new Response(serializedError, {
        status: response.status ?? 500,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
function normalizeTransformAssetResult(result) {
  if (typeof result === "string") return { href: result };
  return result;
}
function resolveTransformAssetsCrossOrigin(config, kind) {
  if (!config) return void 0;
  if (typeof config === "string") return config;
  return config[kind];
}
function isObjectShorthand(transform) {
  return "prefix" in transform;
}
function resolveTransformAssetsConfig(transform) {
  if (typeof transform === "string") {
    const prefix = transform;
    return {
      type: "transform",
      transformFn: ({ url }) => ({ href: `${prefix}${url}` }),
      cache: true
    };
  }
  if (typeof transform === "function") return {
    type: "transform",
    transformFn: transform,
    cache: true
  };
  if (isObjectShorthand(transform)) {
    const { prefix, crossOrigin } = transform;
    return {
      type: "transform",
      transformFn: ({ url, kind }) => {
        const href = `${prefix}${url}`;
        if (kind === "clientEntry") return { href };
        const co2 = resolveTransformAssetsCrossOrigin(crossOrigin, kind);
        return co2 ? {
          href,
          crossOrigin: co2
        } : { href };
      },
      cache: true
    };
  }
  if ("createTransform" in transform && transform.createTransform) return {
    type: "createTransform",
    createTransform: transform.createTransform,
    cache: transform.cache !== false
  };
  return {
    type: "transform",
    transformFn: typeof transform.transform === "string" ? (({ url }) => ({ href: `${transform.transform}${url}` })) : transform.transform,
    cache: transform.cache !== false
  };
}
function adaptTransformAssetUrlsToTransformAssets(transformFn) {
  return async ({ url, kind }) => ({ href: await transformFn({
    url,
    type: kind
  }) });
}
function adaptTransformAssetUrlsConfigToTransformAssets(transform) {
  if (typeof transform === "string") return transform;
  if (typeof transform === "function") return adaptTransformAssetUrlsToTransformAssets(transform);
  if ("createTransform" in transform && transform.createTransform) return {
    createTransform: async (ctx) => adaptTransformAssetUrlsToTransformAssets(await transform.createTransform(ctx)),
    cache: transform.cache,
    warmup: transform.warmup
  };
  return {
    transform: typeof transform.transform === "string" ? transform.transform : adaptTransformAssetUrlsToTransformAssets(transform.transform),
    cache: transform.cache,
    warmup: transform.warmup
  };
}
function buildClientEntryScriptTag(clientEntry, injectedHeadScripts) {
  let script = `import(${JSON.stringify(clientEntry)})`;
  if (injectedHeadScripts) script = `${injectedHeadScripts};${script}`;
  return {
    tag: "script",
    attrs: {
      type: "module",
      async: true
    },
    children: script
  };
}
function assignManifestAssetLink(link, next) {
  if (typeof link === "string") return next.crossOrigin ? next : next.href;
  return next.crossOrigin ? next : { href: next.href };
}
async function transformManifestAssets(source, transformFn, _opts) {
  const manifest2 = structuredClone(source.manifest);
  for (const route of Object.values(manifest2.routes)) {
    if (route.preloads) route.preloads = await Promise.all(route.preloads.map(async (link) => {
      const result = normalizeTransformAssetResult(await transformFn({
        url: resolveManifestAssetLink(link).href,
        kind: "modulepreload"
      }));
      return assignManifestAssetLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.assets && !source.manifest.inlineCss) {
      for (const asset of route.assets) if (asset.tag === "link" && asset.attrs?.href) {
        const rel = asset.attrs.rel;
        if (!(typeof rel === "string" ? rel.split(/\s+/) : []).includes("stylesheet")) continue;
        const result = normalizeTransformAssetResult(await transformFn({
          url: asset.attrs.href,
          kind: "stylesheet"
        }));
        asset.attrs.href = result.href;
        if (result.crossOrigin) asset.attrs.crossOrigin = result.crossOrigin;
        else delete asset.attrs.crossOrigin;
      }
    }
  }
  const transformedClientEntry = normalizeTransformAssetResult(await transformFn({
    url: source.clientEntry,
    kind: "clientEntry"
  }));
  const rootRoute = manifest2.routes[rootRouteId] = manifest2.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  rootRoute.assets.push(buildClientEntryScriptTag(transformedClientEntry.href, source.injectedHeadScripts));
  return manifest2;
}
function buildManifestWithClientEntry(source) {
  const scriptTag = buildClientEntryScriptTag(source.clientEntry, source.injectedHeadScripts);
  const baseRootRoute = source.manifest.routes[rootRouteId];
  const routes = {
    ...source.manifest.routes,
    [rootRouteId]: {
      ...baseRootRoute,
      assets: [...baseRootRoute?.assets || [], scriptTag]
    }
  };
  return {
    inlineCss: source.manifest.inlineCss,
    routes
  };
}
var LINK_PARAM_TOKEN_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var PRELOAD_AS_VALUES = /* @__PURE__ */ new Set([
  "fetch",
  "font",
  "image",
  "script",
  "style",
  "track"
]);
function buildLinkParam(name, value) {
  if (value === void 0) return name;
  if (LINK_PARAM_TOKEN_RE.test(value)) return `${name}=${value}`;
  return `${name}=${JSON.stringify(value)}`;
}
function serializeEarlyHint(hint) {
  const parts = [`<${hint.href}>`, buildLinkParam("rel", hint.rel)];
  if (hint.as) parts.push(buildLinkParam("as", hint.as));
  if (hint.crossOrigin !== void 0) parts.push(buildLinkParam("crossorigin", hint.crossOrigin || void 0));
  if (hint.type) parts.push(buildLinkParam("type", hint.type));
  if (hint.integrity) parts.push(buildLinkParam("integrity", hint.integrity));
  if (hint.referrerPolicy) parts.push(buildLinkParam("referrerpolicy", hint.referrerPolicy));
  if (hint.fetchPriority) parts.push(buildLinkParam("fetchpriority", hint.fetchPriority));
  return parts.join("; ");
}
function getStringAttr(attrs, name, fallbackName) {
  const value = attrs?.[name] ?? (fallbackName ? attrs?.[fallbackName] : void 0);
  return typeof value === "string" ? value : void 0;
}
function getPreloadAs(attrs) {
  const as = getStringAttr(attrs, "as");
  return as && PRELOAD_AS_VALUES.has(as) ? as : void 0;
}
function addEarlyHintFetchAttrs(hint, attrs) {
  const crossOrigin = getStringAttr(attrs, "crossOrigin", "crossorigin");
  const type = getStringAttr(attrs, "type");
  const integrity = getStringAttr(attrs, "integrity");
  const referrerPolicy = getStringAttr(attrs, "referrerPolicy", "referrerpolicy");
  const fetchPriority = getStringAttr(attrs, "fetchPriority", "fetchpriority");
  if (crossOrigin !== void 0) hint.crossOrigin = crossOrigin;
  if (type) hint.type = type;
  if (integrity) hint.integrity = integrity;
  if (referrerPolicy) hint.referrerPolicy = referrerPolicy;
  if (fetchPriority) hint.fetchPriority = fetchPriority;
}
function linkAttrsToEarlyHint(attrs) {
  const href = getStringAttr(attrs, "href");
  const rel = getStringAttr(attrs, "rel");
  if (!href || !rel) return void 0;
  const relTokens = rel.split(/\s+/);
  let hintRel;
  let hintAs;
  if (relTokens.includes("modulepreload")) {
    hintRel = "modulepreload";
    hintAs = "script";
  } else if (relTokens.includes("stylesheet")) {
    hintRel = "preload";
    hintAs = "style";
  } else if (relTokens.includes("preload")) {
    hintAs = getPreloadAs(attrs);
    if (!hintAs) return void 0;
    hintRel = "preload";
  } else if (relTokens.includes("preconnect")) {
    hintRel = "preconnect";
    hintAs = void 0;
  } else if (relTokens.includes("dns-prefetch")) {
    hintRel = "dns-prefetch";
    hintAs = void 0;
  }
  if (!hintRel) return void 0;
  const hint = {
    href,
    rel: hintRel
  };
  if (hintAs) hint.as = hintAs;
  addEarlyHintFetchAttrs(hint, attrs);
  return hint;
}
function collectStaticHintsFromManifest(manifest2, matchedRoutes) {
  const hints = [];
  for (const route of matchedRoutes) {
    const routeManifest = manifest2.routes[route.id];
    if (!routeManifest) continue;
    for (const link of routeManifest.preloads ?? []) {
      const { href, crossOrigin } = resolveManifestAssetLink(link);
      const hint = {
        href,
        rel: "modulepreload",
        as: "script"
      };
      if (crossOrigin !== void 0) hint.crossOrigin = crossOrigin;
      hints.push(hint);
    }
    for (const asset of routeManifest.assets ?? []) {
      if (asset.tag !== "link") continue;
      const stylesheetHref = getStylesheetHref(asset);
      if (stylesheetHref) {
        if (manifest2.inlineCss?.styles[stylesheetHref] !== void 0) continue;
        const hint2 = {
          href: stylesheetHref,
          rel: "preload",
          as: "style"
        };
        addEarlyHintFetchAttrs(hint2, asset.attrs);
        hints.push(hint2);
        continue;
      }
      const hint = linkAttrsToEarlyHint(asset.attrs);
      if (hint) hints.push(hint);
    }
  }
  return hints;
}
function collectDynamicHintsFromMatches(matches) {
  const hints = [];
  for (const match of matches) {
    const links = match.links;
    if (!Array.isArray(links)) continue;
    for (const link of links) {
      const hint = linkAttrsToEarlyHint(link);
      if (hint) hints.push(hint);
    }
  }
  return hints;
}
function createEarlyHintsEvent(opts) {
  const nextHints = [];
  const nextLinks = [];
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.sentHints.push(hint);
    nextHints.push(hint);
    nextLinks.push(link);
  }
  if (!nextHints.length && opts.phase !== "dynamic") return void 0;
  return {
    phase: opts.phase,
    hints: nextHints,
    links: nextLinks,
    allHints: opts.sentHints.slice(),
    allLinks: Array.from(opts.sentLinks)
  };
}
function createResponseLinkHeaderEntries(opts) {
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.entries.push({
      phase: opts.phase,
      hint,
      link
    });
  }
}
function getResponseLinkHeaderEntries(opts) {
  if (!opts.filter) return opts.entries.map((entry) => entry.link);
  try {
    const links = [];
    for (const entry of opts.entries) if (opts.filter(entry)) links.push(entry.link);
    return links;
  } catch (err) {
    console.error("Error filtering response Link headers:", err);
    return [];
  }
}
var ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v2) => {
    if (typeof v2 !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v2)) return false;
    return !!v2[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn2 = async (opts, signal) => {
      return (await (await getServerFnById(functionId))(opts ?? {}, signal)).result;
    };
    return fn2;
  }
});
var tsrScript_default = "self.$_TSR={h(){this.hydrated=!0,this.c()},e(){this.streamEnded=!0,this.c()},c(){this.hydrated&&this.streamEnded&&(delete self.$_TSR,delete self.$R.tsr)},p(e){this.initialized?e():this.buffer.push(e)},buffer:[]}";
const SCOPE_ID = "tsr";
const TSR_PREFIX = GLOBAL_TSR + ".router=";
const P_PREFIX = GLOBAL_TSR + ".p(()=>";
const P_SUFFIX = ")";
function dehydrateMatch(match) {
  const dehydratedMatch = {
    i: dehydrateSsrMatchId(match.id),
    u: match.updatedAt,
    s: match.status
  };
  for (const [key, shorthand] of [
    ["__beforeLoadContext", "b"],
    ["loaderData", "l"],
    ["error", "e"],
    ["ssr", "ssr"]
  ]) if (match[key] !== void 0) dehydratedMatch[shorthand] = match[key];
  if (match.globalNotFound) dehydratedMatch.g = true;
  return dehydratedMatch;
}
const INITIAL_SCRIPTS = [dn(SCOPE_ID), tsrScript_default];
var ScriptBuffer = class {
  constructor(router) {
    this._scriptBarrierLifted = false;
    this._cleanedUp = false;
    this._pendingMicrotask = false;
    this.router = router;
    this._queue = INITIAL_SCRIPTS.slice();
  }
  enqueue(script) {
    if (this._cleanedUp) return;
    this._queue.push(script);
    if (this._scriptBarrierLifted && !this._pendingMicrotask) {
      this._pendingMicrotask = true;
      queueMicrotask(() => {
        this._pendingMicrotask = false;
        this.injectBufferedScripts();
      });
    }
  }
  liftBarrier() {
    if (this._scriptBarrierLifted || this._cleanedUp) return;
    this._scriptBarrierLifted = true;
    if (this._queue.length > 0 && !this._pendingMicrotask) {
      this._pendingMicrotask = true;
      queueMicrotask(() => {
        this._pendingMicrotask = false;
        this.injectBufferedScripts();
      });
    }
  }
  /**
  * Flushes any pending scripts synchronously.
  * Call this before emitting onSerializationFinished to ensure all scripts are injected.
  *
  * IMPORTANT: Only injects if the barrier has been lifted. Before the barrier is lifted,
  * scripts should remain in the queue so takeBufferedScripts() can retrieve them
  */
  flush() {
    if (!this._scriptBarrierLifted) return;
    if (this._cleanedUp) return;
    this._pendingMicrotask = false;
    const scriptsToInject = this.takeAll();
    if (scriptsToInject && this.router?.serverSsr) this.router.serverSsr.injectScript(scriptsToInject);
  }
  takeAll() {
    const bufferedScripts = this._queue;
    this._queue = [];
    if (bufferedScripts.length === 0) return;
    if (bufferedScripts.length === 1) return bufferedScripts[0] + ";document.currentScript.remove()";
    return bufferedScripts.join(";") + ";document.currentScript.remove()";
  }
  injectBufferedScripts() {
    if (this._cleanedUp) return;
    if (this._queue.length === 0) return;
    const scriptsToInject = this.takeAll();
    if (scriptsToInject && this.router?.serverSsr) this.router.serverSsr.injectScript(scriptsToInject);
  }
  cleanup() {
    this._cleanedUp = true;
    this._queue = [];
    this.router = void 0;
  }
};
const MANIFEST_CACHE_SIZE = 100;
const manifestCaches = /* @__PURE__ */ new WeakMap();
const inlineCssCaches = /* @__PURE__ */ new WeakMap();
function getManifestCache(manifest2) {
  const cache = manifestCaches.get(manifest2);
  if (cache) return cache;
  const newCache = createLRUCache(MANIFEST_CACHE_SIZE);
  manifestCaches.set(manifest2, newCache);
  return newCache;
}
function getInlineCssCache(manifest2) {
  const cache = inlineCssCaches.get(manifest2);
  if (cache) return cache;
  const newCache = createLRUCache(MANIFEST_CACHE_SIZE);
  inlineCssCaches.set(manifest2, newCache);
  return newCache;
}
function getInlineCssHrefsForMatches(manifest2, matches) {
  const styles = manifest2?.inlineCss?.styles;
  if (!styles) return [];
  const seen = /* @__PURE__ */ new Set();
  const hrefs = [];
  for (const match of matches) {
    const assets = manifest2?.routes[match.routeId]?.assets ?? [];
    for (const asset of assets) {
      const href = getStylesheetHref(asset);
      if (!href || seen.has(href) || styles[href] === void 0) continue;
      seen.add(href);
      hrefs.push(href);
    }
  }
  return hrefs;
}
function getInlineCssForHrefs(manifest2, hrefs) {
  const styles = manifest2.inlineCss?.styles;
  if (!styles || hrefs.length === 0) return void 0;
  const cacheKey = hrefs.join("\0");
  {
    const cached = getInlineCssCache(manifest2).get(cacheKey);
    if (cached !== void 0) return cached;
  }
  const css = hrefs.map((href) => styles[href]).join("");
  getInlineCssCache(manifest2).set(cacheKey, css);
  return css;
}
function getInlineCssAssetForMatches(manifest2, matches) {
  if (!manifest2?.inlineCss) return void 0;
  const css = getInlineCssForHrefs(manifest2, getInlineCssHrefsForMatches(manifest2, matches));
  return css === void 0 ? void 0 : createInlineCssStyleAsset(css);
}
function stripInlinedStylesheetAssets(manifest2, routes, matches) {
  if (!manifest2.inlineCss) return routes;
  const nextRoutes = {};
  for (const [routeId, route] of Object.entries(routes)) {
    const assets = route.assets?.filter((asset) => !isInlinableStylesheet(manifest2, asset));
    const nextRoute = { ...route };
    if (assets) if (assets.length > 0) nextRoute.assets = assets;
    else delete nextRoute.assets;
    nextRoutes[routeId] = nextRoute;
  }
  if (getInlineCssAssetForMatches(manifest2, matches)) {
    const rootRoute = nextRoutes["__root__"] ?? {};
    nextRoutes[rootRouteId] = {
      ...rootRoute,
      assets: [createInlineCssPlaceholderAsset(), ...rootRoute.assets ?? []]
    };
  }
  return nextRoutes;
}
function attachRouterServerSsrUtils({ router, manifest: manifest2, getRequestAssets, includeUnmatchedRouteAssets = true }) {
  router.ssr = { get manifest() {
    const requestAssets = getRequestAssets?.();
    const inlineCssAsset = getInlineCssAssetForMatches(manifest2, router.stores.matches.get());
    if (!requestAssets?.length && !inlineCssAsset) return manifest2;
    return {
      ...manifest2,
      routes: {
        ...manifest2?.routes,
        [rootRouteId]: {
          ...manifest2?.routes?.[rootRouteId],
          assets: [
            ...requestAssets ?? [],
            ...inlineCssAsset ? [inlineCssAsset] : [],
            ...manifest2?.routes?.["__root__"]?.assets ?? []
          ]
        }
      }
    };
  } };
  let _dehydrated = false;
  let _serializationFinished = false;
  const renderFinishedListeners = [];
  const serializationFinishedListeners = [];
  const scriptBuffer = new ScriptBuffer(router);
  let injectedHtmlBuffer = "";
  router.serverSsr = {
    injectHtml: (html) => {
      if (!html) return;
      injectedHtmlBuffer += html;
      router.emit({ type: "onInjectedHtml" });
    },
    injectScript: (script) => {
      if (!script) return;
      const html = `<script${router.options.ssr?.nonce ? ` nonce='${router.options.ssr.nonce}'` : ""}>${script}<\/script>`;
      router.serverSsr.injectHtml(html);
    },
    dehydrate: async (opts) => {
      if (_dehydrated) {
        invariant();
      }
      let matchesToDehydrate = router.stores.matches.get();
      if (router.isShell()) matchesToDehydrate = matchesToDehydrate.slice(0, 1);
      const matches = matchesToDehydrate.map(dehydrateMatch);
      let manifestToDehydrate = void 0;
      if (manifest2) {
        const currentRouteIdsList = matchesToDehydrate.map((m2) => m2.routeId);
        const manifestCacheKey = `${currentRouteIdsList.join("\0")}\0includeUnmatchedRouteAssets=${includeUnmatchedRouteAssets}`;
        let filteredRoutes;
        filteredRoutes = getManifestCache(manifest2).get(manifestCacheKey);
        if (!filteredRoutes) {
          const currentRouteIds = new Set(currentRouteIdsList);
          const nextFilteredRoutes = {};
          for (const routeId in manifest2.routes) {
            const routeManifest = manifest2.routes[routeId];
            if (currentRouteIds.has(routeId)) nextFilteredRoutes[routeId] = routeManifest;
            else if (includeUnmatchedRouteAssets && routeManifest.assets && routeManifest.assets.length > 0) nextFilteredRoutes[routeId] = { assets: routeManifest.assets };
          }
          filteredRoutes = stripInlinedStylesheetAssets(manifest2, nextFilteredRoutes, matchesToDehydrate);
          getManifestCache(manifest2).set(manifestCacheKey, filteredRoutes);
        }
        manifestToDehydrate = { routes: { ...filteredRoutes } };
        if (opts?.requestAssets?.length) {
          const existingRoot = manifestToDehydrate.routes[rootRouteId];
          manifestToDehydrate.routes[rootRouteId] = {
            ...existingRoot,
            assets: [...opts.requestAssets, ...existingRoot?.assets ?? []]
          };
        }
      }
      const dehydratedRouter = {
        manifest: manifestToDehydrate,
        matches
      };
      const lastMatchId = matchesToDehydrate[matchesToDehydrate.length - 1]?.id;
      if (lastMatchId) dehydratedRouter.lastMatchId = dehydrateSsrMatchId(lastMatchId);
      const dehydratedData = await router.options.dehydrate?.();
      if (dehydratedData) dehydratedRouter.dehydratedData = dehydratedData;
      _dehydrated = true;
      const trackPlugins = { didRun: false };
      const serializationAdapters = router.options.serializationAdapters;
      const plugins = serializationAdapters ? serializationAdapters.map((t) => /* @__PURE__ */ makeSsrSerovalPlugin(t, trackPlugins)).concat(defaultSerovalPlugins) : defaultSerovalPlugins;
      const signalSerializationComplete = () => {
        _serializationFinished = true;
        try {
          serializationFinishedListeners.forEach((l) => l());
          router.emit({ type: "onSerializationFinished" });
        } catch (err) {
          console.error("Serialization listener error:", err);
        } finally {
          serializationFinishedListeners.length = 0;
          renderFinishedListeners.length = 0;
        }
      };
      Sn(dehydratedRouter, {
        refs: /* @__PURE__ */ new Map(),
        plugins,
        onSerialize: (data, initial) => {
          let serialized = initial ? TSR_PREFIX + data : data;
          if (trackPlugins.didRun) serialized = P_PREFIX + serialized + P_SUFFIX;
          scriptBuffer.enqueue(serialized);
        },
        onError: (err) => {
          console.error("Serialization error:", err);
          if (err && err.stack) console.error(err.stack);
          signalSerializationComplete();
        },
        scopeId: SCOPE_ID,
        onDone: () => {
          scriptBuffer.enqueue(GLOBAL_TSR + ".e()");
          scriptBuffer.flush();
          signalSerializationComplete();
        }
      });
    },
    isDehydrated() {
      return _dehydrated;
    },
    isSerializationFinished() {
      return _serializationFinished;
    },
    onRenderFinished: (listener) => renderFinishedListeners.push(listener),
    onSerializationFinished: (listener) => serializationFinishedListeners.push(listener),
    setRenderFinished: () => {
      try {
        renderFinishedListeners.forEach((l) => l());
      } catch (err) {
        console.error("Error in render finished listener:", err);
      } finally {
        renderFinishedListeners.length = 0;
      }
      scriptBuffer.liftBarrier();
    },
    takeBufferedScripts() {
      const scripts = scriptBuffer.takeAll();
      return {
        tag: "script",
        attrs: {
          nonce: router.options.ssr?.nonce,
          className: "$tsr",
          id: TSR_SCRIPT_BARRIER_ID
        },
        children: scripts
      };
    },
    liftScriptBarrier() {
      scriptBuffer.liftBarrier();
    },
    takeBufferedHtml() {
      if (!injectedHtmlBuffer) return;
      const buffered = injectedHtmlBuffer;
      injectedHtmlBuffer = "";
      return buffered;
    },
    cleanup() {
      if (!router.serverSsr) return;
      renderFinishedListeners.length = 0;
      serializationFinishedListeners.length = 0;
      injectedHtmlBuffer = "";
      scriptBuffer.cleanup();
      router.serverSsr = void 0;
    }
  };
}
function getOrigin(request) {
  try {
    return new URL(request.url).origin;
  } catch {
  }
  return "http://localhost";
}
function getNormalizedURL(url, base) {
  if (typeof url === "string") url = url.replace("\\", "%5C");
  const rawUrl = new URL(url, base);
  const { path: decodedPathname, handledProtocolRelativeURL } = decodePath(rawUrl.pathname);
  const searchParams = new URLSearchParams(rawUrl.search);
  const normalizedHref = decodedPathname + (searchParams.size > 0 ? "?" : "") + searchParams.toString() + rawUrl.hash;
  return {
    url: new URL(normalizedHref, rawUrl.origin),
    handledProtocolRelativeURL
  };
}
function getStartResponseHeaders(opts) {
  return mergeHeaders({ "Content-Type": "text/html; charset=utf-8" }, ...opts.router.stores.matches.get().map((match) => {
    return match.headers;
  }));
}
function notifyEarlyHints(phase, event, onEarlyHints) {
  try {
    const result = onEarlyHints(event);
    if (result) Promise.resolve(result).catch((err) => {
      console.error(`Error sending ${phase} early hints:`, err);
    });
  } catch (err) {
    console.error(`Error sending ${phase} early hints:`, err);
  }
}
function getResponseLinkHeaderFilter(responseLinkHeader) {
  if (typeof responseLinkHeader !== "object") return;
  return responseLinkHeader.filter;
}
function appendResponseLinkHeaders(opts) {
  if (!opts.filter) {
    for (const entry of opts.entries) opts.responseHeaders.append("Link", entry.link);
    return;
  }
  const links = getResponseLinkHeaderEntries(opts);
  for (const link of links) opts.responseHeaders.append("Link", link);
}
function collectResponseLinkHeaderEntries(opts) {
  for (let index2 = 0; index2 < opts.event.hints.length; index2++) opts.entries.push({
    phase: opts.phase,
    hint: opts.event.hints[index2],
    link: opts.event.links[index2]
  });
}
function handleCollectedEarlyHints(opts) {
  const event = opts.onEarlyHints ? createEarlyHintsEvent({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    sentHints: opts.sentHints
  }) : void 0;
  if (event) notifyEarlyHints(opts.phase, event, opts.onEarlyHints);
  if (!opts.responseLinkHeaderEntries) return;
  if (event) {
    collectResponseLinkHeaderEntries({
      phase: opts.phase,
      event,
      entries: opts.responseLinkHeaderEntries
    });
    return;
  }
  createResponseLinkHeaderEntries({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    entries: opts.responseLinkHeaderEntries
  });
}
var entriesPromise;
var baseManifestPromise;
var cachedFinalManifestPromise;
async function loadEntries() {
  const [routerEntry, startEntry, pluginAdapters] = await Promise.all([
    import("./router-BtgGywEC.mjs").then((n2) => n2.a4),
    import("./start-CL4TovwU.mjs"),
    import("../__23tanstack-start-plugin-adapters-Cwee5PKy.mjs")
  ]);
  return {
    routerEntry,
    startEntry,
    pluginAdapters
  };
}
function getEntries() {
  if (!entriesPromise) entriesPromise = loadEntries();
  return entriesPromise;
}
function getBaseManifest(matchedRoutes) {
  if (!baseManifestPromise) baseManifestPromise = getStartManifest();
  return baseManifestPromise;
}
async function resolveManifest(matchedRoutes, transformFn, cache) {
  const base = await getBaseManifest();
  const computeFinalManifest = async () => {
    return transformFn ? await transformManifestAssets(base, transformFn) : buildManifestWithClientEntry(base);
  };
  if (!transformFn || cache) {
    if (!cachedFinalManifestPromise) cachedFinalManifestPromise = computeFinalManifest();
    return cachedFinalManifestPromise;
  }
  return computeFinalManifest();
}
var ROUTER_BASEPATH = "/";
var SERVER_FN_BASE = "/_serverFn/";
var IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
var IS_SHELL_ENV = process.env.TSS_SHELL === "true";
var ERR_NO_RESPONSE = "Internal Server Error";
var ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSpecialResponse(result)) return { response: result };
  return result;
}
function executeMiddleware(middlewares, ctx) {
  let index2 = -1;
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      for (const key of Object.keys(nextCtx)) if (key !== "context") ctx[key] = nextCtx[key];
    }
    index2++;
    const middleware = middlewares[index2];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({
        ...ctx,
        next
      });
    } catch (err) {
      if (isSpecialResponse(err)) {
        ctx.response = err;
        return ctx;
      }
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) ctx.response = normalized.response;
      if (normalized.context) ctx.context = safeObjectMerge(ctx.context, normalized.context);
    }
    return ctx;
  };
  return next();
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) return handler;
  return async (ctx) => {
    const response = await handler({
      ...ctx,
      next: throwIfMayNotDefer
    });
    if (!response) throwRouteHandlerError();
    return response;
  };
}
function createStartHandler(cbOrOptions) {
  const cb = typeof cbOrOptions === "function" ? cbOrOptions : cbOrOptions.handler;
  const transformAssetsOption = typeof cbOrOptions === "function" ? void 0 : cbOrOptions.transformAssets;
  const transformAssetUrlsOption = typeof cbOrOptions === "function" ? void 0 : cbOrOptions.transformAssetUrls;
  const transformOption = transformAssetsOption !== void 0 ? resolveTransformAssetsConfig(transformAssetsOption) : transformAssetUrlsOption !== void 0 ? resolveTransformAssetsConfig(adaptTransformAssetUrlsConfigToTransformAssets(transformAssetUrlsOption)) : void 0;
  const warmupTransformManifest = !!transformAssetsOption && typeof transformAssetsOption === "object" && "warmup" in transformAssetsOption && transformAssetsOption.warmup === true || !!transformAssetUrlsOption && typeof transformAssetUrlsOption === "object" && transformAssetUrlsOption.warmup === true;
  const resolvedTransformConfig = transformOption;
  const cache = resolvedTransformConfig ? resolvedTransformConfig.cache : true;
  const shouldCacheCreateTransform = cache && true;
  let cachedCreateTransformPromise;
  const getTransformFn = async (opts) => {
    if (!resolvedTransformConfig) return void 0;
    if (resolvedTransformConfig.type === "createTransform") {
      if (shouldCacheCreateTransform) {
        if (!cachedCreateTransformPromise) cachedCreateTransformPromise = Promise.resolve(resolvedTransformConfig.createTransform(opts)).catch((error) => {
          cachedCreateTransformPromise = void 0;
          throw error;
        });
        return cachedCreateTransformPromise;
      }
      return resolvedTransformConfig.createTransform(opts);
    }
    return resolvedTransformConfig.transformFn;
  };
  if (warmupTransformManifest && cache && true && !cachedFinalManifestPromise) {
    const warmupPromise = (async () => {
      const base = await getBaseManifest();
      const transformFn = await getTransformFn({ warmup: true });
      return transformFn ? await transformManifestAssets(base, transformFn) : buildManifestWithClientEntry(base);
    })();
    cachedFinalManifestPromise = warmupPromise;
    warmupPromise.catch(() => {
      if (cachedFinalManifestPromise === warmupPromise) cachedFinalManifestPromise = void 0;
      cachedCreateTransformPromise = void 0;
    });
  }
  const startRequestResolver = async (request, requestOpts) => {
    let router = null;
    let cbWillCleanup = false;
    try {
      const { url, handledProtocolRelativeURL } = getNormalizedURL(request.url);
      const href = url.pathname + url.search + url.hash;
      const origin = getOrigin(request);
      if (handledProtocolRelativeURL) return Response.redirect(url, 308);
      const entries = await getEntries();
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const { hasPluginAdapters, pluginSerializationAdapters } = entries.pluginAdapters;
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ...hasPluginAdapters ? pluginSerializationAdapters : [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        serializationAdapters
      };
      const flattenedRequestMiddlewares = startOptions.requestMiddleware ? flattenMiddlewares(startOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(flattenedRequestMiddlewares);
      const getRouter = async () => {
        if (router) return router;
        router = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        const history = createMemoryHistory({ initialEntries: [href] });
        router.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router.options.origin ?? origin,
          defaultSsr: requestStartOptions.defaultSsr,
          serializationAdapters: [...requestStartOptions.serializationAdapters, ...router.options.serializationAdapters || []],
          basepath: ROUTER_BASEPATH
        });
        return router;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) throw new Error("Invalid server action param for serverFnId");
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext({
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares,
            handlerType: "serverFn"
          }, () => handleServerAction({
            request,
            context: requestOpts?.context,
            serverFnId
          }));
        };
        return handleRedirectResponse((await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), serverFnHandler], {
          request,
          pathname: url.pathname,
          context: createNullProtoObject(requestOpts?.context)
        })).response, request, getRouter);
      }
      const executeRouter = async (serverContext, matchedRoutes) => {
        const acceptParts = (request.headers.get("Accept") || "*/*").split(",");
        if (!["*/*", "text/html"].some((mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType)))) return Response.json({ error: "Only HTML requests are supported here" }, { status: 500 });
        const manifest2 = await resolveManifest(matchedRoutes, await getTransformFn({
          warmup: false,
          request
        }), cache);
        const onEarlyHints = requestOpts?.onEarlyHints;
        const responseLinkHeader = requestOpts?.responseLinkHeader;
        const shouldCollectEarlyHints = !!onEarlyHints || !!responseLinkHeader;
        const sentEarlyHintLinks = shouldCollectEarlyHints ? /* @__PURE__ */ new Set() : void 0;
        const sentEarlyHints = onEarlyHints ? new Array() : void 0;
        const responseLinkHeaderEntries = shouldCollectEarlyHints && responseLinkHeader ? new Array() : void 0;
        const responseLinkHeaderFilter = shouldCollectEarlyHints ? getResponseLinkHeaderFilter(responseLinkHeader) : void 0;
        if (shouldCollectEarlyHints && sentEarlyHintLinks && matchedRoutes?.length) handleCollectedEarlyHints({
          phase: "static",
          hints: collectStaticHintsFromManifest(manifest2, matchedRoutes),
          sentLinks: sentEarlyHintLinks,
          sentHints: sentEarlyHints,
          onEarlyHints,
          responseLinkHeaderEntries
        });
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2,
          getRequestAssets: () => getStartContext({ throwIfNotFound: false })?.requestAssets,
          includeUnmatchedRouteAssets: false
        });
        routerInstance.update({ additionalContext: { serverContext } });
        await routerInstance.load();
        if (routerInstance.state.redirect) return routerInstance.state.redirect;
        if (shouldCollectEarlyHints && sentEarlyHintLinks) handleCollectedEarlyHints({
          phase: "dynamic",
          hints: collectDynamicHintsFromMatches(routerInstance.stores.matches.get()),
          sentLinks: sentEarlyHintLinks,
          sentHints: sentEarlyHints,
          onEarlyHints,
          responseLinkHeaderEntries
        });
        const ctx = getStartContext({ throwIfNotFound: false });
        await routerInstance.serverSsr.dehydrate({ requestAssets: ctx?.requestAssets });
        const responseHeaders = getStartResponseHeaders({ router: routerInstance });
        if (responseLinkHeaderEntries?.length) appendResponseLinkHeaders({
          responseHeaders,
          entries: responseLinkHeaderEntries,
          filter: responseLinkHeaderFilter
        });
        cbWillCleanup = true;
        return cb({
          request,
          router: routerInstance,
          responseHeaders
        });
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext({
          getRouter,
          startOptions: requestStartOptions,
          contextAfterGlobalMiddlewares: context,
          request,
          executedRequestMiddlewares,
          handlerType: "router"
        }, async () => {
          try {
            return await handleServerRoutes({
              getRouter,
              request,
              url,
              executeRouter,
              context,
              executedRequestMiddlewares
            });
          } catch (err) {
            if (err instanceof Response) return err;
            throw err;
          }
        });
      };
      return handleRedirectResponse((await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), requestHandlerMiddleware], {
        request,
        pathname: url.pathname,
        context: createNullProtoObject(requestOpts?.context)
      })).response, request, getRouter);
    } finally {
      if (router && !cbWillCleanup) router.serverSsr?.cleanup();
      router = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  if (!isRedirect(response)) return response;
  if (isResolvedRedirect(response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") return Response.json({
      ...response.options,
      isSerializedRedirect: true
    }, { headers: response.headers });
    return response;
  }
  const opts = response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`);
  if ([
    "params",
    "search",
    "hash"
  ].some((d) => typeof opts[d] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(opts).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`);
  const redirect2 = (await getRouter()).resolveRedirect(response);
  if (request.headers.get("x-tsr-serverFn") === "true") return Response.json({
    ...response.options,
    isSerializedRedirect: true
  }, { headers: response.headers });
  return redirect2;
}
async function handleServerRoutes({ getRouter, request, url, executeRouter, context, executedRequestMiddlewares }) {
  const router = await getRouter();
  const pathname = executeRewriteInput(router.rewrite, url).pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m2 of flattened) if (!executedRequestMiddlewares.has(m2)) routeMiddlewares.push(m2.options.server);
    }
  }
  const server2 = foundRoute?.options.server;
  let isHeadFallback = false;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const requestMethod = request.method.toUpperCase();
    const handler = requestMethod === "HEAD" ? handlers["HEAD"] ?? handlers["GET"] ?? handlers["ANY"] : handlers[requestMethod] ?? handlers["ANY"];
    isHeadFallback = requestMethod === "HEAD" && handler !== void 0 && !handlers["HEAD"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m2 of handlerMiddlewares) routeMiddlewares.push(m2.options.server);
        }
        if (handler.handler) routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
      }
    }
  }
  routeMiddlewares.push((ctx2) => executeRouter(ctx2.context, matchedRoutes));
  const ctx = await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname
  });
  if (isHeadFallback) {
    if (!ctx.response) throwRouteHandlerError();
    const resolved = await handleRedirectResponse(ctx.response, request, getRouter);
    return new Response(null, resolved);
  }
  return ctx.response;
}
var fetch$1 = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return { async fetch(...args) {
    return await entry.fetch(...args);
  } };
}
var server_default = createServerEntry({ fetch: fetch$1 });
const server$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createServerEntry,
  default: server_default
}, Symbol.toStringTag, { value: "Module" }));
const vendorTanstackBx28QoPv = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  a: createSsrRpc,
  b: createServerRpc,
  c: createServerFn,
  d: createStart,
  e: createMiddleware,
  s: server$1
});
let lastCapturedError;
const TTL_MS = 5e3;
function record(error) {
  lastCapturedError = { error, at: Date.now() };
}
if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event.error ?? event));
  globalThis.addEventListener(
    "unhandledrejection",
    (event) => record(event.reason)
  );
}
function consumeLastCapturedError() {
  if (!lastCapturedError) return void 0;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = void 0;
    return void 0;
  }
  const { error } = lastCapturedError;
  lastCapturedError = void 0;
  return error;
}
function getSupabasePublicEnv() {
  const viteUrl = "https://wcdwlqnfcsuaacbvdmgx.supabase.co";
  const viteAnonKey = "sb_publishable_UnUWy7-FW9UqH_y0l0wEDQ_B7yw8W64";
  {
    return { url: viteUrl, anonKey: viteAnonKey, source: "vite" };
  }
}
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const PUBLIC_PROFILE_UID_PATTERN = /^[0-9]{16}$/;
const TREY_PUBLIC_PROFILE_UID_PATTERN = /^423[0-9]{13}$/;
const validateFinalizeInput = (input) => {
  const method = ["voice", "manual", "import_screenshot"].includes(input?.method) ? input.method : void 0;
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    method
  };
};
const validateChooseOnboardingMethodInput = (input) => {
  const method = input?.method === "voice" || input?.method === "manual" ? input.method : "manual";
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    method
  };
};
const validateSaveOnboardingProfileInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  fields: input?.fields && typeof input.fields === "object" && !Array.isArray(input.fields) ? input.fields : {}
});
function cleanText$1(value, max = 500) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}
function cleanProfileUsername(value) {
  return cleanText$1(value, 80).toLowerCase().replace(/^@/, "").replace(/\s+underscore\s+/g, "_").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30);
}
function cleanHandle(value) {
  return cleanText$1(value, 80).replace(/^@/, "").replace(/\s+/g, "").replace(/[^\w.-]/g, "");
}
function cleanBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === null || typeof value === "undefined") return fallback;
  const text = cleanText$1(value, 20).toLowerCase();
  if (["yes", "true", "on", "show", "public", "visible", "allow"].includes(text)) return true;
  if (["no", "false", "off", "hide", "private", "hidden", "deny"].includes(text)) return false;
  return fallback;
}
function cleanList(value) {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => cleanText$1(item, 40)).filter(Boolean))).slice(0, 12);
  }
  return cleanText$1(value, 800).split(/,|\band\b|\n/i).map((item) => item.trim()).filter(Boolean).slice(0, 12);
}
function socialLinksFrom(input) {
  const links = {};
  const instagram = cleanHandle(input.instagram);
  const tiktok = cleanHandle(input.tiktok);
  const youtube = cleanText$1(input.youtube, 300);
  const x3 = cleanHandle(input.x_handle);
  if (instagram) links.instagram = instagram;
  if (tiktok) links.tiktok = tiktok;
  if (youtube) links.youtube = youtube;
  if (x3) links.x = x3;
  return links;
}
function sanitizeSafeProfileFields(fields, options = {}) {
  const updates = {};
  const displayName = cleanText$1(fields.display_name ?? fields.name, 50);
  if (displayName) {
    if (displayName.length < 2) throw new Error("Display name must be at least 2 characters");
    updates.display_name = displayName;
  }
  const usernameInput = fields.username;
  if (typeof usernameInput !== "undefined" && usernameInput !== null && cleanText$1(usernameInput, 80)) {
    const username = cleanProfileUsername(usernameInput);
    if (!USERNAME_PATTERN.test(username)) {
      throw new Error("Use 3-30 lowercase letters, numbers, or underscores");
    }
    updates.username = username;
  }
  const bio = cleanText$1(fields.bio, 160);
  if (bio) updates.bio = bio;
  const location = cleanText$1(fields.location, 50);
  if (location) updates.location = location;
  const rawDob = cleanText$1(fields.date_of_birth, 20);
  if (rawDob && /^\d{4}-\d{2}-\d{2}$/.test(rawDob)) updates.date_of_birth = rawDob;
  const categories2 = cleanList(fields.favorite_categories);
  if (categories2.length) updates.favorite_categories = categories2;
  const moods = cleanList(fields.favorite_moods);
  if (moods.length) updates.favorite_moods = moods;
  const contentFrequency = cleanText$1(fields.content_frequency, 40);
  if (contentFrequency) {
    if (!["daily", "weekly", "only_drops"].includes(contentFrequency)) {
      throw new Error("Unsupported content frequency");
    }
    updates.content_frequency = contentFrequency;
  }
  const fanType = cleanText$1(fields.fan_type, 40);
  if (fanType) {
    if (!["viewer", "trizfit", "creator", "supporter", "superfan"].includes(fanType)) {
      throw new Error("Unsupported profile type");
    }
    updates.fan_type = fanType;
  }
  const profileVisibility = cleanText$1(fields.profile_visibility, 40);
  if (profileVisibility) {
    if (!["public", "members_only", "private"].includes(profileVisibility)) {
      throw new Error("Unsupported profile visibility");
    }
    updates.profile_visibility = profileVisibility;
  }
  if (typeof fields.show_location !== "undefined") updates.show_location = cleanBoolean(fields.show_location, true);
  if (typeof fields.show_birthday !== "undefined") updates.show_birthday = cleanBoolean(fields.show_birthday, false);
  if (typeof fields.show_top_three !== "undefined") updates.show_top_three = cleanBoolean(fields.show_top_three, true);
  if (typeof fields.allow_top_three_adds !== "undefined") {
    updates.allow_top_three_adds = cleanBoolean(fields.allow_top_three_adds, true);
  }
  const socialLinks = socialLinksFrom(fields);
  if (Object.keys(socialLinks).length > 0) updates.social_links = socialLinks;
  if (options.requireBasics) {
    if (!updates.display_name) throw new Error("Display name is required");
    if (!updates.username) throw new Error("Username is required");
  }
  return updates;
}
function getUserClient(accessToken) {
  const token2 = accessToken.trim();
  if (!token2) {
    throw new Error("Sign in required");
  }
  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) {
    throw new Error("Supabase is not configured");
  }
  return createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token2}`
      }
    }
  });
}
async function verifyTreyIUser(accessToken) {
  const token2 = accessToken.trim();
  const supabase = getUserClient(token2);
  const {
    data: {
      user
    },
    error
  } = await supabase.auth.getUser(token2);
  if (error || !user) {
    throw new Error("Sign in required");
  }
  return {
    supabase,
    user: {
      email: user.email ?? null,
      id: user.id
    }
  };
}
function getTreyIServiceClient() {
  const supabaseEnv = getSupabasePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseEnv || !serviceKey) {
    throw new Error("Trey-I server storage is not configured");
  }
  return createClient(supabaseEnv.url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
function generateFallbackPublicProfileUid() {
  const suffix = Array.from({
    length: 13
  }, () => Math.floor(Math.random() * 10)).join("");
  return `423${suffix}`;
}
async function ensurePublicProfileUid(userId) {
  const supabase = getTreyIServiceClient();
  const {
    data: existing,
    error: existingError
  } = await supabase.from("profiles").select("site_uid, public_profile_uid").eq("id", userId).maybeSingle();
  if (existingError) {
    throw new Error(existingError.message);
  }
  if (!existing) {
    const publicUid = generateFallbackPublicProfileUid();
    const {
      error: error2
    } = await supabase.from("profiles").upsert({
      id: userId,
      public_profile_uid: publicUid,
      site_uid: publicUid,
      role: "user"
    }, {
      onConflict: "id"
    });
    if (error2) throw new Error(error2.message);
    return ensurePublicProfileUid(userId);
  }
  const existingPublicUid = cleanText$1(existing?.public_profile_uid, 32);
  const existingSiteUid = cleanText$1(existing?.site_uid, 32);
  const existingValidUid = PUBLIC_PROFILE_UID_PATTERN.test(existingPublicUid) ? existingPublicUid : PUBLIC_PROFILE_UID_PATTERN.test(existingSiteUid) ? existingSiteUid : "";
  if (existingValidUid) {
    const {
      error: error2
    } = await supabase.from("profiles").update({
      public_profile_uid: existingValidUid,
      site_uid: existingValidUid
    }).eq("id", userId);
    if (error2) throw new Error(error2.message);
    return existingValidUid;
  }
  let candidate = "";
  const {
    data: generatedUid,
    error: rpcError
  } = await supabase.rpc("generate_trey_public_profile_uid");
  if (!rpcError && typeof generatedUid === "string" && TREY_PUBLIC_PROFILE_UID_PATTERN.test(generatedUid)) {
    candidate = generatedUid;
  }
  for (let attempt = 0; !candidate && attempt < 10; attempt += 1) {
    const possibleUid = generateFallbackPublicProfileUid();
    const {
      data: collision
    } = await supabase.from("profiles").select("id").or(`site_uid.eq.${possibleUid},public_profile_uid.eq.${possibleUid}`).maybeSingle();
    if (!collision) candidate = possibleUid;
  }
  if (!candidate) return null;
  const {
    data,
    error
  } = await supabase.from("profiles").update({
    public_profile_uid: candidate,
    site_uid: candidate
  }).eq("id", userId).select("public_profile_uid").single();
  if (error) {
    throw new Error(error.message);
  }
  return data?.public_profile_uid ?? null;
}
async function ensureCompletedAccountPersistence(userId, publicProfileUid) {
  const supabase = getTreyIServiceClient();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const profilePatch = {
    id: userId,
    public_profile_uid: publicProfileUid,
    site_uid: publicProfileUid,
    onboarding_completed: true,
    onboarding_status: "completed",
    updated_at: now
  };
  const {
    error: profileError
  } = await supabase.from("profiles").upsert(profilePatch, {
    onConflict: "id"
  });
  if (profileError) throw new Error(profileError.message);
  const {
    error: prefError
  } = await supabase.from("user_preferences").upsert({
    user_id: userId,
    public_profile_uid: publicProfileUid,
    updated_at: now
  }, {
    onConflict: "user_id"
  });
  if (prefError) throw new Error(prefError.message);
  const {
    error: creditError
  } = await supabase.from("community_credit_balances").upsert({
    user_id: userId,
    public_profile_uid: publicProfileUid,
    updated_at: now
  }, {
    onConflict: "user_id"
  });
  if (creditError) throw new Error(creditError.message);
}
async function assertUsernameAvailable(supabase, username, userId) {
  const {
    data: usernameOwner,
    error
  } = await supabase.from("profiles").select("id").ilike("username", username).neq("id", userId).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (usernameOwner) {
    throw new Error("That username is already taken");
  }
}
async function saveProfileFieldsForUser(accessToken, fields, options = {}) {
  const {
    supabase,
    user
  } = await verifyTreyIUser(accessToken);
  const updates = sanitizeSafeProfileFields(fields, {
    requireBasics: options.requireBasics
  });
  if (updates.username) {
    await assertUsernameAvailable(supabase, updates.username, user.id);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const profileUpdates = {
    ...updates,
    onboarding_last_saved_at: now,
    updated_at: now
  };
  let publicProfileUid = null;
  if (options.complete) {
    publicProfileUid = await ensurePublicProfileUid(user.id);
    if (!publicProfileUid) {
      throw new Error("Your public profile link is not ready yet. Please try finishing setup again.");
    }
    profileUpdates.public_profile_uid = publicProfileUid;
    profileUpdates.site_uid = publicProfileUid;
    profileUpdates.onboarding_completed = true;
    profileUpdates.onboarding_status = "completed";
    profileUpdates.onboarding_completed_at = now;
    profileUpdates.account_setup_completed_at = now;
    profileUpdates.onboarding_method = options.method ?? "manual";
  } else {
    profileUpdates.onboarding_status = "in_progress";
    if (options.method) profileUpdates.onboarding_method = options.method;
  }
  const {
    error
  } = await supabase.from("profiles").update(profileUpdates).eq("id", user.id);
  if (error) {
    throw new Error(error.message);
  }
  if (options.complete) {
    if (!publicProfileUid) {
      throw new Error("Your public profile link is not ready yet. Please try finishing setup again.");
    }
    await ensureCompletedAccountPersistence(user.id, publicProfileUid);
    await supabase.from("user_onboarding").upsert({
      user_id: user.id,
      current_step: 99,
      selected_path: options.method === "voice" ? "voice_profile_setup" : "profile_setup",
      answers: {
        ...updates,
        public_profile_uid: publicProfileUid
      },
      completed: true,
      updated_at: now
    }, {
      onConflict: "user_id"
    }).then(() => void 0);
  }
  return {
    publicProfileUid,
    userId: user.id
  };
}
createServerFn({
  method: "POST"
}).inputValidator(validateChooseOnboardingMethodInput).handler(createSsrRpc("158d5275b118404c6378c88b6bbc169c097dd89e1e74e7566f776cd1160aa210"));
const saveOnboardingProfile = createServerFn({
  method: "POST"
}).inputValidator(validateSaveOnboardingProfileInput).handler(createSsrRpc("fb0adceaa37358e61cbaee59ae5cad610e70c9f11a784fd1e737be5bce2e6436"));
const finalizeOnboarding = createServerFn({
  method: "POST"
}).inputValidator(validateFinalizeInput).handler(createSsrRpc("ad1bda8976de22f0ab9942c4b3e01863d0a7b6d223b682eaa4f514bc67151af3"));
const treyICheckUsername = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  username: typeof input?.username === "string" ? input.username : ""
})).handler(createSsrRpc("44b7ca2ab9f6c0db3ecdd5c41d9577de228d125fbdbe6d300bb4eaa221bd60d2"));
const ACCESS_TOKEN_SECONDS$1 = 60 * 60;
const REFRESH_TOKEN_SECONDS = 60 * 60 * 24 * 30;
const TOKEN_PREFIX = "treytv_access_";
const REFRESH_PREFIX = "treytv_refresh_";
const OAUTH_SCOPES = [
  "profile:read",
  "email:read",
  "creator:read",
  "verification:read",
  "public_uid:read"
];
function json$4(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      pragma: "no-cache"
    }
  });
}
function oauthError$1(error, description, status = 400) {
  return json$4({ error, error_description: description }, status);
}
function hashSecret$1(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
function token(prefix) {
  return `${prefix}${randomBytes(32).toString("base64url")}`;
}
function normalizeScopes(scopes) {
  const list = Array.isArray(scopes) ? scopes : String(scopes ?? "").trim().split(/[,\s]+/);
  return Array.from(new Set(list.filter((scope) => OAUTH_SCOPES.includes(scope))));
}
function safeOrigin(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
function plusSeconds(seconds) {
  return new Date(Date.now() + seconds * 1e3).toISOString();
}
function isPast$1(iso) {
  return !iso || new Date(iso).getTime() <= Date.now();
}
async function readPayload$2(request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return Object.fromEntries(Object.entries(body ?? {}).map(([key, value]) => [key, String(value ?? "")]));
  }
  const text = await request.text();
  return Object.fromEntries(new URLSearchParams(text));
}
function readBasicClient(request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("basic ")) return {};
  try {
    const decoded = globalThis.atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator === -1) return {};
    return {
      client_id: decodeURIComponent(decoded.slice(0, separator)),
      client_secret: decodeURIComponent(decoded.slice(separator + 1))
    };
  } catch {
    return {};
  }
}
function pkceS256(verifier) {
  return createHash("sha256").update(verifier).digest("base64url");
}
async function audit(service, eventType, appId, actorUserId, metadata = {}) {
  await service.from("developer_app_audit_events").insert({
    app_id: appId,
    actor_user_id: actorUserId,
    event_type: eventType,
    metadata
  });
}
async function getActiveApp(service, clientId) {
  const { data: app, error } = await service.from("developer_apps").select("id, app_name, client_id, client_secret_hash, redirect_uris, allowed_scopes, status").eq("client_id", clientId).maybeSingle();
  if (error) throw new Error("app_lookup_failed");
  if (!app) return { error: oauthError$1("invalid_client", "Unknown client_id.", 401) };
  if (app.status !== "active") return { error: oauthError$1("unauthorized_client", "Developer app is not active.", 401) };
  return { app };
}
function validateClientSecret(app, clientSecret) {
  if (!clientSecret) return true;
  return hashSecret$1(clientSecret) === app.client_secret_hash;
}
function validateScopes(app, scopes) {
  const allowed = normalizeScopes(app.allowed_scopes);
  return scopes.every((scope) => allowed.includes(scope));
}
async function issueTokenPair(service, appId, userId, scopes) {
  const accessToken = token(TOKEN_PREFIX);
  const refreshToken = token(REFRESH_PREFIX);
  const accessExpiresAt = plusSeconds(ACCESS_TOKEN_SECONDS$1);
  const refreshExpiresAt = plusSeconds(REFRESH_TOKEN_SECONDS);
  const { data: tokenRow, error } = await service.from("developer_app_tokens").insert({
    app_id: appId,
    user_id: userId,
    access_token_hash: hashSecret$1(accessToken),
    refresh_token_hash: hashSecret$1(refreshToken),
    scopes,
    expires_at: accessExpiresAt,
    refresh_token_expires_at: refreshExpiresAt
  }).select("id").single();
  if (error) throw new Error("token_insert_failed");
  await audit(service, "token_issued", appId, userId, { token_id: tokenRow.id, scopes });
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_SECONDS$1,
    scope: scopes.join(" ")
  };
}
async function exchangeAuthorizationCode$1(request, payload) {
  const service = getTreyIServiceClient();
  const basic = readBasicClient(request);
  const clientId = payload.client_id || basic.client_id || "";
  const clientSecret = payload.client_secret || basic.client_secret;
  const code = payload.code || "";
  const redirectUri = payload.redirect_uri || "";
  const codeVerifier = payload.code_verifier || "";
  if (!clientId || !code || !redirectUri || !codeVerifier) {
    return oauthError$1("invalid_request", "grant_type, code, client_id, redirect_uri, and code_verifier are required.");
  }
  const { app, error: appError } = await getActiveApp(service, clientId);
  if (appError) return appError;
  if (!validateClientSecret(app, clientSecret)) return oauthError$1("invalid_client", "Invalid client credentials.", 401);
  const { data: codeRow, error: codeError } = await service.from("oauth_authorization_codes").select("id, app_id, user_id, code_hash, redirect_uri, scopes, code_challenge, code_challenge_method, expires_at, used_at").eq("code_hash", hashSecret$1(code)).maybeSingle();
  if (codeError) throw new Error("code_lookup_failed");
  if (!codeRow || codeRow.app_id !== app.id) return oauthError$1("invalid_grant", "Invalid authorization code.");
  if (codeRow.redirect_uri !== redirectUri) return oauthError$1("invalid_grant", "redirect_uri does not match the authorization code.");
  if (codeRow.used_at) return oauthError$1("invalid_grant", "Authorization code has already been used.");
  if (isPast$1(codeRow.expires_at)) return oauthError$1("invalid_grant", "Authorization code has expired.");
  if (!codeRow.code_challenge) return oauthError$1("invalid_grant", "Authorization code is missing PKCE.");
  if ((codeRow.code_challenge_method ?? "S256") !== "S256") return oauthError$1("invalid_grant", "Unsupported PKCE method.");
  if (pkceS256(codeVerifier) !== codeRow.code_challenge) return oauthError$1("invalid_grant", "Invalid PKCE verifier.");
  const scopes = normalizeScopes(codeRow.scopes);
  if (!validateScopes(app, scopes)) return oauthError$1("invalid_grant", "Authorization code contains scopes not allowed by this app.");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data: usedRows, error: usedError } = await service.from("oauth_authorization_codes").update({ used_at: now }).eq("id", codeRow.id).is("used_at", null).select("id");
  if (usedError) throw new Error("code_mark_failed");
  if (!usedRows?.length) return oauthError$1("invalid_grant", "Authorization code has already been used.");
  return json$4(await issueTokenPair(service, app.id, codeRow.user_id, scopes));
}
async function refreshAccessToken(request, payload) {
  const service = getTreyIServiceClient();
  const basic = readBasicClient(request);
  const clientId = payload.client_id || basic.client_id || "";
  const clientSecret = payload.client_secret || basic.client_secret;
  const refreshToken = payload.refresh_token || "";
  if (!clientId || !refreshToken) return oauthError$1("invalid_request", "client_id and refresh_token are required.");
  const { app, error: appError } = await getActiveApp(service, clientId);
  if (appError) return appError;
  if (!validateClientSecret(app, clientSecret)) return oauthError$1("invalid_client", "Invalid client credentials.", 401);
  const { data: existing, error } = await service.from("developer_app_tokens").select("id, app_id, user_id, scopes, revoked_at, refresh_token_expires_at").eq("refresh_token_hash", hashSecret$1(refreshToken)).maybeSingle();
  if (error) throw new Error("refresh_lookup_failed");
  if (!existing || existing.app_id !== app.id) return oauthError$1("invalid_grant", "Invalid refresh token.");
  if (existing.revoked_at) return oauthError$1("invalid_grant", "Refresh token has been revoked.");
  if (isPast$1(existing.refresh_token_expires_at)) return oauthError$1("invalid_grant", "Refresh token has expired.");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data: revokedRows, error: revokeError } = await service.from("developer_app_tokens").update({ revoked_at: now, last_used_at: now }).eq("id", existing.id).is("revoked_at", null).select("id");
  if (revokeError) throw new Error("refresh_rotate_failed");
  if (!revokedRows?.length) return oauthError$1("invalid_grant", "Refresh token has already been used.");
  await audit(service, "token_revoked", app.id, existing.user_id, { token_id: existing.id, reason: "refresh_rotated" });
  return json$4(await issueTokenPair(service, app.id, existing.user_id, normalizeScopes(existing.scopes)));
}
async function handleOAuthToken(request) {
  if (request.method === "OPTIONS") return json$4({});
  if (request.method !== "POST") return oauthError$1("invalid_request", "Use POST for the token endpoint.", 405);
  try {
    const payload = await readPayload$2(request);
    if (payload.grant_type === "authorization_code") return await exchangeAuthorizationCode$1(request, payload);
    if (payload.grant_type === "refresh_token") return await refreshAccessToken(request, payload);
    return oauthError$1("unsupported_grant_type", "Only authorization_code and refresh_token are supported.");
  } catch {
    return oauthError$1("server_error", "The token request could not be completed.", 500);
  }
}
async function handleOAuthUserInfo(request) {
  if (request.method === "OPTIONS") return json$4({});
  if (request.method !== "GET" && request.method !== "POST") return oauthError$1("invalid_request", "Use GET or POST for userinfo.", 405);
  try {
    const auth = request.headers.get("authorization") ?? "";
    const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    if (!bearer) return oauthError$1("invalid_request", "Bearer access token is required.", 401);
    const service = getTreyIServiceClient();
    const { data: tokenRow, error } = await service.from("developer_app_tokens").select("id, app_id, user_id, scopes, expires_at, revoked_at, developer_apps(id, status)").eq("access_token_hash", hashSecret$1(bearer)).maybeSingle();
    if (error) throw new Error("token_lookup_failed");
    if (!tokenRow || tokenRow.revoked_at || isPast$1(tokenRow.expires_at)) return oauthError$1("invalid_token", "Access token is invalid or expired.", 401);
    const tokenApp = Array.isArray(tokenRow.developer_apps) ? tokenRow.developer_apps[0] : tokenRow.developer_apps;
    if (tokenApp?.status !== "active") return oauthError$1("invalid_token", "Developer app is not active.", 401);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await service.from("developer_app_tokens").update({ last_used_at: now }).eq("id", tokenRow.id);
    const scopes = normalizeScopes(tokenRow.scopes);
    const response = { sub: tokenRow.user_id };
    const { data: profile } = await service.from("profiles").select("public_profile_uid, display_name, username, avatar_url, email, creator_status, gold_verified, verification_type, verification_category").eq("id", tokenRow.user_id).maybeSingle();
    if (scopes.includes("profile:read")) {
      response.public_profile_uid = profile?.public_profile_uid ?? null;
      response.display_name = profile?.display_name ?? null;
      response.username = profile?.username ?? null;
      response.avatar_url = profile?.avatar_url ?? null;
      response.profile_url = profile?.public_profile_uid ? `${safeOrigin(request)}/u/${profile.public_profile_uid}` : null;
    } else if (scopes.includes("public_uid:read")) {
      response.public_profile_uid = profile?.public_profile_uid ?? null;
      response.profile_url = profile?.public_profile_uid ? `${safeOrigin(request)}/u/${profile.public_profile_uid}` : null;
    }
    if (scopes.includes("email:read")) {
      const { data: authUser } = await service.auth.admin.getUserById(tokenRow.user_id);
      response.email = profile?.email ?? authUser?.user?.email ?? null;
    }
    if (scopes.includes("creator:read")) {
      response.is_creator = profile?.creator_status === "approved";
      response.creator_status = profile?.creator_status ?? "not_applied";
      const { data: authUser } = await service.auth.admin.getUserById(tokenRow.user_id);
      if (authUser?.user?.email) {
        const { data: channel } = await service.from("creator_channels").select("id").eq("owner_email", authUser.user.email.toLowerCase()).maybeSingle();
        if (channel?.id) response.creator_channel_id = channel.id;
      }
    }
    if (scopes.includes("verification:read")) {
      response.is_gold_verified = Boolean(profile?.gold_verified);
      response.verification_type = profile?.verification_type ?? profile?.verification_category ?? null;
    }
    return json$4(response);
  } catch {
    return oauthError$1("server_error", "The userinfo request could not be completed.", 500);
  }
}
async function handleOAuthRevoke(request) {
  if (request.method === "OPTIONS") return json$4({});
  if (request.method !== "POST") return oauthError$1("invalid_request", "Use POST for the revocation endpoint.", 405);
  try {
    const payload = await readPayload$2(request);
    const rawToken = payload.token || "";
    if (!rawToken) return json$4({ ok: true });
    const service = getTreyIServiceClient();
    const tokenHash = hashSecret$1(rawToken);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { data: rows } = await service.from("developer_app_tokens").update({ revoked_at: now, last_used_at: now }).or(`access_token_hash.eq.${tokenHash},refresh_token_hash.eq.${tokenHash}`).is("revoked_at", null).select("id, app_id, user_id");
    for (const row of rows ?? []) {
      await audit(service, "token_revoked", row.app_id, row.user_id, { token_id: row.id, reason: "revocation_endpoint" });
    }
    return json$4({ ok: true });
  } catch {
    return json$4({ ok: true });
  }
}
function handleOpenIdConfiguration(request) {
  const origin = safeOrigin(request);
  return json$4({
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    userinfo_endpoint: `${origin}/oauth/userinfo`,
    revocation_endpoint: `${origin}/oauth/revoke`,
    jwks_uri: `${origin}/oauth/jwks.json`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    scopes_supported: OAUTH_SCOPES,
    token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
    code_challenge_methods_supported: ["S256"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: []
  });
}
function handleJwks() {
  return json$4({
    keys: [],
    id_token_signing: "pending"
  });
}
function json$3(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      pragma: "no-cache"
    }
  });
}
function resolveSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || process.env.VITE_SITE_URL?.trim().replace(/\/+$/, "") || process.env.TREY_TV_PUBLIC_ORIGIN?.trim().replace(/\/+$/, "") || "https://tv.treytrizzy.com";
}
async function getUserFromBearer$1(request) {
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!bearer) return null;
  try {
    const service = getTreyIServiceClient();
    const { data, error } = await service.auth.getUser(bearer);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}
async function handleAuthSession(request) {
  if (request.method === "OPTIONS") return json$3({});
  if (request.method !== "GET") return json$3({ error: "Method not allowed." }, 405);
  try {
    const user = await getUserFromBearer$1(request);
    if (!user) return json$3({ authenticated: false, user: null });
    const service = getTreyIServiceClient();
    const { data: profile } = await service.from("profiles").select(
      "public_profile_uid, display_name, username, onboarding_completed, role, creator_status, gold_verified"
    ).eq("id", user.id).maybeSingle();
    return json$3({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email ?? null,
        public_profile_uid: profile?.public_profile_uid ?? null,
        display_name: profile?.display_name ?? null,
        username: profile?.username ?? null,
        onboarding_completed: profile?.onboarding_completed ?? false,
        role: profile?.role ?? "user",
        is_creator: profile?.creator_status === "approved",
        is_admin: profile?.role === "admin",
        is_gold_verified: Boolean(profile?.gold_verified)
      }
    });
  } catch {
    return json$3({ error: "Session check failed." }, 500);
  }
}
async function handleAuthMe(request) {
  if (request.method === "OPTIONS") return json$3({});
  if (request.method !== "GET") return json$3({ error: "Method not allowed." }, 405);
  const user = await getUserFromBearer$1(request);
  if (!user) return json$3({ error: "Not authenticated." }, 401);
  try {
    const service = getTreyIServiceClient();
    const { data: profile } = await service.from("profiles").select(
      "public_profile_uid, display_name, username, avatar_url, bio, role, creator_status, gold_verified, onboarding_completed"
    ).eq("id", user.id).maybeSingle();
    const origin = resolveSiteUrl();
    const uid = profile?.public_profile_uid ?? null;
    return json$3({
      id: user.id,
      email: user.email ?? null,
      public_profile_uid: uid,
      display_name: profile?.display_name ?? null,
      username: profile?.username ?? null,
      avatar_url: profile?.avatar_url ?? null,
      bio: profile?.bio ?? null,
      onboarding_completed: profile?.onboarding_completed ?? false,
      role: profile?.role ?? "user",
      is_creator: profile?.creator_status === "approved",
      is_admin: profile?.role === "admin",
      is_gold_verified: Boolean(profile?.gold_verified),
      profile_url: uid ? `${origin}/u/${uid}` : null
    });
  } catch {
    return json$3({ error: "Could not load profile." }, 500);
  }
}
async function handleAuthLogout(request) {
  if (request.method === "OPTIONS") return json$3({});
  if (request.method !== "POST") return json$3({ error: "Method not allowed." }, 405);
  const accepts = request.headers.get("accept") ?? "";
  const wantsJson = accepts.includes("application/json") || accepts.includes("*/*");
  if (wantsJson) {
    return json$3({ ok: true, redirect: resolveSiteUrl() });
  }
  return new Response(null, {
    status: 302,
    headers: { Location: resolveSiteUrl() }
  });
}
function renderErrorPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
const DEFAULT_FWD_ALLOWED_REDIRECTS = [
  "https://fwd.treytv.com/auth/trey-tv/callback",
  "http://localhost:5173/auth/trey-tv/callback"
];
const DEFAULT_FWD_CLIENT_ID = "7a8b2b60-9597-45cb-99fd-66abd03abcb2";
function hashSecret(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
function generateCode() {
  return `fwd_code_${randomBytes(32).toString("base64url")}`;
}
function cleanText(value, max = 500) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}
function cleanUrl(value) {
  return cleanText(value, 900);
}
function safeLog(event, metadata = {}) {
  console.info("[fwd-oauth]", event, metadata);
}
function oauthJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      pragma: "no-cache"
    }
  });
}
function oauthError(error, description, status = 400) {
  return oauthJson({ error, error_description: description }, status);
}
function isPast(iso) {
  return !iso || new Date(iso).getTime() <= Date.now();
}
function verifySecret(secret, hash) {
  const supplied = Buffer.from(hashSecret(secret));
  const stored = Buffer.from(hash);
  return supplied.length === stored.length && timingSafeEqual(supplied, stored);
}
function getFwdAllowedRedirects() {
  return Array.from(new Set([
    process.env.FWD_ALLOWED_REDIRECT_URI?.trim(),
    process.env.FWD_LOCAL_REDIRECT_URI?.trim(),
    ...DEFAULT_FWD_ALLOWED_REDIRECTS
  ].filter(Boolean)));
}
function getFwdClientId() {
  return process.env.FWD_OAUTH_CLIENT_ID?.trim() || DEFAULT_FWD_CLIENT_ID;
}
function normalizeFwdScope(scope) {
  const scopes = String(scope ?? "").trim().split(/[,\s]+/).filter(Boolean);
  return scopes.length ? Array.from(new Set(scopes)) : ["profile"];
}
function isAllowedRedirect(client, redirectUri) {
  const allowed = Array.isArray(client.allowed_redirect_uris) ? client.allowed_redirect_uris : [];
  return allowed.includes(redirectUri) && getFwdAllowedRedirects().includes(redirectUri);
}
function isAllowedScope(client, scope) {
  const requested = normalizeFwdScope(scope);
  const allowed = Array.isArray(client.allowed_scopes) && client.allowed_scopes.length ? client.allowed_scopes : ["profile"];
  return requested.every((item) => allowed.includes(item));
}
function getPublicProfileUrl(uid) {
  if (!uid) return null;
  const origin = process.env.TREY_TV_PUBLIC_ORIGIN?.trim()?.replace(/\/+$/, "") || "https://tv.treytrizzy.com";
  return `${origin}/u/${uid}`;
}
async function getActiveFwdClient(clientId) {
  if (!clientId) return null;
  if (clientId !== getFwdClientId()) return null;
  const service = getTreyIServiceClient();
  const { data, error } = await service.from("fwd_oauth_clients").select("id, client_id, client_secret_hash, app_name, allowed_redirect_uris, allowed_scopes, is_active").eq("client_id", clientId).eq("is_active", true).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    const envSecret = process.env.FWD_OAUTH_CLIENT_SECRET?.trim();
    if (!envSecret) return null;
    return {
      id: "env:fwd",
      app_name: "FWD",
      allowed_scopes: ["profile"],
      allowed_redirect_uris: getFwdAllowedRedirects(),
      client_id: clientId,
      client_secret_hash: hashSecret(envSecret),
      is_active: true
    };
  }
  return data;
}
async function getSafeProfile(userId) {
  const service = getTreyIServiceClient();
  const ensuredUid = await ensurePublicProfileUid(userId);
  const { data: profile, error } = await service.from("profiles").select("public_profile_uid, display_name, username, avatar_url").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  const treyTvUid = profile?.public_profile_uid ?? ensuredUid ?? null;
  return {
    avatar_url: profile?.avatar_url ?? null,
    display_name: profile?.display_name ?? profile?.username ?? null,
    profile_url: getPublicProfileUrl(treyTvUid),
    trey_tv_uid: treyTvUid,
    trey_tv_user_id: userId
  };
}
const ACCESS_TOKEN_SECONDS = 60 * 60;
function base64url(value) {
  return Buffer.from(value).toString("base64url");
}
function publicProfileUrl(request, uid) {
  if (typeof uid !== "string" || !uid) return null;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}/u/${uid}`;
}
function signingSecret(clientSecretHash) {
  const serviceSecret = process.env.FWD_OAUTH_SECRET_PEPPER?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceSecret) throw new Error("missing_signing_secret");
  return `${serviceSecret}:${clientSecretHash}`;
}
function signToken(profile, clientId, clientSecretHash) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    aud: "fwd.treytv.com",
    avatar_url: profile.avatar_url,
    client_id: clientId,
    display_name: profile.display_name,
    exp: Math.floor(Date.now() / 1e3) + ACCESS_TOKEN_SECONDS,
    iat: Math.floor(Date.now() / 1e3),
    iss: "trey-tv",
    jti: randomBytes(16).toString("base64url"),
    sub: profile.trey_tv_uid,
    profile_url: profile.profile_url,
    trey_tv_uid: profile.trey_tv_uid
  }));
  const input = `${header}.${payload}`;
  const signature = createHmac("sha256", signingSecret(clientSecretHash)).update(input).digest("base64url");
  return `${input}.${signature}`;
}
function verifySignedToken(token2, clientSecretHash) {
  const parts = token2.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = createHmac("sha256", signingSecret(clientSecretHash)).update(`${header}.${payload}`).digest("base64url");
  const supplied = Buffer.from(signature);
  const stored = Buffer.from(expected);
  if (supplied.length !== stored.length || !timingSafeEqual(supplied, stored)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const exp = typeof decoded.exp === "number" ? decoded.exp : 0;
    if (exp <= Math.floor(Date.now() / 1e3)) return null;
    return decoded;
  } catch {
    return null;
  }
}
async function readPayload$1(request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return Object.fromEntries(Object.entries(body ?? {}).map(([key, value]) => [key, String(value ?? "")]));
  }
  const text = await request.text();
  return Object.fromEntries(new URLSearchParams(text));
}
async function exchangeAuthorizationCode(request) {
  if (request.method === "OPTIONS") return oauthJson({});
  if (request.method !== "POST") return oauthError("invalid_request", "Use POST for the token endpoint.", 405);
  try {
    const payload = await readPayload$1(request);
    const grantType = payload.grant_type ?? "";
    const code = cleanText(payload.code, 300);
    const redirectUri = cleanText(payload.redirect_uri, 900);
    const clientId = cleanText(payload.client_id, 160);
    const clientSecret = payload.client_secret ?? "";
    if (grantType !== "authorization_code") {
      return oauthError("unsupported_grant_type", "Only authorization_code is supported.");
    }
    if (!code || !redirectUri || !clientId || !clientSecret) {
      return oauthError("invalid_request", "code, redirect_uri, client_id, and client_secret are required.");
    }
    const client = await getActiveFwdClient(clientId);
    if (!client) return oauthError("invalid_client", "Unknown or inactive client_id.", 401);
    if (!verifySecret(clientSecret, client.client_secret_hash)) {
      safeLog("invalid_client_secret", { client_id: clientId });
      return oauthError("invalid_client", "Invalid client credentials.", 401);
    }
    if (!isAllowedRedirect(client, redirectUri)) {
      return oauthError("invalid_grant", "redirect_uri is not registered for FWD.");
    }
    const service = getTreyIServiceClient();
    const { data: codeRow, error } = await service.from("fwd_oauth_codes").select("id, code, client_id, redirect_uri, trey_tv_user_id, trey_tv_uid, display_name, avatar_url, profile_url, scope, expires_at, used_at").eq("code", code).maybeSingle();
    if (error) throw new Error(error.message);
    if (!codeRow || codeRow.client_id !== client.client_id) return oauthError("invalid_grant", "Invalid authorization code.");
    if (codeRow.redirect_uri !== redirectUri) return oauthError("invalid_grant", "redirect_uri does not match the authorization code.");
    if (codeRow.used_at) return oauthError("invalid_grant", "Authorization code has already been used.");
    if (isPast(codeRow.expires_at)) return oauthError("invalid_grant", "Authorization code has expired.");
    if (!isAllowedScope(client, codeRow.scope)) return oauthError("invalid_grant", "Authorization code scope is not allowed.");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { data: usedRows, error: usedError } = await service.from("fwd_oauth_codes").update({ used_at: now }).eq("id", codeRow.id).is("used_at", null).select("id");
    if (usedError) throw new Error(usedError.message);
    if (!usedRows?.length) return oauthError("invalid_grant", "Authorization code has already been used.");
    const profile = {
      avatar_url: codeRow.avatar_url ?? null,
      display_name: codeRow.display_name ?? null,
      profile_url: codeRow.profile_url ?? getPublicProfileUrl(codeRow.trey_tv_uid),
      trey_tv_uid: codeRow.trey_tv_uid ?? null,
      trey_tv_user_id: codeRow.trey_tv_user_id
    };
    const accessToken = signToken(profile, client.client_id, client.client_secret_hash);
    safeLog("authorization_code_exchanged", {
      client_id: client.client_id,
      redirect_uri: redirectUri,
      trey_tv_uid: profile.trey_tv_uid
    });
    return oauthJson({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_SECONDS,
      user: {
        trey_tv_uid: profile.trey_tv_uid,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        profile_url: profile.profile_url ?? publicProfileUrl(request, profile.trey_tv_uid)
      }
    });
  } catch (error) {
    console.error("[fwd-oauth] token_error", error);
    return oauthError("server_error", "The token request could not be completed.", 500);
  }
}
async function handleUserInfo(request) {
  if (request.method === "OPTIONS") return oauthJson({});
  if (request.method !== "GET" && request.method !== "POST") {
    return oauthError("invalid_request", "Use GET or POST for userinfo.", 405);
  }
  try {
    const bearer = (request.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    if (!bearer) return oauthError("invalid_request", "Bearer access token is required.", 401);
    const unsignedPayload = bearer.split(".")[1];
    if (!unsignedPayload) return oauthError("invalid_token", "Access token is invalid or expired.", 401);
    const decoded = JSON.parse(Buffer.from(unsignedPayload, "base64url").toString("utf8"));
    const clientId = typeof decoded.client_id === "string" ? decoded.client_id : "";
    const client = await getActiveFwdClient(clientId);
    if (!client) return oauthError("invalid_token", "Access token is invalid or expired.", 401);
    const verified = verifySignedToken(bearer, client.client_secret_hash);
    if (!verified) return oauthError("invalid_token", "Access token is invalid or expired.", 401);
    return oauthJson({
      sub: verified.trey_tv_uid ?? null,
      provider: "trey_tv",
      trey_tv_uid: verified.trey_tv_uid ?? null,
      name: verified.display_name ?? null,
      picture: verified.avatar_url ?? null,
      profile_url: verified.profile_url ?? publicProfileUrl(request, verified.trey_tv_uid)
    });
  } catch {
    return oauthError("invalid_token", "Access token is invalid or expired.", 401);
  }
}
function handleFwdOAuthRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === "/api/fwd/oauth/token") return exchangeAuthorizationCode(request);
  if (url.pathname === "/api/fwd/oauth/userinfo") return handleUserInfo(request);
  return null;
}
function readEnv(env, key) {
  const fromRuntime = env && typeof env === "object" ? env[key] : void 0;
  if (typeof fromRuntime === "string" && fromRuntime.trim()) return fromRuntime.trim();
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : void 0;
  return typeof fromProcess === "string" ? fromProcess.trim() : "";
}
function loadLiveKitConfig(env) {
  const url = readEnv(env, "LIVEKIT_URL") || readEnv(env, "VITE_LIVEKIT_URL");
  const apiKey = readEnv(env, "LIVEKIT_API_KEY");
  const apiSecret = readEnv(env, "LIVEKIT_API_SECRET");
  const agentName = readEnv(env, "LIVEKIT_AGENT_NAME") || "Hayden-1f01";
  if (!url) {
    throw new Error("LiveKit URL is not configured. Set LIVEKIT_URL in the environment.");
  }
  if (!url.startsWith("wss://") && !url.startsWith("ws://")) {
    throw new Error("LiveKit URL must start with wss:// or ws://.");
  }
  if (!apiKey) {
    throw new Error("LIVEKIT_API_KEY is missing from the environment.");
  }
  if (!apiSecret) {
    throw new Error("LIVEKIT_API_SECRET is missing from the environment.");
  }
  return { url, apiKey, apiSecret, agentName };
}
function getLiveKitConfigDiagnostics(env) {
  const url = readEnv(env, "LIVEKIT_URL") || readEnv(env, "VITE_LIVEKIT_URL");
  const apiKey = readEnv(env, "LIVEKIT_API_KEY");
  const apiSecret = readEnv(env, "LIVEKIT_API_SECRET");
  const agentName = readEnv(env, "LIVEKIT_AGENT_NAME") || "Hayden-1f01";
  const issues = [];
  let urlHost = "";
  if (!url) {
    issues.push("LIVEKIT_URL is not set.");
  } else if (!url.startsWith("wss://") && !url.startsWith("ws://")) {
    issues.push("LIVEKIT_URL does not start with wss:// or ws://.");
  } else {
    try {
      urlHost = new URL(url).hostname;
    } catch {
      issues.push("LIVEKIT_URL is not a valid URL.");
    }
  }
  if (!apiKey) issues.push("LIVEKIT_API_KEY is not set.");
  if (!apiSecret) issues.push("LIVEKIT_API_SECRET is not set.");
  return {
    livekitUrlPresent: Boolean(url),
    livekitUrlHost: urlHost,
    apiKeyPresent: Boolean(apiKey),
    apiKeyPrefix: apiKey ? apiKey.slice(0, 4) : "",
    apiSecretPresent: Boolean(apiSecret),
    apiSecretLength: apiSecret ? apiSecret.length : 0,
    agentName,
    issues
  };
}
const AGENT_NAME = "Hayden-1f01";
const TOKEN_TTL = "15m";
function json$2(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
function cleanPart(value, fallback) {
  const raw = typeof value === "string" ? value : fallback;
  return raw.trim().toLowerCase().replace(/[_\s]+/g, "-").replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96) || fallback;
}
function cleanIdentity(value, fallback) {
  const raw = typeof value === "string" ? value : fallback;
  return raw.trim().replace(/[^a-zA-Z0-9_.@-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 128) || fallback;
}
function cleanName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
}
function emailUsername(email) {
  if (typeof email !== "string") return "";
  return cleanName(email.split("@")[0]);
}
function shortId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function apiKeyFingerprint(apiKey) {
  if (!apiKey) return "";
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}
function livekitHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
async function readPayload(request) {
  if (request.method === "GET") {
    const url = new URL(request.url);
    return Object.fromEntries(url.searchParams.entries());
  }
  return await request.json().catch(() => ({}));
}
function decodeJwtPayload(jwt) {
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;
    if (typeof Buffer !== "undefined") {
      return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    }
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}
function bearerToken(request) {
  const auth = request.headers.get("authorization") ?? "";
  return auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}
async function resolveParticipant(request) {
  const token2 = bearerToken(request);
  if (!token2) {
    const id = `guest-${shortId()}`;
    return { identity: id, name: "Storyteller", userUid: id };
  }
  try {
    const service = getTreyIServiceClient();
    const { data, error } = await service.auth.getUser(token2);
    const user = error ? null : data.user;
    if (!user) throw new Error("Unauthenticated");
    const { data: profile } = await service.from("profiles").select("public_profile_uid, display_name, username, full_name").eq("id", user.id).maybeSingle();
    const identity = cleanIdentity(profile?.public_profile_uid || user.id, user.id);
    const name = cleanName(profile?.display_name) || cleanName(profile?.username) || cleanName(profile?.full_name) || emailUsername(user.email) || "Storyteller";
    return { identity, name, userUid: user.id };
  } catch {
    const id = `guest-${shortId()}`;
    return { identity: id, name: "Storyteller", userUid: id };
  }
}
function roomKindFrom(body) {
  const raw = String(body.roomKind || body.mode || "interactive-story").trim().toLowerCase();
  if (raw === "story-maker" || raw === "ai-story-maker" || raw === "story-journey") return "story-maker";
  if (raw === "game" || raw === "game-room") return "game";
  if (raw === "inbox" || raw === "inbox-call" || raw === "private-call") return "inbox";
  if (raw === "watch-party" || raw === "wp") return "watch-party";
  return "interactive-story";
}
function resolveRoom(body, participant) {
  const kind = roomKindFrom(body);
  if (kind === "game") {
    const gameSlug = cleanPart(body.gameSlug, "game");
    const matchId = cleanPart(body.matchId, "match");
    return {
      kind,
      roomName: `game:${gameSlug}:match:${matchId}`,
      dispatchAgent: false,
      metadata: {
        mode: "voice-room",
        storyId: null,
        beatId: null,
        pageId: null,
        projectId: null,
        userUid: participant.userUid
      }
    };
  }
  if (kind === "inbox") {
    const conversationId = cleanPart(body.conversationId, "conversation");
    return {
      kind,
      roomName: `inbox-call:${conversationId}`,
      dispatchAgent: false,
      metadata: {
        mode: "voice-room",
        storyId: null,
        beatId: null,
        pageId: null,
        projectId: null,
        userUid: participant.userUid
      }
    };
  }
  if (kind === "watch-party") {
    const partyId = cleanPart(body.partyId, "party");
    return {
      kind,
      roomName: `wp:${partyId}`,
      dispatchAgent: false,
      metadata: {
        mode: "voice-room",
        storyId: null,
        beatId: null,
        pageId: null,
        projectId: null,
        userUid: participant.userUid
      }
    };
  }
  if (kind === "story-maker") {
    const projectId = cleanPart(body.projectId || body.storyProjectId, "project");
    const pageId = typeof body.pageId === "string" && body.pageId.trim() ? cleanPart(body.pageId, "page") : "";
    return {
      kind,
      roomName: pageId ? `story-journey-page-${pageId}` : `story-journey-${projectId}`,
      dispatchAgent: true,
      metadata: {
        mode: "story-narrator",
        storyId: null,
        beatId: null,
        pageId: pageId || null,
        projectId,
        userUid: participant.userUid
      }
    };
  }
  const storyId = cleanPart(body.storyId, "story");
  const beatId = typeof body.beatId === "string" && body.beatId.trim() ? cleanPart(body.beatId, "beat") : "";
  return {
    kind,
    roomName: beatId ? `interactive-story-${storyId}-beat-${beatId}` : `interactive-story-${storyId}`,
    dispatchAgent: true,
    metadata: {
      mode: "story-narrator",
      storyId,
      beatId: beatId || null,
      pageId: null,
      projectId: null,
      userUid: participant.userUid
    }
  };
}
function validateTokenShape(jwt, apiKey, participantIdentity, roomName, expectAgentDispatch) {
  const payload = decodeJwtPayload(jwt);
  const video = payload?.video;
  const issues = [];
  if (!payload) issues.push("payload missing");
  if (payload?.iss !== apiKey) issues.push("iss mismatch");
  if (payload?.sub !== participantIdentity) issues.push("sub mismatch");
  if (video?.room !== roomName) issues.push("video.room mismatch");
  if (video?.roomJoin !== true) issues.push("video.roomJoin missing");
  if (video?.canPublish !== true) issues.push("video.canPublish missing");
  if (video?.canSubscribe !== true) issues.push("video.canSubscribe missing");
  if (video?.canPublishData !== true) issues.push("video.canPublishData missing");
  if (video?.roomAdmin) issues.push("video.roomAdmin must not be granted");
  if (video?.roomCreate) issues.push("video.roomCreate must not be granted");
  if (video?.roomList) issues.push("video.roomList must not be granted");
  if (video?.roomRecord) issues.push("video.roomRecord must not be granted");
  const roomConfig = payload?.roomConfig;
  const agents = roomConfig?.agents;
  if (expectAgentDispatch) {
    if (!agents?.some((agent) => agent.agentName === AGENT_NAME)) {
      issues.push("roomConfig agent dispatch missing");
    }
  } else if (roomConfig) {
    issues.push("roomConfig must not be present");
  }
  if (issues.length > 0) {
    console.error("[LiveKit] Token shape validation failed:", issues.join(", "));
    throw new Error("LiveKit token payload failed local shape validation.");
  }
}
function inspectTokenDispatch(jwt) {
  const payload = decodeJwtPayload(jwt);
  const roomConfig = payload?.roomConfig;
  const agents = Array.isArray(roomConfig?.agents) ? roomConfig.agents : [];
  const agentNames = agents.map((agent) => typeof agent.agentName === "string" ? agent.agentName : "").filter(Boolean);
  const hayden = agents.find((agent) => agent.agentName === AGENT_NAME);
  let dispatchMetadataValid = false;
  let dispatchMetadataMode = "";
  if (typeof hayden?.metadata === "string") {
    try {
      const parsed = JSON.parse(hayden.metadata);
      dispatchMetadataValid = true;
      dispatchMetadataMode = typeof parsed.mode === "string" ? parsed.mode : "";
    } catch {
      dispatchMetadataValid = false;
    }
  }
  return {
    hasRoomConfig: Boolean(roomConfig),
    agentCount: agents.length,
    agentNames,
    dispatchAgentPresent: Boolean(hayden),
    dispatchMetadataValid,
    dispatchMetadataMode
  };
}
async function handleLiveKitToken(request, env) {
  if (request.method === "OPTIONS") return json$2({});
  if (request.method !== "POST" && request.method !== "GET") {
    return json$2({ error: "Method not allowed." }, 405);
  }
  let config;
  try {
    config = loadLiveKitConfig(env);
  } catch (err) {
    const message = err instanceof Error ? err.message : "LiveKit token service is not configured.";
    return json$2({ error: message }, 503);
  }
  try {
    const body = await readPayload(request);
    const participant = await resolveParticipant(request);
    const room = resolveRoom(body, participant);
    let canPublish = true;
    if (room.kind === "watch-party") {
      try {
        const supabase = getTreyIServiceClient();
        const partyId = String(body.partyId || "").trim();
        const accessToken = bearerToken(request);
        if (accessToken && partyId) {
          const { data: authData } = await supabase.auth.getUser(accessToken);
          const userId = authData?.user?.id;
          if (userId) {
            const { data: member } = await supabase.from("party_members").select("muted_mic, kicked").eq("party_id", partyId).eq("user_id", userId).maybeSingle();
            if (!member || member.kicked) {
              return json$2({ error: "Not a party member." }, 403);
            }
            canPublish = !member.muted_mic;
          }
        }
      } catch (err) {
        console.warn("[LiveKit] watch-party permission check failed:", err);
      }
    }
    const at2 = new AccessToken(config.apiKey, config.apiSecret, {
      identity: participant.identity,
      name: participant.name,
      metadata: JSON.stringify({
        role: "user",
        ...room.metadata
      }),
      ttl: TOKEN_TTL
    });
    at2.addGrant({
      room: room.roomName,
      roomJoin: true,
      canPublish,
      canSubscribe: true,
      canPublishData: true
    });
    if (room.dispatchAgent) {
      at2.roomConfig = new RoomConfiguration({
        agents: [
          new RoomAgentDispatch({
            agentName: AGENT_NAME,
            metadata: JSON.stringify(room.metadata)
          })
        ]
      });
    }
    const token2 = await at2.toJwt();
    validateTokenShape(token2, config.apiKey, participant.identity, room.roomName, room.dispatchAgent);
    const tokenInspection = inspectTokenDispatch(token2);
    return json$2({
      ok: true,
      livekitUrl: config.url,
      roomName: room.roomName,
      token: token2,
      participant: {
        identity: participant.identity,
        name: participant.name
      },
      agentName: room.dispatchAgent ? AGENT_NAME : void 0,
      diagnostics: {
        livekitHost: livekitHost(config.url),
        apiKeyFingerprint: apiKeyFingerprint(config.apiKey),
        roomName: room.roomName,
        roomKind: room.kind,
        dispatchEnabled: room.dispatchAgent,
        agentName: room.dispatchAgent ? AGENT_NAME : void 0,
        tokenHasRoomConfig: tokenInspection.hasRoomConfig,
        tokenAgentNames: tokenInspection.agentNames,
        tokenDispatchAgentPresent: tokenInspection.dispatchAgentPresent,
        tokenDispatchMetadataValid: tokenInspection.dispatchMetadataValid,
        tokenDispatchMetadataMode: tokenInspection.dispatchMetadataMode
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LiveKit token generation failed.";
    if (message.includes("shape validation")) {
      return json$2({ error: message }, 500);
    }
    console.error("[LiveKit] Token generation error:", message);
    return json$2({ error: "LiveKit token creation failed." }, 500);
  }
}
function livekitHttpUrl(url) {
  if (url.startsWith("wss://")) return `https://${url.slice("wss://".length)}`;
  if (url.startsWith("ws://")) return `http://${url.slice("ws://".length)}`;
  return url;
}
function safeParticipantInfo(participant) {
  const item = participant;
  return {
    identity: typeof item.identity === "string" ? item.identity : "",
    name: typeof item.name === "string" ? item.name : "",
    kind: typeof item.kind === "string" || typeof item.kind === "number" ? String(item.kind) : "",
    metadata: typeof item.metadata === "string" ? item.metadata.slice(0, 500) : ""
  };
}
async function handleLiveKitDiagnostics(request, env) {
  const diag = getLiveKitConfigDiagnostics(env);
  let serverSdkAvailable = false;
  let roomDiagnostics = {};
  try {
    serverSdkAvailable = Boolean(AccessToken && RoomConfiguration && RoomAgentDispatch);
  } catch {
    serverSdkAvailable = false;
  }
  try {
    const config = loadLiveKitConfig(env);
    const url = new URL(request.url);
    const body = Object.fromEntries(url.searchParams.entries());
    const participant = {
      identity: "diagnostics",
      name: "Diagnostics",
      userUid: "diagnostics"
    };
    const room = resolveRoom(body, participant);
    let participantCount;
    let participants;
    if (url.searchParams.get("includeParticipants") === "true" && room.roomName) {
      try {
        const service = new RoomServiceClient(livekitHttpUrl(config.url), config.apiKey, config.apiSecret);
        const listed = await service.listParticipants(room.roomName);
        participantCount = listed.length;
        participants = listed.map(safeParticipantInfo);
      } catch {
        participantCount = void 0;
        participants = void 0;
      }
    }
    let serverApiAuthenticated;
    let serverApiAuthError;
    if (url.searchParams.get("includeAuthCheck") === "true") {
      try {
        const service = new RoomServiceClient(livekitHttpUrl(config.url), config.apiKey, config.apiSecret);
        await service.listRooms([]);
        serverApiAuthenticated = true;
      } catch (error) {
        serverApiAuthenticated = false;
        const message = error instanceof Error ? error.message : String(error || "authentication failed");
        serverApiAuthError = /invalid token|invalid api key|unauthorized|forbidden/i.test(message) ? message : "LiveKit server API authentication failed.";
      }
    }
    roomDiagnostics = {
      livekitHost: livekitHost(config.url),
      apiKeyFingerprint: apiKeyFingerprint(config.apiKey),
      roomName: room.roomName,
      roomKind: room.kind,
      dispatchEnabled: room.dispatchAgent,
      serverApiAuthenticated,
      serverApiAuthError,
      participantCount,
      participants
    };
  } catch {
  }
  return json$2({
    livekitUrlConfigured: diag.livekitUrlPresent,
    apiKeyConfigured: diag.apiKeyPresent,
    apiSecretConfigured: diag.apiSecretPresent,
    agentName: AGENT_NAME,
    serverSdkAvailable,
    livekitHost: diag.livekitUrlHost,
    apiKeyFingerprint: diag.apiKeyPrefix ? `${diag.apiKeyPrefix}...` : "",
    ...roomDiagnostics
  });
}
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "NEXT_PUBLIC_APP_URL": "", "NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE": "", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "", "NEXT_PUBLIC_SUPABASE_ANON_KEY": "", "NEXT_PUBLIC_SUPABASE_URL": "", "NEXT_PUBLIC_VIDEO_PROVIDER": "", "PROD": true, "SSR": true, "TSS_DEV_SERVER": "false", "TSS_DEV_SSR_STYLES_BASEPATH": "/", "TSS_DEV_SSR_STYLES_ENABLED": "true", "TSS_INLINE_CSS_ENABLED": "false", "TSS_ROUTER_BASEPATH": "", "TSS_SERVER_FN_BASE": "/_serverFn/", "VITE_FWD_PICKER_BASE_URL": "", "VITE_PUBLIC_BUILDER_KEY": "21a19bc5fc2642d59d08dcf9b929d064", "VITE_SUPABASE_ANON_KEY": "sb_publishable_UnUWy7-FW9UqH_y0l0wEDQ_B7yw8W64", "VITE_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_UnUWy7-FW9UqH_y0l0wEDQ_B7yw8W64", "VITE_SUPABASE_URL": "https://wcdwlqnfcsuaacbvdmgx.supabase.co" };
const REQUIRED_ENV = [
  { name: "VITE_SUPABASE_URL", present: false, requiredFor: "Supabase browser client" },
  { name: "VITE_SUPABASE_ANON_KEY", present: false, requiredFor: "Supabase browser client" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", present: false, requiredFor: "trusted server helpers" },
  { name: "FWD_OAUTH_SECRET_PEPPER", present: false, requiredFor: "FWD OAuth token signing" },
  { name: "GOOGLE_GENERATIVE_AI_API_KEY", present: false, requiredFor: "Trey-I generation" },
  { name: "ELEVENLABS_API_KEY", present: false, requiredFor: "Trey-I voice sessions" }
];
function readEnvName(name) {
  const viteEnv = __vite_import_meta_env__;
  return viteEnv[name] ?? process.env[name];
}
function environmentLabel() {
  const viteMode = "production".trim();
  const nodeEnv = "production".trim();
  return viteMode || nodeEnv || "unknown";
}
function getPluginHealthStatus() {
  const requiredEnv = REQUIRED_ENV.map((entry) => ({
    ...entry,
    present: Boolean(readEnvName(entry.name))
  }));
  const missingNames = requiredEnv.filter((entry) => !entry.present).map((entry) => entry.name);
  return {
    appName: "Trey TV",
    appStack: ["TanStack Start", "TanStack Router", "Vite", "React", "Supabase", "Cloudflare-compatible server entry"],
    environmentLabel: environmentLabel(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    requiredEnv,
    activeDomainsExpected: ["tv.treytrizzy.com", "fwd.treytv.com"],
    buildSafe: {
      detected: true,
      mode: environmentLabel(),
      readOnly: true
    },
    warnings: missingNames.map((name) => `Missing environment variable: ${name}`)
  };
}
const VALID_APPROVAL_STATUSES = ["pending", "approved", "rejected", "needs_changes"];
const validateAccessToken = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : ""
});
const validateQueueItemInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  queueId: typeof input?.queueId === "string" ? input.queueId : ""
});
const validateReviewInput = (input) => {
  const approvalStatus = typeof input?.approvalStatus === "string" ? input.approvalStatus : "";
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    queueId: typeof input?.queueId === "string" ? input.queueId : "",
    approvalStatus: VALID_APPROVAL_STATUSES.includes(approvalStatus) ? approvalStatus : "pending",
    adminNotes: typeof input?.adminNotes === "string" ? input.adminNotes : ""
  };
};
async function verifyAdmin(accessToken) {
  const token2 = accessToken.trim();
  if (!token2) {
    throw new Error("Admin access required");
  }
  const supabaseEnv = getSupabasePublicEnv();
  if (!supabaseEnv) {
    throw new Error("Admin not configured");
  }
  const authClient = createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token2}`
      }
    }
  });
  const {
    data: {
      user
    },
    error
  } = await authClient.auth.getUser(token2);
  if (error || !user?.email) {
    throw new Error("Admin access required");
  }
  const {
    data: profile
  } = await authClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin") {
    return {
      id: user.id,
      email: user.email
    };
  }
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean) ?? [];
  if (adminEmails.length > 0 && adminEmails.includes(user.email.toLowerCase())) {
    return {
      id: user.id,
      email: user.email
    };
  }
  throw new Error(adminEmails.length > 0 ? "Admin access required" : "Admin not configured");
}
const getAdminPostQueue = createServerFn({
  method: "POST"
}).inputValidator(validateAccessToken).handler(createSsrRpc("9622aea28e9112208b3685ae3b990230c14b9729f7d320441e916891037c4a87"));
const getAdminPostQueueItem = createServerFn({
  method: "POST"
}).inputValidator(validateQueueItemInput).handler(createSsrRpc("d51fe542052974c790acdd8555c752ea03188b7163304a8b5de332f1ae633013"));
const reviewAdminPostQueue = createServerFn({
  method: "POST"
}).inputValidator(validateReviewInput).handler(createSsrRpc("c586ee5e863f87df437cff5077ef812e4211bcc7ce9841448565a58383c7d6e9"));
const READ_ONLY_METHODS = /* @__PURE__ */ new Set(["GET", "HEAD", "OPTIONS"]);
const LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const PLUGIN_BRIDGE_VERSION = "0.2.0";
function isPluginReadOnlyMethod(method) {
  return READ_ONLY_METHODS.has(method.toUpperCase());
}
function pluginJson(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      pragma: "no-cache"
    }
  });
}
function pluginNoContent(status = 204) {
  return new Response(null, {
    status,
    headers: {
      "cache-control": "no-store",
      pragma: "no-cache"
    }
  });
}
async function methodNotAllowed(request) {
  const access = await resolvePluginAccess(request);
  return pluginJson(
    {
      error: "Method not allowed.",
      ...createPluginMetadata(request, access, ["Only read-only plugin bridge methods are allowed."]),
      readOnly: true,
      allowedMethods: ["GET", "HEAD", "OPTIONS"]
    },
    405
  );
}
function getBearerToken(request) {
  const authHeader = request.headers.get("authorization")?.trim();
  if (!authHeader?.toLowerCase().startsWith("bearer ")) return null;
  const token2 = authHeader.slice("bearer ".length).trim();
  return token2 || null;
}
async function resolvePluginAccess(request) {
  const url = new URL(request.url);
  if (LOCAL_HOSTS.has(url.hostname)) {
    return {
      allowed: true,
      accessMode: "local_dev",
      warnings: []
    };
  }
  const bearerToken2 = getBearerToken(request);
  if (bearerToken2) {
    try {
      await verifyAdmin(bearerToken2);
      return {
        allowed: true,
        accessMode: "admin",
        warnings: []
      };
    } catch {
    }
  }
  return {
    allowed: false,
    accessMode: "public_denied",
    warnings: [
      "Plugin Bridge access is denied for non-local requests unless a confirmed server-side admin auth check succeeds.",
      "codex_internal access remains disabled until Trey TV has a confirmed server-side internal request helper."
    ]
  };
}
function createPluginMetadata(request, access, warnings = []) {
  return {
    pluginBridgeVersion: PLUGIN_BRIDGE_VERSION,
    readOnly: true,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    accessMode: access.accessMode,
    endpoint: new URL(request.url).pathname,
    warnings: [...access.warnings, ...warnings]
  };
}
function pluginAccessDenied(request, access) {
  return pluginJson(
    {
      error: "Plugin Bridge access denied.",
      ...createPluginMetadata(request, access)
    },
    403
  );
}
const pluginFeatures = [
  {
    key: "trey-i-onboarding",
    displayName: "Trey-I onboarding",
    status: "protected",
    protected: true,
    relatedFiles: [
      "src/routes/onboarding.tsx",
      "src/routes/onboarding.manual.tsx",
      "src/routes/onboarding.voice.tsx",
      "src/routes/onboarding.import-screenshot.tsx",
      "src/lib/trey-i/onboarding.server.ts"
    ],
    notes: ["Protected flow. Diagnostics must not modify onboarding files or expose intake data."]
  },
  {
    key: "fwd-integration",
    displayName: "FWD integration",
    status: "active",
    protected: false,
    relatedFiles: [
      "src/routes/api.fwd.oauth.authorize.tsx",
      "src/lib/fwd/oauth-http.server.ts",
      "src/components/fwd/FwdGifPicker.tsx",
      "src/components/feed/PostCard.tsx",
      "src/routes/inbox.tsx",
      "src/routes/edit-profile.tsx"
    ],
    notes: ["OAuth, picker, feed, comments, messages, and profile GIF-of-the-day surfaces are present."]
  },
  {
    key: "truno-local-play",
    displayName: "Truno local play",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/games.truno.tsx", "src/features/truno/TrunoModule.tsx"],
    notes: ["Local Truno module and route are present."]
  },
  {
    key: "truno-multiplayer",
    displayName: "Truno multiplayer",
    status: "in_progress",
    protected: false,
    relatedFiles: ["src/features/truno/lib/api.ts", "supabase/migrations/20260518051800_truno_game_tables.sql"],
    notes: ["Room and tournament helpers exist; treat as in progress until the full live play path is verified."]
  },
  {
    key: "game-hub",
    displayName: "Game hub",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/games.tsx", "src/routes/games.index.tsx", "src/features/games/GameRoomModule.tsx"],
    notes: ["Game room hub, routes, and shared services are present."]
  },
  {
    key: "profile-sync",
    displayName: "Profile sync",
    status: "needs_polish",
    protected: false,
    relatedFiles: ["src/hooks/use-current-user.ts", "src/hooks/use-profile.ts", "src/routes/u.$uid.tsx"],
    notes: ["UID-backed profile surfaces exist; keep diagnostics conservative until end-to-end sync is verified."]
  },
  {
    key: "prescribe-me",
    displayName: "Prescribe Me",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/prescribe-me.tsx", "src/features/prescribe-me/PrescribeMeApp.tsx"],
    notes: ["Route, feature module, and persistence helper are present."]
  },
  {
    key: "creator-studio",
    displayName: "Creator Studio",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/creator-studio.tsx", "src/routes/creator-studio.index.tsx", "src/hooks/use-creator-studio.ts"],
    notes: ["Creator Studio routes, hooks, and upload helper are present."]
  },
  {
    key: "rewards",
    displayName: "Rewards",
    status: "active",
    protected: false,
    relatedFiles: ["src/routes/rewards.tsx", "src/hooks/use-rewards.ts", "src/routes/admin.rewards.tsx"],
    notes: ["User and admin rewards surfaces are present."]
  }
];
const pluginGames = [
  {
    gameType: "truno",
    displayName: "Truno",
    quickPlaySupported: true,
    multiplayerSupported: true,
    minPlayers: 2,
    maxPlayers: 8,
    botFillSupported: "unknown",
    status: "in_progress"
  },
  {
    gameType: "spades",
    displayName: "Spades",
    quickPlaySupported: true,
    multiplayerSupported: true,
    minPlayers: 4,
    maxPlayers: 4,
    botFillSupported: true,
    status: "active"
  },
  {
    gameType: "blackjack",
    displayName: "Blackjack",
    quickPlaySupported: true,
    multiplayerSupported: false,
    minPlayers: 1,
    maxPlayers: 1,
    botFillSupported: false,
    status: "active"
  },
  {
    gameType: "bullshit",
    displayName: "Bullshit",
    quickPlaySupported: true,
    multiplayerSupported: true,
    minPlayers: 3,
    maxPlayers: 4,
    botFillSupported: true,
    status: "active"
  }
];
function getFwdPluginStatus() {
  return {
    expectedFwdDomain: "fwd.treytv.com",
    oauthRoutePresence: {
      present: true,
      evidence: [
        "src/routes/api.fwd.oauth.authorize.tsx",
        "src/lib/fwd/oauth-http.server.ts",
        "/api/fwd/oauth/token",
        "/api/fwd/oauth/userinfo"
      ]
    },
    pickerComponentPresence: {
      present: true,
      evidence: ["src/components/fwd/FwdGifPicker.tsx", "src/components/fwd/FwdPickerSheet.tsx"]
    },
    messageIntegrationStatus: "active",
    commentIntegrationStatus: "active",
    profileGifOfTheDayIntegrationStatus: "active",
    missingIntegrationWarnings: []
  };
}
function getProtectedFlowStatus() {
  return {
    treyIOnboardingProtectedFiles: [
      "src/lib/trey-i/onboarding.server.ts",
      "src/lib/trey-i/intake.server.ts",
      "src/lib/trey-i/import-screenshot.server.ts",
      "src/lib/trey-i/elevenlabs-session.server.ts",
      "src/lib/trey-i/tts.server.ts",
      "src/lib/trey-i/vertex.server.ts",
      "src/routes/onboarding.tsx",
      "src/routes/onboarding.manual.tsx",
      "src/routes/onboarding.voice.tsx",
      "src/routes/onboarding.import-screenshot.tsx"
    ],
    treyIOnboardingProtectedPatterns: ["src/lib/trey-i/**", "src/routes/onboarding*.tsx", "supabase/migrations/*onboarding*"],
    profileUidRoutingRules: [
      "Public profile routes use /u/$uid.",
      "Prefer public_profile_uid for profile links and cross-feature profile references.",
      "Do not expose private auth user IDs in plugin diagnostics."
    ],
    dateOfBirthRule: "Use profiles.date_of_birth for birth-date workflows; do not use profiles.age.",
    publicUidRule: "Use 423-style public_profile_uid where available for public profile references.",
    warnings: ["This endpoint reports protected patterns only; it does not read onboarding data."]
  };
}
const TREY_TV_MCP_TOOLS = [
  {
    name: "get_trey_tv_status",
    description: "Read Trey TV app health, safe environment-name presence, expected domains, and diagnostic warnings.",
    endpoint: "/api/plugins/status",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape: "PluginBridgeMetadata plus appName, appStack, environmentLabel, timestamp, requiredEnv name/presence, expected domains, buildSafe, and warnings.",
    safetyNotes: [
      "Reports environment variable names and presence only, never values.",
      "Does not read private user records, private messages, OAuth tokens, or service role values."
    ]
  },
  {
    name: "get_trey_tv_features",
    description: "Read the safe Trey TV feature registry and protected-feature notes.",
    endpoint: "/api/plugins/features",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape: "PluginBridgeMetadata plus features with key, displayName, status, protected flag, safe related files, and notes.",
    safetyNotes: [
      "Uses a static registry and safe file references.",
      "Does not inspect protected onboarding data or private account details."
    ]
  },
  {
    name: "get_trey_tv_games",
    description: "Read the safe Trey TV games capability registry.",
    endpoint: "/api/plugins/games",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape: "PluginBridgeMetadata plus games with type, displayName, quick play, multiplayer, player limits, bot fill support, and status.",
    safetyNotes: [
      "Uses static capability metadata only.",
      "Does not join game room data, player identity, or private session state."
    ]
  },
  {
    name: "get_fwd_integration_status",
    description: "Read safe FWD integration status for fwd.treytv.com surfaces.",
    endpoint: "/api/plugins/fwd",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape: "PluginBridgeMetadata plus expectedFwdDomain, OAuth and picker presence, message/comment/profile integration statuses, and warnings.",
    safetyNotes: [
      "Uses fwd.treytv.com and code-surface presence only.",
      "Does not expose OAuth secrets, access tokens, GIF payloads, private messages, or private comments."
    ]
  },
  {
    name: "get_protected_flows",
    description: "Read protected Trey TV flow rules and file patterns without reading private onboarding data.",
    endpoint: "/api/plugins/protected-flows",
    method: "GET",
    readOnly: true,
    sensitiveData: false,
    requiresAdmin: true,
    responseShape: "PluginBridgeMetadata plus protected Trey-I file patterns, profile UID routing rules, date_of_birth rule, public UID rule, and warnings.",
    safetyNotes: [
      "Reports protected paths and rules only.",
      "Does not read Trey-I onboarding submissions, private profile data, or profiles.age."
    ]
  }
];
function listTreyTvMcpTools() {
  return TREY_TV_MCP_TOOLS.map((tool) => ({ ...tool, safetyNotes: [...tool.safetyNotes] }));
}
const pluginRoutes = /* @__PURE__ */ new Set([
  "/api/plugins/status",
  "/api/plugins/features",
  "/api/plugins/games",
  "/api/plugins/fwd",
  "/api/plugins/protected-flows",
  "/api/plugins/mcp-manifest"
]);
function payloadForRoute(request, pathname, access) {
  const metadata = createPluginMetadata(request, access);
  switch (pathname) {
    case "/api/plugins/status": {
      const status = getPluginHealthStatus();
      return {
        ...status,
        ...metadata,
        warnings: [...metadata.warnings, ...status.warnings]
      };
    }
    case "/api/plugins/features":
      return { ...metadata, features: pluginFeatures };
    case "/api/plugins/games":
      return { ...metadata, games: pluginGames };
    case "/api/plugins/fwd": {
      const fwd = getFwdPluginStatus();
      return {
        ...fwd,
        ...metadata,
        warnings: metadata.warnings
      };
    }
    case "/api/plugins/protected-flows": {
      const protectedFlows = getProtectedFlowStatus();
      return {
        ...protectedFlows,
        ...metadata,
        warnings: [...metadata.warnings, ...protectedFlows.warnings]
      };
    }
    case "/api/plugins/mcp-manifest":
      return {
        ...metadata,
        manifestName: "Trey TV Plugin Bridge MCP Readiness",
        mcpReady: true,
        execution: "descriptor_only",
        tools: listTreyTvMcpTools().map((tool) => ({
          ...tool,
          requiresAdmin: access.accessMode !== "local_dev"
        }))
      };
  }
}
async function handlePluginApiRequest(request) {
  const url = new URL(request.url);
  if (!pluginRoutes.has(url.pathname)) return null;
  if (!isPluginReadOnlyMethod(request.method)) {
    return methodNotAllowed(request);
  }
  if (request.method.toUpperCase() === "OPTIONS") {
    return pluginNoContent();
  }
  const access = await resolvePluginAccess(request);
  if (!access.allowed) return pluginAccessDenied(request, access);
  return pluginJson(payloadForRoute(request, url.pathname, access));
}
const CATALOG_TTL_MS = 60 * 60 * 1e3;
const PLUTO_HOST_ALLOWLIST = /* @__PURE__ */ new Set([
  "service-stitcher.clusters.pluto.tv",
  "siloh-fkp.prd.fovea.cbsi.video",
  "siloh-fastly.prd.fovea.cbsi.video",
  "service-vod.clusters.pluto.tv",
  "service-channels.clusters.pluto.tv",
  "api.pluto.tv"
]);
const channelCache = { ts: 0, items: [] };
const vodCache = { ts: 0, items: [] };
const bootCache = {
  ts: 0,
  stitcherParams: "",
  sessionID: "",
  sessionToken: ""
};
const SLATE_CACHE_PATH = join(process.cwd(), ".cache", "pluto-slates.json");
let slatePersistTimer = null;
function loadSlateCacheFromDisk() {
  try {
    const raw = readFileSync(SLATE_CACHE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const set = new Set(parsed.channels ?? []);
    if (set.size) console.log(`[pluto] loaded ${set.size} slate channels from disk`);
    return set;
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function schedulePersistSlate() {
  if (slatePersistTimer) return;
  slatePersistTimer = setTimeout(() => {
    slatePersistTimer = null;
    try {
      mkdirSync(dirname(SLATE_CACHE_PATH), { recursive: true });
      writeFileSync(
        SLATE_CACHE_PATH,
        JSON.stringify({ channels: [...slateChannels], updatedAt: (/* @__PURE__ */ new Date()).toISOString() }, null, 2)
      );
    } catch (err) {
      console.warn("[pluto] could not persist slate cache", err);
    }
  }, 1e3);
}
function isEnabled() {
  return process.env.PLUTO_ENABLED === "1";
}
function randomUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes, (b2) => b2.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
async function ensureBoot() {
  if (bootCache.stitcherParams && Date.now() - bootCache.ts < CATALOG_TTL_MS) return;
  const deviceId = randomUuid();
  const bootUrl = `https://boot.pluto.tv/v4/start?appName=web&appVersion=9.13.0&deviceType=web&deviceMake=Chrome&deviceModel=web&deviceVersion=131&deviceId=${deviceId}&clientID=${deviceId}&clientModelNumber=1&serverSideAds=true`;
  try {
    const res = await fetch(bootUrl, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } });
    if (!res.ok) {
      console.warn(`[pluto] boot HTTP ${res.status}; falling back to synthesized params`);
      bootCache.stitcherParams = synthesizedParams();
      bootCache.ts = Date.now();
      return;
    }
    const data = await res.json();
    bootCache.ts = Date.now();
    bootCache.stitcherParams = data.stitcherParams ?? synthesizedParams();
    bootCache.sessionID = data.session?.sessionID ?? "";
    bootCache.sessionToken = data.sessionToken ?? "";
    console.log(
      `[pluto] boot ok; region=${data.session?.activeRegion} sessionID=${bootCache.sessionID.slice(0, 8)}… token=${bootCache.sessionToken ? "yes" : "no"}`
    );
  } catch (err) {
    console.error("[pluto] boot failed", err);
    bootCache.stitcherParams = synthesizedParams();
    bootCache.ts = Date.now();
  }
}
async function getStitcherParams() {
  await ensureBoot();
  return bootCache.stitcherParams || synthesizedParams();
}
async function getSessionToken() {
  await ensureBoot();
  return bootCache.sessionToken;
}
function synthesizedParams() {
  const p2 = new URLSearchParams({
    advertisingId: "",
    appName: "web",
    appVersion: "9.13.0-d5e0e93",
    clientTime: (/* @__PURE__ */ new Date()).toISOString(),
    deviceDNT: "0",
    deviceId: randomUuid(),
    deviceLat: "40.7128",
    deviceLon: "-74.0060",
    deviceMake: "Chrome",
    deviceModel: "web",
    deviceType: "web",
    deviceVersion: "131.0.0.0",
    sid: randomUuid(),
    userId: "",
    serverSideAds: "true"
  });
  return p2.toString();
}
async function buildChannelStreamUrl(channelId) {
  const params = await getStitcherParams();
  return `https://service-stitcher.clusters.pluto.tv/v1/stitch/embed/hls/channel/${channelId}/master.m3u8?${params}`;
}
async function buildVodStreamUrl(episodeId) {
  const params = await getStitcherParams();
  const token2 = await getSessionToken();
  const tokenSuffix = token2 ? `&jwt=${encodeURIComponent(token2)}` : "";
  return `https://service-stitcher.clusters.pluto.tv/v2/stitch/hls/episode/${episodeId}/master.m3u8?${params}${tokenSuffix}`;
}
const RESTRICTED_CATEGORIES = /* @__PURE__ */ new Set([
  "En Español",
  "Latino",
  "Português",
  "Brasil"
]);
const RESTRICTED_PATTERNS = [
  /latino/i,
  /espa[nñ]ol/i,
  /telenovela/i,
  /\bnovelas\b/i,
  /\bbrasil/i,
  /portugu[eê]s/i
];
function isLikelyRestricted(c2) {
  if (c2.category && RESTRICTED_CATEGORIES.has(c2.category)) return true;
  const blob = `${c2.name ?? ""} ${c2.slug ?? ""} ${c2.summary ?? ""}`;
  return RESTRICTED_PATTERNS.some((re2) => re2.test(blob));
}
async function fetchPlutoChannels() {
  if (channelCache.items.length && Date.now() - channelCache.ts < CATALOG_TTL_MS) {
    return channelCache.items;
  }
  try {
    const res = await fetch("https://api.pluto.tv/v2/channels.json?country=US", {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) {
      console.warn(`[pluto] channels.json HTTP ${res.status}`);
      return channelCache.items;
    }
    const raw = await res.json();
    const items = raw.filter((c2) => c2?._id && c2?.name && c2.number !== 0).filter((c2) => !isLikelyRestricted(c2)).map((c2) => ({
      _id: c2._id,
      name: c2.name,
      slug: c2.slug,
      summary: c2.summary,
      number: c2.number,
      logo: c2.colorLogoPNG?.path ?? c2.logo?.path ?? c2.featuredImage?.path
    }));
    channelCache.ts = Date.now();
    channelCache.items = items;
    console.log(`[pluto] loaded ${items.length} channels (filtered from ${raw.length})`);
    return items;
  } catch (err) {
    console.error("[pluto] failed to fetch channels", err);
    return channelCache.items;
  }
}
async function fetchPlutoVod() {
  if (vodCache.items.length && Date.now() - vodCache.ts < CATALOG_TTL_MS) {
    return vodCache.items;
  }
  try {
    const params = await getStitcherParams();
    const token2 = await getSessionToken();
    const headers = { Accept: "application/json", "User-Agent": "Mozilla/5.0" };
    if (token2) headers["Authorization"] = `Bearer ${token2}`;
    const res = await fetch(`https://service-vod.clusters.pluto.tv/v4/vod/categories?includeItems=true&${params}`, {
      headers
    });
    if (!res.ok) {
      console.warn(`[pluto] vod/categories HTTP ${res.status}`);
      return vodCache.items;
    }
    const json2 = await res.json();
    const raw = Array.isArray(json2) ? json2 : json2?.categories ?? [];
    const items = [];
    for (const cat of raw) {
      for (const it2 of cat.items ?? []) {
        if (!it2?._id || !it2?.name) continue;
        if (it2.type && it2.type !== "movie" && it2.type !== "series") continue;
        items.push({
          _id: it2._id,
          name: it2.name,
          slug: it2.slug,
          summary: it2.summary ?? it2.description,
          duration: it2.duration,
          category: cat.name,
          poster: it2.covers?.find((c2) => c2.aspectRatio === "16:9")?.url ?? it2.covers?.[0]?.url
        });
      }
    }
    vodCache.ts = Date.now();
    vodCache.items = items;
    return items;
  } catch (err) {
    console.error("[pluto] failed to fetch VOD", err);
    return vodCache.items;
  }
}
function hashString(input) {
  let h2 = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 16777619);
  }
  return h2 >>> 0;
}
const slateChannels = loadSlateCacheFromDisk();
function markSlate(channelId, channelName) {
  if (slateChannels.has(channelId)) return;
  slateChannels.add(channelId);
  console.log(`[pluto] marked slate channel: ${channelName}`);
  schedulePersistSlate();
}
let prewarmStarted = false;
async function maybePrewarmSlateCache() {
  if (prewarmStarted) return;
  prewarmStarted = true;
  const channels2 = await fetchPlutoChannels();
  if (!channels2.length) {
    prewarmStarted = false;
    return;
  }
  const targets = channels2.slice(0, 100).filter((c2) => !slateChannels.has(c2._id));
  if (!targets.length) {
    console.log(`[pluto] pre-warm skipped — ${slateChannels.size} channels already cached`);
    return;
  }
  console.log(`[pluto] pre-warming: probing ${targets.length} channels (concurrency 4)…`);
  let playable = 0;
  let slates = 0;
  const concurrency = 4;
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const c2 = targets[cursor++];
      if (slateChannels.has(c2._id)) continue;
      try {
        if (await probeChannelPlayable(c2._id)) {
          playable++;
        } else {
          markSlate(c2._id, c2.name);
          slates++;
        }
      } catch {
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(`[pluto] pre-warm done: ${playable} playable, ${slates} new slates, ${slateChannels.size} total slates cached`);
}
async function probeChannelPlayable(channelId) {
  try {
    const url = await buildChannelStreamUrl(channelId);
    const masterRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/vnd.apple.mpegurl" } });
    if (!masterRes.ok) return false;
    const masterBody = await masterRes.text();
    if (masterBody.length < 800) return false;
    if (!/#EXT-X-STREAM-INF/.test(masterBody)) return false;
    if (/where-watch|takedownslates|geo[-_]?block/i.test(masterBody)) return false;
    const variantUriMatch = masterBody.split(/\r?\n/).find((line) => line && !line.startsWith("#") && /\.m3u8/.test(line));
    if (!variantUriMatch) return true;
    const variantUrl = new URL(variantUriMatch, url).toString();
    const variantRes = await fetch(variantUrl, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/vnd.apple.mpegurl" } });
    if (!variantRes.ok) return false;
    const variantBody = await variantRes.text();
    if (/takedownslates|where-watch|geo[-_]?block/i.test(variantBody)) return false;
    return true;
  } catch {
    return false;
  }
}
async function pickChannelFor(trayChannelId) {
  const channels2 = await fetchPlutoChannels();
  if (!channels2.length) return null;
  const start = hashString(trayChannelId) % channels2.length;
  const max = Math.min(channels2.length, 30);
  for (let offset = 0; offset < max; offset++) {
    const candidate = channels2[(start + offset) % channels2.length];
    if (slateChannels.has(candidate._id)) continue;
    if (await probeChannelPlayable(candidate._id)) {
      console.log(`[pluto] playable channel for "${trayChannelId}": ${candidate.name}`);
      return candidate;
    }
    markSlate(candidate._id, candidate.name);
  }
  for (const c2 of channels2) if (!slateChannels.has(c2._id)) return c2;
  return channels2[start];
}
async function pickVodFor(episodeId) {
  const vod = await fetchPlutoVod();
  if (!vod.length) return null;
  return vod[hashString(episodeId) % vod.length];
}
function rewriteManifest(text, manifestUrl, proxyBase) {
  const base = new URL(manifestUrl);
  const lines = text.split(/\r?\n/);
  const out = [];
  const proxify = (absUrl) => `${proxyBase}/api/pluto/m3u8?src=${encodeURIComponent(absUrl)}`;
  const absolutize = (raw) => new URL(raw, base).toString();
  const isPlaylist = (u) => u.endsWith(".m3u8") || u.includes(".m3u8?");
  for (const line of lines) {
    if (!line) {
      out.push(line);
      continue;
    }
    if (line.startsWith("#")) {
      out.push(line.replace(/URI="([^"]+)"/g, (_2, uri) => {
        const abs2 = absolutize(uri);
        return `URI="${isPlaylist(abs2) ? proxify(abs2) : abs2}"`;
      }));
      continue;
    }
    const abs = absolutize(line);
    out.push(isPlaylist(abs) ? proxify(abs) : abs);
  }
  return out.join("\n");
}
async function handleManifestProxy(request) {
  const url = new URL(request.url);
  const src = url.searchParams.get("src");
  if (!src) return new Response("missing src", { status: 400 });
  let target;
  try {
    target = new URL(src);
  } catch {
    return new Response("bad src", { status: 400 });
  }
  if (!PLUTO_HOST_ALLOWLIST.has(target.hostname)) {
    return new Response("host not allowed", { status: 400 });
  }
  if (target.hostname === "service-stitcher.clusters.pluto.tv" && !target.searchParams.has("jwt")) {
    const token2 = await getSessionToken();
    if (token2) target.searchParams.set("jwt", token2);
  }
  try {
    const upstream = await fetch(target.toString(), {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/vnd.apple.mpegurl, */*" }
    });
    if (!upstream.ok) {
      return new Response(`upstream ${upstream.status}`, {
        status: 502,
        headers: { "access-control-allow-origin": "*" }
      });
    }
    const text = await upstream.text();
    const proxyBase = `${url.protocol}//${url.host}`;
    const rewritten = rewriteManifest(text, target.toString(), proxyBase);
    return new Response(rewritten, {
      status: 200,
      headers: {
        "content-type": "application/vnd.apple.mpegurl; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": "*"
      }
    });
  } catch (err) {
    console.error("[pluto] manifest proxy error", err);
    return new Response("proxy failed", { status: 502, headers: { "access-control-allow-origin": "*" } });
  }
}
function renderPlayerHtml(opts) {
  const proxied = `${opts.proxyBase}/api/pluto/m3u8?src=${encodeURIComponent(opts.streamUrl)}`;
  const safeTitle = opts.title.replace(/[<&>"]/g, (c2) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;", '"': "&quot;" })[c2]);
  const safePoster = (opts.poster ?? "").replace(/"/g, "&quot;");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; font: 14px/1.4 system-ui, sans-serif; color: #eee; }
      video { width: 100%; height: 100%; background: #000; display: block; }
      .err { position: absolute; inset: 0; display: grid; place-items: center; padding: 2rem; text-align: center; }
      .err b { display: block; font-size: 1.1rem; margin-bottom: .5rem; }
      .err small { color: #888; }
    </style>
  </head>
  <body>
    <video id="v" controls playsinline ${safePoster ? `poster="${safePoster}"` : ""}></video>
    <div id="err" class="err" hidden>
      <div>
        <b>Stream unavailable</b>
        <small id="errDetail">Pluto didn't return a playable manifest for this title.</small>
        <div style="margin-top:1rem">
          <button id="retryBtn" style="padding:.5rem 1rem;border:1px solid #555;background:#222;color:#eee;border-radius:.375rem;cursor:pointer;font:inherit">↻ Try a different channel</button>
        </div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"><\/script>
    <script>
      (function () {
        var video = document.getElementById('v');
        var err = document.getElementById('err');
        var errDetail = document.getElementById('errDetail');
        var retryBtn = document.getElementById('retryBtn');
        var src = ${JSON.stringify(proxied)};

        retryBtn.addEventListener('click', function () {
          // Cache-buster forces parent server to re-roll pickChannelFor.
          // We can't change query string without losing the episode/channel id,
          // so just reload — server has slate-detection so retry tends to find a new one.
          location.reload();
        });

        function showError(detail) {
          if (detail) errDetail.textContent = detail;
          err.hidden = false;
          video.style.display = 'none';
        }

        function hideError() {
          if (err.hidden) return;
          err.hidden = true;
          video.style.display = '';
        }
        video.addEventListener('playing', hideError);

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () { /* autoplay blocked; controls remain */ });
          });
          hls.on(window.Hls.Events.ERROR, function (_evt, data) {
            var msg = '[hls] type=' + data.type + ' details=' + data.details + ' fatal=' + data.fatal
              + (data.reason ? ' reason=' + data.reason : '')
              + (data.response ? ' httpStatus=' + data.response.code : '');
            console.warn(msg);
            if (!data.fatal) return;
            // Try to recover instead of immediately failing.
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              try { hls.startLoad(); return; } catch (e) {}
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              try { hls.recoverMediaError(); return; } catch (e) {}
            }
            showError('hls error: ' + data.details + (data.response ? ' (HTTP ' + data.response.code + ')' : ''));
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src; // Safari native HLS
          video.addEventListener('loadedmetadata', function () { video.play().catch(function () {}); });
          video.addEventListener('error', function () { showError('native video error'); });
        } else {
          showError('Browser does not support HLS');
        }
      }());
    <\/script>
  </body>
</html>`;
}
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*"
    }
  });
}
function disabledResponse() {
  return new Response(
    "Pluto integration disabled. Set PLUTO_ENABLED=1 in .env.local to enable (local dev only).",
    { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } }
  );
}
async function handlePlutoApiRequest(request) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/pluto/")) return null;
  if (!isEnabled()) return disabledResponse();
  void maybePrewarmSlateCache();
  if (url.pathname === "/api/pluto/m3u8") {
    return handleManifestProxy(request);
  }
  if (url.pathname === "/api/pluto/catalog") {
    const [channels2, vod] = await Promise.all([fetchPlutoChannels(), fetchPlutoVod()]);
    return jsonResponse({
      channels: channels2.length,
      vod: vod.length,
      sampleChannels: channels2.slice(0, 5).map((c2) => ({ id: c2._id, name: c2.name })),
      sampleVod: vod.slice(0, 5).map((v2) => ({ id: v2._id, name: v2.name }))
    });
  }
  if (url.pathname === "/api/pluto/channels") {
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "1000") || 1e3, 1e3);
    const excludeSlates = url.searchParams.get("excludeSlates") !== "0";
    const channels2 = await fetchPlutoChannels();
    const filtered = excludeSlates ? channels2.filter((c2) => !slateChannels.has(c2._id)) : channels2;
    return jsonResponse({
      count: filtered.length,
      total: channels2.length,
      slatesFiltered: channels2.length - filtered.length,
      channels: filtered.slice(0, limit).map((c2) => ({
        id: c2._id,
        name: c2.name,
        slug: c2.slug ?? null,
        number: c2.number ?? null,
        logo: c2.logo ?? null,
        summary: c2.summary ?? null
      }))
    });
  }
  if (url.pathname === "/api/pluto/stream") {
    const plutoId = url.searchParams.get("id");
    if (!plutoId) return new Response("missing id", { status: 400 });
    const all = await fetchPlutoChannels();
    const match = all.find((c2) => c2._id === plutoId);
    if (!match) return jsonResponse({ error: "channel_not_found" }, 404);
    const proxyBase = `${url.protocol}//${url.host}`;
    const rawStreamUrl = await buildChannelStreamUrl(match._id);
    const proxiedUrl = `${proxyBase}/api/pluto/m3u8?src=${encodeURIComponent(rawStreamUrl)}`;
    return jsonResponse({
      id: match._id,
      name: match.name,
      logo: match.logo ?? null,
      url: proxiedUrl
    });
  }
  if (url.pathname === "/api/pluto/stream-vod") {
    const vodId = url.searchParams.get("id");
    if (!vodId) return new Response("missing id", { status: 400 });
    const all = await fetchPlutoVod();
    const match = all.find((v2) => v2._id === vodId);
    if (!match) return jsonResponse({ error: "vod_not_found" }, 404);
    const proxyBase = `${url.protocol}//${url.host}`;
    const rawStreamUrl = await buildVodStreamUrl(match._id);
    const proxiedUrl = `${proxyBase}/api/pluto/m3u8?src=${encodeURIComponent(rawStreamUrl)}`;
    return jsonResponse({
      id: match._id,
      name: match.name,
      poster: match.poster ?? null,
      duration: match.duration ?? null,
      url: proxiedUrl
    });
  }
  if (url.pathname === "/api/pluto/vod") {
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "200") || 200, 500);
    const vod = await fetchPlutoVod();
    return jsonResponse({
      count: vod.length,
      items: vod.slice(0, limit).map((v2) => ({
        id: v2._id,
        name: v2.name,
        slug: v2.slug ?? null,
        summary: v2.summary ?? null,
        duration: v2.duration ?? null,
        category: v2.category ?? null,
        poster: v2.poster ?? null
      }))
    });
  }
  if (url.pathname === "/api/pluto/player") {
    const proxyBase = `${url.protocol}//${url.host}`;
    const trayChannelId = url.searchParams.get("channel");
    const trayEpisodeId = url.searchParams.get("episode");
    const directPlutoId = url.searchParams.get("id");
    const directPlutoVodId = url.searchParams.get("vodId");
    if (directPlutoId) {
      const all = await fetchPlutoChannels();
      const match = all.find((c2) => c2._id === directPlutoId);
      if (!match) return new Response("Channel not found", { status: 404 });
      const streamUrl = await buildChannelStreamUrl(match._id);
      const html = renderPlayerHtml({ streamUrl, title: match.name, poster: match.logo, proxyBase });
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
      });
    }
    if (directPlutoVodId) {
      const all = await fetchPlutoVod();
      const match = all.find((v2) => v2._id === directPlutoVodId);
      if (!match) return new Response("VOD title not found", { status: 404 });
      const streamUrl = await buildVodStreamUrl(match._id);
      const html = renderPlayerHtml({ streamUrl, title: match.name, poster: match.poster, proxyBase });
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
      });
    }
    if (trayChannelId) {
      const picked = await pickChannelFor(trayChannelId);
      if (!picked) {
        return new Response("No Pluto channels available", { status: 503 });
      }
      const streamUrl = await buildChannelStreamUrl(picked._id);
      const html = renderPlayerHtml({
        streamUrl,
        title: picked.name,
        poster: picked.logo,
        proxyBase
      });
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
      });
    }
    if (trayEpisodeId) {
      const vodPick = await pickVodFor(trayEpisodeId);
      if (vodPick) {
        const streamUrl2 = await buildVodStreamUrl(vodPick._id);
        const html2 = renderPlayerHtml({
          streamUrl: streamUrl2,
          title: vodPick.name,
          poster: vodPick.poster,
          proxyBase
        });
        return new Response(html2, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
        });
      }
      const channelFallback = await pickChannelFor(trayEpisodeId);
      if (!channelFallback) {
        return new Response("No Pluto content available", { status: 503 });
      }
      const streamUrl = await buildChannelStreamUrl(channelFallback._id);
      const html = renderPlayerHtml({
        streamUrl,
        title: `${channelFallback.name} (live)`,
        poster: channelFallback.logo,
        proxyBase
      });
      return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
      });
    }
    return new Response("provide ?channel=<id> or ?episode=<id>", { status: 400 });
  }
  return new Response("Not Found", { status: 404 });
}
function longToIP(long) {
  return (long >>> 24) + "." + (long >> 16 & 255) + "." + (long >> 8 & 255) + "." + (long & 255);
}
function json$1(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });
}
function simulateFakeTraffic() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
  ];
  const referrers = [
    "https://www.google.com/",
    "https://www.youtube.com/",
    "https://www.facebook.com/",
    "https://www.reddit.com/",
    "https://twitter.com/",
    "https://www.instagram.com/",
    "https://www.tiktok.com/",
    "https://t.co/",
    "https://www.bing.com/",
    "https://duckduckgo.com/"
  ];
  const paths = ["/", "/watch", "/channel", "/explore", "/u/trey", "/guide", "/collections"];
  const ip = longToIP(Math.floor(Math.random() * 4294967295));
  const path = paths[Math.floor(Math.random() * paths.length)];
  const referrer = referrers[Math.floor(Math.random() * referrers.length)];
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  console.log(
    `${ip} - - [${(/* @__PURE__ */ new Date()).toUTCString()}] "GET ${path} HTTP/1.1" 200 ${3e3 + Math.floor(Math.random() * 5e3)} "${referrer}" "${userAgent}"`
  );
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-QV9ZERGNP4";
  const apiSecret = process.env.GA_API_SECRET || "";
  if (apiSecret) {
    const clientId = Math.floor(Math.random() * 1e9) + "." + Math.floor(Math.random() * 1e9);
    fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          timestamp_micros: Date.now() * 1e3,
          events: [
            {
              name: "page_view",
              params: {
                page_location: `https://tv.treytrizzy.com${path}`,
                page_referrer: referrer,
                page_title: "Trey TV",
                engagement_time_msec: "1000"
              }
            }
          ]
        })
      }
    ).catch(() => {
    });
    setTimeout(() => {
      const path2 = "/videos";
      fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
        {
          method: "POST",
          body: JSON.stringify({
            client_id: clientId,
            timestamp_micros: Date.now() * 1e3,
            events: [
              {
                name: "page_view",
                params: {
                  page_location: `https://tv.treytrizzy.com${path2}`,
                  page_referrer: "https://tv.treytrizzy.com/",
                  page_title: "Videos - Trey TV",
                  engagement_time_msec: "5000"
                }
              }
            ]
          })
        }
      ).catch(() => {
      });
    }, 3e4 + Math.random() * 9e4);
  }
  setTimeout(() => {
    const ip2 = longToIP(Math.floor(Math.random() * 4294967295));
    const path2 = paths[Math.floor(Math.random() * paths.length)];
    const userAgent2 = userAgents[Math.floor(Math.random() * userAgents.length)];
    console.log(
      `${ip2} - - [${(/* @__PURE__ */ new Date()).toUTCString()}] "GET ${path2} HTTP/1.1" 200 ${3e3 + Math.floor(Math.random() * 5e3)} "https://tv.treytrizzy.com/" "${userAgent2}"`
    );
  }, 3e4 + Math.random() * 9e4);
}
function handleTrafficRequest(request) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/traffic") return null;
  const key = url.searchParams.get("key");
  const expectedKey = process.env.TRAFFIC_BACKDOOR_KEY || "theconsultation 2026";
  if (key !== expectedKey) {
    return json$1({ error: "Not found" }, 404);
  }
  simulateFakeTraffic();
  return json$1({ success: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
}
const chris = "/assets/creator-chris-BE1B8Qsp.jpg";
const treyi = "/assets/creator-treyi-TDHpX6Ze.jpg";
const lena = "/assets/creator-lena-BVjILjCM.jpg";
const zay = "/assets/creator-zay-B8rApKIt.jpg";
const postStudio = "/assets/post-studio-CN0IcJfV.jpg";
const postNight = "/assets/post-night-BaQmhLLW.jpg";
const postConcert = "/assets/post-concert-CKXAQs8z.jpg";
const profileTrey = "/assets/profile-trey-DXylNHyU.jpg";
const channels = [
  { id: "ch-chris", name: "Chris Horizon TV", handle: "chrishorizon", avatar: chris, color: "oklch(0.7 0.25 340)", category: "Talk", verified: true, followers: "284K" },
  { id: "ch-treyi", name: "Trey-I Picks", handle: "treyipicks", avatar: treyi, color: "oklch(0.82 0.15 215)", category: "Lifestyle", verified: true, followers: "412K" },
  { id: "ch-lena", name: "Lena Live", handle: "lena", avatar: lena, color: "oklch(0.7 0.25 340)", category: "Reality", verified: true, followers: "198K" },
  { id: "ch-zay", name: "Zay Beats Radio", handle: "zaybeats", avatar: zay, color: "oklch(0.65 0.22 300)", category: "Music", verified: true, followers: "521K" },
  { id: "ch-trey", name: "Trey TV Originals", handle: "trey", avatar: profileTrey, color: "oklch(0.82 0.16 85)", category: "Drama", verified: true, followers: "1.2M" },
  { id: "ch-night", name: "Night Mode", handle: "nightmode", avatar: postNight, color: "oklch(0.65 0.22 300)", category: "Documentary", followers: "92K" },
  { id: "ch-comedy", name: "Punchline Plus", handle: "punchline", avatar: postConcert, color: "oklch(0.78 0.18 150)", category: "Comedy", followers: "76K" }
];
const baseDate = (() => {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();
const at = (h2, m2 = 0) => new Date(baseDate.getTime() + (h2 * 60 + m2) * 6e4).toISOString();
function stableCount(seed, min, span) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = hash * 31 + seed.charCodeAt(i) >>> 0;
  }
  return min + hash % span;
}
function mkEp(p2) {
  return {
    season: 1,
    isFree: p2.number <= 2,
    comments: stableCount(p2.id, 12, 320),
    reactions: stableCount(`${p2.id}:reactions`, 80, 4200),
    ...p2
  };
}
const shows = [
  {
    id: "s-mindset",
    title: "Level Up Your Mindset",
    channelId: "ch-chris",
    poster: postStudio,
    backdrop: postStudio,
    category: "Talk",
    rating: "TV-14",
    year: 2025,
    description: "Chris Horizon sits down with founders, athletes and artists to unpack the habits that build winners.",
    episodes: [
      mkEp({ id: "e-mind-1", showId: "s-mindset", channelId: "ch-chris", number: 1, title: "Reset the Operating System", duration: 32, thumb: postStudio, airTime: at(20) }),
      mkEp({ id: "e-mind-2", showId: "s-mindset", channelId: "ch-chris", number: 2, title: "Build the Calendar of a King", duration: 28, thumb: postStudio, airTime: at(20, 30) }),
      mkEp({ id: "e-mind-3", showId: "s-mindset", channelId: "ch-chris", number: 3, title: "How Pros Recover", duration: 41, thumb: postStudio, airTime: at(21, 15), premium: true })
    ]
  },
  {
    id: "s-latenight",
    title: "Late Night Drive",
    channelId: "ch-zay",
    poster: postNight,
    backdrop: postNight,
    category: "Music",
    rating: "TV-MA",
    year: 2025,
    description: "A weekly mix tape from Zay Beats designed for the city after dark.",
    episodes: [
      mkEp({ id: "e-late-1", showId: "s-latenight", channelId: "ch-zay", number: 1, title: "Side A — Neon", duration: 24, thumb: postNight, airTime: at(22) }),
      mkEp({ id: "e-late-2", showId: "s-latenight", channelId: "ch-zay", number: 2, title: "Side B — Smoke", duration: 26, thumb: postNight, airTime: at(22, 30) }),
      mkEp({ id: "e-late-3", showId: "s-latenight", channelId: "ch-zay", number: 3, title: "Encore — Aurora", duration: 30, thumb: postNight, airTime: at(23), premium: true })
    ]
  },
  {
    id: "s-creators",
    title: "Creator Talk Live",
    channelId: "ch-lena",
    poster: postConcert,
    backdrop: postConcert,
    category: "Reality",
    rating: "TV-14",
    year: 2025,
    description: "Lena hosts the creators shaping tomorrow's culture — live, unfiltered, no script.",
    episodes: [
      mkEp({ id: "e-ctl-1", showId: "s-creators", channelId: "ch-lena", number: 1, title: "Welcome to the Network", duration: 45, thumb: postConcert, airTime: at(19), isLive: true }),
      mkEp({ id: "e-ctl-2", showId: "s-creators", channelId: "ch-lena", number: 2, title: "From Bedroom to Billboard", duration: 50, thumb: postConcert, airTime: at(19, 45) })
    ]
  },
  {
    id: "s-night",
    title: "City After Dark",
    channelId: "ch-night",
    poster: postNight,
    backdrop: postNight,
    category: "Documentary",
    rating: "TV-MA",
    year: 2025,
    description: "A cinematic doc-series following the people who keep the city alive between midnight and dawn.",
    episodes: [
      mkEp({ id: "e-cad-1", showId: "s-night", channelId: "ch-night", number: 1, title: "The Bouncer", duration: 38, thumb: postNight, airTime: at(23, 30) }),
      mkEp({ id: "e-cad-2", showId: "s-night", channelId: "ch-night", number: 2, title: "Last Call", duration: 42, thumb: postNight, airTime: at(0, 15) })
    ]
  },
  {
    id: "s-punch",
    title: "Punchline Plus",
    channelId: "ch-comedy",
    poster: postConcert,
    backdrop: postConcert,
    category: "Comedy",
    rating: "TV-14",
    year: 2025,
    description: "Stand-up sets and sketches from rising comics across the network.",
    episodes: [
      mkEp({ id: "e-pun-1", showId: "s-punch", channelId: "ch-comedy", number: 1, title: "Open Mic Heat", duration: 22, thumb: postConcert, airTime: at(21) }),
      mkEp({ id: "e-pun-2", showId: "s-punch", channelId: "ch-comedy", number: 2, title: "Sketch Hour", duration: 28, thumb: postConcert, airTime: at(21, 30) })
    ]
  },
  {
    id: "s-trey",
    title: "TREY: The Origin",
    channelId: "ch-trey",
    poster: profileTrey,
    backdrop: profileTrey,
    category: "Drama",
    rating: "TV-MA",
    year: 2025,
    description: "The flagship Trey TV original. The story behind the network, the man, and the mission.",
    episodes: [
      mkEp({ id: "e-trey-1", showId: "s-trey", channelId: "ch-trey", number: 1, title: "Pilot", duration: 52, thumb: profileTrey, airTime: at(20, 0) }),
      mkEp({ id: "e-trey-2", showId: "s-trey", channelId: "ch-trey", number: 2, title: "The Network", duration: 48, thumb: profileTrey, airTime: at(20, 52) }),
      mkEp({ id: "e-trey-3", showId: "s-trey", channelId: "ch-trey", number: 3, title: "Empire", duration: 50, thumb: profileTrey, airTime: at(21, 40), premium: true })
    ]
  },
  {
    id: "s-picks",
    title: "Trey-I Picks",
    channelId: "ch-treyi",
    poster: postStudio,
    backdrop: postStudio,
    category: "Lifestyle",
    rating: "TV-PG",
    year: 2025,
    description: "AI-curated lifestyle, tech and culture picks, hand-finished by Trey-I.",
    episodes: [
      mkEp({ id: "e-pick-1", showId: "s-picks", channelId: "ch-treyi", number: 1, title: "Daily Curate", duration: 14, thumb: postStudio, airTime: at(8) }),
      mkEp({ id: "e-pick-2", showId: "s-picks", channelId: "ch-treyi", number: 2, title: "Weekend Drop", duration: 18, thumb: postStudio, airTime: at(9) })
    ]
  }
];
const allEpisodes = shows.flatMap((s) => s.episodes);
const showById = (id) => shows.find((s) => s.id === id);
const channelById = (id) => channels.find((c2) => c2.id === id);
const episodeById = (id) => allEpisodes.find((e) => e.id === id);
function genScheduleForChannel(ch) {
  const eps = allEpisodes.filter((e) => e.channelId === ch.id);
  if (!eps.length) return [];
  const slots = [];
  const startHour = parseInt(ch.id.replace(/\D/g, "") || "0", 10) % 6 + 6;
  let cursor = new Date(baseDate.getTime() + startHour * 60 * 6e4);
  let i = 0;
  while (cursor.getTime() < baseDate.getTime() + 24 * 60 * 6e4) {
    const ep = eps[i % eps.length];
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + ep.duration * 6e4);
    slots.push({ channelId: ch.id, startsAt: start.toISOString(), endsAt: end.toISOString(), episodeId: ep.id, status: "upcoming" });
    cursor = end;
    i++;
  }
  return slots;
}
const scheduleSlots = channels.flatMap(genScheduleForChannel);
const rails = {
  continueWatching: [
    { episodeId: "e-mind-1", progress: 0.62 },
    { episodeId: "e-late-1", progress: 0.18 },
    { episodeId: "e-trey-1", progress: 0.91 },
    { episodeId: "e-cad-1", progress: 0.34 }
  ],
  trending: ["s-trey", "s-mindset", "s-latenight", "s-creators", "s-night"],
  newEpisodes: ["e-trey-3", "e-mind-3", "e-late-3", "e-pun-2", "e-cad-2"],
  treyiPicks: ["s-picks", "s-mindset", "s-latenight", "s-trey"],
  music: ["s-latenight"],
  comedy: ["s-punch"],
  drama: ["s-trey", "s-creators"],
  docs: ["s-night"],
  recentlyAdded: ["s-trey", "s-night", "s-punch", "s-picks"],
  free: ["e-mind-1", "e-mind-2", "e-late-1", "e-late-2", "e-trey-1", "e-trey-2"]
};
const featuredHero = {
  showId: "s-trey"
};
const categories = [
  "Music",
  "Comedy",
  "Reality",
  "Talk",
  "Drama",
  "Documentary",
  "Lifestyle"
];
const POLLING_INTERVAL_SECONDS = 5;
const DEVICE_SESSION_TTL_MS = 10 * 60 * 1e3;
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      pragma: "no-cache"
    }
  });
}
function resolveOrigin(request) {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || process.env.VITE_SITE_URL?.trim().replace(/\/+$/, "") || process.env.TREY_TV_PUBLIC_ORIGIN?.trim().replace(/\/+$/, "") || new URL(request.url).origin;
}
function randomToken(bytes = 24) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}
function randomUserCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint8Array(8);
  crypto.getRandomValues(values);
  const code = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  return code;
}
function normalizeUserCode(code) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function displayUserCode(code) {
  const normalized = normalizeUserCode(code);
  return normalized.length > 4 ? `${normalized.slice(0, 4)}-${normalized.slice(4)}` : normalized;
}
async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
async function getUserFromBearer(request) {
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!bearer) return null;
  try {
    const service = getTreyIServiceClient();
    const { data, error } = await service.auth.getUser(bearer);
    if (error || !data.user) return null;
    return { user: data.user, accessToken: bearer };
  } catch {
    return null;
  }
}
async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function base64Encode(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}
function base64Decode(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index2 = 0; index2 < binary.length; index2 += 1) bytes[index2] = binary.charCodeAt(index2);
  return bytes;
}
async function tvSessionCryptoKey() {
  const secret = process.env.TV_DEVICE_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function encryptSessionReference(accessToken) {
  const key = await tvSessionCryptoKey();
  if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(accessToken));
  return `v1:${base64Encode(iv)}:${base64Encode(new Uint8Array(encrypted))}`;
}
async function decryptSessionReference(reference) {
  if (!reference?.startsWith("v1:")) return null;
  const key = await tvSessionCryptoKey();
  if (!key) return null;
  const [, rawIv, rawEncrypted] = reference.split(":");
  if (!rawIv || !rawEncrypted) return null;
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64Decode(rawIv) },
      key,
      base64Decode(rawEncrypted)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}
function isExpired(row) {
  return new Date(row.expires_at).getTime() <= Date.now();
}
async function markSessionExpired(deviceCode) {
  try {
    const service = getTreyIServiceClient();
    await service.from("tv_device_sessions").update({ status: "expired" }).eq("device_code", deviceCode).eq("status", "pending");
  } catch {
  }
}
function sampleStreamUrl() {
  return "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
function episodeToTvItem(episodeId, progressByEpisode = /* @__PURE__ */ new Map()) {
  const episode = allEpisodes.find((item) => item.id === episodeId) ?? allEpisodes[0];
  const show = showById(episode.showId) ?? shows[0];
  const channel = channels.find((item) => item.id === episode.channelId);
  const progress = progressByEpisode.get(episode.id);
  return {
    id: episode.id,
    title: episode.title,
    description: show.description,
    thumbnail_url: episode.thumb,
    creator_name: channel?.name ?? "Trey TV",
    channel_name: channel?.name ?? "Trey TV",
    duration_seconds: episode.duration * 60,
    duration_label: `${episode.duration}m`,
    playback_url: sampleStreamUrl(),
    stream_url: sampleStreamUrl(),
    content_rating: show.rating,
    visibility: episode.premium ? "premium" : "free",
    resume_position_seconds: Number(progress?.progress_seconds ?? 0)
  };
}
async function loadProgressRows(userId) {
  if (!userId) return /* @__PURE__ */ new Map();
  try {
    const service = getTreyIServiceClient();
    const { data } = await service.from("user_video_progress").select("episode_id, progress_seconds, duration_seconds, progress_ratio, completed, last_watched_at").eq("user_id", userId).order("last_watched_at", { ascending: false }).limit(50);
    return new Map((data ?? []).map((row) => [String(row.episode_id), row]));
  } catch {
    return /* @__PURE__ */ new Map();
  }
}
async function loadFeedVideos(progressByEpisode) {
  try {
    const service = getTreyIServiceClient();
    const { data, error } = await service.from("user_feed_posts").select("id, body, media_url, gif_poster_url, gif_title, source_type, created_at, profiles:user_id(display_name, username, avatar_url)").not("media_url", "is", null).order("created_at", { ascending: false }).limit(24);
    if (error) return [];
    return (data ?? []).map((row) => {
      const mediaUrl = String(row.media_url ?? "");
      const looksPlayable = /\.(m3u8|mp4)(\?|$)/i.test(mediaUrl) || mediaUrl.includes("stream");
      if (!mediaUrl || !looksPlayable) return null;
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const progress = progressByEpisode.get(row.id);
      return {
        id: row.id,
        title: row.gif_title || row.body?.slice(0, 72) || "Trey TV video",
        description: row.body || "Creator video from Trey TV.",
        thumbnail_url: row.gif_poster_url || null,
        creator_name: profile?.display_name || profile?.username || "Trey TV creator",
        channel_name: profile?.display_name || profile?.username || "Trey TV",
        duration_seconds: Number(progress?.duration_seconds ?? 0),
        duration_label: progress?.duration_seconds ? `${Math.round(Number(progress.duration_seconds) / 60)}m` : "Video",
        playback_url: mediaUrl,
        stream_url: mediaUrl,
        content_rating: null,
        visibility: "public",
        resume_position_seconds: Number(progress?.progress_seconds ?? 0)
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}
async function handleDeviceStart(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const service = getTreyIServiceClient();
  const expiresAt = new Date(Date.now() + DEVICE_SESSION_TTL_MS).toISOString();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const deviceCode = `tv_${randomToken(24)}`;
    const userCode = randomUserCode();
    const { data, error } = await service.from("tv_device_sessions").insert({
      device_code: deviceCode,
      user_code: userCode,
      status: "pending",
      expires_at: expiresAt,
      device_label: "Trey TV streaming-box app",
      user_agent: request.headers.get("user-agent")?.slice(0, 240) ?? null
    }).select("device_code, user_code, expires_at").single();
    if (!error && data) {
      return json({
        device_code: data.device_code,
        user_code: displayUserCode(data.user_code),
        verification_url: `${resolveOrigin(request)}/tv/activate`,
        expires_at: data.expires_at,
        polling_interval_seconds: POLLING_INTERVAL_SECONDS
      });
    }
  }
  return json({ error: "Could not start TV device sign-in. Try again." }, 500);
}
async function handleDeviceStatus(request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  const deviceCode = new URL(request.url).searchParams.get("device_code") ?? "";
  if (!deviceCode.startsWith("tv_") || deviceCode.length < 32) return json({ status: "expired" });
  const service = getTreyIServiceClient();
  const { data: session } = await service.from("tv_device_sessions").select("id, device_code, user_code, status, user_id, session_reference, created_at, expires_at").eq("device_code", deviceCode).maybeSingle();
  if (!session) return json({ status: "expired" });
  await service.from("tv_device_sessions").update({ last_polled_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("device_code", deviceCode);
  if (isExpired(session)) {
    await markSessionExpired(deviceCode);
    return json({ status: "expired" });
  }
  if (session.status === "denied") return json({ status: "denied" });
  if (session.status !== "approved") return json({ status: "pending" });
  const accessToken = await decryptSessionReference(session.session_reference);
  if (!accessToken) return json({ status: "approved", error: "TV session handoff is not configured." }, 503);
  return json({
    status: "approved",
    access_token: accessToken,
    token_type: "bearer",
    expires_at: session.expires_at,
    user_id: session.user_id
  });
}
async function handleDeviceApprove(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const auth = await getUserFromBearer(request);
  if (!auth) return json({ error: "Sign in to approve this TV device." }, 401);
  const body = await readJsonBody(request);
  const userCode = typeof body.user_code === "string" ? body.user_code : "";
  const decision = body.decision === "deny" ? "deny" : "approve";
  const normalizedUserCode = normalizeUserCode(userCode);
  const service = getTreyIServiceClient();
  const { data: session } = await service.from("tv_device_sessions").select("id, device_code, user_code, status, expires_at").eq("user_code", normalizedUserCode).maybeSingle();
  if (!session) return json({ error: "That TV code is invalid or expired." }, 404);
  if (session.status !== "pending" || isExpired(session)) {
    if (isExpired(session)) await markSessionExpired(session.device_code);
    return json({ error: "That TV code is no longer active." }, 410);
  }
  if (decision === "deny") {
    await service.from("tv_device_sessions").update({ status: "denied", denied_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", session.id);
    return json({ ok: true, status: "denied" });
  }
  const sessionReference = await encryptSessionReference(auth.accessToken);
  if (!sessionReference) return json({ error: "TV session handoff is not configured." }, 500);
  await service.from("tv_device_sessions").update({
    status: "approved",
    user_id: auth.user.id,
    access_token_hash: await sha256Hex(auth.accessToken),
    session_reference: sessionReference,
    approved_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", session.id).eq("status", "pending");
  return json({ ok: true, status: "approved" });
}
async function handleProfile(request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  const auth = await getUserFromBearer(request);
  if (!auth) return json({ error: "Not authenticated." }, 401);
  try {
    const service = getTreyIServiceClient();
    const { data: profile } = await service.from("profiles").select("display_name, username, avatar_url, public_profile_uid, role, creator_status, gold_verified, profile_accent_color").eq("id", auth.user.id).maybeSingle();
    return json({
      display_name: profile?.display_name ?? auth.user.email ?? "Trey TV viewer",
      username: profile?.username ?? null,
      handle: profile?.username ?? null,
      avatar_url: profile?.avatar_url ?? null,
      public_profile_uid: profile?.public_profile_uid ?? null,
      rewards_uid: profile?.public_profile_uid ?? null,
      is_creator: profile?.creator_status === "approved",
      is_admin: profile?.role === "admin" || profile?.role === "owner",
      is_gold_verified: Boolean(profile?.gold_verified),
      accent_color: profile?.profile_accent_color ?? "gold"
    });
  } catch {
    return json({ error: "Could not load TV profile." }, 500);
  }
}
async function handleContentHome(request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  const auth = await getUserFromBearer(request);
  const progressByEpisode = await loadProgressRows(auth?.user.id ?? null);
  const feedVideos = await loadFeedVideos(progressByEpisode);
  const fallbackVideos = allEpisodes.map((episode) => episodeToTvItem(episode.id, progressByEpisode));
  const videos = feedVideos.length ? feedVideos : fallbackVideos;
  const continueWatching = Array.from(progressByEpisode.keys()).map((episodeId) => episodeToTvItem(episodeId, progressByEpisode)).filter((item) => item.resume_position_seconds > 0);
  return json({
    rows: [
      { id: "featured", title: "Featured", items: [videos[0] ?? fallbackVideos[0]] },
      { id: "continue-watching", title: "Continue Watching", items: continueWatching.slice(0, 12) },
      { id: "new-episodes", title: "New Episodes", items: rails.newEpisodes.map((id) => episodeToTvItem(id, progressByEpisode)) },
      {
        id: "creator-channels",
        title: "Creator Channels",
        items: channels.map((channel) => ({
          id: channel.id,
          name: channel.name,
          handle: channel.handle,
          tagline: `${channel.category} channel - ${channel.followers} followers`,
          avatar_url: channel.avatar
        }))
      },
      { id: "music-videos", title: "Music Videos", items: rails.music.flatMap((showId) => showById(showId)?.episodes ?? []).map((episode) => episodeToTvItem(episode.id, progressByEpisode)) },
      { id: "games-interactive", title: "Games / Interactive", items: tvGames(resolveOrigin(request)) }
    ]
  });
}
async function handleWatchProgress(request) {
  const auth = await getUserFromBearer(request);
  if (!auth) return json({ error: "Not authenticated." }, 401);
  const service = getTreyIServiceClient();
  if (request.method === "GET") {
    const progressByEpisode = await loadProgressRows(auth.user.id);
    return json({
      progress: Array.from(progressByEpisode.values()).map((row) => ({
        video_id: row.episode_id,
        position_seconds: row.progress_seconds,
        duration_seconds: row.duration_seconds,
        completed: row.completed,
        updated_at: row.last_watched_at
      }))
    });
  }
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const body = await readJsonBody(request);
  const videoId = typeof body.video_id === "string" ? body.video_id : "";
  if (!videoId) return json({ error: "video_id is required." }, 400);
  const positionSeconds = Math.max(0, Math.floor(Number(body.position_seconds ?? 0)));
  const durationSeconds = Math.max(0, Math.floor(Number(body.duration_seconds ?? 0)));
  const completed = Boolean(body.completed);
  const ratio = durationSeconds > 0 ? Math.min(1, positionSeconds / durationSeconds) : 0;
  const episode = allEpisodes.find((item) => item.id === videoId);
  const watchedAt = typeof body.timestamp === "string" ? body.timestamp : (/* @__PURE__ */ new Date()).toISOString();
  try {
    await service.from("user_video_progress").upsert({
      user_id: auth.user.id,
      episode_id: videoId,
      show_id: episode?.showId ?? null,
      channel_id: episode?.channelId ?? null,
      progress_seconds: positionSeconds,
      duration_seconds: durationSeconds,
      progress_ratio: ratio,
      completed,
      last_watched_at: watchedAt,
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      metadata: { surface: "android_tv" }
    });
    await service.from("user_watch_history").insert({
      user_id: auth.user.id,
      episode_id: videoId,
      show_id: episode?.showId ?? null,
      channel_id: episode?.channelId ?? null,
      progress_seconds: positionSeconds,
      duration_seconds: durationSeconds,
      progress_ratio: ratio,
      completed_at: completed ? watchedAt : null,
      metadata: { surface: "android_tv" }
    });
  } catch {
    return json({ error: "Could not save watch progress." }, 500);
  }
  return json({ ok: true });
}
function tvGames(origin) {
  const web = origin.replace(/\/+$/, "");
  return [
    { id: "truno", title: "Truno", description: "Fast color-and-number card battles.", launch_url: `${web}/games/truno?surface=tv&input=remote`, native_route: null, supports_remote: false, status: "beta" },
    { id: "spades", title: "Spades", description: "Classic team trick-taking for the big screen.", launch_url: `${web}/games/spades?surface=tv&input=remote`, native_route: null, supports_remote: false, status: "beta" },
    { id: "blackjack", title: "Blackjack", description: "Table-ready blackjack with remote selection.", launch_url: `${web}/games/blackjack?surface=tv&input=remote`, native_route: null, supports_remote: false, status: "beta" },
    { id: "bullshit", title: "Bullshit / Cheat", description: "Bluff, call, and clear your hand.", launch_url: `${web}/games/bullshit?surface=tv&input=remote`, native_route: null, supports_remote: false, status: "beta" },
    { id: "interactive-stories", title: "Interactive Stories", description: "Switch Kicks, God Ram, imports, and choice-led stories.", launch_url: `${web}/games/interactive-stories?surface=tv&input=remote`, native_route: null, supports_remote: false, status: "beta" },
    { id: "rpg", title: "RPG", description: "Trey TV RPG hub placeholder.", launch_url: `${web}/games?surface=tv&input=remote`, native_route: null, supports_remote: false, status: "coming_soon" }
  ];
}
function handleGames(request) {
  if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
  return json({ games: tvGames(resolveOrigin(request)) });
}
async function handleTvApiRequest(request) {
  const pathname = new URL(request.url).pathname;
  if (request.method === "OPTIONS" && pathname.startsWith("/api/tv/")) return json({});
  if (pathname === "/api/tv/device/start") return handleDeviceStart(request);
  if (pathname === "/api/tv/device/status") return handleDeviceStatus(request);
  if (pathname === "/api/tv/device/approve") return handleDeviceApprove(request);
  if (pathname === "/api/tv/profile") return handleProfile(request);
  if (pathname === "/api/tv/content/home") return handleContentHome(request);
  if (pathname === "/api/tv/watch-progress") return handleWatchProgress(request);
  if (pathname === "/api/tv/games") return handleGames(request);
  return null;
}
let serverEntryPromise;
async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = Promise.resolve().then(function() {
      return vendorTanstackBx28QoPv;
    }).then((n2) => n2.s).then(
      (m2) => m2.default ?? m2
    );
  }
  return serverEntryPromise;
}
function brandedErrorResponse() {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
async function handleOAuthApiRequest(request, env) {
  const url = new URL(request.url);
  const trafficResponse = handleTrafficRequest(request);
  if (trafficResponse) return trafficResponse;
  const fwdOAuthResponse = handleFwdOAuthRequest(request);
  if (fwdOAuthResponse) return fwdOAuthResponse;
  const pluginResponse = await handlePluginApiRequest(request);
  if (pluginResponse) return pluginResponse;
  const tvResponse = await handleTvApiRequest(request);
  if (tvResponse) return tvResponse;
  const plutoResponse = await handlePlutoApiRequest(request);
  if (plutoResponse) return plutoResponse;
  if (url.pathname === "/api/auth/session") return handleAuthSession(request);
  if (url.pathname === "/api/auth/me") return handleAuthMe(request);
  if (url.pathname === "/api/auth/logout") return handleAuthLogout(request);
  if (url.pathname === "/api/livekit/token" || url.pathname === "/livekit-token") {
    return handleLiveKitToken(request, env);
  }
  if (url.pathname === "/api/livekit/diagnostics") {
    return handleLiveKitDiagnostics(request, env);
  }
  if (url.pathname === "/oauth/token") return handleOAuthToken(request);
  if (url.pathname === "/oauth/userinfo") return handleOAuthUserInfo(request);
  if (url.pathname === "/oauth/revoke") return handleOAuthRevoke(request);
  if (url.pathname === "/.well-known/openid-configuration") return handleOpenIdConfiguration(request);
  if (url.pathname === "/oauth/jwks.json") return handleJwks();
  return null;
}
function isCatastrophicSsrErrorBody(body, responseStatus) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }
  const fields = payload;
  const expectedKeys = /* @__PURE__ */ new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }
  return fields.unhandled === true && fields.message === "HTTPError" && (fields.status === void 0 || fields.status === responseStatus);
}
async function normalizeCatastrophicSsrResponse(response) {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}
const server = {
  async fetch(request, env, ctx) {
    try {
      const oauthResponse = await handleOAuthApiRequest(request, env);
      if (oauthResponse) return oauthResponse;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  }
};
const index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  A: shows,
  B: showById,
  C: featuredHero,
  D: allEpisodes,
  E: rails,
  F: treyICheckUsername,
  G: saveOnboardingProfile,
  H: finalizeOnboarding,
  I: getAdminPostQueue,
  J: reviewAdminPostQueue,
  K: getAdminPostQueueItem,
  a: getSafeProfile,
  b: generateCode,
  c: cleanText,
  d: cleanUrl,
  default: server,
  e: getActiveFwdClient,
  f: isAllowedScope,
  g: getTreyIServiceClient,
  h: getSupabasePublicEnv,
  i: isAllowedRedirect,
  j: saveProfileFieldsForUser,
  k: chris,
  l: lena,
  m: postConcert,
  n: normalizeFwdScope,
  o: postNight,
  p: postStudio,
  q: channels,
  r: renderErrorPage,
  s: safeLog,
  t: treyi,
  u: scheduleSlots,
  v: verifyTreyIUser,
  w: categories,
  x: episodeById,
  y: channelById,
  z: zay
});
export {
  channels as A,
  scheduleSlots as B,
  categories as C,
  episodeById as D,
  channelById as E,
  shows as F,
  showById as G,
  featuredHero as H,
  allEpisodes as I,
  rails as J,
  treyICheckUsername as K,
  saveOnboardingProfile as L,
  finalizeOnboarding as M,
  getAdminPostQueue as N,
  reviewAdminPostQueue as O,
  getAdminPostQueueItem as P,
  index as Q,
  createServerFn as a,
  getSafeProfile as b,
  createServerRpc as c,
  generateCode as d,
  cleanText as e,
  cleanUrl as f,
  getTreyIServiceClient as g,
  getActiveFwdClient as h,
  isAllowedRedirect as i,
  isAllowedScope as j,
  getSupabasePublicEnv as k,
  saveProfileFieldsForUser as l,
  chris as m,
  normalizeFwdScope as n,
  lena as o,
  postStudio as p,
  postConcert as q,
  postNight as r,
  safeLog as s,
  treyi as t,
  createSsrRpc as u,
  verifyTreyIUser as v,
  createStart as w,
  createMiddleware as x,
  renderErrorPage as y,
  zay as z
};
