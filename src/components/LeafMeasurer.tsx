import * as SlateReact from "slate-react";

import { usePageLayoutMeasurement } from "./../state/PageLayout";

interface LeafMeasurerProps extends SlateReact.RenderLeafProps {
  renderLeaf: (props: SlateReact.RenderLeafProps) => JSX.Element;
}

export default function LeafMeasurer(props: LeafMeasurerProps) {
  // Hook into the page layout calculation system.
  // This publishes relevant measurement information to the central state.
  usePageLayoutMeasurement(props.text as any); // TODO: no `as any`

  return props.renderLeaf(props);
}
