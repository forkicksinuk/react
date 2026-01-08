# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个**手写 React 源码**的学习项目，用于面试准备。目标是从零实现 React 的核心功能，而不是使用 React 库。

## 常用命令

```bash
pnpm dev      # 启动开发服务器
pnpm build    # TypeScript 检查 + 生产构建
pnpm preview  # 预览构建结果
```

## 架构

### JSX 编译机制

项目通过 `tsconfig.json` 配置将 JSX 语法编译为自定义的 `MiniReact.createElement` 调用：

```json
{
  "jsx": "react",
  "jsxFactory": "MiniReact.createElement",
  "jsxFragmentFactory": "MiniReact.Fragment"
}
```

因此，使用 JSX 的文件必须导入 `MiniReact`。

### 核心模块

- **src/mini-react.tsx** - React 核心实现（VNode、createElement、render）
- **src/main.tsx** - 测试入口，用于验证实现效果

### 当前实现进度

已实现：
- `VNode` 类型定义
- `createElement` 创建虚拟 DOM
- `render` 将虚拟 DOM 渲染为真实 DOM

待实现（典型面试考点）：
- Fiber 架构与可中断渲染
- 调度器 (Scheduler)
- Hooks (useState, useEffect 等)
- Diff 算法与协调 (Reconciliation)
- Fragment 支持
