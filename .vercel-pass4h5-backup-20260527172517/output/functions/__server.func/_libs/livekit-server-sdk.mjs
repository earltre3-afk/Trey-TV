import { T as TrackSource, C as CreateRoomRequest, R as Room, L as ListRoomsRequest, a as ListRoomsResponse, D as DeleteRoomRequest, U as UpdateRoomMetadataRequest, b as ListParticipantsRequest, c as ListParticipantsResponse, d as RoomParticipantIdentity, P as ParticipantInfo, F as ForwardParticipantRequest, M as MoveParticipantRequest, e as MuteRoomTrackRequest, f as MuteRoomTrackResponse, g as UpdateParticipantRequest, h as ParticipantPermission, i as UpdateSubscriptionsRequest, S as SendDataRequest } from "./livekit__protocol.mjs";
import { S as SignJWT } from "./jose.mjs";
function trackSourceToString(source) {
  switch (source) {
    case TrackSource.CAMERA:
      return "camera";
    case TrackSource.MICROPHONE:
      return "microphone";
    case TrackSource.SCREEN_SHARE:
      return "screen_share";
    case TrackSource.SCREEN_SHARE_AUDIO:
      return "screen_share_audio";
    default:
      throw new TypeError(`Cannot convert TrackSource ${source} to string`);
  }
}
function claimsToJwtPayload(grant) {
  var _a;
  const claim = { ...grant };
  if (Array.isArray((_a = claim.video) == null ? void 0 : _a.canPublishSources)) {
    claim.video.canPublishSources = claim.video.canPublishSources.map(trackSourceToString);
  }
  return claim;
}
const defaultTTL = `6h`;
class AccessToken {
  /**
   * Creates a new AccessToken
   * @param apiKey - API Key, can be set in env LIVEKIT_API_KEY
   * @param apiSecret - Secret, can be set in env LIVEKIT_API_SECRET
   */
  constructor(apiKey, apiSecret, options) {
    if (!apiKey) {
      apiKey = process.env.LIVEKIT_API_KEY;
    }
    if (!apiSecret) {
      apiSecret = process.env.LIVEKIT_API_SECRET;
    }
    if (!apiKey || !apiSecret) {
      throw Error("api-key and api-secret must be set");
    } else if (typeof document !== "undefined") {
      console.error(
        "You should not include your API secret in your web client bundle.\n\nYour web client should request a token from your backend server which should then use the API secret to generate a token. See https://docs.livekit.io/client/connect/"
      );
    }
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.grants = {};
    this.identity = options == null ? void 0 : options.identity;
    this.ttl = (options == null ? void 0 : options.ttl) || defaultTTL;
    if (typeof this.ttl === "number") {
      this.ttl = `${this.ttl}s`;
    }
    if (options == null ? void 0 : options.metadata) {
      this.metadata = options.metadata;
    }
    if (options == null ? void 0 : options.attributes) {
      this.attributes = options.attributes;
    }
    if (options == null ? void 0 : options.name) {
      this.name = options.name;
    }
  }
  /**
   * Adds a video grant to this token.
   * @param grant -
   */
  addGrant(grant) {
    this.grants.video = { ...this.grants.video ?? {}, ...grant };
  }
  /**
   * Adds an inference grant to this token.
   * @param grant -
   */
  addInferenceGrant(grant) {
    this.grants.inference = { ...this.grants.inference ?? {}, ...grant };
  }
  /**
   * Adds a SIP grant to this token.
   * @param grant -
   */
  addSIPGrant(grant) {
    this.grants.sip = { ...this.grants.sip ?? {}, ...grant };
  }
  /**
   * Adds an observability grant to this token.
   * @param grant -
   */
  addObservabilityGrant(grant) {
    this.grants.observability = { ...this.grants.observability ?? {}, ...grant };
  }
  get name() {
    return this.grants.name;
  }
  set name(name) {
    this.grants.name = name;
  }
  get metadata() {
    return this.grants.metadata;
  }
  /**
   * Set metadata to be passed to the Participant, used only when joining the room
   */
  set metadata(md) {
    this.grants.metadata = md;
  }
  get attributes() {
    return this.grants.attributes;
  }
  set attributes(attrs) {
    this.grants.attributes = attrs;
  }
  get kind() {
    return this.grants.kind;
  }
  set kind(kind) {
    this.grants.kind = kind;
  }
  get sha256() {
    return this.grants.sha256;
  }
  set sha256(sha) {
    this.grants.sha256 = sha;
  }
  get roomPreset() {
    return this.grants.roomPreset;
  }
  set roomPreset(preset) {
    this.grants.roomPreset = preset;
  }
  get roomConfig() {
    return this.grants.roomConfig;
  }
  set roomConfig(config) {
    this.grants.roomConfig = config;
  }
  /**
   * @returns JWT encoded token
   */
  async toJwt() {
    var _a;
    const secret = new TextEncoder().encode(this.apiSecret);
    const jwt = new SignJWT(claimsToJwtPayload(this.grants)).setProtectedHeader({ alg: "HS256" }).setIssuer(this.apiKey).setExpirationTime(this.ttl).setNotBefore(/* @__PURE__ */ new Date());
    if (this.identity) {
      jwt.setSubject(this.identity);
    } else if ((_a = this.grants.video) == null ? void 0 : _a.roomJoin) {
      throw Error("identity is required for join but not set");
    }
    return jwt.sign(secret);
  }
}
class ServiceBase {
  /**
   * @param apiKey - API Key.
   * @param secret - API Secret.
   * @param ttl - token TTL
   */
  constructor(apiKey, secret, ttl) {
    this.apiKey = apiKey;
    this.secret = secret;
    this.ttl = ttl || "10m";
  }
  async authHeader(grant, sip) {
    const at = new AccessToken(this.apiKey, this.secret, { ttl: this.ttl });
    if (grant) {
      at.addGrant(grant);
    }
    if (sip) {
      at.addSIPGrant(sip);
    }
    return {
      Authorization: `Bearer ${await at.toJwt()}`
    };
  }
}
const defaultPrefix = "/twirp";
const defaultTimeoutSeconds = 60;
const livekitPackage = "livekit";
class TwirpError extends Error {
  constructor(name, message, status, code, metadata) {
    super(message);
    this.name = name;
    this.status = status;
    this.code = code;
    this.metadata = metadata;
  }
}
class TwirpRpc {
  constructor(host, pkg, options) {
    if (host.startsWith("ws")) {
      host = host.replace("ws", "http");
    }
    this.host = host;
    this.pkg = pkg;
    this.requestTimeout = (options == null ? void 0 : options.requestTimeout) ?? defaultTimeoutSeconds;
    this.prefix = (options == null ? void 0 : options.prefix) || defaultPrefix;
  }
  async request(service, method, data, headers, timeout = this.requestTimeout) {
    const path = `${this.prefix}/${this.pkg}.${service}/${method}`;
    const url = new URL(path, this.host);
    const init = {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        ...headers
      },
      body: JSON.stringify(data)
    };
    if (timeout) {
      init.signal = AbortSignal.timeout(timeout * 1e3);
    }
    const response = await fetch(url, init);
    if (!response.ok) {
      const isJson = response.headers.get("content-type") === "application/json";
      let errorMessage = "Unknown internal error";
      let errorCode = void 0;
      let metadata = void 0;
      try {
        if (isJson) {
          const parsedError = await response.json();
          if ("msg" in parsedError) {
            errorMessage = parsedError.msg;
          }
          if ("code" in parsedError) {
            errorCode = parsedError.code;
          }
          if ("meta" in parsedError) {
            metadata = parsedError.meta;
          }
        } else {
          errorMessage = await response.text();
        }
      } catch (e) {
        console.debug(`Error when trying to parse error message, using defaults`, e);
      }
      throw new TwirpError(response.statusText, errorMessage, response.status, errorCode, metadata);
    }
    const parsedResp = await response.json();
    const camelcaseKeys = await import("./camelcase-keys.mjs").then((mod) => mod.default);
    return camelcaseKeys(parsedResp, { deep: true });
  }
}
async function getRandomBytes(size = 16) {
  if (globalThis.crypto) {
    return crypto.getRandomValues(new Uint8Array(size));
  } else {
    const nodeCrypto = await import("node:crypto");
    return nodeCrypto.getRandomValues(new Uint8Array(size));
  }
}
const svc = "RoomService";
class RoomServiceClient extends ServiceBase {
  /**
   *
   * @param host - hostname including protocol. i.e. 'https://<project>.livekit.cloud'
   * @param apiKey - API Key, can be set in env var LIVEKIT_API_KEY
   * @param secret - API Secret, can be set in env var LIVEKIT_API_SECRET
   * @param options - client options
   */
  constructor(host, apiKey, secret, options) {
    super(apiKey, secret);
    const rpcOptions = (options == null ? void 0 : options.requestTimeout) ? { requestTimeout: options.requestTimeout } : void 0;
    this.rpc = new TwirpRpc(host, livekitPackage, rpcOptions);
  }
  /**
   * Creates a new room. Explicit room creation is not required, since rooms will
   * be automatically created when the first participant joins. This method can be
   * used to customize room settings.
   * @param options -
   */
  async createRoom(options) {
    const data = await this.rpc.request(
      svc,
      "CreateRoom",
      new CreateRoomRequest(options).toJson(),
      await this.authHeader({ roomCreate: true })
    );
    return Room.fromJson(data, { ignoreUnknownFields: true });
  }
  /**
   * List active rooms
   * @param names - when undefined or empty, list all rooms.
   *                otherwise returns rooms with matching names
   * @returns
   */
  async listRooms(names) {
    const data = await this.rpc.request(
      svc,
      "ListRooms",
      new ListRoomsRequest({ names: names ?? [] }).toJson(),
      await this.authHeader({ roomList: true })
    );
    const res = ListRoomsResponse.fromJson(data, { ignoreUnknownFields: true });
    return res.rooms ?? [];
  }
  async deleteRoom(room) {
    await this.rpc.request(
      svc,
      "DeleteRoom",
      new DeleteRoomRequest({ room }).toJson(),
      await this.authHeader({ roomCreate: true })
    );
  }
  /**
   * Update metadata of a room
   * @param room - name of the room
   * @param metadata - the new metadata for the room
   */
  async updateRoomMetadata(room, metadata) {
    const data = await this.rpc.request(
      svc,
      "UpdateRoomMetadata",
      new UpdateRoomMetadataRequest({ room, metadata }).toJson(),
      await this.authHeader({ roomAdmin: true, room })
    );
    return Room.fromJson(data, { ignoreUnknownFields: true });
  }
  /**
   * List participants in a room
   * @param room - name of the room
   */
  async listParticipants(room) {
    const data = await this.rpc.request(
      svc,
      "ListParticipants",
      new ListParticipantsRequest({ room }).toJson(),
      await this.authHeader({ roomAdmin: true, room })
    );
    const res = ListParticipantsResponse.fromJson(data, { ignoreUnknownFields: true });
    return res.participants ?? [];
  }
  /**
   * Get information on a specific participant, including the tracks that participant
   * has published
   * @param room - name of the room
   * @param identity - identity of the participant to return
   */
  async getParticipant(room, identity) {
    const data = await this.rpc.request(
      svc,
      "GetParticipant",
      new RoomParticipantIdentity({ room, identity }).toJson(),
      await this.authHeader({ roomAdmin: true, room })
    );
    return ParticipantInfo.fromJson(data, { ignoreUnknownFields: true });
  }
  /**
   * Removes a participant in the room. This will disconnect the participant
   * and will emit a Disconnected event for that participant.
   * Even after being removed, the participant can still re-join the room.
   * @param room -
   * @param identity -
   */
  async removeParticipant(room, identity) {
    await this.rpc.request(
      svc,
      "RemoveParticipant",
      new RoomParticipantIdentity({ room, identity }).toJson(),
      await this.authHeader({ roomAdmin: true, room })
    );
  }
  /**
   * Forwards a participant's track to another room. This will create a
   * participant to join the destination room that has same information
   * with the source participant except the kind to be `Forwarded`. All
   * changes to the source participant will be reflected to the forwarded
   * participant. When the source participant disconnects or the
   * `RemoveParticipant` method is called in the destination room, the
   * forwarding will be stopped.
   * @param room -
   * @param identity -
   * @param destinationRoom - the room to forward the participant to
   */
  async forwardParticipant(room, identity, destinationRoom) {
    await this.rpc.request(
      svc,
      "ForwardParticipant",
      new ForwardParticipantRequest({ room, identity, destinationRoom }).toJson(),
      await this.authHeader({ roomAdmin: true, room, destinationRoom })
    );
  }
  /**
   * Move a connected participant to a different room. Requires `roomAdmin` and `destinationRoom`.
   * The participant will be removed from the current room and added to the destination room.
   * From the other observers' perspective, the participant would've disconnected from the previous room and joined the new one.
   * @param room -
   * @param identity -
   * @param destinationRoom - the room to move the participant to
   */
  async moveParticipant(room, identity, destinationRoom) {
    await this.rpc.request(
      svc,
      "MoveParticipant",
      new MoveParticipantRequest({ room, identity, destinationRoom }).toJson(),
      await this.authHeader({ roomAdmin: true, room, destinationRoom })
    );
  }
  /**
   * Mutes a track that the participant has published.
   * @param room -
   * @param identity -
   * @param trackSid - sid of the track to be muted
   * @param muted - true to mute, false to unmute
   */
  async mutePublishedTrack(room, identity, trackSid, muted) {
    const req = new MuteRoomTrackRequest({
      room,
      identity,
      trackSid,
      muted
    }).toJson();
    const data = await this.rpc.request(
      svc,
      "MutePublishedTrack",
      req,
      await this.authHeader({ roomAdmin: true, room })
    );
    const res = MuteRoomTrackResponse.fromJson(data, { ignoreUnknownFields: true });
    return res.track;
  }
  async updateParticipant(room, identity, metadataOrOptions, maybePermission, maybeName) {
    const hasOptions = typeof metadataOrOptions === "object";
    const metadata = hasOptions ? metadataOrOptions == null ? void 0 : metadataOrOptions.metadata : metadataOrOptions;
    const permission = hasOptions ? metadataOrOptions.permission : maybePermission;
    const name = hasOptions ? metadataOrOptions.name : maybeName;
    const attributes = hasOptions ? metadataOrOptions.attributes : {};
    const req = new UpdateParticipantRequest({
      room,
      identity,
      attributes,
      metadata,
      name
    });
    if (permission) {
      req.permission = new ParticipantPermission(permission);
    }
    const data = await this.rpc.request(
      svc,
      "UpdateParticipant",
      req.toJson(),
      await this.authHeader({ roomAdmin: true, room })
    );
    return ParticipantInfo.fromJson(data, { ignoreUnknownFields: true });
  }
  /**
   * Updates a participant's subscription to tracks
   * @param room -
   * @param identity -
   * @param trackSids -
   * @param subscribe - true to subscribe, false to unsubscribe
   */
  async updateSubscriptions(room, identity, trackSids, subscribe) {
    const req = new UpdateSubscriptionsRequest({
      room,
      identity,
      trackSids,
      subscribe,
      participantTracks: []
    }).toJson();
    await this.rpc.request(
      svc,
      "UpdateSubscriptions",
      req,
      await this.authHeader({ roomAdmin: true, room })
    );
  }
  async sendData(room, data, kind, options = {}) {
    const destinationSids = Array.isArray(options) ? options : options.destinationSids;
    const topic = Array.isArray(options) ? void 0 : options.topic;
    const req = new SendDataRequest({
      room,
      data,
      kind,
      destinationSids: destinationSids ?? [],
      topic
    });
    if (!Array.isArray(options) && options.destinationIdentities) {
      req.destinationIdentities = options.destinationIdentities;
    }
    req.nonce = await getRandomBytes(16);
    await this.rpc.request(
      svc,
      "SendData",
      req.toJson(),
      await this.authHeader({ roomAdmin: true, room })
    );
  }
}
export {
  AccessToken as A,
  RoomServiceClient as R
};
