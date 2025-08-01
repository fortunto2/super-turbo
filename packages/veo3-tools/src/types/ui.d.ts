declare module "@turbo-super/ui" {
  import { ReactNode, ChangeEvent, FormEvent } from "react";

  // Card components
  export interface CardProps {
    children: ReactNode;
    className?: string;
  }
  export const Card: React.FC<CardProps>;
  export const CardHeader: React.FC<{
    children: ReactNode;
    className?: string;
  }>;
  export const CardTitle: React.FC<{ children: ReactNode; className?: string }>;
  export const CardContent: React.FC<{
    children: ReactNode;
    className?: string;
  }>;

  // Button component
  export interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg";
    disabled?: boolean;
    className?: string;
    title?: string;
  }
  export const Button: React.FC<ButtonProps>;

  // Textarea component
  export interface TextareaProps {
    value?: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    id?: string;
    rows?: number;
    disabled?: boolean;
  }
  export const Textarea: React.FC<TextareaProps>;

  // Label component
  export interface LabelProps {
    children: ReactNode;
    htmlFor?: string;
    className?: string;
  }
  export const Label: React.FC<LabelProps>;

  // Badge component
  export interface BadgeProps {
    children: ReactNode;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
    onClick?: () => void;
  }
  export const Badge: React.FC<BadgeProps>;

  // Tabs components
  export interface TabsProps {
    value?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
    className?: string;
  }
  export const Tabs: React.FC<TabsProps>;
  export const TabsList: React.FC<{ children: ReactNode; className?: string }>;
  export const TabsTrigger: React.FC<{
    value: string;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
  }>;
  export const TabsContent: React.FC<{
    value: string;
    children: ReactNode;
    className?: string;
  }>;

  // Input component
  export interface InputProps {
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    className?: string;
    id?: string;
    disabled?: boolean;
  }
  export const Input: React.FC<InputProps>;
}
