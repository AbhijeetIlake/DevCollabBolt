# DevCollab - Full-Stack MERN Application

A collaborative development platform with snippet sharing and workspace coding features.

## Features

### 🔐 Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- User registration and login

### 📝 Snippet Sharing Module
- Create, edit, and delete code snippets
- Monaco Editor integration
- Version history (up to 3 versions)
- Public/private snippet toggle
- Share snippets via short-lived links
- Restore previous versions

### 💻 Workspace Coding Module
- Create and join coding workspaces
- Add and manage files
- File locking system for collaborative editing
- Version control for saved files
- Server-side code execution with timeout
- Real-time stdout/stderr output
- Job queue for code execution

### 🚀 Technology Stack
- **Frontend**: React, Tailwind CSS, Monaco Editor, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt
- **Real-time**: Socket.IO (optional for presence and lock events)
- **Deployment**: Vercel (frontend) + Render (backend)

## Project Structure

```
DevCollab/
├── backend/          # Node.js + Express + MongoDB
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Authentication middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── server.js     # Main server file
├── frontend/         # React + Tailwind + Monaco
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main App component
│   └── public/
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and add it to the backend `.env` file

## Deployment

### Backend (Render)
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Set environment variables in Render dashboard
4. Deploy

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Update `REACT_APP_API_URL` to your deployed backend URL
5. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Snippets
- `GET /api/snippets` - Get user's snippets
- `POST /api/snippets` - Create new snippet
- `GET /api/snippets/:id` - Get specific snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet
- `GET /api/snippets/share/:shareId` - Get shared snippet

### Workspaces
- `GET /api/workspaces` - Get user's workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get specific workspace
- `POST /api/workspaces/:id/join` - Join workspace
- `POST /api/workspaces/:id/files` - Add file to workspace
- `PUT /api/workspaces/:id/files/:fileId` - Update file
- `POST /api/workspaces/:id/files/:fileId/lock` - Lock file
- `POST /api/workspaces/:id/files/:fileId/unlock` - Unlock file
- `POST /api/workspaces/:id/files/:fileId/execute` - Execute file code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License