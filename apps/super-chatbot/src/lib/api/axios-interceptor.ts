import axios from "axios";

/**
 * Перехватчик axios для автоматического добавления токена авторизации
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
      }

      return config;
    },
    (error) => {
      //   console.error("Axios request error:", error);
      return Promise.reject(error);
    }
  );

  // Добавляем interceptor для ответов
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      //   console.error("Axios response error:", error);
      return Promise.reject(error);
    }
  );
}
