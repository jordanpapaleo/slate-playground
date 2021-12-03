import { BaseEditor, Editor, Transforms, Element as SlateElement } from 'slate'
import { ComboEditor } from './common.types'
import DefaultElement from './DefaultElement'
import CodeElement from './CodeElement'

interface ElementNode {
  children: Node[]
  type: string
  // all other props are my custom values
}

type Options = {
  at?: Location | Span;
  match?: NodeMatch<T>;
  mode?: 'all' | 'highest' | 'lowest';
  universal?: boolean;
  reverse?: boolean;
  voids?: boolean;
}

function testType(editor: BaseEditor, type: string) {
  console.log('editor', editor)
  const options: Options = {
    match: (elementNode: ElementNode) => {
      console.log('elementNode', elementNode)
      return elementNode.type === type
    }
  }
  const [match] = Editor.nodes(editor, options)
  return !!match
}

export function toggleType(editor: ComboEditor, type: string) {
  const isActive = testType(editor, type)
  const props = { type: isActive ? null : type }
  const options = { match: n => Editor.isBlock(editor, n) }
  Transforms.setNodes(editor, props, options)
}

export const ELEMENT_NODES: Array<{
  label: string,
  type: string,
  fn: (editor: ComboEditor, type: string) => void
}> = [
    { label: 'S', type: 'section', fn: toggleType },
    { label: 'SB', type: 'section-break', fn: toggleType },
    { label: 'H1', type: 'h1', fn: toggleType },
    { label: 'H2', type: 'h2', fn: toggleType },
    { label: 'H3', type: 'h3', fn: toggleType },
    { label: 'UL', type: 'ul', fn: toggleType },
    { label: 'OL', type: 'ol', fn: toggleType },
    { label: 'LI', type: 'li', fn: toggleType },
    { label: 'BQ', type: 'block-quote', fn: toggleType },
    { label: 'Code', type: 'code', fn: toggleType },
  ]

export const renderElement = (props: any) => {
  switch (props.element.type) {
    case 'code':
      return <CodeElement { ...props } />
    case 'block-quote':
      return <blockquote { ...props.attributes } > { props.children }</blockquote>
    case 'ul':
      return <ul { ...props.attributes } > { props.children }</ul>
    case 'h1':
      return <h1 { ...props.attributes } > { props.children }</h1>
    case 'h2':
      return <h2 { ...props.attributes } > { props.children }</h2>
    case 'h3':
      return <h3 { ...props.attributes } > { props.children }</h3>
    case 'li':
      return <li { ...props.attributes } > { props.children }</li>
    case 'ol':
      return <ol { ...props.attributes } > { props.children }</ol>
    case 'section':
      return <section className="section" {...props.attributes }> { props.children }</section>
    case 'section-break':
      console.log(props)
      return <section className="section-break" {...props.attributes }> { props.children }</section>
    case 'page':
      return <div className="page" {...props.attributes }> { props.children }</div>
    default:
      return <DefaultElement { ...props } />
  }
}

//
//
//
//

const LIST_TYPES = ['ol', 'ul']

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
    type: isActive ? 'paragraph' : isList ? 'li' : format,
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}
