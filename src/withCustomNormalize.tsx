import { Transforms, Element, Text } from 'slate'
import { ReactEditor } from 'slate-react'
import cloneDeep from 'lodash/cloneDeep'

/*
  https://docs.slatejs.org/concepts/11-normalizing
  "Normalizing" is how you can ensure that your editor's content is always
  of a certain shape. It's similar to "validating", except instead of just
  determining whether the content is valid or invalid, its job is to fix
  the content to make it valid again.
*/

/*
  THIS ONLY HAPPENS ON CHANGE NOT ON LOAD
  This can be used to determine overflow to
  the next page on change.
*/
function withCustomNormalize(editor: ReactEditor) {
  console.log('withCustomNormalize')
  const { normalizeNode } = editor

  editor.normalizeNode = (entry) => {
    const [node, path] = entry

    if (Text.isText(node)) return normalizeNode(entry)
    if (Element.isElement(node) && node.type === 'page') {
      let PageNode

      try {
        PageNode = ReactEditor.toDOMNode(editor, node)
      } catch (e) {
        console.log('IGNORE ME', e)
        return normalizeNode(entry)
      }


      let currentPageHeight = 0
      const pageHeight = getPageHeight(PageNode)
      console.log('pageHeight', pageHeight)
      const children = Array.from(PageNode.children)
      console.log('children', children)

      children.forEach((child) => {
        const childHeight = getChildHeight(child)
        console.log('childHeight', childHeight)
        currentPageHeight = currentPageHeight + childHeight
        console.log('currentPageHeight', currentPageHeight)

        if (currentPageHeight > pageHeight) {
          const emptyPage = {
            type: 'page',
            data: cloneDeep(node.data), // pass props to page for w, h, margins
            children: []
          }

          Transforms.liftNodes(editor, {
            // at?: Location | undefined;
            // match?: NodeMatch<Node> | undefined;
            // mode?: "all" | ... 2 more ... | undefined;
            // voids?: boolean | undefined;
          })

          // Split nodes at the specified location. If no location is specified, split the selection.
          Transforms.splitNodes(editor)
          // console.log('PageNode.dataset.element', PageNode.dataset.element)
          // const elementData = JSON.parse(PageNode.dataset.element)
          // console.log('elementData', elementData)
          // emptyPage.data = elementData
          // Wrap nodes at the specified location in the element container.
          // If no location is specified, wrap the selection.
          Transforms.wrapNodes(editor, emptyPage)
        }
      })
    }
    // Fall back to the original `normalizeNode` to enforce other constraints.
    return normalizeNode(entry)
  }

  return editor
}

export default withCustomNormalize

const getChildStyles = (childStyles) => ({
  borderBottomWidth: childStyles.borderBottomWidth,
  borderLeftWidth: childStyles.borderLeftWidth,
  borderRightWidth: childStyles.borderRightWidth,
  borderTopWidth: childStyles.borderTopWidth,
  marginBottom: childStyles.marginBottom,
  marginTop: childStyles.marginTop,
  paddingBottom: childStyles.paddingBottom,
  paddingTop: childStyles.paddingTop,
})

const getPageHeight = (PageNode): number => {
  const style = window.getComputedStyle(PageNode)
  const computedHeight = PageNode.offsetHeight
  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)

  let pageHeight = computedHeight - padding
  return pageHeight
}

const getChildHeight = (child): number => {
  const childStyles = window.getComputedStyle(child)

  const {
    marginTop,
    marginBottom,
    paddingBottom,
    paddingTop,
    borderLeftWidth,
    borderRightWidth,
    borderTopWidth,
    borderBottomWidth,
  } = getChildStyles(childStyles)


  const computedChildHeight = child.clientHeight
  const childMargin = parseFloat(marginTop) + parseFloat(marginBottom)
  const childPadding = parseFloat(paddingBottom) + parseFloat(paddingTop)
  const childBorder = parseFloat(borderLeftWidth) +
    parseFloat(borderRightWidth) +
    parseFloat(borderTopWidth) +
    parseFloat(borderBottomWidth)

  const childHeight = computedChildHeight + childMargin + childPadding + childBorder
  return childHeight
}

/*
  export const LIST_TYPES = ['numbered-list', 'bulleted-list']
  export const HEADING_TYPES = ['h1', 'h2', 'h3']

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
