import { Track, Room, RoomEvent, ConnectionState, createLocalAudioTrack } from "./livekit-client.mjs";
async function extractApiErrorMessage(response) {
  try {
    const body = await response.json();
    const detail = body?.detail?.message ?? body?.detail;
    if (typeof detail === "string") {
      return detail;
    }
  } catch (error) {
    console.warn("Failed to parse API error response as JSON:", error);
  }
  return response.statusText || "Unknown error";
}
class SessionConnectionError extends Error {
  closeCode;
  closeReason;
  constructor(message, options) {
    super(message);
    this.name = "SessionConnectionError";
    this.closeCode = options?.closeCode;
    this.closeReason = options?.closeReason;
  }
}
const HTTPS_API_ORIGIN$1 = "https://api.elevenlabs.io";
function isTextOnly(options) {
  const { textOnly: textOnlyOverride } = options.overrides?.conversation ?? {};
  const { textOnly } = options;
  if (typeof textOnly === "boolean") {
    if (typeof textOnlyOverride === "boolean" && textOnly !== textOnlyOverride) {
      console.warn(`Conflicting textOnly options provided: ${textOnly} via options.textOnly (will be used) and ${textOnlyOverride} via options.overrides.conversation.textOnly (will be ignored)`);
    }
    return textOnly;
  } else if (typeof textOnlyOverride === "boolean") {
    return textOnlyOverride;
  } else {
    return void 0;
  }
}
class BaseConversation {
  options;
  connection;
  lastInterruptTimestamp = 0;
  mode = "listening";
  status = "connecting";
  volume = 1;
  currentEventId = 1;
  lastFeedbackEventId = 0;
  canSendFeedback = false;
  static getFullOptions(partialOptions) {
    const textOnly = isTextOnly(partialOptions);
    return {
      clientTools: {},
      onConnect: () => {
      },
      onDebug: () => {
      },
      onDisconnect: () => {
      },
      onError: () => {
      },
      onMessage: () => {
      },
      onAudio: () => {
      },
      onModeChange: () => {
      },
      onStatusChange: () => {
      },
      onCanSendFeedbackChange: () => {
      },
      onInterruption: () => {
      },
      ...partialOptions,
      textOnly,
      overrides: {
        ...partialOptions.overrides,
        conversation: {
          ...partialOptions.overrides?.conversation,
          textOnly
        }
      }
    };
  }
  constructor(options, connection) {
    this.options = options;
    this.connection = connection;
    this.connection.onMessage(this.onMessage);
    this.connection.onDisconnect(this.endSessionWithDetails);
    this.connection.onModeChange((mode) => this.updateMode(mode));
  }
  markConnected() {
    this.updateStatus("connected");
  }
  endSession() {
    return this.endSessionWithDetails({ reason: "user" });
  }
  endSessionWithDetails = async (details) => {
    if (this.status !== "connected" && this.status !== "connecting")
      return;
    this.updateStatus("disconnecting");
    await this.handleEndSession();
    this.updateStatus("disconnected");
    if (this.options.onDisconnect) {
      this.options.onDisconnect(details);
    }
  };
  async handleEndSession() {
    this.connection.close();
  }
  updateMode(mode) {
    if (mode !== this.mode) {
      this.mode = mode;
      if (this.options.onModeChange) {
        this.options.onModeChange({ mode });
      }
    }
  }
  updateStatus(status) {
    if (status !== this.status) {
      this.status = status;
      if (this.options.onStatusChange) {
        this.options.onStatusChange({ status });
      }
    }
  }
  updateCanSendFeedback() {
    const canSendFeedback = this.currentEventId !== this.lastFeedbackEventId;
    if (this.canSendFeedback !== canSendFeedback) {
      this.canSendFeedback = canSendFeedback;
      if (this.options.onCanSendFeedbackChange) {
        this.options.onCanSendFeedbackChange({ canSendFeedback });
      }
    }
  }
  handleInterruption(event) {
    if (event.interruption_event) {
      this.lastInterruptTimestamp = event.interruption_event.event_id;
      if (this.options.onInterruption) {
        this.options.onInterruption({
          event_id: event.interruption_event.event_id
        });
      }
    }
  }
  handleAgentResponse(event) {
    if (this.options.onMessage) {
      this.options.onMessage({
        source: "ai",
        role: "agent",
        message: event.agent_response_event.agent_response,
        event_id: event.agent_response_event.event_id
      });
    }
  }
  handleUserTranscript(event) {
    if (this.options.onMessage) {
      this.options.onMessage({
        source: "user",
        role: "user",
        message: event.user_transcription_event.user_transcript,
        event_id: event.user_transcription_event.event_id
      });
    }
  }
  handleTentativeAgentResponse(event) {
    if (this.options.onDebug) {
      this.options.onDebug({
        type: "tentative_agent_response",
        response: event.tentative_agent_response_internal_event.tentative_agent_response
      });
    }
  }
  handleVadScore(event) {
    if (this.options.onVadScore) {
      this.options.onVadScore({
        vadScore: event.vad_score_event.vad_score
      });
    }
  }
  async handleClientToolCall(event) {
    if (Object.prototype.hasOwnProperty.call(this.options.clientTools, event.client_tool_call.tool_name)) {
      try {
        const result = await this.options.clientTools[event.client_tool_call.tool_name](event.client_tool_call.parameters) ?? "Client tool execution successful.";
        const formattedResult = typeof result === "object" ? JSON.stringify(result) : String(result);
        this.connection.sendMessage({
          type: "client_tool_result",
          tool_call_id: event.client_tool_call.tool_call_id,
          result: formattedResult,
          is_error: false
        });
      } catch (e) {
        this.onError(`Client tool execution failed with following error: ${e?.message}`, {
          clientToolName: event.client_tool_call.tool_name
        });
        this.connection.sendMessage({
          type: "client_tool_result",
          tool_call_id: event.client_tool_call.tool_call_id,
          result: `Client tool execution failed: ${e?.message}`,
          is_error: true
        });
      }
    } else {
      if (this.options.onUnhandledClientToolCall) {
        this.options.onUnhandledClientToolCall(event.client_tool_call);
        return;
      }
      this.onError(`Client tool with name ${event.client_tool_call.tool_name} is not defined on client`, {
        clientToolName: event.client_tool_call.tool_name
      });
      this.connection.sendMessage({
        type: "client_tool_result",
        tool_call_id: event.client_tool_call.tool_call_id,
        result: `Client tool with name ${event.client_tool_call.tool_name} is not defined on client`,
        is_error: true
      });
    }
  }
  handleAudio(event) {
  }
  handleMCPToolCall(event) {
    if (this.options.onMCPToolCall) {
      this.options.onMCPToolCall(event.mcp_tool_call);
    }
  }
  handleMCPConnectionStatus(event) {
    if (this.options.onMCPConnectionStatus) {
      this.options.onMCPConnectionStatus(event.mcp_connection_status);
    }
  }
  handleAgentToolRequest(event) {
    if (this.options.onAgentToolRequest) {
      this.options.onAgentToolRequest(event.agent_tool_request);
    }
  }
  handleAgentToolResponse(event) {
    if (event.agent_tool_response.tool_name === "end_call") {
      this.endSessionWithDetails({
        reason: "agent",
        context: new CloseEvent("end_call", { reason: "Agent ended the call" })
      });
    }
    if (this.options.onAgentToolResponse) {
      this.options.onAgentToolResponse(event.agent_tool_response);
    }
  }
  handleConversationMetadata(event) {
    if (this.options.onConversationMetadata) {
      this.options.onConversationMetadata(event.conversation_initiation_metadata_event);
    }
  }
  handleAsrInitiationMetadata(event) {
    if (this.options.onAsrInitiationMetadata) {
      this.options.onAsrInitiationMetadata(event.asr_initiation_metadata_event);
    }
  }
  handleAgentChatResponsePart(event) {
    if (this.options.onAgentChatResponsePart) {
      this.options.onAgentChatResponsePart(event.text_response_part);
    }
  }
  handleGuardrailTriggered(_event) {
    if (this.options.onGuardrailTriggered) {
      this.options.onGuardrailTriggered();
    }
  }
  handleErrorEvent(event) {
    const errorType = event.error_event.error_type;
    const message = event.error_event.message || event.error_event.reason || "Unknown error";
    if (errorType === "max_duration_exceeded") {
      this.endSessionWithDetails({
        reason: "error",
        message,
        context: new Event("max_duration_exceeded")
      });
      return;
    }
    this.onError(`Server error: ${message}`, {
      errorType,
      code: event.error_event.code,
      debugMessage: event.error_event.debug_message,
      details: event.error_event.details
    });
  }
  onMessage = async (parsedEvent) => {
    switch (parsedEvent.type) {
      case "interruption": {
        this.handleInterruption(parsedEvent);
        return;
      }
      case "agent_response": {
        this.handleAgentResponse(parsedEvent);
        return;
      }
      case "user_transcript": {
        this.handleUserTranscript(parsedEvent);
        return;
      }
      case "internal_tentative_agent_response": {
        this.handleTentativeAgentResponse(parsedEvent);
        return;
      }
      case "client_tool_call": {
        try {
          await this.handleClientToolCall(parsedEvent);
        } catch (error) {
          this.onError(`Unexpected error in client tool call handling: ${error instanceof Error ? error.message : String(error)}`, {
            clientToolName: parsedEvent.client_tool_call.tool_name,
            toolCallId: parsedEvent.client_tool_call.tool_call_id
          });
        }
        return;
      }
      case "audio": {
        this.handleAudio(parsedEvent);
        return;
      }
      case "vad_score": {
        this.handleVadScore(parsedEvent);
        return;
      }
      case "ping": {
        this.connection.sendMessage({
          type: "pong",
          event_id: parsedEvent.ping_event.event_id
        });
        return;
      }
      case "mcp_tool_call": {
        this.handleMCPToolCall(parsedEvent);
        return;
      }
      case "mcp_connection_status": {
        this.handleMCPConnectionStatus(parsedEvent);
        return;
      }
      case "agent_tool_request": {
        this.handleAgentToolRequest(parsedEvent);
        return;
      }
      case "agent_tool_response": {
        this.handleAgentToolResponse(parsedEvent);
        return;
      }
      case "conversation_initiation_metadata": {
        this.handleConversationMetadata(parsedEvent);
        return;
      }
      case "asr_initiation_metadata": {
        this.handleAsrInitiationMetadata(parsedEvent);
        return;
      }
      case "agent_chat_response_part": {
        this.handleAgentChatResponsePart(parsedEvent);
        return;
      }
      case "guardrail_triggered": {
        this.handleGuardrailTriggered(parsedEvent);
        return;
      }
      case "error": {
        this.handleErrorEvent(parsedEvent);
        return;
      }
      default: {
        if (this.options.onDebug) {
          this.options.onDebug(parsedEvent);
        }
        return;
      }
    }
  };
  onError(message, context) {
    console.error(message, context);
    if (this.options.onError) {
      this.options.onError(message, context);
    }
  }
  getId() {
    return this.connection.conversationId;
  }
  isOpen() {
    return this.status === "connected";
  }
  sendFeedback(like) {
    if (!this.canSendFeedback) {
      console.warn(this.lastFeedbackEventId === 0 ? "Cannot send feedback: the conversation has not started yet." : "Cannot send feedback: feedback has already been sent for the current response.");
      return;
    }
    this.connection.sendMessage({
      type: "feedback",
      score: like ? "like" : "dislike",
      event_id: this.currentEventId
    });
    this.lastFeedbackEventId = this.currentEventId;
    this.updateCanSendFeedback();
  }
  sendContextualUpdate(text) {
    this.connection.sendMessage({
      type: "contextual_update",
      text
    });
  }
  sendUserMessage(text) {
    this.connection.sendMessage({
      type: "user_message",
      text
    });
  }
  sendUserActivity() {
    this.connection.sendMessage({
      type: "user_activity"
    });
  }
  sendMCPToolApprovalResult(toolCallId, isApproved) {
    this.connection.sendMessage({
      type: "mcp_tool_approval_result",
      tool_call_id: toolCallId,
      is_approved: isApproved
    });
  }
  sendMultimodalMessage(options) {
    this.connection.sendMessage({
      type: "multimodal_message",
      text: options.text ? { type: "user_message", text: options.text } : void 0,
      file: options.fileId ? { type: "file_input", file_id: options.fileId } : void 0
    });
  }
  async uploadFile(file) {
    const origin = (this.options.origin ?? HTTPS_API_ORIGIN$1).replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
    const filename = "name" in file && typeof file.name === "string" ? file.name : `upload.${(file.type || "image/png").split("/").pop()?.split("+")[0]}`;
    const body = new FormData();
    body.append("file", file, filename);
    const response = await fetch(`${origin}/v1/convai/conversations/${this.connection.conversationId}/files`, { method: "POST", body });
    if (!response.ok) {
      const message = await extractApiErrorMessage(response);
      throw new Error(`Upload failed: ${response.status} ${message}`);
    }
    const { file_id } = await response.json();
    if (typeof file_id !== "string" || !file_id) {
      throw new Error("Upload response is missing a valid file_id");
    }
    return { fileId: file_id };
  }
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function deepMerge(...objects) {
  return objects.reduce((acc, obj) => {
    const result = { ...acc };
    for (const key of Object.keys(obj)) {
      const accVal = result[key];
      const objVal = obj[key];
      if (isPlainObject(accVal) && isPlainObject(objVal)) {
        result[key] = deepMerge(accVal, objVal);
      } else if (typeof accVal === "function" && typeof objVal === "function") {
        result[key] = ((...args) => {
          accVal(...args);
          objVal(...args);
        });
      } else if (objVal !== void 0) {
        result[key] = objVal;
      }
    }
    return result;
  }, {});
}
function mergeOptions(...configs) {
  return deepMerge(...configs);
}
function parseLocation(location = "us") {
  switch (location) {
    case "eu-residency":
    case "in-residency":
    case "us":
    case "global":
      return location;
    default:
      console.warn(`[ElevenAgents] Invalid server-location: ${location}. Defaulting to "us"`);
      return "us";
  }
}
function getOriginForLocation(location) {
  const originMap = {
    us: "wss://api.elevenlabs.io",
    "eu-residency": "wss://api.eu.residency.elevenlabs.io",
    "in-residency": "wss://api.in.residency.elevenlabs.io",
    global: "wss://api.elevenlabs.io"
  };
  return originMap[location];
}
function getLivekitUrlForLocation(location) {
  const livekitUrlMap = {
    us: "wss://livekit.rtc.elevenlabs.io",
    "eu-residency": "wss://livekit.rtc.eu.residency.elevenlabs.io",
    "in-residency": "wss://livekit.rtc.in.residency.elevenlabs.io",
    global: "wss://livekit.rtc.elevenlabs.io"
  };
  return livekitUrlMap[location];
}
const PACKAGE_VERSION = "1.4.0";
let sourceInfo = Object.freeze({
  name: "js_sdk",
  version: PACKAGE_VERSION
});
function setSourceInfo(value) {
  sourceInfo = Object.freeze(value);
}
const URLCache = /* @__PURE__ */ new Map();
function createWorkletModuleLoader(name, sourceCode) {
  return async (worklet, path) => {
    const cachedUrl = URLCache.get(name);
    if (cachedUrl) {
      return worklet.addModule(cachedUrl);
    }
    if (path) {
      try {
        await worklet.addModule(path);
        URLCache.set(name, path);
        return;
      } catch (error) {
        throw new Error(`Failed to load the ${name} worklet module from path: ${path}. Error: ${error}`);
      }
    }
    const blob = new Blob([sourceCode], { type: "application/javascript" });
    const blobURL = URL.createObjectURL(blob);
    try {
      await worklet.addModule(blobURL);
      URLCache.set(name, blobURL);
      return;
    } catch {
      URL.revokeObjectURL(blobURL);
    }
    try {
      const base64 = btoa(sourceCode);
      const moduleURL = `data:application/javascript;base64,${base64}`;
      await worklet.addModule(moduleURL);
      URLCache.set(name, moduleURL);
    } catch (error) {
      throw new Error(`Failed to load the ${name} worklet module. Make sure the browser supports AudioWorklets. If you are using a strict CSP, you may need to self-host the worklet files.`);
    }
  };
}
const loadAudioConcatProcessor = createWorkletModuleLoader(
  "audioConcatProcessor",
  // language=JavaScript
  `/*
 * ulaw decoding logic taken from the wavefile library
 * https://github.com/rochars/wavefile/blob/master/lib/codecs/mulaw.js
 * USED BY @elevenlabs/client
 */

const decodeTable = [0, 132, 396, 924, 1980, 4092, 8316, 16764];

function decodeSample(muLawSample) {
  let sign;
  let exponent;
  let mantissa;
  let sample;
  muLawSample = ~muLawSample;
  sign = muLawSample & 0x80;
  exponent = (muLawSample >> 4) & 0x07;
  mantissa = muLawSample & 0x0f;
  sample = decodeTable[exponent] + (mantissa << (exponent + 3));
  if (sign !== 0) sample = -sample;

  return sample;
}

class AudioConcatProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffers = []; // Initialize an empty buffer
    this.cursor = 0;
    this.currentBuffer = null;
    this.wasInterrupted = false;
    this.finished = false;

    this.port.onmessage = ({ data }) => {
      switch (data.type) {
        case "setFormat":
          this.format = data.format;
          if (globalThis.LibSampleRate && sampleRate !== data.sampleRate) {
            globalThis.LibSampleRate.create(
              1,
              data.sampleRate,
              sampleRate
            ).then(resampler => {
              this.resampler = resampler;
            });
          }
          break;
        case "buffer":
          this.wasInterrupted = false;
          this.buffers.push(
            this.format === "ulaw"
              ? new Uint8Array(data.buffer)
              : new Int16Array(data.buffer)
          );
          break;
        case "interrupt":
          this.wasInterrupted = true;
          break;
        case "clearInterrupted":
          if (this.wasInterrupted) {
            this.wasInterrupted = false;
            this.buffers = [];
            this.currentBuffer = null;
          }
      }
    };
  }
  process(_, outputs) {
    let finished = false;
    const output = outputs[0][0];
    for (let i = 0; i < output.length; i++) {
      if (!this.currentBuffer) {
        if (this.buffers.length === 0) {
          finished = true;
          break;
        }
        this.currentBuffer = this.buffers.shift();
        if (this.resampler) {
          this.currentBuffer = this.resampler.full(this.currentBuffer);
        }
        this.cursor = 0;
      }

      let value = this.currentBuffer[this.cursor];
      if (this.format === "ulaw") {
        value = decodeSample(value);
      }
      output[i] = value / 32768;
      this.cursor++;

      if (this.cursor >= this.currentBuffer.length) {
        this.currentBuffer = null;
      }
    }

    if (this.finished !== finished) {
      this.finished = finished;
      this.port.postMessage({ type: "process", finished });
    }

    return true; // Continue processing
  }
}

registerProcessor("audioConcatProcessor", AudioConcatProcessor);
`
);
const LIBSAMPLERATE_JS = "https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js@2.1.2/dist/libsamplerate.worklet.js";
async function addLibsamplerateModule(context, customPath) {
  const libsamplerateUrl = customPath || LIBSAMPLERATE_JS;
  await context.audioWorklet.addModule(libsamplerateUrl);
}
function calculateVolume(frequencyData) {
  if (frequencyData.length === 0) {
    return 0;
  }
  let volume = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    volume += frequencyData[i] / 255;
  }
  volume /= frequencyData.length;
  return volume < 0 ? 0 : volume > 1 ? 1 : volume;
}
const NO_VOLUME = {
  getVolume: () => 0,
  getByteFrequencyData: () => {
  }
};
const MIN_VOICE_FREQUENCY = 100;
const MAX_VOICE_FREQUENCY = 8e3;
function resampleVoiceRange(raw, buffer, sampleRate) {
  const binCount = raw.length;
  const hzPerBin = sampleRate / 2 / binCount;
  const minBin = Math.floor(MIN_VOICE_FREQUENCY / hzPerBin);
  const maxBin = Math.min(Math.ceil(MAX_VOICE_FREQUENCY / hzPerBin), binCount);
  const voiceBinCount = maxBin - minBin;
  const outLen = buffer.length;
  for (let i = 0; i < outLen; i++) {
    const pos = i / outLen * voiceBinCount;
    const lo = minBin + Math.floor(pos);
    const hi = Math.min(lo + 1, maxBin - 1);
    const t = pos - Math.floor(pos);
    buffer[i] = Math.round(raw[lo] * (1 - t) + raw[hi] * t);
  }
}
function createAnalyserVolumeProvider(analyser, sampleRate) {
  const binCount = analyser.frequencyBinCount;
  let rawData;
  let voiceData;
  return {
    getVolume() {
      rawData ??= new Uint8Array(binCount);
      voiceData ??= new Uint8Array(binCount);
      analyser.getByteFrequencyData(rawData);
      resampleVoiceRange(rawData, voiceData, sampleRate);
      return calculateVolume(voiceData);
    },
    getByteFrequencyData(buffer) {
      rawData ??= new Uint8Array(binCount);
      analyser.getByteFrequencyData(rawData);
      resampleVoiceRange(rawData, buffer, sampleRate);
    }
  };
}
class MediaDeviceOutput {
  context;
  analyser;
  gain;
  worklet;
  audioElement;
  static async create({ sampleRate, format, outputDeviceId, workletPaths, libsampleratePath }) {
    let context = null;
    let audioElement = null;
    try {
      const supportsSampleRateConstraint = navigator.mediaDevices.getSupportedConstraints().sampleRate;
      context = new AudioContext(supportsSampleRateConstraint ? { sampleRate } : {});
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      audioElement = new Audio();
      audioElement.src = "";
      audioElement.load();
      audioElement.autoplay = true;
      audioElement.style.display = "none";
      document.body.appendChild(audioElement);
      const destination = context.createMediaStreamDestination();
      audioElement.srcObject = destination.stream;
      gain.connect(analyser);
      analyser.connect(destination);
      if (!supportsSampleRateConstraint || context.sampleRate !== sampleRate) {
        if (context.sampleRate !== sampleRate) {
          console.warn(`[ConversationalAI] Sample rate ${sampleRate} not available, resampling to ${context.sampleRate}`);
        }
        await addLibsamplerateModule(context, libsampleratePath);
      }
      await loadAudioConcatProcessor(context.audioWorklet, workletPaths?.audioConcatProcessor);
      const worklet = new AudioWorkletNode(context, "audioConcatProcessor");
      worklet.port.postMessage({ type: "setFormat", format, sampleRate });
      worklet.connect(gain);
      await context.resume();
      if (outputDeviceId && audioElement.setSinkId) {
        await audioElement.setSinkId(outputDeviceId);
      }
      const newOutput = new MediaDeviceOutput(context, analyser, gain, worklet, audioElement);
      return newOutput;
    } catch (error) {
      if (audioElement?.parentNode) {
        audioElement.parentNode.removeChild(audioElement);
      }
      audioElement?.pause();
      if (context && context.state !== "closed") {
        await context.close();
      }
      throw error;
    }
  }
  volume = 1;
  interrupted = false;
  interruptTimeout = null;
  volumeProvider;
  constructor(context, analyser, gain, worklet, audioElement) {
    this.context = context;
    this.analyser = analyser;
    this.gain = gain;
    this.worklet = worklet;
    this.audioElement = audioElement;
    this.worklet.port.start();
    this.volumeProvider = createAnalyserVolumeProvider(analyser, context.sampleRate);
  }
  getAnalyser() {
    return this.analyser;
  }
  getVolume() {
    return this.volumeProvider.getVolume();
  }
  getByteFrequencyData(buffer) {
    this.volumeProvider.getByteFrequencyData(buffer);
  }
  addListener(listener) {
    this.worklet.port.addEventListener("message", listener);
  }
  removeListener(listener) {
    this.worklet.port.removeEventListener("message", listener);
  }
  setVolume(volume) {
    this.volume = volume;
    this.gain.gain.value = volume;
  }
  playAudio(chunk) {
    this.gain.gain.cancelScheduledValues(this.context.currentTime);
    this.gain.gain.value = this.volume;
    if (this.interruptTimeout) {
      clearTimeout(this.interruptTimeout);
      this.interruptTimeout = null;
    }
    this.worklet.port.postMessage({ type: "clearInterrupted" });
    this.worklet.port.postMessage({ type: "buffer", buffer: chunk });
  }
  interrupt(resetDuration = 2e3) {
    this.interrupted = true;
    if (this.interruptTimeout) {
      clearTimeout(this.interruptTimeout);
      this.interruptTimeout = null;
    }
    this.worklet.port.postMessage({ type: "interrupt" });
    this.gain.gain.exponentialRampToValueAtTime(1e-4, this.context.currentTime + resetDuration / 1e3);
    this.interruptTimeout = setTimeout(() => {
      this.interrupted = false;
      this.gain.gain.value = this.volume;
      this.worklet.port.postMessage({ type: "clearInterrupted" });
      this.interruptTimeout = null;
    }, resetDuration);
  }
  async setDevice(config) {
    if (!("setSinkId" in HTMLAudioElement.prototype)) {
      throw new Error("setSinkId is not supported in this browser");
    }
    const outputDeviceId = config?.outputDeviceId;
    await this.audioElement.setSinkId(outputDeviceId || "");
  }
  async close() {
    if (this.interruptTimeout) {
      clearTimeout(this.interruptTimeout);
      this.interruptTimeout = null;
    }
    if (this.audioElement.parentNode) {
      this.audioElement.parentNode.removeChild(this.audioElement);
    }
    this.audioElement.pause();
    await this.context.close();
  }
}
const loadRawAudioProcessor = createWorkletModuleLoader(
  "rawAudioProcessor",
  // language=JavaScript
  `/*
 * ulaw encoding logic taken from the wavefile library
 * https://github.com/rochars/wavefile/blob/master/lib/codecs/mulaw.js
 * USED BY @elevenlabs/client
 */

const BIAS = 0x84;
const CLIP = 32635;
const encodeTable = [
  0,0,1,1,2,2,2,2,3,3,3,3,3,3,3,3,
  4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
  5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
  5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
  6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
  6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
  6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
  6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
  7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7
];

function encodeSample(sample) {
  let sign;
  let exponent;
  let mantissa;
  let muLawSample;
  sign = (sample >> 8) & 0x80;
  if (sign !== 0) sample = -sample;
  sample = sample + BIAS;
  if (sample > CLIP) sample = CLIP;
  exponent = encodeTable[(sample>>7) & 0xFF];
  mantissa = (sample >> (exponent+3)) & 0x0F;
  muLawSample = ~(sign | (exponent << 4) | mantissa);
  
  return muLawSample;
}

class RawAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
              
    this.port.onmessage = ({ data }) => {
      switch (data.type) {
        case "setFormat":
          this.isMuted = false;
          this.buffer = []; // Initialize an empty buffer
          this.bufferSize = data.sampleRate / 10;
          this.format = data.format;

          if (globalThis.LibSampleRate && sampleRate !== data.sampleRate) {
            globalThis.LibSampleRate.create(1, sampleRate, data.sampleRate).then(resampler => {
              this.resampler = resampler;
            });
          }
          break;
        case "setMuted":
          this.isMuted = data.isMuted;
          break;
      }
    };
  }
  process(inputs) {
    if (!this.buffer) {
      return true;
    }
    
    const input = inputs[0]; // Get the first input node
    if (input.length > 0) {
      let channelData = input[0]; // Get the first channel's data

      // Resample the audio if necessary
      if (this.resampler) {
        channelData = this.resampler.full(channelData);
      }

      // Add channel data to the buffer
      this.buffer.push(...channelData);
      // Get max volume 
      let sum = 0.0;
      for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
      }
      const maxVolume = Math.sqrt(sum / channelData.length);
      // Check if buffer size has reached or exceeded the threshold
      if (this.buffer.length >= this.bufferSize) {
        const float32Array = this.isMuted 
          ? new Float32Array(this.buffer.length)
          : new Float32Array(this.buffer);

        let encodedArray = this.format === "ulaw"
          ? new Uint8Array(float32Array.length)
          : new Int16Array(float32Array.length);

        // Iterate through the Float32Array and convert each sample to PCM16
        for (let i = 0; i < float32Array.length; i++) {
          // Clamp the value to the range [-1, 1]
          let sample = Math.max(-1, Math.min(1, float32Array[i]));

          // Scale the sample to the range [-32768, 32767]
          let value = sample < 0 ? sample * 32768 : sample * 32767;
          if (this.format === "ulaw") {
            value = encodeSample(Math.round(value));
          }

          encodedArray[i] = value;
        }

        // Send the buffered data to the main script
        this.port.postMessage([encodedArray, maxVolume]);

        // Clear the buffer after sending
        this.buffer = [];
      }
    }
    return true; // Continue processing
  }
}
registerProcessor("rawAudioProcessor", RawAudioProcessor);
`
);
function isIosDevice() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || // iPad on iOS 13 detection
  navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function isAndroidDevice() {
  return /android/i.test(navigator.userAgent);
}
const defaultConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  // Automatic gain control helps maintain a steady volume level with microphones: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings/autoGainControl
  autoGainControl: true,
  // Mono audio for better echo cancellation
  channelCount: { ideal: 1 }
};
class MediaDeviceInput {
  context;
  analyser;
  worklet;
  inputStream;
  mediaStreamSource;
  permissions;
  onError;
  static async create({ sampleRate, format, preferHeadphonesForIosDevices, inputDeviceId, workletPaths, libsampleratePath, onError }) {
    let context = null;
    let inputStream = null;
    try {
      const options = {
        sampleRate: { ideal: sampleRate },
        ...defaultConstraints
      };
      if (isIosDevice() && preferHeadphonesForIosDevices) {
        const availableDevices = await window.navigator.mediaDevices.enumerateDevices();
        const idealDevice = availableDevices.find((d) => (
          // cautious to include "bluetooth" in the search
          // as might trigger bluetooth speakers
          d.kind === "audioinput" && ["airpod", "headphone", "earphone"].find((keyword) => d.label.toLowerCase().includes(keyword))
        ));
        if (idealDevice) {
          options.deviceId = { ideal: idealDevice.deviceId };
        }
      }
      if (inputDeviceId) {
        options.deviceId = MediaDeviceInput.getDeviceIdConstraint(inputDeviceId);
      }
      const supportsSampleRateConstraint = navigator.mediaDevices.getSupportedConstraints().sampleRate;
      context = new window.AudioContext(supportsSampleRateConstraint ? { sampleRate } : {});
      const analyser = context.createAnalyser();
      if (!supportsSampleRateConstraint) {
        await addLibsamplerateModule(context, libsampleratePath);
      }
      await loadRawAudioProcessor(context.audioWorklet, workletPaths?.rawAudioProcessor);
      const constraints = { voiceIsolation: true, ...options };
      inputStream = await navigator.mediaDevices.getUserMedia({
        audio: constraints
      });
      const source = context.createMediaStreamSource(inputStream);
      const worklet = new AudioWorkletNode(context, "rawAudioProcessor");
      worklet.port.postMessage({ type: "setFormat", format, sampleRate });
      source.connect(analyser);
      analyser.connect(worklet);
      await context.resume();
      const permissions = await navigator.permissions.query({
        name: "microphone"
      });
      return new MediaDeviceInput(context, analyser, worklet, inputStream, source, permissions, onError);
    } catch (error) {
      inputStream?.getTracks().forEach((track) => {
        track.stop();
      });
      context?.close();
      throw error;
    }
  }
  // Use { ideal } on iOS as a defensive measure - some iOS versions may not support { exact } for deviceId constraints
  static getDeviceIdConstraint(deviceId) {
    if (!deviceId) {
      return void 0;
    }
    return isIosDevice() ? { ideal: deviceId } : { exact: deviceId };
  }
  muted = false;
  volumeProvider;
  constructor(context, analyser, worklet, inputStream, mediaStreamSource, permissions, onError = console.error) {
    this.context = context;
    this.analyser = analyser;
    this.worklet = worklet;
    this.inputStream = inputStream;
    this.mediaStreamSource = mediaStreamSource;
    this.permissions = permissions;
    this.onError = onError;
    this.permissions.addEventListener("change", this.handlePermissionsChange);
    this.worklet.port.start();
    this.volumeProvider = createAnalyserVolumeProvider(analyser, context.sampleRate);
  }
  getAnalyser() {
    return this.analyser;
  }
  getVolume() {
    if (this.muted)
      return 0;
    return this.volumeProvider.getVolume();
  }
  getByteFrequencyData(buffer) {
    if (this.muted) {
      buffer.fill(0);
      return;
    }
    this.volumeProvider.getByteFrequencyData(buffer);
  }
  isMuted() {
    return this.muted;
  }
  addListener(listener) {
    this.worklet.port.addEventListener("message", listener);
  }
  removeListener(listener) {
    this.worklet.port.removeEventListener("message", listener);
  }
  forgetInputStreamAndSource() {
    for (const track of this.inputStream.getTracks()) {
      track.stop();
    }
    this.mediaStreamSource.disconnect();
  }
  async close() {
    this.forgetInputStreamAndSource();
    this.permissions.removeEventListener("change", this.handlePermissionsChange);
    await this.context.close();
  }
  async setMuted(isMuted) {
    this.muted = isMuted;
    this.worklet.port.postMessage({ type: "setMuted", isMuted });
  }
  settingInput = false;
  async setDevice(config) {
    try {
      if (this.settingInput) {
        throw new Error("Input device is already being set");
      }
      this.settingInput = true;
      const inputDeviceId = config?.inputDeviceId;
      const options = {
        ...defaultConstraints
      };
      if (inputDeviceId) {
        options.deviceId = MediaDeviceInput.getDeviceIdConstraint(inputDeviceId);
      }
      const constraints = { voiceIsolation: true, ...options };
      const newInputStream = await navigator.mediaDevices.getUserMedia({
        audio: constraints
      });
      this.forgetInputStreamAndSource();
      this.inputStream = newInputStream;
      this.mediaStreamSource = this.context.createMediaStreamSource(newInputStream);
      this.mediaStreamSource.connect(this.analyser);
    } catch (error) {
      this.onError("Failed to switch input device:", error);
      throw error;
    } finally {
      this.settingInput = false;
    }
  }
  handlePermissionsChange = () => {
    if (this.permissions.state === "denied") {
      this.onError("Microphone permission denied");
    } else if (!this.settingInput) {
      const [track] = this.inputStream.getAudioTracks();
      const { deviceId } = track?.getSettings() ?? {};
      this.setDevice({ inputDeviceId: deviceId }).catch((error) => {
        this.onError("Failed to reset input device after permission change:", error);
      });
    }
  };
}
class BaseConnection {
  queue = [];
  disconnectionDetails = null;
  onDisconnectCallback = null;
  onMessageCallback = null;
  onModeChangeCallback = null;
  onDebug;
  constructor(config = {}) {
    this.onDebug = config.onDebug;
  }
  debug(info) {
    if (this.onDebug)
      this.onDebug(info);
  }
  onMessage(callback) {
    this.onMessageCallback = callback;
    const queue = this.queue;
    this.queue = [];
    if (queue.length > 0) {
      queueMicrotask(() => {
        queue.forEach(callback);
      });
    }
  }
  onDisconnect(callback) {
    this.onDisconnectCallback = callback;
    const details = this.disconnectionDetails;
    if (details) {
      queueMicrotask(() => {
        callback(details);
      });
    }
  }
  onModeChange(callback) {
    this.onModeChangeCallback = callback;
  }
  updateMode(mode) {
    this.onModeChangeCallback?.(mode);
  }
  disconnect(details) {
    if (!this.disconnectionDetails) {
      this.disconnectionDetails = details;
      this.onDisconnectCallback?.(details);
    }
  }
  handleMessage(parsedEvent) {
    if (this.onMessageCallback) {
      this.onMessageCallback(parsedEvent);
    } else {
      this.queue.push(parsedEvent);
    }
  }
}
function parseFormat(format) {
  const [formatPart, sampleRatePart] = format.split("_");
  if (!["pcm", "ulaw"].includes(formatPart)) {
    throw new Error(`Invalid format: ${format}`);
  }
  const sampleRate = Number.parseInt(sampleRatePart);
  if (Number.isNaN(sampleRate)) {
    throw new Error(`Invalid sample rate: ${sampleRatePart}`);
  }
  return {
    format: formatPart,
    sampleRate
  };
}
function isValidSocketEvent(event) {
  return !!event.type;
}
const CONVERSATION_INITIATION_CLIENT_DATA_TYPE = "conversation_initiation_client_data";
function constructOverrides(config) {
  const overridesEvent = {
    type: CONVERSATION_INITIATION_CLIENT_DATA_TYPE
  };
  if (config.overrides) {
    overridesEvent.conversation_config_override = {
      agent: {
        prompt: config.overrides.agent?.prompt,
        first_message: config.overrides.agent?.firstMessage,
        language: config.overrides.agent?.language
      },
      tts: {
        voice_id: config.overrides.tts?.voiceId,
        speed: config.overrides.tts?.speed,
        stability: config.overrides.tts?.stability,
        similarity_boost: config.overrides.tts?.similarityBoost
      },
      conversation: {
        text_only: config.overrides.conversation?.textOnly
      }
    };
  }
  if (config.customLlmExtraBody) {
    overridesEvent.custom_llm_extra_body = config.customLlmExtraBody;
  }
  if (config.dynamicVariables) {
    overridesEvent.dynamic_variables = config.dynamicVariables;
  }
  if (config.userId) {
    overridesEvent.user_id = config.userId;
  }
  overridesEvent.source_info = {
    source: sourceInfo.name,
    version: sourceInfo.version
  };
  if (config.toolMockConfig) {
    overridesEvent.tool_mock_config = {
      mocking_strategy: config.toolMockConfig.mockingStrategy,
      mocked_tool_names: config.toolMockConfig.mockedToolNames,
      fallback_strategy: config.toolMockConfig.fallbackStrategy
    };
  }
  return overridesEvent;
}
const MAIN_PROTOCOL = "convai";
const WSS_API_ORIGIN = "wss://api.elevenlabs.io";
const WSS_API_PATHNAME = "/v1/convai/conversation?agent_id=";
class WebSocketConnection extends BaseConnection {
  socket;
  conversationId;
  inputFormat;
  outputFormat;
  outputListeners = /* @__PURE__ */ new Set();
  constructor(socket, conversationId, inputFormat, outputFormat) {
    super();
    this.socket = socket;
    this.conversationId = conversationId;
    this.inputFormat = inputFormat;
    this.outputFormat = outputFormat;
    this.socket.addEventListener("error", (event) => {
      setTimeout(() => this.disconnect({
        reason: "error",
        message: "The connection was closed due to a socket error.",
        context: event
      }), 0);
    });
    this.socket.addEventListener("close", (event) => {
      this.disconnect(event.code === 1e3 ? {
        reason: "agent",
        context: event,
        closeCode: event.code,
        closeReason: event.reason || void 0
      } : {
        reason: "error",
        message: event.reason || "The connection was closed by the server.",
        context: event,
        closeCode: event.code,
        closeReason: event.reason || void 0
      });
    });
    this.socket.addEventListener("message", (event) => {
      try {
        const parsedEvent = JSON.parse(event.data);
        if (!isValidSocketEvent(parsedEvent)) {
          this.debug({
            type: "invalid_event",
            message: "Received invalid socket event",
            data: event.data
          });
          return;
        }
        this.handleMessage(parsedEvent);
      } catch (error) {
        this.debug({
          type: "parsing_error",
          message: "Failed to parse socket message",
          error: error instanceof Error ? error.message : String(error),
          data: event.data
        });
      }
    });
  }
  static async create(config) {
    let socket = null;
    try {
      const origin = config.origin ?? WSS_API_ORIGIN;
      let url;
      const { name: source, version } = sourceInfo;
      if (config.signedUrl) {
        const separator = config.signedUrl.includes("?") ? "&" : "?";
        url = `${config.signedUrl}${separator}source=${source}&version=${version}`;
      } else {
        url = `${origin}${WSS_API_PATHNAME}${config.agentId}&source=${source}&version=${version}`;
      }
      if (config.environment) {
        url += `&environment=${encodeURIComponent(config.environment)}`;
      }
      const protocols = [MAIN_PROTOCOL];
      if (config.authorization) {
        protocols.push(`bearer.${config.authorization}`);
      }
      socket = new WebSocket(url, protocols);
      const conversationConfig = await new Promise((resolve, reject) => {
        socket.addEventListener("open", () => {
          const overridesEvent = constructOverrides(config);
          socket?.send(JSON.stringify(overridesEvent));
        }, { once: true });
        socket.addEventListener("error", (event) => {
          setTimeout(() => reject(new SessionConnectionError("The connection was closed due to a socket error.")), 0);
        });
        socket.addEventListener("close", (event) => {
          const message = event.reason || (event.code === 1e3 ? "Connection closed normally before session could be established." : "Connection closed unexpectedly before session could be established.");
          reject(new SessionConnectionError(message, {
            closeCode: event.code,
            closeReason: event.reason || void 0
          }));
        });
        socket.addEventListener("message", (event) => {
          const message = JSON.parse(event.data);
          if (!isValidSocketEvent(message)) {
            return;
          }
          if (message.type === "conversation_initiation_metadata") {
            resolve(message.conversation_initiation_metadata_event);
          } else {
            console.warn("First received message is not conversation metadata.");
          }
        }, { once: true });
      });
      const { conversation_id, agent_output_audio_format, user_input_audio_format } = conversationConfig;
      const inputFormat = parseFormat(user_input_audio_format ?? "pcm_16000");
      const outputFormat = parseFormat(agent_output_audio_format);
      return new WebSocketConnection(socket, conversation_id, inputFormat, outputFormat);
    } catch (error) {
      socket?.close();
      throw error;
    }
  }
  close() {
    this.socket.close(1e3, "User ended conversation");
  }
  sendMessage(message) {
    this.socket.send(JSON.stringify(message));
  }
  addListener(listener) {
    this.outputListeners.add(listener);
  }
  removeListener(listener) {
    this.outputListeners.delete(listener);
  }
  handleMessage(parsedEvent) {
    super.handleMessage(parsedEvent);
    if (parsedEvent.type === "audio" && parsedEvent.audio_event.audio_base_64) {
      const audioEvent = {
        audio_base_64: parsedEvent.audio_event.audio_base_64
      };
      this.outputListeners.forEach((listener) => listener(audioEvent));
    }
  }
}
function arrayBufferToBase64(b) {
  const buffer = new Uint8Array(b);
  const base64Data = window.btoa(String.fromCharCode(...buffer));
  return base64Data;
}
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
const DEFAULT_LIVEKIT_WS_URL = "wss://livekit.rtc.elevenlabs.io";
const HTTPS_API_ORIGIN = "https://api.elevenlabs.io";
function convertWssToHttps(origin) {
  return origin.replace(/^wss:\/\//, "https://");
}
class WebRTCConnection extends BaseConnection {
  conversationId;
  inputFormat;
  outputFormat;
  room;
  isConnected = false;
  audioEventId = 1;
  audioCaptureContext = null;
  audioElements = [];
  outputDeviceId = null;
  inputAnalyser = null;
  inputAudioContext = null;
  inputVolumeProvider = NO_VOLUME;
  outputAnalyser = null;
  outputVolumeProvider = NO_VOLUME;
  // InputController state
  _isMuted = false;
  // InputController interface exposed as a property
  input = {
    close: async () => {
      if (this.isConnected) {
        try {
          this.room.localParticipant.audioTrackPublications.forEach((publication) => {
            if (publication.track) {
              publication.track.stop();
            }
          });
        } catch (error) {
          console.warn("Error stopping local tracks:", error);
        }
      }
    },
    setDevice: async (config) => {
      if (config?.sampleRate !== void 0 || config?.format !== void 0 || config?.preferHeadphonesForIosDevices !== void 0) {
        throw new Error("WebRTC input device does not support sampleRate, format, or preferHeadphonesForIosDevices options");
      }
      const inputDeviceId = config?.inputDeviceId;
      if (!inputDeviceId) {
        return;
      }
      await this.setAudioInputDevice(inputDeviceId);
    },
    setMuted: async (isMuted) => {
      if (!this.isConnected || !this.room.localParticipant) {
        console.warn("Cannot set microphone muted: room not connected or no local participant");
        return;
      }
      this._isMuted = isMuted;
      const micTrackPublication = this.room.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (micTrackPublication?.track) {
        try {
          if (isMuted) {
            await micTrackPublication.track.mute();
          } else {
            await micTrackPublication.track.unmute();
          }
        } catch (_error) {
          await this.room.localParticipant.setMicrophoneEnabled(!isMuted);
        }
      } else {
        await this.room.localParticipant.setMicrophoneEnabled(!isMuted);
      }
      if (!isMuted) {
        const track = this.room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track;
        if (track) {
          this.setupInputAnalyser(track.mediaStreamTrack);
        }
      }
    },
    isMuted: () => this._isMuted,
    getAnalyser: () => this.inputAnalyser ?? void 0,
    getVolume: () => {
      if (this._isMuted)
        return 0;
      return this.inputVolumeProvider.getVolume();
    },
    getByteFrequencyData: (buffer) => {
      if (this._isMuted) {
        buffer.fill(0);
        return;
      }
      this.inputVolumeProvider.getByteFrequencyData(buffer);
    }
  };
  // OutputController interface exposed as a property
  output = {
    close: async () => {
    },
    setDevice: async (config) => {
      if (config?.sampleRate !== void 0 || config?.format !== void 0) {
        throw new Error("WebRTC output device does not support sampleRate or format options");
      }
      const outputDeviceId = config?.outputDeviceId;
      if (!outputDeviceId) {
        return;
      }
      await this.setAudioOutputDevice(outputDeviceId);
    },
    setVolume: (volume) => {
      this.setAudioVolume(volume);
    },
    interrupt: (_resetDuration) => {
    },
    getAnalyser: () => this.outputAnalyser ?? void 0,
    getVolume: () => this.outputVolumeProvider.getVolume(),
    getByteFrequencyData: (buffer) => {
      this.outputVolumeProvider.getByteFrequencyData(buffer);
    }
  };
  constructor(room, conversationId, inputFormat, outputFormat, config = {}) {
    super(config);
    this.room = room;
    this.conversationId = conversationId;
    this.inputFormat = inputFormat;
    this.outputFormat = outputFormat;
    this.setupRoomEventListeners();
  }
  static async create(config) {
    let conversationToken;
    if ("conversationToken" in config && config.conversationToken) {
      conversationToken = config.conversationToken;
    } else if ("agentId" in config && config.agentId) {
      try {
        const { name: source, version } = sourceInfo;
        const configOrigin = config.origin ?? HTTPS_API_ORIGIN;
        const origin = convertWssToHttps(configOrigin);
        let url = `${origin}/v1/convai/conversation/token?agent_id=${config.agentId}&source=${source}&version=${version}`;
        if (config.environment) {
          url += `&environment=${encodeURIComponent(config.environment)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          const message = await extractApiErrorMessage(response);
          throw new Error(`ElevenLabs API returned ${response.status} ${message}`);
        }
        const data = await response.json();
        conversationToken = data.token;
        if (!conversationToken) {
          throw new Error("No conversation token received from API");
        }
      } catch (error) {
        let msg = error instanceof Error ? error.message : String(error);
        if (error instanceof Error && error.message.includes("401")) {
          msg = "Your agent has authentication enabled, but no signed URL or conversation token was provided.";
        }
        throw new Error(`Failed to fetch conversation token for agent ${config.agentId}: ${msg}`);
      }
    } else {
      throw new Error("Either conversationToken or agentId is required for WebRTC connection");
    }
    const room = new Room();
    try {
      const conversationId = `room_${Date.now()}`;
      const inputFormat = parseFormat("pcm_48000");
      const outputFormat = parseFormat("pcm_48000");
      const connection = new WebRTCConnection(room, conversationId, inputFormat, outputFormat, config);
      const livekitUrl = config.livekitUrl || DEFAULT_LIVEKIT_WS_URL;
      const micEnabled = config.textOnly ? Promise.resolve() : new Promise((resolve, reject) => {
        room.once(RoomEvent.SignalConnected, () => {
          room.localParticipant.setMicrophoneEnabled(true).then(() => resolve()).catch(reject);
        });
      });
      await room.connect(livekitUrl, conversationToken);
      await new Promise((resolve) => {
        if (connection.isConnected) {
          resolve();
        } else {
          const onConnected = () => {
            room.off(RoomEvent.Connected, onConnected);
            resolve();
          };
          room.on(RoomEvent.Connected, onConnected);
        }
      });
      await micEnabled;
      const micTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone)?.track;
      if (micTrack) {
        connection.setupInputAnalyser(micTrack.mediaStreamTrack);
      }
      if (room.name) {
        connection.conversationId = room.name.match(/(conv_[a-zA-Z0-9]+)/)?.[0] || room.name;
      }
      const overridesEvent = constructOverrides(config);
      connection.debug({
        type: CONVERSATION_INITIATION_CLIENT_DATA_TYPE,
        message: overridesEvent
      });
      await connection.sendMessage(overridesEvent);
      return connection;
    } catch (error) {
      await room.disconnect();
      throw error;
    }
  }
  setupRoomEventListeners() {
    this.room.on(RoomEvent.Connected, async () => {
      this.isConnected = true;
    });
    this.room.on(RoomEvent.Disconnected, (reason) => {
      this.isConnected = false;
      this.disconnect({
        reason: "agent",
        context: new CloseEvent("close", { reason: reason?.toString() })
      });
    });
    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      if (state === ConnectionState.Disconnected) {
        this.isConnected = false;
        this.disconnect({
          reason: "error",
          message: `LiveKit connection state changed to ${state}`,
          context: new Event("connection_state_changed")
        });
      }
    });
    this.room.on(RoomEvent.DataReceived, (payload, _participant) => {
      try {
        const message = JSON.parse(new TextDecoder().decode(payload));
        if (message.type === "audio") {
          return;
        }
        if (isValidSocketEvent(message)) {
          this.handleMessage(message);
        } else {
          console.warn("Invalid socket event received:", message);
        }
      } catch (error) {
        console.warn("Failed to parse incoming data message:", error);
        console.warn("Raw payload:", new TextDecoder().decode(payload));
      }
    });
    this.room.on(RoomEvent.TrackSubscribed, async (track, _publication, participant) => {
      if (track.kind === Track.Kind.Audio && participant.identity.includes("agent")) {
        const remoteAudioTrack = track;
        const audioElement = remoteAudioTrack.attach();
        audioElement.autoplay = true;
        audioElement.controls = false;
        if (this.outputDeviceId && audioElement.setSinkId) {
          try {
            await audioElement.setSinkId(this.outputDeviceId);
          } catch (error) {
            console.warn("Failed to set output device for new audio element:", error);
          }
        }
        audioElement.style.display = "none";
        document.body.appendChild(audioElement);
        this.audioElements.push(audioElement);
        if (this.audioElements.length === 1) {
          this.onDebug?.({ type: "audio_element_ready" });
        }
        await this.setupAudioCapture(remoteAudioTrack);
      }
    });
    this.room.on(RoomEvent.ActiveSpeakersChanged, async (speakers) => {
      if (speakers.length > 0) {
        this.updateMode(speakers[0].identity.startsWith("agent") ? "speaking" : "listening");
      } else {
        this.updateMode("listening");
      }
    });
    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      if (participant.identity?.startsWith("agent")) {
        this.disconnect({
          reason: "agent",
          context: new CloseEvent("close", { reason: "agent disconnected" })
        });
      }
    });
  }
  close() {
    if (this.isConnected) {
      try {
        this.room.localParticipant.audioTrackPublications.forEach((publication) => {
          if (publication.track) {
            publication.track.stop();
          }
        });
      } catch (error) {
        console.warn("Error stopping local tracks:", error);
      }
      if (this.inputAudioContext) {
        this.inputAudioContext.close().catch((error) => {
          console.warn("Error closing input audio context:", error);
        });
        this.inputAudioContext = null;
        this.inputAnalyser = null;
      }
      if (this.audioCaptureContext) {
        this.audioCaptureContext.close().catch((error) => {
          console.warn("Error closing audio capture context:", error);
        });
        this.audioCaptureContext = null;
      }
      this.audioElements.forEach((element) => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      this.audioElements = [];
      this.room.disconnect();
    }
  }
  async sendMessage(message) {
    if (!this.isConnected || !this.room.localParticipant) {
      console.warn("Cannot send message: room not connected or no local participant");
      return;
    }
    if ("user_audio_chunk" in message) {
      return;
    }
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(message));
      await this.room.localParticipant.publishData(data, { reliable: true });
    } catch (error) {
      this.debug({
        type: "send_message_error",
        message: {
          message,
          error
        }
      });
      console.error("Failed to send message via WebRTC:", error);
    }
  }
  // Get the room instance for advanced usage
  getRoom() {
    return this.room;
  }
  /**
   * (Re-)creates an AudioContext + AnalyserNode from the given track and
   * installs the corresponding VolumeProvider. Called once during create()
   * and again after an input device switch so the analyser follows the
   * active mic track.
   */
  setupInputAnalyser(mediaStreamTrack) {
    if (this.inputAudioContext) {
      this.inputAudioContext.close().catch(() => {
      });
      this.inputAudioContext = null;
      this.inputAnalyser = null;
    }
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaStreamSource(new MediaStream([mediaStreamTrack]));
      source.connect(analyser);
      this.inputAnalyser = analyser;
      this.inputAudioContext = ctx;
      this.inputVolumeProvider = createAnalyserVolumeProvider(analyser, ctx.sampleRate);
    } catch (error) {
      console.warn("[ConversationalAI] Failed to set up input volume analyser:", error);
    }
  }
  setInputVolumeProvider(provider) {
    this.inputVolumeProvider = provider;
  }
  setOutputVolumeProvider(provider) {
    this.outputVolumeProvider = provider;
  }
  async setupAudioCapture(track) {
    try {
      const audioContext = new AudioContext();
      this.audioCaptureContext = audioContext;
      this.outputAnalyser = audioContext.createAnalyser();
      this.outputAnalyser.fftSize = 2048;
      this.outputAnalyser.smoothingTimeConstant = 0.8;
      const mediaStream = new MediaStream([track.mediaStreamTrack]);
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(this.outputAnalyser);
      this.setOutputVolumeProvider(createAnalyserVolumeProvider(this.outputAnalyser, audioContext.sampleRate));
      await loadRawAudioProcessor(audioContext.audioWorklet);
      const worklet = new AudioWorkletNode(audioContext, "rawAudioProcessor");
      this.outputAnalyser.connect(worklet);
      worklet.port.postMessage({
        type: "setFormat",
        format: this.outputFormat.format,
        sampleRate: this.outputFormat.sampleRate
      });
      worklet.port.onmessage = (event) => {
        const [audioData, maxVolume] = event.data;
        const volumeThreshold = 0.01;
        if (maxVolume > volumeThreshold) {
          const base64Audio = arrayBufferToBase64(audioData.buffer);
          const eventId = this.audioEventId++;
          this.handleMessage({
            type: "audio",
            audio_event: {
              audio_base_64: base64Audio,
              event_id: eventId
            }
          });
        }
      };
      source.connect(worklet);
    } catch (error) {
      console.warn("Failed to set up audio capture:", error);
    }
  }
  setAudioVolume(volume) {
    this.audioElements.forEach((element) => {
      element.volume = volume;
    });
  }
  async setAudioOutputDevice(deviceId) {
    if (!("setSinkId" in HTMLAudioElement.prototype)) {
      throw new Error("setSinkId is not supported in this browser");
    }
    const promises = this.audioElements.map(async (element) => {
      try {
        await element.setSinkId(deviceId);
      } catch (error) {
        console.error("Failed to set sink ID for audio element:", error);
        throw error;
      }
    });
    await Promise.all(promises);
    this.outputDeviceId = deviceId;
  }
  async setAudioInputDevice(deviceId) {
    if (!this.isConnected || !this.room.localParticipant) {
      throw new Error("Cannot change input device: room not connected or no local participant");
    }
    try {
      const currentMicTrackPublication = this.room.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (currentMicTrackPublication?.track) {
        await currentMicTrackPublication.track.stop();
        await this.room.localParticipant.unpublishTrack(currentMicTrackPublication.track);
      }
      const audioConstraints = {
        deviceId: { exact: deviceId },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: { ideal: 1 }
      };
      const audioTrack = await createLocalAudioTrack(audioConstraints);
      await this.room.localParticipant.publishTrack(audioTrack, {
        name: "microphone",
        source: Track.Source.Microphone
      });
      this.setupInputAnalyser(audioTrack.mediaStreamTrack);
    } catch (error) {
      console.error("Failed to change input device:", error);
      try {
        await this.room.localParticipant.setMicrophoneEnabled(true);
      } catch (recoveryError) {
        console.error("Failed to recover microphone after device switch error:", recoveryError);
      }
      throw error;
    }
  }
}
function attachInputToConnection(input, connection) {
  const listener = (event) => {
    const rawAudioPcmData = event.data[0];
    connection.sendMessage({
      user_audio_chunk: arrayBufferToBase64(rawAudioPcmData.buffer)
    });
  };
  input.addListener(listener);
  return () => {
    input.removeListener(listener);
  };
}
function attachConnectionToOutput(connection, output) {
  const listener = (event) => {
    output.playAudio(base64ToArrayBuffer(event.audio_base_64));
  };
  connection.addListener(listener);
  return () => {
    connection.removeListener(listener);
  };
}
function determineConnectionType(config) {
  const hasSignedUrl = "signedUrl" in config && config.signedUrl;
  if (hasSignedUrl && config.connectionType === "webrtc") {
    throw new Error("signedUrl only supports websocket connections. Remove connectionType or set it to 'websocket'.");
  }
  if (config.connectionType) {
    return config.connectionType;
  }
  if ("conversationToken" in config && config.conversationToken) {
    return "webrtc";
  }
  if (hasSignedUrl) {
    return "websocket";
  }
  return config.textOnly ? "websocket" : "webrtc";
}
async function createConnection(config) {
  const connectionType = determineConnectionType(config);
  switch (connectionType) {
    case "websocket":
      return WebSocketConnection.create(config);
    case "webrtc":
      return WebRTCConnection.create(config);
    default:
      throw new Error(`Unknown connection type: ${connectionType}`);
  }
}
async function setupInputOutput(options, connection) {
  if (connection instanceof WebRTCConnection) {
    return {
      input: connection.input,
      output: connection.output,
      playbackEventTarget: null,
      detach: () => {
      }
    };
  } else if (connection instanceof WebSocketConnection) {
    const [input, output] = await Promise.all([
      MediaDeviceInput.create({
        ...connection.inputFormat,
        preferHeadphonesForIosDevices: options.preferHeadphonesForIosDevices,
        inputDeviceId: options.inputDeviceId,
        workletPaths: options.workletPaths,
        libsampleratePath: options.libsampleratePath
      }),
      MediaDeviceOutput.create({
        ...connection.outputFormat,
        outputDeviceId: options.outputDeviceId,
        workletPaths: options.workletPaths
      })
    ]);
    const detachInput = attachInputToConnection(input, connection);
    const detachOutput = attachConnectionToOutput(connection, output);
    return {
      input,
      output,
      playbackEventTarget: output,
      detach: () => {
        detachInput();
        detachOutput();
      }
    };
  } else {
    throw new Error(`Unsupported connection type: ${connection.constructor.name}`);
  }
}
async function webSessionSetup(options) {
  const connection = await createConnection(options);
  const io = await setupInputOutput(options, connection);
  return { connection, ...io };
}
let setupStrategy = webSessionSetup;
async function applyDelay(delayConfig = {
  default: 0,
  // Give the Android AudioManager enough time to switch to the correct audio mode
  android: 3e3
}) {
  let delay = delayConfig.default;
  if (isAndroidDevice()) {
    delay = delayConfig.android ?? delay;
  } else if (isIosDevice()) {
    delay = delayConfig.ios ?? delay;
  }
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
const EMPTY_FREQUENCY_DATA = new Uint8Array(0);
class TextConversation extends BaseConversation {
  type = "text";
  setVolume() {
    throw new Error("setVolume is not supported in text conversations");
  }
  setMicMuted() {
    throw new Error("setMicMuted is not supported in text conversations");
  }
  getInputByteFrequencyData() {
    return EMPTY_FREQUENCY_DATA;
  }
  getOutputByteFrequencyData() {
    return EMPTY_FREQUENCY_DATA;
  }
  getInputVolume() {
    return 0;
  }
  getOutputVolume() {
    return 0;
  }
  static async startSession(options) {
    const fullOptions = BaseConversation.getFullOptions(options);
    if (fullOptions.onStatusChange) {
      fullOptions.onStatusChange({ status: "connecting" });
    }
    if (fullOptions.onCanSendFeedbackChange) {
      fullOptions.onCanSendFeedbackChange({ canSendFeedback: false });
    }
    if (fullOptions.onModeChange) {
      fullOptions.onModeChange({ mode: "listening" });
    }
    if (fullOptions.onCanSendFeedbackChange) {
      fullOptions.onCanSendFeedbackChange({ canSendFeedback: false });
    }
    let connection = null;
    let conversation = null;
    try {
      await applyDelay(fullOptions.connectionDelay);
      connection = await createConnection(fullOptions);
      conversation = new TextConversation(fullOptions, connection);
      fullOptions.onConversationCreated?.(conversation);
      conversation.markConnected();
      fullOptions.onConnect?.({ conversationId: connection.conversationId });
      return conversation;
    } catch (error) {
      if (conversation) {
        await conversation.endSession().catch(() => {
        });
      } else {
        fullOptions.onStatusChange?.({ status: "disconnected" });
        connection?.close();
      }
      throw error;
    }
  }
}
class VoiceConversation extends BaseConversation {
  input;
  output;
  playbackEventTarget;
  cleanUp;
  wakeLock;
  type = "voice";
  static async requestWakeLock() {
    if ("wakeLock" in navigator) {
      try {
        return await navigator.wakeLock.request("screen");
      } catch (_e) {
      }
    }
    return null;
  }
  static async startSession(options) {
    const fullOptions = BaseConversation.getFullOptions(options);
    if (fullOptions.onStatusChange) {
      fullOptions.onStatusChange({ status: "connecting" });
    }
    if (fullOptions.onCanSendFeedbackChange) {
      fullOptions.onCanSendFeedbackChange({ canSendFeedback: false });
    }
    let preliminaryInputStream = null;
    let conversation = null;
    const useWakeLock = options.useWakeLock ?? true;
    let wakeLock = null;
    if (useWakeLock) {
      wakeLock = await VoiceConversation.requestWakeLock();
    }
    try {
      preliminaryInputStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      await applyDelay(fullOptions.connectionDelay);
      const sessionSetup = await setupStrategy(fullOptions);
      preliminaryInputStream?.getTracks().forEach((track) => {
        track.stop();
      });
      preliminaryInputStream = null;
      conversation = new VoiceConversation(fullOptions, sessionSetup.connection, sessionSetup.input, sessionSetup.output, sessionSetup.playbackEventTarget, sessionSetup.detach, wakeLock);
      fullOptions.onConversationCreated?.(conversation);
      conversation.markConnected();
      fullOptions.onConnect?.({
        conversationId: sessionSetup.connection.conversationId
      });
      return conversation;
    } catch (error) {
      preliminaryInputStream?.getTracks().forEach((track) => {
        track.stop();
      });
      if (conversation) {
        await conversation.endSession().catch(() => {
        });
      } else {
        fullOptions.onStatusChange?.({ status: "disconnected" });
      }
      try {
        await wakeLock?.release();
        wakeLock = null;
      } catch (_e) {
      }
      throw error;
    }
  }
  inputFrequencyData;
  outputFrequencyData;
  visibilityChangeHandler = null;
  handlePlaybackEvent = (event) => {
    if (event.data.type === "process") {
      this.updateMode(event.data.finished ? "listening" : "speaking");
    }
  };
  constructor(options, connection, input, output, playbackEventTarget, cleanUp, wakeLock) {
    super(options, connection);
    this.input = input;
    this.output = output;
    this.playbackEventTarget = playbackEventTarget;
    this.cleanUp = cleanUp;
    this.wakeLock = wakeLock;
    playbackEventTarget?.addListener(this.handlePlaybackEvent);
    if (wakeLock) {
      this.visibilityChangeHandler = () => {
        if (document.visibilityState === "visible" && this.wakeLock?.released) {
          VoiceConversation.requestWakeLock().then((lock) => {
            this.wakeLock = lock;
          });
        }
      };
      document.addEventListener("visibilitychange", this.visibilityChangeHandler);
    }
  }
  async handleEndSession() {
    this.cleanUp();
    this.playbackEventTarget?.removeListener(this.handlePlaybackEvent);
    this.playbackEventTarget = null;
    await super.handleEndSession();
    if (this.visibilityChangeHandler) {
      document.removeEventListener("visibilitychange", this.visibilityChangeHandler);
    }
    try {
      await this.wakeLock?.release();
      this.wakeLock = null;
    } catch (_e) {
    }
    await this.input.close();
    await this.output.close();
  }
  handleInterruption(event) {
    super.handleInterruption(event);
    this.updateMode("listening");
    this.output.interrupt();
  }
  handleAudio(event) {
    super.handleAudio(event);
    if (event.audio_event.alignment && this.options.onAudioAlignment) {
      this.options.onAudioAlignment(event.audio_event.alignment);
    }
    if (this.lastInterruptTimestamp <= event.audio_event.event_id) {
      if (event.audio_event.audio_base_64) {
        this.options.onAudio?.(event.audio_event.audio_base_64);
      }
      this.currentEventId = event.audio_event.event_id;
      this.updateCanSendFeedback();
      this.updateMode("speaking");
    }
  }
  static FREQUENCY_BIN_COUNT = 1024;
  setMicMuted(isMuted) {
    this.input.setMuted(isMuted).catch((error) => {
      this.options.onError?.("Failed to set input muted state", error);
    });
  }
  getInputByteFrequencyData() {
    this.inputFrequencyData ??= new Uint8Array(VoiceConversation.FREQUENCY_BIN_COUNT);
    this.input.getByteFrequencyData(this.inputFrequencyData);
    return this.inputFrequencyData;
  }
  getOutputByteFrequencyData() {
    this.outputFrequencyData ??= new Uint8Array(VoiceConversation.FREQUENCY_BIN_COUNT);
    this.output.getByteFrequencyData(this.outputFrequencyData);
    return this.outputFrequencyData;
  }
  getInputVolume() {
    return this.input.getVolume();
  }
  getOutputVolume() {
    return this.output.getVolume();
  }
  async changeInputDevice({ sampleRate, format, preferHeadphonesForIosDevices, inputDeviceId }) {
    try {
      await this.input.setDevice({
        inputDeviceId,
        sampleRate,
        format,
        preferHeadphonesForIosDevices
      });
    } catch (error) {
      console.error("Error changing input device", error);
      throw error;
    }
  }
  async changeOutputDevice({ sampleRate, format, outputDeviceId }) {
    try {
      await this.output.setDevice({
        outputDeviceId,
        sampleRate,
        format
      });
    } catch (error) {
      console.error("Error changing output device", error);
      throw error;
    }
  }
  setVolume = ({ volume }) => {
    const clampedVolume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
    this.volume = clampedVolume;
    this.output.setVolume(clampedVolume);
  };
}
var RealtimeEvents;
(function(RealtimeEvents2) {
  RealtimeEvents2["SESSION_STARTED"] = "session_started";
  RealtimeEvents2["PARTIAL_TRANSCRIPT"] = "partial_transcript";
  RealtimeEvents2["COMMITTED_TRANSCRIPT"] = "committed_transcript";
  RealtimeEvents2["COMMITTED_TRANSCRIPT_WITH_TIMESTAMPS"] = "committed_transcript_with_timestamps";
  RealtimeEvents2["AUTH_ERROR"] = "auth_error";
  RealtimeEvents2["ERROR"] = "error";
  RealtimeEvents2["OPEN"] = "open";
  RealtimeEvents2["CLOSE"] = "close";
  RealtimeEvents2["QUOTA_EXCEEDED"] = "quota_exceeded";
  RealtimeEvents2["COMMIT_THROTTLED"] = "commit_throttled";
  RealtimeEvents2["TRANSCRIBER_ERROR"] = "transcriber_error";
  RealtimeEvents2["UNACCEPTED_TERMS"] = "unaccepted_terms";
  RealtimeEvents2["RATE_LIMITED"] = "rate_limited";
  RealtimeEvents2["INPUT_ERROR"] = "input_error";
  RealtimeEvents2["QUEUE_OVERFLOW"] = "queue_overflow";
  RealtimeEvents2["RESOURCE_EXHAUSTED"] = "resource_exhausted";
  RealtimeEvents2["SESSION_TIME_LIMIT_EXCEEDED"] = "session_time_limit_exceeded";
  RealtimeEvents2["CHUNK_SIZE_EXCEEDED"] = "chunk_size_exceeded";
  RealtimeEvents2["INSUFFICIENT_AUDIO_ACTIVITY"] = "insufficient_audio_activity";
})(RealtimeEvents || (RealtimeEvents = {}));
var AudioFormat;
(function(AudioFormat2) {
  AudioFormat2["PCM_8000"] = "pcm_8000";
  AudioFormat2["PCM_16000"] = "pcm_16000";
  AudioFormat2["PCM_22050"] = "pcm_22050";
  AudioFormat2["PCM_24000"] = "pcm_24000";
  AudioFormat2["PCM_44100"] = "pcm_44100";
  AudioFormat2["PCM_48000"] = "pcm_48000";
  AudioFormat2["ULAW_8000"] = "ulaw_8000";
})(AudioFormat || (AudioFormat = {}));
var CommitStrategy;
(function(CommitStrategy2) {
  CommitStrategy2["MANUAL"] = "manual";
  CommitStrategy2["VAD"] = "vad";
})(CommitStrategy || (CommitStrategy = {}));
const Conversation = {
  startSession(options) {
    return isTextOnly(options) ? TextConversation.startSession(options) : VoiceConversation.startSession(options);
  }
};
export {
  Conversation as C,
  VoiceConversation as V,
  getLivekitUrlForLocation as a,
  getOriginForLocation as g,
  mergeOptions as m,
  parseLocation as p,
  setSourceInfo as s
};
