document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initSmoothScroll();
    initContactForm();
    initNavbarScroll();
    initLanguageSelector();
    initFooterLanguageLinks();
    initTeamBioToggle();
    updateCopyrightYear();
    initCountUp();
});

function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function () {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', function (event) {
        const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href === '#' || href === '') {
                e.preventDefault();
                return;
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar.offsetHeight;
                const navbarTop = navbar.offsetTop;
                const targetPosition = targetElement.offsetTop - navbarHeight - navbarTop - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const scrollThreshold = 50;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function getLanguage() {
    const htmlLang = document.documentElement.getAttribute('lang');
    return htmlLang === 'en' ? 'en' : 'ar';
}

function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    const lang = getLanguage();
    const messages = {
        ar: {
            wait: 'يرجى الانتظار قليلاً قبل إرسال رسالة أخرى',
            sending: 'جاري الإرسال...',
            success: 'وصلتنا رسالتك ✅ بنرد عليك بأسرع وقت ممكن بإذن الله.',
            error: 'الرسالة ماوصلت ❌',
            submit: 'إرسال الرسالة'
        },
        en: {
            wait: 'Please wait a moment before sending another message',
            sending: 'Sending...',
            success: 'We received your message ✅ We will reply to you as soon as possible, God willing.',
            error: 'Message not sent ❌',
            submit: 'Send Message'
        }
    };

    let lastSubmitTime = 0;
    const submitCooldown = 5000;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const now = Date.now();
        if (now - lastSubmitTime < submitCooldown) {
            showMessage(messages[lang].wait, 'error');
            return;
        }

        const honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value !== '') {
            return;
        }

        if (!validateForm()) {
            return;
        }

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            type: document.getElementById('type').value,
            targetEmail: document.getElementById('targetEmail').value,
            message: document.getElementById('message').value.trim()
        };

        const submitButton = form.querySelector('.submit-button');
        const btnText = submitButton?.querySelector('.submit-btn-text');
        submitButton.disabled = true;
        if (btnText) btnText.textContent = messages[lang].sending;

        try {
            const response = await sendContactRequest(formData);

            if (response.ok) {
                showMessage(messages[lang].success, 'success');
                form.reset();
                lastSubmitTime = now;
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending form:', error);
            showMessage(messages[lang].error, 'error');
        } finally {
            submitButton.disabled = false;
            if (btnText) btnText.textContent = messages[lang].submit;
        }
    });
}

function validateForm() {
    const lang = getLanguage();
    const messages = {
        ar: {
            name: 'يرجى إدخال الاسم الكامل (حرفين على الأقل)',
            email: 'يرجى إدخال بريد إلكتروني صحيح',
            phone: 'يرجى إدخال رقم هاتف صحيح (9-15 رقم)',
            type: 'يرجى اختيار نوع الرسالة',
            targetEmail: 'يرجى اختيار البريد المستهدف',
            message: 'يرجى إدخال رسالة (10 أحرف على الأقل)'
        },
        en: {
            name: 'Please enter your full name (at least 2 characters)',
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid phone number (9-15 digits)',
            type: 'Please select message type',
            targetEmail: 'Please select target email',
            message: 'Please enter a message (at least 10 characters)'
        }
    };

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const type = document.getElementById('type').value;
    const targetEmail = document.getElementById('targetEmail').value;
    const message = document.getElementById('message').value.trim();

    if (!name || name.length < 2) {
        showMessage(messages[lang].name, 'error');
        document.getElementById('name').focus();
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showMessage(messages[lang].email, 'error');
        document.getElementById('email').focus();
        return false;
    }

    const phoneRegex = /^[0-9]{9,15}$/;
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || !phoneRegex.test(phoneDigits)) {
        showMessage(messages[lang].phone, 'error');
        document.getElementById('phone').focus();
        return false;
    }

    if (!type) {
        showMessage(messages[lang].type, 'error');
        document.getElementById('type').focus();
        return false;
    }

    if (!targetEmail) {
        showMessage(messages[lang].targetEmail, 'error');
        document.getElementById('targetEmail').focus();
        return false;
    }

    if (!message || message.length < 10) {
        showMessage(messages[lang].message, 'error');
        document.getElementById('message').focus();
        return false;
    }

    return true;
}

async function sendContactRequest(data) {
    const lang = getLanguage();

    // التحقق من توفر EmailJS
    if (typeof emailjs === 'undefined') {
        const errorMsg = lang === 'en'
            ? 'Email service is currently unavailable. Please refresh the page and try again.'
            : 'خدمة البريد الإلكتروني غير متاحة حالياً. يرجى تحديث الصفحة والمحاولة مرة أخرى.';
        throw new Error(errorMsg);
    }

    try {
        // تحضير البيانات لـ EmailJS - مطابقة تماماً لـ API
        const typeLabels = {
            ar: {
                'general': 'استفسار عام',
                'services': 'استفسار عن الخدمات',
                'products': 'استفسار عن المنتجات',
                'quote': 'طلب عرض سعر',
                'support': 'الدعم الفني',
                'admin': 'استفسار إداري',
                'hr': 'التوظيف',
                'exec': 'شراكات وتعاقدات',
                'brands': 'استفسار عن العلامات التجارية',
                'programs': 'استفسار عن البرامج',
                'complaint': 'شكوى أو اقتراح',
                'other': 'أخرى'
            },
            en: {
                'general': 'General Inquiry',
                'services': 'Service Inquiry',
                'products': 'Products Inquiry',
                'quote': 'Quote Request',
                'support': 'Technical Support',
                'admin': 'Administrative Inquiry',
                'hr': 'Recruitment',
                'exec': 'Partnerships and Contracts',
                'brands': 'Brand Inquiry',
                'programs': 'Program Inquiry',
                'complaint': 'Complaint or Suggestion',
                'other': 'Other'
            }
        };

        const labels = typeLabels[lang];
        const messageLabel = lang === 'en' ? 'Message Type' : 'نوع الرسالة';
        const phoneLabel = lang === 'en' ? 'Phone Number' : 'رقم الهاتف';
        const messageTextLabel = lang === 'en' ? 'Message' : 'الرسالة';

        const params = {
            user_email: data.email,
            user_name: data.name,
            to_email: data.targetEmail,
            user_msg: `${messageLabel}: ${labels[data.type] || data.type}\n\n${phoneLabel}: ${data.phone}\n\n${messageTextLabel}:\n${data.message}`
        };

        // إرسال عبر EmailJS - استخدام Service ID و Template ID المحددين
        // ملاحظة: يجب إضافة {{to_email}} في EmailJS template كـ Reply-To أو To
        const response = await emailjs.send(
            'service_fbfyhsr',
            'template_g4zcz1a',
            params
        );

        return {
            ok: true,
            status: response.status,
            json: async () => ({ success: true, message: lang === 'en' ? 'Sent successfully' : 'تم الإرسال بنجاح' })
        };
    } catch (error) {
        console.error('EmailJS Error:', error);
        const errorMsg = lang === 'en'
            ? 'An error occurred while sending the message. Please try again.'
            : 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.';
        throw new Error(errorMsg);
    }
}

function showMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.setAttribute('role', 'alert');
    formMessage.setAttribute('aria-live', 'polite');

    setTimeout(() => {
        formMessage.className = 'form-message';
        formMessage.textContent = '';
    }, 5000);

    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initCountUp() {
    var countEls = document.querySelectorAll('.stat-count');
    if (!countEls.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            if (el.classList.contains('stat-count-done')) return;
            el.classList.add('stat-count-done');

            var target = parseInt(el.getAttribute('data-count-to'), 10);
            var suffix = el.getAttribute('data-suffix') || '';
            var formatComma = el.getAttribute('data-format') === 'comma';
            var duration = 1800;
            var start = 0;
            var startTime = null;

            function easeOutQuart(t) {
                return 1 - Math.pow(1 - t, 4);
            }

            function update(currentTime) {
                if (!startTime) startTime = currentTime;
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var eased = easeOutQuart(progress);
                var current = Math.floor(start + (target - start) * eased);
                var display = formatComma ? current.toLocaleString('en-US') : String(current);
                el.textContent = display + suffix;
                if (progress < 1) requestAnimationFrame(update);
            }

            requestAnimationFrame(update);
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    countEls.forEach(function (el) {
        observer.observe(el);
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.focus();
        }
    }
});

const focusableElements = document.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
);

focusableElements.forEach(element => {
    if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
    }
});

function initLanguageSelector() {
    const langSelector = document.getElementById('langSelector');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');

    if (!langSelector || !langDropdown) return;

    // Toggle dropdown
    langSelector.addEventListener('click', function (e) {
        e.stopPropagation();
        const isExpanded = langSelector.getAttribute('aria-expanded') === 'true';
        langSelector.setAttribute('aria-expanded', !isExpanded);
        langDropdown.classList.toggle('active');
    });

    // Handle language selection
    langOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            e.stopPropagation();
            const url = this.getAttribute('data-url');
            const lang = this.getAttribute('data-lang');

            // Update active state
            langOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // Update selector text
            const langText = langSelector.querySelector('.lang-text');
            if (lang === 'ar') {
                langText.textContent = 'العربية';
            } else {
                langText.textContent = 'English';
            }

            // Close dropdown
            langSelector.setAttribute('aria-expanded', 'false');
            langDropdown.classList.remove('active');

            // Navigate to URL if provided
            if (url) {
                window.location.href = url;
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!langSelector.contains(e.target) && !langDropdown.contains(e.target)) {
            langSelector.setAttribute('aria-expanded', 'false');
            langDropdown.classList.remove('active');
        }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            langSelector.setAttribute('aria-expanded', 'false');
            langDropdown.classList.remove('active');
        }
    });
}

function initFooterLanguageLinks() {
    const footerLangLinks = document.querySelectorAll('.footer-lang-link');

    footerLangLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const url = this.getAttribute('data-url');
            const lang = this.getAttribute('data-lang');

            // Navigate to URL if provided
            if (url) {
                window.location.href = url;
            }
        });
    });
}

function initTeamBioToggle() {
    document.querySelectorAll('.team-bio-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var card = this.closest('.team-card');
            var isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            card.classList.toggle('team-bio-expanded', !isExpanded);
        });
    });
}

function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const startYear = 2025;
    const copyrightElement = document.getElementById('copyrightYear');

    if (copyrightElement) {
        if (currentYear > startYear) {
            copyrightElement.textContent = startYear + '-' + currentYear;
        } else {
            copyrightElement.textContent = startYear.toString();
        }
    }
}

window.addEventListener('load', updateCopyrightYear);