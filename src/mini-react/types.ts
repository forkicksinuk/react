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
  dom?: HTMLElement | Text | null;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber;
  effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";
  hooks?: (Hook | Effect)[];
}
