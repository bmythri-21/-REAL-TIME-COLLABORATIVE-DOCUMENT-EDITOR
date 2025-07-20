import { useEffect, useRef, useState } from 'react';

const socket = new WebSocket("ws://localhost:5000");

function App() {
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const textareaRef = useRef();

  useEffect(() => {
    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'init') setContent(data.content);
      if (data.type === 'update') {
        setContent(data.content);
        if (data.user) {
          console.log(`${data.user} edited the document`);
        }
      }
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);
    socket.send(JSON.stringify({ type: 'edit', content: newValue, user: username }));
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setShowNamePrompt(false);
    }
  };

  if (showNamePrompt) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Enter Your Name</h2>
        <form onSubmit={handleNameSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ fontSize: 16, padding: 8 }}
          />
          <button type="submit" style={{ marginLeft: 10, padding: 8 }}>Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Real-Time Collaborative Editor</h2>
      <p>Welcome, <strong>{username}</strong></p>
      <textarea
        ref={textareaRef}
        rows="20"
        cols="80"
        value={content}
        onChange={handleChange}
        style={{ fontSize: 16, padding: 10 }}
      />
    </div>
  );
}

export default App;