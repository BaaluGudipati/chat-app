Login Process
When you first load the application, you'll be prompted to enter a username.
Note: The application does not have a real password mechanism in place at the moment, so you can use any username you wish to join the chat room.
Username: Enter any name you like. No password is required for login.
After entering your username, you will be connected to the chat room.



Frontend (React + Vite)
The frontend of this application is hosted at:
Frontend URL: https://chat-app-254t.vercel.app/

Backend (Node.js + Socket.io)
The backend is deployed and hosted at:
Backend URL: https://chat-app-2-qeis.onrender.com

Please ensure the frontend is connected to the correct backend URL. You will need to update this in the frontend code to connect the WebSocket to the correct backend server.

Clone the respository
git clone https://github.com/BaaluGudipati/chat-app.git
cd chat-app

Install dependencies
For Backend:
Navigate to the backend folder.
Run npm install to install dependencies.
Start the backend server using npm start.

cd backend
npm install
npm start


For Frontend:
Navigate to the frontend folder.
Run npm install to install dependencies.
Start the frontend using npm run dev.

cd frontend
npm install
npm run dev
