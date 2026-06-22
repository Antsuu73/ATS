/**
 * Mobile navigation — hamburger menu cho màn hình nhỏ.
 */

function getCurrentPage() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    return path;
}

function setActiveNavLink(link) {
    const href = link.getAttribute("href") || "";
    const page = href.split("/").pop();
    const current = getCurrentPage();

    if (page === current || (current === "" && page === "index.html")) {
        link.classList.add("active");
    }
}

function closeMenu(toggle, menu, backdrop) {
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    document.body.classList.remove("nav-open");
}

function openMenu(toggle, menu, backdrop) {
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
    backdrop.classList.add("is-visible");
    document.body.classList.add("nav-open");
}

function initMobileNav() {
    const navContainer = document.querySelector(".navbar .nav-container");
    const menu = document.querySelector(".nav-menu");
    const authArea = document.querySelector(".auth-area");

    if (!navContainer || !menu || document.getElementById("navToggle")) return;

    menu.querySelectorAll("a").forEach(setActiveNavLink);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "navToggle";
    toggle.className = "nav-toggle";
    toggle.setAttribute("aria-label", "Mở menu điều hướng");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<span></span><span></span><span></span>";

    const backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    if (authArea) {
        navContainer.insertBefore(toggle, authArea);
    } else {
        navContainer.appendChild(toggle);
    }

    document.body.appendChild(backdrop);

    toggle.addEventListener("click", () => {
        if (toggle.classList.contains("is-open")) {
            closeMenu(toggle, menu, backdrop);
        } else {
            openMenu(toggle, menu, backdrop);
        }
    });

    backdrop.addEventListener("click", () => {
        closeMenu(toggle, menu, backdrop);
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu(toggle, menu, backdrop);
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && toggle.classList.contains("is-open")) {
            closeMenu(toggle, menu, backdrop);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768 && toggle.classList.contains("is-open")) {
            closeMenu(toggle, menu, backdrop);
        }
    });
}

document.addEventListener("DOMContentLoaded", initMobileNav);
