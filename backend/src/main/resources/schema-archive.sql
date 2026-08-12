CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    branch VARCHAR(100) NOT NULL,
    cgpa DECIMAL(3, 2) NOT NULL,
    skills TEXT,
    resume VARCHAR(255),
    roll_no VARCHAR(255) NOT NULL UNIQUE,
    graduation_year INT NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(255),
    industry VARCHAR(255),
    description TEXT,
    contact_number VARCHAR(255),
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    description TEXT,
    min_cgpa DECIMAL(3,2),
    location VARCHAR(255),
    salary_package VARCHAR(255),
    required_skills TEXT,
    eligibility_criteria TEXT,
    last_date_to_apply VARCHAR(255),
    status VARCHAR(50),
    company_profile_id BIGINT
);

CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    job_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    applied_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);
