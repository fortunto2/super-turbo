'use client';

import { Suspense } from 'react';
import { PromptEnhancerForm } from './prompt-enhancer-form';
import { EnhancementResult } from './enhancement-result';
import { usePromptEnhancer } from '../hooks/use-prompt-enhancer';

// AICODE-NOTE: Main page component for standalone prompt enhancer tool
export function PromptEnhancer() {
  const {
    isEnhancing,
    enhancementResult,
    enhancePrompt,
    clearResult,
    copyToClipboard,
  } = usePromptEnhancer();

  return (
    <div className="space-y-8">
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Input Form */}
        <div className="space-y-6">
          <Suspense fallback={<div>Loading form...</div>}>
            <PromptEnhancerForm
              onEnhance={enhancePrompt}
              isEnhancing={isEnhancing}
            />
          </Suspense>
        </div>

        {/* Right column - Results */}
        <div className="space-y-6">
          <Suspense fallback={<div>Loading results...</div>}>
            <EnhancementResult
              result={enhancementResult}
              isEnhancing={isEnhancing}
              onClear={clearResult}
              onCopy={copyToClipboard}
            />
          </Suspense>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          💡 Enhancement Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">For Images:</h4>
            <ul className="space-y-1">
              <li>
                • Use &quot;detailed&quot; level for professional photography
                terms
              </li>
              <li>
                • Try &quot;creative&quot; level for artistic and composition
                guidance
              </li>
              <li>
                • Specify model hints like &quot;FLUX&quot; or
                &quot;Imagen&quot; for optimization
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">For Videos:</h4>
            <ul className="space-y-1">
              <li>
                • Use &quot;Sora&quot; or &quot;VEO2&quot; model hints for best
                results
              </li>
              <li>• &quot;detailed&quot; level adds cinematography terms</li>
              <li>• Include negative prompts to avoid unwanted elements</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-sm text-gray-500 border-t pt-8">
        <p>
          Powered by <strong>AI SDK</strong> • Uses the same language models as
          the main chatbot • Enhanced prompts improve generation quality across
          all AI models
        </p>
      </div>
    </div>
  );
}
