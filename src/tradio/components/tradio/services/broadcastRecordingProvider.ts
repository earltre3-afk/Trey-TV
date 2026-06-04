/**
 * Tradio Broadcast Studio Pass 9: Live Recording + Replay Clips + Show Archiver
 * Provider-neutral recording adapter for multiple recording backends
 */

import type { RecordingProvider } from '../types/broadcastArchiveTypes';

export interface RecordingProviderConfig {
  enabled: boolean;
  provider: RecordingProvider;
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  storageRegion?: string;
}

export interface RecordingSession {
  id: string;
  room_id: string;
  egress_id?: string;
  status: 'initialized' | 'recording' | 'stopping' | 'completed' | 'failed';
  start_time?: number;
  end_time?: number;
  duration_ms?: number;
  output_path?: string;
  error?: string;
}

export class RecordingProviderAdapter {
  private provider: RecordingProvider;
  private config: RecordingProviderConfig;

  constructor(config: RecordingProviderConfig) {
    this.provider = config.provider;
    this.config = config;
  }

  /**
   * Verify provider is properly configured
   */
  isConfigured(): boolean {
    switch (this.provider) {
      case 'livekit':
        return !!(this.config.apiKey && this.config.apiSecret && this.config.endpoint);
      case 'uploaded_recording':
        return true; // Upload always available
      case 'local_dev_stub':
        return true; // Dev stub always available
      case 'server_side_capture':
        return !!this.config.endpoint;
      default:
        return false;
    }
  }

  /**
   * Get human-readable provider name
   */
  getProviderLabel(): string {
    switch (this.provider) {
      case 'livekit':
        return 'LiveKit Egress';
      case 'uploaded_recording':
        return 'Uploaded Recording';
      case 'server_side_capture':
        return 'Server-Side Capture';
      case 'local_dev_stub':
        return 'Local Dev Stub (Testing)';
      default:
        return 'Unknown Provider';
    }
  }

  /**
   * Start recording a live room/session
   * Note: Actual implementation happens server-side
   */
  async startRecording(input: {
    room_id: string;
    room_name: string;
    session_id: string;
    participant_ids: string[];
  }): Promise<RecordingSession | { error: string }> {
    if (!this.isConfigured()) {
      return { error: 'Recording provider not configured' };
    }

    switch (this.provider) {
      case 'livekit':
        return this.startLiveKitRecording(input);
      case 'local_dev_stub':
        return this.startDevStubRecording(input);
      case 'uploaded_recording':
        return { error: 'Uploaded recording requires manual upload, not live start' };
      case 'server_side_capture':
        return this.startServerCaptureRecording(input);
      default:
        return { error: 'Unknown provider' };
    }
  }

  /**
   * Stop an active recording
   */
  async stopRecording(input: {
    egress_id: string;
    room_id: string;
  }): Promise<{ duration_ms?: number; output_path?: string; error?: string }> {
    switch (this.provider) {
      case 'livekit':
        return this.stopLiveKitRecording(input);
      case 'local_dev_stub':
        return this.stopDevStubRecording(input);
      default:
        return { error: 'Cannot stop recording for this provider' };
    }
  }

  /**
   * Get recording status
   */
  async getRecordingStatus(input: {
    egress_id: string;
  }): Promise<{ status: string; duration_ms?: number; error?: string }> {
    switch (this.provider) {
      case 'livekit':
        return this.getLiveKitRecordingStatus(input);
      case 'local_dev_stub':
        return this.getDevStubRecordingStatus(input);
      default:
        return { status: 'unknown', error: 'Provider not supported' };
    }
  }

  /**
   * LiveKit Egress implementation (server-side would call actual SDK)
   */
  private async startLiveKitRecording(input: {
    room_id: string;
    room_name: string;
    session_id: string;
    participant_ids: string[];
  }): Promise<RecordingSession | { error: string }> {
    // In production, this would call the actual LiveKit API
    // For now, return a stub response that server-side will handle
    console.log('[RecordingProvider] Starting LiveKit egress for room:', input.room_name);

    return {
      id: `recording-${input.session_id}`,
      room_id: input.room_id,
      egress_id: `egress-${Date.now()}`,
      status: 'recording' as const,
      start_time: Date.now(),
    };
  }

  private async stopLiveKitRecording(input: {
    egress_id: string;
    room_id: string;
  }): Promise<{ duration_ms?: number; output_path?: string; error?: string }> {
    console.log('[RecordingProvider] Stopping LiveKit egress:', input.egress_id);

    // In production, call actual LiveKit API
    return {
      duration_ms: 3600000, // Example: 1 hour
      output_path: `tradio/live-recordings/${input.room_id}/${input.egress_id}.mp3`,
    };
  }

  private async getLiveKitRecordingStatus(input: {
    egress_id: string;
  }): Promise<{ status: string; duration_ms?: number; error?: string }> {
    // In production, call actual LiveKit API to get real status
    return { status: 'recording', duration_ms: 1800000 };
  }

  /**
   * Local dev stub for testing (no actual recording)
   */
  private async startDevStubRecording(input: {
    room_id: string;
    room_name: string;
    session_id: string;
    participant_ids: string[];
  }): Promise<RecordingSession> {
    console.log('[RecordingProvider] Starting DEV STUB recording for:', input.room_name);

    return {
      id: `recording-${input.session_id}`,
      room_id: input.room_id,
      egress_id: `stub-egress-${Date.now()}`,
      status: 'recording' as const,
      start_time: Date.now(),
    };
  }

  private async stopDevStubRecording(input: {
    egress_id: string;
    room_id: string;
  }): Promise<{ duration_ms?: number; output_path?: string; error?: string }> {
    console.log('[RecordingProvider] Stopping DEV STUB recording');

    // Dev stub returns a fake but valid output path
    return {
      duration_ms: Math.floor(Math.random() * 7200000) + 300000, // 5min to 2h
      output_path: `tradio/live-recordings/dev/${input.egress_id}.mp3`,
    };
  }

  private async getDevStubRecordingStatus(input: {
    egress_id: string;
  }): Promise<{ status: string; duration_ms?: number }> {
    return { status: 'recording', duration_ms: Math.random() * 3600000 };
  }

  /**
   * Server-side capture implementation (placeholder)
   */
  private async startServerCaptureRecording(input: {
    room_id: string;
    room_name: string;
    session_id: string;
    participant_ids: string[];
  }): Promise<RecordingSession | { error: string }> {
    return {
      id: `recording-${input.session_id}`,
      room_id: input.room_id,
      status: 'recording' as const,
      start_time: Date.now(),
    };
  }
}

/**
 * Factory function to create appropriate adapter
 */
export function createRecordingAdapter(
  config: RecordingProviderConfig,
): RecordingProviderAdapter {
  return new RecordingProviderAdapter(config);
}

/**
 * Get available recording providers for current environment
 */
export function getAvailableRecordingProviders(
  envConfig?: Record<string, string>,
): RecordingProvider[] {
  const available: RecordingProvider[] = ['local_dev_stub', 'uploaded_recording'];

  // Check if LiveKit Egress is configured
  if (envConfig?.LIVEKIT_API_KEY && envConfig?.LIVEKIT_API_SECRET) {
    available.unshift('livekit');
  }

  // Check if server-side capture is configured
  if (envConfig?.SERVER_CAPTURE_ENDPOINT) {
    available.push('server_side_capture');
  }

  return available;
}
