const MODAL_SELECTOR = ".js-modal";
const MODAL_CLOSE_SELECTOR = ".js-modal__close";
const MODAL_CONTENT_SELECTOR = ".js-modal__content";
const OPEN_MODAL_BTN_SELECTOR = ".js-modal__open";

const LINK_BTN_SELECTOR = ".js-modal__btn";
const LINK_BTN_CLASS = "js-modal__btn";
const MODAL_TITLE_SELECTOR = ".modal__title";
const MODAL_BODY_SELECTOR = ".modal__body";
const IFRAME_SELECTOR = "iframe";

const NO_SCROLL_CLASS = "no-scroll";

const ACTIVE_CLASS = "active";

export const initModal = () => {
    const modal = document.querySelector(MODAL_SELECTOR);
    if (!modal) return;

    

    const openModalBtns = document.querySelectorAll(OPEN_MODAL_BTN_SELECTOR);
    const modalClose = modal?.querySelector(MODAL_CLOSE_SELECTOR);
    const modalContent = modal?.querySelector(MODAL_CONTENT_SELECTOR);
    const modalBody = modal?.querySelector(MODAL_BODY_SELECTOR);

    modalClose?.addEventListener("click", () => {
        toggleModal(false);
        clearContent();
    });

    modal?.addEventListener("click", (e) => {
        const target = e.target;
        if (target.closest(MODAL_CONTENT_SELECTOR)) return;
        toggleModal(false);
        clearContent();
    });

    openModalBtns.forEach((btn) => {
        btn.addEventListener("click", () => openModal(btn));
    });

    function openModal(btn) {
        clearContent();
        copyContent(btn);
        toggleModal(true);
    }

    function copyContent(btn) {
        const title = btn.dataset.modalTitle;
        const iframeUrl = btn.dataset.modalUrl;

        const modalTitle = modal?.querySelector(MODAL_TITLE_SELECTOR);
        const iframeEl = document.createElement("iframe");

        modalTitle && title ? (modalTitle.textContent = title) : null;
        iframeEl && iframeUrl ? (iframeEl.src = iframeUrl) : null;

        let linkedBtn = btn.parentNode?.querySelector(LINK_BTN_SELECTOR);
        if (linkedBtn) {
            const clonedBtn = linkedBtn.cloneNode(true);
            clonedBtn.classList.add(LINK_BTN_CLASS);
            modalBody.insertAdjacentElement("beforebegin", clonedBtn);
        }

        modalBody?.appendChild(iframeEl);
    }

    function clearContent() {
        const linkedBtn = modal.querySelector(LINK_BTN_SELECTOR);
        if (linkedBtn) linkedBtn.remove();

        const iframeEl = modalBody.querySelector(IFRAME_SELECTOR);
        if (iframeEl) iframeEl.remove();
    }

    function toggleModal(condition) {
        modal?.classList.toggle(ACTIVE_CLASS, condition);
        document.body.classList.toggle(NO_SCROLL_CLASS, condition);
    }
};

initModal();
