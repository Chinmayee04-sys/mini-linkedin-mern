const User = require("../models/user");

const techKeywords = [
  "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask",
  "Spring Boot", "TypeScript", "JavaScript", "Python", "Java", "Go", "Rust",
  "C++", "C#", "Ruby", "PHP", "SQL", "PostgreSQL", "MongoDB", "MySQL",
  "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
  "GraphQL", "REST", "API", "HTML", "CSS", "Tailwind", "Bootstrap",
  "Git", "GitHub Actions", "CI/CD", "Jest", "Cypress", "Machine Learning",
  "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Linux",
  "Nginx", "RabbitMQ", "Kafka", "WebSocket", "OAuth", "JWT"
];

const projectSuggestions = {
  "React": "Build a React dashboard with real-time data fetching",
  "Node.js": "Create a REST API with Express and MongoDB",
  "Docker": "Dockerize a multi-service application",
  "Django": "Build a content management system with Django",
  "PostgreSQL": "Design a normalized database schema and write complex queries",
  "MongoDB": "Build a full-text search feature with MongoDB Atlas",
  "Redis": "Implement Redis caching and rate limiting in an API",
  "Kubernetes": "Deploy a microservices app on a Kubernetes cluster",
  "AWS": "Deploy a serverless application using AWS Lambda + API Gateway",
  "TensorFlow": "Train and deploy an image classification model",
  "PyTorch": "Build a custom neural network for NLP tasks",
  "GraphQL": "Create a GraphQL API with Apollo Server",
  "TypeScript": "Migrate a JavaScript project to TypeScript",
  "Docker": "Containerize a full-stack app with Docker Compose"
};

const analyzeMatch = async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const user = await User.findById(req.user._id);
    const userSkills = (user.skills || []).map(s => s.toLowerCase());
    const jd = jobDescription.toLowerCase();
    let resumeSkills = [];

    if (resumeText && resumeText.trim()) {
      const lower = resumeText.toLowerCase();
      resumeSkills = techKeywords
        .filter(kw => lower.includes(kw.toLowerCase()))
        .map(kw => kw.toLowerCase());
    }

    const allMySkills = [...new Set([...userSkills, ...resumeSkills])];

    const found = techKeywords.filter(kw => jd.includes(kw.toLowerCase()));
    const uniqueFound = [...new Set(found)];

    const matched = uniqueFound.filter(kw => allMySkills.includes(kw.toLowerCase()));
    const missing = uniqueFound.filter(kw => !allMySkills.includes(kw.toLowerCase()));

    const matchPercent = uniqueFound.length > 0
      ? Math.round((matched.length / uniqueFound.length) * 100)
      : 50;

    const suggestedProjects = missing
      .map(skill => {
        const key = Object.keys(projectSuggestions).find(
          k => k.toLowerCase() === skill.toLowerCase()
        );
        return key ? { skill: key, project: projectSuggestions[key] } : null;
      })
      .filter(Boolean)
      .slice(0, 4);

    const resumeSuggestions = [];
    if (missing.length > 0) {
      resumeSuggestions.push(`Add missing skills to your resume: ${missing.slice(0, 5).join(", ")}`);
    }
    if (matched.length > 0) {
      resumeSuggestions.push(`Highlight your strengths: ${matched.slice(0, 5).join(", ")}`);
    }
    resumeSuggestions.push("Add quantifiable achievements to each role (e.g., 'Improved performance by 40%')");
    resumeSuggestions.push("Tailor your summary section to match the job description keywords");

    res.json({
      matchPercent,
      source: resumeText && resumeText.trim() ? "both" : "profile",
      matchedSkills: matched,
      missingSkills: missing,
      suggestedProjects,
      resumeSuggestions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { analyzeMatch };
