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
import { VariantProps } from "class-variance-authority";
import { BadgeProps } from "@turbo-super/ui";

export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLDivElement>>;`;

fs.writeFileSync(path.join(componentsDir, 'badge.d.ts'), badgeContent);

// Создаем button.d.ts
const buttonContent = `import * as React from "react";
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
>;`;

fs.writeFileSync(path.join(componentsDir, 'button.d.ts'), buttonContent);

// Создаем card.d.ts
const cardContent = `import * as React from "react";

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
>;`;

fs.writeFileSync(path.join(componentsDir, 'card.d.ts'), cardContent);

console.log('Type files restored successfully!'); 