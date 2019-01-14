
import test from 'ava';
import { getCountryByLang } from './utils';
import { Dictionary } from '@ournet/domain';

const LANG_COUNTRY_MAP: Dictionary<string> = {
    ro: 'ro',
    ru: 'ru',
    sq: 'al',
    cs: 'cz',
};

Object.keys(LANG_COUNTRY_MAP).forEach(lang => {
    test(lang, t => {
        t.is(getCountryByLang(lang), LANG_COUNTRY_MAP[lang]);
    })
})
