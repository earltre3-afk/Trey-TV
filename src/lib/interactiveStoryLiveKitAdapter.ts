import type { Branch, ChapterRecord, Choice } from "@/features/interactive-stories/lib/storyTypes";
import { CHARACTERS } from "@/features/interactive-stories/lib/storyData";
import { getInstalledStoryPackage } from "@/features/interactive-stories/lib/treyStoryPackage";
import type { StoryBeatVoiceLine } from "@/features/interactive-stories/lib/storyVoiceTypes";

export type NarrationStatusValue = "started" | "paused" | "resumed" | "finished" | "failed";

export interface InteractiveStoryNarrationContext {
  branch: Branch;
  story?: {
    id?: string;
    title?: string;
    tone?: string;
    genre?: string;
    description?: string;
  };
  chapter?: ChapterRecord;
  beat?: ChapterRecord;
  currentBeatIndex?: number;
}

export interface AIStoryMakerNarrationContext {
  storyProjectId: string;
  projectId?: string;
  pageId: string;
  chapterTitle?: string;
  pageTitle?: string;
  pageNumber?: number;
  content: string;
  summary?: string;
  tone?: string;
  genre?: string;
  characters?: unknown[];
  narrationScript?: unknown;
}

let currentContext: InteractiveStoryNarrationContext | null = null;
let currentAIStoryMakerContext: AIStoryMakerNarrationContext | null = null;

export function setCurrentInteractiveStoryNarrationContext(
  context: InteractiveStoryNarrationContext | null,
) {
  currentContext = context;
}

export function setCurrentAIStoryMakerNarrationContext(
  context: AIStoryMakerNarrationContext | null,
) {
  currentAIStoryMakerContext = context;
}

export function getCurrentInteractiveStoryNarrationContext() {
  return currentContext;
}

export function getCurrentAIStoryMakerNarrationContext() {
  return currentAIStoryMakerContext;
}

function safeId(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function currentChapterFromContext(context: InteractiveStoryNarrationContext) {
  return (
    context.chapter || context.beat || context.branch.chapters[context.branch.chapters.length - 1]
  );
}

export function getInteractiveStoryMetadata(branch: Branch) {
  const installed = getInstalledStoryPackage(branch.storyId);
  if (installed) {
    return {
      id: installed.story.id,
      title: installed.story.title,
      genre: installed.story.genre || "Interactive Story",
      description: installed.story.description || "",
      tone: "",
    };
  }

  if (branch.storyId === "switch_kicks") {
    return {
      id: "switch_kicks",
      title: "Switch Kicks",
      genre: "Body-swap dramedy",
      description:
        "Twin brothers trade worlds across football, ballet, family pressure, and first love.",
      tone: branch.toneHistory[branch.toneHistory.length - 1] || "Bold",
    };
  }

  return {
    id: branch.storyId,
    title: branch.storyId.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    genre: "Interactive Story",
    description: "",
    tone: branch.toneHistory[branch.toneHistory.length - 1] || "",
  };
}

export function adaptBeatToCurrentStoryPage(
  story: InteractiveStoryNarrationContext["story"] | undefined,
  chapter: ChapterRecord | undefined,
  beat: ChapterRecord | undefined,
  currentBeatIndex = 0,
) {
  if (!beat && !chapter) {
    return {
      available: false,
      message: "No active interactive story beat is open.",
    };
  }

  const activeBeat = beat || chapter;
  const pageId = safeId(
    activeBeat?.sceneId,
    `chapter-${activeBeat?.number || currentBeatIndex + 1}`,
  );
  const rawBeat = activeBeat as unknown as Record<string, unknown> | undefined;
  const content = String(
    rawBeat?.narration || rawBeat?.content || rawBeat?.text || activeBeat?.prose || "",
  );

  return {
    available: true,
    storyProjectId: safeId(story?.id, "interactive-story"),
    pageId,
    chapterTitle: chapter?.title || activeBeat?.title || "",
    pageTitle: activeBeat?.title || pageId,
    pageNumber: currentBeatIndex,
    content,
    summary: activeBeat?.summary || "",
    tone: story?.tone || activeBeat?.toneTag || "",
    genre: story?.genre || "",
  };
}

function characterDescription(character: Record<string, unknown>) {
  return String(
    character.description ||
      character.short_description ||
      character.role ||
      character.bio ||
      character.portraitPrompt ||
      "",
  );
}

function normalizeNarratorCharacter(character: Record<string, unknown>, index: number) {
  const id = safeId(character.character_id || character.id, `character_${index + 1}`);
  const name = safeId(
    character.display_name || character.name || character.firstName,
    id.replace(/[_-]+/g, " "),
  );
  const description = characterDescription(character);
  const voice =
    character.voice && typeof character.voice === "object"
      ? (character.voice as Record<string, unknown>)
      : undefined;

  return {
    id,
    name,
    role: String(character.role || "Character"),
    age: String(character.age || ""),
    personality: String(character.personality || description || "Story character"),
    voiceStyle: String(
      voice?.audioStyle || voice?.voiceName || character.voiceStyle || `${name} character voice`,
    ),
    speechPattern: String(character.speechPattern || character.quote || ""),
    emotionalTone: String(character.emotionalTone || character.tone || ""),
    visualDescription: String(
      character.visualDescription || description || character.portrait || character.image || "",
    ),
  };
}

export function adaptStoryCharactersForNarrator(storyOrContext?: unknown) {
  const context =
    storyOrContext && typeof storyOrContext === "object" && "branch" in storyOrContext
      ? (storyOrContext as InteractiveStoryNarrationContext)
      : currentContext;
  const chapter = context ? currentChapterFromContext(context) : undefined;
  const installed = context ? getInstalledStoryPackage(context.branch.storyId) : null;
  const rawCharacters = chapter?.storyCharacters?.length
    ? chapter.storyCharacters
    : installed?.characters?.length
      ? installed.characters
      : context?.branch.storyId === "switch_kicks"
        ? CHARACTERS
        : [];

  if (!rawCharacters.length) {
    return {
      available: false,
      message: "No characters found for the current interactive story.",
      characters: [],
    };
  }

  return {
    available: true,
    characters: rawCharacters.map((character, index) =>
      normalizeNarratorCharacter(character as Record<string, unknown>, index),
    ),
  };
}

function lineSpeakerName(line: StoryBeatVoiceLine) {
  return line.speakerName || line.character_id || line.characterId || line.speakerId || "";
}

export function createNarrationScriptFromBeat(_story: unknown, beat?: ChapterRecord) {
  if (!beat) {
    return {
      available: false,
      mode: "silent",
      lines: [],
      message: "Narration script missing because no active beat is open.",
    };
  }

  if (beat.voiceLines?.length) {
    const lines = [...beat.voiceLines]
      .filter((line) => line.text?.trim())
      .sort((a, b) => (a.lineIndex || 0) - (b.lineIndex || 0))
      .map((line, index) => {
        const type =
          line.type === "dialogue" ||
          (lineSpeakerName(line) && lineSpeakerName(line) !== "narrator")
            ? "dialogue"
            : "narrator";
        return {
          id: line.id || `line_${index + 1}`,
          type,
          characterName: type === "dialogue" ? lineSpeakerName(line) : "",
          text: line.text.trim(),
          emotion: line.emotion || beat.toneTag || "",
          orderIndex: line.lineIndex ?? index,
        };
      });

    return {
      available: true,
      mode: lines.some((line) => line.type === "dialogue") ? "hybrid" : "author",
      lines,
    };
  }

  const text = beat.prose?.trim();
  if (!text) {
    return {
      available: false,
      mode: "silent",
      lines: [],
      message: "Narration script missing for the current story beat.",
    };
  }

  return {
    available: true,
    mode: "author",
    lines: [
      {
        id: `${safeId(beat.sceneId, `chapter_${beat.number}`)}_narration`,
        type: "narrator",
        characterName: "",
        text,
        emotion: beat.toneTag || "",
        orderIndex: 0,
      },
    ],
  };
}

export function createDirectionOptionsFromChoices(beatOrChoices?: ChapterRecord | Choice[] | null) {
  const choices = Array.isArray(beatOrChoices) ? beatOrChoices : [];
  if (!choices.length) return [];
  return choices.map((choice) => (choice.label ? `${choice.label}. ${choice.text}` : choice.text));
}

export function prepareDirectionFromBranch(branch: Branch) {
  const choices = branch.pendingStopPoint?.choices || [];
  if (choices.length) {
    return {
      canContinue: true,
      needsDirection: true,
      currentPrompt: "What happens next?",
      suggestedDirections: [...createDirectionOptionsFromChoices(choices), "Say my own choice"],
    };
  }

  return {
    canContinue: !branch.isComplete,
    needsDirection: false,
    currentPrompt: branch.isComplete ? "This story branch is complete." : "Continue the story.",
    suggestedDirections: branch.isComplete ? [] : ["Continue"],
  };
}

export function getCurrentAIStoryMakerPageForNarrator() {
  const context = getCurrentAIStoryMakerNarrationContext();
  if (!context) {
    return {
      available: false,
      message: "No active AI Story Maker page is open.",
    };
  }

  return {
    available: true,
    storyProjectId: context.storyProjectId,
    pageId: context.pageId,
    chapterTitle: context.chapterTitle || "",
    pageTitle: context.pageTitle || context.pageId,
    pageNumber: context.pageNumber ?? 0,
    content: context.content,
    summary: context.summary || "",
    tone: context.tone || "",
    genre: context.genre || "",
  };
}

export function getCurrentAIStoryMakerCharactersForNarrator() {
  const context = getCurrentAIStoryMakerNarrationContext();
  if (!context?.characters?.length) {
    return {
      available: false,
      message: "No characters found for the current AI Story Maker page.",
      characters: [],
    };
  }

  return {
    available: true,
    characters: context.characters,
  };
}

export function getCurrentAIStoryMakerNarrationScriptForNarrator() {
  const context = getCurrentAIStoryMakerNarrationContext();
  if (!context) {
    return {
      available: false,
      mode: "silent",
      lines: [],
      message: "Narration script missing because no active AI Story Maker page is open.",
    };
  }

  if (context.narrationScript) return context.narrationScript;

  return {
    available: true,
    mode: "author",
    lines: [
      {
        id: `${safeId(context.pageId, "page")}_narration`,
        type: "narrator",
        characterName: "",
        text: context.content,
        emotion: context.tone || "",
        orderIndex: 0,
      },
    ],
  };
}

export function getCurrentDirectionForAIStoryMakerNarrator() {
  return {
    canContinue: true,
    needsDirection: true,
    currentPrompt: "I wrote this page. Where do we go from here?",
    suggestedDirections: [
      "Raise the stakes",
      "Reveal a secret",
      "Slow down emotionally",
      "Write my own direction",
    ],
  };
}

export function getCurrentStoryPageForNarrator() {
  if (getCurrentAIStoryMakerNarrationContext()) {
    return getCurrentAIStoryMakerPageForNarrator();
  }

  const context = getCurrentInteractiveStoryNarrationContext();
  if (!context) {
    return {
      available: false,
      message: "No active interactive story beat is open.",
    };
  }
  const story = context.story || getInteractiveStoryMetadata(context.branch);
  const chapter = currentChapterFromContext(context);
  return adaptBeatToCurrentStoryPage(
    story,
    chapter,
    context.beat || chapter,
    context.currentBeatIndex ?? 0,
  );
}

export function getCurrentDirectionForNarrator() {
  if (getCurrentAIStoryMakerNarrationContext()) {
    return getCurrentDirectionForAIStoryMakerNarrator();
  }

  const context = getCurrentInteractiveStoryNarrationContext();
  if (!context) {
    return {
      canContinue: false,
      needsDirection: false,
      currentPrompt: "No active interactive story beat is open.",
      suggestedDirections: [],
    };
  }
  return prepareDirectionFromBranch(context.branch);
}

export function getCurrentNarrationScriptForNarrator() {
  if (getCurrentAIStoryMakerNarrationContext()) {
    return getCurrentAIStoryMakerNarrationScriptForNarrator();
  }

  const context = getCurrentInteractiveStoryNarrationContext();
  const chapter = context ? currentChapterFromContext(context) : undefined;
  return createNarrationScriptFromBeat(context?.story, chapter);
}
