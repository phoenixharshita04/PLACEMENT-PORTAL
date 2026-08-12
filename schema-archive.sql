-- Campus Placement Portal System - Database Schema and Seed Data
-- Technology: MySQL / H2 (Compatible)
-- This file contains table creation scripts and sample data as required by the project deliverables.

-- ===================================================================
-- TABLE CREATION SCRIPTS
-- ===================================================================
-- NOTE: Spring Boot (Hibernate) with `ddl-auto=update` creates these tables automatically.
-- This script is provided as a deliverable for manual database setup.

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'COMPANY', 'ADMIN'))
);

-- 2. Students Table (Student Profiles)
CREATE TABLE IF NOT EXISTS students (
    student_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    branch VARCHAR(100) NOT NULL,
    cgpa DECIMAL(3,2) NOT NULL,
    graduation_year INT NOT NULL,
    resume VARCHAR(500),
    phone VARCHAR(20),
    skills TEXT,
    projects TEXT,
    experience TEXT,
    tenth_marksheet_url VARCHAR(500),
    twelfth_marksheet_url VARCHAR(500),
    aadhar_url VARCHAR(500),
    profile_photo_url VARCHAR(500),
    is_opted_out BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Companies Table (Company Profiles)
CREATE TABLE IF NOT EXISTS companies (
    company_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(500),
    industry VARCHAR(100),
    description TEXT,
    contact_number VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_profile_id BIGINT NOT NULL,
    company_name VARCHAR(255),
    job_title VARCHAR(255) NOT NULL,
    description TEXT,
    min_cgpa DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    location VARCHAR(255),
    salary_package VARCHAR(100),
    required_skills TEXT,
    eligibility_criteria TEXT,
    last_date_to_apply VARCHAR(50),
    ctc_components TEXT,
    selection_rounds TEXT,
    bond_details TEXT,
    eligible_branches VARCHAR(500) DEFAULT 'ALL',
    test_platform VARCHAR(100),
    test_datetime VARCHAR(100),
    test_link VARCHAR(500),
    FOREIGN KEY (company_profile_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- 5. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    job_posting_id BIGINT NOT NULL,
    status VARCHAR(30) DEFAULT 'APPLIED',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    interview_details TEXT,
    offer_letter_url VARCHAR(500),
    FOREIGN KEY (student_profile_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE
);

-- 6. Interview Slots Table
CREATE TABLE IF NOT EXISTS interview_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_posting_id BIGINT NOT NULL,
    slot_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    student_profile_id BIGINT,
    FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    FOREIGN KEY (student_profile_id) REFERENCES students(student_id)
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===================================================================
-- SAMPLE DATA (Seed Data)
-- ===================================================================

-- Admin User (Password: admin123)
INSERT INTO users (email, password, role) VALUES 
('admin@portal.com', '$2a$10$tZ261kZ9oK8T/C352o31Q.qK5FqN9a7nLz4j35/D38F36O7h2/XFq', 'ADMIN');

-- Test Student (Password: password123)
INSERT INTO users (email, password, role) VALUES 
('student@test.com', '$2a$10$dXJ3SW6G7P50lGmMQWfb5OTdLpyPLSmvJJQmNH.JfCWmVIr6DWROK', 'STUDENT');

INSERT INTO students (user_id, name, email, roll_no, branch, cgpa, graduation_year) VALUES 
((SELECT id FROM users WHERE email = 'student@test.com'), 'Test Student', 'student@test.com', '21CS999', 'CSE', 8.50, 2026);

-- Sample Company: Google (Password: password123)
INSERT INTO users (email, password, role) VALUES 
('hr@google.com', '$2a$10$dXJ3SW6G7P50lGmMQWfb5OTdLpyPLSmvJJQmNH.JfCWmVIr6DWROK', 'COMPANY');

INSERT INTO companies (user_id, company_name, email, website, industry, description, contact_number) VALUES 
((SELECT id FROM users WHERE email = 'hr@google.com'), 'Google', 'hr@google.com', 'https://google.com', 'Technology', 'Leading search and cloud technology company.', '9876543210');

INSERT INTO job_postings (company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, required_skills, eligibility_criteria, last_date_to_apply, ctc_components, selection_rounds, bond_details, eligible_branches, status) VALUES 
((SELECT company_id FROM companies WHERE company_name = 'Google'), 'Google', 'Software Engineer', 'Design, develop, and maintain large-scale software systems.', 8.50, 'Bengaluru', '24 LPA', 'Java, DSA, System Design', 'Branch: CSE, IT, AI & DS', '2026-12-31', '24 LPA', '4 Rounds', 'No bond', 'CSE,IT,AI & DS', 'ACTIVE');

-- Sample Company: TCS Digital (Password: password123)
INSERT INTO users (email, password, role) VALUES 
('hr@tcs.com', '$2a$10$dXJ3SW6G7P50lGmMQWfb5OTdLpyPLSmvJJQmNH.JfCWmVIr6DWROK', 'COMPANY');

INSERT INTO companies (user_id, company_name, email, website, industry, description, contact_number) VALUES 
((SELECT id FROM users WHERE email = 'hr@tcs.com'), 'TCS Digital', 'hr@tcs.com', 'https://tcs.com', 'IT Services', 'Global leader in IT services.', '9876543210');

INSERT INTO job_postings (company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, required_skills, eligibility_criteria, last_date_to_apply, ctc_components, selection_rounds, bond_details, eligible_branches, status) VALUES 
((SELECT company_id FROM companies WHERE company_name = 'TCS Digital'), 'TCS Digital', 'Specialist Programmer', 'Develop scalable enterprise web applications.', 6.50, 'Noida', '7.0 LPA', 'Data Structures, Web Development', 'Branch: ALL', '2026-08-30', '7.0 LPA', '3 Rounds', '1 year service agreement', 'ALL', 'ACTIVE');

-- Sample Company: Deloitte (Password: password123)
INSERT INTO users (email, password, role) VALUES 
('hr@deloitte.com', '$2a$10$dXJ3SW6G7P50lGmMQWfb5OTdLpyPLSmvJJQmNH.JfCWmVIr6DWROK', 'COMPANY');

INSERT INTO companies (user_id, company_name, email, website, industry, description, contact_number) VALUES 
((SELECT id FROM users WHERE email = 'hr@deloitte.com'), 'Deloitte', 'hr@deloitte.com', 'https://deloitte.com', 'Consulting', 'Global provider of audit and consulting services.', '9876543210');

INSERT INTO job_postings (company_profile_id, company_name, job_title, description, min_cgpa, location, salary_package, required_skills, eligibility_criteria, last_date_to_apply, ctc_components, selection_rounds, bond_details, eligible_branches, status) VALUES 
((SELECT company_id FROM companies WHERE company_name = 'Deloitte'), 'Deloitte', 'Technical Consultant', 'Consult on tech transformations for global clients.', 6.00, 'Gurugram', '8.5 LPA', 'Business Analytics, SQL, Java', 'Branch: ALL', '2026-09-20', '8.5 LPA', '3 Rounds', '2 years bond', 'ALL', 'ACTIVE');
