import type { Effect } from "./types";
import { fiberState } from "./state";

export function useEffect(
  callback: () => void | (() => void),
  deps?: any[]
): void {
  const oldHook = fiberState.wipFiber?.alternate?.hooks?.[
    fiberState.hookIndex
  ] as Effect | undefined;

  const hasChanged =
    !oldHook ||
    !deps ||
    !oldHook.deps ||
    deps.some((dep, i) => dep !== oldHook.deps![i]);

  const hook: Effect = {
    callback,
    deps,
    cleanup: oldHook?.cleanup,
  };

  if (hasChanged) {
    fiberState.pendingEffects.push(hook);
  }

  fiberState.wipFiber?.hooks?.push(hook);
  fiberState.hookIndex += 1;
}
