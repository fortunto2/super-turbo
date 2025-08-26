// Translation system types

export type Locale = "en" | "ru" | "tr" | "es" | "hi";

export interface LocaleConfig {
  defaultLocale: Locale;
  locales: Locale[];
  localeDetection: boolean;
  domains?: Record<string, Locale>;
  cookieName: string;
  cookieMaxAge: number;
  preserveRouteOnHome: boolean;
}

export interface LocaleMap {
  en: string;
  ru: string;
  tr: string;
  es: string;
  hi: string;
}

export interface Dictionary {
  [key: string]: string | Dictionary;
}

export interface TranslationConfig {
  i18n: LocaleConfig;
  localeMap: LocaleMap;
}

export type NestedDictionary = {
  [key: string]: string | NestedDictionary | (string | NestedDictionary)[];
};

// Specific types for super-landing dictionary structure
export interface SuperLandingDictionary {
  blog: {
    page_title: string;
  };
  site: {
    name: string;
  };
  footer: {
    pages: {
      about: string;
      pricing: string;
      terms: string;
      privacy: string;
      blog: string;
      demo: string;
    };
    company: string;
    corp: string;
    address1: string;
    address2: string;
    phone: string;
    email: string;
    copyright: string;
    social: {
      instagram: string;
      youtube: string;
      telegram: string;
      tiktok: string;
      discord: string;
      linkedin: string;
    };
  };
  marketing: {
    pages: string;
    tools: string;
    cases: string;
    ai_tool_title: string;
    ai_case_title: string;
    view_all_tools: string;
    view_all_cases: string;
  };
  hero: {
    title: string;
    description: string;
    cta: string;
  };
  features: {
    section_title: string;
    section_description: string;
    list: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  howItWorks: {
    section_title: string;
    section_description: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
}
