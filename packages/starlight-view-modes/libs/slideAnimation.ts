import type { Comment, Element, ElementContent } from "hast";

import type { PresentationAnimation } from "./config";
import { getHeadingRank, isElement } from "./hast";
import { getBlockLines } from "./slideLayout";

// Content is revealed step by step using reveal.js fragments, see https://revealjs.com/fragments/
const FragmentClassName = "fragment";
const PauseMarkerValue = "starlight-view-modes-pause";

// Marks where a `presentation: pause` directive waits for the next step before revealing the following content.
export function createPauseMarker(): Comment {
  return { type: "comment", value: PauseMarkerValue };
}

export function isPauseMarker(node: ElementContent): boolean {
  return node.type === "comment" && node.value === PauseMarkerValue;
}

// Reveals the content of a slide step by step:
// - With an animation, list items are revealed one by one, and the content following them in the next step. Other
//   content is displayed right away.
// - Content following a pause is revealed in the next step, together with the content following it.
// A slide never starts empty unless it starts with a pause, so the first step is displayed right away if needed.
export function animateSlideContent(
  nodes: ElementContent[],
  { animation, startsPaused }: SlideAnimationOptions
): ElementContent[] {
  const steps = getSteps(nodes, animation !== false, startsPaused);
  const hasVisibleContent = nodes.some(
    (node) =>
      node.type === "element" &&
      getBlockLines(node) > 0 &&
      !steps.has(node) &&
      !(isList(node) && node.children.some((child) => steps.has(child)))
  );
  // Only automatic steps, e.g. list items, are displayed right away, not explicit pauses.
  const offset =
    !hasVisibleContent && !steps.isFirstStepPaused && steps.size > 0 ? 1 : 0;

  const animate = (node: Element): Element => {
    const step = steps.get(node);
    if (step === undefined || step < offset) return node;

    return getAnimatedElement(node, animation, step - offset);
  };

  return nodes.flatMap((node): ElementContent[] => {
    if (isPauseMarker(node)) return [];
    if (node.type !== "element") return [node];
    if (!isList(node)) return [animate(node)];

    return [
      {
        ...animate(node),
        children: node.children.map((child) =>
          child.type === "element" ? animate(child) : child
        ),
      },
    ];
  });
}

// Returns the step revealing each animated element, starting at 0.
function getSteps(
  nodes: ElementContent[],
  animatesLists: boolean,
  startsPaused: boolean
): Steps {
  const steps: Steps = Object.assign(new Map<ElementContent, number>(), {
    isFirstStepPaused: startsPaused,
  });
  let count = 0;
  let hasPaused = startsPaused;
  let isPending = startsPaused;
  // Whether the current step only reveals headings, which are revealed with the content following them.
  let hasOnlyHeadings = false;

  const addStep = () => {
    if (count === 0) steps.isFirstStepPaused = isPending;
    isPending = false;
    hasOnlyHeadings = true;
    count++;
  };

  for (const node of nodes) {
    if (isPauseMarker(node)) {
      hasPaused = true;
      isPending = true;
      continue;
    }
    if (node.type !== "element" || getBlockLines(node) === 0) continue;

    if (animatesLists && isList(node)) {
      for (const item of node.children) {
        if (!isElement(item, "li")) continue;

        if (isPending || !hasPaused || !hasOnlyHeadings) addStep();
        steps.set(item, count - 1);
        hasOnlyHeadings = false;
      }
      // Content following a list is revealed after its items, like after a pause.
      hasPaused = true;
      isPending = true;
      continue;
    }

    if (isPending) addStep();
    // Content is only revealed step by step after a pause.
    if (hasPaused) steps.set(node, count - 1);
    if (getHeadingRank(node) === undefined) hasOnlyHeadings = false;
  }

  return steps;
}

function getAnimatedElement(
  node: Element,
  animation: PresentationAnimation | false,
  step: number
): Element {
  const className = node.properties["className"];
  const classNames = Array.isArray(className) ? className : [];

  return {
    ...node,
    properties: {
      ...node.properties,
      // The animation is the name of a reveal.js fragment style, which defaults to fading in.
      className: [
        ...classNames,
        FragmentClassName,
        ...(animation ? [animation] : []),
      ],
      dataFragmentIndex: step,
    },
  };
}

function isList(node: Element): boolean {
  return node.tagName === "ul" || node.tagName === "ol";
}

interface SlideAnimationOptions {
  animation: PresentationAnimation | false;
  /**
   * Whether the slide starts with a pause, e.g. a pause preceding the heading of its section.
   */
  startsPaused: boolean;
}

type Steps = Map<ElementContent, number> & { isFirstStepPaused: boolean };
