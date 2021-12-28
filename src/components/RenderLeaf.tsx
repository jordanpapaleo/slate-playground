import * as SlateReact from "slate-react";

export default function RenderLeaf(props: SlateReact.RenderLeafProps) {
  let { attributes, children, leaf: basicLeaf } = props;

  const leaf = basicLeaf as any; // TODO: a specific interface

  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.code) children = <code>{children}</code>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;

  const style = {
    textDecoration: leaf.strike && "line-through",
    backgroundColor: leaf.highlight && "#ffeeba",
    color: leaf.color && "red",
    fontSize: leaf.fontSize && leaf.fontSize + "px",
    fontFamily: leaf.fontFamily && leaf.fontFamily,
  };

  return (
    <span
      className="me-leaf"
      {...attributes}
      style={style}
      {...(leaf.highlight && { "data-cy": "search-highlighted" })}
    >
      {children}
    </span>
  );
}
