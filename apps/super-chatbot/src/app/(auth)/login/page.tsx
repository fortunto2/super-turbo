"use client";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@turbo-super/ui";

export default function Page() {
  const router = useRouter();
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем список доступных провайдеров
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch providers:", err);
        setLoading(false);
      });
  }, []);

  const handleGuestLogin = async () => {
    try {
      await signIn("guest", { callbackUrl: "/" });
    } catch (error) {
      console.error("Guest login error:", error);
    }
  };

  const handleAuth0Login = async () => {
    try {
      await signIn("auth0", { callbackUrl: "/" });
    } catch (error) {
      console.error("Auth0 login error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const hasAuth0 = providers?.auth0;
  const hasGuest = providers?.guest;

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-8">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Вход в систему
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Выберите способ входа
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 sm:px-16">
          {hasAuth0 && (
            <Button
              onClick={handleAuth0Login}
              type="button"
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Войти через Auth0
            </Button>
          )}

          {hasAuth0 && hasGuest && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или
                </span>
              </div>
            </div>
          )}

          {hasGuest && (
            <Button
              onClick={handleGuestLogin}
              type="button"
              variant="outline"
              className="w-full"
            >
              Войти как гость
            </Button>
          )}

          {!hasAuth0 && (
            <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <p>
                Auth0 не настроен. Используйте гостевой режим для тестирования.
              </p>
            </div>
          )}

          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            Гостевой режим позволяет использовать приложение без регистрации
          </p>
        </div>
      </div>
    </div>
  );
}
