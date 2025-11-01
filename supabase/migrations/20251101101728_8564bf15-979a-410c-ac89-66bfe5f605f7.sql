-- Add more MCQ questions to ensure 10 questions per career

-- Product Manager questions (adding 7 more to reach 10 total)
INSERT INTO daily_mcqs (career_name, question, options, correct_answer, xp_reward, difficulty) VALUES
('Product Manager', 'What does KPI stand for in product management?', '["Key Performance Indicator", "Key Product Initiative", "Knowledge Processing Interface", "Key Planning Item"]', 'Key Performance Indicator', 10, 'easy'),
('Product Manager', 'Which method helps validate product ideas with users?', '["A/B Testing", "Code Review", "Database Normalization", "Server Maintenance"]', 'A/B Testing', 15, 'medium'),
('Product Manager', 'What is a user story in Agile?', '["A biography of the user", "A short description of a feature from user perspective", "A detailed technical specification", "A marketing campaign"]', 'A short description of a feature from user perspective', 10, 'easy'),
('Product Manager', 'What is the purpose of a product roadmap?', '["To map physical roads", "To visualize product strategy and timeline", "To track bugs", "To manage servers"]', 'To visualize product strategy and timeline', 15, 'medium'),
('Product Manager', 'What does PMF stand for?', '["Product Market Fit", "Performance Management Function", "Project Management Framework", "Product Monitoring Feature"]', 'Product Market Fit', 15, 'medium'),
('Product Manager', 'Which metric measures user engagement?', '["DAU (Daily Active Users)", "CPU Usage", "Disk Space", "RAM Capacity"]', 'DAU (Daily Active Users)', 15, 'medium'),
('Product Manager', 'What is a sprint in Scrum?', '["A running race", "A time-boxed iteration for development", "A testing phase", "A marketing campaign"]', 'A time-boxed iteration for development', 10, 'easy'),

-- Data Analyst questions (adding 7 more to reach 10 total)
('Data Analyst', 'What does SQL stand for?', '["Structured Query Language", "Simple Question Logic", "System Quality Level", "Standard Quote List"]', 'Structured Query Language', 10, 'easy'),
('Data Analyst', 'Which chart type best shows trends over time?', '["Line Chart", "Pie Chart", "Scatter Plot", "Bar Chart"]', 'Line Chart', 10, 'easy'),
('Data Analyst', 'What is data cleaning?', '["Physically cleaning computers", "Removing inaccuracies and inconsistencies from data", "Deleting all data", "Encrypting data"]', 'Removing inaccuracies and inconsistencies from data', 10, 'easy'),
('Data Analyst', 'What is the mean in statistics?', '["The average value", "The middle value", "The most frequent value", "The range of values"]', 'The average value', 10, 'easy'),
('Data Analyst', 'Which tool is used for statistical programming?', '["R", "Photoshop", "Word", "PowerPoint"]', 'R', 15, 'medium'),
('Data Analyst', 'What does CSV stand for?', '["Comma Separated Values", "Computer System Variables", "Central Server Volume", "Code Security Validation"]', 'Comma Separated Values', 10, 'easy'),
('Data Analyst', 'What is a pivot table used for?', '["Summarizing and analyzing data", "Storing passwords", "Creating graphics", "Writing code"]', 'Summarizing and analyzing data', 15, 'medium'),

-- Software Engineer questions (adding 7 more to reach 10 total)
('Software Engineer', 'What is version control?', '["A system for tracking changes to code", "A type of database", "A programming language", "A testing method"]', 'A system for tracking changes to code', 10, 'easy'),
('Software Engineer', 'What does HTTP stand for?', '["HyperText Transfer Protocol", "High Transfer Technology Process", "Home Terminal Text Protocol", "Hybrid Tech Transfer Path"]', 'HyperText Transfer Protocol', 10, 'easy'),
('Software Engineer', 'What is a variable in programming?', '["A container for storing data values", "A type of loop", "A database table", "A network protocol"]', 'A container for storing data values', 10, 'easy'),
('Software Engineer', 'Which language is primarily used for web frontend?', '["JavaScript", "C++", "Python", "Java"]', 'JavaScript', 10, 'easy'),
('Software Engineer', 'What is debugging?', '["Finding and fixing errors in code", "Writing new code", "Deleting code", "Compiling code"]', 'Finding and fixing errors in code', 10, 'easy'),
('Software Engineer', 'What does OOP stand for?', '["Object-Oriented Programming", "Online Operating Protocol", "Original Output Process", "Optimal Operation Plan"]', 'Object-Oriented Programming', 15, 'medium'),
('Software Engineer', 'What is a function in programming?', '["A reusable block of code that performs a specific task", "A type of variable", "A database", "A network connection"]', 'A reusable block of code that performs a specific task', 10, 'easy'),

-- UI/UX Designer questions (adding 7 more to reach 10 total)
('UI/UX Designer', 'What is user testing?', '["Evaluating a product by testing it with users", "Testing server capacity", "Writing code tests", "Database testing"]', 'Evaluating a product by testing it with users', 10, 'easy'),
('UI/UX Designer', 'What does UI stand for?', '["User Interface", "Uniform Integration", "Universal Input", "Utility Index"]', 'User Interface', 10, 'easy'),
('UI/UX Designer', 'What is a color palette?', '["A selection of colors used in design", "A painting tool", "A type of software", "A database schema"]', 'A selection of colors used in design', 10, 'easy'),
('UI/UX Designer', 'What is responsive design?', '["Design that adapts to different screen sizes", "Fast loading design", "Interactive animations", "Colorful design"]', 'Design that adapts to different screen sizes', 15, 'medium'),
('UI/UX Designer', 'What is a user persona?', '["A fictional character representing a user type", "A real user", "A type of button", "A color scheme"]', 'A fictional character representing a user type', 15, 'medium'),
('UI/UX Designer', 'What is accessibility in design?', '["Making designs usable for people with disabilities", "Making designs load faster", "Making designs colorful", "Making designs animated"]', 'Making designs usable for people with disabilities', 15, 'medium'),
('UI/UX Designer', 'What is white space in design?', '["Empty space around elements that improves readability", "Background color", "Text color", "Border style"]', 'Empty space around elements that improves readability', 15, 'medium'),

-- Business Analyst questions (adding 8 more to reach 10 total)
('Business Analyst', 'What is SWOT analysis?', '["Strengths, Weaknesses, Opportunities, Threats", "Software Working Optimization Test", "System Workflow Organization Tool", "Strategic Web Operation Tracker"]', 'Strengths, Weaknesses, Opportunities, Threats', 15, 'medium'),
('Business Analyst', 'What is a stakeholder?', '["A person with interest or concern in a project", "A type of database", "A programming tool", "A design element"]', 'A person with interest or concern in a project', 10, 'easy'),
('Business Analyst', 'What does ROI stand for?', '["Return on Investment", "Rate of Interest", "Resource Optimization Index", "Remote Operation Interface"]', 'Return on Investment', 10, 'easy'),
('Business Analyst', 'What is a use case?', '["A description of how a system will be used", "A type of chart", "A programming pattern", "A database query"]', 'A description of how a system will be used', 15, 'medium'),
('Business Analyst', 'What is gap analysis?', '["Comparing current state to desired state", "Analyzing code gaps", "Finding database errors", "Testing software"]', 'Comparing current state to desired state', 15, 'medium'),
('Business Analyst', 'What is data modeling?', '["Creating a visual representation of data structure", "Making 3D models", "Writing code", "Testing applications"]', 'Creating a visual representation of data structure', 15, 'medium'),
('Business Analyst', 'What is agile methodology?', '["Iterative approach to project management", "A programming language", "A database type", "A design tool"]', 'Iterative approach to project management', 15, 'medium'),
('Business Analyst', 'What is KPI in business?', '["Key Performance Indicator", "Knowledge Process Integration", "Key Product Initiative", "Known Performance Index"]', 'Key Performance Indicator', 10, 'easy'),

-- Marketing Manager questions (adding 8 more to reach 10 total)
('Marketing Manager', 'What does CTR stand for?', '["Click-Through Rate", "Customer Transaction Record", "Content Transfer Rate", "Campaign Testing Result"]', 'Click-Through Rate', 15, 'medium'),
('Marketing Manager', 'What is a target audience?', '["Specific group of consumers a campaign aims to reach", "A shooting range", "A type of advertisement", "A marketing tool"]', 'Specific group of consumers a campaign aims to reach', 10, 'easy'),
('Marketing Manager', 'What is content marketing?', '["Creating valuable content to attract customers", "Selling products directly", "Cold calling", "Email spam"]', 'Creating valuable content to attract customers', 15, 'medium'),
('Marketing Manager', 'What does B2B stand for?', '["Business to Business", "Back to Basics", "Brand to Brand", "Buyer to Builder"]', 'Business to Business', 10, 'easy'),
('Marketing Manager', 'What is social media marketing?', '["Using social platforms to promote products", "Traditional advertising", "Direct mail", "Cold calling"]', 'Using social platforms to promote products', 10, 'easy'),
('Marketing Manager', 'What is brand awareness?', '["How familiar consumers are with a brand", "A type of software", "A pricing strategy", "A sales technique"]', 'How familiar consumers are with a brand', 10, 'easy'),
('Marketing Manager', 'What is conversion rate?', '["Percentage of visitors who take desired action", "Currency exchange rate", "Product price", "Sales discount"]', 'Percentage of visitors who take desired action', 15, 'medium'),
('Marketing Manager', 'What is influencer marketing?', '["Using influential people to promote products", "Traditional TV ads", "Billboard advertising", "Radio commercials"]', 'Using influential people to promote products', 15, 'medium');