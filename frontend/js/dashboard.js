const DEV_HOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:' ? 'http://localhost:8080' : '';
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    // Elements
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.section');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Form Elements
    const profileForm = document.getElementById('profileForm');
    const profMessage = document.getElementById('profMessage');
    const userNameDisplay = document.getElementById('userNameDisplay');

    // --- Phase 2: Theme Toggle ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
        });
    }

    // --- Phase 4: Command Palette ---
    const cmdOverlay = document.getElementById('cmdPaletteOverlay');
    const cmdInput = document.getElementById('cmdInput');
    const cmdResults = document.getElementById('cmdResults');

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            cmdOverlay.style.display = 'flex';
            cmdInput.focus();
        }
        if (e.key === 'Escape' && cmdOverlay.style.display === 'flex') {
            cmdOverlay.style.display = 'none';
        }
    });

    cmdOverlay.addEventListener('click', (e) => {
        if (e.target === cmdOverlay) cmdOverlay.style.display = 'none';
    });

    const commands = [
        { label: 'Navigate: Dashboard', target: 'dashboardSection' },
        { label: 'Navigate: My Profile', target: 'profileSection' },
        { label: 'Navigate: Available Jobs', target: 'jobsSection' },
        { label: 'Navigate: Applications History', target: 'applicationsSection' },
        { label: 'Navigate: Upcoming Online Tests', target: 'testsSection' },
        { label: 'Navigate: Resume Builder', target: 'resumeBuilderSection' },
        { label: 'Navigate: Interview Calendar', target: 'interviewCalendarSection' },
        { label: 'Navigate: Documents Vault', target: 'documentsVaultSection' },
        { label: 'Navigate: Placement Stats & Leaderboard', target: 'leaderboardSection' }
    ];

    cmdInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
            cmdResults.innerHTML = '';
            return;
        }
        const filtered = commands.filter(c => c.label.toLowerCase().includes(query));
        cmdResults.innerHTML = filtered.map(c => `
            <div class="cmd-item" data-target="${c.target}">
                ${c.label}
            </div>
        `).join('');
    });

    cmdResults.addEventListener('click', (e) => {
        const item = e.target.closest('.cmd-item');
        if (item) {
            const targetId = item.getAttribute('data-target');
            document.querySelector(`.sidebar-item[data-target="${targetId}"]`)?.click();
            cmdOverlay.style.display = 'none';
            cmdInput.value = '';
            cmdResults.innerHTML = '';
        }
    });

    // Navigation Logic
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active sidebar item
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Show target section
            const targetId = item.getAttribute('data-target');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Load data based on section
            if (targetId === 'jobsSection') {
                loadJobs();
            } else if (targetId === 'applicationsSection') {
                loadApplications();
            } else if (targetId === 'testsSection') {
                loadUpcomingTests();
            } else if (targetId === 'leaderboardSection') {
                loadLeaderboard();
            } else if (targetId === 'resumeBuilderSection') {
                loadResumeBuilder();
            } else if (targetId === 'documentsVaultSection') {
                loadDocumentsVault();
            } else if (targetId === 'interviewCalendarSection') {
                loadInterviewCalendar();
            }
        });
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        removeToken();
        window.location.href = 'login.html';
    });

    async function loadUserProfile() {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = userData.id || '';
            const profile = await apiCall(`/student/profile?userId=${userId}`, 'GET');
            window.studentCgpa = profile.cgpa;
            
            document.getElementById('profName').value = profile.name;
            document.getElementById('profEmail').value = profile.email || '';
            if (profile.profilePhotoUrl) {
                document.getElementById('profilePhotoPreview').src = profile.profilePhotoUrl;
            }
            if (profile.phone) {
                let parts = profile.phone.split(' ');
                if (parts.length > 1 && parts[0].startsWith('+')) {
                    document.getElementById('countryCode').value = parts[0];
                    document.getElementById('profMobile').value = parts.slice(1).join(' ');
                } else {
                    document.getElementById('profMobile').value = profile.phone;
                }
            } else {
                document.getElementById('profMobile').value = '';
            }
            document.getElementById('profRollNo').value = profile.rollNo;
            document.getElementById('profDept').value = profile.branch;
            document.getElementById('profCgpa').value = profile.cgpa;
            document.getElementById('profYear').value = profile.graduationYear;
            document.getElementById('profSkills').value = profile.skills || '';
            document.getElementById('profResume').value = profile.resume || '';
            
            if (document.getElementById('profWillingness')) {
                document.getElementById('profWillingness').value = profile.isOptedOut ? "true" : "false";
            }
            
            const viewBtn = document.getElementById('resumeViewBtn');
            if (profile.resume) {
                viewBtn.href = profile.resume;
                viewBtn.style.display = 'inline-block';
            } else {
                viewBtn.style.display = 'none';
            }
            
            userNameDisplay.textContent = `Welcome, ${profile.name}`;

            // Calculate Profile Completeness
            let score = 0;
            if (profile.name && profile.email && profile.rollNo) score += 25;
            if (profile.branch && profile.cgpa && profile.graduationYear) score += 25;
            if (profile.resume) score += 15;
            if (profile.skills && profile.skills.length > 5) score += 15;
            if ((profile.projects && profile.projects.length > 5) || (profile.experience && profile.experience.length > 5)) score += 20;

            const completenessBar = document.getElementById('profileCompletenessBar');
            const completenessText = document.getElementById('profileCompletenessText');
            const completenessHint = document.getElementById('profileCompletenessHint');

            if (completenessBar) {
                setTimeout(() => {
                    completenessBar.style.width = `${score}%`;
                    if (score === 100) completenessBar.style.background = 'var(--success-color)';
                }, 500);
                completenessText.textContent = `${score}%`;
                
                if (score < 50) completenessHint.textContent = 'Add your details and upload a resume.';
                else if (score < 80) completenessHint.textContent = 'Add projects and skills to boost your score.';
                else if (score < 100) completenessHint.textContent = 'Almost there! Fill in missing details.';
                else completenessHint.textContent = 'Profile is fully complete! Ready to apply.';
            }

            // Populate Live Activity Feed (Dummy Real-time Data)
            const activityFeed = document.getElementById('liveActivityFeed');
            if (activityFeed) {
                const activities = [
                    "Google shortlist released for CS/IT",
                    "Microsoft GD slots announced for tomorrow",
                    "TCS Ninja drive is live now!",
                    "Amazon scheduled interviews for shortlisted candidates"
                ];
                let currentAct = 0;
                
                // Initial load
                activityFeed.innerHTML = `<div class="activity-item">🚀 Welcome! Stay tuned for live updates.</div>`;
                
                setInterval(() => {
                    if (currentAct >= activities.length) currentAct = 0;
                    activityFeed.innerHTML = `<div class="activity-item">🔔 ${activities[currentAct]}</div>` + activityFeed.innerHTML;
                    
                    // Keep max 3 items
                    if (activityFeed.children.length > 3) {
                        activityFeed.removeChild(activityFeed.lastChild);
                    }
                    currentAct++;
                }, 8000); // New activity every 8 seconds
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Session expired or error loading profile.');
            removeToken();
            window.location.href = 'login.html';
        }
    }

    // Load Initial Data (Profile)
    loadUserProfile();
    
    // Profile Photo Upload
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const photoUploadStatus = document.getElementById('photoUploadStatus');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', async (e) => {
            if (e.target.files.length === 0) return;
            const file = e.target.files[0];
            
            // local preview immediately
            const reader = new FileReader();
            reader.onload = (ev) => {
                profilePhotoPreview.src = ev.target.result;
            };
            reader.readAsDataURL(file);
            
            photoUploadStatus.textContent = "Uploading photo...";
            photoUploadStatus.style.color = "var(--text-secondary)";
            
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/student/profile/photo`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    profilePhotoPreview.src = result.fileUrl; // Set final url
                    photoUploadStatus.textContent = "Photo uploaded successfully!";
                    photoUploadStatus.style.color = "var(--success-color)";
                } else {
                    const err = await response.text();
                    photoUploadStatus.textContent = "Failed to upload: " + err;
                    photoUploadStatus.style.color = "var(--danger-color)";
                }
            } catch (error) {
                photoUploadStatus.textContent = "Error uploading photo.";
                photoUploadStatus.style.color = "var(--danger-color)";
            }
        });
    }

    // Profile Update Submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        profMessage.textContent = 'Updating...';
        profMessage.style.color = 'var(--text-secondary)';

        const payload = {
            name: document.getElementById('profName').value,
            rollNo: document.getElementById('profRollNo').value,
            branch: document.getElementById('profDept').value,
            cgpa: parseFloat(document.getElementById('profCgpa').value),
            graduationYear: parseInt(document.getElementById('profYear').value),
            resume: document.getElementById('profResume').value,
            phone: document.getElementById('countryCode').value + ' ' + document.getElementById('profMobile').value,
            skills: document.getElementById('profSkills').value,
            isOptedOut: document.getElementById('profWillingness') ? (document.getElementById('profWillingness').value === "true") : false
        };

        try {
            await apiCall('/student/profile', 'PUT', payload);
            profMessage.textContent = 'Profile updated successfully!';
            profMessage.style.color = 'var(--success-color)';
            userNameDisplay.textContent = `Welcome, ${payload.name}`;
        } catch (error) {
            profMessage.textContent = 'Error updating profile.';
            profMessage.style.color = 'var(--danger-color)';
        }
    });

    // Resume Upload Logic
    document.getElementById('uploadResumeBtn').addEventListener('click', async () => {
        const fileInput = document.getElementById('resumeFile');
        const uploadMsg = document.getElementById('uploadMessage');
        const file = fileInput.files[0];

        if (!file) {
            uploadMsg.textContent = 'Please select a PDF file first.';
            uploadMsg.style.color = 'var(--danger-color)';
            return;
        }
        
        if (file.type !== 'application/pdf') {
            uploadMsg.textContent = 'Only PDF files are allowed.';
            uploadMsg.style.color = 'var(--danger-color)';
            return;
        }

        uploadMsg.textContent = 'Uploading...';
        uploadMsg.style.color = 'var(--text-secondary)';
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const token = getToken();
            const response = await fetch(`${DEV_HOST}/api/student/profile/resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const fileUrl = await response.text();
            
            uploadMsg.textContent = 'Resume uploaded successfully!';
            uploadMsg.style.color = 'var(--success-color)';
            
            // Update input and view button
            document.getElementById('profResume').value = fileUrl;
            const viewBtn = document.getElementById('resumeViewBtn');
            viewBtn.href = fileUrl;
            viewBtn.style.display = 'inline-block';
            
        } catch (error) {
            uploadMsg.textContent = 'Error uploading resume.';
            uploadMsg.style.color = 'var(--danger-color)';
        }
    });

    // Load Jobs
    async function loadJobs() {
        const jobsList = document.getElementById('jobsList');
        jobsList.innerHTML = `
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
        `;
        
        const search = document.getElementById('jobSearch').value || '';
        const domain = document.getElementById('filterDomain').value || '';
        const packageFilter = document.getElementById('filterPackage').value || '';
        const location = document.getElementById('filterLocation').value || '';
        const branchFilter = document.getElementById('jobBranch').value || '';
        const showEligibleOnly = document.getElementById('eligibleFilterCheckbox') ? document.getElementById('eligibleFilterCheckbox').checked : false;
        
        let url = '/jobs';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (location) params.append('location', location);
        // Note: Backend might not support all new filters yet, but we apply them client-side if missing
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        try {
            let jobs = await apiCall(url, 'GET');
            const studentBranch = document.getElementById('profDept').value || window.studentBranch || '';
            
            // Client-side filtering for new advanced filters
            if (domain) {
                jobs = jobs.filter(j => (j.jobTitle || '').toLowerCase().includes(domain.toLowerCase()));
            }
            if (packageFilter) {
                const p = parseInt(packageFilter);
                jobs = jobs.filter(j => {
                    const sal = parseFloat((j.salaryPackage || '0').replace(/[^0-9.]/g, ''));
                    return sal >= p;
                });
            }
            if (branchFilter) {
                jobs = jobs.filter(j => !j.eligibleBranches || j.eligibleBranches === 'ALL' || j.eligibleBranches.includes(branchFilter));
            }

            let eligibleCount = 0;
            const cgpaImpactBadge = document.getElementById('cgpaImpactBadge');
            
            if (showEligibleOnly) {
                const initialCount = jobs.length;
                jobs = jobs.filter(j => {
                    const hasCgpa = true;
                    const hasBranch = true;
                    if(hasCgpa && hasBranch) eligibleCount++;
                    return hasCgpa && hasBranch;
                });
                if(cgpaImpactBadge && initialCount > 0) {
                    const pct = Math.round((eligibleCount / initialCount) * 100);
                    cgpaImpactBadge.style.display = 'inline-block';
                    cgpaImpactBadge.textContent = `Eligible for ${pct}% of Active Drives`;
                }
            } else {
                if(cgpaImpactBadge) cgpaImpactBadge.style.display = 'none';
            }

            if (jobs.length === 0) {
                jobsList.innerHTML = `
                    <div class="text-center" style="padding: 60px;">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <p style="color: var(--text-secondary); font-size: 1.1rem;">No jobs match your criteria.</p>
                    </div>
                `;
                return;
            }

            jobsList.innerHTML = jobs.map(job => {
                const studentBranch = document.getElementById('profDept').value || window.studentBranch || '';
                const isCgpaEligible = true;
                const isBranchEligible = true;
                const isEligible = true;
                const skillMatch = calculateSkillMatch(document.getElementById('profSkills').value, job.requiredSkills);
                
                let eligibilityMessage = '';
                if (!isCgpaEligible) {
                    eligibilityMessage = `Ineligible: Required CGPA ${job.minCgpa}`;
                } else if (!isBranchEligible) {
                    eligibilityMessage = `Ineligible: Open only to ${job.eligibleBranches} (Your Branch: ${studentBranch})`;
                }

                return `
                <div class="card" style="opacity: ${isEligible ? '1' : '0.6'}">
                    <div class="d-flex justify-between align-center">
                        <h3 class="job-title">${job.jobTitle}</h3>
                        <div>
                            ${skillMatch.badge}
                            ${isEligible 
                                ? `<span class="badge" style="background: var(--success-color); color: white; margin-right: 5px;">Eligible</span>` 
                                : `<span class="badge" style="background: var(--danger-color); color: white; margin-right: 5px;">${eligibilityMessage}</span>`}
                            <span class="badge" style="background: rgba(37, 99, 235, 0.15); color: var(--primary-color);">Deadline: ${job.lastDateToApply || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="company-name">${job.companyName}</div>
                    <div class="job-details" style="display:flex; gap: 15px; margin-bottom: 10px;">
                        <span><strong>📍</strong> ${job.location || 'Not specified'}</span>
                        <span><strong>💰</strong> ${job.salaryPackage || 'Not specified'}</span>
                        <span><strong>🎓</strong> Min CGPA: ${job.minCgpa}</span>
                    </div>
                    <div class="job-details">${job.description ? job.description.substring(0, 100) + '...' : ''}</div>
                    <button class="btn btn-primary mt-4 view-job-btn" data-job-id="${job.id}">View Details & Apply</button>
                </div>
            `}).join('');

            // Attach event listeners to view buttons
            document.querySelectorAll('.view-job-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const jobId = e.target.getAttribute('data-job-id');
                    openJobDetailsModal(jobId);
                });
            });

        } catch (error) {
            jobsList.innerHTML = `<div class="text-center" style="color: var(--danger-color);">Error loading jobs: ${error.message}</div>`;
        }
    }

    const searchBtn = document.getElementById('jobSearchBtn');
    if (searchBtn) searchBtn.addEventListener('click', loadJobs);
    const eligibleCheckbox = document.getElementById('eligibleFilterCheckbox');
    if (eligibleCheckbox) eligibleCheckbox.addEventListener('change', loadJobs);

    // Search button listener
    document.getElementById('jobSearchBtn').addEventListener('click', loadJobs);
    
    // Global variable for currently viewed job
    let currentViewJobId = null;

    // Open Job Details Modal
    window.openJobDetailsModal = async function(jobId) {
        currentViewJobId = jobId;
        const msg = document.getElementById('modalApplyMessage');
        msg.textContent = '';
        const applyBtn = document.getElementById('modalApplyBtn');
        applyBtn.textContent = 'Apply Now';
        applyBtn.disabled = false;
        applyBtn.classList.remove('btn-success');
        applyBtn.classList.add('btn-primary');
        
        try {
            const job = await apiCall(`/jobs/${jobId}`, 'GET');
            
            document.getElementById('modalJobTitle').textContent = job.jobTitle;
            document.getElementById('modalCompanyName').textContent = job.companyName;
            document.getElementById('modalLocation').textContent = job.location || 'Not specified';
            document.getElementById('modalSalary').textContent = job.salaryPackage || 'Not specified';
            document.getElementById('modalMinCgpa').textContent = job.minCgpa;
            document.getElementById('modalLastDate').textContent = job.lastDateToApply || 'Not specified';
            document.getElementById('modalSkills').textContent = job.requiredSkills || 'Not specified';
            document.getElementById('modalEligibility').textContent = job.eligibilityCriteria || 'Not specified';
            document.getElementById('modalCtcComponents').textContent = job.ctcComponents || 'Not specified';
            document.getElementById('modalSelectionRounds').textContent = job.selectionRounds || 'Not specified';
            document.getElementById('modalBondDetails').textContent = job.bondDetails || 'Not specified';
            document.getElementById('modalDescription').textContent = job.description || 'No description provided.';
            
            const studentBranch = document.getElementById('profDept').value || window.studentBranch || '';
            const isCgpaEligible = true;
            const isBranchEligible = true;
            const isEligible = true;

            if (!isEligible) {
                applyBtn.disabled = true;
                applyBtn.classList.remove('btn-primary');
                applyBtn.style.background = '#ccc';
                applyBtn.textContent = 'Not Eligible';
                if (!isCgpaEligible) {
                    msg.textContent = `Ineligible: Required CGPA is ${job.minCgpa} (Your CGPA: ${window.studentCgpa})`;
                } else if (!isBranchEligible) {
                    msg.textContent = `Ineligible: Open only to ${job.eligibleBranches} (Your Branch: ${studentBranch})`;
                }
                msg.style.color = 'var(--danger-color)';
            }
            
            document.getElementById('jobDetailsModal').style.display = 'flex';
        } catch(error) {
            alert('Failed to load job details');
        }
    };
    
    window.closeJobDetailsModal = function() {
        document.getElementById('jobDetailsModal').style.display = 'none';
    };

    window.openSlotsModal = async function(jobId) {
        document.getElementById('slotsModal').style.display = 'flex';
        const slotsList = document.getElementById('slotsList');
        slotsList.innerHTML = '<div class="skeleton skeleton-card"></div>';

        try {
            const slots = await apiCall(`/jobs/${jobId}/slots`, 'GET');
            
            if (slots.length === 0) {
                slotsList.innerHTML = '<p>No available slots found for this interview.</p>';
                return;
            }

            slotsList.innerHTML = '';
            slots.forEach(slot => {
                const dateObj = new Date(slot.slotTime);
                const dateStr = dateObj.toLocaleDateString();
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                slotsList.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; background: #f8fafc;">
                        <div>
                            <strong>${dateStr}</strong> at ${timeStr}
                        </div>
                        <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.9rem;" onclick="bookInterviewSlot(${slot.id})">Book</button>
                    </div>
                `;
            });
        } catch (error) {
            slotsList.innerHTML = '<p style="color:red">Failed to load slots.</p>';
        }
    };

    window.closeSlotsModal = function() {
        document.getElementById('slotsModal').style.display = 'none';
    };

    window.bookInterviewSlot = async function(slotId) {
        try {
            await apiCall(`/jobs/slots/${slotId}/book`, 'POST');
            alert('Slot booked successfully!');
            closeSlotsModal();
            loadApplications(); // reload applications to reflect changes
        } catch (error) {
            alert(error.message || 'Failed to book slot');
        }
    };
    
    // Apply from Modal
    document.getElementById('modalApplyBtn').addEventListener('click', async (e) => {
        if (!currentViewJobId) return;
        const applyBtn = e.target;
        const msg = document.getElementById('modalApplyMessage');
        
        try {
            applyBtn.textContent = 'Applying...';
            applyBtn.disabled = true;
            await apiCall(`/jobs/${currentViewJobId}/apply`, 'POST');
            applyBtn.textContent = 'Applied Successfully';
            applyBtn.classList.replace('btn-primary', 'btn-success');
            msg.textContent = 'Application submitted!';
            msg.style.color = 'var(--success-color)';
        } catch (error) {
            applyBtn.textContent = 'Apply Now';
            applyBtn.disabled = false;
            msg.textContent = error.message;
            msg.style.color = 'var(--danger-color)';
        }
    });

    // Load Applications
    async function loadApplications() {
        const applicationsList = document.getElementById('applicationsList');
        applicationsList.innerHTML = `
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
        `;
        
        try {
            const apps = await apiCall('/jobs/applications', 'GET');
            
            if (apps.length === 0) {
                applicationsList.innerHTML = `
                    <div class="text-center" style="padding: 60px;">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px; opacity: 0.5;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <p style="color: var(--text-secondary); font-size: 1.1rem;">You have not applied to any jobs yet.</p>
                    </div>
                `;
                return;
            }

            let hasSelected = false;

            applicationsList.innerHTML = apps.map(app => {
                const job = app.jobPosting;
                let extraDetails = '';
                if (app.status === 'INTERVIEW_SCHEDULED' || app.assessmentLink || app.interviewLink || app.offerLetterUrl || app.status === 'OFFER_EXTENDED' || app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED') {
                    let actionsHtml = '';
                    if (app.status === 'OFFER_EXTENDED') {
                        actionsHtml = `
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; background: var(--success-color);" onclick="respondToOffer(${app.application_id || app.id}, 'ACCEPT')">Accept Offer</button>
                                <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; color: var(--danger-color); border-color: var(--danger-color);" onclick="respondToOffer(${app.application_id || app.id}, 'DECLINE')">Decline Offer</button>
                            </div>
                        `;
                    }
                    if (app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED') {
                        actionsHtml = `
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="generateOfferLetter('${job.companyName}', '${job.jobTitle}', '${job.salaryPackage}')">Download Official Offer Letter (PDF)</button>
                            </div>
                        `;
                    }
                    if (app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED') {
                        actionsHtml += `
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="generateAdmitCard('${job.companyName}', '${app.application_id || app.id}', '${job.testPlatform || ''}', '${job.testDatetime || ''}', '${app.interviewLink || job.testLink || ''}')">Download Hall Ticket / Admit Card</button>
                            </div>
                        `;
                    }

                    extraDetails = `<div style="margin-top: 10px; padding: 10px; background: rgba(254, 215, 170, 0.2); border-radius: 6px; font-size: 0.9rem;">
                                        ${app.interviewDetails ? `<strong>Interview Details:</strong> ${app.interviewDetails}` : ''}
                                        ${app.assessmentLink ? `<div style="margin-top: 0.5rem;"><a href="${app.assessmentLink}" target="_blank" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background: #e0f2fe;">Take Assessment</a></div>` : ''}
                                        ${app.interviewLink ? `<div style="margin-top: 0.5rem;"><a href="${app.interviewLink}" target="_blank" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background: #dcfce7;">Join Interview Meeting</a></div>` : ''}
                                        ${app.status === 'INTERVIEW_SCHEDULED' ? `<div style="margin-top: 0.5rem;"><button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="openSlotsModal(${job.id})">Select Interview Slot</button></div>` : ''}
                                        ${app.offerLetterUrl ? `<div style="margin-top: 1rem;"><a href="${app.offerLetterUrl}" target="_blank" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">View Provided Offer Letter</a></div>` : ''}
                                        ${actionsHtml}
                                    </div>`;
                }

                if (app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED') {
                    hasSelected = true;
                }

                return `
                <div class="card" style="display: flex; flex-direction: column; ${app.status === 'SELECTED' ? 'border: 2px solid var(--success-color); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);' : ''}">
                    <div class="d-flex justify-between align-center">
                        <div>
                            <h3 class="job-title" style="margin-bottom: 4px; font-size: 1.1rem;">${job.jobTitle}</h3>
                            <div class="company-name" style="margin-bottom: 4px; font-size: 0.9rem;">${job.companyName}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Applied on: ${new Date(app.applied_date || app.applicationDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <span class="badge" style="background:${getStudentStatusColor(app.status)}">${formatStudentStatus(app.status)}</span>
                        </div>
                    </div>
                    <div style="margin-top: 1rem;">
                        ${renderPipelineTracker(app.status)}
                    </div>
                    ${extraDetails}
                </div>
                `;
            }).join('');
            
            if (hasSelected && typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#3b82f6', '#f59e0b']
                });
            }

            loadDashboardMetrics(apps);
        } catch (error) {
            applicationsList.innerHTML = `<div class="text-center" style="color: var(--danger-color);">Error loading applications: ${error.message}</div>`;
        }
    }

    function renderPipelineTracker(status) {
        const steps = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED'];
        const labels = ['Applied', 'Shortlisted', 'Interview', 'Selected'];
        
        let currentIndex = steps.indexOf(status);
        if (status === 'UNDER_REVIEW') currentIndex = 0;
        if (status === 'OFFER_EXTENDED' || status === 'OFFER_ACCEPTED') currentIndex = 3;
        
        // If rejected, we break the pipeline gracefully
        if (status === 'REJECTED') {
            return `<div style="color: var(--danger-color); font-weight: 500; text-align: center; padding: 10px;">Application Rejected</div>`;
        }

        let html = '<div class="timeline-stepper">';
        for (let i = 0; i < steps.length; i++) {
            let stepClass = 'timeline-step';
            if (i < currentIndex) stepClass += ' completed';
            else if (i === currentIndex) stepClass += ' active';
            
            let icon = (i < currentIndex || status === 'SELECTED' || status === 'OFFER_ACCEPTED') ? '✓' : (i + 1);
            if (i === currentIndex && status !== 'SELECTED' && status !== 'OFFER_ACCEPTED') icon = '•';

            html += `
                <div class="${stepClass}">
                    ${icon}
                    <div class="timeline-step-label">${labels[i]}</div>
                </div>
            `;
        }
        html += '</div>';
        return html;
    }
    
    function loadDashboardMetrics(applications) {
        document.getElementById('dashTotalApplied').textContent = applications.length;
        const selected = applications.filter(a => a.status === 'SELECTED').length;
        const underReview = applications.filter(a => ['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length;
        document.getElementById('dashSelected').textContent = selected;
        document.getElementById('dashUnderReview').textContent = underReview;
    }
    
    let currentStatsForExport = null;
    async function loadLeaderboard() {
        try {
            const stats = await apiCall('/jobs/leaderboard', 'GET');
            currentStatsForExport = stats;
            document.getElementById('leaderHighest').textContent = (stats.highestPackage && stats.highestPackage > 0) ? stats.highestPackage : 50;
            document.getElementById('leaderAverage').textContent = (stats.averagePackage && stats.averagePackage > 0) ? stats.averagePackage : 8;
            
            const branchContainer = document.getElementById('branchProgressBars');
            branchContainer.innerHTML = '';
            
            const allBranches = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'AE', 'AI & DS', 'MTE', 'BT'];
            
            allBranches.forEach(branch => {
                const pct = (stats.branchPlacementPercentages && stats.branchPlacementPercentages[branch]) ? stats.branchPlacementPercentages[branch] : 0;
                branchContainer.innerHTML += `
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                            <span style="font-weight: 600; color: var(--text-main);">${branch}</span>
                            <span style="color: var(--primary-color); font-weight: 600;">${pct}%</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${pct}%; height: 100%; background: var(--accent); border-radius: 4px; transition: width 1s ease-out;"></div>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Failed to load leaderboard', error);
        }
    }
    
    const exportBtn = document.getElementById('exportReportBtn');
    if(exportBtn) {
        exportBtn.addEventListener('click', () => {
            if(!currentStatsForExport) return alert('Data not loaded yet.');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text("Placement Statistics Report", 20, 20);
            doc.setFontSize(14);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
            
            doc.setFontSize(16);
            doc.text("Key Metrics", 20, 45);
            doc.setFontSize(12);
            const high = currentStatsForExport.highestPackage > 0 ? currentStatsForExport.highestPackage : 50;
            const avg = currentStatsForExport.averagePackage > 0 ? currentStatsForExport.averagePackage : 8;
            doc.text(`Highest Package: ${high} LPA`, 20, 55);
            doc.text(`Average Package: ${avg} LPA`, 20, 62);
            
            doc.setFontSize(16);
            doc.text("Branch-wise Placement %", 20, 77);
            doc.setFontSize(12);
            let y = 87;
            const branches = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'AE', 'AI & DS', 'MTE', 'BT'];
            branches.forEach(b => {
                const pct = currentStatsForExport.branchPlacementPercentages?.[b] || 0;
                doc.text(`${b}: ${pct}%`, 20, y);
                y += 7;
            });
            doc.save("Placement_Report.pdf");
        });
    }

    function getStudentStatusColor(status) {
        switch(status) {
            case 'APPLIED': return '#e0e7ff';
            case 'UNDER_REVIEW': return '#f3e8ff';
            case 'SHORTLISTED': return '#fef08a';
            case 'INTERVIEW_SCHEDULED': return '#fed7aa';
            case 'SELECTED': return '#a7f3d0';
            case 'REJECTED': return '#fecaca';
            default: return '#e0e7ff';
        }
    }

    function formatStudentStatus(status) {
        if (!status) return '';
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    // Global Functions for inline onclick handlers
    window.respondToOffer = async function(appId, response) {
        if (!confirm(`Are you sure you want to ${response.toLowerCase()} this offer?`)) return;
        
        try {
            const token = getToken();
            const res = await fetch(`${DEV_HOST}/api/jobs/applications/${appId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ response: response })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to respond');
            }

            if (response === 'ACCEPT' && window.confetti) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
            alert('Response recorded successfully!');
            loadApplications();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    window.generateOfferLetter = function(companyName, jobTitle, packageStr) {
        if (!window.jspdf) {
            alert("PDF library is not loaded.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const studentName = document.getElementById('profName').value || 'Student';
        const date = new Date().toLocaleDateString();

        doc.setFontSize(22);
        doc.text("Official Offer Letter", 105, 20, null, null, "center");
        doc.setFontSize(12);
        doc.text(`Date: ${date}`, 20, 40);
        doc.text(`Dear ${studentName},`, 20, 60);
        
        doc.text(`We are pleased to offer you the position of ${jobTitle} at ${companyName}.`, 20, 75);
        doc.text(`Your compensation package will be ${packageStr}.`, 20, 85);
        
        doc.text("Congratulations on your outstanding achievement during the campus placement process.", 20, 105);
        doc.text("Please accept this offer as confirmation of your employment.", 20, 115);
        
        doc.text("Sincerely,", 20, 140);
        doc.text("Placement Cell & Company HR", 20, 150);

        doc.save(`${companyName}_OfferLetter.pdf`);
    };

    window.openSlotsModal = async function(jobId) {
        document.getElementById('slotsModal').style.display = 'flex';
        const slotsList = document.getElementById('slotsList');
        slotsList.innerHTML = 'Loading slots...';
        
        try {
            const slots = await apiCall(`/jobs/${jobId}/slots`, 'GET');
            if (slots.length === 0) {
                slotsList.innerHTML = '<div style="color: var(--danger-color);">No slots available or you have already booked one.</div>';
                return;
            }
            
            slotsList.innerHTML = slots.map(s => {
                const dt = new Date(s.slotTime).toLocaleString();
                return `
                    <div style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>${dt}</div>
                        <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;" onclick="bookSlot(${s.id})">Book</button>
                    </div>
                `;
            }).join('');
        } catch (error) {
            slotsList.innerHTML = '<div style="color: var(--danger-color);">Failed to load slots</div>';
        }
    };
    
    window.closeSlotsModal = function() {
        document.getElementById('slotsModal').style.display = 'none';
    };
    
    window.bookSlot = async function(slotId) {
        if (!confirm('Book this slot?')) return;
        try {
            await apiCall(`/jobs/slots/${slotId}/book`, 'POST');
            alert('Slot booked successfully!');
            closeSlotsModal();
            loadApplications();
        } catch (error) {
            alert('Error booking slot: ' + error.message);
        }
    };

    function calculateSkillMatch(studentSkills, requiredSkills) {
        if (!studentSkills || !requiredSkills) return { score: 0, badge: '' };
        
        const sSkills = studentSkills.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        const rSkills = requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        
        if (rSkills.length === 0) return { score: 100, badge: '' };
        
        let matchCount = 0;
        rSkills.forEach(reqSkill => {
            if (sSkills.some(stuSkill => stuSkill.includes(reqSkill) || reqSkill.includes(stuSkill))) {
                matchCount++;
            }
        });
        
        const score = Math.round((matchCount / rSkills.length) * 100);
        
        let bgColor = '#ef4444'; // Red < 50
        let label = 'Low Match';
        if (score >= 75) {
            bgColor = '#10b981'; // Green
            label = 'High Match';
        } else if (score >= 50) {
            bgColor = '#f59e0b'; // Yellow
            label = 'Medium Match';
        }
        
        return {
            score: score,
            badge: `<span class="badge" style="background: ${bgColor}; color: white; margin-right: 5px;" title="${score}% Skills Matched">${label} (${score}%)</span>`
        };
    }

    function renderPipelineTracker(status) {
        const steps = ['Applied', 'Aptitude Test', 'Technical Interview', 'HR Interview', 'Offer Letter Released'];
        
        let currentIndex = 0;
        if (status === 'SHORTLISTED') currentIndex = 1; // Aptitude Test Stage
        if (status === 'INTERVIEW_SCHEDULED') currentIndex = 2; // Technical Interview
        // Assuming HR interview comes before offer extended
        if (status === 'UNDER_REVIEW') currentIndex = 3; // Let's map this to HR Interview in this view
        if (['SELECTED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED'].includes(status)) currentIndex = 4;
        if (status === 'REJECTED') currentIndex = -1;
        if (status === 'OFFER_DECLINED') currentIndex = -1;

        let html = '<div style="display: flex; align-items: center; width: 100%; max-width: 500px; justify-content: space-between; position: relative;">';
        
        // Background line
        html += '<div style="position: absolute; top: 10px; left: 0; right: 0; height: 2px; background: #e5e7eb; z-index: 1;"></div>';
        
        // Active line
        const activeWidth = currentIndex > 0 ? (currentIndex / (steps.length - 1)) * 100 : 0;
        if (currentIndex >= 0) {
            html += `<div style="position: absolute; top: 10px; left: 0; width: ${activeWidth}%; height: 2px; background: var(--primary-color); z-index: 2; transition: width 0.3s;"></div>`;
        }

        steps.forEach((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isActive = idx === currentIndex;
            
            let circleBg = isCompleted ? 'var(--primary-color)' : '#fff';
            let circleColor = isCompleted ? '#fff' : '#d1d5db';
            let circleBorder = isCompleted ? 'var(--primary-color)' : '#d1d5db';
            let textColor = isCompleted ? 'var(--text-main)' : 'var(--text-muted)';
            let fontWeight = isActive ? '600' : '400';

            if (status === 'REJECTED' || status === 'OFFER_DECLINED') {
                circleBg = '#fff';
                circleColor = '#d1d5db';
                circleBorder = '#d1d5db';
                textColor = 'var(--text-muted)';
            }

            html += `
                <div style="display: flex; flex-direction: column; align-items: center; z-index: 3;">
                    <div style="width: 22px; height: 22px; border-radius: 50%; background: ${circleBg}; border: 2px solid ${circleBorder}; display: flex; align-items: center; justify-content: center; font-size: 10px; color: ${circleColor};">
                        ${isCompleted ? '✓' : ''}
                    </div>
                    <div style="font-size: 0.7rem; margin-top: 6px; color: ${textColor}; font-weight: ${fontWeight}; text-align: center; max-width: 80px;">
                        ${step}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    window.generateAdmitCard = function(companyName, appId, testPlatform, testDatetime, link) {
        if (!window.jspdf) {
            alert("PDF library is not loaded.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const studentName = document.getElementById('profName').value || 'Student';
        const rollNo = document.getElementById('profRollNo').value || 'N/A';
        const branch = document.getElementById('profDept').value || 'N/A';
        const cgpa = document.getElementById('profCgpa').value || 'N/A';

        doc.setFontSize(22);
        doc.text("Placement Hall Ticket / Admit Card", 105, 20, null, null, "center");
        doc.setFontSize(12);
        doc.text(`Student Name: ${studentName}`, 20, 40);
        doc.text(`Roll No: ${rollNo}`, 20, 50);
        doc.text(`Branch: ${branch}`, 20, 60);
        doc.text(`CGPA: ${cgpa}`, 20, 70);
        
        doc.text(`Target Company: ${companyName}`, 20, 90);
        if (testPlatform) {
            doc.text(`Test Platform: ${testPlatform}`, 20, 100);
        }
        if (testDatetime) {
            doc.text(`Date & Time: ${new Date(testDatetime).toLocaleString()}`, 20, 110);
        }
        if (link) {
            doc.text(`Virtual Meeting / Test Link: ${link}`, 20, 120);
        }
        
        doc.text("Instructions:", 20, 140);
        doc.setFontSize(10);
        doc.text("1. Please carry this admit card to the examination/interview.", 20, 150);
        doc.text("2. Maintain strict discipline during the selection process.", 20, 160);
        doc.text("3. Any form of malpractice will lead to immediate disqualification.", 20, 170);

        // Add a QR code placeholder (or real QR if qrcode generation to canvas works)
        try {
            const qrContainer = document.createElement('div');
            new QRCode(qrContainer, {
                text: `AppID:${appId}|Student:${rollNo}|Company:${companyName}`,
                width: 100,
                height: 100
            });
            setTimeout(() => {
                const qrCanvas = qrContainer.querySelector('canvas');
                if (qrCanvas) {
                    const imgData = qrCanvas.toDataURL('image/png');
                    doc.addImage(imgData, 'PNG', 140, 40, 40, 40);
                }
                doc.save(`${companyName}_AdmitCard.pdf`);
            }, 100);
        } catch (e) {
            doc.save(`${companyName}_AdmitCard.pdf`);
        }
    };

    async function loadUpcomingTests() {
        const testsList = document.getElementById('testsList');
        testsList.innerHTML = `
            <div class="skeleton skeleton-card" style="height: 120px;"></div>
            <div class="skeleton skeleton-card" style="height: 120px;"></div>
        `;
        
        try {
            const apps = await apiCall('/jobs/applications', 'GET');
            const testApps = apps.filter(app => app.status === 'SHORTLISTED' && app.jobPosting.testPlatform);
            
            if (testApps.length === 0) {
                testsList.innerHTML = `
                    <div class="text-center" style="padding: 60px;">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px; opacity: 0.5;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <p style="color: var(--text-secondary); font-size: 1.1rem;">No upcoming online tests at the moment.</p>
                    </div>
                `;
                return;
            }

            testsList.innerHTML = testApps.map(app => {
                const job = app.jobPosting;
                const testDate = new Date(job.testDatetime);
                const testLink = job.testLink || app.assessmentLink || '#';
                return `
                <div class="card" style="display: flex; flex-direction: column; border-left: 4px solid var(--primary-color);">
                    <div class="d-flex justify-between align-center">
                        <div>
                            <h3 class="job-title" style="margin-bottom: 4px; font-size: 1.1rem;">${job.jobTitle} - ${job.companyName}</h3>
                            <span class="badge" style="background: #e0f2fe; color: #0284c7;">${job.testPlatform} Assessment</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: var(--text-primary);">${testDate.toLocaleDateString()}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">${testDate.toLocaleTimeString()}</div>
                        </div>
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <a href="${testLink}" target="_blank" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 5px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Join Test
                        </a>
                        <button class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 5px;" onclick="generateAdmitCard('${job.companyName}', '${app.application_id || app.id}', '${job.testPlatform}', '${job.testDatetime}', '${testLink}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Hall Pass
                        </button>
                        <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(job.companyName + ' ' + job.testPlatform + ' Assessment')}&dates=${testDate.toISOString().replace(/-|:|\.\d+/g, '')}/${new Date(testDate.getTime() + 2*60*60*1000).toISOString().replace(/-|:|\.\d+/g, '')}&details=${encodeURIComponent('Assessment Link: ' + testLink)}" target="_blank" class="btn btn-outline" style="border-color: #cbd5e1; color: var(--text-secondary); display: inline-flex; align-items: center; gap: 5px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Add to Calendar
                        </a>
                    </div>
                </div>
                `;
            }).join('');
        } catch (error) {
            testsList.innerHTML = `<div class="text-center" style="color: var(--danger-color);">Error loading tests: ${error.message}</div>`;
        }
    }

    // --- Phase 1: Documents Vault ---
    async function loadDocumentsVault() {
        try {
            const profile = await apiCall('/student/profile', 'GET');
            updateDocStatus('tenthDocStatus', profile.tenthMarksheetUrl);
            updateDocStatus('twelfthDocStatus', profile.twelfthMarksheetUrl);
            updateDocStatus('aadharDocStatus', profile.aadharUrl);
        } catch(e) {
            console.error(e);
        }
    }

    function updateDocStatus(elementId, url) {
        const el = document.getElementById(elementId);
        if (url) {
            el.innerHTML = `<a href="${DEV_HOST}${url}" target="_blank" class="badge" style="background:#dcfce7; color:#166534; text-decoration:none;">View Uploaded Document</a>`;
        } else {
            el.innerHTML = `<span class="badge" style="background:#fee2e2; color:#ef4444;">Not Uploaded</span>`;
        }
    }

    ['tenth', 'twelfth', 'aadhar'].forEach(docType => {
        const uploadInput = document.getElementById(`${docType}Upload`);
        if (uploadInput) {
            uploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', docType.toUpperCase());

                const statusEl = document.getElementById(`${docType}DocStatus`);
                statusEl.innerHTML = `<span style="color:var(--text-secondary);">Uploading...</span>`;

                try {
                    const response = await fetch(`${DEV_HOST}/api/student/profile/upload-document`, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + getToken()
                        },
                        body: formData
                    });

                    if (response.ok) {
                        const url = await response.text();
                        updateDocStatus(`${docType}DocStatus`, url);
                        alert('Document uploaded successfully!');
                    } else {
                        throw new Error('Upload failed');
                    }
                } catch (error) {
                    statusEl.innerHTML = `<span style="color:var(--danger-color);">Upload Failed</span>`;
                }
            });
        }
    });

    // --- Phase 1: Resume Builder ---
    let cachedProfileForResume = null;
    async function loadResumeBuilder() {
        try {
            const profile = await apiCall('/student/profile', 'GET');
            cachedProfileForResume = profile;
            document.getElementById('profileProjects').value = profile.projects || '';
            document.getElementById('profileExperience').value = profile.experience || '';
            
            // Load jobs for AI Scorer
            const jobs = await apiCall('/jobs', 'GET');
            const jobSelect = document.getElementById('aiJobSelect');
            jobSelect.innerHTML = '<option value="">Select a Job to Analyze...</option>' + 
                jobs.map(j => `<option value="${j.id}">${j.jobTitle} at ${j.companyName}</option>`).join('');
                
        } catch(e) {
            console.error(e);
        }
    }

    document.getElementById('resumeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            if(!cachedProfileForResume) return;
            cachedProfileForResume.projects = document.getElementById('profileProjects').value;
            cachedProfileForResume.experience = document.getElementById('profileExperience').value;
            await apiCall('/student/profile', 'PUT', cachedProfileForResume);
            alert('Resume profile saved!');
        } catch (e) {
            alert('Failed to save resume profile.');
        }
    });

    document.getElementById('generateResumeBtn').addEventListener('click', () => {
        if (!cachedProfileForResume) return alert('Please load profile first.');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const p = cachedProfileForResume;
        
        doc.setFontSize(22);
        doc.text(p.name || 'Your Name', 20, 20);
        doc.setFontSize(12);
        doc.text(`${p.email || ''} | ${p.mobileNumber || ''}`, 20, 30);
        
        doc.setFontSize(16);
        doc.text('Education', 20, 45);
        doc.setFontSize(12);
        doc.text(`Branch: ${p.department || ''}`, 20, 55);
        doc.text(`CGPA: ${p.cgpa || ''}`, 20, 62);
        doc.text(`Graduation Year: ${p.graduationYear || ''}`, 20, 69);
        
        let y = 85;
        doc.setFontSize(16);
        doc.text('Skills', 20, y);
        doc.setFontSize(12);
        y += 10;
        const splitSkills = doc.splitTextToSize(p.skills || 'None', 170);
        doc.text(splitSkills, 20, y);
        y += (splitSkills.length * 7) + 10;
        
        doc.setFontSize(16);
        doc.text('Experience', 20, y);
        doc.setFontSize(12);
        y += 10;
        const splitExp = doc.splitTextToSize(p.experience || 'None', 170);
        doc.text(splitExp, 20, y);
        y += (splitExp.length * 7) + 10;

        doc.setFontSize(16);
        doc.text('Projects', 20, y);
        doc.setFontSize(12);
        y += 10;
        const splitProj = doc.splitTextToSize(p.projects || 'None', 170);
        doc.text(splitProj, 20, y);
        
        doc.save(`${p.name.replace(/\s+/g, '_')}_Resume.pdf`);
    });

    // --- AI Resume Scorer Logic ---
    document.getElementById('aiAnalyzeBtn').addEventListener('click', async () => {
        const jobId = document.getElementById('aiJobSelect').value;
        if (!jobId) return alert('Please select a job to analyze against.');
        if (!cachedProfileForResume) return alert('Please wait for profile to load.');

        try {
            const job = await apiCall(`/jobs/${jobId}`, 'GET');
            const reqSkillsStr = job.requirements || '';
            const mySkillsStr = cachedProfileForResume.skills || '';

            // Simple intersection logic for demonstration
            const extractKeywords = (str) => str.toLowerCase().split(/[\s,.\/|-]+/).filter(w => w.length > 2);
            const reqKeywords = Array.from(new Set(extractKeywords(reqSkillsStr)));
            const myKeywords = Array.from(new Set(extractKeywords(mySkillsStr)));

            let matchCount = 0;
            let matched = [];
            let missing = [];

            // A very simple keyword matcher
            reqKeywords.forEach(rk => {
                // If student has a skill keyword that includes the req keyword or vice-versa
                const hasMatch = myKeywords.some(mk => mk.includes(rk) || rk.includes(mk));
                if (hasMatch) {
                    matchCount++;
                    matched.push(rk);
                } else {
                    missing.push(rk);
                }
            });

            // Handle edge case where reqKeywords is empty
            const score = reqKeywords.length > 0 ? Math.round((matchCount / reqKeywords.length) * 100) : 100;
            
            document.getElementById('aiScoreResult').style.display = 'block';
            
            const scoreEl = document.getElementById('aiScorePercentage');
            scoreEl.textContent = `${score}%`;
            scoreEl.style.color = score >= 70 ? '#10b981' : (score >= 40 ? '#f59e0b' : '#ef4444');

            document.getElementById('aiMatchedSkills').innerHTML = matched.map(s => 
                `<span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:12px; font-size:0.8rem;">${s}</span>`
            ).join('') || '<span style="font-size:0.8rem; color:#64748b;">None found</span>';

            document.getElementById('aiMissingSkills').innerHTML = missing.map(s => 
                `<span style="background:#fee2e2; color:#ef4444; padding:2px 8px; border-radius:12px; font-size:0.8rem;">${s}</span>`
            ).join('') || '<span style="font-size:0.8rem; color:#64748b;">None</span>';

        } catch(e) {
            alert('Failed to analyze match.');
        }
    });

    // --- Phase 1: Interview Calendar ---
    let calendarInstance = null;
    async function loadInterviewCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        try {
            // Fetch applications to extract scheduled interviews/tests
            const apps = await apiCall('/jobs/applications', 'GET');
            const events = [];

            apps.forEach(app => {
                if (app.status === 'SHORTLISTED' && app.jobPosting.testDatetime) {
                    events.push({
                        title: `Test: ${app.jobPosting.companyName}`,
                        start: app.jobPosting.testDatetime,
                        backgroundColor: '#0284c7', // blue
                        url: app.jobPosting.testLink || '#'
                    });
                }
                if (app.status === 'INTERVIEW_SCHEDULED') {
                    // if we had a specific interviewDatetime, we'd use it. For now, try to parse from interviewDetails
                    // If no date, we can't show it easily on a calendar. Let's assume there's a date or put it today for demo.
                    const demoDate = new Date(); // In a real system, we should have an interview_datetime field.
                    events.push({
                        title: `Interview: ${app.jobPosting.companyName}`,
                        start: demoDate.toISOString().split('T')[0], 
                        backgroundColor: '#f59e0b', // amber
                    });
                }
            });

            if (!calendarInstance) {
                calendarInstance = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    },
                    events: events,
                    height: 500
                });
                calendarInstance.render();
            } else {
                calendarInstance.removeAllEvents();
                calendarInstance.addEventSource(events);
            }
        } catch (e) {
            console.error('Failed to load calendar', e);
        }
    }
});
