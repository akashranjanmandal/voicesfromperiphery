
// Selecting elements
const menuToggle = document.getElementById("menu-toggle");
const closeMenu = document.getElementById("close-menu");
const navList = document.getElementById("nav-list");

// Open menu when burger icon is clicked
if (menuToggle && navList) {
    menuToggle.addEventListener("click", () => {
        navList.classList.add("active");
    });
}

// Close menu when "X" icon is clicked
if (closeMenu && navList) {
    closeMenu.addEventListener("click", () => {
        navList.classList.remove("active");
    });
}


// Hero image slider (legacy markup: #home .item / #home .dot)
let currentIndex = 0;
const slides = document.querySelectorAll("#home .item");
const dots = document.querySelectorAll("#home .dot");

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
    currentIndex = index;
}

function moveToSlide(index) {
    showSlide(index);
}
function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
}
function autoSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
}

if (slides.length) {
    setInterval(autoSlide, 6000);
    showSlide(currentIndex);
}


// Quote slider (legacy markup: .slider .slide)
document.addEventListener("DOMContentLoaded", function () {
    let aboutIndex = 0;
    const aboutSlides = document.querySelectorAll(".slider .slide");
    const dots = document.querySelectorAll(".slider-container .dot");
    const prev = document.querySelector(".slider-container .prev");
    const next = document.querySelector(".slider-container .next");
    if (!aboutSlides.length || !prev || !next) return;

    function showSlide(index) {
        aboutSlides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
            if (dots[i]) dots[i].classList.toggle("active", i === index);
        });
    }

    function moveSlide(step) {
        aboutIndex += step;
        if (aboutIndex >= aboutSlides.length) aboutIndex = 0;
        if (aboutIndex < 0) aboutIndex = aboutSlides.length - 1;
        showSlide(aboutIndex);
    }

    prev.addEventListener("click", () => moveSlide(-1));
    next.addEventListener("click", () => moveSlide(1));
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            aboutIndex = i;
            showSlide(i);
        });
    });

    setInterval(() => moveSlide(1), 3000);
});


// Testimonial slider (legacy markup: #testimonialSlider)
let currentTestimonialIndex = 0;
const testimonialSlides = document.querySelectorAll("#testimonialSlider .testimonial-slide");
const testimonialDots = document.querySelectorAll("#testimonialDots .testimonial-dot");
const testimonialPrevBtn = document.getElementById("testimonialPrevBtn");
const testimonialNextBtn = document.getElementById("testimonialNextBtn");

function showTestimonialSlide(index) {
    testimonialSlides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        if (testimonialDots[i]) testimonialDots[i].classList.toggle("active", i === index);
    });
}

function moveTestimonialSlide(step) {
    currentTestimonialIndex += step;
    if (currentTestimonialIndex >= testimonialSlides.length) currentTestimonialIndex = 0;
    if (currentTestimonialIndex < 0) currentTestimonialIndex = testimonialSlides.length - 1;
    showTestimonialSlide(currentTestimonialIndex);
}

function setCurrentTestimonialSlide(index) {
    currentTestimonialIndex = index;
    showTestimonialSlide(index);
}

if (testimonialSlides.length && testimonialPrevBtn && testimonialNextBtn) {
    testimonialPrevBtn.addEventListener("click", () => moveTestimonialSlide(-1));
    testimonialNextBtn.addEventListener("click", () => moveTestimonialSlide(1));
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener("click", () => setCurrentTestimonialSlide(index));
    });
    setInterval(() => moveTestimonialSlide(1), 5000);
}


// Team member popup
function openPopup(imageSrc, name, designation) {
    document.getElementById("popup-img").src = imageSrc;
    document.getElementById("popup-name").textContent = name;
    document.getElementById("popup-designation").textContent = designation;
    document.getElementById("popup").classList.add("active");
}

function closePopup() {
    document.getElementById("popup").classList.remove("active");
}


document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
        button.classList.toggle("active");
        const answer = button.nextElementSibling;
        if (answer.style.display === "block") {
            answer.style.display = "none";
        } else {
            answer.style.display = "block";
        }
    });
});


function showAccordionBody() {
    let accBody = document.getElementsByClassName("accordionBody");
    if (accBody[0].style.display == "block") {
        accBody[0].style.display = "none";
    } else {
        accBody[0].style.display = "block";
    }
}

function toggleAccordion(element) {
    let parent = element.parentElement;
    parent.classList.toggle("active");
}


let autoSliderTrack = document.querySelector('.auto-slider-track');

function pauseAutoSlider() {
    if (autoSliderTrack) autoSliderTrack.style.animationPlayState = 'paused';
}

function startAutoSlider() {
    if (autoSliderTrack) autoSliderTrack.style.animationPlayState = 'running';
}
