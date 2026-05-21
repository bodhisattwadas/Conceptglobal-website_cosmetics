// Wait for DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initScrollSpy();
    initHeroSlider();
    initFilterTabs();
    initReservations();
    initBookings();
    initTestimonials();
    initBrandCarousel();
    initContactForm();
    initPromoCode();
});

/* ==========================================================================
   1. Mobile Navigation & Smooth Scroll Link Offsets
   ========================================================================== */
function initNavigation() {
    const toggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.nav-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            const icon = toggle.querySelector('i');
            if (icon) {
                if (menu.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });

        // Close menu if nav link clicked & handle scroll offset
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                menu.classList.remove('active');
                const icon = toggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';

                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.padding = '5px 0';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            header.style.padding = '0';
        }
    });
}

/* ==========================================================================
   2. ScrollSpy (Highlighter for Single-Page Sections)
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.querySelector('header').offsetHeight;

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + headerHeight + 50; // offset buffer

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < (sectionTop + sectionHeight)) {
                currentSectionId = '#' + section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentSectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/* ==========================================================================
   3. Custom Hero Slider (Home Section)
   ========================================================================== */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots = document.querySelectorAll('.hero-slider .slider-dot');
    
    if (slides.length === 0) return;

    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        currentSlide = index;
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function startInterval() {
        slideInterval = setInterval(nextSlide, 6000);
    }

    function stopInterval() {
        clearInterval(slideInterval);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopInterval();
            showSlide(index);
            startInterval();
        });
    });

    showSlide(0);
    startInterval();
}

/* ==========================================================================
   4. Tab Filtering & Search in Shop Catalog
   ========================================================================== */
function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.products-grid .product-card');
    const searchInput = document.getElementById('shop-search');

    if (cards.length === 0) return;

    let activeFilter = 'all';
    let searchQuery = '';

    function applyFilterAndSearch() {
        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardTitle = card.querySelector('.product-title').textContent.toLowerCase();
            const cardBrand = card.querySelector('.product-category').textContent.toLowerCase();

            const categoryMatch = activeFilter === 'all' || cardCategory === activeFilter;
            const searchMatch = cardTitle.includes(searchQuery) || cardBrand.includes(searchQuery);

            if (categoryMatch && searchMatch) {
                card.style.display = 'flex';
                card.style.animation = 'none';
                card.offsetHeight; // trigger reflow
                card.style.animation = 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Tabs logic
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            activeFilter = tab.getAttribute('data-filter');
            applyFilterAndSearch();
        });
    });

    // Search logic
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            applyFilterAndSearch();
        });
    }
}

/* ==========================================================================
   5. In-Store Product Reservation Cart (Local Storage based)
   ========================================================================== */
const RESERVATION_KEY = 'conceptbeauty_store_reservations';

function getReservations() {
    return JSON.parse(localStorage.getItem(RESERVATION_KEY)) || [];
}

function saveReservations(items) {
    localStorage.setItem(RESERVATION_KEY, JSON.stringify(items));
}

function initReservations() {
    const listCountBadge = document.querySelector('.nav-icon .badge');
    const listBtn = document.getElementById('reservations-btn');
    const drawer = document.getElementById('reservation-drawer');
    const drawerClose = document.getElementById('drawer-close');
    const drawerList = document.getElementById('drawer-list');
    const drawerTotalItems = document.getElementById('drawer-total-items');
    
    if (!drawer) return;

    if (listBtn) {
        listBtn.addEventListener('click', (e) => {
            e.preventDefault();
            drawer.classList.add('active');
        });
    }

    if (drawerClose) {
        drawerClose.addEventListener('click', () => {
            drawer.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (drawer.classList.contains('active') && 
            !drawer.contains(e.target) && 
            e.target !== listBtn && 
            !listBtn.contains(e.target)) {
            drawer.classList.remove('active');
        }
    });

    function updateReservationsUI() {
        const items = getReservations();
        
        if (listCountBadge) {
            listCountBadge.textContent = items.length;
            listCountBadge.style.display = items.length > 0 ? 'block' : 'none';
        }

        drawerList.innerHTML = '';

        if (items.length === 0) {
            drawerList.innerHTML = `
                <div style="text-align: center; padding: 40px 10px; color: #888;">
                    <i class="fas fa-box-open" style="font-size: 2.5rem; color: #ccc; margin-bottom: 15px;"></i>
                    <p>Your reserve list is empty.</p>
                    <p style="font-size: 0.8rem; margin-top: 5px;">Add products you'd like to try or inspect in-store!</p>
                </div>
            `;
            if (drawerTotalItems) drawerTotalItems.textContent = '0 items';
            return;
        }

        if (drawerTotalItems) drawerTotalItems.textContent = `${items.length} item(s)`;

        items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'reservation-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="res-item-details">
                    <div class="res-item-title">${item.title}</div>
                    <div class="res-item-price">${item.price}</div>
                    <div style="font-size:0.75rem; color:#4caf50; margin-top: 2px;"><i class="fas fa-check-circle"></i> In-Store Stock Verified</div>
                </div>
                <button class="res-item-remove" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
            `;
            drawerList.appendChild(itemElement);
        });

        const removeBtns = drawerList.querySelectorAll('.res-item-remove');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                const list = getReservations();
                list.splice(idx, 1);
                saveReservations(list);
                updateReservationsUI();
            });
        });
    }

    document.addEventListener('click', (e) => {
        const reserveBtn = e.target.closest('.reserve-btn');
        if (!reserveBtn) return;
        e.preventDefault();

        const card = reserveBtn.closest('.product-card');
        if (!card) return;

        const id = card.getAttribute('data-id') || 'prod-' + Date.now();
        const title = card.querySelector('.product-title').textContent.trim();
        const price = card.querySelector('.product-price').textContent.replace('Check Boutique Live Stock', '').trim();
        const image = card.querySelector('.product-image-container img').getAttribute('src');

        const list = getReservations();
        const exists = list.some(item => item.title === title);
        
        if (exists) {
            alert(`"${title}" is already in your reservation list. Open the reserve bag at the top right to view!`);
            return;
        }

        list.push({ id, title, price, image });
        saveReservations(list);
        updateReservationsUI();
        drawer.classList.add('active');
    });

    updateReservationsUI();
}

/* ==========================================================================
   6. In-Store Appointment Booking System (Modal and Slots)
   ========================================================================== */
function initBookings() {
    const bookingModal = document.getElementById('booking-modal');
    const bookBtns = document.querySelectorAll('.book-apt-btn');
    const modalCloseBtn = document.getElementById('booking-modal-close');
    const appointmentForm = document.getElementById('appointment-form');
    const timeSlots = document.querySelectorAll('.time-slot');
    const selectedTimeInput = document.getElementById('selected-time');
    const bookingFormContent = document.getElementById('booking-form-content');
    const bookingSuccessContent = document.getElementById('booking-success-content');

    if (!bookingModal) return;

    bookBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            bookingFormContent.style.display = 'block';
            bookingSuccessContent.style.display = 'none';
            bookingModal.classList.add('active');
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            bookingModal.classList.remove('active');
        });
    }

    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.remove('active');
        }
    });

    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            if (selectedTimeInput) {
                selectedTimeInput.value = slot.getAttribute('data-time');
            }
        });
    });

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('apt-name').value.trim();
            const email = document.getElementById('apt-email').value.trim();
            const service = document.getElementById('apt-service').value;
            const date = document.getElementById('apt-date').value;
            const time = selectedTimeInput ? selectedTimeInput.value : '';

            if (!time) {
                alert('Please select an in-store time slot for your appointment.');
                return;
            }

            const bookingRef = 'TF-' + Math.floor(100000 + Math.random() * 900000);
            const bookingDetails = { bookingRef, name, email, service, date, time };

            const allBookings = JSON.parse(localStorage.getItem('conceptbeauty_store_bookings')) || [];
            allBookings.push(bookingDetails);
            localStorage.setItem('conceptbeauty_store_bookings', JSON.stringify(allBookings));

            document.getElementById('success-service').textContent = service;
            document.getElementById('success-date').textContent = date;
            document.getElementById('success-time').textContent = time;
            document.getElementById('success-ref').textContent = bookingRef;

            bookingFormContent.style.display = 'none';
            bookingSuccessContent.style.display = 'flex';
        });
    }
}

/* ==========================================================================
   7. Testimonial Carousel (About Section)
   ========================================================================== */
function initTestimonials() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let timer;

    function showTestimonial(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        currentIndex = index;
    }

    function nextTestimonial() {
        let next = (currentIndex + 1) % slides.length;
        showTestimonial(next);
    }

    function startTimer() {
        timer = setInterval(nextTestimonial, 5000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopTimer();
            showTestimonial(index);
            startTimer();
        });
    });

    showTestimonial(0);
    startTimer();
}

/* ==========================================================================
   8. Brand Logo Carousel
   ========================================================================== */
function initBrandCarousel() {
    const viewport = document.getElementById('brand-carousel');
    if (!viewport) return;

    const track = viewport.querySelector('.brands-carousel-track');
    const group = viewport.querySelector('.brands-logo-group');
    if (!track || !group) return;

    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);

    viewport.querySelectorAll('.brand-logo-card img').forEach(img => {
        img.addEventListener('error', () => {
            const card = img.closest('.brand-logo-card');
            if (card) {
                card.classList.add('logo-missing');
            }
        }, { once: true });
    });

    let isPaused = false;
    let carouselTimer;

    function getLoopWidth() {
        return group.scrollWidth + 16;
    }

    function stepCarousel() {
        if (isPaused) return;

        viewport.scrollLeft += 1;
        if (viewport.scrollLeft >= getLoopWidth()) {
            viewport.scrollLeft = 0;
        }
    }

    function restartCarousel() {
        clearInterval(carouselTimer);
        carouselTimer = setInterval(stepCarousel, 24);
    }

    function moveCarousel(direction) {
        isPaused = true;
        viewport.scrollBy({
            left: direction * 360,
            behavior: 'smooth'
        });

        window.setTimeout(() => {
            if (!viewport.matches(':hover') && document.activeElement !== viewport) {
                isPaused = false;
            }
        }, 1200);
    }

    document.querySelectorAll('[data-brand-carousel]').forEach(button => {
        button.addEventListener('click', () => {
            const direction = button.dataset.brandCarousel === 'prev' ? -1 : 1;
            moveCarousel(direction);
        });
    });

    viewport.addEventListener('mouseenter', () => { isPaused = true; });
    viewport.addEventListener('mouseleave', () => { isPaused = false; });
    viewport.addEventListener('focusin', () => { isPaused = true; });
    viewport.addEventListener('focusout', () => { isPaused = false; });

    restartCarousel();
}

/* ==========================================================================
   9. Drop Us a Line Form Submission Handler (Contact Section)
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-us-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        setTimeout(() => {
            contactForm.innerHTML = `
                <div class="booking-success-screen" style="padding: 20px 0;">
                    <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                    <h3 class="booking-success-title">Message Received!</h3>
                    <p style="color: #666; font-size: 0.95rem; line-height: 1.6; max-width: 420px; margin: 0 auto 20px auto;">
                        Thank you for reaching out to Concept Beauty Indian Boutique. One of our store beauty advisors will review your inquiry and email you back within 24 hours.
                    </p>
                    <button class="btn-luxury" onclick="window.location.reload();">Send Another Message</button>
                </div>
            `;
        }, 1500);
    });
}

/* ==========================================================================
   9. Promotion Discount / Store Check-In Code Handler
   ========================================================================== */
function initPromoCode() {
    const promoForm = document.getElementById('promo-discount-form');
    const promoSuccess = document.getElementById('promo-success-msg');

    if (!promoForm) return;

    promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = promoForm.querySelector('input[type="email"]').value.trim();

        if (email) {
            const couponCode = 'TRYIND' + Math.floor(100 + Math.random() * 900);
            
            promoForm.style.display = 'none';
            if (promoSuccess) {
                promoSuccess.innerHTML = `
                    <i class="fas fa-ticket-alt"></i> <strong>SUCCESS!</strong> Show this code at our showroom billing counter for 10% off: <strong style="font-size: 1.1rem; letter-spacing: 1px; color:#1a1a1a; display: block; margin-top: 5px;">${couponCode}</strong>
                `;
                promoSuccess.style.display = 'block';
            }
        }
    });
}

/* ==========================================================================
   10. Localized Showroom Product Availability Checker (Indian Showrooms)
   ========================================================================== */
window.checkStoreAvailability = function(productName) {
    const stores = [
        { name: "Kolkata Baranagar Showroom (BK Moitra Rd)", stock: "In Stock (Aisle 2A)" },
        { name: "Kolkata Salt Lake Boutique", stock: "In Stock (Aisle 3C)" },
        { name: "Kolkata Gariahat Experience Lounge", stock: "Low Stock (2 items left)" }
    ];

    let message = `Boutique Availability for "${productName}":\n\n`;
    stores.forEach(store => {
        message += `• ${store.name}: ${store.stock}\n`;
    });
    message += `\nWould you like to hold a unit at our cosmetics counter? Simply add it to your reserve list!`;
    
    alert(message);
};
