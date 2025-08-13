import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@turbo-super/ui";
import { ToolIcon } from "./tool-icon";
import { ToolConfig } from "../types";
import { FC } from "react";

interface ToolsGridProps {
  tools: ToolConfig[];
  className?: string;
}

export const ToolsGrid: FC<ToolsGridProps> = ({ tools, className }) => {
  return (
    <div
      className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ""}`}
    >
      {tools.map((tool) => (
        <Link
          key={tool.id}
          href={tool.href}
        >
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div
                  className={`p-4 rounded-full bg-${tool.bgColor} group-hover:bg-${tool.hoverBgColor} transition-colors`}
                >
                  <ToolIcon
                    name={tool.iconName}
                    className={`size-8 text-${tool.primaryColor}`}
                  />
                </div>
              </div>
              <CardTitle className="text-2xl">{tool.name}</CardTitle>
              <CardDescription className="text-base">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                  {tool.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2"
                    >
                      <ToolIcon name={feature.iconName} />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full group-hover:bg-${tool.hoverColor}`}
                  size="lg"
                >
                  <ToolIcon
                    name={tool.iconName}
                    className="size-4 mr-2"
                  />
                  {tool.id === "image-generator"
                    ? "Generate Images"
                    : tool.id === "video-generator"
                      ? "Generate Videos"
                      : "Enhance Prompts"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
