import React from "react";
import { useTranslation } from "@/hooks/use-translation";
import type { SuperLandingTranslationKey } from "@/types/translations";

// Тип для feature из features.list
interface Feature {
  icon: string;
  title: string;
  description: string;
}

// Пример компонента с типизированными переводами
export function TranslationExample() {
  const { t } = useTranslation("en");

  return (
    <div>
      {/* ✅ Правильно - ключ существует в словаре */}
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.description")}</p>

      {/* ✅ Правильно - вложенные ключи */}
      <div>
        <h2>{t("footer.pages.about")}</h2>
        <p>{t("footer.company")}</p>
      </div>

      {/* ✅ Правильно - массив с объектами */}
      <ul>
        {(t("features.list") as Feature[]).map(
          (feature: Feature, index: number) => (
            <li key={index}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </li>
          )
        )}
      </ul>

      {/* ✅ Правильно - stripe_payment ключи (включая новые для image) */}
      <div>
        <h3>{t("stripe_payment.generate_ai_images")}</h3>
        <p>{t("stripe_payment.generate_image_desc")}</p>
        <button>{t("stripe_payment.generate_image")}</button>
      </div>

      {/* ✅ Новые ключи для image variant */}
      <div>
        <h4>Image Generation Keys:</h4>
        <ul>
          <li>{t("stripe_payment.generate_ai_images")}</li>
          <li>{t("stripe_payment.generate_image_desc")}</li>
          <li>{t("stripe_payment.generate_image")}</li>
          <li>{t("stripe_payment.generate_image_desc_short")}</li>
          <li>{t("stripe_payment.generate_image_for")}</li>
        </ul>
      </div>

      {/* ❌ Ошибка TypeScript - такого ключа нет в словаре */}
      {/* <p>{t("nonexistent.key")}</p> */}

      {/* ❌ Ошибка TypeScript - неправильный путь */}
      {/* <p>{t("hero.nonexistent")}</p> */}
    </div>
  );
}

// Пример функции с типизированными параметрами (без хуков)
export function getLocalizedMessage(
  key: SuperLandingTranslationKey,
  _params?: Record<string, string | number>
) {
  // В реальном использовании здесь была бы логика без хуков
  return key;
}

// Примеры вызовов с правильными ключами
export const exampleKeys: SuperLandingTranslationKey[] = [
  "hero.title",
  "hero.description",
  "footer.pages.about",
  "stripe_payment.generate_ai_images",
  "stripe_payment.generate_image_desc",
  "stripe_payment.generate_image",
  "stripe_payment.generate_image_for",
  "stripe_payment.generate_image_desc_short",
];

// Демонстрация автодополнения для всех доступных ключей
export const allAvailableKeys: SuperLandingTranslationKey[] = [
  // Hero section
  "hero.title",
  "hero.description", 
  "hero.cta",
  
  // Footer section
  "footer.pages.about",
  "footer.pages.pricing",
  "footer.pages.terms",
  "footer.pages.privacy",
  "footer.pages.blog",
  "footer.pages.demo",
  "footer.company",
  "footer.corp",
  "footer.address1",
  "footer.address2",
  "footer.phone",
  "footer.email",
  "footer.copyright",
  "footer.social.instagram",
  "footer.social.youtube",
  "footer.social.telegram",
  "footer.social.tiktok",
  "footer.social.discord",
  "footer.social.linkedin",
  
  // Stripe payment keys (включая новые для image)
  "stripe_payment.loading_payment_options",
  "stripe_payment.failed_load_payment",
  "stripe_payment.top_up_balance",
  "stripe_payment.generate_veo3_videos",
  "stripe_payment.generate_ai_images",        // ✅ Новый ключ для image
  "stripe_payment.top_up_balance_desc",
  "stripe_payment.generate_video_desc",
  "stripe_payment.generate_image_desc",       // ✅ Новый ключ для image
  "stripe_payment.top_up_credits",
  "stripe_payment.generate_video",
  "stripe_payment.generate_image",            // ✅ Новый ключ для image
  "stripe_payment.get_credits_desc",
  "stripe_payment.generate_video_desc_short",
  "stripe_payment.generate_image_desc_short", // ✅ Новый ключ для image
  "stripe_payment.creating_payment",
  "stripe_payment.top_up_for",
  "stripe_payment.generate_for",
  "stripe_payment.generate_image_for",        // ✅ Новый ключ для image
  "stripe_payment.instant_access",
  "stripe_payment.test_mode",
  "stripe_payment.generate_prompt_first",
  "stripe_payment.prices_not_loaded",
  "stripe_payment.failed_create_checkout",
];
