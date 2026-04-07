import { createClient } from '@supabase/supabase-js';

document.documentElement.classList.add("js-enabled");

/* ═══════════ SUPABASE CLIENT ═══════════ */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let dbClient = null;
if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
    dbClient = createClient(supabaseUrl, supabaseKey);
}

/* ═══════════ GLOBAL WEB HAPTICS ═══════════ */
let hapticEngine = null;
try {
    if (window.WebHaptics) {
        hapticEngine = window.WebHaptics.useWebHaptics();
    }
} catch (e) {
    console.warn("Haptics init failed", e);
}

const triggerHaptic = (type = "light") => {
    if (!hapticEngine && window.WebHaptics) {
        try { hapticEngine = window.WebHaptics.useWebHaptics(); } catch(e){}
    }
    
    if (hapticEngine && hapticEngine.trigger) {
        hapticEngine.trigger(type);
        return;
    }
    
    // Low-level Vibrate API Fallback (Standard Browser)
    if (navigator.vibrate) {
        if (type === "success") navigator.vibrate([15, 30, 20]);
        else if (type === "error") navigator.vibrate([30, 40, 30, 40, 30]);
        else navigator.vibrate(12);
    }
};

// Bind to every interaction
document.addEventListener("pointerdown", (e) => {
    const target = e.target.closest('a, button, input[type="submit"], .next-btn');
    if (target) {
        triggerHaptic("light");
    }
});


/* ═══════════ MOBILE MENU ═══════════ */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const siteNav = document.getElementById('site-nav');

if (mobileMenuBtn && siteNav) {
    mobileMenuBtn.addEventListener('click', () => {
        siteNav.classList.toggle('is-open');
        mobileMenuBtn.classList.toggle('is-active');
        triggerHaptic("light");
    });

    const navLinks = siteNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            siteNav.classList.remove('is-open');
            mobileMenuBtn.classList.remove('is-active');
        });
    });
}

/* ═══════════ SCROLL REVEAL ═══════════ */
const revealItems = document.querySelectorAll(".reveal");
if (revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
}

/* ═══════════ DYNAMIC STICKY HEADER ═══════════ */
const header = document.getElementById('main-header');
const headerLogo = document.getElementById('header-logo');
const colorSections = document.querySelectorAll('.color-section');

if (header && colorSections.length > 0) {
    let currentTheme = '';

    const updateHeaderState = () => {
        const scrollY = window.scrollY;
        const headerHeight = header.offsetHeight;
        // Trigger precisely halfway through the shrinking sticky header.
        const triggerPoint = scrollY + (headerHeight / 2);

        if (scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }

        let activeSection = null;

        for (let i = 0; i < colorSections.length; i++) {
            const section = colorSections[i];
            const rect = section.getBoundingClientRect();
            const absoluteTop = rect.top + window.scrollY;
            const absoluteBottom = absoluteTop + rect.height;

            if (triggerPoint >= absoluteTop && triggerPoint <= absoluteBottom) {
                activeSection = section;
                break;
            }
        }

        if (activeSection) {
            const theme = activeSection.getAttribute('data-theme');
            const color = activeSection.getAttribute('data-color');

            header.style.backgroundColor = color;

            if (theme !== currentTheme) {
                // Haptic feedback tick on scroll boundary threshold cross!
                if (currentTheme !== '') {
                    triggerHaptic("light");
                }
                
                header.classList.remove('theme-light', 'theme-dark', 'theme-gold');
                header.classList.add(`theme-${theme}`);
                
                if (theme === 'light') {
                    headerLogo.src = document.getElementById('preload-logo-dark').src;
                } else if (theme === 'gold') {
                    headerLogo.src = document.getElementById('preload-logo-gold').src;
                } else {
                    headerLogo.src = document.getElementById('preload-logo-light').src;
                }
                
                currentTheme = theme;
            }
        }
    };

    window.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', updateHeaderState, { passive: true });
    
    // Initial call
    updateHeaderState();
}

/* ═══════════ SMOOTH ANCHOR OFFSET ═══════════ */
document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function(e) {
        // Skip if it links to a different page
        if (this.pathname !== window.location.pathname) return;

        const targetId = this.hash;
        if (!targetId || targetId === "#") return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        e.preventDefault();
        
        // The header shrinks to about 80px when scrolling. 
        // We use a fixed offset subtracting extra space so the 
        // header sits fully on the section, guaranteeing the color swaps perfectly.
        const fixedHeaderHeight = 44; 
        const y = target.getBoundingClientRect().top + window.scrollY - fixedHeaderHeight;
        
        window.scrollTo({ top: y, behavior: "smooth" });
    });
});



/* ═══════════ PROGRESSIVE VOTE FORM ═══════════ */
const joinForm = document.getElementById("join-form");
const formHeader = document.getElementById("form-header");
const nameInput = document.getElementById("name");
const stepNameBtn = document.getElementById("btn-next-step");
const stepNameContainer = document.getElementById("step-name");

const idInput = document.getElementById("studentid");
const stepIdBtn = document.getElementById("btn-submit");
const stepIdContainer = document.getElementById("step-id");

const stepSuccess = document.getElementById("step-success");

if (joinForm) {
    // Step 1: Handle Name Input
    nameInput.addEventListener("input", () => {
        // Only show button if user has entered at least two characters
        if (nameInput.value.trim().length >= 2) {
            stepNameBtn.classList.add('show');
            stepNameBtn.disabled = false;
        } else {
            stepNameBtn.classList.remove('show');
            stepNameBtn.disabled = true;
        }
    });

    // Step 1 -> Step 2 transition
    stepNameBtn.addEventListener("click", () => {
        if (nameInput.value.trim().length < 2) return;
        
        stepNameContainer.classList.remove('active');
        stepNameContainer.classList.add('past');
        
        stepIdContainer.classList.add('active');
        idInput.focus();
    });

    // Handle pressing Enter inside the name input
    nameInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            if (!stepNameBtn.disabled) stepNameBtn.click();
        }
    });

    // Step 2: Handle ID Input
    idInput.addEventListener("input", () => {
        // Arbitrary validation: Assume IDs are generally multiple characters
        if (idInput.value.trim().length >= 3) {
            stepIdBtn.classList.add('show');
            stepIdBtn.disabled = false;
        } else {
            stepIdBtn.classList.remove('show');
            stepIdBtn.disabled = true;
        }
    });

    // Final Submission
    joinForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const studentid = idInput.value.trim();

        if (!name || !studentid) return;

        // Visual feedback immediately
        if (formHeader) formHeader.style.opacity = "0";
        stepIdContainer.classList.remove('active');
        stepIdContainer.classList.add('past');
        
        // Supabase DB Backend Hook
        if (dbClient) {
            try {
                const { error } = await dbClient.from('voters').insert([{ name: name, student_id: studentid }]);
                
                if (error) {
                    console.error("Supabase error:", error);
                    alert("Database error: " + error.message);
                    return;
                }
            } catch (err) {
                console.error("Supabase connection failed:", err);
                alert("Connection failed. Check your console (F12) for details.");
            }
        } else {
            // Local fallback
            const storedSignups = localStorage.getItem("sunbeebscheid-voters-pro");
            const signups = storedSignups ? JSON.parse(storedSignups) : [];
            signups.push({ name, studentid, createdAt: new Date().toISOString() });
            localStorage.setItem("sunbeebscheid-voters-pro", JSON.stringify(signups));
        }

        // Haptic explicit success response
        if (typeof triggerHaptic === "function") triggerHaptic("success");

        stepSuccess.classList.add('active');
    });
}

/* ═══════════ CONTACT FORM HANDLER ═══════════ */
const contactForm = document.getElementById("contact-form");
const contactSuccess = document.getElementById("contact-success");
const contactNameInput = document.getElementById("contact-name");
const contactEmailInput = document.getElementById("contact-email");
const contactMessageInput = document.getElementById("contact-message");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = contactNameInput.value.trim();
        const email = contactEmailInput.value.trim();
        const message = contactMessageInput.value.trim();

        if (!name || !email || !message) return;

        const btn = contactForm.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.innerText = "SENDING...";
        }

        // Supabase DB Backend Hook
        if (dbClient) {
            console.log("Attempting contact submission...", { name, email, message });
            try {
                const { error } = await dbClient.from('contacts').insert([{ 
                    name: name, 
                    email: email, 
                    message: message 
                }]);
                if (error) {
                    console.error("Contact insert failed:", error);
                    alert("Submission failed: " + error.message);
                    if (btn) {
                        btn.disabled = false;
                        btn.innerText = "SEND MESSAGE";
                    }
                    return;
                }
            } catch (err) {
                console.error("Supabase connection error:", err);
            }
        }

        // Success Visuals
        setTimeout(() => {
            contactForm.reset();
            if (btn) {
                btn.style.display = 'none';
            }
            if (contactSuccess) {
                contactSuccess.style.display = 'block';
                triggerHaptic("success");
            }
        }, 500);
    });
}


/* ═══════════ BANNER LIVE COUNTDOWN LOGIC ═══════════ */
const cdElement = document.getElementById("countdown-days");
const cdBannerTxt = document.getElementById("countdown-banner-txt");

if (cdElement && cdBannerTxt) {
    const targetDate = new Date(new Date().getFullYear(), 3, 20); // April 20

    const updateCountdown = () => {
        const now = new Date();
        const diffTime = targetDate - now;

        if (diffTime <= 0) {
            // Check if within the voting period (April 20-24)
            const endDate = new Date(now.getFullYear(), 3, 25);
            if (now < endDate) {
                cdBannerTxt.innerHTML = `Voting is <span class="highlight-gold">open right now</span>!`;
            } else {
                cdBannerTxt.innerHTML = `Voting has <span class="highlight-gold">concluded</span>. Thank you!`;
            }
            return;
        }

        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        let text = "";
        if (days > 0) {
            text += `${days} ${days === 1 ? 'day' : 'days'}`;
        }
        if (hours > 0 || days > 0) {
            if (days > 0) text += " and ";
            text += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        }
        
        // Edge fallback under 1 hr
        if (days === 0 && hours === 0) {
            const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            text = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        }
        
        cdElement.innerText = text;
    };

    updateCountdown();
    setInterval(updateCountdown, 60000); // Ticks every minute
}
