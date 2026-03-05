export type FC = (props: Record<string, any>) => VNode;

export interface VNode {
  type: string | FC;
  props: {
    children: VNode[];
    [key: string]: any;
  };
}

export interface Hook {
  state: any;
  queue: ((state: any) => any)[];
}

/** useRef 存储的可变引用，跨渲染保持同一对象 */
export interface RefObject<T> {
  current: T;
}

export interface RefHook {
  ref: RefObject<any>;
}

export interface Effect {
  callback: () => void | (() => void);
  deps: any[] | undefined;
  cleanup?: () => void;
}

export interface Fiber {
  type: string | FC;
  props: {
    children: (VNode | string | number)[];
    [key: string]: any;
  };
  dom: HTMLElement | Text | null;
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  effectTag: "PLACEMENT" | "UPDATE" | "DELETION" | null;
  hooks: (Hook | Effect | RefHook)[] | null;
  deletions?: Fiber[];
}
