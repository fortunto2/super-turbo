import * as React from "react";
import { VariantProps } from "class-variance-authority";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<any> {}

export declare const Badge: React.ForwardRefExoticComponent<
  BadgeProps & React.RefAttributes<HTMLDivElement>
>;