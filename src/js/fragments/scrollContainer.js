const SCROLL_El_SELECTOR = ".js-scroll-list";
const SCROLL_END_CLASS = "scroll-end";
const SCROLLING_CLASS = "scrolling";

export const initScrollContainer = () => {
    const scrollEls = document.querySelectorAll(SCROLL_El_SELECTOR);
    scrollEls.forEach((el) => new Scroll(el));
};

class Scroll {
    constructor(scrollEl) {
        this.scrollContainer = scrollEl;
        this.scrollSpeed = 1;

        this.horizontalScrollInit();
    }

    horizontalScrollInit() {
        const scrollContainer = this.scrollContainer;
        if (scrollContainer) {
            let mouseDown = false;
            let startX;
            let scrollLeftScroll;

            this.checkScrollEnd(scrollContainer);

            scrollContainer.addEventListener("mousedown", (e) => {
                mouseDown = true;
                document.body.style.cursor = "grabbing";
                startX = e.pageX - scrollContainer.offsetLeft;
                scrollLeftScroll = scrollContainer.scrollLeft;
            });

            scrollContainer.addEventListener("mousemove", (e) => {
                if (!mouseDown) return;
                e.preventDefault();

                const x = e.pageX - scrollContainer.offsetLeft;
                const walk = (x - startX) * this.scrollSpeed;
                scrollContainer.scrollLeft = scrollLeftScroll - walk;

                this.checkScrollEnd(scrollContainer);
                scrollContainer.parentNode.classList.add(SCROLLING_CLASS);
            });

            scrollContainer.addEventListener("mouseup", () => {
                mouseDown = false;
                document.body.style.cursor = "default";
                scrollContainer.parentNode.classList.remove(SCROLLING_CLASS);
            });

            scrollContainer.addEventListener("mouseleave", () => {
                mouseDown = false;
                document.body.style.cursor = "default";
                scrollContainer.parentNode.classList.remove(SCROLLING_CLASS);
            });

            scrollContainer.addEventListener("wheel", (e) => {
                const isDown = e.deltaY > 0;


                const topCont = !isDown && scrollContainer.scrollLeft == 0;
                const downCont = isDown && scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth;

                const contScroll = topCont || downCont;
                if(contScroll) return;
                
                if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
                    e.preventDefault();
                    scrollContainer.scrollLeft += e.deltaY;
                }
            });

            scrollContainer.addEventListener("scroll", (e) => {
                if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
                    this.checkScrollEnd(scrollContainer);
                }

            });
        }
        return this;
    }

    checkScrollEnd = (scrollableElement, fix = 10) => {
        if (
            scrollableElement.scrollLeft + scrollableElement.clientWidth >=
            scrollableElement.scrollWidth - fix
        ) {
            scrollableElement.parentNode.classList.add(SCROLL_END_CLASS);
        } else {
            scrollableElement.parentNode.classList.remove(SCROLL_END_CLASS);
        }
    };
}

initScrollContainer();
