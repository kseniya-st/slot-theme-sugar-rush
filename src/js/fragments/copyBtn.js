const COPY_SELECTOR = ".js-copy";

const COPY_TEXT_SELECTOR = ".js-copy__text"; //text to be copied
const ACTIVE_TEXT_SELECTOR = ".js-copy__active-text"; //copy confirmation "copied"
const COPY_BTN_SELECTOR = ".js-copy__btn"; // inner btn 

const DATA_ATTR_BTN_ID = "data-copy-btn";
const COPIED_CLASS = "copied";
const COPY_DELAY = 1000;

// Initialize the copy button functionality
export const initCopyBtn = () => {
    document.querySelectorAll(COPY_SELECTOR).forEach((el) => new CopyHandler(el));
};

/**
Copies text by click
    1. If the @el is the btn with copyTextEl with text to copy and hasn't inner buttons (by @el click)
    2. If there are buttons located outside the @el (by @el ID)
    3. If there are inner buttons, located in the @el
**/

class CopyHandler {
    constructor(el) {
        this.el = el;
        this.copyTextEl = el.querySelector(COPY_TEXT_SELECTOR);
        this.innerBtns = el.querySelectorAll(COPY_BTN_SELECTOR);
        this.externalBtns = document.querySelectorAll(
            `[${DATA_ATTR_BTN_ID}="${el.dataset.copyBtn}"]:not(${COPY_SELECTOR})`
        );
        this.activeText = el.dataset.active;
        this.init();
    }

    // Initialize event listeners
    init() {
        const clickHandler = (e) => this.handleCopy(e);

        if (this.innerBtns.length) {
            this.innerBtns.forEach((btn) => btn.addEventListener("click", clickHandler));
        } else {
            this.el.addEventListener("click", clickHandler);
        }

        this.externalBtns.forEach((btn) => btn.addEventListener("click", clickHandler));
    }

    // Handle the copy operation and UI feedback
    async handleCopy(e) {
        const target = e.currentTarget;
        const innerTextEl = this.el.querySelector(ACTIVE_TEXT_SELECTOR) || target;


        if (!target.dataset.initialText && this.activeText) {
            target.dataset.initialText = innerTextEl.textContent.trim();
        }

        if (!target.dataset.initialWidth && this.activeText) {
            const width = target.getBoundingClientRect().width;
            target.dataset.initialWidth = width;
            target.style.maxWidth = `${width}px`;
            target.style.width = `100%`;
        }

        const textToCopy = this.copyTextEl ? this.copyTextEl.textContent : innerTextEl.textContent;

        try {
            await navigator.clipboard.writeText(textToCopy);
            this.el.classList.add(COPIED_CLASS);

      

            if (this.activeText) innerTextEl.textContent = this.activeText;

            clearTimeout(target.timerId);
            target.timerId = setTimeout(() => {
                this.resetUI(target, innerTextEl);
            }, COPY_DELAY);
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    }

    // Reset the UI to its initial state
    resetUI(target, innerTextEl) {
        this.el.classList.remove(COPIED_CLASS);
        if (this.activeText) innerTextEl.textContent = target.dataset.initialText;
        target.removeAttribute("style");
    }
}

initCopyBtn();
