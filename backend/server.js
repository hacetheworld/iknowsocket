// --- server.js (Focusing ONLY on Socket.IO and Express Integration) ---
import express from "express";
import http from "http"; // Required for integrating Socket.IO
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
// --- Setup ---
dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({ origin: "*", credentials: true }));

// 1. Create the base HTTP server instance
const server = http.createServer(app);

// 2. Initialize the Socket.IO server
const io = new SocketIOServer(server, {
  // Necessary for connecting from a different port (React frontend)
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- Core Real-Time Logic ---
// io.on('connection') runs every time a new client successfully connects
io.on("connection", (socket) => {
  // The 'socket' object represents the unique connection to that one client
  console.log(`[CONNECTION] User connected with Socket ID: ${socket.id}`);

  // Hardcoded ID for demonstration—simulates joining a specific document.
  const DOC_ROOM_ID = "poc_document_1";

  // 1. Room Management: Add the socket to the specified room
  socket.join(DOC_ROOM_ID);
  console.log(`[ROOM] Socket ${socket.id} joined room: ${DOC_ROOM_ID}`);

  // 2. Data Listening: The server listens for an event named 'send-changes'
  socket.on("send-changes", (delta) => {
    // Log the change received
    console.log(
      `[DATA] Received update from ${socket.id}. Broadcasting change:`,
      delta.substring(0, 20) + "..."
    );

    // 3. Data Broadcasting: Send the event to all other clients in the room
    socket.broadcast.to(DOC_ROOM_ID).emit("receive-changes", delta);
  });

  // 4. Connection Cleanup: Handle client disconnection
  socket.on("disconnect", () => {
    console.log(`[DISCONNECT] Socket ${socket.id} disconnected.`);
    // Socket.IO automatically removes the socket from all joined rooms.
  });
});

app.get("/", (req, res) => {
  res.send("api is runningggg on inknwodocker");
});
// 5. Start the combined HTTP/Socket.IO server
server.listen(PORT, () => {
  console.log(
    `Server is running and listening for HTTP and Socket.IO traffic on port ${PORT}`
  );
});
