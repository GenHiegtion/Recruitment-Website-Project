# Recruitment-Website-Project

This is a full-stack recruitment platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The application supports features such as user authentication, job posting, job applications, and role-based access for admins, recruiters, and students.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/GenHiegtion/Recruitment-Website-Project.git
cd Recruitment-Website-Project
```

### 2. Create a .env file inside the backend/ directory with the following content

```bash
PORT=8000
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=a_random_string
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```
This will start the backend server at port 8000.

### 4. Start Frontend React App in a New Terminal

```bash
cd frontend
npm run dev
```
This will start the React frontend at http://localhost:5173.