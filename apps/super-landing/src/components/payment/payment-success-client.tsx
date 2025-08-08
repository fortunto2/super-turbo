"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { Button } from "@turbo-super/ui";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Video,
  Clock,
  ArrowRight,
  Copy,
  Search,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentSuccessClientProps {
  sessionId: string;
  locale: string;
}

interface WebhookStatus {
  status: "pending" | "processing" | "completed" | "error";
  fileId?: string;
  error?: string;
}

export default function PaymentSuccessClient({
  sessionId,
  locale,
}: PaymentSuccessClientProps) {
  const [status, setStatus] = useState<WebhookStatus>({ status: "pending" });
  const [countdown, setCountdown] = useState(60); // 60 seconds timeout
  const [isDev, setIsDev] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string>("");
  const [toolSlug, setToolSlug] = useState<string>("");
  const router = useRouter();

  // Check if we're in development
  useEffect(() => {
    setIsDev(
      process.env.NODE_ENV === "development" ||
        (typeof window !== "undefined" &&
          window.location.hostname === "localhost")
    );
  }, []);

  // Check webhook status
  const checkWebhookStatus = async () => {
    try {
      console.log("🔍 Checking webhook status for session:", sessionId);
      const response = await fetch(`/api/webhook-status/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Webhook status received:", data);
        setStatus(data);

        if (data.status === "completed") {
          console.log("✅ Payment completed successfully");
          toast.success("Payment completed successfully!");

          // Get session data to find cancelUrl and tool slug
          try {
            const sessionResponse = await fetch(
              `/api/session-data/${sessionId}`
            );
            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              if (sessionData.cancelUrl) {
                setReturnUrl(sessionData.cancelUrl);
              }
              if (sessionData.toolSlug) {
                setToolSlug(sessionData.toolSlug);
              }
            }
          } catch (sessionError) {
            console.error("Error fetching session data:", sessionError);
          }
        } else if (data.status === "error") {
          console.error("❌ Webhook error:", data);
          toast.error("Error processing payment");
        } else {
          console.log("⏳ Still waiting for payment confirmation...");
        }
      } else {
        console.error("❌ Failed to fetch webhook status:", response.status);
      }
    } catch (error) {
      console.error("Error checking webhook status:", error);
    }
  };

  // Poll webhook status every 2 seconds
  useEffect(() => {
    const interval = setInterval(checkWebhookStatus, 2000);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Timeout - redirect to support or home
          toast.error(
            "Processing is taking longer than expected. Please contact support."
          );
          setTimeout(() => {
            if (toolSlug) {
              router.push(`/${locale}/tool/${toolSlug}`);
            } else {
              router.push(`/${locale}`);
            }
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Initial check
    checkWebhookStatus();

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [sessionId, locale, router, toolSlug]);

  const getStatusIcon = () => {
    switch (status.status) {
      case "pending":
        return <Clock className="h-8 w-8 text-yellow-500 animate-pulse" />;
      case "processing":
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "error":
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status.status) {
      case "pending":
        return "Confirming your payment...";
      case "processing":
        return "Processing your payment...";
      case "completed":
        return "Payment completed successfully! You can now return to the tool page.";
      case "error":
        return status.error || "An error occurred processing your payment";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Payment Successful! 🎉</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. You can now return to the tool page to
          start generating videos.
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon()}
            Processing Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">{getStatusMessage()}</p>
          </div>

          {/* Return button - show when completed; enable when target is known */}
          {status.status === "completed" && (
            <div className="text-center">
              <Button
                onClick={() => {
                  if (returnUrl) {
                    window.location.href = returnUrl;
                  } else if (toolSlug) {
                    router.push(`/${locale}/tool/${toolSlug}`);
                  } else {
                    router.push(`/${locale}`);
                  }
                }}
                disabled={!returnUrl && !toolSlug}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {returnUrl || toolSlug
                  ? "Return to Tool Page"
                  : "Preparing return link..."}
              </Button>
            </div>
          )}

          {/* Error state */}
          {status.status === "error" && (
            <div className="text-center">
              <Button
                onClick={() =>
                  router.push(`/${locale}/tool/veo3-prompt-generator`)
                }
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
