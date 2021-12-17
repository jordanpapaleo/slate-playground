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

export function toggleType({
  data = {},
  editor,
  type,
}: {
  data?: {},
  editor: ComboEditor,
  type: string,
}) {
  const isActive = testType(editor, type)
  const props = isActive
    ? { data, type: 'p' }
    : { data, type }

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
  const { attributes, children, element } = props

  switch (element.type) {
    case 'code':
      return <CodeElement { ...props } />
    case 'section-page':
      console.log('section-page')
      return <Section className="section" {...props} />
    case 'page':
      return <Page {...props} />
    case 'data-element':
      return <DataElement {...props} />
    case 'columns':
      return <Columns {...props } />
    case 'conditional':
      return <Conditional {...props} />
    default:
      return element.type
        ? <element.type className="test-generic-element" {...attributes}>{children}</element.type>
        : <DefaultElement {...props} />
  }
}

const Conditional = (props) => {
  // const conditions = props.element.data.contitions
  // const [condition, setCondition] = React.useState(conditions[0])

  // const handleClick = (i) => () => {
  //   setCondition(conditions[i])
  // }

  return (
    <div className="conditional">
      {/* <div className="conditions" style={{display: 'flex', flexDirection: 'column'}}>
        {conditions.map(({ label, i }) => (
          <button key={label} onClick={handleClick(i)}>
            {label}
          </button>
        ))}
      </div> */}
      {props.children}
    </div>
  )
}



const Columns = (props) => {
  // https://www.w3schools.com/css/css3_multiple_columns.asp
  const styles = {
    columnCount: 4,
    columnGap: 20,
    columnRule: '1px solid hotpink',
  }

  return (
    <div className="columns" style={styles}>
      {props.children}
    </div>
  )
}

const DataElement = (props) => {
  /*
    needs some tweaking when tying to add data after and to delete
    Editor.deleteBackward(editor, { unit: 'word' })
    probably should not be contentEditable false bc you cant delete it ;p
   */
  const [show, setShow] = React.useState(false)



  return (
    <span
      style={{ userSelect: "none", position: 'relative', backgroundColor: '#eee', padding: '0 3px'}}
      contentEditable={false}
      suppressContentEditableWarning
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

/* Section has Pages */
const Section = (props) => (
  <div
    className={"section-page " + props.className}
    style={props.element.data.style}
  >
    {props.children}
  </div>
)

const Page = (props) => {
  // console.log('page', props)
  return (
  <main
    style={props.element.data.style}
    className='page'
  >
    {/* {props.element.header && (
      <Header {...props.element.header} />
    )} */}

    {props.children}

    {/* {props.element.footer && (
      <Footer {...props.element.footer} />
    )} */}
  </main>
)}

const Header = (props) => {
  console.log('header', props)
  return (
    <header>
      {props.children}
    </header>
  )
}

const Footer = (props) => {
  console.log('footer', props)
  return (
    <footer>
      {props.children}
    </footer>
  )
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
