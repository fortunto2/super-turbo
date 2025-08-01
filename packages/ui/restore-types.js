const fs = require('fs');
const path = require('path');

console.log('Restoring type files...');

// Создаем index.d.ts
const indexContent = `export * from "./components/badge";
export * from "./components/button";
export * from "./components/card";
export * from "./components/input";
export * from "./components/label";
export * from "./components/separator";
export * from "./components/skeleton";
export * from "./components/tabs";
export * from "./components/textarea";
export * from "./components/dialog";
export * from "./lib/utils";`;

fs.writeFileSync(path.join(__dirname, 'dist', 'index.d.ts'), indexContent);

// Создаем папку components если её нет
const componentsDir = path.join(__dirname, 'dist', 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// Создаем badge.d.ts
const badgeContent = `import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLDivElement>>;`;

fs.writeFileSync(path.join(componentsDir, 'badge.d.ts'), badgeContent);

// Создаем button.d.ts
const buttonContent = `import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export declare const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;`;

fs.writeFileSync(path.join(componentsDir, 'button.d.ts'), buttonContent);

// Создаем card.d.ts
const cardContent = `import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>;
export declare const CardHeader: React.ForwardRefExoticComponent<
  CardHeaderProps & React.RefAttributes<HTMLDivElement>
>;
export declare const CardTitle: React.ForwardRefExoticComponent<
  CardTitleProps & React.RefAttributes<HTMLHeadingElement>
>;
export declare const CardContent: React.ForwardRefExoticComponent<
  CardContentProps & React.RefAttributes<HTMLDivElement>
>;
export declare const CardDescription: React.ForwardRefExoticComponent<
  CardDescriptionProps & React.RefAttributes<HTMLDivElement>
>;`;

fs.writeFileSync(path.join(componentsDir, 'card.d.ts'), cardContent);

// Создаем input.d.ts
const inputContent = `import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export declare const Input: React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<HTMLInputElement>
>;`;

fs.writeFileSync(path.join(componentsDir, 'input.d.ts'), inputContent);

// Создаем label.d.ts
const labelContent = `import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export declare const Label: React.ForwardRefExoticComponent<
  LabelProps & React.RefAttributes<HTMLLabelElement>
>;`;

fs.writeFileSync(path.join(componentsDir, 'label.d.ts'), labelContent);

// Создаем separator.d.ts
const separatorContent = `import * as React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

export declare const Separator: React.ForwardRefExoticComponent<
  SeparatorProps & React.RefAttributes<HTMLDivElement>
>;`;

fs.writeFileSync(path.join(componentsDir, 'separator.d.ts'), separatorContent);

// Создаем skeleton.d.ts
const skeletonContent = `import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const Skeleton: React.ForwardRefExoticComponent<
  SkeletonProps & React.RefAttributes<HTMLDivElement>
>;`;

fs.writeFileSync(path.join(componentsDir, 'skeleton.d.ts'), skeletonContent);

// Создаем tabs.d.ts
const tabsContent = `import * as React from "react";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const TabsList: React.ForwardRefExoticComponent<
  TabsListProps & React.RefAttributes<HTMLDivElement>
>;

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  variant?: "default" | "primary" | "accent";
}

export declare const TabsTrigger: React.ForwardRefExoticComponent<
  TabsTriggerProps & React.RefAttributes<HTMLButtonElement>
>;

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export declare const TabsContent: React.ForwardRefExoticComponent<
  TabsContentProps & React.RefAttributes<HTMLDivElement>
>;

export declare const Tabs: React.ForwardRefExoticComponent<
  TabsProps & React.RefAttributes<HTMLDivElement>
>;`;

fs.writeFileSync(path.join(componentsDir, 'tabs.d.ts'), tabsContent);

// Создаем textarea.d.ts
const textareaContent = `import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "primary" | "accent";
}

export declare const Textarea: React.ForwardRefExoticComponent<
  TextareaProps & React.RefAttributes<HTMLTextAreaElement>
>;`;

fs.writeFileSync(path.join(componentsDir, 'textarea.d.ts'), textareaContent);

// Создаем dialog.d.ts
const dialogContent = `import * as React from "react";

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
>;`;

fs.writeFileSync(path.join(componentsDir, 'dialog.d.ts'), dialogContent);

// Создаем папку lib если её нет
const libDir = path.join(__dirname, 'dist', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Создаем utils.d.ts
const utilsContent = `import { ClassValue } from "clsx";

export declare function cn(...inputs: ClassValue[]): string;`;

fs.writeFileSync(path.join(libDir, 'utils.d.ts'), utilsContent);

console.log('Type files restored successfully!'); 