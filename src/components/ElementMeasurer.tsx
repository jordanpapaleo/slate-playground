import * as SlateReact from "slate-react";

import { usePageLayoutMeasurement } from "./../state/PageLayout";

interface ElementMeasurerProps extends SlateReact.RenderElementProps {
  renderElement: (props: SlateReact.RenderElementProps) => JSX.Element;
}

export default function ElementMeasurer(props: ElementMeasurerProps) {
  // Hook into the page layout calculation system.
  // This publishes relevant measurement information to the central state.
  usePageLayoutMeasurement(props.element);

  return props.renderElement(props);
}
