import { Editor, Transforms, Text } from 'slate'
import { ComboEditor } from './common.types'
import Leaf from './Leaf'

// Could have more leaf types just like elements?
export const renderLeaf = (props: any) => {
  return <Leaf { ...props } />
}

function testText(editor: ComboEditor, key: string) {
  const options = { match: n => n[key] === true, universal: true, }
  const [match] = Editor.nodes(editor, options)
  return !!match
}

function toggleTextStyle(editor: ComboEditor, styleKey: string) {
  const isActive = testText(editor, styleKey)
  const props = { [styleKey]: isActive ? null : true }
  const options = { match: n => Text.isText(n), split: true }
  Transforms.setNodes(editor, props, options)
}

export const setFontStyles = (editor: ComboEditor, key: string, value: string) => {
  const props = { [key]: value }
  const options = { match: n => Text.isText(n), split: true }
  Transforms.setNodes(editor, props, options)
}

export const LEAF_NODES: Array<{
  label: string,
  key: string,
  fn: (editor: ComboEditor, styleKey: string) => void
}> = [
    { label: 'Bold', key: 'bold', fn: toggleTextStyle },
    { label: 'Italic', key: 'italic', fn: toggleTextStyle },
    { label: 'Underline', key: 'underline', fn: toggleTextStyle },
    { label: 'Strike', key: 'strike', fn: toggleTextStyle },
    { label: 'Highlight', key: 'highlight', fn: toggleTextStyle },
    { label: 'Color', key: 'color', fn: toggleTextStyle },
  ]

export const OPTION_LEAF_NODES: Array<{
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
  }
]

//
//
//
//

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}


const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}
