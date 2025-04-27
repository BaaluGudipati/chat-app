import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Initialize socket connection outside component to prevent multiple connections
const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=1'); // Static avatar
  const [isTyping, setIsTyping] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState('');

  // Reference to messages container for auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogin = () => {
    if (username && password) {
      localStorage.setItem('chatUsername', username);
      socket.emit('login', username);
      setLoggedIn(true);
      setError('');
    } else {
      setError('Please fill in both fields');
    }
  };

  const handleSignup = () => {
    if (username && password) {
      localStorage.setItem('chatUsername', username);
      socket.emit('login', username);
      setLoggedIn(true);
      setError('');
    } else {
      setError('Please fill in both fields');
    }
  };

  // Check for saved username on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    // Handle initial chat history
    socket.on('chatHistory', (history) => {
      setMessages(history);
    });

    // Handle user avatar (although it's static for everyone now)
    socket.on('userAvatar', (userAvatar) => {
      setAvatar(userAvatar);
      localStorage.setItem('chatAvatar', userAvatar);
    });

    // Handle new messages
    socket.on('receiveMessage', (msg) => {
      if (msg && msg.message) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    socket.on('userList', (users) => {
      setOnlineUsers(users);
    });

    socket.on('typing', (user) => {
      setIsTyping(`${user} is typing...`);
      setTimeout(() => setIsTyping(null), 2000);
    });

    // Cleanup
    return () => {
      socket.off('chatHistory');
      socket.off('receiveMessage');
      socket.off('userList');
      socket.off('typing');
      socket.off('userAvatar');
    };
  }, []);

  const handleTyping = () => {
    if (message.trim()) {
      socket.emit('typing', username);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const msgData = {
        message: message.trim()
      };
      
      socket.emit('sendMessage', msgData);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setIsNewUser(null);
    localStorage.removeItem('chatUsername');
    localStorage.removeItem('chatAvatar');
    window.location.reload();
  };

  return (
    <div className="App">
      {isNewUser === null ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome to Chat</h2>
          <button
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition mb-4"
            onClick={() => setIsNewUser(false)}
          >
            Login
          </button>
          <button
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
            onClick={() => setIsNewUser(true)}
          >
            Sign Up
          </button>
        </div>
      ) : !loggedIn ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isNewUser ? 'Sign Up' : 'Login'}
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            onClick={isNewUser ? handleSignup : handleLogin}
          >
            {isNewUser ? 'Sign Up' : 'Login'}
          </button>
          <button
            className="mt-4 text-blue-500 hover:underline"
            onClick={() => setIsNewUser(null)}
          >
            Back
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Chat Room</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Online Users ({onlineUsers.length})
              </h3>
              <ul className="space-y-2">
                {onlineUsers.map((user, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-gray-600">
                      {user.username} {user.username === username ? '(You)' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2">
              <div className="messages h-96 mb-4 p-4 bg-gray-50 rounded-lg overflow-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-500">No messages yet. Start chatting!</p>
                ) : (
                  messages.map((msg, index) => {
                    if (!msg || !msg.message) return null;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-start space-x-2 mb-4 ${msg.system ? 'opacity-50' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                          <img
                            src={msg.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold">{msg.user}</div>
                          <div>{msg.message}</div>
                          <div className="text-sm text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              {isTyping && <p className="text-gray-500">{isTyping}</p>}
              <div className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyUp={handleTyping}
                  onKeyPress={handleKeyPress}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg ml-2 hover:bg-blue-600 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
