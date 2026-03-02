# MiniReact 详细流程图

## 1. 整体架构流程

```mermaid
flowchart TD
    Start([用户代码: JSX]) --> Compile[JSX 编译<br/>tsconfig: jsxFactory]
    Compile --> CreateElement[createElement<br/>创建 VNode]
    CreateElement --> Render[render 函数<br/>初始化 Fiber 树]
    Render --> WorkLoop[workLoop<br/>requestIdleCallback]
    WorkLoop --> Perform[performUnitOfWork<br/>处理 Fiber 节点]
    Perform --> Reconcile[reconcileChildren<br/>Diff 算法]
    Reconcile --> Commit[commitRoot<br/>提交到 DOM]
    Commit --> Effects[flushEffects<br/>执行副作用]
    Effects --> End([真实 DOM 更新])

    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style WorkLoop fill:#fff9c4
    style Commit fill:#ffccbc
```

## 2. JSX 编译与 VNode 创建

```mermaid
flowchart LR
    JSX["JSX 代码<br/>&lt;div&gt;Hello&lt;/div&gt;"] --> Compiler[TypeScript 编译器]
    Compiler --> Call["createElement('div', null, 'Hello')"]
    Call --> Process[处理 children]
    Process --> Text{是否为<br/>文本/数字?}
    Text -->|是| CreateText[createTextElement<br/>创建文本 VNode]
    Text -->|否| KeepVNode[保持 VNode]
    CreateText --> VNode
    KeepVNode --> VNode["VNode 对象<br/>{type, props: {children}}"]

    style JSX fill:#e1f5ff
    style VNode fill:#c8e6c9
```

## 3. Fiber 工作循环 (核心调度)

```mermaid
flowchart TD
    Start([requestIdleCallback<br/>启动]) --> WorkLoop[workLoop 函数]
    WorkLoop --> CheckWork{有待处理<br/>的工作?}
    CheckWork -->|否| CheckCommit{wipRoot<br/>存在?}
    CheckCommit -->|是| CommitRoot[commitRoot<br/>提交变更]
    CheckCommit -->|否| Schedule[requestIdleCallback<br/>下一帧]
    CheckWork -->|是| CheckTime{剩余时间<br/>&gt; 5ms?}
    CheckTime -->|是| PerformWork[performUnitOfWork<br/>处理一个 Fiber]
    CheckTime -->|否| Schedule
    PerformWork --> UpdateWork[更新 nextUnitOfWork]
    UpdateWork --> WorkLoop
    CommitRoot --> Schedule
    Schedule --> WorkLoop

    style Start fill:#e1f5ff
    style PerformWork fill:#fff9c4
    style CommitRoot fill:#ffccbc
```

## 4. performUnitOfWork 详细流程

```mermaid
flowchart TD
    Start([接收 Fiber 节点]) --> CheckType{Fiber.type<br/>是函数?}
    CheckType -->|是| FuncComp[updateFunctionComponent]
    CheckType -->|否| HostComp[updateHostComponent]

    FuncComp --> SetupHooks[设置 wipFiber<br/>初始化 hooks 数组]
    SetupHooks --> CallFunc[调用函数组件<br/>获取 children]
    CallFunc --> ReconcileFunc[reconcileChildren]

    HostComp --> CreateDOM{DOM<br/>存在?}
    CreateDOM -->|否| CreateNew[createDom<br/>创建真实 DOM]
    CreateDOM -->|是| Skip[跳过]
    CreateNew --> ReconcileHost[reconcileChildren]
    Skip --> ReconcileHost

    ReconcileFunc --> FindNext[查找下一个工作单元]
    ReconcileHost --> FindNext

    FindNext --> HasChild{有 child?}
    HasChild -->|是| ReturnChild[返回 child]
    HasChild -->|否| HasSibling{有 sibling?}
    HasSibling -->|是| ReturnSibling[返回 sibling]
    HasSibling -->|否| FindParent[向上查找<br/>parent.sibling]
    FindParent --> ReturnParent[返回结果]

    ReturnChild --> End([下一个 Fiber])
    ReturnSibling --> End
    ReturnParent --> End

    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style FuncComp fill:#fff9c4
    style HostComp fill:#ffe0b2
```

## 5. reconcileChildren (Diff 算法)

```mermaid
flowchart TD
    Start([接收 parentFiber<br/>和新 elements]) --> Init[初始化变量<br/>oldFiber, prevSibling]
    Init --> Loop{遍历 elements<br/>或 oldFiber}
    Loop -->|结束| End([完成协调])

    Loop -->|继续| Compare{element.type<br/>== oldFiber.type?}
    Compare -->|是| Update[创建 UPDATE Fiber<br/>复用 DOM]
    Compare -->|否| CheckNew{element<br/>存在?}

    CheckNew -->|是| Placement[创建 PLACEMENT Fiber<br/>新增节点]
    CheckNew -->|否| CheckOld{oldFiber<br/>存在?}

    CheckOld -->|是| Deletion[标记 DELETION<br/>加入 deletions 数组]
    CheckOld -->|否| NextIter[下一次迭代]

    Update --> LinkFiber[链接 Fiber 树<br/>child/sibling]
    Placement --> LinkFiber
    Deletion --> NextOld[oldFiber = oldFiber.sibling]
    NextOld --> NextIter

    LinkFiber --> NextOld
    NextIter --> Loop

    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style Update fill:#fff9c4
    style Placement fill:#c8e6c9
    style Deletion fill:#ffcdd2
```

## 6. commitRoot 提交阶段

```mermaid
flowchart TD
    Start([commitRoot 开始]) --> DelPhase[处理 deletions 数组]
    DelPhase --> DelLoop{遍历<br/>deletions}
    DelLoop -->|每个 Fiber| CommitDel[commitDeletion<br/>清理 hooks + 移除 DOM]
    CommitDel --> DelLoop
    DelLoop -->|完成| CommitPhase[commitWork<br/>从 wipRoot.child 开始]

    CommitPhase --> CheckTag{effectTag<br/>类型?}
    CheckTag -->|PLACEMENT| Append[appendChild<br/>插入 DOM]
    CheckTag -->|UPDATE| UpdateDOM[updateDom<br/>更新属性/事件]
    CheckTag -->|DELETION| Remove[commitDeletion<br/>移除节点]

    Append --> Recursive[递归处理<br/>child 和 sibling]
    UpdateDOM --> Recursive
    Remove --> Recursive

    Recursive --> UpdateRoot[currentRoot = wipRoot<br/>wipRoot = null]
    UpdateRoot --> FlushEffects[flushEffects<br/>执行副作用]
    FlushEffects --> End([提交完成])

    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style FlushEffects fill:#fff9c4
```

## 7. useState Hook 流程

```mermaid
flowchart TD
    Start([useState 调用]) --> GetOld[从 alternate.hooks<br/>获取 oldHook]
    GetOld --> CreateHook[创建新 hook<br/>state + queue]
    CreateHook --> HasOld{oldHook<br/>存在?}
    HasOld -->|是| ReuseState[复用 state 和 queue]
    HasOld -->|否| UseInitial[使用 initial 值]

    ReuseState --> ProcessQueue[处理 queue 中的 actions]
    UseInitial --> ProcessQueue

    ProcessQueue --> LoopStart[开始遍历 actions]
    LoopStart --> HasMore{还有<br/>action?}
    HasMore -->|是| CheckFunc{action<br/>是函数?}
    CheckFunc -->|是| CallFunc[action 调用 state]
    CheckFunc -->|否| UseValue[直接使用 action]
    CallFunc --> UpdateState[更新 state]
    UseValue --> UpdateState
    UpdateState --> LoopStart

    HasMore -->|否| ClearQueue[清空 queue]
    ClearQueue --> CreateSetter[创建 setState 函数]

    CreateSetter --> SaveHook[保存 hook 到<br/>wipFiber.hooks]
    SaveHook --> IncIndex[hookIndex++]
    IncIndex --> Return([返回 state, setState])

    style Start fill:#e1f5ff
    style Return fill:#c8e6c9
    style CreateSetter fill:#fff9c4
```

### setState 调用流程

```mermaid
flowchart TD
    Start([setState 被调用]) --> PushQueue[action 推入 queue]
    PushQueue --> CreateWip[创建新的 wipRoot]
    CreateWip --> SetNext[设置 nextUnitOfWork]
    SetNext --> ClearDel[清空 deletions]
    ClearDel --> Trigger[触发 workLoop<br/>重新渲染]
    Trigger --> End([等待下一帧])

    style Start fill:#e1f5ff
    style Trigger fill:#fff9c4
    style End fill:#c8e6c9
```

## 8. useEffect Hook 流程

```mermaid
flowchart TD
    Start([useEffect 调用]) --> GetOld[从 alternate.hooks<br/>获取 oldHook]
    GetOld --> CheckChange{deps<br/>变化?}

    CheckChange -->|检查条件| Cond1{oldHook<br/>不存在?}
    Cond1 -->|是| Changed[hasChanged = true]
    Cond1 -->|否| Cond2{deps<br/>未提供?}
    Cond2 -->|是| Changed
    Cond2 -->|否| Cond3{oldHook.deps<br/>不存在?}
    Cond3 -->|是| Changed
    Cond3 -->|否| Compare[逐个比较 deps]

    Compare --> AnyDiff{有任何<br/>不同?}
    AnyDiff -->|是| Changed
    AnyDiff -->|否| NotChanged[hasChanged = false]

    Changed --> CreateHook[创建 Effect hook<br/>callback + deps]
    NotChanged --> CreateHook

    CreateHook --> ShouldRun{hasChanged?}
    ShouldRun -->|是| AddPending[加入 pendingEffects]
    ShouldRun -->|否| Skip[跳过]

    AddPending --> SaveHook[保存到 wipFiber.hooks]
    Skip --> SaveHook
    SaveHook --> IncIndex[hookIndex++]
    IncIndex --> End([完成])

    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style AddPending fill:#fff9c4
```

### flushEffects 执行流程

```mermaid
flowchart TD
    Start([flushEffects 调用]) --> CleanupPhase[第一阶段: 清理]
    CleanupPhase --> LoopStart1[开始遍历 pendingEffects]
    LoopStart1 --> HasMore1{还有<br/>effect?}
    HasMore1 -->|是| HasCleanup{cleanup<br/>存在?}
    HasCleanup -->|是| RunCleanup[执行 cleanup()]
    HasCleanup -->|否| Skip1[跳过]
    RunCleanup --> LoopStart1
    Skip1 --> LoopStart1

    HasMore1 -->|否| EffectPhase[第二阶段: 执行]
    EffectPhase --> LoopStart2[开始遍历 pendingEffects]
    LoopStart2 --> HasMore2{还有<br/>effect?}
    HasMore2 -->|是| RunCallback[执行 callback()]
    RunCallback --> CheckReturn{返回值<br/>是函数?}
    CheckReturn -->|是| SaveCleanup[保存为 cleanup]
    CheckReturn -->|否| Skip2[跳过]
    SaveCleanup --> LoopStart2
    Skip2 --> LoopStart2

    HasMore2 -->|否| Clear[清空 pendingEffects]
    Clear --> End([完成])

    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style CleanupPhase fill:#ffcdd2
    style EffectPhase fill:#c8e6c9
```

## 9. DOM 操作流程

### createDom

```mermaid
flowchart TD
    Start([createDom 调用]) --> CheckType{fiber.type<br/>类型?}
    CheckType -->|TEXT_ELEMENT| CreateText[createTextNode]
    CheckType -->|其他| CreateElem[createElement]

    CreateText --> UpdateProps[updateDom<br/>设置属性]
    CreateElem --> UpdateProps
    UpdateProps --> Return([返回 DOM 节点])

    style Start fill:#e1f5ff
    style Return fill:#c8e6c9
```

### updateDom

```mermaid
flowchart TD
    Start([updateDom 调用]) --> RemoveEvents[移除旧事件监听器]
    RemoveEvents --> RemoveProps[移除旧属性]
    RemoveProps --> AddProps[添加新属性]
    AddProps --> AddEvents[添加新事件监听器]
    AddEvents --> End([完成])

    style Start fill:#e1f5ff
    style End fill:#c8e6c9
```

## 10. 完整渲染流程时序图

```mermaid
sequenceDiagram
    participant User as 用户代码
    participant JSX as JSX 编译器
    participant CE as createElement
    participant R as render
    participant WL as workLoop
    participant PU as performUnitOfWork
    participant RC as reconcileChildren
    participant CR as commitRoot
    participant DOM as 真实 DOM

    User->>JSX: 编写 JSX 代码
    JSX->>CE: 编译为 createElement 调用
    CE->>CE: 创建 VNode 树
    CE->>R: 调用 render(vNode, container)

    R->>R: 创建 wipRoot
    R->>R: 设置 nextUnitOfWork
    R->>WL: 触发 workLoop

    loop 每一帧
        WL->>WL: requestIdleCallback
        WL->>PU: performUnitOfWork(fiber)
        PU->>PU: 处理函数组件/宿主组件
        PU->>RC: reconcileChildren
        RC->>RC: Diff 算法<br/>标记 effectTag
        RC-->>PU: 返回
        PU-->>WL: 返回下一个工作单元
    end

    WL->>CR: 所有工作完成，commitRoot
    CR->>CR: 处理 deletions
    CR->>DOM: 应用 DOM 变更
    CR->>CR: flushEffects
    CR-->>User: 渲染完成
```

## 11. 状态更新流程时序图

```mermaid
sequenceDiagram
    participant User as 用户交互
    participant Set as setState
    participant State as fiberState
    participant WL as workLoop
    participant Hooks as Hooks 处理
    participant DOM as 真实 DOM

    User->>Set: 调用 setState(newValue)
    Set->>State: action 推入 queue
    Set->>State: 创建新 wipRoot
    Set->>State: 设置 nextUnitOfWork

    State->>WL: 触发重新渲染
    WL->>WL: performUnitOfWork

    loop 处理函数组件
        WL->>Hooks: 调用 useState
        Hooks->>Hooks: 处理 queue 中的 actions
        Hooks->>Hooks: 更新 state
        Hooks-->>WL: 返回新 state
    end

    WL->>WL: reconcileChildren (Diff)
    WL->>DOM: commitRoot 提交变更
    DOM-->>User: UI 更新完成
```

## 12. 核心数据结构

### VNode (虚拟 DOM)

```typescript
interface VNode {
  type: string | FC;           // 元素类型或函数组件
  props: {
    children: VNode[];         // 子节点数组
    [key: string]: any;        // 其他属性
  };
}
```

### Fiber (工作单元)

```typescript
interface Fiber {
  type: string | FC;           // 类型
  props: { ... };              // 属性
  dom?: HTMLElement | Text;    // 真实 DOM 引用
  parent?: Fiber;              // 父节点
  child?: Fiber;               // 第一个子节点
  sibling?: Fiber;             // 兄弟节点
  alternate?: Fiber;           // 上一次的 Fiber
  effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";  // 操作标记
  hooks?: (Hook | Effect)[];   // Hooks 数组
}
```

### fiberState (全局状态)

```typescript
const fiberState = {
  nextUnitOfWork: Fiber | null;    // 下一个工作单元
  wipRoot: Fiber | null;            // 工作中的根节点
  currentRoot: Fiber | null;        // 当前渲染的根节点
  deletions: Fiber[];               // 待删除的节点
  wipFiber: Fiber | null;           // 当前工作的 Fiber
  hookIndex: number;                // 当前 Hook 索引
  pendingEffects: Effect[];         // 待执行的副作用
};
```

## 13. 关键设计要点

### 1. Fiber 架构
- **可中断渲染**: 使用 `requestIdleCallback` 在浏览器空闲时执行
- **时间切片**: 每帧检查剩余时间 (`timeRemaining() < 5ms`)
- **双缓冲**: `wipRoot` (工作中) 和 `currentRoot` (已提交)

### 2. Diff 算法
- **同层比较**: 只比较同一层级的节点
- **类型判断**: `element.type === oldFiber.type` 决定复用或重建
- **effectTag 标记**: PLACEMENT (新增) / UPDATE (更新) / DELETION (删除)

### 3. Hooks 实现
- **顺序依赖**: 通过 `hookIndex` 保证 Hooks 调用顺序
- **状态持久化**: 通过 `alternate` 链接保存上一次的状态
- **批量更新**: `useState` 的 queue 机制

### 4. 提交阶段
- **两阶段提交**:
  1. Render 阶段 (可中断): 构建 Fiber 树，标记变更
  2. Commit 阶段 (不可中断): 一次性应用所有 DOM 变更
- **副作用管理**: 先执行清理，再执行新副作用

---

## 总结

MiniReact 实现了 React 的核心机制：

1. ✅ **JSX 编译** → VNode 创建
2. ✅ **Fiber 架构** → 可中断渲染
3. ✅ **Diff 算法** → 高效更新
4. ✅ **Hooks** → useState, useEffect
5. ✅ **调度器** → requestIdleCallback
6. ✅ **提交阶段** → DOM 批量更新

这个实现涵盖了 React 面试中最常考察的核心概念！
```

