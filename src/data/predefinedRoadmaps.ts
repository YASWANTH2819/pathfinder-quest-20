// Predefined base roadmaps for instant loading
// AI personalization runs in background after these load

export interface RoadmapLevel {
  level: string;
  title: string;
  skills: string[];
}

export interface PredefinedRoadmap {
  career: string;
  levels: RoadmapLevel[];
  steps: Array<{
    title: string;
    description: string;
    completed: boolean;
    resources: string[];
    type?: string;
  }>;
}

const predefinedRoadmaps: Record<string, PredefinedRoadmap> = {
  'data scientist': {
    career: 'Data Scientist',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Python Basics', 'Statistics Fundamentals', 'Excel for Data Analysis', 'SQL Basics', 'Data Types & Structures'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Pandas & NumPy', 'Data Visualization (Matplotlib, Seaborn)', 'SQL for Data Analysis', 'Exploratory Data Analysis', 'Feature Engineering'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Machine Learning Algorithms', 'Deep Learning Basics', 'NLP Fundamentals', 'Model Deployment', 'Portfolio Projects'] },
    ],
    steps: [
      { title: 'Learn Python fundamentals', description: 'Master Python syntax, data types, loops, and functions', completed: false, resources: ['Codecademy Python', 'freeCodeCamp Python'], type: 'learning' },
      { title: 'Statistics & Probability', description: 'Learn descriptive stats, probability, distributions, hypothesis testing', completed: false, resources: ['Khan Academy Statistics', 'StatQuest YouTube'], type: 'learning' },
      { title: 'SQL for Data', description: 'Master SQL queries, joins, aggregations for data analysis', completed: false, resources: ['SQLZoo', 'Mode Analytics SQL'], type: 'learning' },
      { title: 'Pandas & NumPy', description: 'Data manipulation and numerical computing in Python', completed: false, resources: ['Kaggle Learn Pandas', 'NumPy Documentation'], type: 'practice' },
      { title: 'Data Visualization', description: 'Create charts and dashboards with Matplotlib, Seaborn, Plotly', completed: false, resources: ['Python Graph Gallery', 'Seaborn Tutorial'], type: 'practice' },
      { title: 'EDA Project', description: 'Complete an exploratory data analysis on a real dataset', completed: false, resources: ['Kaggle Datasets', 'UCI ML Repository'], type: 'practice' },
      { title: 'Machine Learning', description: 'Learn supervised and unsupervised ML algorithms', completed: false, resources: ['Andrew Ng ML Course', 'Scikit-learn Docs'], type: 'learning' },
      { title: 'Deep Learning Basics', description: 'Neural networks, CNNs, and basic TensorFlow/PyTorch', completed: false, resources: ['Fast.ai', 'DeepLearning.AI'], type: 'learning' },
      { title: 'Portfolio Projects', description: 'Build 3-5 data science projects for your portfolio', completed: false, resources: ['Kaggle Competitions', 'GitHub Portfolio'], type: 'practice' },
      { title: 'Job Preparation', description: 'Prepare resume, practice interviews, apply to positions', completed: false, resources: ['Glassdoor', 'LinkedIn Jobs'], type: 'self-assessment' },
    ],
  },
  'data analyst': {
    career: 'Data Analyst',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Excel & Google Sheets', 'SQL Basics', 'Basic Statistics', 'Data Cleaning', 'Business Communication'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Advanced SQL', 'Python for Analysis', 'Tableau / Power BI', 'A/B Testing', 'Dashboard Creation'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Statistical Modeling', 'Data Storytelling', 'ETL Pipelines', 'Stakeholder Management', 'Portfolio & Case Studies'] },
    ],
    steps: [
      { title: 'Master Excel & Sheets', description: 'Pivot tables, VLOOKUP, conditional formatting, charts', completed: false, resources: ['Excel Easy', 'Google Sheets Training'], type: 'learning' },
      { title: 'SQL Fundamentals', description: 'SELECT, WHERE, JOIN, GROUP BY, subqueries', completed: false, resources: ['SQLZoo', 'W3Schools SQL'], type: 'learning' },
      { title: 'Basic Statistics', description: 'Mean, median, standard deviation, correlation', completed: false, resources: ['Khan Academy', 'StatQuest'], type: 'learning' },
      { title: 'Python for Analysis', description: 'Pandas, data cleaning, basic visualization', completed: false, resources: ['Kaggle Learn', 'DataCamp'], type: 'practice' },
      { title: 'Tableau / Power BI', description: 'Build interactive dashboards and reports', completed: false, resources: ['Tableau Public', 'Power BI Desktop'], type: 'practice' },
      { title: 'Real Dataset Project', description: 'Analyze a business dataset end-to-end', completed: false, resources: ['Kaggle Datasets', 'Data.gov'], type: 'practice' },
      { title: 'A/B Testing', description: 'Design and analyze experiments', completed: false, resources: ['Udacity A/B Testing', 'Google Analytics'], type: 'learning' },
      { title: 'Portfolio & Certification', description: 'Google Data Analytics Certificate + portfolio', completed: false, resources: ['Google Certificates', 'GitHub'], type: 'self-assessment' },
    ],
  },
  'software engineer': {
    career: 'Software Engineer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Programming Basics (Python/Java/C++)', 'Data Structures', 'Algorithms', 'Git & Version Control', 'Problem Solving'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Object-Oriented Design', 'Databases & SQL', 'REST APIs', 'System Design Basics', 'Testing & Debugging'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Design Patterns', 'Distributed Systems', 'CI/CD & DevOps', 'Performance Optimization', 'Open Source Contributions'] },
    ],
    steps: [
      { title: 'Learn a programming language', description: 'Master Python, Java, or C++ fundamentals', completed: false, resources: ['Codecademy', 'CS50 Harvard'], type: 'learning' },
      { title: 'Data Structures & Algorithms', description: 'Arrays, linked lists, trees, graphs, sorting, searching', completed: false, resources: ['LeetCode', 'NeetCode'], type: 'learning' },
      { title: 'Git & Version Control', description: 'Branching, merging, pull requests, collaboration', completed: false, resources: ['Git Documentation', 'GitHub Learning Lab'], type: 'practice' },
      { title: 'Build Projects', description: 'Create 3-5 software projects demonstrating skills', completed: false, resources: ['GitHub', 'Project Ideas List'], type: 'practice' },
      { title: 'System Design', description: 'Learn scalability, load balancing, caching', completed: false, resources: ['System Design Primer', 'Grokking System Design'], type: 'learning' },
      { title: 'Interview Preparation', description: 'Practice coding interviews and system design', completed: false, resources: ['LeetCode', 'Pramp'], type: 'self-assessment' },
    ],
  },
  'frontend developer': {
    career: 'Frontend Developer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['HTML5 & Semantic HTML', 'CSS3 & Flexbox/Grid', 'JavaScript ES6+', 'Responsive Design', 'Browser DevTools'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['React / Vue / Angular', 'TypeScript', 'State Management', 'API Integration', 'CSS Frameworks (Tailwind)'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Performance Optimization', 'Testing (Jest, Cypress)', 'Accessibility (a11y)', 'PWA & SSR', 'Portfolio Projects'] },
    ],
    steps: [
      { title: 'HTML & CSS Mastery', description: 'Semantic HTML, Flexbox, Grid, animations', completed: false, resources: ['MDN Web Docs', 'CSS Tricks'], type: 'learning' },
      { title: 'JavaScript Deep Dive', description: 'ES6+, async/await, DOM manipulation, closures', completed: false, resources: ['JavaScript.info', 'Eloquent JavaScript'], type: 'learning' },
      { title: 'React Framework', description: 'Components, hooks, routing, state management', completed: false, resources: ['React Docs', 'Scrimba React'], type: 'learning' },
      { title: 'TypeScript', description: 'Types, interfaces, generics for safer code', completed: false, resources: ['TypeScript Handbook', 'Total TypeScript'], type: 'learning' },
      { title: 'Build Portfolio Site', description: 'Create a responsive portfolio with React + Tailwind', completed: false, resources: ['Tailwind CSS Docs', 'Vercel'], type: 'practice' },
      { title: 'Full Project', description: 'Build a complete web app with API integration', completed: false, resources: ['Firebase', 'Supabase'], type: 'practice' },
    ],
  },
  'full stack developer': {
    career: 'Full Stack Developer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['HTML/CSS/JavaScript', 'React Basics', 'Node.js & Express', 'SQL & NoSQL Databases', 'Git'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['TypeScript', 'REST & GraphQL APIs', 'Authentication & Security', 'Cloud Deployment', 'Docker Basics'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Microservices', 'CI/CD Pipelines', 'Performance & Caching', 'System Design', 'Production Apps'] },
    ],
    steps: [
      { title: 'Frontend Basics', description: 'HTML, CSS, JavaScript, React fundamentals', completed: false, resources: ['freeCodeCamp', 'The Odin Project'], type: 'learning' },
      { title: 'Backend with Node.js', description: 'Express, REST APIs, middleware, error handling', completed: false, resources: ['Node.js Docs', 'Express.js Guide'], type: 'learning' },
      { title: 'Databases', description: 'PostgreSQL, MongoDB, ORMs, data modeling', completed: false, resources: ['PostgreSQL Tutorial', 'MongoDB University'], type: 'learning' },
      { title: 'Authentication & Security', description: 'JWT, OAuth, session management, CORS', completed: false, resources: ['Auth0 Docs', 'OWASP'], type: 'learning' },
      { title: 'Full Stack Project', description: 'Build a complete MERN/PERN stack application', completed: false, resources: ['GitHub', 'Render/Railway'], type: 'practice' },
      { title: 'Deploy & DevOps', description: 'Docker, CI/CD, cloud deployment', completed: false, resources: ['Docker Docs', 'GitHub Actions'], type: 'practice' },
    ],
  },
  'backend developer': {
    career: 'Backend Developer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Python/Java/Node.js', 'SQL & Databases', 'REST API Design', 'Git & Linux Basics', 'HTTP & Networking'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['ORM & Query Optimization', 'Authentication', 'Caching (Redis)', 'Message Queues', 'Testing'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Microservices Architecture', 'Docker & Kubernetes', 'System Design', 'Performance Tuning', 'Cloud Services'] },
    ],
    steps: [
      { title: 'Server-side Language', description: 'Master Python (Django/Flask), Java (Spring), or Node.js', completed: false, resources: ['Official Docs', 'Udemy'], type: 'learning' },
      { title: 'Database Design', description: 'SQL, normalization, indexing, query optimization', completed: false, resources: ['PostgreSQL Docs', 'SQLZoo'], type: 'learning' },
      { title: 'API Development', description: 'RESTful APIs, error handling, validation, documentation', completed: false, resources: ['Swagger', 'Postman'], type: 'practice' },
      { title: 'Authentication & Security', description: 'JWT, OAuth2, rate limiting, input validation', completed: false, resources: ['Auth0', 'OWASP Guide'], type: 'learning' },
      { title: 'Caching & Queues', description: 'Redis, RabbitMQ/Kafka for performance', completed: false, resources: ['Redis Docs', 'RabbitMQ Tutorials'], type: 'learning' },
      { title: 'Deploy Backend Service', description: 'Docker, CI/CD, cloud hosting, monitoring', completed: false, resources: ['AWS', 'Docker Docs'], type: 'practice' },
    ],
  },
  'machine learning engineer': {
    career: 'Machine Learning Engineer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Python & Math Foundations', 'Linear Algebra & Calculus', 'Probability & Statistics', 'NumPy & Pandas', 'Data Preprocessing'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Supervised Learning', 'Unsupervised Learning', 'Scikit-learn', 'Feature Engineering', 'Model Evaluation'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Deep Learning (TensorFlow/PyTorch)', 'NLP & Computer Vision', 'MLOps & Model Deployment', 'Distributed Training', 'Research Papers'] },
    ],
    steps: [
      { title: 'Math Foundations', description: 'Linear algebra, calculus, probability for ML', completed: false, resources: ['3Blue1Brown', 'Khan Academy'], type: 'learning' },
      { title: 'Python for ML', description: 'NumPy, Pandas, Matplotlib proficiency', completed: false, resources: ['Kaggle Learn', 'Python Data Science Handbook'], type: 'learning' },
      { title: 'Classical ML', description: 'Regression, classification, clustering, ensembles', completed: false, resources: ['Andrew Ng Coursera', 'Scikit-learn Docs'], type: 'learning' },
      { title: 'Deep Learning', description: 'Neural networks, CNNs, RNNs, transformers', completed: false, resources: ['Fast.ai', 'DeepLearning.AI'], type: 'learning' },
      { title: 'ML Projects', description: 'Build and deploy 3-5 ML models', completed: false, resources: ['Kaggle', 'Hugging Face'], type: 'practice' },
      { title: 'MLOps', description: 'Model serving, monitoring, CI/CD for ML', completed: false, resources: ['MLflow', 'AWS SageMaker'], type: 'practice' },
    ],
  },
  'python developer': {
    career: 'Python Developer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Python Syntax & Basics', 'OOP in Python', 'File I/O & Exception Handling', 'Virtual Environments', 'pip & Package Management'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Django / Flask', 'REST APIs', 'SQL & Databases', 'Testing (pytest)', 'Git & Collaboration'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Async Programming', 'Celery & Task Queues', 'Docker & Deployment', 'API Security', 'Performance Optimization'] },
    ],
    steps: [
      { title: 'Python Core', description: 'Variables, loops, functions, OOP, modules', completed: false, resources: ['Python.org Tutorial', 'Automate the Boring Stuff'], type: 'learning' },
      { title: 'Web Framework', description: 'Learn Django or Flask for web development', completed: false, resources: ['Django Docs', 'Flask Mega Tutorial'], type: 'learning' },
      { title: 'Database Integration', description: 'PostgreSQL, SQLAlchemy, Django ORM', completed: false, resources: ['SQLAlchemy Docs', 'Django Models'], type: 'practice' },
      { title: 'API Development', description: 'Build RESTful APIs with authentication', completed: false, resources: ['Django REST Framework', 'FastAPI Docs'], type: 'practice' },
      { title: 'Testing', description: 'Unit tests, integration tests with pytest', completed: false, resources: ['pytest Docs', 'Test-Driven Development'], type: 'learning' },
      { title: 'Deploy Application', description: 'Docker, Heroku/AWS, CI/CD pipeline', completed: false, resources: ['Docker Docs', 'Heroku Guide'], type: 'practice' },
    ],
  },
  'product manager': {
    career: 'Product Manager',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Product Thinking', 'User Research', 'Market Analysis', 'Wireframing', 'Agile/Scrum Basics'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Product Roadmapping', 'Data-Driven Decisions', 'A/B Testing', 'Stakeholder Management', 'Metrics & KPIs'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Product Strategy', 'Go-to-Market Planning', 'Team Leadership', 'Revenue Modeling', 'Cross-functional Execution'] },
    ],
    steps: [
      { title: 'Product Fundamentals', description: 'Understand product lifecycle, user needs, market fit', completed: false, resources: ['Inspired by Marty Cagan', 'Product School'], type: 'learning' },
      { title: 'User Research', description: 'Interviews, surveys, personas, journey mapping', completed: false, resources: ['UX Research Methods', 'Google UX Course'], type: 'practice' },
      { title: 'Analytics & Metrics', description: 'Define KPIs, analyze funnels, use analytics tools', completed: false, resources: ['Google Analytics', 'Mixpanel'], type: 'learning' },
      { title: 'Agile & Scrum', description: 'Sprint planning, backlog grooming, retrospectives', completed: false, resources: ['Scrum Guide', 'Atlassian Agile'], type: 'learning' },
      { title: 'Case Study Practice', description: 'Solve PM case studies and present solutions', completed: false, resources: ['Lewis C. Lin', 'PM Interview Prep'], type: 'self-assessment' },
      { title: 'Build a Product', description: 'Lead a side project from idea to launch', completed: false, resources: ['Product Hunt', 'Indie Hackers'], type: 'practice' },
    ],
  },
  'ui/ux designer': {
    career: 'UI/UX Designer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Design Principles', 'Color Theory & Typography', 'Figma Basics', 'Wireframing', 'User Personas'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Prototyping', 'Interaction Design', 'Design Systems', 'Usability Testing', 'Responsive Design'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Motion Design', 'Design Leadership', 'Accessibility (WCAG)', 'Portfolio Curation', 'Client Presentation'] },
    ],
    steps: [
      { title: 'Design Fundamentals', description: 'Visual hierarchy, Gestalt principles, color & type', completed: false, resources: ['Refactoring UI', 'Design Course YouTube'], type: 'learning' },
      { title: 'Figma Mastery', description: 'Components, auto layout, prototyping, plugins', completed: false, resources: ['Figma YouTube', 'Figma Community'], type: 'learning' },
      { title: 'UX Research', description: 'User interviews, usability testing, heuristic evaluation', completed: false, resources: ['Nielsen Norman Group', 'UX Collective'], type: 'practice' },
      { title: 'Design System', description: 'Create a reusable component library', completed: false, resources: ['Material Design', 'Apple HIG'], type: 'practice' },
      { title: 'Portfolio Projects', description: 'Design 3-5 complete case studies', completed: false, resources: ['Behance', 'Dribbble'], type: 'practice' },
      { title: 'Job Ready', description: 'Portfolio website, interview prep, whiteboard challenges', completed: false, resources: ['UX Portfolio Tips', 'Designlab'], type: 'self-assessment' },
    ],
  },
  'devops engineer': {
    career: 'DevOps Engineer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Linux & Shell Scripting', 'Git & GitHub', 'Networking Basics', 'Cloud Intro (AWS/GCP)', 'YAML & Config Files'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Docker & Containers', 'CI/CD (GitHub Actions, Jenkins)', 'Infrastructure as Code (Terraform)', 'Monitoring (Prometheus, Grafana)', 'Security Basics'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Kubernetes Orchestration', 'Service Mesh', 'Cloud Architecture', 'Cost Optimization', 'SRE Practices'] },
    ],
    steps: [
      { title: 'Linux & Networking', description: 'Commands, file system, SSH, DNS, HTTP', completed: false, resources: ['Linux Academy', 'Networking Fundamentals'], type: 'learning' },
      { title: 'Docker', description: 'Images, containers, Compose, networking', completed: false, resources: ['Docker Docs', 'Play with Docker'], type: 'learning' },
      { title: 'CI/CD Pipelines', description: 'Automate build, test, deploy workflows', completed: false, resources: ['GitHub Actions Docs', 'Jenkins Docs'], type: 'practice' },
      { title: 'Cloud Platform', description: 'AWS/GCP core services: EC2, S3, IAM, VPC', completed: false, resources: ['AWS Free Tier', 'A Cloud Guru'], type: 'learning' },
      { title: 'Kubernetes', description: 'Pods, services, deployments, Helm charts', completed: false, resources: ['Kubernetes Docs', 'KodeKloud'], type: 'learning' },
      { title: 'Infrastructure Project', description: 'Deploy a full app with IaC and monitoring', completed: false, resources: ['Terraform Docs', 'Grafana'], type: 'practice' },
    ],
  },
  'cybersecurity analyst': {
    career: 'Cybersecurity Analyst',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Networking & Protocols', 'Linux Basics', 'Security Concepts', 'Cryptography Intro', 'Compliance Basics'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Penetration Testing', 'SIEM Tools', 'Vulnerability Assessment', 'Incident Response', 'Firewall & IDS'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Malware Analysis', 'Threat Hunting', 'Red Team Operations', 'Cloud Security', 'Certifications (CEH, CISSP)'] },
    ],
    steps: [
      { title: 'Networking Fundamentals', description: 'TCP/IP, DNS, HTTP, OSI model', completed: false, resources: ['CompTIA Network+', 'Cisco Networking Academy'], type: 'learning' },
      { title: 'Linux & Security Basics', description: 'Linux commands, file permissions, security concepts', completed: false, resources: ['OverTheWire', 'TryHackMe'], type: 'learning' },
      { title: 'Ethical Hacking', description: 'Penetration testing tools, OWASP Top 10', completed: false, resources: ['Hack The Box', 'PortSwigger Academy'], type: 'practice' },
      { title: 'SIEM & Monitoring', description: 'Splunk, ELK Stack, log analysis', completed: false, resources: ['Splunk Free', 'ELK Tutorial'], type: 'practice' },
      { title: 'Certifications', description: 'Prepare for CompTIA Security+, CEH', completed: false, resources: ['CompTIA', 'EC-Council'], type: 'learning' },
      { title: 'CTF & Labs', description: 'Participate in Capture The Flag competitions', completed: false, resources: ['PicoCTF', 'CTFtime'], type: 'practice' },
    ],
  },
  'digital marketing specialist': {
    career: 'Digital Marketing Specialist',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Marketing Basics', 'SEO Fundamentals', 'Social Media Marketing', 'Content Writing', 'Google Analytics'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['PPC & Google Ads', 'Email Marketing', 'Content Strategy', 'Conversion Optimization', 'Marketing Automation'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Growth Hacking', 'Marketing Analytics', 'Brand Strategy', 'Influencer Marketing', 'Campaign Management'] },
    ],
    steps: [
      { title: 'Marketing Fundamentals', description: '4Ps, target audience, buyer personas', completed: false, resources: ['HubSpot Academy', 'Google Digital Garage'], type: 'learning' },
      { title: 'SEO & Content', description: 'Keyword research, on-page SEO, content creation', completed: false, resources: ['Moz Beginner Guide', 'Ahrefs Blog'], type: 'learning' },
      { title: 'Social Media', description: 'Platform strategies, content calendars, engagement', completed: false, resources: ['Hootsuite Academy', 'Buffer Blog'], type: 'practice' },
      { title: 'Paid Advertising', description: 'Google Ads, Facebook Ads, campaign optimization', completed: false, resources: ['Google Skillshop', 'Meta Blueprint'], type: 'learning' },
      { title: 'Analytics', description: 'Track KPIs, attribution, reporting dashboards', completed: false, resources: ['Google Analytics Academy', 'Data Studio'], type: 'practice' },
      { title: 'Campaign Project', description: 'Run a real marketing campaign end-to-end', completed: false, resources: ['Personal Brand', 'Freelance Projects'], type: 'practice' },
    ],
  },
  'business analyst': {
    career: 'Business Analyst',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Business Process Modeling', 'Requirements Gathering', 'Stakeholder Analysis', 'Excel & Data Analysis', 'Communication Skills'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['SQL & Data Querying', 'Process Improvement', 'Agile Methodology', 'Wireframing & Prototyping', 'JIRA & Confluence'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Strategic Planning', 'Change Management', 'Advanced Analytics', 'Leadership', 'CBAP Certification'] },
    ],
    steps: [
      { title: 'BA Fundamentals', description: 'BABOK knowledge areas, requirements types', completed: false, resources: ['IIBA Resources', 'BA Times'], type: 'learning' },
      { title: 'Requirements Engineering', description: 'Elicitation, documentation, user stories', completed: false, resources: ['BABOK Guide', 'Requirements Engineering Book'], type: 'learning' },
      { title: 'Data Analysis', description: 'Excel, SQL, data interpretation for decisions', completed: false, resources: ['Excel Skills', 'SQL for BA'], type: 'practice' },
      { title: 'Process Modeling', description: 'BPMN, flowcharts, gap analysis', completed: false, resources: ['Lucidchart', 'Bizagi'], type: 'practice' },
      { title: 'Agile BA', description: 'User stories, acceptance criteria, sprint work', completed: false, resources: ['Scrum Alliance', 'Agile BA Guide'], type: 'learning' },
      { title: 'Case Study', description: 'Solve a real business problem end-to-end', completed: false, resources: ['Case Study Templates', 'Portfolio'], type: 'self-assessment' },
    ],
  },
  'cloud solutions architect': {
    career: 'Cloud Solutions Architect',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Cloud Computing Concepts', 'AWS/Azure/GCP Basics', 'Networking in Cloud', 'IAM & Security', 'Storage Services'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Compute & Serverless', 'Databases in Cloud', 'Infrastructure as Code', 'Cost Management', 'High Availability'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Multi-Cloud Strategy', 'Migration Planning', 'Enterprise Architecture', 'Compliance & Governance', 'AWS SA Professional Cert'] },
    ],
    steps: [
      { title: 'Cloud Fundamentals', description: 'IaaS, PaaS, SaaS, cloud models', completed: false, resources: ['AWS Cloud Practitioner', 'Azure Fundamentals'], type: 'learning' },
      { title: 'Core Services', description: 'Compute, storage, networking, databases', completed: false, resources: ['AWS Free Tier Labs', 'GCP Qwiklabs'], type: 'learning' },
      { title: 'Security & IAM', description: 'Identity management, encryption, compliance', completed: false, resources: ['AWS Security Specialty', 'Cloud Security Alliance'], type: 'learning' },
      { title: 'Infrastructure as Code', description: 'Terraform, CloudFormation, automation', completed: false, resources: ['Terraform Docs', 'AWS CloudFormation'], type: 'practice' },
      { title: 'Architecture Design', description: 'Well-architected framework, design patterns', completed: false, resources: ['AWS Well-Architected', 'Cloud Design Patterns'], type: 'practice' },
      { title: 'Certification', description: 'AWS Solutions Architect Associate/Professional', completed: false, resources: ['A Cloud Guru', 'Whizlabs'], type: 'self-assessment' },
    ],
  },
  'content writer': {
    career: 'Content Writer',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Grammar & Style', 'Blog Writing', 'SEO Basics', 'Research Skills', 'Content Formats'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Copywriting', 'Content Strategy', 'Email Marketing Copy', 'Social Media Writing', 'CMS Tools (WordPress)'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Content Marketing', 'Technical Writing', 'Brand Voice', 'Analytics & Optimization', 'Freelance Business'] },
    ],
    steps: [
      { title: 'Writing Fundamentals', description: 'Grammar, style guides, clarity in writing', completed: false, resources: ['Grammarly Blog', 'Strunk & White'], type: 'learning' },
      { title: 'SEO Writing', description: 'Keywords, meta descriptions, search intent', completed: false, resources: ['Yoast SEO Blog', 'Ahrefs Guide'], type: 'learning' },
      { title: 'Blog & Articles', description: 'Write and publish 10+ blog posts', completed: false, resources: ['Medium', 'WordPress'], type: 'practice' },
      { title: 'Copywriting', description: 'Headlines, CTAs, persuasive writing', completed: false, resources: ['Copyblogger', 'AWAI'], type: 'learning' },
      { title: 'Portfolio Building', description: 'Create a writing portfolio with diverse samples', completed: false, resources: ['Contently', 'Clippings.me'], type: 'practice' },
      { title: 'Freelance/Job Ready', description: 'Pitch clients, set rates, manage projects', completed: false, resources: ['Upwork', 'LinkedIn'], type: 'self-assessment' },
    ],
  },
  'hr manager': {
    career: 'HR Manager',
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['HR Principles', 'Recruitment Process', 'Labor Laws', 'Employee Relations', 'HR Software (HRMS)'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Talent Management', 'Performance Appraisals', 'Compensation & Benefits', 'Training & Development', 'HR Analytics'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Strategic HR', 'Organizational Development', 'Change Management', 'Leadership', 'SHRM/CIPD Certification'] },
    ],
    steps: [
      { title: 'HR Fundamentals', description: 'Core HR functions, employee lifecycle', completed: false, resources: ['SHRM Learning', 'HR Bartender'], type: 'learning' },
      { title: 'Recruitment', description: 'Sourcing, screening, interviewing, onboarding', completed: false, resources: ['LinkedIn Recruiter', 'Indeed Hiring'], type: 'learning' },
      { title: 'Labor Laws', description: 'Employment laws, compliance, workplace policies', completed: false, resources: ['SHRM Compliance', 'Local Labor Department'], type: 'learning' },
      { title: 'HR Tech', description: 'HRMS software, payroll systems, ATS', completed: false, resources: ['BambooHR', 'Workday Basics'], type: 'practice' },
      { title: 'People Analytics', description: 'HR metrics, dashboards, data-driven decisions', completed: false, resources: ['People Analytics Course', 'Excel for HR'], type: 'practice' },
      { title: 'Certification', description: 'SHRM-CP or CIPD qualification', completed: false, resources: ['SHRM', 'CIPD'], type: 'self-assessment' },
    ],
  },
};

/**
 * Find the best matching predefined roadmap for a career name.
 * Uses fuzzy matching to handle variations like "ML Engineer" → "machine learning engineer"
 */
export function getPredefinedRoadmap(careerName: string): PredefinedRoadmap | null {
  const normalized = careerName.toLowerCase().trim();

  // Exact match
  if (predefinedRoadmaps[normalized]) return predefinedRoadmaps[normalized];

  // Partial match
  for (const [key, roadmap] of Object.entries(predefinedRoadmaps)) {
    if (normalized.includes(key) || key.includes(normalized)) return roadmap;
  }

  // Keyword match
  const keywords: Record<string, string> = {
    'ml': 'machine learning engineer',
    'ai': 'machine learning engineer',
    'data science': 'data scientist',
    'web dev': 'full stack developer',
    'web development': 'full stack developer',
    'react': 'frontend developer',
    'angular': 'frontend developer',
    'vue': 'frontend developer',
    'node': 'backend developer',
    'django': 'python developer',
    'flask': 'python developer',
    'security': 'cybersecurity analyst',
    'cloud': 'cloud solutions architect',
    'aws': 'cloud solutions architect',
    'azure': 'cloud solutions architect',
    'design': 'ui/ux designer',
    'ux': 'ui/ux designer',
    'seo': 'digital marketing specialist',
    'marketing': 'digital marketing specialist',
    'writing': 'content writer',
    'copywriting': 'content writer',
    'human resources': 'hr manager',
    'recruitment': 'hr manager',
    'devops': 'devops engineer',
    'kubernetes': 'devops engineer',
    'docker': 'devops engineer',
    'pm': 'product manager',
    'product': 'product manager',
    'analyst': 'business analyst',
    'sde': 'software engineer',
    'swe': 'software engineer',
    'coding': 'software engineer',
    'dsa': 'software engineer',
  };

  for (const [keyword, mappedKey] of Object.entries(keywords)) {
    if (normalized.includes(keyword)) return predefinedRoadmaps[mappedKey];
  }

  return null;
}

/**
 * Generate a generic roadmap for careers not in the predefined list
 */
export function getGenericRoadmap(careerName: string): PredefinedRoadmap {
  return {
    career: careerName,
    levels: [
      { level: 'Level 1', title: 'Fundamentals', skills: ['Core concepts', 'Industry basics', 'Essential tools', 'Communication skills', 'Time management'] },
      { level: 'Level 2', title: 'Intermediate', skills: ['Specialized skills', 'Project experience', 'Professional networking', 'Certifications', 'Portfolio building'] },
      { level: 'Level 3', title: 'Advanced', skills: ['Leadership', 'Industry expertise', 'Mentorship', 'Strategic thinking', 'Career advancement'] },
    ],
    steps: [
      { title: 'Research the field', description: `Study what ${careerName} involves and required qualifications`, completed: false, resources: ['LinkedIn Learning', 'Coursera'], type: 'learning' },
      { title: 'Learn fundamentals', description: 'Begin with foundational courses and concepts', completed: false, resources: ['Udemy', 'edX'], type: 'learning' },
      { title: 'Build practice projects', description: 'Apply your skills with hands-on projects', completed: false, resources: ['GitHub', 'Personal Projects'], type: 'practice' },
      { title: 'Get certified', description: 'Earn relevant industry certifications', completed: false, resources: ['Professional Bodies', 'Online Platforms'], type: 'learning' },
      { title: 'Build portfolio', description: 'Create a portfolio showcasing your work', completed: false, resources: ['Personal Website', 'LinkedIn'], type: 'practice' },
      { title: 'Seek opportunities', description: 'Apply for internships and entry-level positions', completed: false, resources: ['LinkedIn Jobs', 'Naukri', 'Internshala'], type: 'self-assessment' },
    ],
  };
}

export default predefinedRoadmaps;
