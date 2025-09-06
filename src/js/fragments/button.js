const SF_LINK_SELECTOR = ".sf-link";

export const initButton = () => {
    document.addEventListener("click", (e) => {
        const link = e.target.closest(SF_LINK_SELECTOR);
        if (!link) return;
        const { sfA: sfLink, prevent } = link.dataset;
        if (parseInt(prevent) > 0) return;

        if (sfLink) {
            try {
                document.location.href = atob(sfLink);
            } catch (e) {
                console.error("Failed to decode Base64 string:", e);
            }
        }
    });
};

initButton();
