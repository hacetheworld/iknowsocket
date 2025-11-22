// --- src/components/Editor.jsx ---
import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";
const DOCUMENT_ID = "poc_document_1"; // Hardcoded doc ID for PoC

export default function App() {
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState("");

  // State to manage whether the change came from the network or local typing
  const [isRemoteChange, setIsRemoteChange] = useState(false);

  // 1. Establish the Socket Connection on Component Mount
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL);
    setSocket(s);

    // Clean up connection on unmount
    return () => s.disconnect();
  }, []);

  // 2. Handle Joining the Room and Listening for Remote Changes
  useEffect(() => {
    if (socket == null) return;

    // Join the room as soon as the socket is ready
    socket.emit("join-document", DOCUMENT_ID);

    // 3. Listener for changes from other users
    socket.on("receive-changes", (delta) => {
      // In a real app, 'delta' would be an OT operation.
      // For this PoC, we assume the server sends the full text.
      console.log("Received remote change:", delta);
      setIsRemoteChange(true); // Mark as remote change
      setText(delta);
    });

    // Cleanup listener
    return () => socket.off("receive-changes");
  }, [socket]); // Re-run effect when socket initializes

  // 4. Handle Local Text Input
  const handleChange = useCallback(
    (e) => {
      const newText = e.target.value;

      // Prevent infinite loop if this change originated from the network
      if (isRemoteChange) {
        setIsRemoteChange(false);
        return;
      }

      // Update local state immediately
      setText(newText);

      // 5. Send the change to the server for broadcast
      if (socket) {
        // In a real app, you'd calculate the small 'delta' here
        socket.emit("send-changes", newText);
      }
    },
    [socket, isRemoteChange]
  );

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Real-Time Editor PoC</h1>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Start typing to collaborate..."
        style={{
          width: "100%",
          minHeight: "300px",
          fontSize: "18px",
          padding: "10px",
        }}
      />
      <p>Open this page in two separate browser tabs to test collaboration.</p>
    </div>
  );
}
