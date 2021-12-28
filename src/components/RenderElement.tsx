import * as SlateReact from "slate-react";

export default function RenderElement(props: SlateReact.RenderElementProps) {
  // Choose a rendering strategy based on the element type,
  // falling back to using a simple `p` tag as the default.
  const elementType = props.element.type as string;
  switch (elementType) {
    case "section":
      return (
        <>
          <span contentEditable={false} className="header" />
          <div className="section" {...props.attributes}>
            {props.children}
          </div>
          <span contentEditable={false} className="footer" />
        </>
      );
    default:
      return (
        <p className={elementType} {...props.attributes}>
          {props.children}
        </p>
      );
  }
}
