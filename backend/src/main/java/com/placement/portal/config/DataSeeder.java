package com.placement.portal.config;

import com.placement.portal.model.CompanyProfile;
import com.placement.portal.model.JobPosting;
import com.placement.portal.model.Role;
import com.placement.portal.model.User;
import com.placement.portal.repository.CompanyProfileRepository;
import com.placement.portal.repository.JobPostingRepository;
import com.placement.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyProfileRepository companyRepository;

    @Autowired
    private JobPostingRepository jobRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.placement.portal.repository.StudentProfileRepository studentProfileRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Admin User
        if (!userRepository.existsByEmail("admin@portal.com")) {
            User admin = new User();
            admin.setEmail("admin@portal.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Admin user seeded: admin@portal.com / admin123");
        }

        // Seed a default test student
        if (!userRepository.existsByEmail("student@test.com")) {
            User studentUser = new User();
            studentUser.setEmail("student@test.com");
            studentUser.setPassword(passwordEncoder.encode("password123"));
            studentUser.setRole(Role.STUDENT);
            studentUser = userRepository.save(studentUser);

            com.placement.portal.model.StudentProfile studentProfile = new com.placement.portal.model.StudentProfile();
            studentProfile.setUser(studentUser);
            studentProfile.setName("Test Student");
            studentProfile.setEmail("student@test.com");
            studentProfile.setRollNo("21CS999");
            studentProfile.setDepartment("CSE");
            studentProfile.setCgpa(8.5);
            studentProfile.setGraduationYear(2026);
            studentProfileRepository.save(studentProfile);
            System.out.println("✅ Test student seeded: student@test.com / password123");
        }

        if (!userRepository.existsByEmail("hr@google.com")) {
            seedCompanyAndJob(
                "google_hr", "Google", "hr@google.com", "https://google.com", "Technology",
                "Leading search and cloud technology company.",
                "Software Engineer", "Bengaluru", "24 LPA", 8.5,
                "Java, DSA, System Design", "Design, develop, and maintain large-scale software systems.",
                "Branch: CSE, IT, AI & DS", "2026-12-31",
                "24 LPA", "4 Rounds", "No bond",
                "CSE,IT,AI & DS"
            );

            seedCompanyAndJob(
                "qualcomm_hr", "Qualcomm", "hr@qualcomm.com", "https://qualcomm.com", "Technology",
                "Wireless technology innovator.",
                "Embedded Systems Engineer", "Hyderabad", "16 LPA", 7.8,
                "C, Embedded Systems, OS", "Develop embedded software for mobile processors.",
                "Branch: ECE, EEE, CSE", "2026-09-10",
                "16 LPA", "3 Rounds", "No bond",
                "ECE,EEE,CSE"
            );

            seedCompanyAndJob(
                "ti_hr", "Texas Instruments", "hr@ti.com", "https://ti.com", "Technology",
                "Semiconductor manufacturing company.",
                "Analog Hardware Engineer", "Bengaluru", "15 LPA", 7.5,
                "Verilog, VLSI, Electronics", "Design integrated circuits and hardware systems.",
                "Branch: ECE, EEE", "2026-08-15",
                "15 LPA", "4 Rounds", "2 years bond",
                "ECE,EEE"
            );

            seedCompanyAndJob(
                "tatamotors_hr", "Tata Motors", "hr@tatamotors.com", "https://tatamotors.com", "Automotive",
                "Leading global automobile manufacturer.",
                "EV Design & Mechanical Trainee", "Pune", "8.5 LPA", 6.8,
                "Mechanical Design, CAD", "Trainee program in automotive engineering.",
                "Branch: ME, MTE, EEE", "2026-07-25",
                "8.5 LPA", "3 Rounds", "1 year bond",
                "ME,MTE,EEE"
            );

            seedCompanyAndJob(
                "lnt_hr", "L&T Construction", "hr@lntecc.com", "https://lntecc.com", "Construction",
                "Major technology, engineering, and construction company.",
                "Structural Design Engineer", "Chennai", "7.0 LPA", 6.5,
                "AutoCAD, Civil Engineering", "Assist in large scale infrastructure projects.",
                "Branch: CE", "2026-08-01",
                "7.0 LPA", "2 Rounds", "3 years bond",
                "CE"
            );
            
            seedCompanyAndJob(
                "ril_hr", "Reliance Industries", "hr@ril.com", "https://ril.com", "Energy",
                "Multinational conglomerate.",
                "Chemical Process Trainee", "Jamnagar", "7.5 LPA", 6.5,
                "Plant Operations, Engineering", "Manage plant operations and maintenance.",
                "Branch: CHE, ME", "2026-07-20",
                "7.5 LPA", "3 Rounds", "1 year bond",
                "CHE,ME"
            );
            
            seedCompanyAndJob(
                "airbus_hr", "Airbus India", "hr@airbus.com", "https://airbus.com", "Aerospace",
                "Leading aircraft manufacturer.",
                "Flight Systems Trainee", "Bengaluru", "11 LPA", 7.5,
                "Aerospace, Control Systems", "Trainee program for flight systems.",
                "Branch: AE, ME, ECE", "2026-08-20",
                "11 LPA", "3 Rounds", "1 year bond",
                "AE,ME,ECE"
            );
            
            seedCompanyAndJob(
                "drreddys_hr", "Dr. Reddy's Labs", "hr@drreddys.com", "https://drreddys.com", "Pharmaceuticals",
                "Global pharmaceutical company.",
                "Bioprocess Trainee Engineer", "Hyderabad", "7.0 LPA", 6.8,
                "Biotech, Processing", "Trainee engineer in bioprocessing.",
                "Branch: BT, CHE", "2026-09-10",
                "7.0 LPA", "2 Rounds", "1 year bond",
                "BT,CHE"
            );
            
            seedCompanyAndJob(
                "tcs_hr", "TCS Digital", "hr@tcs.com", "https://tcs.com", "IT Services",
                "Global leader in IT services.",
                "Specialist Programmer", "Noida", "7.0 LPA", 6.5,
                "Data Structures, Web Development", "Develop scalable enterprise web applications.",
                "Branch: ALL", "2026-08-30",
                "7.0 LPA", "3 Rounds", "1 year service agreement",
                "ALL"
            );
            
            seedCompanyAndJob(
                "deloitte_hr", "Deloitte", "hr@deloitte.com", "https://deloitte.com", "Consulting",
                "Global provider of audit and consulting services.",
                "Technical Consultant", "Gurugram", "8.5 LPA", 6.0,
                "Business Analytics, SQL, Java", "Consult on tech transformations for global clients.",
                "Branch: ALL", "2026-09-20",
                "8.5 LPA", "3 Rounds", "2 years bond",
                "ALL"
            );
        }
        
        if (!userRepository.existsByEmail("hr@amazon.com")) {
            seedCompanyAndJob(
                "amazon_hr", "Amazon", "hr@amazon.com", "https://amazon.jobs", "E-commerce & Tech",
                "Earth's most customer-centric company.",
                "SDE 1", "Bengaluru", "45 LPA", 8.0,
                "Java, C++, AWS, DSA", "Build scalable microservices and infrastructure.",
                "Branch: CSE, IT", "2026-10-31",
                "45 LPA", "4 Rounds", "No bond",
                "CSE,IT"
            );
            
            seedCompanyAndJob(
                "microsoft_hr", "Microsoft", "hr@microsoft.com", "https://careers.microsoft.com", "Technology",
                "Empowering every person and organization.",
                "Software Engineer", "Hyderabad", "42 LPA", 8.5,
                "C#, Azure, System Design", "Develop cloud technologies and enterprise software.",
                "Branch: CSE, IT, AI & DS", "2026-11-15",
                "42 LPA", "4 Rounds", "No bond",
                "CSE,IT,AI & DS"
            );
            
            seedCompanyAndJob(
                "infosys_hr", "Infosys", "hr@infosys.com", "https://infosys.com", "IT Services",
                "Global leader in next-generation digital services.",
                "Systems Engineer", "Pune", "5.0 LPA", 6.0,
                "Java, Python, DBMS", "Develop, test and support IT solutions for global clients.",
                "Branch: ALL", "2026-12-01",
                "5.0 LPA", "2 Rounds", "1 year bond",
                "ALL"
            );
        }
    }

    private void seedCompanyAndJob(String username, String companyName, String email, String website, String industry, String companyDesc,
                                   String jobTitle, String location, String salary, Double minCgpa, String skills, String jobDesc,
                                   String eligibility, String lastDate, String ctc, String rounds, String bond, String eligibleBranches) {
        
        // 1. Create User
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password123")); // Default password
        user.setRole(Role.COMPANY);
        user = userRepository.save(user);

        // 2. Create Company Profile
        CompanyProfile company = new CompanyProfile();
        company.setUser(user);
        company.setCompanyName(companyName);
        company.setEmail(email);
        company.setWebsite(website);
        company.setIndustry(industry);
        company.setDescription(companyDesc);
        company.setContactNumber("9876543210");
        company = companyRepository.save(company);

        // 3. Create Job Posting
        JobPosting job = new JobPosting();
        job.setCompanyProfile(company);
        job.setCompanyName(companyName);
        job.setJobTitle(jobTitle);
        job.setLocation(location);
        job.setSalaryPackage(salary);
        job.setMinCgpa(minCgpa);
        job.setRequiredSkills(skills);
        job.setDescription(jobDesc);
        job.setEligibilityCriteria(eligibility);
        job.setLastDateToApply(lastDate);
        job.setCtcComponents(ctc);
        job.setSelectionRounds(rounds);
        job.setBondDetails(bond);
        job.setEligibleBranches(eligibleBranches);
        job.setStatus("ACTIVE");
        jobRepository.save(job);
    }
}
