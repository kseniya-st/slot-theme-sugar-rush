import { debounce } from "../utils/debounce";

const HEADER_SELECTOR = ".js-header";
const BURGER_SELECTOR = ".js-burger";

const MENU_SELECTOR = ".js-menu";
const MENU_ITEM_SELECTOR = ".js-menu__item";
const MENU_LIST_SELECTOR = ".js-menu__list";
const SUBMENU_SELECTOR = ".submenu";

const LEFT_ALIGN_CLASS = "item_left";
const NO_SCROLL_CLASS = "no-scroll";
const MENU_ACTIVE_CLASS = "menu-active";
const MENU_ITEM_ACTIVE_CLASS = "active";

export const header = () => {
    const header = document.querySelector(HEADER_SELECTOR);
    header ? new Header(header).init() : null;
};

export class Header {
    constructor(header) {
        this.header = header;
        this.currentWidth = window.innerWidth;

        this.burgerEl = document.querySelector(BURGER_SELECTOR);
        this.menuEl = document.querySelector(MENU_SELECTOR);
        this.menuItems = this.menuEl?.querySelectorAll(MENU_ITEM_SELECTOR);

        // for MULTI-LEVEl menu
        this.firstLevelMenuItems = this.menuEl?.querySelectorAll(
            `:scope > ${MENU_LIST_SELECTOR} > ${MENU_ITEM_SELECTOR}`
        );
    }

    init() {
        this.initBurger();
        this.initMenu();
        this.updateOrientation();
        this.setHeaderHeight();


        window.addEventListener(
            "resize",
            debounce(() => {
                this.handleResize();
            }, 100)
        );
    }

    handleResize() {
        if (this.currentWidth !== window.innerWidth) {
            this.currentWidth = window.innerWidth;
            this.closeMenu();
            this.updateOrientation(); // if multi-level menu
            this.setHeaderHeight();
        }
    }

    initBurger() {
        this.burgerEl?.addEventListener("click", () => this.toggleMenu());
    }

    initMenu() {
        this.menuItems?.forEach((item) => {
            let innerLink = item.querySelector(":scope > a");
            innerLink?.addEventListener("click", (e) => {
                if (item.classList.contains(MENU_ITEM_ACTIVE_CLASS)) e.preventDefault();
            });
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggleMenuItem(item);
            });
        });
    }

    toggleMenuItem = (item) => {
        if (!item.classList.contains(MENU_ITEM_ACTIVE_CLASS)) this.closeItemsInParentList(item);
        item.classList.toggle(MENU_ITEM_ACTIVE_CLASS);
    };

    // Close items in list
    closeItemsInParentList = (item) => {
        let list = item.closest(MENU_LIST_SELECTOR);
        const listItems = list.querySelectorAll(`:scope > ${MENU_ITEM_SELECTOR}`);
        listItems.forEach((el) => el.classList.remove(MENU_ITEM_ACTIVE_CLASS));
    };

    toggleMenu() {
        this.header.classList.contains(MENU_ACTIVE_CLASS) ? this.closeMenu() : this.openMenu();
    }

    closeMenu() {
        this.header?.classList.remove(MENU_ACTIVE_CLASS);
        document.body.classList.remove(NO_SCROLL_CLASS);
        this.menuItems?.forEach((item) => item.classList.remove(MENU_ITEM_ACTIVE_CLASS));
    }

    openMenu() {
        window.scrollTo({ top: 0, left: 0 });
        this.header?.classList.add(MENU_ACTIVE_CLASS);
        document.body.classList.add(NO_SCROLL_CLASS);
    }

    setHeaderHeight() {
        const headerHeight = this.header.getBoundingClientRect().height;
        this.header.style.setProperty("--header-height", `${headerHeight}px`);
    }

    /**
     * !! for MULTI-LEVEL menu !!
     * Change menu orientation (left/right) on desktop
     * If inner menu level goes beyond the window
     */
    updateOrientation() {
        this.firstLevelMenuItems?.forEach((item) => {
            item.classList.remove(LEFT_ALIGN_CLASS);
            let submenu = item.querySelectorAll(`:scope > ${SUBMENU_SELECTOR}`);

            let width = Array.from(submenu).reduce((acc, el) => {
                el.style.display = "block";
                let elWidth = el.getBoundingClientRect().width;
                let innerSubmenu = el.querySelectorAll(SUBMENU_SELECTOR);
                let maxWidth = 0;
                innerSubmenu.forEach((innerEl) => {
                    innerEl.style.display = "block";
                    maxWidth = Math.max(maxWidth, innerEl.getBoundingClientRect().width);
                    innerEl.removeAttribute("style");
                });
                el.removeAttribute("style");
                return acc + elWidth + maxWidth;
            }, 0);

            if (window.innerWidth - item.getBoundingClientRect().left - 80 < width) {
                item.classList.add(LEFT_ALIGN_CLASS);
            }
        });
    }
}

header();
