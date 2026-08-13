const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:' ? 'http://localhost:8080/api' : '/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    loadMetrics();
    loadStudents();
    loadCompanies();
    loadJobs();
    loadApplications();
    loadReports();
    loadActivityLogs();
});

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
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

async function loadMetrics() {
    try {
        const res = await fetchWithAuth('/admin/metrics');
        if (res.ok) {
            const metrics = await res.json();
            document.getElementById('metricStudents').textContent = metrics.totalStudents || 0;
            document.getElementById('metricCompanies').textContent = metrics.totalCompanies || 0;
            document.getElementById('metricJobs').textContent = metrics.totalJobs || 0;
            document.getElementById('metricApplications').textContent = metrics.totalApplications || 0;
            document.getElementById('metricPlaced').textContent = metrics.totalPlacedStudents || 0;
        }
    } catch (err) {
        console.error("Failed to load metrics", err);
    }
}

async function loadStudents() {
    try {
        const res = await fetchWithAuth('/admin/students');
        if (res.ok) {
            const students = await res.json();
            const tbody = document.getElementById('studentsTableBody');
            tbody.innerHTML = '';
            
            if (students.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students registered</td></tr>';
                return;
            }
            
            const minCgpa = parseFloat(document.getElementById('filterCgpa')?.value) || 0;
            const branch = document.getElementById('filterBranch')?.value || '';
            
            // Assume backlogs isn't in backend yet, so we just filter by what's available
            const filteredStudents = students.filter(s => {
                let matches = true;
                if (minCgpa > 0 && (s.cgpa || 0) < minCgpa) matches = false;
                if (branch && s.branch !== branch) matches = false;
                return matches;
            });
            
            // Store globally for export
            window.currentFilteredStudents = filteredStudents;

            if (filteredStudents.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No students match the criteria</td></tr>';
                return;
            }
            
            filteredStudents.forEach(s => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${s.id}</td>
                        <td>${s.name}</td>
                        <td>${s.rollNo}</td>
                        <td>${s.branch}</td>
                        <td>${s.cgpa}</td>
                        <td>${s.graduationYear}</td>
                        <td>
                            <button class="btn-delete" onclick="deleteStudent(${s.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load students", err);
    }
}

function applyStudentFilters() {
    loadStudents();
}

function resetStudentFilters() {
    document.getElementById('filterCgpa').value = '';
    document.getElementById('filterBranch').value = '';
    document.getElementById('filterBacklogs').value = '';
    loadStudents();
}

function exportFilteredStudentsCSV() {
    if (!window.currentFilteredStudents || window.currentFilteredStudents.length === 0) {
        return alert("No students to export.");
    }
    
    let csv = 'ID,Name,Roll No,Department,CGPA,Grad Year\n';
    window.currentFilteredStudents.forEach(s => {
        csv += `${s.id || s.student_id},"${s.name}","${s.rollNo}","${s.branch || s.department}",${s.cgpa},${s.graduationYear}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortlisted_students.csv`;
    a.click();
}

async function bulkDownloadResumes() {
    if (!window.currentFilteredStudents || window.currentFilteredStudents.length === 0) {
        return alert("No students available for download.");
    }
    
    if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
        return alert("Missing JSZip or FileSaver libraries.");
    }

    const zip = new JSZip();
    let count = 0;
    
    for (const s of window.currentFilteredStudents) {
        if (s.resume) {
            try {
                const response = await fetch(s.resume);
                if (response.ok) {
                    const blob = await response.blob();
                    // Extract filename from URL or generate one
                    let filename = s.resume.substring(s.resume.lastIndexOf('/') + 1) || `${s.name.replace(/ /g, '_')}_Resume.pdf`;
                    zip.file(filename, blob);
                    count++;
                }
            } catch(e) {
                console.error("Could not fetch resume for " + s.name);
            }
        }
    }
    
    if (count === 0) {
        return alert("No resumes found for the shortlisted students.");
    }
    
    try {
        const content = await zip.generateAsync({type:"blob"});
        saveAs(content, "Shortlisted_Resumes.zip");
    } catch (err) {
        alert("Failed to generate zip file.");
    }
}

async function loadCompanies() {
    try {
        const res = await fetchWithAuth('/admin/companies');
        if (res.ok) {
            const companies = await res.json();
            const tbody = document.getElementById('companiesTableBody');
            tbody.innerHTML = '';
            
            if (companies.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No companies registered</td></tr>';
                return;
            }
            
            companies.forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${c.id}</td>
                        <td>${c.companyName}</td>
                        <td>${c.industry || '-'}</td>
                        <td>
                            ${c.website ? `<a href="${c.website}" target="_blank">Link</a>` : '-'}
                        </td>
                        <td>
                            <button class="btn-delete" onclick="deleteCompany(${c.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load companies", err);
    }
}

async function loadJobs() {
    try {
        const res = await fetchWithAuth('/admin/jobs');
        if (res.ok) {
            const jobs = await res.json();
            const tbody = document.getElementById('jobsTableBody');
            tbody.innerHTML = '';
            
            if (jobs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No job drives available</td></tr>';
                return;
            }
            
            const locationFilter = document.getElementById('adminJobLocationFilter') ? document.getElementById('adminJobLocationFilter').value.toLowerCase() : '';
            let filteredJobs = jobs;
            if (locationFilter) {
                filteredJobs = jobs.filter(j => (j.location || '').toLowerCase().includes(locationFilter));
            }
            
            if (filteredJobs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No job drives match the filter</td></tr>';
                return;
            }
            
            filteredJobs.forEach(j => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${j.id}</td>
                        <td>${j.jobTitle}</td>
                        <td>${j.companyName}</td>
                        <td>${j.location || '-'}</td>
                        <td>${j.minCgpa}</td>
                        <td><span class="badge" style="background:#e0e7ff;color:#4f46e5">${j.status}</span></td>
                        <td>
                            <button class="btn-delete" onclick="deleteJob(${j.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load jobs", err);
    }
}

async function loadApplications() {
    try {
        const res = await fetchWithAuth('/admin/applications');
        if (res.ok) {
            const apps = await res.json();
            const tbody = document.getElementById('applicationsTableBody');
            tbody.innerHTML = '';
            
            if (apps.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No applications submitted</td></tr>';
                return;
            }
            
            apps.forEach(a => {
                const date = new Date(a.applied_date || a.applicationDate).toLocaleDateString();
                const studentName = a.studentProfile ? a.studentProfile.name : 'Unknown';
                const companyName = a.jobPosting ? a.jobPosting.companyName : 'Unknown';
                const jobTitle = a.jobPosting ? a.jobPosting.jobTitle : 'Unknown';
                
                const resumeUrl = a.studentProfile ? (a.studentProfile.resume || a.studentProfile.resumeLink) : null;
                const resumeHtml = resumeUrl ? `<a href="${resumeUrl}" target="_blank" style="color:var(--primary-color); text-decoration:underline;">View</a>` : '-';
                
                tbody.innerHTML += `
                    <tr>
                        <td>#${a.application_id || a.id}</td>
                        <td>${studentName}</td>
                        <td>${companyName}</td>
                        <td>${jobTitle}</td>
                        <td><span class="badge" style="background:${getStatusColor(a.status)}">${a.status}</span></td>
                        <td>${date}</td>
                        <td>${resumeHtml}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load applications", err);
    }
}

async function loadActivityLogs() {
    try {
        const res = await fetchWithAuth('/admin/audit-logs');
        if (res.ok) {
            const logs = await res.json();
            const tbody = document.getElementById('activityLogsTableBody');
            tbody.innerHTML = '';
            
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No activity logs found</td></tr>';
                return;
            }
            
            logs.forEach(log => {
                const date = new Date(log.timestamp).toLocaleString();
                tbody.innerHTML += `
                    <tr>
                        <td>#${log.id}</td>
                        <td><span class="badge" style="background:#e2e8f0; color:var(--primary-color)">${log.action}</span></td>
                        <td>${log.performedBy}</td>
                        <td>${date}</td>
                        <td>${log.details}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Failed to load activity logs", err);
    }
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

let statusChartInstance = null;
let branchChartInstance = null;

async function loadReports() {
    try {
        const res = await fetchWithAuth('/admin/reports');
        if (res.ok) {
            const reports = await res.json();
            document.getElementById('reportPlaced').textContent = reports.totalPlacedStudents;
            document.getElementById('reportUnplaced').textContent = reports.totalUnplacedStudents;
            
            if (reports.statusDistribution) {
                const labels = Object.keys(reports.statusDistribution).map(formatStatus);
                const data = Object.values(reports.statusDistribution);
                const backgroundColors = Object.keys(reports.statusDistribution).map(getStatusColor);
                
                const ctx = document.getElementById('statusChart').getContext('2d');
                if (statusChartInstance) statusChartInstance.destroy();
                statusChartInstance = new Chart(ctx, {
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
            
            if (reports.branchPlacements) {
                const labels = Object.keys(reports.branchPlacements);
                const data = Object.values(reports.branchPlacements);
                
                const ctx2 = document.getElementById('branchChart').getContext('2d');
                if (branchChartInstance) branchChartInstance.destroy();
                branchChartInstance = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Placed Students',
                            data: data,
                            backgroundColor: 'rgba(37, 99, 235, 0.7)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: { 
                        responsive: true, 
                        maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                    }
                });
            }
        }
    } catch (err) {
        console.error("Failed to load reports", err);
    }
}

async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student and their applications?')) {
        try {
            const res = await fetchWithAuth(`/admin/students/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadStudents();
                loadApplications();
                loadMetrics();
            }
        } catch (err) { alert('Failed to delete student'); }
    }
}

async function exportStudents(type) {
    try {
        const [studentsRes, appsRes] = await Promise.all([
            fetchWithAuth('/admin/students'),
            fetchWithAuth('/admin/applications')
        ]);
        const students = await studentsRes.json();
        const apps = await appsRes.json();
        
        const placedStudentIds = new Set(apps.filter(a => a.status === 'SELECTED').map(a => (a.studentProfile && a.studentProfile.student_id) || (a.studentProfile && a.studentProfile.id)));
        
        let filteredStudents = students;
        if (type === 'placed') {
            filteredStudents = students.filter(s => placedStudentIds.has(s.student_id || s.id));
        } else if (type === 'unplaced') {
            filteredStudents = students.filter(s => !placedStudentIds.has(s.student_id || s.id));
        }
        
        let csv = 'ID,Name,Roll No,Department,CGPA,Grad Year\n';
        filteredStudents.forEach(s => {
            csv += `${s.id || s.student_id},"${s.name}","${s.rollNo}","${s.branch || s.department}",${s.cgpa},${s.graduationYear}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_students.csv`;
        a.click();
    } catch (err) {
        console.error("Export failed", err);
        alert("Export failed");
    }
}

async function deleteCompany(id) {
    if (confirm('Are you sure you want to delete this company, their jobs, and applications?')) {
        try {
            const res = await fetchWithAuth(`/admin/companies/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadCompanies();
                loadJobs();
                loadApplications();
                loadMetrics();
            }
        } catch (err) { alert('Failed to delete company'); }
    }
}

async function deleteJob(id) {
    if (confirm('Are you sure you want to delete this job and its applications?')) {
        try {
            const res = await fetchWithAuth(`/admin/jobs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadJobs();
                loadApplications();
                loadMetrics();
            }
        } catch (err) { alert('Failed to delete job'); }
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Hide all sections including dashboard
    const sections = ['dashboardSection', 'studentsSection', 'companiesSection', 'jobsSection', 'applicationsSection', 'reportsSection', 'activityLogsSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Show selected section
    const target = document.getElementById(tabId + 'Section');
    if (target) target.classList.remove('hidden');
}
