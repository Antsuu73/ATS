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


// Navbar & button hovers → js/animations.js
