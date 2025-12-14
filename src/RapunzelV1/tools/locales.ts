import { LilithLanguage } from "@atsu/lilith";

const LocaleMapper: Record<LilithLanguage, string> = {
    [LilithLanguage.spanish]: "🇪🇸",
    [LilithLanguage.english]: "🇬🇧",
    [LilithLanguage.mandarin]: "🇨🇳",
    [LilithLanguage.japanese]: "🇯🇵",
};

export const getLocaleEmoji = (lang: LilithLanguage): string => {
    return LocaleMapper[lang];
};
