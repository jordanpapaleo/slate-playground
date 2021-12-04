/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import { createEditor, Text, Range, Path  } from 'slate'
import { withHistory } from 'slate-history'
import './app.css'
import {
  Editable,
  Slate,
  // useFocused,
  // useReadOnly,
  // useSelected,
  // useSlate,
  // useSlateStatic,
  withReact,
} from 'slate-react'
import {
  keyPressHandler,
} from './appUtils'

import {
  loadEditorState,
  saveEditorState,
} from './stateUtils'

import { TEXT_NODES, OPTION_TEXT_NODES, renderLeaf } from './textNodes'
import { ELEMENT_NODES, renderElement } from './elementNodes'

// import withCustomNormalize from './withCustomNormalize'
import { ComboEditor } from './common.types'

const sectionPlugin = {
  commands: {
    // editor.insertSectionBreak({ marginLeft: 0, marginRight: 1 })
    insertSectionBreak(editor: ComboEditor, {marginLeft, marginRight}) {
      console.log('editor', editor)
      editor.insertBlock({
        type: 'section-break',
        data: { marginLeft, marginRight }
      })
    }
  },
  queries: {
    // editor.getActiveListItem()
    getActiveListItem(editor: ComboEditor) {
      // ...
    }
  }
}

const App = () => {
  const editorWithHistory = withHistory(createEditor())
  const editorWithReact = withReact(editorWithHistory)
  // const editorWithCN = withCustomNormalize(editorWithReact)
  const editor = React.useMemo(() => editorWithReact, [])
  const [value, setValue] = React.useState(loadEditorState())
  const renderElementFn = React.useCallback(renderElement, [])
  const renderLeafFn = React.useCallback(renderLeaf, [])
  const [search, setSearch] = React.useState<string | undefined>()

  React.useEffect(() => { saveEditorState(value) }, [value])

  const decorate = React.useCallback(([node, path]) => {
    const ranges = []

    if (search && Text.isText(node)) {
      const { text } = node
      const parts = text.split(search)
      let offset = 0

      parts.forEach((part, i) => {
        if (i !== 0) {
          ranges.push({
            anchor: { path, offset: offset - search.length },
            focus: { path, offset },
            highlight: true,
          })
        }

        offset = offset + part.length + search.length
      })
    }

    return ranges
  }, [search])

  return (
    <div style={{ margin: '1rem' }}>
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => { setValue(newValue) }}
      >
        <nav style={{ display: 'flex', gap: 10 }}>
          {TEXT_NODES.map(({ label, key, fn }) => (
            <button onMouseDown={(event) => {
              event.preventDefault()
              fn(editor, key)
            }}>
              {label}
            </button>
          ))}

          {ELEMENT_NODES.map(({label, type, fn}) => (
            <button key={type} onClick={(e) => {
              fn(editor, type)
            }}>{label}</button>
          ))}
        </nav>

        <nav>
          <button>Data Element</button>
        </nav>

        <nav style={{display: 'flex', gap: 10}}>
          {OPTION_TEXT_NODES.map(({label, key, fn, options}) => (
            <label key={key}>
              {label}<br />
              <select onChange={(e) => { fn(editor, key, e.target.value) }}>
                {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
          ))}

          <label>
            Text Search<br />
            <input
              type="search"
              onChange={e => setSearch(e.target.value)}
            />
          </label>
        </nav>

        <Editable
          decorate={decorate}
          renderElement={renderElementFn}
          renderLeaf={renderLeafFn}
          onKeyDown={keyPressHandler(editor)}
        />
      </Slate>

      <pre>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export default App;

/*
editor.apply({
  type: 'insert_text',
  path: [0, 0],
  offset: 15,
  text: 'A new string of text to be inserted.',
})

editor.apply({
  type: 'remove_node',
  path: [0, 0],
  node: {
    text: 'A line of text!',
  },
})

editor.apply({
  type: 'set_selection',
  properties: {
    anchor: { path: [0, 0], offset: 0 },
  },
  newProperties: {
    anchor: { path: [0, 0], offset: 15 },
  },
})
*/
