// 扩展 VNode 类型为 Fiber 类型
export interface Fiber {
  type: string | FC;
  props: {
    children: (VNode | string | number)[]; // 注意：源数据 children 可能包含非对象
    [key: string]: any;
  };
  dom?: HTMLElement | Text | null; // 真实 DOM 节点
  parent?: Fiber; // 指向父 Fiber
  child?: Fiber; // 指向第一个子 Fiber
  sibling?: Fiber; // 指向兄弟 Fiber
  alternate?: Fiber; // 指向旧 Fiber (用于 Diff)
  effectTag?: "PLACEMENT" | "UPDATE" | "DELETION"; // 副作用标签
}

export type FC = (props: Record<string, any>) => VNode;

// 定义 VNode 类型（虚拟 DOM 节点的结构）
export interface VNode {
  type: string | FC;
  props: {
    children: VNode[];
    [key: string]: any;
  };
}

// 创建文本节点/
function createTextElement(text: string): VNode {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 核心函数：创建虚拟 DOM
function createElement(
  type: string | FC,
  props: Record<string, any> | null,
  ...children: (VNode | string | number)[]
): VNode {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isObject = typeof child === "object" && child !== null;
        return isObject ? (child as VNode) : createTextElement(String(child));
      }),
    },
  };
}

// --- Fiber 架构核心状态 ---
let nextUnitOfWork: Fiber | null = null; // 下一个要执行的工作单元

/**
 * 将虚拟 DOM 渲染为真实 DOM
 * (现在的 render 只是设置任务的起点，不再直接递归)
 */
function render(vNode: VNode, container: HTMLElement | Text) {
  // 设置根 Fiber，作为第一个工作单元
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [vNode], // 将 vNode 作为 children 放入根容器
    },
    type: "ROOT", // 根节点特殊标记
  } as unknown as Fiber;
}

/**
 * 工作循环
 * 利用浏览器空闲时间执行任务
 */
function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  // 只要有工作且有空闲时间，就继续执行
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 请求下一次空闲回调
  requestIdleCallback(workLoop);
}

// 启动工作循环
requestIdleCallback(workLoop);

/**
 * 执行一个工作单元 (Fiber 节点)
 * 1. 创建 DOM (如果需要)
 * 2. 构建子 Fiber (reconcile children)
 * 3. 返回下一个工作单元 (child -> sibling -> uncle)
 */
function performUnitOfWork(fiber: Fiber): Fiber | null {
  // TODO: 1. 添加 DOM 节点
  // TODO: 2. 创建子节点的 Fiber
  // TODO: 3. 返回下一个节点
  return null; // 暂时返回 null 避免无限循环
}

// 暂时导出的对象，之后我们会不断扩充它
const MiniReact = {
  createElement,
  render,
};

export default MiniReact;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
