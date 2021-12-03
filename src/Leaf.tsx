// @ts-ignore
const Leaf = (props) => {
  let { attributes, children, leaf } = props

  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  const style = {
    textDecoration: leaf.strike && 'line-through',
    backgroundColor: leaf.highlight && 'yellow',
    color: leaf.color && 'red',
    fontSize: leaf.fontSize && leaf.fontSize +'px',
    fontFamily: leaf.fontFamily && leaf.fontFamily,
  }

  return (
    <span className="me-leaf" {...attributes} style={style}>
      {children}
    </span>
  )
}

export default Leaf
