import * as React from "react";

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface SheetTriggerProps {
  asChild?: boolean;
  children?: React.ReactNode;
}

export interface SheetContentProps {
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  children?: React.ReactNode;
}

export interface SheetHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SheetFooterProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SheetTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SheetDescriptionProps {
  className?: string;
  children?: React.ReactNode;
}

export const Sheet: React.FC<SheetProps>;
export const SheetTrigger: React.FC<SheetTriggerProps>;
export const SheetContent: React.FC<SheetContentProps>;
export const SheetHeader: React.FC<SheetHeaderProps>;
export const SheetFooter: React.FC<SheetFooterProps>;
export const SheetTitle: React.FC<SheetTitleProps>;
export const SheetDescription: React.FC<SheetDescriptionProps>;
export const SheetClose: React.FC<{ children?: React.ReactNode }>;
export const SheetPortal: React.FC<{ children?: React.ReactNode }>;
export const SheetOverlay: React.FC<{ className?: string }>;