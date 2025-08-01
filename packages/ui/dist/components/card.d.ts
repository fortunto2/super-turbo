import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

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