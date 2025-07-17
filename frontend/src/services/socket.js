import { io } from 'socket.io-client';

const SERVER_URL = 'https://collab-todo-1.onrender.com';

export const socket = io(SERVER_URL);
