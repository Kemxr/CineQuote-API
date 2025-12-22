import { Server } from "socket.io";

class SocketIOManager {
  constructor() {
    this.io = null;
    this.rooms = new Map();      // roomName -> { name, users: Map }
    this.roomTimers = new Map(); // roomName -> { botTimer, cmdTimer }
  }

  start({ server }) {
    const origins = process.env.VITE_WS_HOST ?? "localhost";

    this.io = new Server(server, {
      cors: {
        origin: [
          `http://${origins}:${process.env.VITE_WS_PORT}`,
          `https://${origins}:${process.env.VITE_WS_PORT}`,
          `http://${origins}:5173`,
          `http://localhost:5173`,
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      this.sendRoomsList(socket);

      socket.on("join-room", ({ roomName }) => {
        this.handleJoinRoom(socket, roomName);
      });

      socket.on("send-message", ({ roomName, message }) => {
        this.handleMessage(socket, roomName, message);
      });

      socket.on("leave-room", ({ roomName }) => {
        this.handleLeaveRoom(socket, roomName);
      });

      // Toggle ready
      socket.on("toggle-ready", () => {
        this.handleToggleReady(socket);
      });

      // Host start game (pour l’instant on enverra juste un event)
      socket.on("start-game", () => {
        this.handleStartGame(socket);
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });

    console.log("Socket.IO server started");
  }

  handleJoinRoom(socket, roomName) {
    const maxUsersByRoom = 5;

    if (!roomName || roomName.trim() === "") {
      socket.emit("error", { message: "Room name cannot be empty" });
      return;
    }

    const roomSockets = this.io.sockets.adapter.rooms.get(roomName);
    if (roomSockets && roomSockets.size >= maxUsersByRoom) {
      socket.emit("error", { message: "Room is full" });
      return;
    }

    socket.join(roomName);
    socket.currentRoom = roomName;

    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, {
        name: roomName,
        users: new Map(),
      });
      this.startRoomTimers(roomName);
    }

    const room = this.rooms.get(roomName);

    // Si premier user de la room, il devient host
    const isHost = room.users.size === 0;

    const user = {
      id: socket.id,
      user: `Anon. ${socket.id.slice(0, 4)}`,
      ready: false,
      host: isHost,
    };

    room.users.set(socket.id, user);

    socket.emit("room-joined", {
      roomName,
      user: user.user,
      host: user.host,
    });

    this.sendUsersListToRoom(roomName);
    this.broadcastRoomsList();

    console.log(`${user.user} joined room: ${roomName} (host: ${isHost})`);
  }

  handleMessage(socket, roomName, message) {
    if (!socket.currentRoom || socket.currentRoom !== roomName) {
      socket.emit("error", { message: "You are not in this room" });
      return;
    }

    const room = this.rooms.get(roomName);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    const user = room.users.get(socket.id);
    if (!user) {
      socket.emit("error", { message: "User not found in room" });
      return;
    }

    const messageData = {
      time: Date.now(),
      user: user.user,
      msg: message,
    };

    this.io.to(roomName).emit("message", messageData);
  }

  handleLeaveRoom(socket, roomName) {
    if (socket.currentRoom === roomName) {
      socket.leave(roomName);
      this.removeUserFromRoom(socket, roomName);
      socket.currentRoom = null;
    }
  }

  handleDisconnect(socket) {
    if (socket.currentRoom) {
      this.removeUserFromRoom(socket, socket.currentRoom);
    }
  }

  removeUserFromRoom(socket, roomName) {
    const room = this.rooms.get(roomName);
    if (!room) return;

    const wasHost = room.users.get(socket.id)?.host === true;
    room.users.delete(socket.id);

    // Si la room est vide, on la supprime
    if (room.users.size === 0) {
      this.stopRoomTimers(roomName);
      this.rooms.delete(roomName);
    } else {
      // Si le host est parti, on assigne un nouveau host
      if (wasHost) {
        const [firstUser] = room.users.values();
        if (firstUser) {
          firstUser.host = true;
          this.io.to(firstUser.id).emit("host-promoted", {
            roomName,
          });
        }
      }

      this.sendUsersListToRoom(roomName);
    }

    this.broadcastRoomsList();
  }

  // Toggle ready pour un joueur
  handleToggleReady(socket) {
    const roomName = socket.currentRoom;
    if (!roomName) return;

    const room = this.rooms.get(roomName);
    if (!room) return;

    const user = room.users.get(socket.id);
    if (!user) return;

    user.ready = !user.ready;

    this.sendUsersListToRoom(roomName);
  }

  // Start-game par le host (première étape : juste broadcast)
  handleStartGame(socket) {
    const roomName = socket.currentRoom;
    if (!roomName) {
      socket.emit("error", { message: "You are not in a room" });
      return;
    }

    const room = this.rooms.get(roomName);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    const user = room.users.get(socket.id);
    if (!user || !user.host) {
      socket.emit("error", { message: "Only host can start the game" });
      return;
    }

    // Ici, plus tard, on pluggera la logique de lancement du quiz
    this.io.to(roomName).emit("game-started", {
      roomName,
      startedAt: Date.now(),
    });
  }

  sendUsersListToRoom(roomName) {
    const room = this.rooms.get(roomName);
    if (!room) return;

    const users = Array.from(room.users.values());
    this.io.to(roomName).emit("users-list", users);
  }

  sendRoomsList(socket) {
    const roomsList = this.getRoomsList();
    socket.emit("rooms-list", roomsList);
  }

  broadcastRoomsList() {
    const roomsList = this.getRoomsList();
    this.io.emit("rooms-list", roomsList);
  }

  getRoomsList() {
    const roomsList = [];
    this.rooms.forEach((room, roomName) => {
      const roomSockets = this.io.sockets.adapter.rooms.get(roomName);
      roomsList.push({
        name: roomName,
        nbUsers: roomSockets ? roomSockets.size : 0,
        maxUsers: 5,
      });
    });
    return roomsList;
  }

  startRoomTimers(roomName) {
    const botTimer = setInterval(() => {
      if (this.rooms.has(roomName)) {
        this.io.to(roomName).emit("message", {
          time: Date.now(),
          user: "Bot botesque",
          msg: "The game will start soon, ready up !",
        });
      }
    }, 50000);

    this.roomTimers.set(roomName, { botTimer});
  }

  stopRoomTimers(roomName) {
    const timers = this.roomTimers.get(roomName);
    if (timers) {
      clearInterval(timers.botTimer);
      this.roomTimers.delete(roomName);
    }
  }
}

export const wsServer = new SocketIOManager();
