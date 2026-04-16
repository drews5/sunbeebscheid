const endorsementsGrid = document.querySelector('.endorsements-grid');
const endorsementModal = document.getElementById("endorsement-modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalCloseBtn = document.getElementById("modal-close");
const modalOrgName = document.getElementById("modal-org-name");
const modalStatement = document.getElementById("modal-statement");
const modalLogo = document.getElementById("modal-logo");

const endorsements = [
    {
        org: "Carlson School Leadership",
        statement: "Drew brings clarity, warmth, and follow-through to every project.",
        logoUrl: "/assets/logo-gold.png"
    },
    {
        org: "Student Collaborators",
        statement: "A steady partner who keeps the team organized and moving.",
        logoUrl: "/assets/logo-light.png"
    }
];

if (endorsementsGrid) {
    endorsements.forEach((endorser) => {
        const card = document.createElement('article');
        card.className = 'endorsement-card';
        card.innerHTML = `
            <img src="${endorser.logoUrl}" alt="${endorser.org}">
            <h3>${endorser.org}</h3>
            <p>${endorser.statement}</p>
        `;
        card.addEventListener('click', () => {
            if (typeof triggerHaptic !== 'undefined') triggerHaptic("light");
            modalOrgName.innerText = endorser.org;
            modalStatement.innerText = endorser.statement;
            modalLogo.src = endorser.logoUrl;
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

if (modalOverlay) modalOverlay.addEventListener('click', closeEndorsementModal);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEndorsementModal);
