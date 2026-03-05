import type { RefHook } from "./types";
import { renderContext } from "./state";

/**
 * useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的初始值。
 * 返回的 ref 对象在组件的整个生命周期内保持不变，修改 .current 不会触发重新渲染。
 */
export function useRef<T>(initialValue: T): { current: T } {
  const oldHook = renderContext.wipFiber?.alternate?.hooks?.[
    renderContext.wipHookIndex
  ] as RefHook | undefined;

  const hook: RefHook = {
    ref: oldHook ? oldHook.ref : { current: initialValue },
  };

  renderContext.wipFiber?.hooks?.push(hook);
  renderContext.wipHookIndex += 1;

  return hook.ref;
}
