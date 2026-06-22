/**
 * Shared scroll & entrance animations for ATS pages.
 */

const REVEAL_SELECTOR = [
    ".section",
    ".section-header",
    ".stat-card",
    ".hero-card",
    ".card",
    ".lesson-card",
    ".viz-card",
    ".roadmap-card",
    ".problems-header",
    ".lessons-header",
    ".visualizers-header",
    ".roadmaps-header",
    ".profile-card",
    ".viz-panel",
    ".lesson-article",
    ".problem-detail-card",
    ".roadmap-hero",
    ".roadmap-steps",
    ".problems-table-wrap",
    ".progress-wrapper",
    ".problem-row"
].join(", ");

const STAGGER_GRIDS = [
    ".cards-grid",
    ".lessons-grid",
    ".visualizers-grid",
    ".roadmaps-grid",
    ".stats-grid",
    ".tags",
    ".problems-table tbody"
];

let revealObserver = null;

function initPageReady() {
    requestAnimationFrame(() => {
        document.body.classList.add("page-ready");
    });
}

function initNavbar() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle("navbar--scrolled", window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
}

function applyStaggerDelays(root = document) {
    STAGGER_GRIDS.forEach((selector) => {
        root.querySelectorAll(selector).forEach((grid) => {
            [...grid.children].forEach((child, index) => {
                if (!child.classList.contains("reveal")) {
                    child.classList.add("reveal");
                }
                child.style.setProperty("--reveal-delay", `${Math.min(index * 0.07, 0.42)}s`);
            });
        });
    });
}

function getRevealObserver() {
    if (revealObserver) return revealObserver;

    revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    return revealObserver;
}

function observeRevealElements(root = document) {
    const observer = getRevealObserver();

    root.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
        observer.observe(el);
    });
}

function initScrollReveal() {
    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (!el.classList.contains("reveal")) {
            el.classList.add("reveal");
        }
    });

    applyStaggerDelays();
    observeRevealElements();
}

function refreshATSAnimations(root = document) {
    root.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (!el.classList.contains("reveal")) {
            el.classList.add("reveal");
        }
    });

    applyStaggerDelays(root);
    observeRevealElements(root);
}

function initHeroAnimate() {
    const heroContent = document.querySelector(".hero-content");
    if (heroContent && !heroContent.classList.contains("hero-animate")) {
        heroContent.classList.add("hero-animate");
    }

    const heroCard = document.querySelector(".hero-card");
    if (heroCard) {
        heroCard.classList.add("reveal");
        setTimeout(() => heroCard.classList.add("is-visible"), 400);
    }
}

function pulseProgressBars() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
            if (m.type === "attributes" && m.attributeName === "style") {
                const wrap = m.target.closest(".progress-bar, .line, .topic-progress");
                wrap?.classList.add("progress-pulse");
                setTimeout(() => wrap?.classList.remove("progress-pulse"), 900);
            }
        });
    });

    document.querySelectorAll(".progress-fill, .line-fill").forEach((bar) => {
        observer.observe(bar, { attributes: true, attributeFilter: ["style"] });
    });
}

function initLoginPage() {
    if (document.querySelector(".login-card")) {
        document.body.classList.add("login-page");
        document.body.classList.add("page-ready");
    }
}

function initDemoBars() {
    const bars = document.querySelectorAll(".bars .bar");
    if (!bars.length) return;

    setInterval(() => {
        bars.forEach((bar) => {
            bar.style.height = `${Math.floor(Math.random() * 70) + 15}px`;
        });
    }, 1200);
}

document.addEventListener("DOMContentLoaded", () => {
    initLoginPage();
    initPageReady();
    initNavbar();
    initHeroAnimate();
    initScrollReveal();
    pulseProgressBars();
    initDemoBars();
});

window.refreshATSAnimations = refreshATSAnimations;
