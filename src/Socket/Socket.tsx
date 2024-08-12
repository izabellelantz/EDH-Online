import { io } from "socket.io-client";

export const socket = io('http://localhost:5173', {
  withCredentials: true,
});
