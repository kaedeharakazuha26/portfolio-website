document.addEventListener("DOMContentLoaded", () => {
    const revealItems = document.querySelectorAll(".reveal");
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const sections = document.querySelectorAll("main section[id]");
    const contactForm = document.querySelector("#contact-form");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("IntersectionObserver" in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: "-30% 0px -60% 0px" });

    sections.forEach((section) => sectionObserver.observe(section));

    document.querySelectorAll("[data-tilt]").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            if (reduceMotion || window.innerWidth < 768) return;
            const bounds = card.getBoundingClientRect();
            const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -5;
            const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 5;
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener("pointerleave", () => {
            card.style.transform = "";
        });
    });

    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
        const track = carousel.querySelector(".carousel-track");
        const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
        const previousButton = carousel.querySelector("[data-carousel-prev]");
        const nextButton = carousel.querySelector("[data-carousel-next]");
        const status = carousel.querySelector(".carousel-status");
        let currentIndex = 0;

        if (!track || !slides.length || !previousButton || !nextButton || !status) return;

        const getVisibleSlides = () => Number.parseInt(
            getComputedStyle(carousel).getPropertyValue("--carousel-items"),
            10
        ) || 1;

        const updateCarousel = () => {
            const visibleSlides = getVisibleSlides();
            const maximumIndex = Math.max(0, slides.length - visibleSlides);
            currentIndex = Math.min(currentIndex, maximumIndex);
            const slideWidth = slides[0].getBoundingClientRect().width;
            const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;

            track.style.transform = `translateX(-${currentIndex * (slideWidth + gap)}px)`;
            previousButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === maximumIndex;
            status.textContent = `${currentIndex + 1}-${Math.min(currentIndex + visibleSlides, slides.length)} of ${slides.length}`;
        };

        previousButton.addEventListener("click", () => {
            currentIndex -= 1;
            updateCarousel();
        });

        nextButton.addEventListener("click", () => {
            currentIndex += 1;
            updateCarousel();
        });

        window.addEventListener("resize", updateCarousel);
        updateCarousel();
    });

    // Theme switcher (Light / Dark mode)
    const themeToggleBtn = document.querySelector("#theme-toggle");
    const darkIcon = document.querySelector(".theme-icon-dark");
    const lightIcon = document.querySelector(".theme-icon-light");

    const getPreferredTheme = () => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) return storedTheme;
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute("data-bs-theme", theme);
        if (theme === "light") {
            if (darkIcon) darkIcon.classList.add("d-none");
            if (lightIcon) lightIcon.classList.remove("d-none");
        } else {
            if (darkIcon) darkIcon.classList.remove("d-none");
            if (lightIcon) lightIcon.classList.add("d-none");
        }
    };

    const currentTheme = getPreferredTheme();
    applyTheme(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-bs-theme") || "dark";
            const next = current === "dark" ? "light" : "dark";
            localStorage.setItem("theme", next);
            applyTheme(next);
        });
    }

    // Typewriter effect
    const typewriterElement = document.querySelector(".typewriter-text");
    if (typewriterElement && !reduceMotion) {
        const words = JSON.parse(typewriterElement.getAttribute("data-typewriter") || "[]");
        if (words.length > 0) {
            let wordIndex = 0;
            let charIndex = words[0].length;
            let isDeleting = false;
            let typingSpeed = 100;

            const type = () => {
                const currentWord = words[wordIndex];
                if (isDeleting) {
                    typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
                    charIndex--;
                    typingSpeed = 50;
                } else {
                    typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
                    charIndex++;
                    typingSpeed = 90;
                }

                if (!isDeleting && charIndex === currentWord.length) {
                    typingSpeed = 2200; // Pause after finishing word
                    isDeleting = true;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    typingSpeed = 400; // Pause before typing next word
                }

                setTimeout(type, typingSpeed);
            };

            // Start typing cycle after initial display
            setTimeout(type, 2000);
        }
    }

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const feedback = contactForm.querySelector(".form-feedback");
            feedback.textContent = "Thanks! Your message is ready to be connected to a form service.";
            contactForm.reset();
        });
    }
});