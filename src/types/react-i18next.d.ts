declare module 'react-i18next' {
  import type { i18n, TFunction } from 'i18next';

  export interface UseTranslationResponse {
    t: TFunction;
    i18n: i18n;
    ready: boolean;
  }

  export function useTranslation(): UseTranslationResponse;

  export const initReactI18next: {
    type: '3rdParty';
    init: (instance: i18n) => void;
  };
}

