// Scroll Reveal, Button Loading, and Calculator Interaction System

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Scroll Reveal Mechanism ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Trigger only once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    // --- 2. Interactive CGPA Eligibility Calculator ---
    const calcCgpa = document.getElementById('calcCgpa');
    const calcCgpaVal = document.getElementById('calcCgpaVal');
    const calcBranch = document.getElementById('calcBranch');
    const calcResults = document.getElementById('calcResults');

    // Seed data matching typical seeded companies in database
    const companies = [
        { name: 'Google', title: 'Software Development Engineer (SDE-1)', minCgpa: 8.5, branches: ['CSE', 'IT', 'ECE', 'AI & DS'] },
        { name: 'Nvidia', title: 'GPU Software Trainee', minCgpa: 8.2, branches: ['CSE', 'IT', 'ECE', 'MTE'] },
        { name: 'Microsoft', title: 'Cloud Solutions Engineer', minCgpa: 8.0, branches: ['CSE', 'IT', 'ECE', 'EEE', 'AI & DS'] },
        { name: 'Samsung R&D', title: 'Software Engineer', minCgpa: 8.0, branches: ['CSE', 'IT', 'ECE', 'EEE', 'MTE'] },
        { name: 'Qualcomm', title: 'Embedded Systems Engineer', minCgpa: 7.8, branches: ['CSE', 'IT', 'ECE', 'EEE', 'MTE'] },
        { name: 'Amazon', title: 'Systems Analyst / Operations', minCgpa: 7.5, branches: ['ALL', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'AE', 'AI & DS', 'MTE', 'BT'] },
        { name: 'Texas Instruments', title: 'Hardware Design Engineer', minCgpa: 7.5, branches: ['ECE', 'EEE', 'MTE'] },
        { name: 'Infosys', title: 'Specialist Programmer', minCgpa: 7.0, branches: ['ALL', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'AE', 'AI & DS', 'MTE', 'BT'] },
        { name: 'Deloitte', title: 'Associate Tech Consultant', minCgpa: 6.8, branches: ['ALL', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'AE', 'AI & DS', 'MTE', 'BT'] },
        { name: 'Tata Motors', title: 'Graduate Engineer Trainee (GET)', minCgpa: 6.5, branches: ['ME', 'EEE', 'MTE'] },
        { name: 'TCS Digital', title: 'Systems Engineer', minCgpa: 6.5, branches: ['ALL', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'AE', 'AI & DS', 'MTE', 'BT'] },
        { name: 'Lala Company', title: 'Systems Engineer', minCgpa: 6.5, branches: ['ALL', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'AE', 'AI & DS', 'MTE', 'BT'] },
        { name: 'Yadav Infotech', title: 'Meow Engineer', minCgpa: 6.5, branches: ['ALL', 'CSE',  'BT'] }
    ];

    function runCalculation() {
        if (!calcCgpa || !calcBranch || !calcResults) return;

        const cgpa = parseFloat(calcCgpa.value);
        const branch = calcBranch.value;
        calcCgpaVal.textContent = cgpa.toFixed(1);

        let html = '';
        companies.forEach(company => {
            const isBranchEligible = company.branches.includes('ALL') || company.branches.includes(branch);
            const isCgpaEligible = cgpa >= company.minCgpa;
            const isEligible = isBranchEligible && isCgpaEligible;

            let reason = '';
            if (!isCgpaEligible && !isBranchEligible) {
                reason = `Requires min CGPA of ${company.minCgpa} & matching Branch`;
            } else if (!isCgpaEligible) {
                reason = `Requires min CGPA of ${company.minCgpa}`;
            } else if (!isBranchEligible) {
                reason = `Does not recruit from ${branch} branch`;
            } else {
                reason = 'You qualify for this posting!';
            }

            html += `
                <div class="calc-result-item ${isEligible ? 'eligible' : 'ineligible'}">
                    <div>
                        <strong style="color: var(--text-primary); font-size: 1.1rem;">${company.name}</strong>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">${company.title}</div>
                        <div style="font-size: 0.8rem; margin-top: 4px; color: ${isEligible ? 'var(--success-color)' : 'var(--text-secondary)'};">${reason}</div>
                    </div>
                    <div>
                        <span class="badge ${isEligible ? 'badge-selected' : 'badge-rejected'}">${isEligible ? 'Eligible' : 'Ineligible'}</span>
                    </div>
                </div>
            `;
        });

        calcResults.innerHTML = html;
    }

    if (calcCgpa && calcBranch) {
        calcCgpa.addEventListener('input', runCalculation);
        calcBranch.addEventListener('change', runCalculation);
        runCalculation(); // Run initial calculation
    }
});

// --- 3. Global Loading State Utility ---
window.setButtonLoading = function(buttonEl, isLoading, loadingText = 'Processing...') {
    if (!buttonEl) return;
    if (isLoading) {
        buttonEl.setAttribute('data-original-text', buttonEl.innerHTML);
        buttonEl.classList.add('btn-loading');
        buttonEl.disabled = true;
    } else {
        const originalText = buttonEl.getAttribute('data-original-text');
        if (originalText) {
            buttonEl.innerHTML = originalText;
        }
        buttonEl.classList.remove('btn-loading');
        buttonEl.disabled = false;
    }
};
