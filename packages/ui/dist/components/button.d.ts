import * as React from "react";
import { VariantProps } from "class-variance-authority";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<any> {
  asChild?: boolean;
}

export declare const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;