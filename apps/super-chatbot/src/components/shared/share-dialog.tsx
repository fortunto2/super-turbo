'use client';

import { useState } from 'react';
import { Button } from '@turbo-super/ui';
import { Share2, Copy, Check } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
};

export const ShareDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [copied, setCopied] = useState(false);

  // URL for sharing - project preview page
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/project/video/${projectId}/preview`
      : `/project/video/${projectId}/preview`;

  const handleShare = (baseUrl: string) => {
    const shareUrlEncoded = `${baseUrl}${encodeURIComponent(shareUrl)}`;
    window.open(shareUrlEncoded, '_blank');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="size-8 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Share Project
          </h2>
          <p className="text-muted-foreground mt-2">
            Share the link to your project:
          </p>
        </div>

        {/* Share Options */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            {shareOptions.map(({ title, icon, url }) => (
              <ShareButton
                key={title}
                title={title}
                icon={icon}
                onClick={() => handleShare(url)}
              />
            ))}
          </div>
        </div>

        {/* URL Copy */}
        <div className="space-y-3">
          <label
            htmlFor="share-url"
            className="text-sm font-medium text-foreground"
          >
            Project link:
          </label>
          <div className="flex items-center space-x-2 rounded-xl border border-border p-3 bg-muted">
            <input
              id="share-url"
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm outline-none text-foreground"
            />
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="min-w-[80px]"
            >
              {copied ? (
                <>
                  <Check className="size-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 text-center">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const ShareButton = ({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-muted transition-colors duration-200"
  >
    <div className="size-12 flex items-center justify-center">{icon}</div>
    <span className="text-xs font-medium text-foreground">{title}</span>
  </button>
);

const shareOptions = [
  {
    title: 'Telegram',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="text-blue-500"
      >
        <path
          fill="currentColor"
          d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"
        />
        <path
          fill="#fff"
          d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"
        />
      </svg>
    ),
    url: 'https://t.me/share/url?url=',
  },
  {
    title: 'WhatsApp',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 80 80"
        className="text-green-500"
      >
        <path
          fill="currentColor"
          d="M7.904,58.665L7.8,58.484c-3.263-5.649-4.986-12.102-4.983-18.66 C2.826,19.244,19.577,2.5,40.157,2.5C50.14,2.503,59.521,6.391,66.57,13.446C73.618,20.5,77.5,29.879,77.5,39.855 c-0.01,20.583-16.76,37.328-37.34,37.328c-6.247-0.003-12.418-1.574-17.861-4.543l-0.174-0.096L2.711,77.636L7.904,58.665z"
        />
        <path
          fill="#fff"
          d="M56.561,47.376c-0.9-0.449-5.321-2.626-6.143-2.924c-0.825-0.301-1.424-0.449-2.023,0.449	c-0.599,0.9-2.322,2.924-2.845,3.523c-0.524,0.599-1.048,0.674-1.948,0.226c-0.9-0.449-3.797-1.4-7.23-4.462	c-2.674-2.382-4.478-5.327-5.001-6.227c-0.524-0.9-0.057-1.385,0.394-1.834c0.403-0.403,0.9-1.051,1.349-1.575	c0.449-0.524,0.599-0.9,0.9-1.5c0.301-0.599,0.151-1.126-0.075-1.575c-0.226-0.449-2.023-4.875-2.773-6.673	c-0.729-1.752-1.472-1.515-2.023-1.542c-0.524-0.027-1.123-0.03-1.722-0.03c-0.599,0-1.575,0.226-2.397,1.126	c-0.822,0.9-3.147,3.074-3.147,7.498s3.222,8.699,3.671,9.298c0.449,0.599,6.338,9.678,15.36,13.571	c2.144,0.924,3.821,1.478,5.125,1.894c2.153,0.684,4.113,0.587,5.664,0.355c1.728-0.259,5.321-2.174,6.067-4.273	c0.75-2.099,0.75-3.899,0.524-4.273C58.06,48.051,57.461,47.825,56.561,47.376z"
        />
      </svg>
    ),
    url: 'https://api.whatsapp.com/send?text=',
  },
  {
    title: 'LinkedIn',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="text-blue-600"
      >
        <path
          fill="currentColor"
          d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
        />
        <path
          fill="#FFF"
          d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501,0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"
        />
      </svg>
    ),
    url: 'https://www.linkedin.com/shareArticle?url=',
  },
];
