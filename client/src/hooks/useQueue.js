import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useQueue() {
  const [queue, setQueue] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket error:", err.message);
    });

    socket.on("queue:update", (data) => {
      console.log("Queue received:", data);
      setQueue(data);
    });

    return () => socket.disconnect();
  }, []);

  const emit = (event, payload) => {
    socketRef.current?.emit(event, payload);
  };

  return {
    queue,
    addPatient: (name) => emit("queue:add", { name }),
    callNext: () => emit("queue:callNext"),
    setAvgConsult: (minutes) => emit("queue:setAvg", { minutes })
  };
}