import type { Effect } from "./types";
import { renderContext } from "./state";

export function useEffect(
  callback: () => void | (() => void),
  deps?: any[]
): void {
  const oldHook = renderContext.wipFiber?.alternate?.hooks?.[
    renderContext.hookIndex
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
    renderContext.pendingEffects.push(hook);
  }

  renderContext.wipFiber?.hooks?.push(hook);
  renderContext.hookIndex += 1;
}
