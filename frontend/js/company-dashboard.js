const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:' ? 'http://localhost:8080/api' : '/api';

// Check Authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check if Company Role
    // Simple check: we just load company profile. If it fails due to 403, we redirect to login
    
    loadCompanyProfile();
    loadMyJobs();
    
    // Sidebar Navigation Logic
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function(e) {
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
            const target = this.getAttribute('data-target');
            document.getElementById(target).classList.add('active');

            if (target === 'reportsSection') {
                loadCompanyReports();
            }
        });
    });

    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('jobForm').addEventListener('submit', handleJobPost);
    document.getElementById('editJobForm').addEventListener('submit', handleJobEdit);
    document.getElementById('generateSlotsForm').addEventListener('submit', handleGenerateSlots);
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    const response = await fetch(`${API_URL}${url}`, { ...options, headers });
    
    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Authentication failed');
    }
    
    return response;
}

async function loadCompanyProfile() {
    try {
        const res = await fetchWithAuth('/companies/profile');
        if (res.ok) {
            const profile = await res.json();
            document.getElementById('userNameDisplay').textContent = profile.company_name || 'Company User';
            document.getElementById('companyName').value = profile.company_name || '';
            document.getElementById('companyEmail').value = profile.email || '';
            if (profile.contactNumber) {
                let parts = profile.contactNumber.split(' ');
                if (parts.length > 1 && parts[0].startsWith('+')) {
                    document.getElementById('countryCode').value = parts[0];
                    document.getElementById('contactNumber').value = parts.slice(1).join(' ');
                } else {
                    document.getElementById('contactNumber').value = profile.contactNumber;
                }
            } else {
                document.getElementById('contactNumber').value = '';
            }
            document.getElementById('website').value = profile.website || '';
            document.getElementById('industry').value = profile.industry || '';
            document.getElementById('description').value = profile.description || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const profileData = {
        company_name: document.getElementById('companyName').value,
        contactNumber: document.getElementById('countryCode').value + ' ' + document.getElementById('contactNumber').value,
        website: document.getElementById('website').value,
        industry: document.getElementById('industry').value,
        description: document.getElementById('description').value
    };

    try {
        const res = await fetchWithAuth('/companies/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        if (res.ok) {
            alert('Profile updated successfully!');
            loadCompanyProfile();
        }
    } catch (error) {
        alert('Failed to update profile');
    }
}

async function handleJobPost(e) {
    e.preventDefault();
    const jobData = {
        jobTitle: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        minCgpa: parseFloat(document.getElementById('minCgpa').value),
        location: document.getElementById('jobLocation').value,
        salaryPackage: document.getElementById('jobSalary').value,
        requiredSkills: document.getElementById('jobSkills').value,
        eligibilityCriteria: document.getElementById('jobEligibility').value,
        lastDateToApply: document.getElementById('jobLastDate').value,
        ctcComponents: document.getElementById('jobCtcComponents').value,
        selectionRounds: document.getElementById('jobSelectionRounds').value,
        bondDetails: document.getElementById('jobBondDetails').value,
        eligibleBranches: Array.from(document.querySelectorAll('#jobBranches input:checked')).map(cb => cb.value).join(','),
        testPlatform: document.getElementById('jobTestPlatform').value,
        testDatetime: document.getElementById('jobTestDatetime').value,
        testLink: document.getElementById('jobTestLink').value
    };

    try {
        const res = await fetchWithAuth('/companies/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
        
        if (res.ok) {
            alert('Job posted successfully!');
            document.getElementById('jobForm').reset();
            loadMyJobs();
        }
    } catch (error) {
        alert('Failed to post job');
    }
}

let currentJobs = [];

async function loadMyJobs() {
    try {
        const res = await fetchWithAuth('/companies/jobs');
        if (res.ok) {
            currentJobs = await res.json();
            const jobsListElement = document.getElementById('jobsList');
            jobsListElement.innerHTML = '';
            
            if (currentJobs.length === 0) {
                jobsListElement.innerHTML = '<p>No jobs posted yet.</p>';
                return;
            }
            
            currentJobs.forEach(job => {
                const card = document.createElement('div');
                card.className = 'job-card';
                card.innerHTML = `
                    <div class="job-header">
                        <div class="job-title">${job.jobTitle}</div>
                        <span class="badge">${job.status}</span>
                    </div>
                    <p style="margin: 0.5rem 0; font-size: 0.9rem;">Min CGPA: ${job.minCgpa}</p>
                    <div style="display: flex; gap: 10px; margin-top: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="viewApplicants(${job.id}, '${job.jobTitle}')">View Applicants</button>
                        <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="openGenerateSlotsModal(${job.id})">Generate Slots</button>
                        <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;" onclick="openEditJobModal(${job.id})">
                            Edit
                        </button>
                        <button class="btn btn-outline" style="font-size: 0.85rem; color: var(--danger-color); border-color: var(--danger-color);" onclick="deleteJob(${job.id})">
                            Delete
                        </button>
                    </div>
                `;
                jobsListElement.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

function openEditJobModal(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;
    
    document.getElementById('editJobId').value = job.id;
    document.getElementById('editJobTitle').value = job.jobTitle;
    document.getElementById('editJobDescription').value = job.description;
    document.getElementById('editMinCgpa').value = job.minCgpa;
    document.getElementById('editJobLocation').value = job.location || '';
    document.getElementById('editJobSalary').value = job.salaryPackage || '';
    document.getElementById('editJobSkills').value = job.requiredSkills || '';
    document.getElementById('editJobEligibility').value = job.eligibilityCriteria || '';
    document.getElementById('editJobLastDate').value = job.lastDateToApply || '';
    document.getElementById('editJobTestPlatform').value = job.testPlatform || '';
    
    // Format datetime-local input properly if value exists
    if (job.testDatetime) {
        document.getElementById('editJobTestDatetime').value = job.testDatetime.substring(0, 16);
    } else {
        document.getElementById('editJobTestDatetime').value = '';
    }
    
    document.getElementById('editJobTestLink').value = job.testLink || '';
    
    // Check branches
    const branches = (job.eligibleBranches || 'ALL').split(',');
    document.querySelectorAll('#editJobBranches input').forEach(cb => {
        cb.checked = branches.includes('ALL') || branches.includes(cb.value);
    });
    
    document.getElementById('editJobModal').style.display = 'flex';
}

function closeEditJobModal() {
    document.getElementById('editJobModal').style.display = 'none';
}

function openGenerateSlotsModal(jobId) {
    document.getElementById('slotsJobId').value = jobId;
    document.getElementById('generateSlotsModal').style.display = 'flex';
}

function closeGenerateSlotsModal() {
    document.getElementById('generateSlotsModal').style.display = 'none';
}

document.getElementById('generateSlotsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const jobId = document.getElementById('slotsJobId').value;
    const startTime = document.getElementById('slotsStartTime').value;
    const slotCount = document.getElementById('slotsCount').value;
    const durationMinutes = document.getElementById('slotsDuration').value;

    try {
        const res = await fetchWithAuth(`/company/jobs/${jobId}/slots`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startTime, slotCount, durationMinutes })
        });
        
        if (res.ok) {
            alert('Slots generated successfully!');
            closeGenerateSlotsModal();
        } else {
            const err = await res.text();
            alert('Error generating slots: ' + err);
        }
    } catch (error) {
        alert('Failed to generate slots');
    }
});

async function handleJobEdit(e) {
    e.preventDefault();
    const jobId = document.getElementById('editJobId').value;
    const jobData = {
        jobTitle: document.getElementById('editJobTitle').value,
        description: document.getElementById('editJobDescription').value,
        minCgpa: parseFloat(document.getElementById('editMinCgpa').value),
        location: document.getElementById('editJobLocation').value,
        salaryPackage: document.getElementById('editJobSalary').value,
        requiredSkills: document.getElementById('editJobSkills').value,
        eligibilityCriteria: document.getElementById('editJobEligibility').value,
        lastDateToApply: document.getElementById('editJobLastDate').value,
        eligibleBranches: Array.from(document.querySelectorAll('#editJobBranches input:checked')).map(cb => cb.value).join(','),
        testPlatform: document.getElementById('editJobTestPlatform').value,
        testDatetime: document.getElementById('editJobTestDatetime').value,
        testLink: document.getElementById('editJobTestLink').value
    };

    try {
        const res = await fetchWithAuth(`/companies/jobs/${jobId}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
        
        if (res.ok) {
            alert('Job updated successfully!');
            closeEditJobModal();
            loadMyJobs();
        } else {
            alert('Failed to update job');
        }
    } catch (error) {
        alert('Error updating job');
    }
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job posting? This will also remove all associated applications.')) {
        return;
    }
    
    try {
        const res = await fetchWithAuth(`/companies/jobs/${jobId}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            alert('Job deleted successfully!');
            loadMyJobs();
        } else {
            alert('Failed to delete job');
        }
    } catch (error) {
        alert('Error deleting job');
    }
}

function openGenerateSlotsModal(jobId) {
    document.getElementById('slotsJobId').value = jobId;
    document.getElementById('generateSlotsModal').style.display = 'flex';
}

function closeGenerateSlotsModal() {
    document.getElementById('generateSlotsModal').style.display = 'none';
}

async function handleGenerateSlots(e) {
    e.preventDefault();
    const jobId = document.getElementById('slotsJobId').value;
    const payload = {
        startTime: document.getElementById('slotsStartTime').value,
        slotCount: document.getElementById('slotsCount').value,
        durationMinutes: document.getElementById('slotsDuration').value
    };
    
    try {
        const res = await fetchWithAuth(`/companies/jobs/${jobId}/slots`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert('Slots generated successfully!');
            closeGenerateSlotsModal();
            document.getElementById('generateSlotsForm').reset();
        } else {
            alert('Failed to generate slots');
        }
    } catch (error) {
        alert('Error generating slots');
    }
}

let currentJobId = null;
let currentApplications = [];

async function viewApplicants(jobId, jobTitle) {
    currentJobId = jobId;
    document.getElementById('applicantsJobTitle').textContent = `Applicants for: ${jobTitle}`;
    
    // Navigate to applicants section
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-target="applicantsSection"]').classList.add('active');
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('applicantsSection').classList.add('active');

    try {
        const res = await fetchWithAuth(`/companies/jobs/${jobId}/applications`);
        if (res.ok) {
            currentApplications = await res.json();
            const applications = currentApplications;
            const tbody = document.getElementById('applicationsTableBody');
            tbody.innerHTML = '';
            
            if (applications.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No applications yet</td></tr>';
                return;
            }
            
            applications.forEach(app => {
                const date = new Date(app.applied_date).toLocaleDateString();
                const student = app.studentProfile;
                const resumeUrl = student.resume || student.resumeLink;
                const resumeHtml = resumeUrl ? `<a href="${resumeUrl}" target="_blank" style="color:var(--primary-color); text-decoration:underline;">View Resume</a>` : 'N/A';
                
                tbody.innerHTML += `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.rollNo}</td>
                        <td>${student.branch || student.department}</td>
                        <td>${student.cgpa}</td>
                        <td>${date}</td>
                        <td>
                            <span class="badge" style="background:${getStatusColor(app.status)}">${formatStatus(app.status)}</span>
                        </td>
                        <td>${resumeHtml}</td>
                        <td>
                            <select class="status-select" onchange="updateStatus(${app.application_id}, this.value)">
                                <option value="" disabled selected>Update Status</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="SHORTLISTED">Shortlist</option>
                                <option value="INTERVIEW_SCHEDULED">Schedule Interview</option>
                                <option value="SELECTED">Select</option>
                                <option value="REJECTED">Reject</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error(error);
        alert('Failed to load applications');
    }
}

async function exportApplicants() {
    if (!currentApplications || currentApplications.length === 0) {
        alert("No applicants to export.");
        return;
    }
    
    let csv = 'Student Name,Roll No,Branch,CGPA,Email,Phone,Application Status\n';
    currentApplications.forEach(app => {
        const s = app.studentProfile;
        csv += `"${s.name}","${s.rollNo}","${s.branch || s.department}",${s.cgpa},"${s.email || ''}","${s.mobileNumber || ''}","${app.status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Applicants_${currentJobId}.csv`;
    a.click();
}

function getStatusColor(status) {
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

function formatStatus(status) {
    if (!status) return '';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

async function updateStatus(appId, newStatus) {
    if (!newStatus) return;
    
    let interviewDetails = null;
    let offerLetterUrl = null;
    let assessmentLink = null;
    let interviewLink = null;

    if (newStatus === 'SHORTLISTED') {
        assessmentLink = prompt("Optional: Enter Assessment Link (e.g., HackerRank/Unstop) or leave blank:");
    } else if (newStatus === 'INTERVIEW_SCHEDULED') {
        interviewDetails = prompt("Please enter interview details (Date, Time, Format):", "E.g., Oct 25th 10AM");
        if (interviewDetails === null) return; // User cancelled
        interviewLink = prompt("Optional: Enter Live Meeting Link (e.g., Google Meet / Zoom) or leave blank:");
    } else if (newStatus === 'SELECTED') {
        offerLetterUrl = prompt("Please enter a link to the Offer Letter (PDF URL):", "https://...");
        if (offerLetterUrl === null) return; // User cancelled
    }
    
    try {
        const payload = {
            status: newStatus,
            interviewDetails: interviewDetails,
            offerLetterUrl: offerLetterUrl,
            assessmentLink: assessmentLink,
            interviewLink: interviewLink
        };

        const res = await fetchWithAuth(`/companies/applications/${appId}/status`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            // Refresh list
            const title = document.getElementById('applicantsJobTitle').textContent.replace('Applicants for: ', '');
            viewApplicants(currentJobId, title);
        }
    } catch(err) {
        alert("Failed to update status");
    }
}

function closeModal() {
    document.getElementById('applicationsModal').style.display = 'none';
}

let companyStatusChartInstance = null;

async function loadCompanyReports() {
    try {
        const res = await fetchWithAuth('/companies/reports');
        if (res.ok) {
            const reports = await res.json();
            document.getElementById('reportTotalJobs').textContent = reports.totalJobs;
            document.getElementById('reportTotalApps').textContent = reports.totalApplications;
            document.getElementById('reportTotalInterviews').textContent = reports.totalInterviews;
            document.getElementById('reportTotalSelected').textContent = reports.totalSelected;
            
            if (reports.statusDistribution) {
                const labels = Object.keys(reports.statusDistribution).map(formatStatus);
                const data = Object.values(reports.statusDistribution);
                const backgroundColors = Object.keys(reports.statusDistribution).map(getStatusColor);
                
                const ctx = document.getElementById('companyStatusChart').getContext('2d');
                if (companyStatusChartInstance) companyStatusChartInstance.destroy();
                companyStatusChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: backgroundColors
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
        }
    } catch (err) {
        console.error("Failed to load company reports", err);
    }
}
