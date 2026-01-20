import type { FC, Fiber, VNode } from "./types";
import { createDom, updateDom } from "./dom";
import { fiberState } from "./state";

export function render(vNode: VNode, container: HTMLElement | Text) {
  fiberState.wipRoot = {
    dom: container,
    props: {
      children: [vNode],
    },
    type: "ROOT",
    alternate: fiberState.currentRoot,
  } as Fiber;

  fiberState.deletions = [];
  fiberState.nextUnitOfWork = fiberState.wipRoot;
}

function commitRoot() {
  fiberState.deletions.forEach(commitWork);

  if (fiberState.wipRoot?.child) {
    commitWork(fiberState.wipRoot.child);
  }
  fiberState.currentRoot = fiberState.wipRoot;
  fiberState.wipRoot = null;

  flushEffects();
}

function flushEffects() {
  fiberState.pendingEffects.forEach((effect) => {
    if (effect.cleanup) {
      effect.cleanup();
    }
  });

  fiberState.pendingEffects.forEach((effect) => {
    const cleanup = effect.callback();
    if (typeof cleanup === "function") {
      effect.cleanup = cleanup;
    }
  });

  fiberState.pendingEffects = [];
}

function commitWork(fiber?: Fiber) {
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber?.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom && domParent) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate?.props || {}, fiber.props);
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

  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else if (fiber.child) {
    commitDeletion(fiber.child, domParent);
  }
}

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;

  while (fiberState.nextUnitOfWork && !shouldYield) {
    fiberState.nextUnitOfWork = performUnitOfWork(fiberState.nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 5;
  }

  if (!fiberState.nextUnitOfWork && fiberState.wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: Fiber | undefined = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null;
}

function updateFunctionComponent(fiber: Fiber) {
  fiberState.wipFiber = fiber;
  fiberState.hookIndex = 0;
  fiberState.wipFiber.hooks = [];

  const children = [(fiber.type as FC)(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
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
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: parentFiber,
        effectTag: "PLACEMENT",
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      fiberState.deletions.push(oldFiber);
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
