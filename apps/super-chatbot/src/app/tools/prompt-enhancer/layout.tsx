import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Prompt Enhancer - Tool',
  description:
    'Transform your prompts with AI enhancement. Supports both general enhancement and VEO3 structured video prompts.',
};

export default function PromptEnhancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">{children}</div>
  );
}
