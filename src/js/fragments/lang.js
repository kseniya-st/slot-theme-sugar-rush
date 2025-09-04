import { debounce } from "../utils/debounce.js";

const LANG_SELECTOR = ".js-lang";
const LANG_ACTIVE_CLASS = "active";

export const initLang = () => {
    const allLangEls = document.querySelectorAll(LANG_SELECTOR);
    let currentWidth = window.innerWidth;

    allLangEls.forEach((el) => {
        initLangEl(el);
    });

    window.addEventListener(
        "resize",
        debounce(() => {
            if (currentWidth == window.innerWidth) return;
            currentWidth = window.innerWidth;
            allLangEls.forEach((el) => el.classList.remove(LANG_ACTIVE_CLASS));
        }, 100)
    );
};

function initLangEl(el) {
    el.addEventListener("click", () => {
        el.classList.toggle(LANG_ACTIVE_CLASS, !el.classList.contains(LANG_ACTIVE_CLASS));
    });
}

initLang();

