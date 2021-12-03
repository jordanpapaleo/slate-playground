import { Transforms, Element, Editor, Text } from 'slate'
import { ReactEditor } from 'slate-react'
import { RenderElementProps } from 'slate-react'

export const LIST_TYPES = ['numbered-list', 'bulleted-list']
export const HEADING_TYPES = ['h1', 'h2', 'h3']

interface ToolbarBlockProps {
  type: string
  renderBlock: (props: RenderElementProps) => React.ReactElement
}

export const blocks: ToolbarBlockProps[] = [
  {
    type: 'page',
    renderBlock: ({ attributes, children }: RenderElementProps) => (
      <div className="page" {...attributes} style={{
        background: '#eee',
        height: '11in', // TODO: CUSTOM
        padding: '1in',
        position: 'relative',
        width: '8.5in', // TODO: CUSTOM
      }}>
        {children}
      </div>
    )
  },
  {
    type: 'section',
    renderBlock: ({ attributes, children }: RenderElementProps) => (
      <div className="section" {...attributes} style={{
        // TODO: CUSTOM
        marginBottom: '0in',
        marginLeft: '0in',
        marginRight: '0in',
        marginTop: '0in',
      }}>
        {children}
      </div>
    )
  }
]

const EMPTY_PAGE = {
  type: 'page',
  children: [{
    // type: 'section',
    // children: [{
      type: 'paragraph',
      children: [{
        type: 'text',
        text: 'here is some text'
      }]
    // }]
  }]
}

function withCustomNormalize(editor: ReactEditor) {
  const { normalizeNode } = editor
  console.log('normalizeNode', normalizeNode)

  editor.normalizeNode = (entry) => {
    console.log('entry', entry)
    const [node, path] = entry


    if (Text.isText(node)) return normalizeNode(entry)

    // if the node is Page
    // @ts-ignore
    if (Element.isElement(node) && node.type === 'page') {
      let PageNode;
      //afaik pageNode if inserted as new page is not available here as a dom node because it hasnt rendered yet
      try {
        PageNode = ReactEditor.toDOMNode(editor, node)
      } catch (e) {
        return
        // return normalizeNode(entry)
      }

      const style = window.getComputedStyle(PageNode)
      const computedHeight = PageNode.offsetHeight
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      let pageHeight = computedHeight - padding
      let CurrentpageHeight = 0
      const children = Array.from(PageNode.children)

      children.forEach((child) => {
        const childStyles = window.getComputedStyle(child)
        const computedChildHeight = child.clientHeight
        const childMargin = parseFloat(childStyles.marginTop) + parseFloat(childStyles.marginBottom)
        const childPadding = parseFloat(childStyles.paddingBottom) + parseFloat(childStyles.paddingTop)
        const childBorder = parseFloat(childStyles.borderLeftWidth) + parseFloat(childStyles.borderRightWidth) + parseFloat(childStyles.borderTopWidth) + parseFloat(childStyles.borderBottomWidth)

        const childHeight = computedChildHeight + childMargin + childPadding + childBorder

        CurrentpageHeight = CurrentpageHeight + childHeight

        if (CurrentpageHeight > pageHeight) {
          Transforms.liftNodes(editor)
          Transforms.splitNodes(editor)
          // Transforms.wrapNodes(editor, EMPTY_PAGE)
        }
      })
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    return normalizeNode(entry)
  }

  return editor
}

export default withCustomNormalize

/*
  const isBlockActive = (editor: ReactEditor, type: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n: any) => n.type === type
  })

  return !!match
}

const toggleBlock = (editor: ReactEditor, type: string) => {
  const isActive = isBlockActive(editor, type)
  const isList = LIST_TYPES.includes(type)

  Transforms.unwrapNodes(editor, {
    match: n => {
      return LIST_TYPES.includes(n.type as string)
    },
    split: true
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : type
  })

  if (!isActive && isList) {
    const block = { type: type, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

*/


/*
    {
      type: 'h1',
      title: 'Heading 1',
      icon: <strong>H1</strong>,
      renderBlock: (props: RenderElementProps) => <H1 {...props} />
    },
    {
      type: 'h2',
      title: 'Heading 2',
      icon: <strong>H2</strong>,
      renderBlock: (props: RenderElementProps) => <H2 {...props} />
    },
    {
      type: 'h3',
      title: 'Heading 1',
      icon: <strong>H3</strong>,
      renderBlock: (props: RenderElementProps) => <H3 {...props} />
    },
    {
      type: 'numbered-list',
      title: 'Heading 1',
      icon: <OrderedListOutlined />,
      renderBlock: (props: RenderElementProps) => (
        <ol {...props.attributes}>{props.children}</ol>
      )
    },
    {
      type: 'list-item',
      title: 'list Item',
      icon: <OrderedListOutlined />,
      isHiddenInToolbar: true,
      renderBlock: ({ attributes, children }: RenderElementProps) => (
        <li {...attributes}>{children}</li>
      )
    },
    {
      type: 'bulleted-list',
      title: 'Bullet List',
      icon: <UnorderedListOutlined />,
      renderBlock: (props: RenderElementProps) => (
        <ul {...props.attributes}>{props.children}</ul>
      )
    }
  */
