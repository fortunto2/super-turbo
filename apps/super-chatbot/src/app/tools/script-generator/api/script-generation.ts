import { API_NEXT_ROUTES } from '@/lib/config/next-api-routes';

export interface ScriptGenerationParams {
  prompt: string;
  scriptType?: 'video' | 'presentation' | 'story' | 'dialogue' | 'narrative';
  length?: 'short' | 'medium' | 'long';
  tone?: 'formal' | 'casual' | 'professional' | 'creative' | 'educational';
  targetAudience?: string;
  includeStructure?: boolean;
}

export interface ScriptGenerationResult {
  success: boolean;
  script?: string;
  scriptType?: string;
  length?: string;
  tone?: string;
  targetAudience?: string;
  structure?: any;
  error?: string;
}

export async function generateScriptApi(
  params: ScriptGenerationParams,
): Promise<ScriptGenerationResult> {
  try {
    const payload = {
      prompt: params.prompt,
      scriptType: params.scriptType || 'video',
      length: params.length || 'medium',
      tone: params.tone || 'professional',
      targetAudience: params.targetAudience || 'general audience',
      includeStructure: params.includeStructure || true,
    };

    const response = await fetch(API_NEXT_ROUTES.GENERATE_SCRIPT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error:
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Script generation failed',
      };
    }

    return {
      success: true,
      script: result.script,
      scriptType: result.scriptType,
      length: result.length,
      tone: result.tone,
      targetAudience: result.targetAudience,
      structure: result.structure,
    };
  } catch (error) {
    console.error('Script generation API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
