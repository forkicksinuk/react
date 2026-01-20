import type { Hook, Fiber } from "./types";
import { fiberState } from "./state";

export function useState<T>(
  initial: T
): [T, (action: T | ((prev: T) => T)) => void] {
  const oldHook = fiberState.wipFiber?.alternate?.hooks?.[
    fiberState.hookIndex
  ] as Hook | undefined;

  const hook: Hook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],  // 复用同一个数组引用
  };

  // 复制 actions，然后清空 queue（保持引用不变）
  const actions = [...hook.queue];
  hook.queue.length = 0;

  actions.forEach((action) => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });

  const setState = (action: T | ((prev: T) => T)) => {
    hook.queue.push(action as any);

    fiberState.wipRoot = {
      dom: fiberState.currentRoot?.dom,
      props: fiberState.currentRoot?.props || { children: [] },
      type: fiberState.currentRoot?.type || "ROOT",
      alternate: fiberState.currentRoot,
    } as Fiber;
    fiberState.nextUnitOfWork = fiberState.wipRoot;
    fiberState.deletions = [];
  };

  fiberState.wipFiber?.hooks?.push(hook);
  fiberState.hookIndex += 1;

  return [hook.state, setState];
}
