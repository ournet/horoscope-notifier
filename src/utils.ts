import { Dictionary } from "@ournet/domain";

const LANG_COUNTRY_MAP: Dictionary<string> = {
    sq: 'al',
    cs: 'cz',
};

export function getCountryByLang(lang: string) {
    return LANG_COUNTRY_MAP[lang] || lang;
}
