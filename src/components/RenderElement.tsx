import { usePageLayoutCalculation } from "./../state/PageLayout";
import { RenderElementProps } from "slate-react";

export default function RenderElement(props: RenderElementProps) {
  // Hook into the page layout calculation system.
  // This publishes layout information to the central state,
  // and subscribes to element state that can initiate page splitting.
  usePageLayoutCalculation(props.element);

  const elementType = props.element.type as string;
  switch (elementType) {
    case "section":
      return <Section {...props} />;
    default:
      return (
        <p className={elementType} {...props.attributes}>
          {props.children}
        </p>
      );
  }
}

function Section(props: RenderElementProps) {
  return (
    <>
      <span contentEditable={false} className="header" />
      <div className="section" {...props.attributes}>
        {props.children}
      </div>
      <span contentEditable={false} className="footer" />
    </>
  );
}
