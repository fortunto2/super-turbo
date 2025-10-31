'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

import { Button } from '@turbo-super/ui';
import { LoaderIcon } from '@/components/common/icons';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Автоматически начинаем процесс аутентификации через Auth0
    const signupWithAuth0 = async () => {
      await signIn('auth0', { callbackUrl: '/' });
    };

    signupWithAuth0();
  }, []);

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Регистрация
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Создание аккаунта через Auth0
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 sm:px-16">
          <Button
            onClick={() => signIn('auth0', { callbackUrl: '/' })}
            type="button"
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            Зарегистрироваться через Auth0
          </Button>
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin text-zinc-500 size-6">
              <LoaderIcon size={24} />
            </div>
            <span className="ml-2 text-zinc-600 dark:text-zinc-400">
              Перенаправление...
            </span>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {'Уже есть аккаунт? '}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              onClick={() => signIn('auth0', { callbackUrl: '/' })}
            >
              Войдите
            </Button>
            {' через Auth0.'}
          </p>
        </div>
      </div>
    </div>
  );
}
