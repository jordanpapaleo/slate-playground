// @refresh reset
import React from "react";
import * as Slate from "slate";
import * as SlateHistory from "slate-history";
import * as SlateReact from "slate-react";

import RenderLeaf from "./components/RenderLeaf";
import RenderElement from "./components/RenderElement";
import PageLayout from "./state/PageLayout";

import initialJSON from "./data/initial.json";

import "./app.css";

const PLUGINS = [SlateHistory.withHistory, SlateReact.withReact];

const createEditor = () =>
  PLUGINS.reduce((editor, next) => next(editor), Slate.createEditor());

export default function App() {
  const [editor] = React.useState(createEditor);
  const [value, setValue] = React.useState<any[]>(initialJSON);

  React.useEffect(() => {
    SlateReact.ReactEditor.focus(editor);
  }, [editor]);

  return (
    <div style={{ margin: "1rem", display: "flex" }}>
      <PageLayout.Provider>
        <SlateReact.Slate
          editor={editor}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          value={value}
        >
          <SlateReact.Editable
            renderElement={RenderElement}
            renderLeaf={RenderLeaf}
          />
        </SlateReact.Slate>
      </PageLayout.Provider>

      <pre style={{ marginLeft: "1rem" }}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}
