/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
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

import { LEAF_NODES, OPTION_LEAF_NODES, renderLeaf } from './leafNodes'
import { ELEMENT_NODES, renderElement } from './elementNodes'

import withCustomNormalize from './with-custom-normalize'

const App = () => {
  const editorWithHistory = withHistory(createEditor())
  const editorWithReact = withReact(editorWithHistory)
  // const editorWithCN = withCustomNormalize(editorWithReact)
  const editor = React.useMemo(() => editorWithReact, [])
  const [value, setValue] = React.useState(loadEditorState())
  const renderElementFn = React.useCallback(renderElement, [])
  const renderLeafFn = React.useCallback(renderLeaf, [])

  console.log('value', value)

  React.useEffect(() => { saveEditorState(value) }, [value])

  return (
    <div style={{ margin: '1rem' }}>
      <nav style={{ display: 'flex', gap: 10 }}>
        {LEAF_NODES.map(({ label, key, fn }) => (
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

      <nav style={{display: 'flex', gap: 10}}>
        {OPTION_LEAF_NODES.map(({label, key, fn, options}) => (
          <label key={key}>
            {label}<br />
            <select onChange={(e) => { fn(editor, key, e.target.value) }}>
              {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        ))}

        <label>
          Section Margins<br />
          <input type="number" min="0" max="0" step="0.5" onChange={() => {
            console.log('here')
          }} />
        </label>
      </nav>

      <div style={{ border: '1px solid #cccccc', margin: '1rem 0'}}>
        <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => { setValue(newValue) }}
        >
          <Editable
            renderElement={renderElementFn}
            renderLeaf={renderLeafFn}
            onKeyDown={keyPressHandler(editor)}
          />
        </Slate>
      </div>

      <pre style={{padding: '1rem', background: '#eeeeee'}}>
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
