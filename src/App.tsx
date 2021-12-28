// @refresh reset
import React from "react";
import * as Slate from "slate";
import * as SlateHistory from "slate-history";
import * as SlateReact from "slate-react";

import RenderLeaf from "./components/RenderLeaf";
import RenderElement from "./components/RenderElement";
import PageLayout from "./state/PageLayout";
import LeafPaginator from "./components/LeafPaginator";
import ElementMeasurer from "./components/ElementMeasurer";

import initialJSON from "./data/initial.json";

import "./app.css";
import LeafMeasurer from "./components/LeafMeasurer";
import PageLayoutTopLevelHelper from "./components/PageLayoutTopLevelHelper";

const PLUGINS = [SlateHistory.withHistory, SlateReact.withReact];

const createEditor = () =>
  PLUGINS.reduce((editor, next) => next(editor), Slate.createEditor());

export default function App() {
  return (
    <PageLayout.Provider>
      <AppInner />
    </PageLayout.Provider>
  );
}

function AppInner() {
  const [editor] = React.useState(createEditor);
  const [editorShadow] = React.useState(createEditor);
  const [value, setValue] = React.useState<any[]>(initialJSON);

  const decorate = undefined; // usePageLayoutDecorateFn();

  React.useEffect(() => {
    SlateReact.ReactEditor.focus(editor);
  }, [editor]);

  return (
    <div style={{ margin: "1rem", display: "flex" }}>
      <PageLayoutTopLevelHelper />
      <SlateReact.Slate
        editor={editorShadow}
        onChange={() => {}}
        value={[...initialJSON] as any} // TODO: do better
      >
        <SlateReact.Editable
          // We'll use this first "editable" in a read-only way, acting as a
          // parallel view into the Slate element tree that we can measure
          // accurately because it is presented raw and unpaginated.
          // We can't measure the paginated view accurately because the
          // existing page splits would get in the way of our measurements.
          readOnly
          // We hide it from view with opacity and positioning tricks,
          // because we don't need/want the user to interact with it at all.
          // TODO: (add accessibility attributes to hide from screen readers)
          // style={{ opacity: 0, position: "absolute" }}
          // Plug in our application-specific views for leaves and elements,
          // wrapped in pagination-aware wrappers we can use to measure them.
          renderLeaf={(props) => (
            <LeafMeasurer {...props} renderLeaf={RenderLeaf} />
          )}
          renderElement={(props) => (
            <ElementMeasurer {...props} renderElement={RenderElement} />
          )}
        />
      </SlateReact.Slate>

      <SlateReact.Slate
        editor={editor}
        onChange={(newValue) => {
          Slate.Editor.withoutNormalizing(editorShadow, () => {
            editor.operations.forEach((op) => editorShadow.apply(op));
          });
          setValue(newValue);
        }}
        value={value}
      >
        <SlateReact.Editable
          decorate={decorate}
          // Plug in our application-specific views for leaves and elements,
          // wrapped in pagination-aware wrappers we can use to split them.
          renderLeaf={(props) => (
            <LeafPaginator {...props} renderLeaf={RenderLeaf} />
          )}
          renderElement={RenderElement}
        />
      </SlateReact.Slate>

      <pre style={{ marginLeft: "1rem" }}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}
