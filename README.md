# Mini React

一个用 TypeScript 手写的 Mini React 实现，目标是演示 React 核心理念与工作流程：Fiber 架构、可中断渲染、Diff 与 Hooks。界面层使用 Vite 启动，示例页面包含计数器、Todo、颜色选择器、计时器和性能测试等组件。

## 功能特性

- 自定义 VNode 与 Fiber 结构，支持可中断渲染的工作循环
- Diff 算法与 effectTag 驱动的 DOM 更新与删除
- `useState` 与 `useEffect`（包含 cleanup）实现
- 示例应用覆盖交互、列表、定时器与性能渲染

## 目录结构

- `src/mini-react.tsx` Mini React 核心实现
- `src/main.tsx` 示例应用与组件
- `index.html` 应用入口

## 快速开始

```bash
pnpm install
pnpm dev
```

构建与预览：

```bash
pnpm build
pnpm preview
```

如果你使用 npm：

```bash
npm install
npm run dev
```

## Mini React 使用方式（示例）

```tsx
import MiniReact, { useState, useEffect } from "./mini-react";

function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <h1>{count}</h1>;
}

MiniReact.render(<App />, document.getElementById("app")!);
```

## 注意事项

- 依赖 `requestIdleCallback` 实现任务调度，老旧浏览器需要 polyfill
- 这是教学与实验性质项目，不建议直接用于生产环境
