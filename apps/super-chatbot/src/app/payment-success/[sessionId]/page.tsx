'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@turbo-super/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@turbo-super/ui';
import { CheckCircle, ArrowLeft, Coins } from 'lucide-react';
import Link from 'next/link';

interface PaymentSuccessData {
  sessionId: string;
  amount: number;
  currency: string;
  creditAmount?: number;
  status: 'success' | 'processing' | 'error';
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Здесь можно добавить API call для получения деталей платежа
      // Пока используем моковые данные
      setPaymentData({
        sessionId,
        amount: 100,
        currency: 'usd',
        creditAmount: 100,
        status: 'success'
      });
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Проверяем платеж...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600">Ошибка загрузки данных платежа</p>
            <Link href="/chat">
              <Button className="mt-4">Вернуться в чат</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Оплата прошла успешно!</CardTitle>
          <p className="text-muted-foreground">
            Спасибо за покупку. Ваш баланс пополнен.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium">Добавлено кредитов:</span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                +{paymentData.creditAmount}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Сумма платежа:</span>
              <span className="text-sm font-medium">
                ${(paymentData.amount / 100).toFixed(2)} {paymentData.currency.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="font-medium mb-1">Что дальше?</p>
            <ul className="space-y-1">
              <li>• Используйте кредиты для генерации изображений</li>
              <li>• Создавайте видео с помощью AI</li>
              <li>• Генерируйте скрипты для контента</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link href="/chat" className="flex-1">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться в чат
              </Button>
            </Link>
            <Link href="/tools" className="flex-1">
              <Button className="w-full">
                <Coins className="w-4 h-4 mr-2" />
                Использовать инструменты
              </Button>
            </Link>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            <p>ID сессии: {sessionId}</p>
            <p>Если у вас есть вопросы, обратитесь в поддержку</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 