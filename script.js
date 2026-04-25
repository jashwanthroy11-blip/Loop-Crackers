// Mock Data
const candidateJobs = [
    { title: "Senior Frontend Developer", company: "TechCorp Inc.", location: "Remote", type: "Full-time", salary: "$120k - $150k" },
    { title: "Product Designer", company: "Creative Studio", location: "New York, NY", type: "Contract", salary: "$90k - $110k" },
    { title: "Backend Engineer", company: "DataSystems", location: "San Francisco, CA", type: "Full-time", salary: "$130k - $160k" }
];

const applications = [
    { role: "UX Designer", company: "Innovate LLC", status: "Interview", statusClass: "warning", badgeClass: "badge-warning", date: "2 days ago" },
    { role: "Frontend Dev", company: "WebFlow", status: "Offered", statusClass: "success", badgeClass: "badge-success", date: "1 week ago" },
    { role: "Fullstack Eng", company: "StartupX", status: "Applied", statusClass: "", badgeClass: "badge-info", date: "Just now" }
];

const applicants = [
    { name: "Alice Johnson", role: "Frontend Dev", exp: "5 years", status: "applied" },
    { name: "Bob Smith", role: "Backend Eng", exp: "3 years", status: "applied" },
    { name: "Charlie Davis", role: "UX Designer", exp: "4 years", status: "interview" },
    { name: "Diana Prince", role: "Product Mgr", exp: "7 years", status: "interview" },
    { name: "Evan Wright", role: "DevOps Eng", exp: "6 years", status: "offered" }
];

// DOM Elements
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');
const candidateJobsContainer = document.getElementById('candidate-jobs');
const candidateAppsContainer = document.getElementById('candidate-applications');
const employerJobsContainer = document.getElementById('employer-jobs');

// Render Data
function renderCandidateJobs() {
    candidateJobsContainer.innerHTML = candidateJobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <div class="job-title">${job.title}</div>
                    <div class="job-company">${job.company} • ${job.location}</div>
                </div>
                <button class="btn-primary" style="padding: 0.5rem 1rem; border-radius: 0.5rem;">Apply</button>
            </div>
            <div class="job-tags">
                <span class="tag">${job.type}</span>
                <span class="tag">${job.salary}</span>
            </div>
        </div>
    `).join('');
}

function renderApplications() {
    candidateAppsContainer.innerHTML = applications.map(app => `
        <div class="status-card status-${app.statusClass}">
            <div class="job-title">${app.role}</div>
            <div class="job-company">${app.company}</div>
            <div class="status-info">
                <span class="status-badge ${app.badgeClass}">${app.status}</span>
                <span style="color: var(--text-secondary)">${app.date}</span>
            </div>
        </div>
    `).join('');
}

function renderEmployerJobs() {
    // Reusing candidate jobs for employer view demo
    employerJobsContainer.innerHTML = candidateJobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <div class="job-title">${job.title}</div>
                    <div class="job-company">${job.location} • ${job.type}</div>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">
                    12 Applicants
                </div>
            </div>
        </div>
    `).join('');
}

function renderApplicants() {
    ['applied', 'interview', 'offered'].forEach(status => {
        const container = document.getElementById(`status-${status}`);
        const filtered = applicants.filter(a => a.status === status);
        
        container.innerHTML = filtered.map(app => `
            <div class="applicant-card">
                <h4>${app.name}</h4>
                <p>${app.role} • ${app.exp} exp</p>
                <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                    <button style="background:var(--bg-secondary); border:1px solid var(--border); color:white; padding:0.25rem 0.5rem; border-radius:0.25rem; cursor:pointer; font-size:0.8rem; flex:1;">View</button>
                    <button style="background:var(--accent); border:none; color:white; padding:0.25rem 0.5rem; border-radius:0.25rem; cursor:pointer; font-size:0.8rem; flex:1;">Move</button>
                </div>
            </div>
        `).join('');
    });
}

// Navigation Logic
navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        navBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const targetView = e.target.getAttribute('data-view');
        views.forEach(v => {
            v.classList.remove('active');
            if(v.id === `${targetView}-view`) v.classList.add('active');
        });
    });
});

// Modal Logic
const modal = document.getElementById('post-job-modal');
const postJobBtn = document.getElementById('post-job-btn');
const closeBtn = document.querySelector('.close-modal');
const form = document.getElementById('job-form');

postJobBtn.addEventListener('click', () => modal.classList.add('show'));
closeBtn.addEventListener('click', () => modal.classList.remove('show'));
window.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('show'); });

form.addEventListener('submit', (e) => {
    e.preventDefault();
    modal.classList.remove('show');
    alert('Job posted successfully!');
    form.reset();
});

// Initialize
renderCandidateJobs();
renderApplications();
renderEmployerJobs();
renderApplicants();
