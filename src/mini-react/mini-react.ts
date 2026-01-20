import { createElement } from "./element";
import { useEffect } from "./useEffect";
import { useState } from "./useState";
import { render } from "./reconciler";

export { createElement, render, useEffect, useState };
export type { FC, Fiber, VNode } from "./types";

const MiniReact = {
  createElement,
  render,
  useState,
  useEffect,
};

export default MiniReact;
