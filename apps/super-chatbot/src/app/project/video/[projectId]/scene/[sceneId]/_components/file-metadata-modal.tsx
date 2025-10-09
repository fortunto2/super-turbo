'use client';

import { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Music,
} from 'lucide-react';
import type { IFileRead } from '@turbo-super/api';
import { extractFileMetadata } from './file-metadata-utils';

interface FileMetadataModalProps {
  file: IFileRead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FileMetadataModal({
  file,
  isOpen,
  onClose,
}: FileMetadataModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const metadata = extractFileMetadata(file);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const MetadataField = ({
    label,
    value,
    fieldName,
    copyable = true,
    multiline = false,
  }: {
    label: string;
    value: string | number | undefined;
    fieldName: string;
    copyable?: boolean;
    multiline?: boolean;
  }) => {
    if (!value) return null;

    const displayValue = String(value);
    const isCopied = copiedField === fieldName;

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            {label}
          </div>
          {copyable && (
            <button
              onClick={() => copyToClipboard(displayValue, fieldName)}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Copy"
            >
              {isCopied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
        <div
          className={`bg-muted/50 rounded-md p-2 text-sm ${
            multiline ? 'whitespace-pre-wrap' : 'truncate'
          }`}
        >
          {displayValue}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {getTypeIcon(metadata.type)}
            <h2 className="text-lg font-semibold">File metadata</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* General info */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              General info
            </h3>

            <MetadataField label="File ID" value={file.id} fieldName="fileId" />

            <MetadataField
              label="File type"
              value={metadata.type}
              fieldName="fileType"
              copyable={false}
            />

            {metadata.duration && (
              <MetadataField
                label="Duration"
                value={`${metadata.duration}s`}
                fieldName="duration"
                copyable={false}
              />
            )}

            {metadata.width && metadata.height && (
              <MetadataField
                label="Resolution"
                value={`${metadata.width}×${metadata.height}`}
                fieldName="resolution"
                copyable={false}
              />
            )}

            {metadata.aspectRatio && (
              <MetadataField
                label="Aspect ratio"
                value={metadata.aspectRatio}
                fieldName="aspectRatio"
                copyable={false}
              />
            )}
          </div>

          {/* Prompt & generation */}
          {(metadata.prompt || metadata.negativePrompt) && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Prompt & generation
              </h3>

              {metadata.prompt && (
                <MetadataField
                  label="Prompt"
                  value={metadata.prompt}
                  fieldName="prompt"
                  multiline={true}
                />
              )}

              {metadata.negativePrompt && (
                <MetadataField
                  label="Negative prompt"
                  value={metadata.negativePrompt}
                  fieldName="negativePrompt"
                  multiline={true}
                />
              )}

              {metadata.seed && (
                <MetadataField
                  label="Seed"
                  value={metadata.seed}
                  fieldName="seed"
                />
              )}

              {metadata.steps && (
                <MetadataField
                  label="Steps"
                  value={metadata.steps}
                  fieldName="steps"
                  copyable={false}
                />
              )}

              {metadata.shotSize && (
                <MetadataField
                  label="Shot size"
                  value={metadata.shotSize}
                  fieldName="shotSize"
                  copyable={false}
                />
              )}
            </div>
          )}

          {/* Model & config */}
          {(metadata.modelSid ||
            metadata.modelName ||
            metadata.generationConfig ||
            metadata.styleName) && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Model & configuration
              </h3>

              {metadata.modelSid && (
                <MetadataField
                  label="Model SID"
                  value={metadata.modelSid}
                  fieldName="modelSid"
                />
              )}

              {metadata.modelName && (
                <MetadataField
                  label="Model name"
                  value={metadata.modelName}
                  fieldName="modelName"
                />
              )}

              {metadata.generationConfig && (
                <MetadataField
                  label="Generation config"
                  value={metadata.generationConfig}
                  fieldName="generationConfig"
                />
              )}

              {metadata.styleName && (
                <MetadataField
                  label="Style"
                  value={metadata.styleName}
                  fieldName="styleName"
                />
              )}

              {metadata.voiceName && (
                <MetadataField
                  label="Voice"
                  value={metadata.voiceName}
                  fieldName="voiceName"
                />
              )}

              {metadata.audioType && (
                <MetadataField
                  label="Audio type"
                  value={metadata.audioType}
                  fieldName="audioType"
                  copyable={false}
                />
              )}
            </div>
          )}

          {/* References */}
          {metadata.references && metadata.references.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                References
              </h3>

              <div className="space-y-2">
                {metadata.references.map((ref, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                  >
                    {getTypeIcon(ref.type)}
                    <span className="text-sm flex-1 truncate">
                      {ref.name || `Reference ${index + 1}`}
                    </span>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No metadata */}
          {!metadata.prompt &&
            !metadata.modelSid &&
            !metadata.generationConfig && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No metadata available for this file</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
