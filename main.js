document.documentElement.classList.add("js-enabled");

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
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
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
                    if (typeof triggerHaptic === "function") triggerHaptic("light");
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

/* ═══════════ GLOBAL WEB HAPTICS ═══════════ */
// Synthesizing web-haptics interactions for Vanilla JS
const triggerHaptic = (type = "light") => {
    if (!navigator.vibrate) return;
    if (type === "success") navigator.vibrate([15, 30, 20]); // double tap feeling
    else if (type === "error") navigator.vibrate([30, 40, 30, 40, 30]); // long shake
    else navigator.vibrate(10); // standard light tap
};

// Bind to every interaction
document.addEventListener("pointerdown", (e) => {
    const target = e.target.closest('a, button, input[type="submit"], .next-btn');
    if (target) {
        triggerHaptic("light");
    }
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
        if (window.supabase) {
            try {
                const _supabaseUrl = 'YOUR_SUPABASE_URL';
                const _supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
                // Initialize temporarily safely
                const supabase = window.supabase.createClient(_supabaseUrl, _supabaseKey);
                
                await supabase.from('voters').insert([{ name: name, student_id: studentid }]);
            } catch (err) {
                console.error("Supabase ingestion failed:", err);
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
