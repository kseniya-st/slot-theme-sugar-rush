const TOC_SELECTOR = ".js-toc";
const TOC_TRIGGER_SELECTOR = ".js-toc__trigger";
const ACTIVE_CLASS = "active";

export const initToc = () => {
    const tocList = document.querySelectorAll(TOC_SELECTOR);
    tocList.forEach((el) => initContentElement(el));
};

const initContentElement = (el) => {
    const trigger = el.querySelector(TOC_TRIGGER_SELECTOR);
    if (trigger) {
        trigger.addEventListener("click", () => el.classList.toggle(ACTIVE_CLASS));
    }
};

initToc();
