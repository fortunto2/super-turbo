"use client";

import {
  QueryClientProvider,
  QueryClient,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { OpenAPI } from "@turbo-super/api";
import type { ReactNode } from "react";
import { useState } from "react";

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // refetchOnWindowFocus: false
            staleTime: 30000, // 30 секунд для кеширования запросов
          },
        },
        mutationCache: new MutationCache({
          onError: (error: any, _context: any) => {
            console.log(error);
          },
        }),
        queryCache: new QueryCache({
          onError: (error: any, _query: any) => {
            if (error?.status === 401) {
              console.log(error);
            }
            if (error?.status === 402) {
              console.log(error);
            }
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
