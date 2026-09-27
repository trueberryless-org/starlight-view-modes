import type {
  NavigateParams,
  NavigationFunction,
  RevealPlugin,
} from "reveal.js";

// Going back skips animations, e.g. fragments of the current slide, and displays the previous slide with all its
// content. All navigations of reveal.js, e.g. using the keyboard, the controls, or touch gestures, go through the
// instance given to plugins, so wrapping its backward navigation methods covers all of them.
export function getBackwardNavigationPlugin(): RevealPlugin {
  return {
    id: "starlight-view-modes-backward-navigation",
    init: (deck) => {
      const skipFragments =
        (navigate: NavigationFunction): NavigationFunction =>
        (params?: NavigateParams) =>
          navigate({ ...params, skipFragments: true });
      const isRtl = deck.getConfig().rtl === true;
      const back = skipFragments(isRtl ? deck.right : deck.left);
      const prev = skipFragments(deck.prev);
      const up = skipFragments(deck.up);

      Object.assign(deck, {
        [isRtl ? "right" : "left"]: back,
        [isRtl ? "navigateRight" : "navigateLeft"]: back,
        navigatePrev: prev,
        navigateUp: up,
        prev,
        up,
      });
    },
  };
}
