const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("Server is running"));

// In-memory queue
let queue = {
  tokens: [],
  currentToken: null,
  avgConsultMin: 10,
  calledAt: null
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send current state to new client immediately
  socket.emit("queue:update", queue);

  socket.on("queue:add", ({ name }) => {
    queue.tokens.push({ id: Date.now(), name, addedAt: Date.now() });
    io.emit("queue:update", queue);
  });

  socket.on("queue:callNext", () => {
    if (!queue.tokens.length) return;
    const [head, ...rest] = queue.tokens;
    queue.currentToken = head;
    queue.tokens = rest;
    queue.calledAt = Date.now();
    io.emit("queue:update", queue);
  });

  socket.on("queue:setAvg", ({ minutes }) => {
    queue.avgConsultMin = Math.max(1, Number(minutes));
    io.emit("queue:update", queue);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

httpServer.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});