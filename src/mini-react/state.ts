import type { Effect, Fiber } from "./types";

export const fiberState = {
  nextUnitOfWork: null as Fiber | null,
  wipRoot: null as Fiber | null,
  currentRoot: null as Fiber | null,
  deletions: [] as Fiber[],
  wipFiber: null as Fiber | null,
  hookIndex: 0,
  pendingEffects: [] as Effect[],
};
