const users = [
  {
    id: "STU_1023",
    name: "Alice Johnson",
    interests: ["competitive coding", "hackathons", "python"],
    learning_domains: ["programming", "problem solving"],
    joined_communities: []
  },
  {
    id: "STU_1024",
    name: "Bob Smith",
    interests: ["machine learning", "data science", "python"],
    learning_domains: ["artificial intelligence", "mathematics"],
    joined_communities: []
  },
  {
    id: "STU_1025",
    name: "Charlie Brown",
    interests: ["web development", "react", "javascript"],
    learning_domains: ["frontend", "design"],
    joined_communities: []
  }
];

const communities = [
  {
    id: "COM_1",
    name: "Competitive Programming",
    description: "A space for competitive coders to share tips and tricks.",
    tags: ["competitive coding", "programming", "python"],
    created_by: "STU_1023",
    visibility: "public",
    members: []
  },
  {
    id: "COM_2",
    name: "Machine Learning Hub",
    description: "Discuss the latest in AI and ML.",
    tags: ["machine learning", "ai", "python"],
    created_by: "STU_1024",
    visibility: "private",
    members: []
  },
  {
    id: "COM_3",
    name: "Web Dev Wizards",
    description: "All things frontend and backend.",
    tags: ["web development", "javascript", "react"],
    created_by: "STU_1025",
    visibility: "public",
    members: []
  }
];

const joinRequests = [];
const messages = [];
const recommendations = [];

module.exports = { users, communities, messages, joinRequests, recommendations };
