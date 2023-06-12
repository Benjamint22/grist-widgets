import "grist-plugin-api";
import { GristRow, GristWidget, GristWidgetOptions } from "./api/grist-widget";
import { useObservable } from "./utils/hooks";

export type {
  GristWidgetOptions,
  GristRow,
  GristColumnDefinition,
  GristColumnDefinitionsMap,
  InferCellValueFromGristType,
  InferGristRowFromGristColumnDefinitionsMap,
} from "./api/grist-widget";
export type { GristType } from "grist-plugin-api";

function createRowsHook<const Options extends GristWidgetOptions>(
  widget: GristWidget<Options>
) {
  return () => {
    const rows = useObservable(widget.rows, []);
    const hookValue = widget.options.accessAllRecords
      ? { rows }
      : rows.length
      ? { row: rows[0] }
      : {};
    return hookValue as Options["accessAllRecords"] extends true
      ? { rows: GristRow<Options["columns"]>[] }
      : Options["accessAllRecords"] extends false
      ? { row?: GristRow<Options["columns"]> }
      : typeof hookValue;
  };
}

export function initializeGristWidget<const Options extends GristWidgetOptions>(
  options: Options
) {
  const widget = new GristWidget(options);
  const useGristRows = createRowsHook(widget);
  return { useGristRows };
}
