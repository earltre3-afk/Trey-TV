/**
 * Lazy wrappers for game-specific Pixi table renderers.
 * These ensure PixiJS is only bundled and loaded on game routes.
 */
import React, { lazy, Suspense } from "react";
import type { PixiBJTableProps } from "./PixiBlackjackTable";
import type { PixiSpadesProps } from "./PixiSpadesTable";
import type { PixiBullshitProps } from "./PixiBullshitTable";

const LazyBJTable = lazy(() => import("./PixiBlackjackTable"));
const LazySpadesTable = lazy(() => import("./PixiSpadesTable"));
const LazyBullshitTable = lazy(() => import("./PixiBullshitTable"));

export const PixiBlackjackTableLazy: React.FC<PixiBJTableProps> = (props) => (
  <Suspense fallback={null}>
    <LazyBJTable {...props} />
  </Suspense>
);

export const PixiSpadesTableLazy: React.FC<PixiSpadesProps> = (props) => (
  <Suspense fallback={null}>
    <LazySpadesTable {...props} />
  </Suspense>
);

export const PixiBullshitTableLazy: React.FC<PixiBullshitProps> = (props) => (
  <Suspense fallback={null}>
    <LazyBullshitTable {...props} />
  </Suspense>
);
