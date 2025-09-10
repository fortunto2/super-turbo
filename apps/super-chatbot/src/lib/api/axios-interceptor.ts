import axios from "axios";

/**
 * Перехватчик axios для автоматического перенаправления запросов через прокси
 * Работает только на клиенте
 */
if (typeof window !== "undefined") {
  // Добавляем interceptor для запросов
  axios.interceptors.request.use(
    (config) => {
      if (config.url?.includes("/api/v1/")) {
        // Заменяем URL на прокси
        const proxyUrl = config.url.replace(/^.*\/api\/v1\//, "/api/proxy/");
        config.url = proxyUrl;
        console.log("🔄 Axios: Redirecting to proxy:", proxyUrl);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Добавляем interceptor для ответов
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}
