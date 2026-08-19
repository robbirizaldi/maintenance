/* 1. Light/Dark Theme Switcher */
const themeToggle = document.getElementById('theme-toggle');
const themeHint = document.getElementById('theme-hint');

themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeHint.innerHTML = '<i class="fa-regular fa-moon"></i> Dark';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeHint.innerHTML = '<i class="fa-regular fa-sun"></i> Light';
    }
});

/* 2. Lazy Loading Gambar */
document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll("img.lazy");
    if ("IntersectionObserver" in window) {
        let imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.remove("lazy");
                    imageObserver.unobserve(image);
                }
            });
        });
        lazyImages.forEach(image => imageObserver.observe(image));
    } else {
        lazyImages.forEach(image => image.src = image.dataset.src);
    }
});

/* 3. Accordion */
const accordions = document.querySelectorAll('.accordion-header');
accordions.forEach(acc => {
    acc.addEventListener('click', function() {
        const body = this.nextElementSibling;
        const icon = this.querySelector('i');
        
        if (body.style.maxHeight) {
            body.style.maxHeight = null;
            icon.className = 'fa-solid fa-plus';
        } else {
            document.querySelectorAll('.accordion-body').forEach(b => b.style.maxHeight = null);
            document.querySelectorAll('.accordion-header i').forEach(i => i.className = 'fa-solid fa-plus');
            body.style.maxHeight = body.scrollHeight + "px";
            icon.className = 'fa-solid fa-minus';
        }
    });
});

/* 4. Carousel */
let currentSlide = 0;
function moveSlide(direction) {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

/* 5. Modal Portfolio */
const projectData = {
    'project-1': {
        title: "01. Minimalist Editorial Layout",
        image: "https://picsum.photos/800/400?random=1",
        text: "This project explores print-inspired typography on digital screens."
    },
    'project-2': {
        title: "02. Architectural Photography Archive",
        image: "https://picsum.photos/800/400?random=2",
        text: "A curated digital repository documenting mid-century brutalist structures."
    },
    'project-3': {
        title: "03. Sustainable Brand Identity",
        image: "https://picsum.photos/800/400?random=3",
        text: "A comprehensive brand identity refresh for an eco-friendly textile manufacturer."
    },
    'project-4': {
        title: "04. Interactive Essay Collection",
        image: "https://picsum.photos/800/400?random=4",
        text: "An experiment combining traditional literary essay structures with web interactions."
    }
};

function openModal(projectId) {
    const modal = document.getElementById('portfolio-modal');
    const content = document.getElementById('modal-body-content');
    const data = projectData[projectId];

    if (data) {
        content.innerHTML = `
            <h2 style="font-size: 2rem; margin-bottom: 20px;">${data.title}</h2>
            <img src="${data.image}" alt="${data.title}" style="width:100%; margin-bottom: 20px; border: 1px solid var(--border-color);">
            <p style="font-size: 1.1rem; line-height: 1.8;">${data.text}</p>
        `;
        modal.style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('portfolio-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('portfolio-modal');
    if (event.target == modal) modal.style.display = 'none';
};

/* 6. Scroll to Top */
const scrollTopBtn = document.getElementById("scrollTopBtn");
window.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop > 200) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
