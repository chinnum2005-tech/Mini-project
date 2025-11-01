# How to Start the BlockLearn Project

## Prerequisites

1. Node.js (version 16 or higher)
2. PostgreSQL database
3. npm package manager

## Starting the Project

### Method 1: Using Concurrent Scripts (if available)

From the project root directory:
```bash
npm run dev
```

### Method 2: Start Services Separately

**Start the Backend Server:**
```bash
cd backend
npm run dev
```

**Start the Frontend Server (in a new terminal):**
```bash
cd frontend
npm run dev
```

## Accessing the Application

Once both servers are running:

- **Frontend**: Open your browser and go to `http://localhost:5180` (or the port shown in the terminal)
- **Backend API**: Available at `http://localhost:5002/api`

## Ports Information

- **Frontend Development Server**: Port 5180 (or next available port)
- **Backend API Server**: Port 5002
- If ports are occupied, the system will automatically assign alternative ports

## Environment Configuration

Make sure your environment files are properly configured:

1. **Backend** ([backend/.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini%20Project/backend/.env)):
   - Database credentials
   - Email configuration
   - Google OAuth credentials
   - JWT secret

2. **Frontend** ([frontend/.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini%20Project/frontend/.env)):
   - `VITE_GOOGLE_CLIENT_ID` for Google OAuth
   - `VITE_API_URL` pointing to backend API

## Troubleshooting

### Common Issues

1. **Port Conflicts**: 
   - Kill processes using the required ports
   - Or let the system automatically assign alternative ports

2. **Missing Dependencies**:
   ```bash
   # Install dependencies in root, frontend, and backend directories
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check database credentials in [backend/.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini%20Project/backend/.env)
   - Ensure the database exists

4. **Nodemon Issues**:
   ```bash
   npm install -g nodemon
   ```

5. **Concurrent Scripts Not Working**:
   - Start frontend and backend separately
   - Install concurrently globally: `npm install -g concurrently`

## Testing the Application

1. Open your browser and navigate to http://localhost:5180
2. Try registering as a new user
3. Test the student role features
4. Apply for a mentor role to test the verification workflow
5. Log in as admin to manage mentor applications (if you have admin credentials)

## Stopping the Servers

Press `Ctrl + C` in each terminal window to stop the servers.