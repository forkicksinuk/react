import type { Hook, Fiber } from "./types";
import { renderContext } from "./state";

export function useState<T>(
  initial: T
): [T, (action: T | ((prev: T) => T)) => void] {
  const oldHook = renderContext.wipFiber?.alternate?.hooks?.[
    renderContext.hookIndex
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

    renderContext.wipRoot = {
      dom: renderContext.currentRoot?.dom ?? null,
      props: renderContext.currentRoot?.props ?? { children: [] },
      type: renderContext.currentRoot?.type ?? "ROOT",
      parent: null,
      child: null,
      sibling: null,
      alternate: renderContext.currentRoot,
      effectTag: null,
      hooks: null,
    } as Fiber;
    renderContext.nextUnitOfWork = renderContext.wipRoot;
    renderContext.deletions = [];
  };

  renderContext.wipFiber?.hooks?.push(hook);
  renderContext.hookIndex += 1;

  return [hook.state, setState];
}
