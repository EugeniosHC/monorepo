"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconPlus,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Badge } from "@eugenios/ui/components/badge";
import { Button } from "@eugenios/ui/components/button";
import { Checkbox } from "@eugenios/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@eugenios/ui/components/dropdown-menu";
import { Input } from "@eugenios/ui/components/input";
import { Label } from "@eugenios/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@eugenios/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@eugenios/ui/components/table";

// Types para configuração do componente
export interface DataTableAction<TData = any> {
  label: string;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

export interface DataTableColumn<TData = any> {
  key: keyof TData | string;
  header: string;
  type?: "text" | "badge" | "editable" | "select" | "custom";
  render?: (value: any, row: TData) => React.ReactNode;
  options?: { label: string; value: string }[];
  sortable?: boolean;
  filterable?: boolean;
  hideable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableConfig<TData = any> {
  columns: DataTableColumn<TData>[];
  actions?: DataTableAction<TData>[];
  enableDragAndDrop?: boolean;
  enableSelection?: boolean;
  enablePagination?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  onDataChange?: (data: TData[]) => void;
  onSelectionChange?: (selection: TData[]) => void;
  addButtonLabel?: string;
  onAddClick?: () => void;
}

// Componente para drag handle
function DragHandle({ id }: { id: string | number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Componente para linha arrastável
function DraggableRow<TData>({ row, children }: { row: Row<TData>; children: React.ReactNode }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: (row.original as any).id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {children}
    </TableRow>
  );
}

// Componente para célula editável
function EditableCell({
  value,
  onSave,
  type = "text",
  options = [],
  rowId,
  columnKey,
}: {
  value: any;
  onSave: (value: any) => void;
  type?: "text" | "select";
  options?: { label: string; value: string }[];
  rowId: string | number;
  columnKey: string;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newValue = formData.get(columnKey);

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          onSave(newValue);
          resolve(newValue);
        }, 1000);
      }),
      {
        loading: "Saving...",
        success: "Saved successfully",
        error: "Error saving",
      }
    );
  };

  if (type === "select") {
    return (
      <Select defaultValue={value?.toString()} onValueChange={onSave}>
        <SelectTrigger className="w-38">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor={`${rowId}-${columnKey}`} className="sr-only">
        {columnKey}
      </Label>
      <Input
        className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
        defaultValue={value?.toString() || ""}
        name={columnKey}
        id={`${rowId}-${columnKey}`}
      />
    </form>
  );
}

export function ReusableDataTable<TData extends Record<string, any> & { id: string | number }>({
  data: initialData,
  config,
}: {
  data: TData[];
  config: DataTableConfig<TData>;
}) {
  const [data, setData] = React.useState<TData[]>(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: config.pageSize || 10,
  });

  const sortableId = React.useId();
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

  // Criar colunas dinamicamente
  const columns = React.useMemo<ColumnDef<TData>[]>(() => {
    const cols: ColumnDef<TData>[] = [];

    // Coluna de drag (se habilitado)
    if (config.enableDragAndDrop) {
      cols.push({
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
        size: 40,
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Coluna de seleção (se habilitado)
    if (config.enableSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Colunas de dados
    config.columns.forEach((column) => {
      cols.push({
        accessorKey: column.key as keyof TData,
        header: column.header,
        cell: ({ row, getValue }) => {
          const value = getValue();

          // Renderização customizada
          if (column.render) {
            return column.render(value, row.original);
          }

          // Tipos de célula
          switch (column.type) {
            case "badge":
              return (
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                  {value?.toString()}
                </Badge>
              );

            case "editable":
              return (
                <EditableCell
                  value={value}
                  onSave={(newValue) => {
                    const newData = data.map((item) =>
                      item.id === row.original.id ? { ...item, [column.key]: newValue } : item
                    );
                    setData(newData);
                    config.onDataChange?.(newData);
                  }}
                  rowId={row.original.id}
                  columnKey={column.key as string}
                />
              );

            case "select":
              return (
                <EditableCell
                  value={value}
                  type="select"
                  options={column.options || []}
                  onSave={(newValue) => {
                    const newData = data.map((item) =>
                      item.id === row.original.id ? { ...item, [column.key]: newValue } : item
                    );
                    setData(newData);
                    config.onDataChange?.(newData);
                  }}
                  rowId={row.original.id}
                  columnKey={column.key as string}
                />
              );

            default:
              return value?.toString() || "";
          }
        },
        enableSorting: column.sortable ?? true,
        enableHiding: column.hideable ?? true,
        size: column.width ? parseInt(column.width) : undefined,
      });
    });

    // Coluna de ações (se houver)
    if (config.actions && config.actions.length > 0) {
      cols.push({
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {config.actions?.map((action, index) => (
                <React.Fragment key={index}>
                  {action.separator && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => action.onClick(row.original)}
                    className={action.variant === "destructive" ? "text-destructive" : ""}
                  >
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
      });
    }

    return cols;
  }, [config, data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: config.enableSelection ?? false,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (config.onSelectionChange) {
        const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
        const selectedRows = Object.keys(newSelection)
          .map((id) => data.find((item) => item.id.toString() === id))
          .filter(Boolean) as TData[];
        config.onSelectionChange(selectedRows);
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    if (!config.enableDragAndDrop) return;

    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prevData) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        const newData = arrayMove(prevData, oldIndex, newIndex);
        config.onDataChange?.(newData);
        return newData;
      });
    }
  }

  // Atualizar dados quando props mudam
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const tableContent = (
    <Table>
      <TableHeader className="bg-muted sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          config.enableDragAndDrop ? (
            <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
              {table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} row={row}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </DraggableRow>
              ))}
            </SortableContext>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          )
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="w-full flex-col justify-start gap-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between  mb-4">
        <div />
        <div className="flex items-center gap-2">
          {config.enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {config.onAddClick && (
            <Button variant="outline" size="sm" onClick={config.onAddClick}>
              <IconPlus />
              <span className="hidden lg:inline">{config.addButtonLabel || "Add Item"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="relative flex flex-col gap-4 overflow-auto ">
        <div className="overflow-hidden rounded-lg border">
          {config.enableDragAndDrop ? (
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              {tableContent}
            </DndContext>
          ) : (
            tableContent
          )}
        </div>

        {/* Paginação */}
        {config.enablePagination && (
          <div className="flex items-center justify-between px-4">
            {config.enableSelection && (
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                selected.
              </div>
            )}
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-20" id="rows-per-page">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
