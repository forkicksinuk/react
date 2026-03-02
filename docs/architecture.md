# MiniReact 当前架构图

## 1. 模块依赖关系

```mermaid
flowchart TB
    subgraph Entry["入口层"]
        main["main.tsx<br/>应用入口"]
    end

    subgraph MiniReact["mini-react.ts<br/>统一导出"]
        CE[createElement]
        R[render]
        US[useState]
        UE[useEffect]
        UR[useRef]
    end

    subgraph Core["核心层"]
        element["element.ts<br/>createElement"]
        reconciler["reconciler.ts<br/>render / workLoop / commit"]
        dom["dom.ts<br/>createDom / updateDom"]
    end

    subgraph Hooks["Hooks 层"]
        useState["useState.ts"]
        useEffect["useEffect.ts"]
        useRef["useRef.ts"]
    end

    subgraph Shared["共享层"]
        types["types.ts<br/>VNode / Fiber / Hook 等"]
        state["state.ts<br/>fiberState 全局状态"]
    end

    main --> CE
    main --> R
    main --> US
    main --> UE
    main --> UR

    CE --> element
    R --> reconciler
    US --> useState
    UE --> useEffect
    UR --> useRef

    element --> types
    reconciler --> dom
    reconciler --> state
    reconciler --> types

    useState --> state
    useState --> types
    useEffect --> state
    useEffect --> types
    useRef --> state
    useRef --> types

    dom --> types

    style Entry fill:#e3f2fd
    style MiniReact fill:#e8f5e9
    style Core fill:#fff3e0
    style Hooks fill:#fce4ec
    style Shared fill:#f3e5f5
```

## 2. 数据流与渲染流程

```mermaid
flowchart LR
    subgraph Input["输入"]
        JSX["JSX 代码"]
    end

    subgraph Compile["编译"]
        TS["tsconfig<br/>jsxFactory"]
    end

    subgraph Build["构建阶段"]
        VNode["VNode 树"]
        Fiber["Fiber 树"]
    end

    subgraph Render["渲染阶段"]
        WorkLoop["workLoop<br/>requestIdleCallback"]
        Perform["performUnitOfWork"]
        Reconcile["reconcileChildren<br/>Diff"]
    end

    subgraph Commit["提交阶段"]
        CommitRoot["commitRoot"]
        DOM["真实 DOM"]
    end

    subgraph Effects["副作用"]
        FlushEffects["flushEffects<br/>useEffect"]
    end

    JSX --> TS
    TS --> VNode
    VNode --> Fiber
    Fiber --> WorkLoop
    WorkLoop --> Perform
    Perform --> Reconcile
    Reconcile --> CommitRoot
    CommitRoot --> DOM
    CommitRoot --> FlushEffects

    style Input fill:#e1f5fe
    style Build fill:#e8f5e9
    style Render fill:#fff9c4
    style Commit fill:#ffccbc
    style Effects fill:#f8bbd0
```

## 3. Fiber 树与状态管理

```mermaid
flowchart TB
    subgraph fiberState["fiberState 全局状态"]
        nextUnit["nextUnitOfWork<br/>下一个工作单元"]
        wipRoot["wipRoot<br/>工作中的根"]
        currentRoot["currentRoot<br/>已提交的根"]
        deletions["deletions<br/>待删除节点"]
        wipFiber["wipFiber<br/>当前 Fiber"]
        hookIdx["hookIndex<br/>Hook 索引"]
        pendingFX["pendingEffects<br/>待执行副作用"]
    end

    subgraph FiberTree["Fiber 树结构"]
        direction TB
        Root["ROOT"]
        Root --> C1["child"]
        C1 --> C2["sibling"]
        C2 --> C3["sibling"]
        C1 -.-> A1["alternate<br/>双缓冲"]
    end

    subgraph HooksChain["Hooks 链"]
        H1["useState"]
        H2["useEffect"]
        H3["useRef"]
        H1 --> H2 --> H3
    end

    wipFiber --> HooksChain
    wipRoot --> FiberTree
    currentRoot --> FiberTree

    style fiberState fill:#e8eaf6
    style FiberTree fill:#e0f2f1
    style HooksChain fill:#fce4ec
```

## 4. 文件结构总览

```
src/
├── main.tsx                 # 应用入口，使用 MiniReact
└── mini-react/
    ├── mini-react.ts       # 统一导出
    ├── types.ts            # 类型定义 (VNode, Fiber, Hook, Effect, RefObject)
    ├── state.ts            # fiberState 全局状态
    ├── element.ts          # createElement → VNode
    ├── dom.ts              # createDom, updateDom (属性/事件/ref)
    ├── reconciler.ts       # render, workLoop, performUnitOfWork, reconcileChildren, commitRoot
    ├── useState.ts         # 状态 Hook
    ├── useEffect.ts        # 副作用 Hook
    ├── useRef.ts           # 引用 Hook
    └── jsx.d.ts            # JSX 类型声明
```

## 5. 核心概念速览

| 概念 | 说明 |
|------|------|
| **VNode** | 虚拟 DOM 节点，由 createElement 创建 |
| **Fiber** | 工作单元，带 parent/child/sibling 链表结构，支持可中断 |
| **alternate** | 双缓冲，连接当前树与上一次提交的树 |
| **workLoop** | 使用 requestIdleCallback 在空闲时执行，时间切片 (5ms) |
| **effectTag** | PLACEMENT / UPDATE / DELETION，标记 DOM 操作类型 |
| **fiberState** | 全局单例，存储调度与 Hooks 所需状态 |
