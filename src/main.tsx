import MiniReact from "./mini-react";

// 定义函数组件
function Welcome(props: { name: string }) {
  return <span>Hello, {props.name}!</span>;
}

function App() {
  return (
    <div>
      <Welcome name="Mini React" />
      <Welcome name="World" />
    </div>
  );
}

// 获取根容器
const container = document.getElementById("app")!;

// 渲染
MiniReact.render(<App />, container);
