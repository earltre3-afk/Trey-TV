import { p as proto3 } from "./bufbuild__protobuf.mjs";
const AudioCodec = /* @__PURE__ */ proto3.makeEnum(
  "livekit.AudioCodec",
  [
    { no: 0, name: "DEFAULT_AC" },
    { no: 1, name: "OPUS" },
    { no: 2, name: "AAC" },
    { no: 3, name: "AC_MP3" }
  ]
);
const VideoCodec = /* @__PURE__ */ proto3.makeEnum(
  "livekit.VideoCodec",
  [
    { no: 0, name: "DEFAULT_VC" },
    { no: 1, name: "H264_BASELINE" },
    { no: 2, name: "H264_MAIN" },
    { no: 3, name: "H264_HIGH" },
    { no: 4, name: "VP8" }
  ]
);
const ImageCodec = /* @__PURE__ */ proto3.makeEnum(
  "livekit.ImageCodec",
  [
    { no: 0, name: "IC_DEFAULT" },
    { no: 1, name: "IC_JPEG" }
  ]
);
const BackupCodecPolicy = /* @__PURE__ */ proto3.makeEnum(
  "livekit.BackupCodecPolicy",
  [
    { no: 0, name: "PREFER_REGRESSION" },
    { no: 1, name: "SIMULCAST" },
    { no: 2, name: "REGRESSION" }
  ]
);
const TrackType = /* @__PURE__ */ proto3.makeEnum(
  "livekit.TrackType",
  [
    { no: 0, name: "AUDIO" },
    { no: 1, name: "VIDEO" },
    { no: 2, name: "DATA" }
  ]
);
const TrackSource = /* @__PURE__ */ proto3.makeEnum(
  "livekit.TrackSource",
  [
    { no: 0, name: "UNKNOWN" },
    { no: 1, name: "CAMERA" },
    { no: 2, name: "MICROPHONE" },
    { no: 3, name: "SCREEN_SHARE" },
    { no: 4, name: "SCREEN_SHARE_AUDIO" }
  ]
);
const VideoQuality = /* @__PURE__ */ proto3.makeEnum(
  "livekit.VideoQuality",
  [
    { no: 0, name: "LOW" },
    { no: 1, name: "MEDIUM" },
    { no: 2, name: "HIGH" },
    { no: 3, name: "OFF" }
  ]
);
const DisconnectReason = /* @__PURE__ */ proto3.makeEnum(
  "livekit.DisconnectReason",
  [
    { no: 0, name: "UNKNOWN_REASON" },
    { no: 1, name: "CLIENT_INITIATED" },
    { no: 2, name: "DUPLICATE_IDENTITY" },
    { no: 3, name: "SERVER_SHUTDOWN" },
    { no: 4, name: "PARTICIPANT_REMOVED" },
    { no: 5, name: "ROOM_DELETED" },
    { no: 6, name: "STATE_MISMATCH" },
    { no: 7, name: "JOIN_FAILURE" },
    { no: 8, name: "MIGRATION" },
    { no: 9, name: "SIGNAL_CLOSE" },
    { no: 10, name: "ROOM_CLOSED" },
    { no: 11, name: "USER_UNAVAILABLE" },
    { no: 12, name: "USER_REJECTED" },
    { no: 13, name: "SIP_TRUNK_FAILURE" },
    { no: 14, name: "CONNECTION_TIMEOUT" },
    { no: 15, name: "MEDIA_FAILURE" },
    { no: 16, name: "AGENT_ERROR" }
  ]
);
const AudioTrackFeature = /* @__PURE__ */ proto3.makeEnum(
  "livekit.AudioTrackFeature",
  [
    { no: 0, name: "TF_STEREO" },
    { no: 1, name: "TF_NO_DTX" },
    { no: 2, name: "TF_AUTO_GAIN_CONTROL" },
    { no: 3, name: "TF_ECHO_CANCELLATION" },
    { no: 4, name: "TF_NOISE_SUPPRESSION" },
    { no: 5, name: "TF_ENHANCED_NOISE_CANCELLATION" },
    { no: 6, name: "TF_PRECONNECT_BUFFER" }
  ]
);
const PacketTrailerFeature = /* @__PURE__ */ proto3.makeEnum(
  "livekit.PacketTrailerFeature",
  [
    { no: 0, name: "PTF_USER_TIMESTAMP" },
    { no: 1, name: "PTF_FRAME_ID" }
  ]
);
const Room = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.Room",
  () => [
    {
      no: 1,
      name: "sid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "empty_timeout",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 14,
      name: "departure_timeout",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "max_participants",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "creation_time",
      kind: "scalar",
      T: 3
      /* ScalarType.INT64 */
    },
    {
      no: 15,
      name: "creation_time_ms",
      kind: "scalar",
      T: 3
      /* ScalarType.INT64 */
    },
    {
      no: 6,
      name: "turn_password",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 7, name: "enabled_codecs", kind: "message", T: Codec, repeated: true },
    {
      no: 8,
      name: "metadata",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 9,
      name: "num_participants",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 11,
      name: "num_publishers",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 10,
      name: "active_recording",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 13, name: "version", kind: "message", T: TimedVersion }
  ]
);
const Codec = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.Codec",
  () => [
    {
      no: 1,
      name: "mime",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "fmtp_line",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const ParticipantPermission = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ParticipantPermission",
  () => [
    {
      no: 1,
      name: "can_subscribe",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 2,
      name: "can_publish",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 3,
      name: "can_publish_data",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 9, name: "can_publish_sources", kind: "enum", T: proto3.getEnumType(TrackSource), repeated: true },
    {
      no: 7,
      name: "hidden",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 8,
      name: "recorder",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 10,
      name: "can_update_metadata",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 11,
      name: "agent",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 12,
      name: "can_subscribe_metrics",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 13,
      name: "can_manage_agent_session",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
const ParticipantInfo = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ParticipantInfo",
  () => [
    {
      no: 1,
      name: "sid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "identity",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 3, name: "state", kind: "enum", T: proto3.getEnumType(ParticipantInfo_State) },
    { no: 4, name: "tracks", kind: "message", T: TrackInfo, repeated: true },
    {
      no: 5,
      name: "metadata",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 6,
      name: "joined_at",
      kind: "scalar",
      T: 3
      /* ScalarType.INT64 */
    },
    {
      no: 17,
      name: "joined_at_ms",
      kind: "scalar",
      T: 3
      /* ScalarType.INT64 */
    },
    {
      no: 9,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 10,
      name: "version",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 11, name: "permission", kind: "message", T: ParticipantPermission },
    {
      no: 12,
      name: "region",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 13,
      name: "is_publisher",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 14, name: "kind", kind: "enum", T: proto3.getEnumType(ParticipantInfo_Kind) },
    { no: 15, name: "attributes", kind: "map", K: 9, V: {
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    } },
    { no: 16, name: "disconnect_reason", kind: "enum", T: proto3.getEnumType(DisconnectReason) },
    { no: 18, name: "kind_details", kind: "enum", T: proto3.getEnumType(ParticipantInfo_KindDetail), repeated: true },
    { no: 19, name: "data_tracks", kind: "message", T: DataTrackInfo, repeated: true },
    {
      no: 20,
      name: "client_protocol",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    }
  ]
);
const ParticipantInfo_State = /* @__PURE__ */ proto3.makeEnum(
  "livekit.ParticipantInfo.State",
  [
    { no: 0, name: "JOINING" },
    { no: 1, name: "JOINED" },
    { no: 2, name: "ACTIVE" },
    { no: 3, name: "DISCONNECTED" }
  ]
);
const ParticipantInfo_Kind = /* @__PURE__ */ proto3.makeEnum(
  "livekit.ParticipantInfo.Kind",
  [
    { no: 0, name: "STANDARD" },
    { no: 1, name: "INGRESS" },
    { no: 2, name: "EGRESS" },
    { no: 3, name: "SIP" },
    { no: 4, name: "AGENT" },
    { no: 7, name: "CONNECTOR" },
    { no: 8, name: "BRIDGE" }
  ]
);
const ParticipantInfo_KindDetail = /* @__PURE__ */ proto3.makeEnum(
  "livekit.ParticipantInfo.KindDetail",
  [
    { no: 0, name: "CLOUD_AGENT" },
    { no: 1, name: "FORWARDED" },
    { no: 2, name: "CONNECTOR_WHATSAPP" },
    { no: 3, name: "CONNECTOR_TWILIO" },
    { no: 4, name: "BRIDGE_RTSP" }
  ]
);
const Encryption_Type = /* @__PURE__ */ proto3.makeEnum(
  "livekit.Encryption.Type",
  [
    { no: 0, name: "NONE" },
    { no: 1, name: "GCM" },
    { no: 2, name: "CUSTOM" }
  ]
);
const SimulcastCodecInfo = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.SimulcastCodecInfo",
  () => [
    {
      no: 1,
      name: "mime_type",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "mid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "cid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 4, name: "layers", kind: "message", T: VideoLayer, repeated: true },
    { no: 5, name: "video_layer_mode", kind: "enum", T: proto3.getEnumType(VideoLayer_Mode) },
    {
      no: 6,
      name: "sdp_cid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const TrackInfo = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.TrackInfo",
  () => [
    {
      no: 1,
      name: "sid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 2, name: "type", kind: "enum", T: proto3.getEnumType(TrackType) },
    {
      no: 3,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "muted",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 5,
      name: "width",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "height",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 7,
      name: "simulcast",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 8,
      name: "disable_dtx",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 9, name: "source", kind: "enum", T: proto3.getEnumType(TrackSource) },
    { no: 10, name: "layers", kind: "message", T: VideoLayer, repeated: true },
    {
      no: 11,
      name: "mime_type",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 12,
      name: "mid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 13, name: "codecs", kind: "message", T: SimulcastCodecInfo, repeated: true },
    {
      no: 14,
      name: "stereo",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 15,
      name: "disable_red",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 16, name: "encryption", kind: "enum", T: proto3.getEnumType(Encryption_Type) },
    {
      no: 17,
      name: "stream",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 18, name: "version", kind: "message", T: TimedVersion },
    { no: 19, name: "audio_features", kind: "enum", T: proto3.getEnumType(AudioTrackFeature), repeated: true },
    { no: 20, name: "backup_codec_policy", kind: "enum", T: proto3.getEnumType(BackupCodecPolicy) },
    { no: 21, name: "packet_trailer_features", kind: "enum", T: proto3.getEnumType(PacketTrailerFeature), repeated: true }
  ]
);
const DataTrackInfo = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.DataTrackInfo",
  () => [
    {
      no: 1,
      name: "pub_handle",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "sid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 4, name: "encryption", kind: "enum", T: proto3.getEnumType(Encryption_Type) }
  ]
);
const VideoLayer = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.VideoLayer",
  () => [
    { no: 1, name: "quality", kind: "enum", T: proto3.getEnumType(VideoQuality) },
    {
      no: 2,
      name: "width",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "height",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "bitrate",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 5,
      name: "ssrc",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 6,
      name: "spatial_layer",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 7,
      name: "rid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 8,
      name: "repair_ssrc",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    }
  ]
);
const VideoLayer_Mode = /* @__PURE__ */ proto3.makeEnum(
  "livekit.VideoLayer.Mode",
  [
    { no: 0, name: "MODE_UNUSED" },
    { no: 1, name: "ONE_SPATIAL_LAYER_PER_STREAM" },
    { no: 2, name: "MULTIPLE_SPATIAL_LAYERS_PER_STREAM" },
    { no: 3, name: "ONE_SPATIAL_LAYER_PER_STREAM_INCOMPLETE_RTCP_SR" }
  ]
);
const DataPacket_Kind = /* @__PURE__ */ proto3.makeEnum(
  "livekit.DataPacket.Kind",
  [
    { no: 0, name: "RELIABLE" },
    { no: 1, name: "LOSSY" }
  ]
);
const ParticipantTracks = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ParticipantTracks",
  () => [
    {
      no: 1,
      name: "participant_sid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 2, name: "track_sids", kind: "scalar", T: 9, repeated: true }
  ]
);
const TimedVersion = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.TimedVersion",
  () => [
    {
      no: 1,
      name: "unix_micro",
      kind: "scalar",
      T: 3
      /* ScalarType.INT64 */
    },
    {
      no: 2,
      name: "ticks",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    }
  ]
);
const FilterParams = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.FilterParams",
  () => [
    { no: 1, name: "include_events", kind: "scalar", T: 9, repeated: true },
    { no: 2, name: "exclude_events", kind: "scalar", T: 9, repeated: true }
  ]
);
const WebhookConfig = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.WebhookConfig",
  () => [
    {
      no: 1,
      name: "url",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "signing_key",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 3, name: "filter_params", kind: "message", T: FilterParams }
  ]
);
const JobRestartPolicy = /* @__PURE__ */ proto3.makeEnum(
  "livekit.JobRestartPolicy",
  [
    { no: 0, name: "JRP_ON_FAILURE" },
    { no: 1, name: "JRP_NEVER" }
  ]
);
const RoomAgentDispatch = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.RoomAgentDispatch",
  () => [
    {
      no: 1,
      name: "agent_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "metadata",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 3, name: "restart_policy", kind: "enum", T: proto3.getEnumType(JobRestartPolicy) },
    {
      no: 4,
      name: "deployment",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const EncodingOptionsPreset = /* @__PURE__ */ proto3.makeEnum(
  "livekit.EncodingOptionsPreset",
  [
    { no: 0, name: "H264_720P_30" },
    { no: 1, name: "H264_720P_60" },
    { no: 2, name: "H264_1080P_30" },
    { no: 3, name: "H264_1080P_60" },
    { no: 4, name: "PORTRAIT_H264_720P_30" },
    { no: 5, name: "PORTRAIT_H264_720P_60" },
    { no: 6, name: "PORTRAIT_H264_1080P_30" },
    { no: 7, name: "PORTRAIT_H264_1080P_60" }
  ]
);
const EncodedFileType = /* @__PURE__ */ proto3.makeEnum(
  "livekit.EncodedFileType",
  [
    { no: 0, name: "DEFAULT_FILETYPE" },
    { no: 1, name: "MP4" },
    { no: 2, name: "OGG" },
    { no: 3, name: "MP3" }
  ]
);
const StreamProtocol = /* @__PURE__ */ proto3.makeEnum(
  "livekit.StreamProtocol",
  [
    { no: 0, name: "DEFAULT_PROTOCOL" },
    { no: 1, name: "RTMP" },
    { no: 2, name: "SRT" },
    { no: 3, name: "WEBSOCKET" }
  ]
);
const SegmentedFileProtocol = /* @__PURE__ */ proto3.makeEnum(
  "livekit.SegmentedFileProtocol",
  [
    { no: 0, name: "DEFAULT_SEGMENTED_FILE_PROTOCOL" },
    { no: 1, name: "HLS_PROTOCOL" }
  ]
);
const SegmentedFileSuffix = /* @__PURE__ */ proto3.makeEnum(
  "livekit.SegmentedFileSuffix",
  [
    { no: 0, name: "INDEX" },
    { no: 1, name: "TIMESTAMP" }
  ]
);
const ImageFileSuffix = /* @__PURE__ */ proto3.makeEnum(
  "livekit.ImageFileSuffix",
  [
    { no: 0, name: "IMAGE_SUFFIX_INDEX" },
    { no: 1, name: "IMAGE_SUFFIX_TIMESTAMP" },
    { no: 2, name: "IMAGE_SUFFIX_NONE_OVERWRITE" }
  ]
);
const AudioMixing = /* @__PURE__ */ proto3.makeEnum(
  "livekit.AudioMixing",
  [
    { no: 0, name: "DEFAULT_MIXING" },
    { no: 1, name: "DUAL_CHANNEL_AGENT" },
    { no: 2, name: "DUAL_CHANNEL_ALTERNATE" }
  ]
);
const EncodingOptions = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.EncodingOptions",
  () => [
    {
      no: 1,
      name: "width",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 2,
      name: "height",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 3,
      name: "depth",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 4,
      name: "framerate",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    { no: 5, name: "audio_codec", kind: "enum", T: proto3.getEnumType(AudioCodec) },
    {
      no: 6,
      name: "audio_bitrate",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 7,
      name: "audio_frequency",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    { no: 8, name: "video_codec", kind: "enum", T: proto3.getEnumType(VideoCodec) },
    {
      no: 9,
      name: "video_bitrate",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 10,
      name: "key_frame_interval",
      kind: "scalar",
      T: 1
      /* ScalarType.DOUBLE */
    },
    {
      no: 11,
      name: "audio_quality",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 12,
      name: "video_quality",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    }
  ]
);
const StreamOutput = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.StreamOutput",
  () => [
    { no: 1, name: "protocol", kind: "enum", T: proto3.getEnumType(StreamProtocol) },
    { no: 2, name: "urls", kind: "scalar", T: 9, repeated: true }
  ]
);
const SegmentedFileOutput = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.SegmentedFileOutput",
  () => [
    { no: 1, name: "protocol", kind: "enum", T: proto3.getEnumType(SegmentedFileProtocol) },
    {
      no: 2,
      name: "filename_prefix",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "playlist_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 11,
      name: "live_playlist_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "segment_duration",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    { no: 10, name: "filename_suffix", kind: "enum", T: proto3.getEnumType(SegmentedFileSuffix) },
    {
      no: 8,
      name: "disable_manifest",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 5, name: "s3", kind: "message", T: S3Upload, oneof: "output" },
    { no: 6, name: "gcp", kind: "message", T: GCPUpload, oneof: "output" },
    { no: 7, name: "azure", kind: "message", T: AzureBlobUpload, oneof: "output" },
    { no: 9, name: "aliOSS", kind: "message", T: AliOSSUpload, oneof: "output" }
  ]
);
const ImageOutput = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ImageOutput",
  () => [
    {
      no: 1,
      name: "capture_interval",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 2,
      name: "width",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 3,
      name: "height",
      kind: "scalar",
      T: 5
      /* ScalarType.INT32 */
    },
    {
      no: 4,
      name: "filename_prefix",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 5, name: "filename_suffix", kind: "enum", T: proto3.getEnumType(ImageFileSuffix) },
    { no: 6, name: "image_codec", kind: "enum", T: proto3.getEnumType(ImageCodec) },
    {
      no: 7,
      name: "disable_manifest",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 8, name: "s3", kind: "message", T: S3Upload, oneof: "output" },
    { no: 9, name: "gcp", kind: "message", T: GCPUpload, oneof: "output" },
    { no: 10, name: "azure", kind: "message", T: AzureBlobUpload, oneof: "output" },
    { no: 11, name: "aliOSS", kind: "message", T: AliOSSUpload, oneof: "output" }
  ]
);
const S3Upload = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.S3Upload",
  () => [
    {
      no: 1,
      name: "access_key",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "secret",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 11,
      name: "session_token",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 12,
      name: "assume_role_arn",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 13,
      name: "assume_role_external_id",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "region",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "endpoint",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 5,
      name: "bucket",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 6,
      name: "force_path_style",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 7, name: "metadata", kind: "map", K: 9, V: {
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    } },
    {
      no: 8,
      name: "tagging",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 9,
      name: "content_disposition",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 10, name: "proxy", kind: "message", T: ProxyConfig }
  ]
);
const GCPUpload = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.GCPUpload",
  () => [
    {
      no: 1,
      name: "credentials",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "bucket",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 3, name: "proxy", kind: "message", T: ProxyConfig }
  ]
);
const AzureBlobUpload = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.AzureBlobUpload",
  () => [
    {
      no: 1,
      name: "account_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "account_key",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "container_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const AliOSSUpload = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.AliOSSUpload",
  () => [
    {
      no: 1,
      name: "access_key",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "secret",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "region",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "endpoint",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 5,
      name: "bucket",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const ProxyConfig = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ProxyConfig",
  () => [
    {
      no: 1,
      name: "url",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "username",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "password",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const AutoParticipantEgress = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.AutoParticipantEgress",
  () => [
    { no: 1, name: "preset", kind: "enum", T: proto3.getEnumType(EncodingOptionsPreset), oneof: "options" },
    { no: 2, name: "advanced", kind: "message", T: EncodingOptions, oneof: "options" },
    { no: 3, name: "file_outputs", kind: "message", T: EncodedFileOutput, repeated: true },
    { no: 4, name: "segment_outputs", kind: "message", T: SegmentedFileOutput, repeated: true }
  ]
);
const AutoTrackEgress = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.AutoTrackEgress",
  () => [
    {
      no: 1,
      name: "filepath",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 5,
      name: "disable_manifest",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 2, name: "s3", kind: "message", T: S3Upload, oneof: "output" },
    { no: 3, name: "gcp", kind: "message", T: GCPUpload, oneof: "output" },
    { no: 4, name: "azure", kind: "message", T: AzureBlobUpload, oneof: "output" },
    { no: 6, name: "aliOSS", kind: "message", T: AliOSSUpload, oneof: "output" }
  ]
);
const RoomCompositeEgressRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.RoomCompositeEgressRequest",
  () => [
    {
      no: 1,
      name: "room_name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "layout",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "audio_only",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 15, name: "audio_mixing", kind: "enum", T: proto3.getEnumType(AudioMixing) },
    {
      no: 4,
      name: "video_only",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 5,
      name: "custom_base_url",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 6, name: "file", kind: "message", T: EncodedFileOutput, oneof: "output" },
    { no: 7, name: "stream", kind: "message", T: StreamOutput, oneof: "output" },
    { no: 10, name: "segments", kind: "message", T: SegmentedFileOutput, oneof: "output" },
    { no: 8, name: "preset", kind: "enum", T: proto3.getEnumType(EncodingOptionsPreset), oneof: "options" },
    { no: 9, name: "advanced", kind: "message", T: EncodingOptions, oneof: "options" },
    { no: 11, name: "file_outputs", kind: "message", T: EncodedFileOutput, repeated: true },
    { no: 12, name: "stream_outputs", kind: "message", T: StreamOutput, repeated: true },
    { no: 13, name: "segment_outputs", kind: "message", T: SegmentedFileOutput, repeated: true },
    { no: 14, name: "image_outputs", kind: "message", T: ImageOutput, repeated: true },
    { no: 16, name: "webhooks", kind: "message", T: WebhookConfig, repeated: true }
  ]
);
const EncodedFileOutput = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.EncodedFileOutput",
  () => [
    { no: 1, name: "file_type", kind: "enum", T: proto3.getEnumType(EncodedFileType) },
    {
      no: 2,
      name: "filepath",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 6,
      name: "disable_manifest",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 3, name: "s3", kind: "message", T: S3Upload, oneof: "output" },
    { no: 4, name: "gcp", kind: "message", T: GCPUpload, oneof: "output" },
    { no: 5, name: "azure", kind: "message", T: AzureBlobUpload, oneof: "output" },
    { no: 7, name: "aliOSS", kind: "message", T: AliOSSUpload, oneof: "output" }
  ]
);
const CreateRoomRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.CreateRoomRequest",
  () => [
    {
      no: 1,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 12,
      name: "room_preset",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "empty_timeout",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 10,
      name: "departure_timeout",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "max_participants",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "node_id",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 5,
      name: "metadata",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 15, name: "tags", kind: "map", K: 9, V: {
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    } },
    { no: 6, name: "egress", kind: "message", T: RoomEgress },
    {
      no: 7,
      name: "min_playout_delay",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "max_playout_delay",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 9,
      name: "sync_streams",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    {
      no: 13,
      name: "replay_enabled",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 14, name: "agents", kind: "message", T: RoomAgentDispatch, repeated: true }
  ]
);
const RoomEgress = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.RoomEgress",
  () => [
    { no: 1, name: "room", kind: "message", T: RoomCompositeEgressRequest },
    { no: 3, name: "participant", kind: "message", T: AutoParticipantEgress },
    { no: 2, name: "tracks", kind: "message", T: AutoTrackEgress }
  ]
);
const ListRoomsRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ListRoomsRequest",
  () => [
    { no: 1, name: "names", kind: "scalar", T: 9, repeated: true }
  ]
);
const ListRoomsResponse = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ListRoomsResponse",
  () => [
    { no: 1, name: "rooms", kind: "message", T: Room, repeated: true }
  ]
);
const DeleteRoomRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.DeleteRoomRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const ListParticipantsRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ListParticipantsRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const ListParticipantsResponse = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ListParticipantsResponse",
  () => [
    { no: 1, name: "participants", kind: "message", T: ParticipantInfo, repeated: true }
  ]
);
const RoomParticipantIdentity = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.RoomParticipantIdentity",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "identity",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const MuteRoomTrackRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.MuteRoomTrackRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "identity",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "track_sid",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 4,
      name: "muted",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    }
  ]
);
const MuteRoomTrackResponse = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.MuteRoomTrackResponse",
  () => [
    { no: 1, name: "track", kind: "message", T: TrackInfo }
  ]
);
const UpdateParticipantRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.UpdateParticipantRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "identity",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "metadata",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 4, name: "permission", kind: "message", T: ParticipantPermission },
    {
      no: 5,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 6, name: "attributes", kind: "map", K: 9, V: {
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    } }
  ]
);
const UpdateSubscriptionsRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.UpdateSubscriptionsRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "identity",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 3, name: "track_sids", kind: "scalar", T: 9, repeated: true },
    {
      no: 4,
      name: "subscribe",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 5, name: "participant_tracks", kind: "message", T: ParticipantTracks, repeated: true }
  ]
);
const SendDataRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.SendDataRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "data",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    },
    { no: 3, name: "kind", kind: "enum", T: proto3.getEnumType(DataPacket_Kind) },
    { no: 4, name: "destination_sids", kind: "scalar", T: 9, repeated: true },
    { no: 6, name: "destination_identities", kind: "scalar", T: 9, repeated: true },
    { no: 5, name: "topic", kind: "scalar", T: 9, opt: true },
    {
      no: 7,
      name: "nonce",
      kind: "scalar",
      T: 12
      /* ScalarType.BYTES */
    }
  ]
);
const UpdateRoomMetadataRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.UpdateRoomMetadataRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "metadata",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const RoomConfiguration = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.RoomConfiguration",
  () => [
    {
      no: 1,
      name: "name",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "empty_timeout",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 3,
      name: "departure_timeout",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 4,
      name: "max_participants",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 11,
      name: "metadata",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    { no: 5, name: "egress", kind: "message", T: RoomEgress },
    {
      no: 7,
      name: "min_playout_delay",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 8,
      name: "max_playout_delay",
      kind: "scalar",
      T: 13
      /* ScalarType.UINT32 */
    },
    {
      no: 9,
      name: "sync_streams",
      kind: "scalar",
      T: 8
      /* ScalarType.BOOL */
    },
    { no: 10, name: "agents", kind: "message", T: RoomAgentDispatch, repeated: true },
    { no: 12, name: "tags", kind: "map", K: 9, V: {
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    } }
  ]
);
const ForwardParticipantRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.ForwardParticipantRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "identity",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "destination_room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
const MoveParticipantRequest = /* @__PURE__ */ proto3.makeMessageType(
  "livekit.MoveParticipantRequest",
  () => [
    {
      no: 1,
      name: "room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 2,
      name: "identity",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    },
    {
      no: 3,
      name: "destination_room",
      kind: "scalar",
      T: 9
      /* ScalarType.STRING */
    }
  ]
);
export {
  CreateRoomRequest as C,
  DeleteRoomRequest as D,
  ForwardParticipantRequest as F,
  ListRoomsRequest as L,
  MoveParticipantRequest as M,
  ParticipantInfo as P,
  Room as R,
  SendDataRequest as S,
  TrackSource as T,
  UpdateRoomMetadataRequest as U,
  ListRoomsResponse as a,
  ListParticipantsRequest as b,
  ListParticipantsResponse as c,
  RoomParticipantIdentity as d,
  MuteRoomTrackRequest as e,
  MuteRoomTrackResponse as f,
  UpdateParticipantRequest as g,
  ParticipantPermission as h,
  UpdateSubscriptionsRequest as i,
  RoomConfiguration as j,
  RoomAgentDispatch as k
};
