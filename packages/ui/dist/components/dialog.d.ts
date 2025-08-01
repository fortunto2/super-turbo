import * as React from "react";

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export declare const DialogTrigger: React.ForwardRefExoticComponent<
  DialogTriggerProps & React.RefAttributes<HTMLButtonElement>
>;

export interface DialogPortalProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const DialogPortal: React.ForwardRefExoticComponent<
  DialogPortalProps & React.RefAttributes<HTMLDivElement>
>;

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export declare const DialogClose: React.ForwardRefExoticComponent<
  DialogCloseProps & React.RefAttributes<HTMLButtonElement>
>;

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const DialogOverlay: React.ForwardRefExoticComponent<
  DialogOverlayProps & React.RefAttributes<HTMLDivElement>
>;

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const DialogContent: React.ForwardRefExoticComponent<
  DialogContentProps & React.RefAttributes<HTMLDivElement>
>;

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const DialogHeader: React.ForwardRefExoticComponent<
  DialogHeaderProps & React.RefAttributes<HTMLDivElement>
>;

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const DialogFooter: React.ForwardRefExoticComponent<
  DialogFooterProps & React.RefAttributes<HTMLDivElement>
>;

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export declare const DialogTitle: React.ForwardRefExoticComponent<
  DialogTitleProps & React.RefAttributes<HTMLHeadingElement>
>;

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export declare const DialogDescription: React.ForwardRefExoticComponent<
  DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>
>;

export declare const Dialog: React.ForwardRefExoticComponent<
  DialogProps & React.RefAttributes<HTMLDivElement>
>;