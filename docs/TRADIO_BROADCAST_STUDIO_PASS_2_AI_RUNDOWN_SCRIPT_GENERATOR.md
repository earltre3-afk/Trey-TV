# Tradio Broadcast Studio Pass 2: AI Program Director & Host Script Generator

This document details the architecture, JSON schemas, prompting templates, and editor states implemented for Pass 2 of the **Tradio Broadcast Studio**.

---

## 1. System Overview
Pass 2 introduces the **AI Program Director** and the **AI Host Script Generator** to Tradio, shifting the studio from a structured manual timeline to an interactive, AI-collaborative control room.

Approved broadcasters can design full 30-minute program timelines, generate conversational host scripts across 10 distinct voice styles, adjust script lengths/tones on a block-by-block basis, lock segments, browse revision drafts, and override blocks manually.

---

## 2. System Architecture

The AI processing graph consists of three core structural modules:
1. **Prompts Engine (`src/tradio/components/tradio/services/broadcastAiPrompts.ts`)**: Defines structured instructions and style configurations for the LLM.
2. **Parser Guard (`src/tradio/components/tradio/services/broadcastAiParser.ts`)**: Cleans, parses, and validates the LLM's raw JSON outputs, ensuring enums and types are fully compatible with the schema.
3. **TanStack Start Server functions (`src/lib/trey-i/broadcastAi.server.ts`)**: Secure server-side routes that query the parent Gemini AI model using process API keys.
4. **Client Services (`src/tradio/components/tradio/services/broadcastService.ts`)**: Client-facing endpoints called by the UI that hit the server-side RPC functions and provide high-fidelity local deterministic fallback structures.

---

## 3. Prompts & Style Presets

The AI supports 10 distinct, highly organic broadcast host styles:
1. **Velvet Radio (`late_night_radio`)**: Deep, late-night atmospheric lofi.
2. **Street Polished (`street_polished`)**: Polished street cultural tastemaker.
3. **Luxury Station (`luxury_station`)**: Elegant, elite status VIP curation.
4. **Funny Personality (`funny_personality`)**: Quick-witted, humorous, fourth-wall breaking.
5. **Professional Radio (`professional_radio`)**: Authoritative, pristine FM anchor.
6. **Artist-First (`artist_first`)**: Raw, emotional creative-process storytelling.
7. **DJ Hype (`dj_hype`)**: High-energy club DJ hyping up the room.
8. **Producer Breakdown (`producer_breakdown`)**: Technical stem and loop analysis.
9. **Intimate Podcast (`intimate_podcast`)**: Cozy, personal, genuine stories.
10. **Discovery Tastemaker (`discovery_host`)**: Passionate underground tastemaker.

---

## 4. JSON Schema Contract

The AI Program Director returns structured JSON schemas:

### Rundown Curation Shape:
```json
{
  "episodeTitle": "string",
  "episodeSummary": "string",
  "targetDurationSeconds": 1800,
  "blocks": [
    {
      "blockType": "intro | station_drop | voiceover | song | ad | interview | producer_spotlight | artist_spotlight | submission_block | silence | transition | outro",
      "title": "string",
      "description": "string",
      "scriptText": "string | null",
      "durationSeconds": 120,
      "rightsStatus": "tradio_native | creator_owned | approved_submission | licensed_catalog | unclear",
      "approvalStatus": "pending",
      "metadata": {}
    }
  ]
}
```

### Script/Voice Curation Shape:
```json
{
  "scriptText": "string",
  "styleMode": "string",
  "metadata": {
    "wordCount": 75,
    "styleApplied": "string",
    "deliveryPacing": "slow | moderate | fast"
  }
}
```

---

## 5. UI Co-Pilot Elements

### Block Script Locking:
Creators can lock individual blocks (using a yellow-glowing lock icon). Locked blocks are stored in the block's database metadata (`block.metadata.locked = true`). Toggling the button syncs the lock state directly to the database.

During **Rundown Regeneration**, the timeline generator loops over the existing segments, preserves locked scripts and properties in place, and replaces only the unlocked slots, allowing creators to keep polished scripts while updating everything else.

### AI Style Modifiers:
Creators can select active scripts and apply single-tap AI Style Modifiers:
* **Shorter**: Shrinks text under 40 words.
* **Funnier**: Injects witty humor.
* **Professional**: Shifts to formal FM delivery.
* **More Street**: Shifts to cultural street-polished tastemaker.
* **Emotional**: Speaks from the heart about the art.
* **Hype**: Injects hyper club energy.

### Revisions Draft Browser:
Every AI regeneration and style modification creates a new revision draft inside the revisions map. Creators can click "Prev" and "Next" buttons inside the editor to browse past drafts and revert back to any prior version.

---

## 6. Upgraded Readiness Validation

`validateEpisodeDraft()` was upgraded with the following checks:
1. **Database Presence:** Validates that the referenced episode and parent show exists.
2. **Access Control:** Verifies that the current user is the authenticated owner or has elevated system permissions (`admin` or `owner` roles).
3. **Empty Timelines:** Rejects empty episodes, prompting rundown generation.
4. **Duration Validation:** Flags and rejects negative or zero-duration segments.
5. **Copyright Check:** Scans and blocks publishing on episodes containing songs with unresolved rights clearances (`rights_status = 'unclear'`).
6. **Script Completeness:** Flags empty script texts on host talk segments (`intro`, `voiceover`, `transition`, `outro`).

---

## 7. Future Voice Synthesis Integration
In Pass 3, the `script_text` fields from these curated blocks will connect to the AI Voice Synthesizer service. Users can select voices and tap "Render Base64 Voice" which will hit Gemini TTS or ElevenLabs, creating stable audio stream URLs saved directly into the newly created `tradio_voice_renders` schema.
