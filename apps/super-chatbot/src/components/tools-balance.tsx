"use client";

import { useEffect, useState } from "react";
import { Button } from "@turbo-super/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Badge } from "@turbo-super/ui";
import { cn } from "@turbo-super/ui";
import { CreditCard, Coins, Zap } from "lucide-react";
import { StripePaymentButton } from "@turbo-super/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@turbo-super/ui";

interface ToolsBalanceData {
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

interface ToolsBalanceProps {
  className?: string;
  variant?: "compact" | "detailed" | "header";
  showLabel?: boolean;
}

export function ToolsBalance({
  className,
  variant = "compact",
  showLabel = true,
}: ToolsBalanceProps) {
  const [data, setData] = useState<ToolsBalanceData | null>(null);
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
      <div className={className}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Coins className="size-4" />
              {showLabel && variant !== "compact" && (
                <span className="ml-1 animate-pulse">Loading...</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Loading balance...</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={className}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-red-500"
            >
              <Coins className="size-4" />
              {showLabel && variant !== "compact" && (
                <span className="ml-1">Error</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Failed to load tools balance</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  const { balance, status, userType } = data;
  const { displayColor, isLow, isEmpty } = status;

  // Color mapping for dark theme
  const colorClasses = {
    green:
      "text-green-400 border-input bg-green-950/50 dark:text-green-400 dark:border-input dark:bg-green-950/50",
    yellow:
      "text-yellow-400 border-yellow-800 bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800 dark:bg-yellow-950/50",
    red: "text-red-400 border-red-800 bg-red-950/50 dark:text-red-400 dark:border-red-800 dark:bg-red-950/50",
  };

  const iconColorClasses = {
    green: "text-green-400 dark:text-green-400",
    yellow: "text-yellow-400 dark:text-yellow-400",
    red: "text-red-400 dark:text-red-400",
  };

  // Render different variants
  if (variant === "header") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                `h-8 flex items-center gap-1.5 px-2.5 cursor-pointer`,
                colorClasses[displayColor]
              )}
            >
              <Coins className={cn("size-4", iconColorClasses[displayColor])} />
              <span className="text-xs font-medium">{balance}</span>
              {showLabel && <span className="text-xs">credits</span>}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-500" />
                Баланс кредитов
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">Текущий баланс:</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {balance} кредитов
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
                      ? "Пустой"
                      : isLow
                        ? "Низкий баланс"
                        : "Хороший баланс"}
                  </Badge>
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  Тип пользователя: {userType}
                </p>
              </div>

              <StripePaymentButton
                variant="credits"
                creditAmount={100}
                price={1.0}
                apiEndpoint="/api/stripe-prices"
                checkoutEndpoint="/api/create-checkout"
                className="border-0 shadow-none"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div
            className={cn(
              "space-y-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors",
              className
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins
                  className={cn("size-5", iconColorClasses[displayColor])}
                />
                <span className="font-medium">Tools Balance</span>
              </div>
              <Badge
                variant={
                  isEmpty ? "destructive" : isLow ? "secondary" : "default"
                }
              >
                {isEmpty ? "Empty" : isLow ? "Low" : "Good"}
              </Badge>
            </div>

            <div className="text-2xl font-bold flex items-baseline gap-1">
              <span className={iconColorClasses[displayColor]}>{balance}</span>
              <span className="text-sm font-normal text-muted-foreground">
                credits
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Use credits to generate images, videos, and scripts</p>
              {isLow && !isEmpty && (
                <p className="text-yellow-600 mt-1">
                  ⚠️ Balance is running low
                </p>
              )}
              {isEmpty && (
                <p className="text-red-600 mt-1">
                  ❌ Insufficient balance for tools
                </p>
              )}
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-500" />
              Баланс кредитов
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Текущий баланс:</span>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {balance} кредитов
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
                    ? "Пустой"
                    : isLow
                      ? "Низкий баланс"
                      : "Хороший баланс"}
                </Badge>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Тип пользователя: {userType}
              </p>
            </div>

            <StripePaymentButton
              variant="credits"
              creditAmount={100}
              price={1.0}
              apiEndpoint="/api/stripe-prices"
              checkoutEndpoint="/api/create-checkout"
              className="border-0 shadow-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Compact variant (default)
  return (
    <div className={className}>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 flex items-center gap-1.5 px-2.5 cursor-pointer",
              colorClasses[displayColor]
            )}
          >
            <Coins className={cn("size-4", iconColorClasses[displayColor])} />
            <span className="text-xs font-medium">{balance}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-500" />
              Баланс кредитов
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Текущий баланс:</span>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {balance} кредитов
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
                    ? "Пустой"
                    : isLow
                      ? "Низкий баланс"
                      : "Хороший баланс"}
                </Badge>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Тип пользователя: {userType}
              </p>
            </div>

            <div className="text-xs space-y-1 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
              <p className="font-medium">Стоимость инструментов:</p>
              <p>• Генерация изображений: 2-6 кредитов</p>
              <p>• Генерация видео: 7.5-90 кредитов</p>
              <p>• Генерация скриптов: 1-2 кредита</p>
            </div>

            <StripePaymentButton
              variant="credits"
              creditAmount={100}
              price={1.0}
              apiEndpoint="/api/stripe-prices"
              checkoutEndpoint="/api/create-checkout"
              className="border-0 shadow-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Pricing display component for tools
 */
interface ToolsPricingProps {
  className?: string;
}

export function ToolsPricing({ className }: ToolsPricingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-center">
        <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
          <Zap className="size-5 text-blue-500" />
          Tools Pricing
        </h3>
        <p className="text-sm text-muted-foreground">
          Credit costs for AI tools
        </p>
      </div>

      <div className="grid gap-2 text-sm">
        {/* Image Generation */}
        <div className="flex items-center justify-between p-2 rounded bg-blue-950/30 border border-blue-800/50">
          <span className="font-medium text-blue-300">🖼️ Image Generation</span>
          <span className="text-blue-400 font-medium">2-6 credits</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground ml-4">
          <span>• Text to image: 2 credits</span>
          <span>• Image to image: 3 credits</span>
          <span>• High quality: +50%</span>
          <span>• Ultra quality: +100%</span>
        </div>

        {/* Video Generation */}
        <div className="flex items-center justify-between p-2 rounded bg-purple-950/30 border border-purple-800/50">
          <span className="font-medium text-purple-300">
            🎬 Video Generation
          </span>
          <span className="text-purple-400 font-medium">7.5-90 credits</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground ml-4">
          <span>• 5s video: 7.5 credits</span>
          <span>• 10s video: 15 credits</span>
          <span>• Image-to-video: +50%</span>
          <span>• 4K quality: +100%</span>
        </div>

        {/* Script Generation */}
        <div className="flex items-center justify-between p-2 rounded bg-green-950/30 border border-green-800/50">
          <span className="font-medium text-green-300">
            📝 Script Generation
          </span>
          <span className="text-green-400 font-medium">1-2 credits</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground ml-4">
          <span>• Basic script: 1 credit</span>
          <span>• Long script: 2 credits</span>
        </div>

        {/* Prompt Enhancement */}
        <div className="flex items-center justify-between p-2 rounded bg-orange-950/30 border border-orange-800/50">
          <span className="font-medium text-orange-300">
            ✨ Prompt Enhancement
          </span>
          <span className="text-orange-400 font-medium">1-2 credits</span>
        </div>
      </div>
    </div>
  );
}
