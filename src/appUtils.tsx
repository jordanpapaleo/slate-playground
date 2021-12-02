import { Editor, Transforms, Text, Element as SlateElement, Descendant } from 'slate'
import DefaultElement from './DefaultElement'
import CodeElement from './CodeElement'
import Leaf from './Leaf'

function testText(editor, key) {
  const [match] = Editor.nodes(editor, {
    match: n => n[key] === true,
    universal: true,
  })
  return !!match
}

function toggleTextStyle(editor, key) {
  const isActive = testText(editor, key)
  const props = { [key]: isActive ? null : true }
  const options = { match: n => Text.isText(n), split: true }
  Transforms.setNodes(editor, props, options)
}

function testType(editor, type) {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === type,
  })
   return !!match
}

export function toggleType(editor, type) {
  const isActive = testType(editor, type)
  Transforms.setNodes(
    editor,
    { type: isActive ? null : type },
    { match: n => Editor.isBlock(editor, n) }
  )
}

export const CustomEditor = {
  toggleBold(editor) {
    toggleTextStyle(editor, 'bold')
  },
  toggleItalics(editor) {
    toggleTextStyle(editor, 'italic')
  },
  toggleUnderline(editor) {
    toggleTextStyle(editor, 'underline')
  },
  toggleStrike(editor) {
    toggleTextStyle(editor, 'strike')
  },
  toggleColor(editor) {
    toggleTextStyle(editor, 'color')
  },
  toggleHighlight(editor) {
    toggleTextStyle(editor, 'highlight')
  },
  toggleCode(editor) {
    toggleType(editor, 'code')
  },
}

export const BLOCK_STYLES: Array<{ label: string, value: BlockStyleT }> = [
  {
    label: 'H1',
    value: 'header-one'
  },
  {
    label: 'H2',
    value: 'header-two'
  },
  {
    label: 'H3',
    value: 'header-three'
  },
  {
    label: 'BQ',
    value: 'blockquote'
  },
  {
    label: 'UL',
    value: 'unordered-list-item'
  },
  {
    label: 'OL',
    value: 'ordered-list-item'
  },
  {
    label: 'Section',
    value: 'section'
  },
  {
    label: 'Aside',
    value: 'aside'
  },
]

export const renderLeaf = (props: any) => {
  return <Leaf { ...props } />
}

export const renderElement = (props: any) => {
  switch (props.element.type) {
    case 'code':
      return <CodeElement { ...props } />
    case 'block-quote':
      return <blockquote {...props.attributes}>{props.children}</blockquote>
    case 'bulleted-list':
      return <ul {...props.attributes}>{props.children}</ul>
    case 'heading-one':
      return <h1 {...props.attributes}>{props.children}</h1>
    case 'heading-two':
      return <h2 {...props.attributes}>{props.children}</h2>
    case 'list-item':
      return <li {...props.attributes}>{props.children}</li>
    case 'numbered-list':
      return <ol {...props.attributes}>{props.children}</ol>
    default:
      return <DefaultElement { ...props } />
  }
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  })
  const newProperties = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format) => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  })

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

// @ts-ignore
export const savedState = JSON.parse(localStorage.getItem('content'))

export const defaultState = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

export const keyPressHandler = (editor: any) => (event) => {
  // if (!event.ctrlKey) {
  //   return
  // }
  switch (event.key) {
    case '`': {
      event.preventDefault()
      CustomEditor.toggleCode(editor)
      break
    }
    case 'b': {
      event.preventDefault()
      CustomEditor.toggleBold(editor)
      break
    }
  }
}

export const INLINE_STYLES: Array<{ label: string, fn: (editor: any) => void }> = [
  { label: 'Bold', fn: CustomEditor.toggleBold },
  { label: 'Italic', fn: CustomEditor.toggleItalics },
  { label: 'Underline', fn: CustomEditor.toggleUnderline },
  { label: 'Strike', fn: CustomEditor.toggleStrike },
  { label: 'Code', fn: CustomEditor.toggleCode },
  { label: 'Highlight', fn: CustomEditor.toggleHighlight },
  { label: 'Color', fn: CustomEditor.toggleColor },
]

export const setFontStuff = (editor, key, value) => {
  const props = { [key]: value }
  const options = { match: n => Text.isText(n), split: true }
  Transforms.setNodes(editor, props, options)
}



