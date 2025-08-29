"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

// Simple HTML select implementation for compatibility
interface SelectProps {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Select: React.FC<SelectProps> = ({ children, onValueChange, defaultValue, value }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  }, [value, onValueChange]);
  
  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      {children}
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ className, children }, ref) => {
    return (
      <div className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
        className
      )}>
        {children}
      </div>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  return (
    <span className={cn(
      "block truncate",
      !value && "text-gray-500"
    )}>
      {value || placeholder}
    </span>
  );
};

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const { value, onValueChange } = React.useContext(SelectContext);
  
  return (
    <select
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      <option value="" disabled>
        Select an option...
      </option>
      {children}
    </select>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return (
    <option value={value}>
      {children}
    </option>
  );
};

const SelectGroup = React.Fragment;
const SelectLabel = React.Fragment;
const SelectSeparator = React.Fragment;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

