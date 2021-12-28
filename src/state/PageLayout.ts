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
  elementStatePubSubs: HierarchicalAnalyses<PubSub<ElementState>>;
  elementAnalyses: HierarchicalAnalyses<ElementAnalysis>;
  sectionData: HierarchicalAnalyses<SectionData>;
  dirtySections: Set<number>;
  refreshTimestampPubSub: PubSub<Date>;
}
function initialCentralState(): CentralState {
  return {
    elementStatePubSubs: new HierarchicalAnalyses<PubSub<ElementState>>(),
    elementAnalyses: new HierarchicalAnalyses<ElementAnalysis>(),
    sectionData: new HierarchicalAnalyses<SectionData>(),
    dirtySections: new Set<number>(),
    refreshTimestampPubSub: new PubSub<Date>(),
  };
}

interface ElementAnalysis {
  height: number;
  leafText?: string;
  leafElementRef?: WeakRef<Element>;
}

interface SectionData {
  style: {
    widthInches: number;
    heightInches: number;
    paddingInches: number;
  };
}

interface PageLayoutCursor {
  page: number;
  budget: number;
  budgetPerPage: number;
  path: Slate.Path;
}

export interface PageSplitInfo {
  offset: number;
  endsPage: number;
  extraSpace: number;
}

interface PageSplitRange extends Slate.Range {
  pageSplitInfo: PageSplitInfo;
}

// Individual elements keep this kind of state object, which contains only the
// information that they need to change how they render based on page status.
//
// This is the "public" API returned by the `usePageLayoutCalculation` hook,
// and available for use inside each renderable React element.
interface ElementState {
  splitInfos: PageSplitInfo[];
  pageSplitRanges: PageSplitRange[];
}
function initialElementState(): ElementState {
  return { splitInfos: [], pageSplitRanges: [] };
}

export const PageLayout = Unstated.createContainer((initialState) => {
  const centralState = React.useMemo(() => initialCentralState(), []);
  return centralState;
});
export default PageLayout;

export function usePageLayoutTopLevelRefresh() {
  const [refreshTimestamp, setRefreshTimestamp] = React.useState<Date>(
    new Date()
  );

  const centralState = PageLayout.useContainer();

  // Subscribe to the PubSub for refresh time, so we can be updated when needed.
  React.useEffect(() => {
    centralState.refreshTimestampPubSub.subscribe(setRefreshTimestamp);

    return () =>
      centralState.refreshTimestampPubSub.unsubscribe(setRefreshTimestamp);
  }, [centralState]);

  // When the refresh timestamp changes, refresh layout of dirty sections.
  React.useEffect(() => {
    refreshDirtySections(centralState);
  }, [centralState, refreshTimestamp]);
}

// export function usePageLayoutDecorateFn(): (
//   entry: Slate.NodeEntry<Slate.Node>
// ) => Slate.BaseRange[] {
//   const centralState = PageLayout.useContainer();

//   // Subscribe to the PubSub for refresh time, so we can be updated when needed.
//   const [refreshTimestamp, setRefreshTimestamp] = React.useState<Date>(
//     new Date()
//   );
//   React.useEffect(() => {
//     centralState.refreshTimestampPubSub.subscribe(setRefreshTimestamp);
//     return () =>
//       centralState.refreshTimestampPubSub.unsubscribe(setRefreshTimestamp);
//   }, [centralState]);

//   return React.useCallback(
//     ([node, path]) => {
//       if (path.length === 0) refreshDirtySections(centralState);

//       if ((node as any).type !== "text") return [];

//       const ranges = centralState.elementStatePubSubs.getOrCreate(PubSub, path)
//         .mostRecentValue?.pageSplitRanges;

//       return ranges || [];
//     },
//     [centralState, refreshTimestamp]
//   );
// }

export function usePageLayoutMeasurement(element: Slate.Element) {
  const staticEditor = SlateReact.useSlateStatic() as SlateReact.ReactEditor;

  // Hold Slate layout information in state, once available.
  const [path, setPath] = React.useState<Slate.Path | undefined>();
  const [domElement, setDomElement] = React.useState<Element | undefined>();
  const [leafElement, setLeafElement] = React.useState<Element | undefined>();
  const [leafText, setLeafText] = React.useState<string | undefined>();
  const [height, setHeight] = React.useState<number | undefined>();

  // We can only grab Slate's layout information in a useEffect callback,
  // which runs after the useLayoutEffect in the outer-level Slate code
  // that is responsible for updating the WeakMaps that this API uses.
  //
  // We guard for recursion before calling each set state function.
  // Hence, we disable the eslint warning here that warns of recursion.
  //
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const newPath = SlateReact.ReactEditor.findPath(staticEditor, element);
    const newDomElement = SlateReact.ReactEditor.toDOMNode(
      staticEditor,
      element
    );
    const newLeafElement =
      newDomElement.querySelector('span[data-slate-string="true"]') ||
      undefined;
    const newLeafText = newLeafElement?.textContent || undefined;
    const newHeight = newDomElement.clientHeight;

    if (!isEqual(path, newPath)) setPath(newPath);
    if (domElement !== newDomElement) setDomElement(newDomElement);
    if (leafElement !== newLeafElement) setLeafElement(newLeafElement);
    if (leafText !== newLeafText) setLeafText(newLeafText);
    if (height !== newHeight) setHeight(newHeight);
  });

  // Obtain the centralState (which "never" changes its memo-identity),
  // and set up a local state object for the element state, which will be
  // changed via inner workings of the centralState every time we want this
  // Slate element to re-render based on changes to its page status.
  const centralState = PageLayout.useContainer();

  // If this is a section, publish its data to the central state.
  const sectionData =
    (element.type as string) === "section"
      ? ((element as any).data as SectionData)
      : undefined;
  React.useEffect(() => {
    if (path && sectionData) updateSectionData(centralState, path, sectionData);
  }, [centralState, path, sectionData]);

  // Publish information about height whenever it changes.
  React.useEffect(() => {
    if (!path) return;

    if (height && domElement) {
      updateElementAnalysis(centralState, path, {
        height,
        leafElementRef: leafElement ? new WeakRef(leafElement) : undefined,
      });
    }

    return () => clearElementAnalysis(centralState, path);
  }, [centralState, path, height, domElement, leafElement, leafText]);

  // Return nothing. This hook only exfiltrates data but does not infiltrate.
  return null;
}

export function usePageLayoutElementState(element: Slate.Element) {
  const staticEditor = SlateReact.useSlateStatic() as SlateReact.ReactEditor;

  // Hold Slate layout information in state, once available.
  const [path, setPath] = React.useState<Slate.Path | undefined>();
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
    const newPath = SlateReact.ReactEditor.findPath(staticEditor, element);
    const newKey = SlateReact.ReactEditor.findKey(staticEditor, element).id;

    if (!isEqual(path, newPath)) setPath(newPath);
    if (key !== newKey) setKey(newKey);
  });

  // Obtain the centralState (which "never" changes its memo-identity),
  // and set up a local state object for the element state, which will be
  // changed via inner workings of the centralState every time we want this
  // Slate element to re-render based on changes to its page status.
  const centralState = PageLayout.useContainer();
  const [elementState, setElementState] = React.useState(initialElementState());

  // Subscribe to element state, once the Slate path is known.
  React.useEffect(() => {
    if (!path) return;
    subscribeElementState(centralState, path, setElementState);

    return () => unsubscribeElementState(centralState, path, setElementState);
  }, [centralState, path]);

  // Return the local element state, which the React element can use to change
  // how the element is rendered based on its current page status.
  return elementState;
}

function subscribeElementState(
  centralState: CentralState,
  path: Slate.Path,
  callback: (newState: ElementState) => unknown
) {
  centralState.elementStatePubSubs
    .getOrCreate(PubSub, path)
    .subscribe(callback);
}

function unsubscribeElementState(
  centralState: CentralState,
  path: Slate.Path,
  callback: (newState: ElementState) => unknown
) {
  centralState.elementStatePubSubs.maybeDelete(
    path,
    (analysis: PubSub<ElementState>) => {
      analysis.unsubscribe(callback);
      return analysis.subscriptions.length === 0;
    }
  );
}

function publishElementState(
  centralState: CentralState,
  path: Slate.Path,
  state: ElementState
) {
  centralState.elementStatePubSubs.getOrCreate(PubSub, path).publish(state);
}

function updateSectionData(
  centralState: CentralState,
  path: Slate.Path,
  sectionData: SectionData
) {
  centralState.sectionData.put(sectionData, path);
}

function updateElementAnalysis(
  centralState: CentralState,
  path: Slate.Path,
  analysis: ElementAnalysis
) {
  centralState.elementAnalyses.put(analysis, path);

  // // We assume this is a top-level section if the path length is 1.
  // // When the height of a section changes, it prompts a refreshed analysis.
  // const isSection = path.length === 1;
  // if (isSection) refreshSection(centralState, path[0]);

  // An update in this section "dirties" the section, marking for later refresh.
  centralState.dirtySections.add(path[0]);
  centralState.refreshTimestampPubSub.publish(new Date());
}

function clearElementAnalysis(centralState: CentralState, path: Slate.Path) {
  centralState.elementAnalyses.delete(path);
}

// This is the amount of space (in pixels) that we consider not enough space
// to do any useful amount of layout within. Usually this should be
// just less than the height of a typical line in the document.
const negligibleSpace = 15;

// Refresh page splitting information within any sections marked as "dirty".
// Then clear away all dirty markers so that we'll start fresh next time.
function refreshDirtySections(centralState: CentralState) {
  centralState.dirtySections.forEach((_, index) =>
    refreshSection(centralState, index)
  );
  centralState.dirtySections.clear();
}

// Refresh page splitting information within the given section.
function refreshSection(centralState: CentralState, sectionIndex: number) {
  const sectionLayer = centralState.elementAnalyses.children[sectionIndex];
  if (!sectionLayer) return;

  const sectionData = centralState.sectionData.children[sectionIndex]?.analysis;
  if (!sectionData) return;

  // Get a height budget per page in pixels, after subtracting page padding.
  const budgetPerPage =
    96 * (sectionData.style.heightInches - sectionData.style.paddingInches * 2);

  // This check helps to ensure that pathological configuration can't lead
  // to an infinite loop that is looking for more space and never finding it.
  if (budgetPerPage <= negligibleSpace * 2) {
    console.warn(`Ensure usable page is taller than ${negligibleSpace * 2}px`);
    return;
  }

  // Now loop through the children, determining which ones belong on which pages
  // and where specifically each page split should be placed.
  const cursor: PageLayoutCursor = {
    page: 1,
    budget: budgetPerPage,
    budgetPerPage,
    path: [sectionIndex],
  };
  recursivelySplitWithin(centralState, sectionLayer, cursor);
}

function recursivelySplitWithin(
  centralState: CentralState,
  outerLayer: HierarchicalAnalyses<ElementAnalysis>,
  cursor: PageLayoutCursor
) {
  if (outerLayer.hasNoChildren()) {
    cursor.path.push(0);
    splitLeaf(centralState, outerLayer, cursor);
    cursor.path.pop();
    return;
  }

  cursor.path.push(0);
  outerLayer.children.forEach((childLayer, childIndex) => {
    // If there is very little or zero space left in the budget, we need to
    // begin a new page instead of trying to squeeze in anything on this page.
    if (cursor.budget <= negligibleSpace) {
      // TODO: Insert "pre split" for the current (NOT LEAF!) element path,
      // where it should render a page split prior to the element itself.

      // Go to the next page and reset the budget.
      cursor.page += 1;
      cursor.budget = cursor.budgetPerPage;
    }

    // Get the element analysis for this child layer. Or skip if there is none.
    const elementAnalysis = childLayer?.analysis;
    if (!elementAnalysis) return;

    // If this node is small enough to fit in the page, we allocate that part
    // of the budget then continue iterating to look next at the next node.
    if (elementAnalysis.height <= cursor.budget) {
      cursor.budget -= elementAnalysis.height;
      return;
    }

    // Otherwise, we need to recurse and find splits within this child,
    // possibly even splitting it in multiple places to span multiple pages.
    //
    // NOTE: This operation will MUTATE the cursor, leaving it in the correct
    // state to continue for us to iterate with it here.
    cursor.path[cursor.path.length - 1] = childIndex;
    recursivelySplitWithin(centralState, childLayer, cursor);
  });
  cursor.path.pop();
}

function splitLeaf(
  centralState: CentralState,
  layer: HierarchicalAnalyses<ElementAnalysis>,
  cursor: PageLayoutCursor
) {
  const analysis = layer.analysis;
  if (!analysis) return;

  const element = analysis.leafElementRef?.deref();
  if (!element) return;

  const text = element.textContent;
  if (!text) return;

  const spacePoints: [number, number][] = [[0, 0]];
  const spacePointsPattern = /\s+/gm;
  let matchInfo;
  while ((matchInfo = spacePointsPattern.exec(text))) {
    spacePoints.push([matchInfo.index, spacePointsPattern.lastIndex]);
  }

  // We'll gather split info for each needed split point within this leaf node.
  const splitInfos: PageSplitInfo[] = [];
  const pageSplitRanges: PageSplitRange[] = [];

  // We'll reuse a mutable Range object to check element height efficiently.
  // TODO: This could be even more efficient if we passed it in the cursor,
  // so that we could reuse it for every call to the splitLeaf function.
  let currentStartSpace = 0;
  let currentEndSpace = spacePoints.length - 1;
  let currentRangeHeight = element.getBoundingClientRect().height;

  // Keep finding split points until the remaining height is within the budget.
  while (currentRangeHeight > cursor.budget) {
    // Use binary search with the mutable text content to find the maximum
    // end offset that is still within our height budget - the place to split.
    let maxAcceptable = currentStartSpace;
    let minTooLarge = currentEndSpace;
    while (maxAcceptable < minTooLarge - 1) {
      if (currentRangeHeight <= cursor.budget) {
        maxAcceptable = currentEndSpace;
      } else {
        minTooLarge = currentEndSpace;
      }
      currentEndSpace = Math.floor((maxAcceptable + minTooLarge) / 2);
      element.textContent = text.slice(
        spacePoints[currentStartSpace][1],
        spacePoints[currentEndSpace][0]
      );
      currentRangeHeight = element.getBoundingClientRect().height;
    }

    // Deduct from the budget, then take note of info about the split point.
    cursor.budget -= currentRangeHeight;
    const splitInfo = {
      offset: spacePoints[currentEndSpace][1], // TODO: remove
      endsPage: cursor.page,
      extraSpace: cursor.budget,
    };
    splitInfos.push(splitInfo);
    const splitPoint = {
      path: cursor.path,
      offset: spacePoints[currentEndSpace][1],
    };
    pageSplitRanges.push({
      anchor: { ...splitPoint },
      focus: { ...splitPoint },
      pageSplitInfo: splitInfo,
    });

    // Move our calculation cursor to the next page and reset the budget.
    cursor.page += 1;
    cursor.budget = cursor.budgetPerPage;

    // Now move the mutable Range object to select the remainder of the element.
    // We'll continue looping from here to maybe find more split points.
    currentStartSpace = currentEndSpace;
    currentEndSpace = spacePoints.length - 1;
    element.textContent = text.slice(
      spacePoints[currentStartSpace][1],
      spacePoints[currentEndSpace][0]
    );
    currentRangeHeight = element.getBoundingClientRect().height;
  }

  // Now what is left is the last part of the text, starting the new page.
  // This means it deducts its height from the budget of the new page.
  cursor.budget -= currentRangeHeight;

  // Reset the text content to the original full text.
  element.textContent = text;

  // Publish the split information, causing the React node to re-render.
  publishElementState(centralState, cursor.path, {
    splitInfos,
    pageSplitRanges,
  });
}
