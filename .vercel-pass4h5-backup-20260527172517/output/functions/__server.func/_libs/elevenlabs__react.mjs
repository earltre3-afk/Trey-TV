import { r as reactExports, j as jsxRuntimeExports } from "./react.mjs";
import "./livekit-client.mjs";
import { V as VoiceConversation, p as parseLocation, m as mergeOptions, C as Conversation, g as getOriginForLocation, a as getLivekitUrlForLocation, s as setSourceInfo } from "./elevenlabs__client.mjs";
import { C as CALLBACK_KEYS } from "./elevenlabs__types.mjs";
const PACKAGE_VERSION = "1.3.0";
const ConversationContext = reactExports.createContext(null);
function useRawConversation() {
  const ctx = reactExports.useContext(ConversationContext);
  return ctx?.conversation ?? null;
}
function useRawConversationRef() {
  const ctx = reactExports.useContext(ConversationContext);
  if (!ctx) {
    throw new Error("useRawConversationRef must be used within a ConversationProvider");
  }
  return ctx.conversationRef;
}
function useRegisterCallbacks(callbacks) {
  const ctx = reactExports.useContext(ConversationContext);
  if (!ctx) {
    throw new Error("useRegisterCallbacks must be used within a ConversationProvider");
  }
  const { registerCallbacks } = ctx;
  const callbacksRef = reactExports.useRef(callbacks);
  const activeKeyToken = Object.keys(callbacks).filter((key) => callbacks[key] !== void 0).sort().join("|");
  reactExports.useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  });
  reactExports.useLayoutEffect(() => {
    const activeKeys = activeKeyToken === "" ? [] : activeKeyToken.split("|");
    const stableCallbacks = Object.fromEntries(activeKeys.map((key) => [
      key,
      (...args) => {
        const fn = callbacksRef.current[key];
        if (typeof fn === "function") {
          fn(...args);
        }
      }
    ]));
    return registerCallbacks(stableCallbacks);
  }, [registerCallbacks, activeKeyToken]);
}
const EMPTY_FREQUENCY_DATA = new Uint8Array(0);
const ConversationControlsContext = reactExports.createContext(null);
function ConversationControlsProvider({ children }) {
  const ctx = reactExports.useContext(ConversationContext);
  if (!ctx) {
    throw new Error("ConversationControlsProvider must be rendered inside a ConversationProvider");
  }
  const { conversationRef } = ctx;
  const getConversation = reactExports.useCallback(() => {
    const conversation = conversationRef.current;
    if (!conversation) {
      throw new Error("No active conversation. Call startSession() first.");
    }
    return conversation;
  }, [conversationRef]);
  const sendUserMessage = reactExports.useCallback((text) => {
    getConversation().sendUserMessage(text);
  }, [getConversation]);
  const sendMultimodalMessage = reactExports.useCallback((options) => {
    getConversation().sendMultimodalMessage(options);
  }, [getConversation]);
  const uploadFile = reactExports.useCallback((file) => {
    return getConversation().uploadFile(file);
  }, [getConversation]);
  const sendContextualUpdate = reactExports.useCallback((text) => {
    getConversation().sendContextualUpdate(text);
  }, [getConversation]);
  const sendUserActivity = reactExports.useCallback(() => {
    getConversation().sendUserActivity();
  }, [getConversation]);
  const sendMCPToolApprovalResult = reactExports.useCallback((toolCallId, isApproved) => {
    getConversation().sendMCPToolApprovalResult(toolCallId, isApproved);
  }, [getConversation]);
  const setVolume = reactExports.useCallback((options) => {
    getConversation().setVolume(options);
  }, [getConversation]);
  const changeInputDevice = reactExports.useCallback(async (config) => {
    const conversation = getConversation();
    if (conversation instanceof VoiceConversation) {
      return await conversation.changeInputDevice(config);
    }
    throw new Error("Device switching is only available for voice conversations");
  }, [getConversation]);
  const changeOutputDevice = reactExports.useCallback(async (config) => {
    const conversation = getConversation();
    if (conversation instanceof VoiceConversation) {
      return await conversation.changeOutputDevice(config);
    }
    throw new Error("Device switching is only available for voice conversations");
  }, [getConversation]);
  const getInputByteFrequencyData = reactExports.useCallback(() => {
    return conversationRef.current?.getInputByteFrequencyData() ?? EMPTY_FREQUENCY_DATA;
  }, [conversationRef]);
  const getOutputByteFrequencyData = reactExports.useCallback(() => {
    return conversationRef.current?.getOutputByteFrequencyData() ?? EMPTY_FREQUENCY_DATA;
  }, [conversationRef]);
  const getInputVolume = reactExports.useCallback(() => {
    return conversationRef.current?.getInputVolume() ?? 0;
  }, [conversationRef]);
  const getOutputVolume = reactExports.useCallback(() => {
    return conversationRef.current?.getOutputVolume() ?? 0;
  }, [conversationRef]);
  const getId = reactExports.useCallback(() => {
    return getConversation().getId();
  }, [getConversation]);
  const value = reactExports.useMemo(() => ({
    startSession: ctx.startSession,
    endSession: ctx.endSession,
    sendUserMessage,
    sendMultimodalMessage,
    uploadFile,
    sendContextualUpdate,
    sendUserActivity,
    sendMCPToolApprovalResult,
    setVolume,
    changeInputDevice,
    changeOutputDevice,
    getInputByteFrequencyData,
    getOutputByteFrequencyData,
    getInputVolume,
    getOutputVolume,
    getId
  }), [
    ctx.startSession,
    ctx.endSession,
    sendUserMessage,
    sendMultimodalMessage,
    uploadFile,
    sendContextualUpdate,
    sendUserActivity,
    sendMCPToolApprovalResult,
    setVolume,
    changeInputDevice,
    changeOutputDevice,
    getInputByteFrequencyData,
    getOutputByteFrequencyData,
    getInputVolume,
    getOutputVolume,
    getId
  ]);
  return jsxRuntimeExports.jsx(ConversationControlsContext.Provider, { value, children });
}
function useConversationControls() {
  const ctx = reactExports.useContext(ConversationControlsContext);
  if (!ctx) {
    throw new Error("useConversationControls must be used within a ConversationProvider");
  }
  return ctx;
}
const ConversationStatusContext = reactExports.createContext(null);
function ConversationStatusProvider({ children }) {
  const [status, setStatus] = reactExports.useState("disconnected");
  const [message, setMessage] = reactExports.useState(void 0);
  useRegisterCallbacks({
    onStatusChange({ status: newStatus }) {
      if (newStatus === "disconnecting") {
        return;
      }
      setStatus(newStatus);
      setMessage(void 0);
    },
    onError(errorMessage) {
      setStatus("error");
      setMessage(errorMessage);
    }
  });
  const value = reactExports.useMemo(() => ({ status, message }), [status, message]);
  return jsxRuntimeExports.jsx(ConversationStatusContext.Provider, { value, children });
}
function useConversationStatus() {
  const ctx = reactExports.useContext(ConversationStatusContext);
  if (!ctx) {
    throw new Error("useConversationStatus must be used within a ConversationProvider");
  }
  return ctx;
}
const ConversationInputContext = reactExports.createContext(null);
function ConversationInputProvider({ children, isMuted: controlledIsMuted, onMutedChange }) {
  const conversation = useRawConversation();
  const conversationRef = useRawConversationRef();
  const isControlled = typeof controlledIsMuted === "boolean";
  const [uncontrolledIsMuted, setUncontrolledIsMuted] = reactExports.useState(false);
  const isMuted = isControlled ? controlledIsMuted : uncontrolledIsMuted;
  useRegisterCallbacks({
    onDisconnect() {
      if (!isControlled) {
        setUncontrolledIsMuted(false);
      }
    }
  });
  reactExports.useEffect(() => {
    if (isControlled && conversation) {
      conversation.setMicMuted(controlledIsMuted);
    }
  }, [conversation, controlledIsMuted, isControlled]);
  const setMuted = reactExports.useCallback((muted) => {
    const conversation2 = conversationRef.current;
    if (!conversation2) {
      throw new Error("No active conversation. Call startSession() first.");
    }
    if (!isControlled) {
      conversation2.setMicMuted(muted);
      setUncontrolledIsMuted(muted);
    }
    onMutedChange?.(muted);
  }, [conversationRef, isControlled, onMutedChange]);
  const value = reactExports.useMemo(() => ({ isMuted, setMuted }), [isMuted, setMuted]);
  return jsxRuntimeExports.jsx(ConversationInputContext.Provider, { value, children });
}
function useConversationInput() {
  const ctx = reactExports.useContext(ConversationInputContext);
  if (!ctx) {
    throw new Error("useConversationInput must be used within a ConversationProvider");
  }
  return ctx;
}
const ConversationModeContext = reactExports.createContext(null);
function ConversationModeProvider({ children }) {
  const [mode, setMode] = reactExports.useState("listening");
  useRegisterCallbacks({
    onModeChange({ mode: newMode }) {
      setMode(newMode);
    },
    onDisconnect() {
      setMode("listening");
    }
  });
  const value = reactExports.useMemo(() => ({
    mode,
    isSpeaking: mode === "speaking",
    isListening: mode === "listening"
  }), [mode]);
  return jsxRuntimeExports.jsx(ConversationModeContext.Provider, { value, children });
}
function useConversationMode() {
  const ctx = reactExports.useContext(ConversationModeContext);
  if (!ctx) {
    throw new Error("useConversationMode must be used within a ConversationProvider");
  }
  return ctx;
}
const ConversationFeedbackContext = reactExports.createContext(null);
function ConversationFeedbackProvider({ children }) {
  const conversationRef = useRawConversationRef();
  const [canSendFeedback, setCanSendFeedback] = reactExports.useState(false);
  useRegisterCallbacks({
    onCanSendFeedbackChange({ canSendFeedback: newValue }) {
      setCanSendFeedback(newValue);
    },
    onDisconnect() {
      setCanSendFeedback(false);
    }
  });
  const sendFeedback = reactExports.useCallback((like) => {
    conversationRef.current?.sendFeedback(like);
  }, [conversationRef]);
  const value = reactExports.useMemo(() => ({
    canSendFeedback,
    sendFeedback
  }), [canSendFeedback, sendFeedback]);
  return jsxRuntimeExports.jsx(ConversationFeedbackContext.Provider, { value, children });
}
function useConversationFeedback() {
  const ctx = reactExports.useContext(ConversationFeedbackContext);
  if (!ctx) {
    throw new Error("useConversationFeedback must be used within a ConversationProvider");
  }
  return ctx;
}
function buildClientTools(optionTools, registry) {
  const clientTools = { ...optionTools };
  for (const [name, handler] of registry) {
    if (Object.hasOwn(clientTools, name)) {
      throw new Error(`Client tool "${name}" is already provided via props/options. Remove it from props or do not register it with useConversationClientTool.`);
    }
    clientTools[name] = handler;
  }
  return clientTools;
}
const ConversationClientToolsContext = reactExports.createContext(null);
function ConversationClientToolsProvider({ children }) {
  const ctx = reactExports.useContext(ConversationContext);
  if (!ctx) {
    throw new Error("ConversationClientToolsProvider must be rendered inside a ConversationProvider");
  }
  const { clientToolsRegistry, clientToolsRef } = ctx;
  const registerClientTool = reactExports.useCallback((name, handler) => {
    if (clientToolsRegistry.has(name)) {
      throw new Error(`Client tool "${name}" is already registered by another hook. Each tool name must be unique.`);
    }
    clientToolsRegistry.set(name, handler);
    clientToolsRef.current[name] = handler;
    return () => {
      if (clientToolsRegistry.get(name) === handler) {
        clientToolsRegistry.delete(name);
      }
      if (clientToolsRef.current[name] === handler) {
        delete clientToolsRef.current[name];
      }
    };
  }, [clientToolsRegistry, clientToolsRef]);
  return jsxRuntimeExports.jsx(ConversationClientToolsContext.Provider, { value: registerClientTool, children });
}
class ListenerSet {
  listeners = /* @__PURE__ */ new Set();
  add(fn) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  invoke(...args) {
    for (const fn of this.listeners)
      fn(...args);
  }
  get size() {
    return this.listeners.size;
  }
}
function assertFunction(value, key) {
  if (typeof value !== "function") {
    throw new Error(`Expected function for key "${key}", got ${typeof value}`);
  }
}
class ListenerMap {
  sets = /* @__PURE__ */ new Map();
  constructor(keys) {
    for (const key of keys) {
      this.sets.set(key, new ListenerSet());
    }
  }
  /**
   * Register listeners for one or more keys. Returns a function that removes
   * all listeners added by this call.
   */
  register(callbacks) {
    const removers = Object.entries(callbacks).filter(([, fn]) => fn !== void 0).map(([key, fn]) => {
      assertFunction(fn, key);
      const set = this.sets.get(key);
      if (!set) {
        throw new Error(`Unknown callback key "${key}"`);
      }
      return set.add(fn);
    });
    return () => {
      for (const remove of removers)
        remove();
    };
  }
  /**
   * Compose all registered listeners into a single callbacks object. Each
   * composed function delegates to the live listener set, so listeners
   * added/removed after this call still take effect.
   */
  compose() {
    return Object.fromEntries(Array.from(this.sets.entries()).filter(([, set]) => set.size > 0).map(([key, set]) => [
      key,
      (...args) => {
        set.invoke(...args);
      }
    ]));
  }
}
function useStableCallbacks(props) {
  const callbackRefs = reactExports.useRef({});
  const activeKeys = CALLBACK_KEYS.filter((key) => props[key] !== void 0);
  const activeKeySet = activeKeys.join("|");
  const stableCallbacks = reactExports.useMemo(
    () => Object.fromEntries(activeKeys.map((key) => [
      key,
      (...args) => {
        const fn = callbackRefs.current[key];
        fn?.(...args);
      }
    ])),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeKeySet is a stable scalar derived from activeKeys
    [activeKeySet]
  );
  for (const key of CALLBACK_KEYS) {
    callbackRefs.current[key] = props[key];
  }
  return stableCallbacks;
}
const SUB_PROVIDERS_WITHOUT_PROPS = [
  ConversationControlsProvider,
  ConversationStatusProvider,
  ConversationModeProvider,
  ConversationFeedbackProvider,
  ConversationClientToolsProvider
];
function ConversationProvider({ children, isMuted, onMutedChange, ...defaultOptions }) {
  const conversationRef = reactExports.useRef(null);
  const lockRef = reactExports.useRef(null);
  const startSessionIdRef = reactExports.useRef(0);
  const shouldEndRef = reactExports.useRef(false);
  const [clientToolsRegistry] = reactExports.useState(() => /* @__PURE__ */ new Map());
  const clientToolsRef = reactExports.useRef({});
  const defaultOptionsRef = reactExports.useRef(defaultOptions);
  defaultOptionsRef.current = defaultOptions;
  const [listenerMap] = reactExports.useState(() => new ListenerMap(CALLBACK_KEYS));
  const [conversation, setConversation] = reactExports.useState(null);
  const stableCallbacks = useStableCallbacks(defaultOptions);
  const registerCallbacks = reactExports.useCallback((callbacks) => listenerMap.register(callbacks), [listenerMap]);
  reactExports.useLayoutEffect(() => {
    return listenerMap.register({
      onDisconnect: () => {
        conversationRef.current = null;
        setConversation(null);
      }
    });
  }, [listenerMap]);
  const startSession = reactExports.useCallback((options) => {
    if (conversationRef.current) {
      return;
    }
    if (lockRef.current) {
      return;
    }
    shouldEndRef.current = false;
    const startSessionId = ++startSessionIdRef.current;
    const defaults = defaultOptionsRef.current;
    const resolvedServerLocation = parseLocation(options?.serverLocation || defaults?.serverLocation);
    const origin = getOriginForLocation(resolvedServerLocation);
    const calculatedLivekitUrl = getLivekitUrlForLocation(resolvedServerLocation);
    const defaultConfig = { ...defaults };
    for (const key of CALLBACK_KEYS) {
      delete defaultConfig[key];
    }
    const sessionOptions = mergeOptions({ livekitUrl: calculatedLivekitUrl }, defaultConfig, stableCallbacks, listenerMap.compose(), options ?? {}, { origin });
    const clientTools = buildClientTools(sessionOptions.clientTools, clientToolsRegistry);
    clientToolsRef.current = clientTools;
    sessionOptions.clientTools = clientTools;
    const userOnConversationCreated = sessionOptions.onConversationCreated;
    const isStaleStartSession = () => startSessionId !== startSessionIdRef.current;
    const handleConversationCreated = (conv) => {
      if (shouldEndRef.current || isStaleStartSession()) {
        return;
      }
      conversationRef.current = conv;
      setConversation(conv);
      userOnConversationCreated?.(conv);
    };
    const handleConnect = (props) => {
      if (shouldEndRef.current || isStaleStartSession()) {
        return;
      }
      lockRef.current = null;
      sessionOptions.onConnect?.(props);
    };
    const providerLifecycleOptions = {
      onConversationCreated: handleConversationCreated,
      onConnect: handleConnect
    };
    const startSessionOptions = {
      ...sessionOptions,
      ...providerLifecycleOptions
    };
    lockRef.current = Conversation.startSession(startSessionOptions);
    lockRef.current.then((conv) => {
      if (isStaleStartSession()) {
        return;
      }
      if (shouldEndRef.current) {
        conv.endSession();
        lockRef.current = null;
        return;
      }
      if (conversationRef.current !== conv) {
        conversationRef.current = conv;
        setConversation(conv);
      }
      lockRef.current = null;
    }, (error) => {
      if (isStaleStartSession()) {
        return;
      }
      conversationRef.current = null;
      setConversation(null);
      lockRef.current = null;
      if (shouldEndRef.current) {
        return;
      }
      const message = error instanceof Error ? error.message : "Session failed to start";
      sessionOptions.onError?.(message, error);
    });
  }, [stableCallbacks, listenerMap, clientToolsRegistry, clientToolsRef]);
  const endSession = reactExports.useCallback(() => {
    shouldEndRef.current = true;
    const pendingConnection = lockRef.current;
    const conv = conversationRef.current;
    conversationRef.current = null;
    setConversation(null);
    if (pendingConnection) {
      pendingConnection.then((c) => c.endSession(), () => {
      });
    } else {
      conv?.endSession();
    }
  }, []);
  reactExports.useEffect(() => {
    return () => {
      shouldEndRef.current = true;
      if (lockRef.current) {
        lockRef.current.then((conv) => conv.endSession(), () => {
        });
      } else {
        conversationRef.current?.endSession();
      }
    };
  }, []);
  const contextValue = reactExports.useMemo(() => ({
    conversation,
    conversationRef,
    startSession,
    endSession,
    registerCallbacks,
    clientToolsRegistry,
    clientToolsRef
  }), [conversation, conversationRef, startSession, endSession, registerCallbacks, clientToolsRegistry, clientToolsRef]);
  const wrappedChildren = SUB_PROVIDERS_WITHOUT_PROPS.reduceRight((nested, Provider) => jsxRuntimeExports.jsx(Provider, { children: nested }), jsxRuntimeExports.jsx(ConversationInputProvider, { isMuted, onMutedChange, children }));
  return jsxRuntimeExports.jsx(ConversationContext.Provider, { value: contextValue, children: wrappedChildren });
}
function useConversation(props = {}) {
  const { micMuted, volume, ...hookOptions } = props;
  const stableCallbacks = useStableCallbacks(hookOptions);
  useRegisterCallbacks(stableCallbacks);
  const hookOptionsRef = reactExports.useRef(hookOptions);
  hookOptionsRef.current = hookOptions;
  const controls = useConversationControls();
  const { status, message } = useConversationStatus();
  const { isMuted, setMuted } = useConversationInput();
  const { mode, isSpeaking, isListening } = useConversationMode();
  const { canSendFeedback, sendFeedback } = useConversationFeedback();
  const startSession = reactExports.useCallback((options) => {
    const sessionConfig = { ...hookOptionsRef.current };
    for (const key of CALLBACK_KEYS) {
      delete sessionConfig[key];
    }
    controls.startSession({
      ...sessionConfig,
      ...options
    });
  }, [controls, hookOptionsRef]);
  const conversation = useRawConversation();
  reactExports.useEffect(() => {
    if (micMuted !== void 0 && conversation) {
      setMuted(micMuted);
    }
  }, [micMuted, conversation, setMuted]);
  reactExports.useEffect(() => {
    if (volume !== void 0 && conversation) {
      conversation.setVolume({ volume });
    }
  }, [volume, conversation]);
  return {
    ...controls,
    startSession,
    status,
    message,
    isMuted: micMuted ?? isMuted,
    setMuted,
    mode,
    isSpeaking,
    isListening,
    canSendFeedback,
    sendFeedback
  };
}
setSourceInfo({ name: "react_sdk", version: PACKAGE_VERSION });
export {
  ConversationProvider as C,
  useConversation as u
};
