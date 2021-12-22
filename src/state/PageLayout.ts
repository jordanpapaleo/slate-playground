import React from "react";
import * as Slate from "slate";
import * as SlateReact from "slate-react";
import * as Unstated from "unstated-next";
import { isEqual } from "lodash";

import HierarchicalAnalyses from "./util/HierarchicalAnalyses";
import PubSub from "./util/PubSub";

// Page Layout calculations keep this kind of object as a central state object,
// which is global to everything in the entire Slate editor (or, more properly,
// everything that is nested in the same `PageLayout.Provider`).
//
// This is the private inner workings of how we track page layout across time,
// gathering element height update information in, and emitting notifications
// that update state of individual elements whose page status needs adjustment.
interface CentralState {
  elementStatePubSub: PubSub<ElementState>;
  elementAnalyses: HierarchicalAnalyses<ElementAnalysis>;
}
function initialCentralState(): CentralState {
  return {
    elementStatePubSub: new PubSub(),
    elementAnalyses: new HierarchicalAnalyses<ElementAnalysis>(),
  };
}

class ElementAnalysis {
  height: number;

  constructor() {
    this.height = 0;
  }
}

// Individual elements keep this kind of state object, which contains only the
// information that they need to change how they render based on page status.
//
// This is the "public" API returned by the `usePageLayoutCalculation` hook,
// and available for use inside each renderable React element.
interface ElementState {
  foo: string;
}
function initialElementState() {
  const elementState: ElementState = {
    foo: "bar",
  };
  return elementState;
}

export const PageLayout = Unstated.createContainer((initialState) => {
  const centralState = React.useMemo(() => initialCentralState(), []);
  return centralState;
});
export default PageLayout;

export const usePageLayoutCalculation = (element: Slate.Element) => {
  const staticEditor = SlateReact.useSlateStatic() as SlateReact.ReactEditor;

  // Hold Slate layout information in state, once available.
  const [path, setPath] = React.useState<Slate.Path | undefined>();
  const [height, setHeight] = React.useState<number | undefined>();
  const [key, setKey] = React.useState<string | undefined>();

  // We can only grab Slate's layout information in a useEffect callback,
  // which runs after the useLayoutEffect in the outer-level Slate code
  // that is responsible for updating the WeakMaps that this API uses.
  //
  // We guard for recursion before calling each set state function.
  // Hence, we disable the eslint warning here that warns of recursion.
  //
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const domElement = SlateReact.ReactEditor.toDOMNode(staticEditor, element);
    const newHeight = domElement.clientHeight;
    const newPath = SlateReact.ReactEditor.findPath(staticEditor, element);
    const newKey = SlateReact.ReactEditor.findKey(staticEditor, element).id;

    if (!isEqual(path, newPath)) setPath(newPath);
    if (height !== newHeight) setHeight(newHeight);
    if (key !== newKey) setKey(newKey);
  });

  // Obtain the centralState (which "never" changes its memo-identity),
  // and set up a local state object for the element state, which will be
  // changed via inner workings of the centralState every time we want this
  // Slate element to re-render based on changes to its page status.
  const centralState = PageLayout.useContainer();
  const [elementState, setElementState] = React.useState(initialElementState());

  // Subscribe to element state, once the Slate key is known.
  React.useEffect(() => {
    if (!key) return;
    subscribeElementState(centralState, key, setElementState);

    return () => unsubscribeElementState(centralState, key, setElementState);
  }, [centralState, key]);

  // Publish information about height whenever it changes.
  React.useEffect(() => {
    if (path && height) updateHeight(centralState, path, height);
  }, [centralState, path, height]);

  // Return the local element state, which the React element can use to change
  // how the element is rendered based on its current page status.
  return elementState;
};

function updateHeight(
  centralState: CentralState,
  path: Slate.Path,
  height: number
) {
  const analysis = centralState.elementAnalyses.getOrCreate(
    ElementAnalysis,
    path
  );
  analysis.height = height;
  console.log(JSON.stringify(centralState.elementAnalyses, undefined, "  "));
}

function subscribeElementState(
  centralState: CentralState,
  key: string,
  callback: (newState: ElementState) => unknown
) {
  centralState.elementStatePubSub.subscribe(key, callback);

  console.log(
    JSON.stringify(
      Array.from(centralState.elementStatePubSub.subscriptions.keys())
    )
  );
}

function unsubscribeElementState(
  centralState: CentralState,
  key: string,
  callback: (newState: ElementState) => unknown
) {
  centralState.elementStatePubSub.unsubscribe(key, callback);

  console.log(
    JSON.stringify(
      Array.from(centralState.elementStatePubSub.subscriptions.keys())
    )
  );
}
