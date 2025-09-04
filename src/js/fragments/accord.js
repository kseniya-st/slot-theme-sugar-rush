const ACCORD_SELECTOR = ".js-accord";
const ACCORD_TRIGGER_SELECTOR = ".js-accord__trigger";
const ACTIVE_CLASS = "active";

export const initAccord = () => {
    const accordEls = document.querySelectorAll(ACCORD_SELECTOR);
    accordEls.forEach((el) => initAccordEl(el));
};

const initAccordEl = (el) => {
    const trigger = el.querySelector(ACCORD_TRIGGER_SELECTOR);
    if (trigger) {
        trigger.addEventListener("click", () => el.classList.toggle(ACTIVE_CLASS));
    }
};

initAccord();
