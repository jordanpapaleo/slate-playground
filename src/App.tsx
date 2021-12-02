import React from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import {
  defaultState,
  renderElement,
  renderLeaf,
  savedState,
  keyPressHandler,
  INLINE_STYLES,
  BLOCK_STYLES,
  setFontStuff,
  toggleType,
} from './appUtils'

const App = () => {
  const editor = React.useMemo(() => withReact(createEditor()), [])
  const [value, setValue] = React.useState(savedState || defaultState)

  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElementFn = React.useCallback(renderElement, [])
  const renderLeafFn = React.useCallback(renderLeaf, [])

  React.useEffect(() => {
    const content = JSON.stringify(value)
    localStorage.setItem('content', content)
  }, [value])

  return (
    <div style={{ margin: '1rem' }}>
      <nav style={{ display: 'flex', gap: 10 }}>
        {INLINE_STYLES.map(({ label, fn }) => (
          <button onMouseDown={(event) => {
            event.preventDefault()
            fn(editor)
          }}>
            {label}
          </button>
        ))}

        <button onClick={(e) => {
          toggleType(editor, 'heading-one')
        }}>h1</button>
        <button onClick={(e) => {
          toggleType(editor, 'heading-two')
        }}>h2</button>
        <button onClick={(e) => {
          toggleType(editor, 'heading-three')
        }}>h3</button>
        <button onClick={(e) => {
          toggleType(editor, 'block-quote')
        }}>BQ</button>
        <button onClick={(e) => {
          toggleType(editor, 'bulleted-list')
        }}>UL</button>
        <button onClick={(e) => {
          toggleType(editor, 'numbered-list')
        }}>OL</button>
        <button onClick={(e) => {
          toggleType(editor, 'list-item')
        }}>LI</button>
      </nav>
      <nav style={{display: 'flex', gap: 10}}>
        <label>
          Font Size<br />
          <select onChange={(e) => {
            setFontStuff(editor, 'fontSize', e.target.value)
          }}>
            <option value="16">16</option>
            <option value="24">24</option>
            <option value="36">36</option>
          </select>
        </label>

        <label>
          Font Family<br />
          <select onChange={(e) => {
            setFontStuff(editor, 'fontFamily', e.target.value)
          }}>
            <option value="Arial">Arial</option>
            <option value="Tahome">Tahoma</option>
            <option value="Verdana">Verdana</option>
          </select>
        </label>
      </nav>

      <div style={{ border: '1px solid #cccccc', margin: '1rem 0'}}>
        <Slate
          editor={editor}
          value={value}
          onChange={newValue => { setValue(newValue) }}
        >
          <Editable
            renderElement={renderElementFn}
            renderLeaf={renderLeafFn}
            onKeyDown={keyPressHandler(editor)}
          />
        </Slate>

      </div>
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
