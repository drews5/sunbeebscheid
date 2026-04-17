import { createClient } from '@supabase/supabase-js';
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject();

document.documentElement.classList.add("js-enabled");

/* ═══════════ SUPABASE CLIENT ══════���════ */
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
        
        // We use a fixed offset of 0 so the viewport top aligns perfectly with the section top.
        // Sections have ample padding (6rem+), preventing content occlusion, and guaranteeing 
        // the color swap trigger point (header midpoint) is safely within the target section.
        const fixedHeaderHeight = 0; 
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
            // Check if within the voting period (April 20-25)
            const endDate = new Date(now.getFullYear(), 3, 26);
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

/* ═══════════ ENDORSEMENTS LOGIC ═══════════ */
const endorsementsData = [
    {
        org: "WOCBA",
        shortOrg: "WOCBA",
        logoUrl: "/assets/images/wocba.svg",
        statement: "As the Women of Color in Business Association, we are proud to support Himeeka and Drew for Carlson Student Body Leadership. Their values closely align with our mission of uplifting diverse voices and fostering an inclusive, empowering community. Over the years, we’ve seen their genuine commitment to the Carlson community and their dedication to creating meaningful change. We are confident they deeply care about this community and will work to ensure it continues to grow and be the best it can be!"
    },
    {
        org: "BEAM",
        shortOrg: "BEAM",
        logoUrl: "/assets/images/beam.svg",
        statement: "BEAM is proud to endorse Himeeka and Drew’s campaign for President and Vice President of the Carlson student body. We support their vision of a Carlson that uplifts all students and builds a stronger community within it. As a student organization, we look forward to seeing how Himeeka and Drew will improve upon supporting Carlson student organizations and their efforts to connect students with peers, business professionals, and career opportunities. Through their various backgrounds and lived experiences, we trust that they will use the knowledge they have learned and implement it to make meaningful change that will leave a positive impact on the Carlson community."
    },
    {
        org: "MBA",
        shortOrg: "MBA",
        logoUrl: "/assets/images/mba.svg",
        statement: "We are proud to endorse Himeeka Sunbeeb and Drew Scheid for Carlson Student Body President. Their commitment to uplifting students, strengthening collaboration with student organizations, and building a more inclusive and connected Carlson community strongly aligns with our values at the Muslim Business Administration!"
    },
    {
        org: "GBN",
        shortOrg: "GBN",
        logoUrl: "/assets/images/gbn.svg",
        statement: "We are proud to endorse Himeeka and Drew as President and Vice President! Their platform directly shares the values of Global Business Nexus. This shared vision ensures that as we navigate an interconnected world, every student will be provided with a community and resources needed to thrive both on campus and in their future careers."
    },
    {
        org: "ALPFA",
        shortOrg: "ALPFA",
        logoUrl: "/assets/images/alpfa.svg",
        statement: "The Association of Latino Professionals for America is proud to endorse Himeeka and Drew for President and Vice President in recognition of their meaningful contributions to the Carlson community. Their strong commitment to uplifting diverse student voices and expanding access to opportunities closely reflects our mission of fostering inclusion and creating pathways of opportunity. We are confident in their continued ability to make a positive and lasting impact across Carlson."
    },
    {
        org: "180 Degrees Consulting - UMN",
        shortOrg: "180 Degrees",
        statement: "We are excited to support Himeeka Sunbeeb and Drew Scheid for Carlson Student Body President and Vice President. Their focus on strengthening the relationships between student orgs and the Business Board strongly along with our goals of supporting if our members and increasing belonging in their student experience. This collaborative nature of their platform can allow us to grow our campus community and support our members in their professional and academic careers."
    },
    {
        org: "Undergraduate Business Law Society",
        shortOrg: "UBLS",
        statement: "UBLS is proud to endorse Himeeka and Drew's campaign for President and Vice President due to their commitment to fostering an inclusive, collaborative, and engaged Carlson community. Their vision aligns with our values of leadership, professional development, and creating meaningful opportunities for students to grow both inside and outside the classroom. We are confident in their dedication to strengthening the student experience and supporting the Carlson community as a whole."
    },
    {
        org: "Club MIS",
        shortOrg: "Club MIS",
        statement: "As a club that helps connect students to different local companies, we are glad this campaign is supporting career success!"
    },
    {
        org: "Asians In Management",
        shortOrg: "AIM",
        statement: "Our Board likes your mission! and we support your journey!"
    },
    {
        org: "Student Accounting Finance Association (SAFA)",
        shortOrg: "SAFA",
        statement: "We would like to endorse Himeeka and Drew because our club believes in their vision to uplift students and drive career advancement!"
    },
    {
        org: "Net Impact",
        shortOrg: "Net Impact",
        statement: "Net Impact is happy to endorse Himeeka and Drew's campaign! Their commitment to uplifting the student voice and advocating for diverse identities closely aligns with Net Impact's mission on campus. We trust that they will advocate for all identities and provide meaningful support to the students and organizations that make Carlson feel like home!"
    },
    {
        org: "Delta Sigma Pi",
        shortOrg: "Delta Sigma Pi",
        statement: "Delta Sigma Pi is excited to endorse Himeeka and Drew for BBoard, as their campaign aligns with our pillars as an organization. Real connections, career success, and belonging resonate with the purposes of DSP, and we are excited to see these values further reflected in the greater Carlson community throughout their term. Additionally, their diverse backgrounds make them well-suited for organizing and collaborating with the wide range of groups and individuals that these positions entail."
    },
    {
        org: "Izaan Rana",
        shortOrg: "Izaan Rana",
        statement: "I endorse Himeeka and Drew because I believe they represent Carlson students passionately and are capable of bringing real change to this campus through representation and connection."
    },
    {
        org: "Fatima Aden",
        shortOrg: "Fatima Aden",
        statement: "I am proud to support Himeeka Sunbeeb and Drew Scheid in their run for Carlson Student Body President. As a team deeply involved in Carlson student life, they understand firsthand the changes students want to see on campus. Through my own personal experiences, I know how much dedication, listening, and genuine commitment it takes to represent students well--Himeeka and Drew embody those qualities, and I am confident they will lead with intention, advocacy, and a strong connection to the students they serve!"
    },
    {
        org: "Derek Jiang",
        shortOrg: "Derek Jiang",
        statement: "I am supporting Sunbeeb and Scheid because every student deserves to feel like they belong. Their campaign clearly outlines actionable steps that ensure real connection between students"
    }
];

const endorsementsGrid = document.getElementById("endorsements-grid");
const endorsementModal = document.getElementById("endorsement-modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalCloseBtn = document.getElementById("modal-close");
const modalOrgName = document.getElementById("modal-org-name");
const modalStatement = document.getElementById("modal-statement");
const modalLogo = document.getElementById("modal-logo");
const modalLogoWrap = modalLogo ? modalLogo.parentElement : null;

const renderLogoMarkup = (endorser) => {
    if (endorser.logoUrl) {
        return '<img src="' + endorser.logoUrl + '" alt="' + endorser.org + ' logo" class="endorsement-logo" loading="lazy">';
    }
    return '<span class="endorsement-fallback">' + endorser.shortOrg + '</span>';
};

if (endorsementsGrid) {
    endorsementsData.forEach((endorser, idx) => {
        const card = document.createElement("div");
        card.className = "endorsement-card";
        card.style.transitionDelay = (idx * 0.1) + 's';
        
        card.innerHTML = '\n            <div class="endorsement-mark">\n                ' + renderLogoMarkup(endorser) + '\n            </div>\n            <div class="endorsement-pill">\n                <span>' + endorser.shortOrg + '</span>\n            </div>\n        ';
        
        card.addEventListener("click", () => {
            if (typeof triggerHaptic !== "undefined") triggerHaptic("light");
            modalOrgName.innerText = endorser.org;
            modalStatement.innerText = endorser.statement;
            if (modalLogo && modalLogoWrap) {
                if (endorser.logoUrl) {
                    modalLogo.src = endorser.logoUrl;
                    modalLogo.alt = endorser.org + ' logo';
                    modalLogoWrap.style.display = "flex";
                } else {
                    modalLogo.src = "";
                    modalLogo.alt = "";
                    modalLogoWrap.style.display = "none";
                }
            }
            endorsementModal.classList.add("is-active");
        });
        
        endorsementsGrid.appendChild(card);
    });
}


function closeEndorsementModal() {
    if (endorsementModal) {
        endorsementModal.classList.remove("is-active");
    }
}

if (modalOverlay) modalOverlay.addEventListener("click", closeEndorsementModal);
if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeEndorsementModal);
/* ═══════════ OFFICE HOURS POPUP LOGIC ═══════════ */
const officeHoursPopup = document.getElementById('office-hours-popup');
const popupCloseBtn = document.getElementById('popup-close');
const popupFormBtn = document.getElementById('popup-btn-form');

if (officeHoursPopup) {
    // Show popup shortly after page load
    // setTimeout(() => {
    //     officeHoursPopup.classList.add('show');
    // }, 1500);

    // Close logic
    const closePopup = () => {
        if (typeof triggerHaptic !== 'undefined') triggerHaptic("light");
        officeHoursPopup.classList.remove('show');
        // Wait for transition before hiding completely to prevent click issues
        setTimeout(() => {
            officeHoursPopup.style.display = 'none';
        }, 600);
    };

    if (popupCloseBtn) {
        popupCloseBtn.addEventListener('click', closePopup);
    }
    
    // Close the popup when clicking the form button (it also navigates to #contact via href)
    if (popupFormBtn) {
        popupFormBtn.addEventListener('click', closePopup);
    }
}
