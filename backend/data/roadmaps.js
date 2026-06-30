const roadmaps = {
  "ML Engineer": {
    description: "Design, build, and deploy machine learning models in production. Combine software engineering with data science to create intelligent systems.",
    prerequisites: ["Python", "Linear Algebra", "Calculus", "Probability & Statistics"],
    missingSkills: [
      "TensorFlow / PyTorch", "Scikit-learn", "ML Pipeline Design",
      "Model Deployment (Flask/FastAPI)", "Docker", "MLOps Basics",
      "SQL for Data", "Git"
    ],
    courses: [
      { name: "Machine Learning by Andrew Ng (Coursera)", url: "https://www.coursera.org/learn/machine-learning" },
      { name: "Deep Learning Specialization (Coursera)", url: "https://www.coursera.org/specializations/deep-learning" },
      { name: "MLOps Specialization (Coursera)", url: "https://www.coursera.org/specializations/mlops" },
      { name: "Fast.ai Practical Deep Learning", url: "https://course.fast.ai/" },
    ],
    projects: [
      { name: "House Price Prediction API", description: "Train a regression model and serve via Flask/FastAPI with Docker" },
      { name: "Image Classifier Web App", description: "Deploy a CNN using TensorFlow.js or TorchServe with a React frontend" },
      { name: "End-to-End ML Pipeline", description: "Build automated pipeline with data ingestion, training, evaluation, and deployment using GitHub Actions" },
      { name: "NLP Sentiment Analyzer", description: "Fine-tune a transformer model and deploy with a REST API" },
    ],
    salary: "$120,000 - $200,000",
    timeRequired: "6–12 months"
  },
  "Data Scientist": {
    description: "Extract insights from data using statistical analysis, visualization, and machine learning. Drive data-informed decisions.",
    prerequisites: ["Python or R", "Statistics", "SQL", "Excel"],
    missingSkills: [
      "Pandas / NumPy", "Data Visualization (Matplotlib, Seaborn, Tableau)",
      "Hypothesis Testing", "A/B Testing", "Scikit-learn",
      "Big Data Tools (Spark basics)", "Storytelling with Data"
    ],
    courses: [
      { name: "Data Science Specialization (Coursera)", url: "https://www.coursera.org/specializations/jhu-data-science" },
      { name: "DataCamp Data Scientist Track", url: "https://www.datacamp.com/tracks/data-scientist-with-python" },
      { name: "CS109 Data Science (Harvard)", url: "https://cs109.github.io/2015/" },
    ],
    projects: [
      { name: "Customer Churn Analysis", description: "Analyze customer data, build a churn prediction model, and present findings in a dashboard" },
      { name: "Sales Forecasting Dashboard", description: "Time series forecasting with interactive Tableau/PowerBI dashboard" },
      { name: "A/B Testing Analysis", description: "Design and analyze an A/B test with statistical significance reporting" },
    ],
    salary: "$100,000 - $170,000",
    timeRequired: "4–9 months"
  },
  "Full Stack Developer": {
    description: "Build complete web applications — frontend, backend, database, and deployment. Own features end-to-end.",
    prerequisites: ["Basic HTML/CSS", "JavaScript fundamentals", "Any programming language"],
    missingSkills: [
      "React or Vue", "Node.js + Express", "REST API Design",
      "MongoDB or PostgreSQL", "Authentication (JWT, OAuth)",
      "Git + GitHub", "Docker", "Cloud Deployment (Render/Vercel)"
    ],
    courses: [
      { name: "The Odin Project", url: "https://www.theodinproject.com/" },
      { name: "Full Stack Open (University of Helsinki)", url: "https://fullstackopen.com/" },
      { name: "React Documentation Tutorial", url: "https://react.dev/learn" },
    ],
    projects: [
      { name: "Social Media Dashboard", description: "Full-stack app with React, Node.js, MongoDB, JWT auth, and deployment" },
      { name: "E-Commerce API", description: "RESTful API with Express, PostgreSQL, Stripe integration, and Docker" },
      { name: "Real-time Chat App", description: "WebSocket-based chat with React, Socket.io, and Redis" },
    ],
    salary: "$90,000 - $160,000",
    timeRequired: "4–8 months"
  },
  "DevOps Engineer": {
    description: "Automate infrastructure, manage CI/CD pipelines, ensure system reliability, and bridge development and operations.",
    prerequisites: ["Linux basics", "Any scripting language (Python/Bash)", "Networking fundamentals"],
    missingSkills: [
      "Docker + Docker Compose", "Kubernetes", "CI/CD (GitHub Actions, Jenkins)",
      "Terraform / Infrastructure as Code", "Monitoring (Prometheus, Grafana)",
      "Cloud Platforms (AWS/GCP/Azure)", "Ansible or Puppet"
    ],
    courses: [
      { name: "Docker Mastery (Udemy)", url: "https://www.udemy.com/course/docker-mastery/" },
      { name: "Kubernetes in Action (Book)", url: "https://www.manning.com/books/kubernetes-in-action" },
      { name: "AWS Certified Solutions Architect", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/" },
    ],
    projects: [
      { name: "CI/CD Pipeline Setup", description: "Automate build, test, and deploy with GitHub Actions for a web app" },
      { name: "Kubernetes Cluster Deployment", description: "Deploy a microservices app on a local K8s cluster with Helm charts" },
      { name: "Infrastructure Automation", description: "Provision cloud resources using Terraform with a full monitoring stack" },
    ],
    salary: "$110,000 - $180,000",
    timeRequired: "6–12 months"
  },
  "Frontend Developer": {
    description: "Create beautiful, responsive, and performant user interfaces. Specialize in the visual and interactive layer of web apps.",
    prerequisites: ["HTML", "CSS", "JavaScript basics"],
    missingSkills: [
      "React / Next.js", "TypeScript", "Tailwind CSS / Styled Components",
      "State Management (Redux, Zustand)", "Responsive Design",
      "Testing (Jest, Cypress)", "Web Performance Optimization"
    ],
    courses: [
      { name: "React Official Tutorial", url: "https://react.dev/learn" },
      { name: "Frontend Masters", url: "https://frontendmasters.com/" },
      { name: "JavaScript.info", url: "https://javascript.info/" },
    ],
    projects: [
      { name: "Portfolio Website", description: "Personal site with Next.js, dark mode, animations, and CMS" },
      { name: "Task Management App", description: "Kanban board with drag-and-drop, state management, and local storage" },
      { name: "E-Commerce Storefront", description: "Product listing, cart, checkout flow with React and Tailwind" },
    ],
    salary: "$80,000 - $150,000",
    timeRequired: "3–6 months"
  },
  "Backend Developer": {
    description: "Design APIs, manage databases, ensure security and scalability. Build the server-side logic that powers applications.",
    prerequisites: ["Any programming language", "Basic SQL", "HTTP fundamentals"],
    missingSkills: [
      "Node.js + Express or Django / Spring Boot", "REST / GraphQL API Design",
      "PostgreSQL or MongoDB", "Authentication & Authorization",
      "Caching (Redis)", "Message Queues (RabbitMQ, Bull)", "Docker"
    ],
    courses: [
      { name: "Node.js / Express Crash Course", url: "https://www.youtube.com/watch?v=L72fhGm1tfE" },
      { name: "Designing Data-Intensive Applications", url: "https://dataintensive.net/" },
      { name: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/" },
    ],
    projects: [
      { name: "URL Shortener API", description: "REST API with Express, PostgreSQL, rate limiting, and Redis caching" },
      { name: "Real-time Notification Service", description: "WebSocket-based service with Bull queue and email/push notifications" },
      { name: "Microservices Blog Platform", description: "Dockerized microservices with API gateway, auth service, and post service" },
    ],
    salary: "$90,000 - $160,000",
    timeRequired: "4–8 months"
  }
};

module.exports = roadmaps;
