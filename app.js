

// Selecting elements
const menuToggle = document.getElementById("menu-toggle");
const closeMenu = document.getElementById("close-menu");
const navList = document.getElementById("nav-list");

// Open menu when burger icon is clicked
menuToggle.addEventListener("click", () => {
    navList.classList.add("active");
});

// Close menu when "X" icon is clicked
closeMenu.addEventListener("click", () => {
    navList.classList.remove("active");
});





let currentIndex = 0;
const slides = document.querySelectorAll(".item");
const dots = document.querySelectorAll(".dot");

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

setInterval(autoSlide, 6000); // Change image every 3 seconds

showSlide(currentIndex);






document.addEventListener("DOMContentLoaded", function () {
    let aboutIndex = 0;
    const aboutSlides = document.querySelectorAll(".slider .slide");
    const dots = document.querySelectorAll(".dot");

    function showSlide(index) {
        aboutSlides.forEach((slide, i) => {
            slide.classList.toggle("active", i === index);
            dots[i].classList.toggle("active", i === index);
        });
    }

    function moveSlide(step) {
        aboutIndex += step;
        if (aboutIndex >= aboutSlides.length) aboutIndex = 0;
        if (aboutIndex < 0) aboutIndex = aboutSlides.length - 1;
        showSlide(aboutIndex);
    }

    document.querySelector(".prev").addEventListener("click", () => moveSlide(-1));
    document.querySelector(".next").addEventListener("click", () => moveSlide(1));
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            aboutIndex = i;
            showSlide(i);
        });
    });

    setInterval(() => moveSlide(1), 3000);
});



let currentTestimonialIndex = 0;
const testimonialSlides = document.querySelectorAll("#testimonialSlider .testimonial-slide");
const testimonialDots = document.querySelectorAll("#testimonialDots .testimonial-dot");
const testimonialPrevBtn = document.getElementById("testimonialPrevBtn");
const testimonialNextBtn = document.getElementById("testimonialNextBtn");

function showTestimonialSlide(index) {
    testimonialSlides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        testimonialDots[i].classList.toggle("active", i === index);
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

// Add Event Listeners
testimonialPrevBtn.addEventListener("click", () => moveTestimonialSlide(-1));
testimonialNextBtn.addEventListener("click", () => moveTestimonialSlide(1));
testimonialDots.forEach((dot, index) => {
    dot.addEventListener("click", () => setCurrentTestimonialSlide(index));
});

// Auto-slide every 5 seconds
setInterval(() => moveTestimonialSlide(1), 5000);



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
        if(accBody[0].style.display == "block"){ 
          accBody[0].style.display = "none";
        }else{
          accBody[0].style.display = "block";
        }
      }

      function toggleAccordion(element) {
        let parent = element.parentElement;
        parent.classList.toggle("active");
    }
    

    let autoSliderTrack = document.querySelector('.auto-slider-track');

function pauseAutoSlider() {
    autoSliderTrack.style.animationPlayState = 'paused';
}

function startAutoSlider() {
    autoSliderTrack.style.animationPlayState = 'running';
}

