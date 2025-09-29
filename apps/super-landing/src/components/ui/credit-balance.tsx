"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@turbo-super/ui";
import { Coins } from "lucide-react";
import { StripePaymentButton } from "@turbo-super/payment";
import { useTranslation } from "@/hooks/use-translation";
import type { Locale } from "@/config/i18n-config";

interface CreditBalanceData {
  balance: number;
  status: {
    balance: number;
    isLow: boolean;
    isEmpty: boolean;
    displayColor: "green" | "yellow" | "red";
  };
  userType: string;
  userId: string;
}

interface CreditBalanceProps {
  className?: string;
  showPurchaseButton?: boolean;
  locale?: Locale;
}

export function CreditBalance({
  className,
  showPurchaseButton = true,
  locale = "tr",
}: CreditBalanceProps) {
  const { t } = useTranslation(locale);

  // Обертка для функции перевода с поддержкой параметров
  const [data, setData] = useState<CreditBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        setLoading(true);
        const response = await fetch("/api/tools-balance");

        if (!response.ok) {
          throw new Error("Failed to fetch tools balance");
        }

        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    void fetchBalance();

    // Обновлять каждые 30 секунд
    const interval = setInterval(() => void fetchBalance(), 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <Card
        className={`card-enhanced border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-blue-950/30 to-green-950/30 backdrop-blur-sm ${className}`}
      >
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
              <Coins className="size-5 text-purple-400 animate-pulse" />
            </div>
            <span className="text-purple-300">
              {t("credit_balance.loading")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card
        className={`card-enhanced border-red-500/20 bg-gradient-to-br from-red-950/30 via-orange-950/30 to-red-950/30 backdrop-blur-sm ${className}`}
      >
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30">
              <Coins className="size-5 text-red-400" />
            </div>
            <span className="text-red-300">
              {error ?? t("credit_balance.error")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { balance, status, userType } = data;
  const { displayColor, isLow, isEmpty } = status;

  const iconColorClasses = {
    green: "text-green-400 dark:text-green-400",
    yellow: "text-yellow-400 dark:text-yellow-400",
    red: "text-red-400 dark:text-red-400",
  };

  return (
    <Card
      className={`card-enhanced border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-blue-950/30 to-green-950/30 backdrop-blur-sm ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <div className="p-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Coins className={`size-5 ${iconColorClasses[displayColor]}`} />
          </div>
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {t("credit_balance.title")}
          </span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {t("credit_balance.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-br from-blue-950/40 to-purple-950/40 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <Coins className="size-4 text-blue-400" />
              </div>
              <span className="font-medium text-blue-300 text-sm">
                {t("credit_balance.current_balance")}
              </span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {balance} {t("credit_balance.credits")}
            </span>
          </div>
          <div className="mb-2">
            <Badge
              variant={
                isEmpty ? "destructive" : isLow ? "secondary" : "default"
              }
              className={`text-xs px-2 py-0.5 ${
                isEmpty
                  ? "bg-red-500/20 border-red-500/30 text-red-300"
                  : isLow
                    ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                    : "bg-green-500/20 border-green-500/30 text-green-300"
              }`}
            >
              {isEmpty
                ? t("credit_balance.empty")
                : isLow
                  ? t("credit_balance.low_balance")
                  : t("credit_balance.good_balance")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("credit_balance.user_type")}{" "}
            <span className="text-blue-300 font-medium">{userType}</span>
          </p>
        </div>

        <div className="text-xs space-y-1.5 bg-gradient-to-br from-gray-900/40 to-gray-800/40 p-3 rounded-lg border border-gray-500/20 backdrop-blur-sm">
          <p className="font-medium text-gray-300">
            {t("credit_balance.tool_costs")}
          </p>
          <div className="grid grid-cols-1 gap-1">
            <p className="text-gray-400 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-blue-500/60"></span>
              {t("credit_balance.image_generation")}
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-purple-500/60"></span>
              {t("credit_balance.video_generation")}
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-green-500/60"></span>
              {t("credit_balance.script_generation")}
            </p>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-yellow-500/60"></span>
              {t("credit_balance.prompt_enhancement")}
            </p>
          </div>
        </div>

        {showPurchaseButton && (
          <StripePaymentButton
            variant="credits"
            creditAmount={100}
            price={1.0}
            apiEndpoint="/api/stripe-prices"
            checkoutEndpoint="/api/create-checkout"
            className="border-0 shadow-none"
            locale={locale}
            onPaymentClick={() => {
              /* Payment click handler */
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
