import * as React from "react"

import { cn } from "@/lib/utils"

import { Button } from "../atoms/button"
import { Spinner } from "../atoms/spinner"
import { DataTableRow, type TableAction,type TableCell } from "../molecules/data-table-row"
import { SearchInput } from "../molecules/search-input"

export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  className?: string
  render?: (value: any, row: any) => React.ReactNode
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  selectable?: boolean
  selectedRows?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onRowClick?: (row: T) => void
  getRowId?: (row: T) => string
  getRowActions?: (row: T) => TableAction[]
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (key: string, order: "asc" | "desc") => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  emptyMessage?: string
  className?: string
}

function DataTable<T = any>({
  columns,
  data,
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  getRowId = (row: T) => (row as any).id || String(Math.random()),
  getRowActions = () => [],
  sortBy,
  sortOrder,
  onSort,
  pagination,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<string[]>([])

  // Use controlled or uncontrolled selection
  const currentSelectedRows = selectedRows.length > 0 ? selectedRows : internalSelectedRows
  const handleSelectionChange = onSelectionChange || setInternalSelectedRows

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data
    
    return data.filter((row) =>
      Object.values(row as object).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [data, searchQuery])

  const handleSort = (columnKey: string) => {
    if (!onSort) return
    
    const newOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc"
    onSort(columnKey, newOrder)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredData.map((row) => getRowId(row))
      handleSelectionChange(allIds)
    } else {
      handleSelectionChange([])
    }
  }

  const handleRowSelect = (rowId: string, checked: boolean) => {
    if (checked) {
      handleSelectionChange([...currentSelectedRows, rowId])
    } else {
      handleSelectionChange(currentSelectedRows.filter(id => id !== rowId))
    }
  }

  const isAllSelected = filteredData.length > 0 && 
    filteredData.every((row) => currentSelectedRows.includes(getRowId(row)))
  
  const isSomeSelected = currentSelectedRows.length > 0 && !isAllSelected

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Actions */}
      {searchable && (
        <div className="flex items-center gap-4">
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          
          {selectable && currentSelectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentSelectedRows.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectionChange([])}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                      column.sortable && "cursor-pointer hover:text-foreground",
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <svg
                            className={cn(
                              "h-3 w-3 -mb-1",
                              sortBy === column.key && sortOrder === "asc"
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <svg
                            className={cn(
                              "h-3 w-3",
                              sortBy === column.key && sortOrder === "desc"
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  const rowId = getRowId(row)
                  const isSelected = currentSelectedRows.includes(rowId)
                  
                  // Transform row data to table cells
                  const cells: TableCell[] = columns.map((column) => ({
                    key: column.key,
                    value: column.render ? column.render(row[column.key], row) : row[column.key],
                    className: column.className,
                    type: column.render ? "custom" : "text",
                    render: column.render ? () => column.render!(row[column.key], row) : undefined,
                  }))

                  return (
                    <DataTableRow
                      key={rowId}
                      cells={cells}
                      actions={getRowActions(row)}
                      selected={isSelected}
                      onSelect={(checked) => handleRowSelect(rowId, checked)}
                      selectable={selectable}
                      onClick={() => onRowClick?.(row)}
                      className={onRowClick ? "cursor-pointer" : undefined}
                    />
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{" "}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground px-2">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable }