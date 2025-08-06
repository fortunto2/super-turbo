"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@turbo-super/ui";
import { Coins, Zap } from "lucide-react";
import { StripePaymentButton } from "@turbo-super/shared";
import { useTranslation } from "@/hooks/use-translation";
import { Locale } from "@/config/i18n-config";

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
  const translateWithParams = (
    key: string,
    params?: Record<string, string | number>
  ) => {
    let translation = t(key);

    // Заменяем параметры в переводе
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value));
      });
    }

    return translation;
  };
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

    fetchBalance();

    // Обновлять каждые 30 секунд
    const interval = setInterval(fetchBalance, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card
        className={`border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-400/30 ${className}`}
      >
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 animate-pulse" />
            <span>{t("credit_balance.loading")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card
        className={`border-2 border-red-500/50 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/30 dark:to-orange-950/30 dark:border-red-400/30 ${className}`}
      >
        <CardContent className="flex items-center justify-center py-8">
          <span className="text-red-600 dark:text-red-400">
            {error || t("credit_balance.error")}
          </span>
        </CardContent>
      </Card>
    );
  }

  const { balance, status, userType } = data;
  const { displayColor, isLow, isEmpty } = status;

  // Color mapping for dark theme
  const colorClasses = {
    green:
      "text-green-400 border-green-800 bg-green-950/50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/50",
    yellow:
      "text-yellow-400 border-yellow-800 bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950/50",
    red: "text-red-400 border-red-800 bg-red-950/50 dark:text-red-400 dark:border-red-800 dark:bg-red-950/50",
  };

  const iconColorClasses = {
    green: "text-green-400 dark:text-green-400",
    yellow: "text-yellow-400 dark:text-yellow-400",
    red: "text-red-400 dark:text-red-400",
  };

  return (
    <Card
      className={`border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-400/30 ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className={`w-5 h-5 ${iconColorClasses[displayColor]}`} />
          {t("credit_balance.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("credit_balance.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">
                {t("credit_balance.current_balance")}
              </span>
            </div>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {balance} {t("credit_balance.credits")}
            </span>
          </div>
          <div className="mt-2">
            <Badge
              variant={
                isEmpty ? "destructive" : isLow ? "secondary" : "default"
              }
              className="text-xs"
            >
              {isEmpty
                ? t("credit_balance.empty")
                : isLow
                  ? t("credit_balance.low_balance")
                  : t("credit_balance.good_balance")}
            </Badge>
          </div>
          <p className="text-xs mt-2 text-muted-foreground">
            {t("credit_balance.user_type")} {userType}
          </p>
        </div>

        <div className="text-xs space-y-1 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
          <p className="font-medium">{t("credit_balance.tool_costs")}</p>
          <p>• {t("credit_balance.image_generation")}</p>
          <p>• {t("credit_balance.video_generation")}</p>
          <p>• {t("credit_balance.script_generation")}</p>
          <p>• {t("credit_balance.prompt_enhancement")}</p>
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
            t={translateWithParams}
          />
        )}
      </CardContent>
    </Card>
  );
}
