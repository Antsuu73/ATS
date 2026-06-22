// Counter Animation

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.target);

        let current = 0;

        const increment = Math.max(1, Math.ceil(target / 100));

        const updateCounter = () => {

            current += increment;

            if (current >= target) {

                counter.textContent = target.toLocaleString() + "+";
                return;
            }

            counter.textContent = current.toLocaleString();

            requestAnimationFrame(updateCounter);
        };

        updateCounter();

        counterObserver.unobserve(counter);

    });

}, {
    threshold: 0.4
});

counters.forEach(counter => {
    counterObserver.observe(counter);
});


// Fade Up Animation

const fadeElements = document.querySelectorAll(
    ".section, .stat-card, .hero-card"
);

fadeElements.forEach(element => {
    element.classList.add("fade-up");
});

const fadeObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }

    });

}, {
    threshold: 0.15
});

fadeElements.forEach(element => {
    fadeObserver.observe(element);
});


// Navbar Shadow On Scroll

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 20) {

        navbar.style.boxShadow =
            "0 2px 12px rgba(0,0,0,0.08)";

    } else {

        navbar.style.boxShadow = "none";
    }

});


// Visualizer Bars Random Animation

const bars = document.querySelectorAll(".bar");

setInterval(() => {

    bars.forEach(bar => {

        const randomHeight =
            Math.floor(Math.random() * 70) + 15;

        bar.style.height = randomHeight + "px";

    });

}, 1200);


// Smooth Button Hover

const buttons = document.querySelectorAll(
    ".btn-primary, .btn-secondary, .btn-login"
);

buttons.forEach(button => {

    button.addEventListener("mouseenter", () => {

        button.style.transform = "translateY(-2px)";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "translateY(0)";

    });

});