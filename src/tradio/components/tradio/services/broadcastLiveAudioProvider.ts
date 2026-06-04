import { Room, RoomEvent, createLocalAudioTrack } from "livekit-client";

export interface AudioParticipant {
  id: string;
  displayName: string;
  isSpeaking: boolean;
  micEnabled: boolean;
  volume: number;
}

export interface LiveAudioProvider {
  name: string;
  joinRoom(roomName: string, token: string): Promise<void>;
  leaveRoom(): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): Promise<void>;
  isMicrophoneEnabled(): boolean;
  onParticipantConnected(callback: (p: AudioParticipant) => void): void;
  onParticipantDisconnected(callback: (id: string) => void): void;
  onStreamStateChanged(callback: (participants: AudioParticipant[]) => void): void;
  onVolumeDuckingTriggered(callback: (shouldDuck: boolean) => void): void;
}

/**
 * LiveKit Client Provider implementation
 */
export class LiveKitProviderImpl implements LiveAudioProvider {
  name = "livekit";
  private room: Room | null = null;
  private micEnabled = false;
  private participants: Map<string, AudioParticipant> = new Map();

  private participantConnectedCallback?: (p: AudioParticipant) => void;
  private participantDisconnectedCallback?: (id: string) => void;
  private streamStateCallback?: (participants: AudioParticipant[]) => void;
  private duckingCallback?: (shouldDuck: boolean) => void;

  async joinRoom(roomName: string, token: string): Promise<void> {
    if (this.room) {
      await this.leaveRoom();
    }

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });
    this.room = room;

    // Set up listeners
    room.on(RoomEvent.ParticipantConnected, (p) => {
      const audioPart: AudioParticipant = {
        id: p.identity,
        displayName: p.name || p.identity,
        isSpeaking: p.isSpeaking,
        micEnabled: p.isMicrophoneEnabled,
        volume: 1.0,
      };
      this.participants.set(p.identity, audioPart);
      if (this.participantConnectedCallback) {
        this.participantConnectedCallback(audioPart);
      }
      this.triggerStreamStateUpdate();
    });

    room.on(RoomEvent.ParticipantDisconnected, (p) => {
      this.participants.delete(p.identity);
      if (this.participantDisconnectedCallback) {
        this.participantDisconnectedCallback(p.identity);
      }
      this.triggerStreamStateUpdate();
    });

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      // Check if any speaker is active to trigger host ducking
      let isHostSpeaking = false;

      this.participants.forEach((p) => {
        const isSpeaking = speakers.some((s) => s.identity === p.id);
        p.isSpeaking = isSpeaking;
        if (isSpeaking && p.id.startsWith("host-")) {
          isHostSpeaking = true;
        }
      });

      if (this.duckingCallback) {
        this.duckingCallback(isHostSpeaking);
      }
      this.triggerStreamStateUpdate();
    });

    room.on(RoomEvent.TrackSubscribed, (_, __, publication) => {
      const identity = (publication as any).participant?.identity;
      if (identity) {
        const part = this.participants.get(identity);
        if (part) {
          part.micEnabled = true;
          this.triggerStreamStateUpdate();
        }
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (_, __, publication) => {
      const identity = (publication as any).participant?.identity;
      if (identity) {
        const part = this.participants.get(identity);
        if (part) {
          part.micEnabled = false;
          this.triggerStreamStateUpdate();
        }
      }
    });

    // Connect
    const livekitUrl = process.env.LIVEKIT_URL || "ws://localhost:7880";
    await room.connect(livekitUrl, token);
    this.participants.clear();

    // Add existing remote participants
    room.remoteParticipants.forEach((p) => {
      const audioPart: AudioParticipant = {
        id: p.identity,
        displayName: p.name || p.identity,
        isSpeaking: p.isSpeaking,
        micEnabled: p.isMicrophoneEnabled,
        volume: 1.0,
      };
      this.participants.set(p.identity, audioPart);
    });

    this.triggerStreamStateUpdate();
  }

  async leaveRoom(): Promise<void> {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    this.micEnabled = false;
    this.participants.clear();
    this.triggerStreamStateUpdate();
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    this.micEnabled = enabled;
    if (!this.room) return;

    if (enabled) {
      const track = await createLocalAudioTrack();
      await this.room.localParticipant.publishTrack(track);
    } else {
      await this.room.localParticipant.setMicrophoneEnabled(false);
    }
  }

  isMicrophoneEnabled(): boolean {
    return this.micEnabled;
  }

  onParticipantConnected(callback: (p: AudioParticipant) => void): void {
    this.participantConnectedCallback = callback;
  }

  onParticipantDisconnected(callback: (id: string) => void): void {
    this.participantDisconnectedCallback = callback;
  }

  onStreamStateChanged(callback: (participants: AudioParticipant[]) => void): void {
    this.streamStateCallback = callback;
  }

  onVolumeDuckingTriggered(callback: (shouldDuck: boolean) => void): void {
    this.duckingCallback = callback;
  }

  private triggerStreamStateUpdate() {
    if (this.streamStateCallback) {
      this.streamStateCallback(Array.from(this.participants.values()));
    }
  }
}

/**
 * Simulated Developer Stub Provider for local non-audio offline testing
 */
export class LocalDevStubProviderImpl implements LiveAudioProvider {
  name = "local_dev_stub";
  private micEnabled = false;
  private participants: AudioParticipant[] = [];

  private participantConnectedCallback?: (p: AudioParticipant) => void;
  private participantDisconnectedCallback?: (id: string) => void;
  private streamStateCallback?: (participants: AudioParticipant[]) => void;
  private duckingCallback?: (shouldDuck: boolean) => void;
  private simulationInterval: NodeJS.Timeout | null = null;

  async joinRoom(roomName: string, token: string): Promise<void> {
    console.log(`[Offline Audio] Joined virtual room ${roomName} via local stub.`);
    this.participants = [
      {
        id: "mock-host-1",
        displayName: "DJ Trey (Host)",
        isSpeaking: false,
        micEnabled: true,
        volume: 1.0,
      },
    ];

    // Simulate cohosts or callers connecting periodically
    this.simulationInterval = setInterval(() => {
      // Periodic speaking simulation to trigger ducking triggers
      if (Math.random() < 0.3) {
        const index = Math.floor(Math.random() * this.participants.length);
        const p = this.participants[index];
        p.isSpeaking = !p.isSpeaking;

        if (this.duckingCallback) {
          // Trigger ducking if the active speaker is speaking
          this.duckingCallback(p.isSpeaking);
        }
        if (this.streamStateCallback) {
          this.streamStateCallback([...this.participants]);
        }
      }
    }, 4000);
  }

  async leaveRoom(): Promise<void> {
    console.log("[Offline Audio] Left virtual room.");
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.participants = [];
    this.micEnabled = false;
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    this.micEnabled = enabled;
    console.log(`[Offline Audio] Microphone state changed to: ${enabled}`);
  }

  isMicrophoneEnabled(): boolean {
    return this.micEnabled;
  }

  onParticipantConnected(callback: (p: AudioParticipant) => void): void {
    this.participantConnectedCallback = callback;
  }

  onParticipantDisconnected(callback: (id: string) => void): void {
    this.participantDisconnectedCallback = callback;
  }

  onStreamStateChanged(callback: (participants: AudioParticipant[]) => void): void {
    this.streamStateCallback = callback;
  }

  onVolumeDuckingTriggered(callback: (shouldDuck: boolean) => void): void {
    this.duckingCallback = callback;
  }

  /**
   * Helper to manually simulate external actions in the stub
   */
  simulateParticipantJoin(id: string, name: string, role: string) {
    const p: AudioParticipant = {
      id,
      displayName: `${name} (${role})`,
      isSpeaking: false,
      micEnabled: true,
      volume: 1.0,
    };
    this.participants.push(p);
    if (this.participantConnectedCallback) {
      this.participantConnectedCallback(p);
    }
    if (this.streamStateCallback) {
      this.streamStateCallback([...this.participants]);
    }
  }

  simulateParticipantLeave(id: string) {
    this.participants = this.participants.filter((p) => p.id !== id);
    if (this.participantDisconnectedCallback) {
      this.participantDisconnectedCallback(id);
    }
    if (this.streamStateCallback) {
      this.streamStateCallback([...this.participants]);
    }
  }
}

/**
 * Registry of adapters
 */
const providers: Record<string, LiveAudioProvider> = {
  livekit: new LiveKitProviderImpl(),
  local_dev_stub: new LocalDevStubProviderImpl(),
};

export function getAudioProvider(name: string = "livekit"): LiveAudioProvider {
  // If LiveKit credentials are empty, default to local dev stub fallback
  const isUrlConfigured = Boolean(process.env.LIVEKIT_URL);
  if (name === "livekit" && !isUrlConfigured) {
    console.log("[Audio Provider] LiveKit not configured. Falling back to local_dev_stub.");
    return providers.local_dev_stub;
  }
  return providers[name] || providers.local_dev_stub;
}
