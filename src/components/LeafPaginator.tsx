import React, { useRef, useLayoutEffect } from "react";
import { Editor, Text, Path, Element, Node } from "slate";
import { useSlateStatic, ReactEditor } from "slate-react";
import * as SlateReact from "slate-react";

import { usePageLayoutElementState, PageSplitInfo } from "../state/PageLayout";

interface LeafPaginatorProps extends SlateReact.RenderLeafProps {
  renderLeaf: (props: SlateReact.RenderLeafProps) => JSX.Element;
}

export default function LeafPaginator(props: LeafPaginatorProps) {
  let { attributes, children, leaf, text, renderLeaf } = props;

  const pageSplitInfo: PageSplitInfo | undefined = (leaf as any).pageSplitInfo;
  if (pageSplitInfo)
    return (
      <>
        {children}
        <span contentEditable={false} className="page-split-spacer"></span>
        <span contentEditable={false} className="page-split-absolute">
          <span contentEditable={false} className="footer" />
          <span contentEditable={false} className="header" />
        </span>
      </>
    );

  // const elementState = usePageLayoutElementState(text as any); // TODO: avoid `as any`

  // children = maybeSplitChildren(leaf, children, elementState.splitInfos);

  return renderLeaf({ attributes, children, leaf, text });
}

function maybeSplitChildren(
  leaf: any,
  children: any,
  splitInfos: PageSplitInfo[]
) {
  if (splitInfos.length === 0) return children;

  let lastSplitIndex = 0;
  const splitChildren = splitInfos.flatMap((splitInfo, keyNum) => {
    const splitOffset = splitInfo.offset;
    const splitText = leaf.text.slice(lastSplitIndex, splitOffset);
    lastSplitIndex = splitOffset;

    const list = [];
    list.push(
      <String
        {...children.props}
        key={`${keyNum}-s`}
        leaf={{ ...leaf, text: splitText }}
      />
    );
    list.push(
      <span
        key={`${keyNum}-ps`}
        contentEditable={false}
        className="page-split-spacer"
      ></span>
    );
    list.push(
      <span
        key={`${keyNum}-pa`}
        contentEditable={false}
        className="page-split-absolute"
      >
        <span contentEditable={false} className="footer" />
        <span contentEditable={false} className="header" />
      </span>
    );

    return list;
  });
  splitChildren.push(
    <String
      key="final"
      {...children.props}
      leaf={{ ...leaf, text: leaf.text.slice(lastSplitIndex) }}
    />
  );

  return splitChildren;
}

///
//
//
//
// Everything from the below section is copied from slate-react's `string.tsx`,
// without modifications. We copy only because the original is not public API.
//
//
//
//

/**
 * Leaf content strings.
 */

const String = (props: {
  isLast: boolean;
  leaf: Text;
  parent: Element;
  text: Text;
}) => {
  const { isLast, leaf, parent, text } = props;
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, text);
  const parentPath = Path.parent(path);

  // COMPAT: Render text inside void nodes with a zero-width space.
  // So the node can contain selection but the text is not visible.
  if (editor.isVoid(parent)) {
    return <ZeroWidthString length={Node.string(parent).length} />;
  }

  // COMPAT: If this is the last text node in an empty block, render a zero-
  // width space that will convert into a line break when copying and pasting
  // to support expected plain text.
  if (
    leaf.text === "" &&
    parent.children[parent.children.length - 1] === text &&
    !editor.isInline(parent) &&
    Editor.string(editor, parentPath) === ""
  ) {
    return <ZeroWidthString isLineBreak />;
  }

  // COMPAT: If the text is empty, it's because it's on the edge of an inline
  // node, so we render a zero-width space so that the selection can be
  // inserted next to it still.
  if (leaf.text === "") {
    return <ZeroWidthString />;
  }

  // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
  // so we need to add an extra trailing new lines to prevent that.
  if (isLast && leaf.text.slice(-1) === "\n") {
    return <TextString isTrailing text={leaf.text} />;
  }

  return <TextString text={leaf.text} />;
};

/**
 * Leaf strings with text in them.
 */
const TextString = (props: { text: string; isTrailing?: boolean }) => {
  const { text, isTrailing = false } = props;

  const ref = useRef<HTMLSpanElement>(null);

  // This is the actual text rendering boundary where we interface with the DOM
  // The text is not rendered as part of the virtual DOM, as since we handle basic character insertions natively,
  // updating the DOM is not a one way dataflow anymore. What we need here is not reconciliation and diffing
  // with previous version of the virtual DOM, but rather diffing with the actual DOM element, and replace the DOM <span> content
  // exactly if and only if its current content does not match our current virtual DOM.
  // Otherwise the DOM TextNode would always be replaced by React as the user types, which interferes with native text features,
  // eg makes native spellcheck opt out from checking the text node.

  // useLayoutEffect: updating our span before browser paint
  useLayoutEffect(() => {
    // null coalescing text to make sure we're not outputing "null" as a string in the extreme case it is nullish at runtime
    const textWithTrailing = `${text ?? ""}${isTrailing ? "\n" : ""}`;

    if (ref.current && ref.current.textContent !== textWithTrailing) {
      ref.current.textContent = textWithTrailing;
    }

    // intentionally not specifying dependencies, so that this effect runs on every render
    // as this effectively replaces "specifying the text in the virtual DOM under the <span> below" on each render
  });

  // the span is intentionally same on every render in virtual DOM, actual rendering happens in the layout effect above
  return <span data-slate-string ref={ref} />;
};

/**
 * Leaf strings without text, render as zero-width strings.
 */

const ZeroWidthString = (props: { length?: number; isLineBreak?: boolean }) => {
  const { length = 0, isLineBreak = false } = props;
  return (
    <span
      data-slate-zero-width={isLineBreak ? "n" : "z"}
      data-slate-length={length}
    >
      {"\uFEFF"}
      {isLineBreak ? <br /> : null}
    </span>
  );
};
