import type { FC, VNode } from "./types";

function createTextElement(text: string): VNode {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

export function createElement(
  type: string | FC,
  props: Record<string, any> | null,
  ...children: (VNode | string | number | (VNode | string | number)[])[]
): VNode {
  const flatChildren = children.flat(Infinity) as (VNode | string | number)[];

  return {
    type,
    props: {
      ...props,
      children: flatChildren.map((child) => {
        const isObject = typeof child === "object" && child !== null;
        return isObject ? (child as VNode) : createTextElement(String(child));
      }),
    },
  };
}
