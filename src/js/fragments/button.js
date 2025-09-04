const SF_LINK_SELECTOR = ".sf-link";

export const initButton = () => {
    const sfLinks = document.querySelectorAll(SF_LINK_SELECTOR);
    if (!sfLinks || sfLinks.length <= 0) return;

    sfLinks.forEach((link) => {
        link.addEventListener("click", followLink);
    });
};

const followLink = (e) => {
    const { target: link } = e;
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
};

initButton();
