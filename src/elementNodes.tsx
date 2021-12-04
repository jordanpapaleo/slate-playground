import React from 'react'
import { Editor, Transforms, Element as SlateElement } from 'slate'
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

function testType(editor: ComboEditor, type: string) {
  const options: Options = {
    match: (elementNode: ElementNode) => {
      return elementNode.type === type
    }
  }

  // @ts-ignore match is a ElementNode
  const [match] = Editor.nodes(editor, options)
  return !!match
}

export function toggleType(editor: ComboEditor, type: string) {
  const isActive = testType(editor, type)
  const props = { type: isActive ? 'paragraph' : type }
  // @ts-ignore
  const options = { match: (n) => Editor.isBlock(editor, n) }
  // @ts-ignore
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
  console.log('props.element', props.element)

  switch (props.element.type) {
    case 'code':
      return <CodeElement { ...props } />
    case 'block-quote':
      return <blockquote { ...props.attributes }>{ props.children }</blockquote>
    case 'ul':
      return <ul { ...props.attributes }>{ props.children }</ul>
    case 'h1':
      return <h1 { ...props.attributes }>{ props.children }</h1>
    case 'h2':
      return <h2 { ...props.attributes }>{ props.children }</h2>
    case 'h3':
      return <h3 { ...props.attributes }>{ props.children }</h3>
    case 'li':
      return <li { ...props.attributes }>{ props.children }</li>
    case 'ol':
      return <ol { ...props.attributes }>{ props.children }</ol>
    case 'table':
      return <table { ...props.attributes }>{ props.children }</table>
    case 'table':
      return <table { ...props.attributes }>{ props.children }</table>
    case 'tr':
      return <tr { ...props.attributes }>{ props.children }</tr>
    case 'td':
      return <td { ...props.attributes }>{ props.children }</td>
    case 'section':
      return <Section className="section" {...props} />
    case 'section-break':
      return <Section className="section-break" {...props} />
    case 'page':
      return <Page {...props} />
    case 'data-element':
      return <DataElement {...props} />
    default:
      return <DefaultElement { ...props } />
  }
}

const DataElement = (props) => {
  /*
    needs some tweaking when tying to add data after and to delete
   */
  const [show, setShow] = React.useState(false)

  return (
    <span
      style={{ userSelect: "none", position: 'relative', backgroundColor: '#eee', padding: '0 3px'}}
      contentEditable={false}
      onMouseEnter={() => { setShow(true) }}
      onMouseOut={() => { setShow(false) }}
    >
      {props.children}

      {show && (<span
        style={{
          position: 'absolute',
          left: 0,
          bottom: -30,
          padding: 5,
          width: 150,
          color: 'white',
          background: '#111'
        }}
      >{props.element.data.tooltip}</span>)}
    </span>
  )
}

const Section = (props) => (
  <section
    className={props.className}
    style={props.element.data.style}
  >
    {props.children}
  </section>
)

const Page = (props) => (
  <main style={props.element.data.style} className='page'>
    {props.children}
  </main>
)

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
