import { createElement } from "./element";
import { useEffect } from "./useEffect";
import { useState } from "./useState";
import { useRef } from "./useRef";
import { render } from "./reconciler";

export { createElement, render, useEffect, useState, useRef };
export type { FC, Fiber, VNode, RefObject } from "./types";

const MiniReact = {
  createElement,
  render,
  useState,
  useEffect,
  useRef,
};

export default MiniReact;
