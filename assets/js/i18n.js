const i18n = {
    currentLang: "en",
    translations: {},
    async loadTranslations(lang) {
        const response = await fetch(`../i18n/${lang}.json`);
        this.translations = await response.json();
        this.currentLang = lang;
        this.translatePage();
    },

    translatePage() {
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.getAttribute("data-i18n");
            const translation = this.getTranslation(key);
            if (translation) {
            if (element.tagName === "TITLE") {
                document.title = translation;
            } else {
                element.textContent = translation;
            }
            }
        });
    },

    getTranslation(key) {
        return key.split(".").reduce((obj, i) => obj?.[i], this.translations);
    },

    setLanguage(lang) {
        localStorage.setItem("language", lang);
        this.loadTranslations(lang);
    },

    init() {
        const savedLang = localStorage.getItem("language") || "en";
        this.loadTranslations(savedLang);
    },
};

i18n.init();