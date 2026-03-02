import type { FC, Fiber, VNode } from "./types";
import { createDom, updateDom } from "./dom";
import { renderContext } from "./state";

export function render(vNode: VNode, container: HTMLElement | Text) {
  renderContext.wipRoot = {
    dom: container,
    props: {
      children: [vNode],
    },
    type: "ROOT",
    parent: null,
    child: null,
    sibling: null,
    alternate: renderContext.currentRoot,
    effectTag: null,
    hooks: null,
  } as Fiber;

  renderContext.deletions = [];
  renderContext.nextUnitOfWork = renderContext.wipRoot;

  requestIdleCallback(workLoop);
}

function commitRoot() {
  const wipRoot = renderContext.wipRoot;
  if (!wipRoot) return;

  renderContext.deletions.forEach(commitWork);

  if (wipRoot.child !== null) {
    commitWork(wipRoot.child);
  }
  renderContext.currentRoot = wipRoot;
  renderContext.wipRoot = null;

  flushEffects();
}

function flushEffects() {
  renderContext.pendingEffects.forEach((effect) => {
    if (effect.cleanup) {
      effect.cleanup();
    }
  });

  renderContext.pendingEffects.forEach((effect) => {
    const cleanup = effect.callback();
    if (typeof cleanup === "function") {
      effect.cleanup = cleanup;
    }
  });

  renderContext.pendingEffects = [];
}

function commitWork(fiber?: Fiber | null) {
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (domParentFiber !== null && domParentFiber.dom === null) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber?.dom ?? null;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null && domParent) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate?.props ?? {}, fiber.props);
  } else if (fiber.effectTag === "DELETION" && domParent) {
    commitDeletion(fiber, domParent);
    return;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, domParent: HTMLElement | Text) {
  fiber.hooks?.forEach((hook) => {
    if ("cleanup" in hook && typeof hook.cleanup === "function") {
      hook.cleanup();
    }
  });

  // 清除被删除元素的 ref
  if (fiber.props?.ref && typeof fiber.props.ref === "object") {
    fiber.props.ref.current = null;
  }

  if (fiber.dom !== null) {
    domParent.removeChild(fiber.dom);
  } else if (fiber.child !== null) {
    commitDeletion(fiber.child, domParent);
  }
}

function workLoop(deadline: IdleDeadline) {
  let shouldYield = deadline.timeRemaining() < 5;

  while (renderContext.nextUnitOfWork && !shouldYield) {
    renderContext.nextUnitOfWork = performUnitOfWork(renderContext.nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 5;
  }

  if (!renderContext.nextUnitOfWork && renderContext.wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child !== null) {
    return fiber.child;
  }

  let nextFiber: Fiber | null = fiber;
  while (nextFiber) {
    if (nextFiber.sibling !== null) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null;
}

function updateFunctionComponent(fiber: Fiber) {
  renderContext.wipFiber = fiber;
  renderContext.hookIndex = 0;
  renderContext.wipFiber.hooks = [];

  const children = [(fiber.type as FC)(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  if (fiber.dom === null) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children as VNode[]);
}

function reconcileChildren(parentFiber: Fiber, elements: VNode[]) {
  let index = 0;
  let oldFiber = parentFiber.alternate?.child;
  let prevSibling: Fiber | null = null;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber: Fiber | null = null;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType && oldFiber) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: parentFiber,
        child: null,
        sibling: null,
        alternate: oldFiber,
        effectTag: "UPDATE",
        hooks: null,
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: parentFiber,
        child: null,
        sibling: null,
        alternate: null,
        effectTag: "PLACEMENT",
        hooks: null,
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      renderContext.deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      parentFiber.child = newFiber!;
    } else if (prevSibling && newFiber) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
