const GO_UP_SELECTOR = ".js-go-up";
const ACTIVE_CLASS = "active";

export const initGoUp = () => {
    const goUpEl = document.querySelector(GO_UP_SELECTOR);

    goUpEl?.addEventListener('click', () => {
        scrollTo({top: 0, behavior: 'smooth'});
    })

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    function handleScroll() {
        const { scrollY } = window;
        const hideBtn = scrollY > 0;

        goUpEl?.classList.toggle(ACTIVE_CLASS, hideBtn);
    }
};

initGoUp();
