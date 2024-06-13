let global_language = "en";
let global_language_steam = "en";
let global_translations = {};
let global_countries = {};
let global_language_initialized = false;
const TRANSLATION_en = {};
const on_i18n_initialized_handlers = [];

function init_i18n() {
    global_translations = TRANSLATION_en;
    if (typeof COUNTRIES_en !== "undefined") global_countries = COUNTRIES_en;
    bind_event("set_game_language", (function(locale) {
        console.log("=== set_game_language", locale);
        if (TRANSLATION_en_source) {
            let first = true;
            for (let key in TRANSLATION_en_source) {
                if (first) {
                    first = false;
                    if (typeof TRANSLATION_en_source[key] !== "object") break
                }
                TRANSLATION_en[key] = TRANSLATION_en_source[key]["text"]
            }
        }
        var langCodes = {
            "en-gb": ["en", "en"],
            "en-us": ["en", "en"],
            "en-au": ["en", "en"],
            "zh-cn": ["zh_cn", "zh-CN"],
            "zh-hans": ["zh_cn", "zh-CN"],
            ja: ["ja", "ja"],
            ru: ["ru", "ru"],
            "es-es": ["es", "es"],
            "es-mx": ["es_mx", "es-419"],
            es: ["es_mx", "es-419"],
            fr: ["fr", "fr"],
            "pt-br": ["pt_br", "pt-BR"],
            de: ["de", "de"],
            ko: ["ko", "ko"],
            pl: ["pl", "pl"]
        };
        global_language = "en";
        global_language_steam = "en";
        if (locale.toLowerCase() in langCodes) {
            global_language = langCodes[locale.toLowerCase()][0];
            global_language_steam = langCodes[locale.toLowerCase()][1]
        }
        if (global_language == "zh_tw") {
            global_translations = TRANSLATION_zh_TW;
            if (typeof COUNTRIES_tw !== "undefined") global_countries = COUNTRIES_tw;
            if (typeof numeral !== "undefined") numeral.locale("chs")
        } else if (global_language == "zh_cn") {
            global_translations = TRANSLATION_zh_CN;
            if (typeof COUNTRIES_cn !== "undefined") global_countries = COUNTRIES_cn;
            if (typeof numeral !== "undefined") numeral.locale("chs")
        } else if (global_language == "ja") {
            global_translations = TRANSLATION_ja;
            if (typeof COUNTRIES_ja !== "undefined") global_countries = COUNTRIES_ja;
            if (typeof numeral !== "undefined") numeral.locale("ja")
        } else if (global_language == "it") {
            global_translations = TRANSLATION_it;
            if (typeof COUNTRIES_it !== "undefined") global_countries = COUNTRIES_it;
            if (typeof numeral !== "undefined") numeral.locale("it")
        } else if (global_language == "ru") {
            global_translations = TRANSLATION_ru;
            if (typeof COUNTRIES_ru !== "undefined") global_countries = COUNTRIES_ru;
            if (typeof numeral !== "undefined") numeral.locale("ru")
        } else if (global_language == "es") {
            global_translations = TRANSLATION_es_ES;
            if (typeof COUNTRIES_es !== "undefined") global_countries = COUNTRIES_es;
            if (typeof numeral !== "undefined") numeral.locale("es")
        } else if (global_language == "es_mx") {
            global_translations = TRANSLATION_es_MX;
            if (typeof COUNTRIES_es !== "undefined") global_countries = COUNTRIES_es;
            if (typeof numeral !== "undefined") numeral.locale("es")
        } else if (global_language == "fr") {
            global_translations = TRANSLATION_fr;
            if (typeof COUNTRIES_fr !== "undefined") global_countries = COUNTRIES_fr;
            if (typeof numeral !== "undefined") numeral.locale("fr")
        } else if (global_language == "pt_br") {
            global_translations = TRANSLATION_pt_BR;
            if (typeof COUNTRIES_br !== "undefined") global_countries = COUNTRIES_br;
            if (typeof numeral !== "undefined") numeral.locale("pt-br")
        } else if (global_language == "de") {
            global_translations = TRANSLATION_de;
            if (typeof COUNTRIES_de !== "undefined") global_countries = COUNTRIES_de;
            if (typeof numeral !== "undefined") numeral.locale("de")
        } else if (global_language == "ko") {
            global_translations = TRANSLATION_ko;
            if (typeof COUNTRIES_ko !== "undefined") global_countries = COUNTRIES_ko;
            if (typeof numeral !== "undefined") numeral.locale("ko")
        } else if (global_language == "pl") {
            global_translations = TRANSLATION_pl;
            if (typeof COUNTRIES_ko !== "undefined") global_countries = COUNTRIES_en;
            if (typeof numeral !== "undefined") numeral.locale("pl")
        } else {
            global_translations = TRANSLATION_en;
            if (typeof COUNTRIES_en !== "undefined") global_countries = COUNTRIES_en
        }
        if (["zh_tw", "zh_cn", "ja", "ko"].includes(global_language)) {
            let noto = getComputedStyle(document.documentElement).getPropertyValue("--noto-font");
            document.documentElement.style.setProperty("--main-font", "" + noto)
        }
        global_language_initialized = true;
        i18next.use(i18nextICU).init({
            debug: true,
            lng: global_language,
            fallbackLng: "en",
            i18nFormat: {
                localeData: ["en", "zh_cn", "ja", "it", "ru", "es", "es_mx", "fr", "pt_br", "de", "ko", "pl"]
            },
            resources: {
                en: {
                    translation: TRANSLATION_en
                },
                zh_tw: {
                    translation: TRANSLATION_zh_TW
                },
                zh_cn: {
                    translation: TRANSLATION_zh_CN
                },
                ja: {
                    translation: TRANSLATION_ja
                },
                it: {
                    translation: TRANSLATION_it
                },
                ru: {
                    translation: TRANSLATION_ru
                },
                es: {
                    translation: TRANSLATION_es_ES
                },
                es_mx: {
                    translation: TRANSLATION_es_MX
                },
                fr: {
                    translation: TRANSLATION_fr
                },
                pt_br: {
                    translation: TRANSLATION_pt_BR
                },
                de: {
                    translation: TRANSLATION_de
                },
                ko: {
                    translation: TRANSLATION_ko
                },
                pl: {
                    translation: TRANSLATION_pl
                }
            },
            saveMissing: true,
            parseMissingKeyHandler: function(key) {
                if (global_language_initialized) {
                    console.log("missing language key", key)
                }
                return key
            }
        }, (function(err, t) {
            const localize_all = locI18next.init(i18next, {
                useOptionsAttr: true,
                parseDefaultValueFromContent: false
            });
            localize_all("body");
            for (let cb of on_i18n_initialized_handlers) {
                if (typeof cb === "function") cb()
            }
        }))
    }))
}

function localize_country(country) {
    if (country in global_countries) return global_countries[country];
    if (global_language_initialized) {
        console.log("missing country localization " + country)
    }
    if (typeof COUNTRIES_en !== "undefined" && country in COUNTRIES_en) return COUNTRIES_en[country];
    return country
}

function localize(key) {
    if (key in global_translations) return global_translations[key];
    if (global_language_initialized) {
        console.log("missing language key " + key)
    }
    if (key in TRANSLATION_en) return TRANSLATION_en[key];
    return key
}

function localize_ext(key, params) {
    if (!params) params = {};
    params["interpolation"] = {
        escapeValue: false
    };
    return i18next.t(key, params)
}