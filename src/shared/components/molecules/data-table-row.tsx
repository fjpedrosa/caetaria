import * as React from "react"

import { cn } from "@/lib/utils"

import { Avatar } from "../atoms/avatar"
import { Badge } from "../atoms/badge"
import { Button } from "../atoms/button"

export interface TableAction {
  label: string
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "ghost"
  icon?: React.ReactNode
  disabled?: boolean
}

export interface TableCell {
  key: string
  type?: "text" | "badge" | "avatar" | "actions" | "custom"
  value?: any
  render?: () => React.ReactNode
  className?: string
}

export interface DataTableRowProps extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'onSelect'> {
  cells: TableCell[]
  actions?: TableAction[]
  selected?: boolean
  onSelect?: (selected: boolean) => void
  selectable?: boolean
  hover?: boolean
}

const DataTableRow = React.forwardRef<HTMLTableRowElement, DataTableRowProps>(
  ({ 
    className,
    cells,
    actions = [],
    selected = false,
    onSelect,
    selectable = false,
    hover = true,
    ...props
  }, ref) => {
    const renderCell = (cell: TableCell) => {
      const { type = "text", value, render, className: cellClassName } = cell

      if (render) {
        return (
          <td className={cn("px-4 py-3", cellClassName)} key={cell.key}>
            {render()}
          </td>
        )
      }

      switch (type) {
        case "badge":
          return (
            <td className={cn("px-4 py-3", cellClassName)} key={cell.key}>
              {value && (
                <Badge variant={value.variant || "default"} size={value.size || "sm"}>
                  {value.label || value}
                </Badge>
              )}
            </td>
          )

        case "avatar":
          return (
            <td className={cn("px-4 py-3", cellClassName)} key={cell.key}>
              {value && (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={value.src}
                    fallback={value.fallback || value.name}
                    size="sm"
                    online={value.online}
                  />
                  {value.name && (
                    <div>
                      <div className="font-medium">{value.name}</div>
                      {value.email && (
                        <div className="text-sm text-muted-foreground">{value.email}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </td>
          )

        case "actions":
          return (
            <td className={cn("px-4 py-3", cellClassName)} key={cell.key}>
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "ghost"}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    leftIcon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </td>
          )

        case "text":
        default:
          return (
            <td className={cn("px-4 py-3", cellClassName)} key={cell.key}>
              {typeof value === "object" && value !== null ? (
                <div>
                  <div className="font-medium">{value.primary}</div>
                  {value.secondary && (
                    <div className="text-sm text-muted-foreground">{value.secondary}</div>
                  )}
                </div>
              ) : (
                <span>{value}</span>
              )}
            </td>
          )
      }
    }

    return (
      <tr
        ref={ref}
        className={cn(
          "border-b transition-colors",
          hover && "hover:bg-muted/50",
          selected && "bg-muted",
          className
        )}
        {...props}
      >
        {selectable && (
          <td className="px-4 py-3 w-12">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect?.(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </td>
        )}
        
        {cells.map(renderCell)}
        
        {actions.length > 0 && !cells.some(cell => cell.type === "actions") && (
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "ghost"}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  leftIcon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </td>
        )}
      </tr>
    )
  }
)
DataTableRow.displayName = "DataTableRow"

export { DataTableRow }