import {
  ColumnsToMap,
  GristType,
  RowRecord,
  WidgetColumnMap,
  onRecord,
  onRecords,
  ready,
} from "grist-plugin-api";
import { BehaviorSubject, map } from "rxjs";

export type InferCellValueFromGristType<T extends GristType> =
  | (T extends "Any"
      ? unknown
      : T extends "Text"
      ? string
      : T extends "Bool"
      ? number
      : T extends "Int"
      ? number
      : T extends "Numeric"
      ? number
      : unknown)
  | null;

export type InferGristRowFromGristColumnDefinitionsMap<
  Columns extends GristColumnDefinitionsMap<string, GristColumnDefinition>
> = Columns extends GristColumnDefinitionsMap<infer Names, infer Columns>
  ? Columns extends GristColumnDefinition<infer Type, infer Optional, boolean>
    ? Optional extends false
      ? { [Name in Names]: InferCellValueFromGristType<Type> }
      : { [Name in Names]?: InferCellValueFromGristType<Type> }
    : never
  : never;

export type GristRow<
  Columns extends GristColumnDefinitionsMap<string, GristColumnDefinition>
> = { id: number } & InferGristRowFromGristColumnDefinitionsMap<Columns>;

export interface GristColumnDefinition<
  Type extends GristType = GristType,
  Optional extends boolean = boolean,
  ReadOnly extends boolean = boolean
> {
  type: Type;
  title?: string;
  description?: string;
  optional?: Optional;
  readOnly?: ReadOnly;
}

export type GristColumnDefinitionsMap<
  Names extends string = string,
  Columns extends GristColumnDefinition = GristColumnDefinition
> = {
  [name in Names]: Columns;
};

export interface GristWidgetOptions<
  Columns extends GristColumnDefinitionsMap = GristColumnDefinitionsMap,
  AccessAllRecords extends boolean = boolean
> {
  /**
   * The columns to request.
   */
  columns: Columns;
  /**
   * Whether to read all records instead of just the selected record.
   */
  accessAllRecords: AccessAllRecords;
}

export class GristWidget<const Options extends GristWidgetOptions> {
  private mappings: WidgetColumnMap | null = null;
  private readonly records: BehaviorSubject<RowRecord[]> = new BehaviorSubject<
    RowRecord[]
  >([]);
  public readonly rows = this.records.pipe(
    map((value) => this.mapRecords(value))
  );

  constructor(public readonly options: Options) {
    this.ready();
    this.listenToOnRecords();
  }

  private ready() {
    const columns: ColumnsToMap = Object.entries(this.options.columns).map(
      ([name, { type, title, description, optional }]) => ({
        name,
        type,
        title,
        description,
        optional,
      })
    );
    const needsWriteAccess = Object.values(this.options.columns).some(
      (column) => !(column.readOnly ?? true)
    );
    ready({
      columns,
      requiredAccess: needsWriteAccess ? "full" : "read table",
    });
  }

  private listenToOnRecords() {
    if (this.options.accessAllRecords) {
      onRecords((data, mappings) => {
        this.mappings = mappings;
        this.records.next(data);
      });
    } else {
      onRecord((data, mappings) => {
        this.mappings = mappings;
        this.records.next(data ? [data] : []);
      });
    }
  }

  private mapRecords(records: RowRecord[]): GristRow<Options["columns"]>[] {
    const mappings = this.mappings;
    if (!mappings) {
      return [];
    }
    return records.map(
      (record) =>
        ({
          id: record.id,
          ...Object.fromEntries(
            Object.entries(mappings).flatMap(([columnName, columnId]) => {
              const possibleColumnIds = columnId
                ? Array.isArray(columnId)
                  ? columnId
                  : [columnId]
                : [];
              for (const columnIdToTest of possibleColumnIds) {
                if (columnIdToTest in record) {
                  return [[columnName, record[columnIdToTest]]];
                }
              }
              return [];
            })
          ),
        } as GristRow<Options["columns"]>)
    );
  }
}
