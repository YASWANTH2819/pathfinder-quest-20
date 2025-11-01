-- Insert sample MCQ questions for different careers
INSERT INTO daily_mcqs (career_name, question, options, correct_answer, xp_reward, difficulty) VALUES
-- Product Manager questions
('Product Manager', 'What is the primary role of a Product Manager?', '["Writing code for the product", "Defining product vision and strategy", "Designing user interfaces", "Managing server infrastructure"]', 'Defining product vision and strategy', 10, 'easy'),
('Product Manager', 'Which framework is commonly used for product prioritization?', '["Scrum", "RICE", "Kanban", "Waterfall"]', 'RICE', 15, 'medium'),
('Product Manager', 'What does MVP stand for in product development?', '["Most Valuable Player", "Minimum Viable Product", "Maximum Value Proposition", "Multiple Version Planning"]', 'Minimum Viable Product', 10, 'easy'),

-- Data Analyst questions
('Data Analyst', 'Which tool is most commonly used for data visualization?', '["MySQL", "Tableau", "Git", "Docker"]', 'Tableau', 10, 'easy'),
('Data Analyst', 'What is the purpose of ETL in data analysis?', '["Extract, Transform, Load", "Evaluate, Test, Launch", "Edit, Transfer, Log", "Explore, Track, Learn"]', 'Extract, Transform, Load', 15, 'medium'),
('Data Analyst', 'Which SQL command is used to retrieve data from a database?', '["INSERT", "UPDATE", "SELECT", "DELETE"]', 'SELECT', 10, 'easy'),

-- Software Engineer questions
('Software Engineer', 'What does API stand for?', '["Application Programming Interface", "Advanced Programming Integration", "Automated Process Integration", "Application Process Interface"]', 'Application Programming Interface', 10, 'easy'),
('Software Engineer', 'Which data structure uses LIFO principle?', '["Queue", "Stack", "Tree", "Graph"]', 'Stack', 15, 'medium'),
('Software Engineer', 'What is the time complexity of binary search?', '["O(n)", "O(log n)", "O(n^2)", "O(1)"]', 'O(log n)', 15, 'medium'),

-- UI/UX Designer questions
('UI/UX Designer', 'What does UX stand for?', '["User Experience", "Universal Export", "Unified Exchange", "User Extension"]', 'User Experience', 10, 'easy'),
('UI/UX Designer', 'Which tool is commonly used for prototyping?', '["Photoshop", "Figma", "Excel", "Visual Studio"]', 'Figma', 10, 'easy'),
('UI/UX Designer', 'What is a wireframe in UX design?', '["A high-fidelity design", "A basic visual guide showing page structure", "A color palette", "An animation"]', 'A basic visual guide showing page structure', 15, 'medium'),

-- Business Analyst questions
('Business Analyst', 'What is the main purpose of requirement gathering?', '["Writing code", "Understanding business needs", "Designing databases", "Testing software"]', 'Understanding business needs', 10, 'easy'),
('Business Analyst', 'Which diagram is commonly used for process modeling?', '["Pie Chart", "BPMN Diagram", "Scatter Plot", "Histogram"]', 'BPMN Diagram', 15, 'medium'),

-- Marketing Manager questions
('Marketing Manager', 'What does SEO stand for?', '["Search Engine Optimization", "Social Engagement Optimization", "Sales Engagement Operation", "Search Engine Operation"]', 'Search Engine Optimization', 10, 'easy'),
('Marketing Manager', 'Which metric measures customer acquisition cost?', '["ROI", "CAC", "CTR", "CPM"]', 'CAC', 15, 'medium');