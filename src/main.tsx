import MiniReact, { useState, useEffect, useRef } from "./mini-react/mini-react";

// ========== 样式常量 ==========
const styles = {
  app: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    color: "white",
    marginBottom: "30px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    marginBottom: "10px",
    transition: "all 0.3s ease",
    fontWeight: "bold",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  dangerBtn: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "white",
  },
  successBtn: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "white",
  },
  input: {
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    marginRight: "10px",
    marginBottom: "10px",
    outline: "none",
    width: "200px",
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    background: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "8px",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold",
    marginLeft: "10px",
  },
};

// ========== 工具函数 ==========
const toStyleStr = (obj: Record<string, any>) =>
  Object.entries(obj)
    .map(
      ([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${v}`
    )
    .join(";");

// ========== 计数器组件 ==========
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div style={toStyleStr(styles.card)}>
      <h2 style="margin-top:0;color:#333;">🔢 计数器</h2>
      <p style="font-size:48px;font-weight:bold;color:#667eea;margin:20px 0;">
        {count}
      </p>
      <div>
        <button
          style={toStyleStr({ ...styles.button, ...styles.dangerBtn })}
          onClick={() => setCount((c) => c - step)}
        >
          ➖ 减 {step}
        </button>
        <button
          style={toStyleStr({ ...styles.button, ...styles.primaryBtn })}
          onClick={() => setCount((c) => c + step)}
        >
          ➕ 加 {step}
        </button>
        <button
          style={toStyleStr({
            ...styles.button,
            background: "#6c757d",
            color: "white",
          })}
          onClick={() => setCount(0)}
        >
          🔄 重置
        </button>
      </div>
      <div style="margin-top:16px;">
        <span style="color:#666;">步长：</span>
        <button
          style={toStyleStr({
            ...styles.button,
            ...styles.successBtn,
            padding: "8px 16px",
          })}
          onClick={() => setStep(1)}
        >
          1
        </button>
        <button
          style={toStyleStr({
            ...styles.button,
            ...styles.successBtn,
            padding: "8px 16px",
          })}
          onClick={() => setStep(5)}
        >
          5
        </button>
        <button
          style={toStyleStr({
            ...styles.button,
            ...styles.successBtn,
            padding: "8px 16px",
          })}
          onClick={() => setStep(10)}
        >
          10
        </button>
      </div>
    </div>
  );
}

// ========== Todo 列表组件 ==========
function TodoList() {
  const [todos, setTodos] = useState<
    { id: number; text: string; done: boolean }[]
  >([
    { id: 1, text: "学习 Mini React 原理 📚", done: true },
    { id: 2, text: "实现 Fiber 架构 🏗️", done: true },
    { id: 3, text: "实现 Hooks 🪝", done: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(4);

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos((prev) => [
        ...prev,
        { id: nextId, text: inputValue, done: false },
      ]);
      setNextId((n) => n + 1);
      setInputValue("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div style={toStyleStr(styles.card)}>
      <h2 style="margin-top:0;color:#333;">
        ✅ Todo 列表
        <span
          style={toStyleStr({
            ...styles.badge,
            background: "#667eea",
            color: "white",
          })}
        >
          {doneCount}/{todos.length}
        </span>
      </h2>

      <div style="margin-bottom:20px;">
        <input
          style={toStyleStr(styles.input)}
          placeholder="输入新任务..."
          value={inputValue}
          onInput={(e: any) => setInputValue(e.target.value)}
          onKeyDown={(e: any) => e.key === "Enter" && addTodo()}
        />
        <button
          style={toStyleStr({ ...styles.button, ...styles.primaryBtn })}
          onClick={addTodo}
        >
          添加任务
        </button>
      </div>

      <div>
        {todos.map((todo) => (
          <div
            style={toStyleStr({
              ...styles.todoItem,
              background: todo.done ? "#e8f5e9" : "#f8f9fa",
            })}
          >
            <span
              style={`flex:1;font-size:16px;${
                todo.done
                  ? "text-decoration:line-through;color:#9e9e9e;"
                  : "color:#333;"
              }`}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.done ? "✓ " : "○ "}
              {todo.text}
            </span>
            <button
              style={toStyleStr({
                ...styles.button,
                ...styles.dangerBtn,
                padding: "6px 12px",
                fontSize: "14px",
                marginRight: "0",
                marginBottom: "0",
              })}
              onClick={() => deleteTodo(todo.id)}
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== 颜色切换器组件 ==========
function ColorPicker() {
  const colors = [
    "#667eea",
    "#f5576c",
    "#4facfe",
    "#43e97b",
    "#fa709a",
    "#fee140",
  ];
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [clickCount, setClickCount] = useState(0);

  return (
    <div style={toStyleStr(styles.card)}>
      <h2 style="margin-top:0;color:#333;">🎨 颜色选择器</h2>
      <div
        style={`width:100%;height:80px;border-radius:12px;margin-bottom:16px;background:${selectedColor};display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:bold;text-shadow:1px 1px 2px rgba(0,0,0,0.3);`}
      >
        点击次数: {clickCount}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        {colors.map((color) => (
          <button
            style={`width:50px;height:50px;border-radius:50%;border:${
              selectedColor === color
                ? "4px solid #333"
                : "4px solid transparent"
            };background:${color};cursor:pointer;transition:transform 0.2s;`}
            onClick={() => {
              setSelectedColor(color);
              setClickCount((c) => c + 1);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ========== useRef 演示：输入框聚焦 + 渲染计数 ==========
function RefDemo() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const renderCountRef = useRef(0);
  const [, forceUpdate] = useState(0);

  renderCountRef.current += 1; // 修改 ref 不触发重渲染

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div style={toStyleStr(styles.card)}>
      <h2 style="margin-top:0;color:#333;">🔗 useRef 演示</h2>
      <p style="color:#666;margin-bottom:16px;">
        1. 点击按钮聚焦输入框（DOM 引用）<br />
        2. 渲染次数由 ref 存储，修改不触发重渲染
      </p>
      <div style="margin-bottom:12px;">
        <input
          ref={inputRef}
          style={toStyleStr(styles.input)}
          placeholder="点击右侧按钮聚焦我"
        />
        <button
          style={toStyleStr({ ...styles.button, ...styles.primaryBtn })}
          onClick={focusInput}
        >
          聚焦输入框
        </button>
      </div>
      <div style="display:flex;gap:16px;align-items:center;">
        <span style="color:#666;">
          组件渲染次数: <strong>{renderCountRef.current}</strong>
        </span>
        <button
          style={toStyleStr({
            ...styles.button,
            ...styles.successBtn,
            padding: "8px 16px",
          })}
          onClick={() => forceUpdate((n) => n + 1)}
        >
          强制重渲染
        </button>
      </div>
    </div>
  );
}

// ========== 计时器组件（useEffect 测试）==========
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id); // cleanup
  }, []); // 空依赖，只执行一次

  return (
    <div style={toStyleStr(styles.card)}>
      <h2 style="margin-top:0;color:#333;">⏱️ 计时器</h2>
      <p style="font-size:48px;font-weight:bold;color:#667eea;margin:20px 0;">
        {seconds} 秒
      </p>
      <p style="color:#666;font-size:14px;">
        使用 useEffect 实现自动计时，组件卸载时自动清理定时器
      </p>
    </div>
  );
}

// ========== 性能测试组件 ==========
function PerformanceTest() {
  const [items, setItems] = useState<number[]>([]);
  const [renderTime, setRenderTime] = useState(0);

  const generateItems = (count: number) => {
    const start = performance.now();
    const newItems = Array.from({ length: count }, (_, i) => i + 1);
    setItems(newItems);
    // 使用 requestAnimationFrame 来测量渲染完成时间
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setRenderTime(Math.round(performance.now() - start));
      });
    });
  };

  return (
    <div style={toStyleStr(styles.card)}>
      <h2 style="margin-top:0;color:#333;">⚡ 性能测试</h2>
      <p style="color:#666;margin-bottom:16px;">
        测试 Fiber 架构的可中断渲染能力
      </p>
      <div style="margin-bottom:16px;">
        <button
          style={toStyleStr({ ...styles.button, ...styles.primaryBtn })}
          onClick={() => generateItems(100)}
        >
          渲染 100 项
        </button>
        <button
          style={toStyleStr({ ...styles.button, ...styles.successBtn })}
          onClick={() => generateItems(500)}
        >
          渲染 500 项
        </button>
        <button
          style={toStyleStr({ ...styles.button, ...styles.dangerBtn })}
          onClick={() => generateItems(1000)}
        >
          渲染 1000 项
        </button>
        <button
          style={toStyleStr({
            ...styles.button,
            background: "#6c757d",
            color: "white",
          })}
          onClick={() => {
            setItems([]);
            setRenderTime(0);
          }}
        >
          清空
        </button>
      </div>
      {renderTime > 0 && (
        <p style="color:#667eea;font-weight:bold;">
          ⏱️ 渲染耗时: {renderTime}ms | 项目数: {items.length}
        </p>
      )}
      <div style="max-height:200px;overflow-y:auto;background:#f8f9fa;border-radius:8px;padding:8px;">
        {items.map((item) => (
          <span style="display:inline-block;padding:4px 8px;margin:2px;background:#667eea;color:white;border-radius:4px;font-size:12px;">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ========== 主应用 ==========
function App() {
  return (
    <div style={toStyleStr(styles.app)}>
      <header style={toStyleStr(styles.header)}>
        <h1 style="font-size:36px;margin-bottom:8px;">⚛️ Mini React</h1>
        <p style="font-size:18px;opacity:0.9;">
          手写 React 核心实现 - Fiber 架构 + Hooks + Diff 算法
        </p>
      </header>

      <Counter />
      <TodoList />
      <ColorPicker />
      <RefDemo />
      <Timer />
      <PerformanceTest />

      <footer style="text-align:center;color:rgba(255,255,255,0.7);margin-top:30px;padding:20px;">
        <p>🚀 Powered by Mini React with Fiber Architecture</p>
        <p style="font-size:14px;">
          ✓ 可中断渲染 | ✓ useState | ✓ useEffect | ✓ useRef | ✓ Diff 算法 | ✓ 事件处理
        </p>
      </footer>
    </div>
  );
}

// 获取根容器
const container = document.getElementById("app")!;

// 渲染
MiniReact.render(<App />, container);
