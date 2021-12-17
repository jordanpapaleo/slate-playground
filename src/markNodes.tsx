import { Editor, Transforms, Text } from 'slate'
import { ComboEditor } from './common.types'
import Leaf from './Leaf'

// Could have more leaf types just like elements?
export const renderLeaf = (props: any) => {
  return <Leaf { ...props } />
}

// When marks are rendered, the characters are grouped into "leaves"
const toggleMark = (
  {
    editor,
    type
  }:
  {
    editor: ComboEditor,
    type: string,
  }
) => {
  const isActive = isMarkActive(editor, type)
  if (isActive) {
    Editor.removeMark(editor, type)
  } else {
    Editor.addMark(editor, type, true)
  }
}

const isMarkActive = (editor: ComboEditor, type: string) => {
  const marks = Editor.marks(editor)
  return marks ? marks[type] === true : false
}

export const setFontStyles = (editor: ComboEditor, key: string, value: string) => {
  const props = { [key]: value }
  const options = { match: n => Text.isText(n), split: true }
  Transforms.setNodes(editor, props, options)
}

export const TEXT_NODES: Array<{
  label: string,
  type: string,
  fn: (editor: ComboEditor, styleKey: string) => void
}> = [
    { label: 'Bold', type: 'bold', fn: toggleMark },
    { label: 'Italic', type: 'italic', fn: toggleMark },
    { label: 'Underline', type: 'underline', fn: toggleMark },
    { label: 'Strike', type: 'strike', fn: toggleMark },
    { label: 'Highlight', type: 'highlight', fn: toggleMark },
    { label: 'Color', type: 'color', fn: toggleMark },
  ]

export const OPTION_TEXT_NODES: Array<{
  label: string,
  key: string,
  fn: (editor: ComboEditor, key: string, value: string) => void,
  options: string[],
}> = [
  {
    label: 'Font Size',
    key: 'fontSize',
    fn: setFontStyles,
    options: [ '16', '24', '36' ]
  },
  {
    label: 'Font Family',
    key: 'fontFamily',
    fn: setFontStyles,
    options: [ 'Arial', 'Tahoma', 'Verdana' ]
  },
]

/*
function testMark(editor: ComboEditor, key: string) {
  const options = { match: n => n[key] === true, universal: true, }
  const [match] = Editor.nodes(editor, options)
  return !!match
}

function toggleMark1(editor: ComboEditor, styleKey: string) {
  const isActive = testMark(editor, styleKey)
  const props = { [styleKey]: isActive ? null : true }
  const options = { match: n => Text.isText(n), split: true }
  Transforms.setNodes(editor, props, options)
}
*/


