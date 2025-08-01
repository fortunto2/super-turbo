import React from "react";
import { ToolsGrid } from "./tools-grid";
import { TOOLS_CONFIG } from "../config/tools-config";

interface ToolsPageProps {
  title?: string;
  description?: string;
  className?: string;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({
  title = "AI Tools",
  description = "Powerful AI-powered tools for generating high-quality images, videos, and enhancing your prompts. Choose the tool that fits your creative needs.",
  className = "",
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main content */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Tools grid */}
          <ToolsGrid
            tools={TOOLS_CONFIG}
            className="mt-12"
          />

          {/* Footer info */}
          <div className="text-center text-sm text-muted-foreground border-t pt-8 mt-12">
            <p>
              Powered by <strong>SuperDuperAI</strong> • State-of-the-art AI
              models for creative content generation • Fast, reliable, and
              high-quality results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
