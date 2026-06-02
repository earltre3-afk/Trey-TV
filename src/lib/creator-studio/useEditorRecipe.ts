/**
 * useEditorRecipe — React state wrapper around the pure EditRecipe mutators.
 *
 * Holds the recipe in an undo/redo history stack. Because every mutator in
 * editRecipe.ts is pure (and returns the SAME reference on a no-op), undo/redo
 * and "did anything change?" both fall out for free.
 */
import { useCallback, useMemo, useState } from "react";
import * as R from "./editRecipe";
import type {
  EditRecipe,
  EffectType,
  FilterType,
  TransitionType,
  OverlayClip,
  TextClip,
  AudioClip,
} from "./editRecipe";

interface History {
  past: EditRecipe[];
  present: EditRecipe;
  future: EditRecipe[];
}

const HISTORY_LIMIT = 60;

export interface EditorRecipeApi {
  recipe: EditRecipe | null;
  init: (recipe: EditRecipe) => void;
  reset: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  split: (clipId: string, atTimelineSec: number) => void;
  trim: (clipId: string, patch: { trimIn?: number; trimOut?: number }) => void;
  setSpeed: (clipId: string, speed: number) => void;
  setTransition: (clipId: string, side: "in" | "out", type: TransitionType) => void;
  setFilter: (clipId: string, filter: FilterType) => void;
  toggleEffect: (clipId: string, effect: EffectType) => void;
  setOpacity: (clipId: string, opacity: number) => void;

  addText: (
    init: { text: string; start?: number; length?: number } & Partial<
      Omit<TextClip, "kind" | "id">
    >,
  ) => void;
  addOverlay: (
    init: { src: string; start?: number; length?: number } & Partial<
      Omit<OverlayClip, "kind" | "id">
    >,
  ) => void;
  addAudio: (
    init: { src: string; start?: number; length?: number } & Partial<
      Omit<AudioClip, "kind" | "id">
    >,
  ) => void;
  addCaption: (init: { text: string; start?: number; length?: number }) => void;

  remove: (clipId: string) => void;
  move: (clipId: string, newStart: number) => void;
}

export function useEditorRecipe(initial: EditRecipe | null = null): EditorRecipeApi {
  const [hist, setHist] = useState<History | null>(
    initial ? { past: [], present: initial, future: [] } : null,
  );

  const commit = useCallback((fn: (r: EditRecipe) => EditRecipe) => {
    setHist((h) => {
      if (!h) return h;
      const next = fn(h.present);
      if (next === h.present) return h; // pure no-op → don't pollute history
      return {
        past: [...h.past, h.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      };
    });
  }, []);

  const init = useCallback((recipe: EditRecipe) => {
    setHist({ past: [], present: recipe, future: [] });
  }, []);

  const reset = useCallback(() => setHist(null), []);

  const undo = useCallback(() => {
    setHist((h) => {
      if (!h || h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future].slice(0, HISTORY_LIMIT),
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHist((h) => {
      if (!h || h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present].slice(-HISTORY_LIMIT),
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  return useMemo<EditorRecipeApi>(
    () => ({
      recipe: hist?.present ?? null,
      init,
      reset,
      undo,
      redo,
      canUndo: (hist?.past.length ?? 0) > 0,
      canRedo: (hist?.future.length ?? 0) > 0,

      split: (id, t) => commit((r) => R.splitClip(r, id, t)),
      trim: (id, p) => commit((r) => R.trimClip(r, id, p)),
      setSpeed: (id, s) => commit((r) => R.setSpeed(r, id, s)),
      setTransition: (id, side, type) => commit((r) => R.setTransition(r, id, side, type)),
      setFilter: (id, f) => commit((r) => R.setFilter(r, id, f)),
      toggleEffect: (id, e) => commit((r) => R.toggleEffect(r, id, e)),
      setOpacity: (id, o) => commit((r) => R.setOpacity(r, id, o)),

      addText: (i) => commit((r) => R.addTextClip(r, i)),
      addOverlay: (i) => commit((r) => R.addOverlayClip(r, i)),
      addAudio: (i) => commit((r) => R.addAudioClip(r, i)),
      addCaption: (i) => commit((r) => R.addCaptionClip(r, i)),

      remove: (id) => commit((r) => R.deleteClip(r, id)),
      move: (id, s) => commit((r) => R.moveClip(r, id, s)),
    }),
    [hist, commit, init, reset, undo, redo],
  );
}
