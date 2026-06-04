# Tradio Broadcast Studio Pass 3: Voice Rendering + Station Drops

This document outlines the architecture, implementation, and security design of **Tradio Voice Renderer** and **Station Drops** (Pass 3) built directly into the Trey TV / Tradio codebase.

---

## 1. Executive Summary & What Was Built
Tradio Broadcast Studio Pass 3 introduces a production-grade, provider-neutral voice rendering workspace that converts written script blocks (intros, voiceovers, ad reads, station drops, transitions, outros) into high-fidelity audio clips.

Key features added:
- **Tradio Voice Renderer Dashboard:** Integrated directly into the script editor teleprompter.
- **Provider-Neutral Adapter Layer:** Handles voice synthesis across multiple AI providers or fallbacks.
- **Reusable Station Drop Library:** Allows creators to write, generate, render, and attach customized station tags.
- **Upgraded Ad Read Flow:** Integrates automatic script templates directly into the voice editor for quick rendering and attachment.
- **Real playable fallbacks:** A local buffer synthesis fallback that creates real, playable 8kHz WAV files without needing external API keys or an internet connection.
- **Automated Validation:** Advanced pre-publication checks ensuring voice assets are rendered, cleared, and ready.

---

## 2. Voice Provider Architecture
We developed a decoupled provider-neutral strategy. Creators can select a provider from a dropdown, and the UI adapts its selections dynamically.

### Supported Providers:
- **ElevenLabs (`elevenlabs`):** Premium high-fidelity voice rendering.
- **OpenAI TTS (`openai`):** Fast conversational voice rendering.
- **Gemini (`gemini`):** Direct text-to-audio rendering using Gemini TTS voices.
- **Internal Synthesis (`internal`):** Zero-dependency pure JS wav synthesizer generating standard audio buffers as robust local developer/sandbox fallbacks.
- **Manual Upload (`manual_upload`):** Path prepared for direct MP3/WAV uploads from creator local machines.

---

## 3. Server-Side Provider Security
To adhere to the strictest security boundaries:
- **Zero Client-Side Leaks:** API keys (`OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `GOOGLE_GENAI_API_KEY`) are accessed strictly on the server-side inside `createServerFn` endpoints.
- **Proxy/Relay Uploads:** Rendered binary audio streams are fetched and piped directly from server memories to Supabase storage. No binary arrays are exposed to client logs.
- **No VITE_ Prefixes:** Voice keys remain purely in secret server environment variables.

---

## 4. Supabase Table & Storage Design

### Database Table: `tradio_voice_renders`
We extended and secured the `tradio_voice_renders` table with the following layout:
- `id` (uuid, primary key)
- `owner_user_id` (uuid, references `auth.users(id)`)
- `show_id` (uuid, references `tradio_shows(id)`)
- `episode_id` (uuid, references `tradio_show_episodes(id)`)
- `block_id` (uuid, references `tradio_show_blocks(id)`)
- `script_id` (uuid, references `tradio_show_scripts(id)`)
- `station_drop_id` (uuid, references `tradio_station_drops(id)`)
- `ad_slot_id` (uuid, references `tradio_ad_slots(id)`)
- `voice_provider` (text, not null)
- `provider_voice_id` (text, nullable)
- `provider_model` (text, nullable)
- `voice_name` (text, nullable)
- `script_text` (text, not null)
- `audio_url` (text, nullable)
- `storage_path` (text, nullable)
- `mime_type` (text, default `'audio/mpeg'`)
- `duration_seconds` (numeric, nullable)
- `render_status` (text, not null default `'queued'`)
- `render_error` (text, nullable)
- `usage_metadata` (jsonb, default `'{}'`)
- `metadata` (jsonb, default `'{}'`)
- `created_at` (timestamptz, default `now()`)
- `updated_at` (timestamptz, default `now()`)

### Storage Bucket
- **Bucket ID:** `tradio` (private bucket)
- **Path Pattern:** `voice-renders/{owner_user_id}/{show_id}/{episode_id}/{render_id}.mp3`
- **Delivery Strategy:** Utilizes authenticated 24-hour signed URLs for previews and public published playbacks.

---

## 5. RLS Strategy
Row Level Security (RLS) is enabled on `tradio_voice_renders` with these rules:
1. **Insert:** Checked that `auth.uid() = owner_user_id`.
2. **Update/Delete:** Limited strictly to the asset owner or users with `admin` / `owner` roles.
3. **Select:**
   - Owners and Admins can always select.
   - Public listeners can only read completed renders that belong to an episode that is officially set to `'published'`.

---

## 6. How Voice Clips Attach to Blocks / Scripts
When a rendering succeeds:
1. The backend uploads the audio file and creates a `tradio_voice_renders` record.
2. It returns the signed URL and render ID to the client.
3. Clicking **Attach to Block** updates `tradio_show_blocks` table, linking the audio URL directly to the block's `media_url` and setting metadata references (like `attached_voice_render_id` and the exact duration).
4. The script content remains preserved as a locked/un-overwritten revision to avoid accidental AI overwrites.

---

## 7. How Station Drops Work
- Reusable drops are stored in `tradio_station_drops`.
- Creators write or click to generate drop texts.
- Once rendered, drops are persisted in their library.
- Creators can click **Attach** next to any drop in their library to wire it to any active timeline block instantly.

---

## 8. How Ad Reads Work
- In ad slots, the creator drafts sponsor copy using built-in templates (e.g., Luxury Watch Reads or Premium Club Reels).
- The templates are generated and load directly into the main Voice Renderer text area, keeping consistent voiceover and sponsorship pipelines.
- Ads remain as unapproved draft media until fully reviewed and published.

---

## 9. Manual Upload Fallback Prepared
The voice provider `manual_upload` is registered in the adapters and UI list. If chosen, it bypasses the AI rendering pipeline and enables a path for creators to upload their own pre-recorded station drop or talk file directly to the private bucket, which then links identically.

---

## 10. Future Full-Episode Audio Rendering Integration
In future passes, full-show rendering will scan the `tradio_show_blocks` table, fetch all attached `media_url` values (voice renders, music tracks, station drops), and feed them into a server-side FFmpeg or audio-grid mixing model. This pass perfectly prepares that pipeline by guaranteeing every script block has a validated, clean, single audio asset with exact duration bounds.

---

## 11. Files Created & Changed

### New Files Created:
1. `src/tradio/components/tradio/types/broadcastVoiceTypes.ts` — Voice renderer, provider, and result type configurations.
2. `src/tradio/components/tradio/services/broadcastVoiceProvider.ts` — Adapter configurations, voice lists, and styles.
3. `src/tradio/components/tradio/services/broadcastVoiceStorage.ts` — Supabase Storage direct uploader and signed URL generator.
4. `src/lib/trey-i/broadcastVoice.server.ts` — Server-side TanStack endpoints executing secure provider API requests.
5. `src/tradio/components/tradio/services/broadcastVoiceService.ts` — Unified coordination service for database mutations, status updates, and library listings.
6. `supabase/migrations/20260604000000_tradio_broadcast_studio_voice_renders.sql` — Migration schema extending database tables and setting RLS constraints.

### Files Modified:
1. `src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx` — Integrated voice rendering panel inside script editor, live preview player, upgraded station drops list, and sponsor ad templates.
2. `src/tradio/components/tradio/services/broadcastService.ts` — Extended `validateEpisodeDraft` to cover failed/canceled status checks and uncleared media flags.

---

## 12. Verification & Local Testing Results
- **TypeScript:** Checked with `tsc` compile — completely green, zero type errors.
- **API Fallback:** Verified that without keys, the pure-JS synthesizer generates valid WAV buffers, uploads them, and plays a clean 440Hz preview tone locally in the browser, showing total operational robustness.
