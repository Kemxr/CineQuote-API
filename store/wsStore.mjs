import { Server } from "socket.io";
import fetch from "node-fetch";

// Banque de questions locale pour le quiz
const LOCAL_QUIZ_QUESTIONS = [
  {
    id: "q1",
    text: 'De quel film vient la citation : "May the Force be with you" ?',
    correctAnswer: "Star Wars",
    options: ["Star Wars", "Star Trek", "Dune", "Avatar"],
  },
  {
    id: "q2",
    text: 'De quel film vient la citation : "I\'m going to make him an offer he can\'t refuse" ?',
    correctAnswer: "The Godfather",
    options: ["The Godfather", "Goodfellas", "Scarface", "Casino"],
  },
  {
    id: "q3",
    text: 'De quel film vient la citation : "You talking to me?" ?',
    correctAnswer: "Taxi Driver",
    options: ["Taxi Driver", "Raging Bull", "Goodfellas", "Pulp Fiction"],
  },
  {
    id: "q4",
    text: 'De quel film vient la citation : "Why so serious?" ?',
    correctAnswer: "The Dark Knight",
    options: ["The Dark Knight", "Joker", "Batman Begins", "Watchmen"],
  },
  {
    id: "q5",
    text: 'De quel film vient la citation : "Here\'s Johnny!" ?',
    correctAnswer: "The Shining",
    options: ["The Shining", "Psycho", "It", "The Exorcist"],
  },
  {
    id: "q6",
    text: 'De quel film vient la citation : "I\'ll be back" ?',
    correctAnswer: "The Terminator",
    options: ["The Terminator", "Predator", "RoboCop", "Die Hard"],
  },
  {
    id: "q7",
    text: 'De quel film vient la citation : "Houston, we have a problem" ?',
    correctAnswer: "Apollo 13",
    options: ["Apollo 13", "Gravity", "Interstellar", "Armageddon"],
  },
  {
    id: "q8",
    text: 'De quel film vient la citation : "Life is like a box of chocolates" ?',
    correctAnswer: "Forrest Gump",
    options: ["Forrest Gump", "The Green Mile", "Cast Away", "Rain Man"],
  },
  {
    id: "q9",
    text: 'De quel film vient la citation : "Say hello to my little friend!" ?',
    correctAnswer: "Scarface",
    options: ["Scarface", "Carlito's Way", "Heat", "The Untouchables"],
  },
  {
    id: "q10",
    text: 'De quel film vient la citation : "I\'m king of the world!" ?',
    correctAnswer: "Titanic",
    options: ["Titanic", "Avatar", "The Notebook", "La La Land"],
  },
];


class SocketIOManager {
  constructor() {
    this.io = null;
    this.rooms = new Map();
    this.roomTimers = new Map();

    this.quizzes = new Map();
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

      socket.on("start-game", () => {
        this.handleStartGame(socket);
      });

      socket.on("answer-question", (payload) => {
        this.handleAnswerQuestion(socket, payload);
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });

    console.log("Socket.IO server started");
  }

  getApiBaseUrl() {
    const host = process.env.VITE_WS_HOST || "localhost";
    const port = process.env.PORT || process.env.VITE_WS_PORT || 8899;

    if (host === "localhost") {
      return `http://${host}:${port}/api`;
    }
    return `https://${host}/api`;
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

  async handleStartGame(socket) {
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

  if (this.quizzes.has(roomName)) {
    socket.emit("error", { message: "A game is already running in this room" });
    return;
  }

  // On clone + mélange les questions locales et on en prend 10
  const questionsPool = [...LOCAL_QUIZ_QUESTIONS];

  // shuffle simple
  for (let i = questionsPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questionsPool[i], questionsPool[j]] = [questionsPool[j], questionsPool[i]];
  }

  const questions = questionsPool.slice(0, 10);

  const quizState = {
    roomName,
    questions,
    currentIndex: 0,
    scores: new Map(), // socketId -> score
    answersForCurrent: [],
    questionStartTime: null,
    timer: null,
    questionDurationMs: 10000,
    finished: false,
  };

  // init scores
  for (const player of room.users.values()) {
    quizState.scores.set(player.id, 0);
  }

  this.quizzes.set(roomName, quizState);

  this.io.to(roomName).emit("game-started", {
    roomName,
    totalQuestions: quizState.questions.length,
  });

  this.sendQuestion(roomName);
}


  handleAnswerQuestion(socket, { questionId, answer }) {
  const roomName = socket.currentRoom;
  if (!roomName) return;

  const quiz = this.quizzes.get(roomName);
  const room = this.rooms.get(roomName);
  if (!quiz || !room || quiz.finished) return;

  const player = room.users.get(socket.id);
  if (!player) return;

  const currentQuestion = quiz.questions[quiz.currentIndex];
  if (!currentQuestion) return;

  const alreadyAnswered = quiz.answersForCurrent.some(
    (a) => a.socketId === socket.id
  );
  if (alreadyAnswered) return;

  const now = Date.now();
  const elapsed = now - (quiz.questionStartTime || now);

  const correctAnswer = currentQuestion.correctAnswer;
  const isCorrect =
    String(answer).trim().toLowerCase() ===
    correctAnswer.trim().toLowerCase();

  quiz.answersForCurrent.push({
    socketId: socket.id,
    correct: isCorrect,
    time: elapsed,
  });

  if (quiz.answersForCurrent.length >= room.users.size) {
    if (quiz.timer) {
      clearTimeout(quiz.timer);
      quiz.timer = null;
    }
    this.endQuestion(roomName);
  }
}



  computeScoresForQuestion(quiz, room) {
    const answers = quiz.answersForCurrent
      .filter((a) => a.correct)
      .sort((a, b) => a.time - b.time);

    const bonuses = [10, 7, 5]; // 1er, 2e, 3e
    const minBonus = 3;

    const perPlayer = [];

    // initialiser tous les joueurs avec 0
    for (const player of room.users.values()) {
      perPlayer.push({
        id: player.id,
        user: player.user,
        correct: false,
        bonus: 0,
        totalAfterQuestion: quiz.scores.get(player.id) || 0,
      });
    }

    // appliquer les points pour les bonnes réponses
    answers.forEach((ans, idx) => {
      const base = 10;
      const bonus = idx < bonuses.length ? bonuses[idx] : minBonus;
      const gained = base + bonus;

      const prev = quiz.scores.get(ans.socketId) || 0;
      const newScore = prev + gained;
      quiz.scores.set(ans.socketId, newScore);

      const playerLine = perPlayer.find((p) => p.id === ans.socketId);
      if (playerLine) {
        playerLine.correct = true;
        playerLine.bonus = gained;
        playerLine.totalAfterQuestion = newScore;
      }
    });

    return perPlayer;
  }

  serializeScores(quiz, room) {
    const scores = [];
    for (const player of room.users.values()) {
      scores.push({
        id: player.id,
        user: player.user,
        score: quiz.scores.get(player.id) || 0,
      });
    }
    scores.sort((a, b) => b.score - a.score);
    return scores;
  }

  sendQuestion(roomName) {
  const quiz = this.quizzes.get(roomName);
  const room = this.rooms.get(roomName);
  if (!quiz || !room) return;

  if (quiz.currentIndex >= quiz.questions.length) {
    this.endGame(roomName);
    return;
  }

  quiz.answersForCurrent = [];
  quiz.questionStartTime = Date.now();

  const question = quiz.questions[quiz.currentIndex];

  const payload = {
    index: quiz.currentIndex,
    total: quiz.questions.length,
    id: question.id,
    text: question.text,
    options: question.options,
  };

  this.io.to(roomName).emit("question", {
    question: payload,
    timeLimitMs: quiz.questionDurationMs,
  });

  if (quiz.timer) {
    clearTimeout(quiz.timer);
  }
  quiz.timer = setTimeout(() => {
    this.endQuestion(roomName);
  }, quiz.questionDurationMs);
}



  endQuestion(roomName) {
    const quiz = this.quizzes.get(roomName);
    const room = this.rooms.get(roomName);
    if (!quiz || !room || quiz.finished) return;

    const results = this.computeScoresForQuestion(quiz, room);

    this.io.to(roomName).emit("question-ended", {
      questionIndex: quiz.currentIndex,
      results,
      scores: this.serializeScores(quiz, room),
    });

    quiz.currentIndex += 1;
    this.sendQuestion(roomName);
  }

  endGame(roomName) {
    const quiz = this.quizzes.get(roomName);
    const room = this.rooms.get(roomName);
    if (!quiz || !room) return;

    quiz.finished = true;
    if (quiz.timer) {
      clearTimeout(quiz.timer);
      quiz.timer = null;
    }

    const finalScores = this.serializeScores(quiz, room);

    this.io.to(roomName).emit("game-ended", {
      scores: finalScores,
    });

    this.quizzes.delete(roomName);
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

    this.roomTimers.set(roomName, { botTimer });
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
