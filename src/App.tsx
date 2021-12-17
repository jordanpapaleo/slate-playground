// @refresh reset
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import * as slate from 'slate'
import { withHistory } from 'slate-history'
import './app.css'
import get from 'lodash/get'
import * as reactSlate from 'slate-react'
import {
  keyPressHandler,
} from './appUtils'
import { Plate } from '@udecode/plate'

import {
  loadEditorState,
  saveEditorState,
} from './stateUtils'

import { TEXT_NODES, OPTION_TEXT_NODES, renderLeaf } from './markNodes'
import { ELEMENT_NODES, renderElement } from './elementNodes'

import withCustomNormalize from './withCustomNormalize'
import { ComboEditor } from './common.types'

const { createEditor, Text, Transforms, Descendant, Editor, Range, Path } = slate
const {
  // useFocused,
  // useReadOnly,
  // useSelected,
  // useSlate,
  // useSlateStatic,
  Editable,
  ReactEditor,
  Slate,
  withReact,
} = reactSlate

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

const getEditor = () => [
  withHistory,
  withReact,
  withCustomNormalize,
  // withCustomInsertBreak,
].reduce((editor, next) => {
  return next(editor)
}, createEditor())

const getPage = (editor) => {
  const path = get(editor.selection, 'anchor.path', [0])
  const [pagePositon] = path
  const page = editor.children[pagePositon]
  return { page, path, pagePositon }
}

const App = () => {
  // https://github.com/ianstormtaylor/slate/issues/4081
  const [editor] = React.useState(() => getEditor())
  // const renderElementFn = React.useCallback(renderElement, [])
  const renderLeafFn = React.useCallback(renderLeaf, [])
  const [value, setValue] = React.useState<typeof Descendant[]>(loadEditorState())
  const [textSearch, setTextSearch] = React.useState<string | undefined>()

  React.useEffect(() => {
    window.editor = editor
    window.Transforms = Transforms
    window.slate = slate
    window.reactSlate = reactSlate
  }, [editor])

  React.useEffect(() => {
    saveEditorState(value)
  }, [value])

  React.useEffect(() => {
    // runs the normalizeNode method on load
    Editor.normalize(editor, { force: true })
    ReactEditor.focus(editor)
  }, [])

  // text search ranges
  const getRanges = ([node, path]) => {
    const ranges = []

    if (textSearch && Text.isText(node)) {
      const { text } = node
      const parts = text.toLocaleLowerCase().split(textSearch.toLowerCase())
      let offset = 0

      parts.forEach((part, i) => {
        if (i !== 0) {
          ranges.push({
            anchor: { path, offset: offset - textSearch.length },
            focus: { path, offset },
            highlight: true,
          })
        }

        offset = offset + part.length + textSearch.length
      })
    }

    return ranges
  }

  const decorate = React.useCallback(getRanges, [textSearch])

  const genericHandler = (type, fn) => (e) => {
    console.log({ type, fn})
    e.preventDefault()
    fn({ editor, type })
  }

  const handlePaddingChange = (updateKey) => (e) => {
    const val = e.target.value + 'in'
    const { page, pagePositon } = getPage(editor)
    const style = { ...page.data.style, [updateKey]: val }

    const props = { type: 'page', data: { ...page.data, style } }
    const options = { at: [pagePositon] }
    Transforms.setNodes(editor, props, options)
  }

  const handlePaperSizeChange = (e) => {
    const [width, height] = e.target.value.split('x')
    const { page, pagePositon } = getPage(editor)
    const style = {
      ...page.data.style,
      height: height + 'in',
      width: width + 'in',
    }

    const props = { type: 'page', data: { ...page.data, style } }
    const options = { at: [pagePositon] }
    Transforms.setNodes(editor, props, options)
  }

  return (
    <div style={{ margin: '1rem' }}>
      <Slate
        editor={editor}
        onChange={(newValue) => { setValue(newValue) }}
        value={value}
      >

        {/* <Toolbar
          editor={editor}
          genericHandler={genericHandler}
          handlePaddingChange={handlePaddingChange}
          handlePaperSizeChange={handlePaperSizeChange}
          setTextSearch={setTextSearch}
        /> */}

        <Editable
          // renderElement={renderElementFn}
          decorate={decorate}
          onBlur={() => { console.log('Blurred') }}
          onKeyDown={keyPressHandler(editor)}
          onPaste={() => { console.log('Pasted') }}
          renderElement={renderElement}
          renderLeaf={renderLeafFn}
        />
      </Slate>

      <pre>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export default App;

const Toolbar = ({
  editor,
  genericHandler,
  handlePaddingChange,
  handlePaperSizeChange,
  setTextSearch,
}) => {
  const inputStyles = { display: 'inline-flex', marginRight: 20, marginBottom: 5 }
  const buttonStyles = { marginRight: 2, marginBottom: 5}
  const INPUTS = [
    ['Margin Left', 'paddingLeft'],
    ['Margin Right', 'paddingRight'],
    ['Margin Top', 'paddingTop'],
    ['Margin Bottom', 'paddingBottom'],
  ]

  return (
    <nav>
      {[
        ...TEXT_NODES,
        ...ELEMENT_NODES
      ].map(({ label, type, fn }) => (
        <button
          key={type}
          style={buttonStyles}
          onMouseDown={(e) => {
            e.preventDefault()
            fn({ editor, type })
          }}
        >
          {label}
        </button>
      ))}

      <div>
        {OPTION_TEXT_NODES.map(({ label, key, fn, options }) => (
          <label key={key} style={inputStyles}>
            {label}<span style={{ paddingLeft: 10 }} />
            <select onChange={(e) => { fn(editor, key, e.target.value) }}>
              {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        ))}

        <label style={inputStyles}>
          Paper Size <span style={{ paddingLeft: 10 }} />
          <select onChange={handlePaperSizeChange} style={{ width: 75 }}>
            <option value="4x4">4x4</option>
            <option value="5x5">5x5</option>
            <option value="6x6">6x6</option>
          </select>
        </label>
      </div>
      <div>
      {INPUTS.map(([label, value]) => (
        <label style={inputStyles} key={value}>
          {label} <span style={{paddingLeft: 10}} />
          <input
            max="3"
            min="0"
            onChange={handlePaddingChange(value)}
            step="0.25"
            type="number"
          />
        </label>
      ))}
      </div>
      <div>
        <label style={inputStyles}>
          Text Search<span style={{ paddingLeft: 10 }} />
          <input
            type="search"
            onChange={e => setTextSearch(e.target.value)}
          />
        </label>
      </div>
    </nav>
  )
}

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
