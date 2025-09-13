"use client";

import {
  QueryClientProvider,
  QueryClient,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { setupOpenAPI } from "@/lib/api/openapi-setup";
import "@/lib/api/axios-interceptor";
import "@/lib/api/simple-fetch-interceptor";

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  // Настраиваем OpenAPI один раз
  useEffect(() => {
    setupOpenAPI();
  }, []);

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
