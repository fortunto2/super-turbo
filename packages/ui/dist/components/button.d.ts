import * as React from "react";
import { VariantProps } from "class-variance-authority";
import { ButtonProps } from "@turbo-super/ui";

export interface Props extends ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<{
      variant: {
        default: string;
        destructive: string;
        outline: string;
        secondary: string;
        ghost: string;
        link: string;
        accent: string;
      };
      size: {
        default: string;
        sm: string;
        lg: string;
        icon: string;
      };
    }> {
  asChild?: boolean;
}

export declare const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;