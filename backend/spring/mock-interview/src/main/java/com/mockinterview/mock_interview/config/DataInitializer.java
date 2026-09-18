package com.mockinterview.mock_interview.config;

import com.mockinterview.mock_interview.entity.Company;
import com.mockinterview.mock_interview.entity.HiringProcess;
import com.mockinterview.mock_interview.entity.JobRole;
import com.mockinterview.mock_interview.repository.CompanyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final com.mockinterview.mock_interview.repository.QuestionRepository questionRepository;

    public DataInitializer(CompanyRepository companyRepository,
                           com.mockinterview.mock_interview.repository.QuestionRepository questionRepository) {
        this.companyRepository = companyRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (companyRepository.count() == 0) {
            seedCompanies();
        }
        if (questionRepository.count() == 0) {
            seedQuestions();
        }
    }

    private void seedCompanies() {
        // 1. TCS
        Company tcs = Company.builder()
                .companyName("Tata Consultancy Services")
                .companyWebsite("https://www.tcs.com")
                .companyLogo("TCS")
                .headquarters("Mumbai, Maharashtra")
                .employees("600,000+")
                .rating(4.1)
                .difficulty("Medium")
                .insiderTips("TCS NQT focuses heavily on quantitative aptitude, verbal ability, C/Java programming, and DBMS fundamentals.")
                .build();

        JobRole tcsRole = JobRole.builder()
                .company(tcs)
                .roleName("Software Developer (Digital)")
                .location("Pan India")
                .salary("₹7.0 LPA – ₹9.0 LPA")
                .experience("0 - 2 Years")
                .eligibility("B.Tech / B.E / M.Tech in CS, IT, ECE (Min 60% aggregate)")
                .technicalTopics("Java, Data Structures, SQL, OS, Web Dev")
                .description("Entry-level role focused on enterprise application development and cloud systems.")
                .isOpen(true)
                .build();

        tcsRole.getHiringProcesses().addAll(List.of(
                HiringProcess.builder().jobRole(tcsRole).roundNumber(1).roundName("Online Assessment (NQT)").description("Aptitude, Reasoning, Verbal, and Hands-on Coding (2 problems).").build(),
                HiringProcess.builder().jobRole(tcsRole).roundNumber(2).roundName("Technical Interview").description("In-depth review of project work, OOPs, SQL queries, and basic algorithms.").build(),
                HiringProcess.builder().jobRole(tcsRole).roundNumber(3).roundName("HR & Managerial Round").description("Behavioral evaluation, communication skills, and location preference.").build()
        ));
        tcs.getJobRoles().add(tcsRole);

        // 2. Infosys
        Company infosys = Company.builder()
                .companyName("Infosys")
                .companyWebsite("https://www.infosys.com")
                .companyLogo("INF")
                .headquarters("Bengaluru, Karnataka")
                .employees("340,000+")
                .rating(4.0)
                .difficulty("Easy")
                .insiderTips("Infosys SP track (Power Programmer) requires strong competitive coding. Focus on medium-level DSA problems.")
                .build();

        JobRole infyRole = JobRole.builder()
                .company(infosys)
                .roleName("Specialist Programmer")
                .location("Bengaluru / Hyderabad")
                .salary("₹9.5 LPA")
                .experience("0 - 1 Years")
                .eligibility("BE/B.Tech/ME/M.Tech (CS/IT/Circuit branches)")
                .technicalTopics("Advanced Algorithms, Competitive Coding, System Design")
                .description("High-impact coding role building digital products and scalable cloud microservices.")
                .isOpen(true)
                .build();

        infyRole.getHiringProcesses().addAll(List.of(
                HiringProcess.builder().jobRole(infyRole).roundNumber(1).roundName("HackWithInfy Coding Round").description("Competitive coding challenge with 3 complex algorithmic problems.").build(),
                HiringProcess.builder().jobRole(infyRole).roundNumber(2).roundName("Technical & System Design Interview").description("Discussion on coding round solutions, system design, and data structures.").build(),
                HiringProcess.builder().jobRole(infyRole).roundNumber(3).roundName("HR Interview").description("Behavioral evaluation and team alignment.").build()
        ));
        infosys.getJobRoles().add(infyRole);

        // 3. Google
        Company google = Company.builder()
                .companyName("Google")
                .companyWebsite("https://careers.google.com")
                .companyLogo("GOOG")
                .headquarters("Mountain View, CA / Bengaluru")
                .employees("180,000+")
                .rating(4.8)
                .difficulty("Hard")
                .insiderTips("Master Data Structures & Algorithms (Trees, Graphs, DP) and System Design principles.")
                .build();

        JobRole googRole = JobRole.builder()
                .company(google)
                .roleName("Software Engineer - L3")
                .location("Bengaluru, India")
                .salary("₹35.0 LPA - ₹45.0 LPA")
                .experience("0 - 3 Years")
                .eligibility("BS/MS in Computer Science or equivalent")
                .technicalTopics("DSA, Graphs, Dynamic Programming, Scalable Systems")
                .description("Build hyper-scale global distributed applications and infrastructure.")
                .isOpen(true)
                .build();

        googRole.getHiringProcesses().addAll(List.of(
                HiringProcess.builder().jobRole(googRole).roundNumber(1).roundName("Technical Phone Screen").description("45-minute coding interview focusing on Data Structures & Algorithms.").build(),
                HiringProcess.builder().jobRole(googRole).roundNumber(2).roundName("Onsite / Virtual Loop (4 Rounds)").description("3 Data Structure & Algorithmic rounds + 1 Googleliness & Leadership round.").build()
        ));
        google.getJobRoles().add(googRole);

        companyRepository.saveAll(List.of(tcs, infosys, google));
        System.out.println("✅ Initial company data seeded into database.");
    }

    private void seedQuestions() {
        com.mockinterview.mock_interview.entity.Question q1 = com.mockinterview.mock_interview.entity.Question.builder()
                .question("A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?")
                .optionA("120 metres")
                .optionB("150 metres")
                .optionC("180 metres")
                .optionD("324 metres")
                .answer("150 metres")
                .category("Quantitative Aptitude")
                .subCategory("Speed, Time & Distance")
                .questionType("MCQ")
                .difficulty("Easy")
                .explanation("Speed = 60 * (5/18) m/sec = 50/3 m/sec. Length of train = Speed * Time = (50/3) * 9 = 150 metres.")
                .companyTag("TCS, Infosys, Wipro")
                .build();

        com.mockinterview.mock_interview.entity.Question q2 = com.mockinterview.mock_interview.entity.Question.builder()
                .question("Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?")
                .optionA("(1/3)")
                .optionB("(1/8)")
                .optionC("(2/8)")
                .optionD("(1/16)")
                .answer("(1/8)")
                .category("Logical Reasoning")
                .subCategory("Number Series")
                .questionType("MCQ")
                .difficulty("Easy")
                .explanation("This is an alternating division series. In each step, the number is divided by 2. (1/4) / 2 = 1/8.")
                .companyTag("TCS, Accenture, Cognizant")
                .build();

        com.mockinterview.mock_interview.entity.Question q3 = com.mockinterview.mock_interview.entity.Question.builder()
                .question("Which of the following data structures is most suitable for implementing a LIFO (Last In First Out) behavior?")
                .optionA("Queue")
                .optionB("Array List")
                .optionC("Stack")
                .optionD("Linked List")
                .answer("Stack")
                .category("Technical")
                .subCategory("Data Structures")
                .questionType("MCQ")
                .difficulty("Easy")
                .explanation("A Stack follows the Last In First Out (LIFO) principle, where the last element inserted is the first one removed.")
                .companyTag("Google, Amazon, TCS")
                .build();

        com.mockinterview.mock_interview.entity.Question q4 = com.mockinterview.mock_interview.entity.Question.builder()
                .question("What happens when you execute a program having multiple public classes in a single Java file?")
                .optionA("It compiles successfully")
                .optionB("Compile-time error: The public type must be defined in its own file")
                .optionC("Runtime exception")
                .optionD("Only the first public class is compiled")
                .answer("Compile-time error: The public type must be defined in its own file")
                .category("Technical")
                .subCategory("Core Java")
                .questionType("MCQ")
                .difficulty("Medium")
                .explanation("Java mandates that a single compilation unit (.java file) can contain at most one public class, and the filename must match that public class name.")
                .companyTag("Infosys, Oracle, Wipro")
                .build();

        questionRepository.saveAll(List.of(q1, q2, q3, q4));
        System.out.println("✅ Initial questions seeded into database.");
    }
}
