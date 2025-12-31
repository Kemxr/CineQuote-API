<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";

const socket = ref(null);

const roomName = ref("");
const rooms = ref([]);
const messages = ref([]);
const users = ref([]);
const chatInput = ref("");
const currentRoom = ref(null);
const errorMessage = ref("");

const currentQuestion = ref(null);
const questionIndex = ref(0);
const totalQuestions = ref(0);
const timeLeft = ref(0);
const questionTimer = ref(null);
const hasAnswered = ref(false);
const selectedAnswer = ref("");
const scores = ref([]);
const gameRunning = ref(false);
const gameFinished = ref(false);

const isHost = ref(false);
const isReady = ref(false);

onMounted(() => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socketUrl = `${protocol}//${import.meta.env.VITE_WS_HOST}:${
    import.meta.env.VITE_WS_PORT
  }`;

  socket.value = io(socketUrl, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.value.on("connect", () => {
    console.log("Connected to server");
    errorMessage.value = "";
  });

  socket.value.on("connect_error", (error) => {
    console.error("Connection error:", error);
    errorMessage.value = "Failed to connect to server";
  });

  socket.value.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  socket.value.on("rooms-list", (updatedRooms) => {
    rooms.value = updatedRooms;
  });

  socket.value.on("room-joined", ({ roomName: joinedRoom, user, host }) => {
    console.log(`Joined room: ${joinedRoom} as ${user}, host: ${host}`);
    currentRoom.value = {
      name: joinedRoom,
      user,
    };
    isHost.value = !!host;
    isReady.value = false;
    messages.value = [];
    users.value = [];
  });

  socket.value.on("users-list", (updatedUsers) => {
    users.value = updatedUsers;
  });

  socket.value.on("message", (data) => {
    if (currentRoom.value) {
      messages.value.push(data);
    }
  });

  socket.value.on("foo", (data) => {
    console.log("Received foo cmd from server:", data);
  });

  socket.value.on("error", ({ message }) => {
    errorMessage.value = message;
    setTimeout(() => (errorMessage.value = ""), 3000);
  });

  // Promotion automatique quand l’ancien host quitte
  socket.value.on("host-promoted", ({ roomName: rn }) => {
    if (currentRoom.value && currentRoom.value.name === rn) {
      isHost.value = true;
    }
  });

  // Pour l’instant, on se contente de log le start
  socket.value.on("game-started", ({ roomName: rn, startedAt }) => {
    console.log("Game started in room", rn, "at", new Date(startedAt));
  });

  socket.value.on("game-started", ({ roomName: rn, totalQuestions: total }) => {
    if (!currentRoom.value || currentRoom.value.name !== rn) return;
    console.log("Game started in room", rn);
    gameRunning.value = true;
    gameFinished.value = false;
    scores.value = [];
    questionIndex.value = 0;
    totalQuestions.value = total;
  });

  socket.value.on("question", ({ question, timeLimitMs }) => {
    console.log("New question:", question);
    currentQuestion.value = question;
    questionIndex.value = question.index + 1;
    timeLeft.value = Math.floor(timeLimitMs / 1000);
    hasAnswered.value = false;
    selectedAnswer.value = "";

    if (questionTimer.value) {
      clearInterval(questionTimer.value);
    }
    questionTimer.value = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value -= 1;
      }
    }, 1000);
  });

  socket.value.on(
    "question-ended",
    ({ questionIndex: qi, results, scores: sc }) => {
      console.log("Question ended:", qi, results, sc);
      if (questionTimer.value) {
        clearInterval(questionTimer.value);
        questionTimer.value = null;
      }
      scores.value = sc;
    }
  );

  socket.value.on("game-ended", ({ scores: sc }) => {
    console.log("Game ended:", sc);
    gameRunning.value = false;
    gameFinished.value = true;
    currentQuestion.value = null;
    if (questionTimer.value) {
      clearInterval(questionTimer.value);
      questionTimer.value = null;
    }
    scores.value = sc;
  });
});

onUnmounted(() => {
  if (currentRoom.value) {
    leaveRoom();
  }
  if (socket.value) {
    socket.value.disconnect();
  }
});

const joinOrCreateRoom = (name) => {
  if (!name?.trim()) {
    errorMessage.value = "Room name cannot be empty";
    setTimeout(() => (errorMessage.value = ""), 3000);
    return;
  }

  if (!socket.value || !socket.value.connected) {
    errorMessage.value = "Not connected to server";
    setTimeout(() => (errorMessage.value = ""), 3000);
    return;
  }

  messages.value = [];
  users.value = [];
  isHost.value = false;
  isReady.value = false;

  socket.value.emit("join-room", { roomName: name });
  errorMessage.value = "";
};

const sendMessage = () => {
  const message = chatInput.value.trim();

  if (message && currentRoom.value && socket.value) {
    socket.value.emit("send-message", {
      roomName: currentRoom.value.name,
      message,
    });
    chatInput.value = "";
  }
};

const leaveRoom = () => {
  if (currentRoom.value && socket.value) {
    socket.value.emit("leave-room", { roomName: currentRoom.value.name });
    currentRoom.value = null;
    messages.value = [];
    users.value = [];
    isHost.value = false;
    isReady.value = false;
  }
};

const toggleReady = () => {
  if (!socket.value || !currentRoom.value) return;
  socket.value.emit("toggle-ready");
};

const startGame = () => {
  if (!socket.value || !currentRoom.value) return;
  socket.value.emit("start-game");
};

const submitAnswer = (value) => {
  if (!socket.value || !currentRoom.value || !currentQuestion.value) return;
  if (hasAnswered.value) return;

  const answerToSend = value ?? selectedAnswer.value;

  socket.value.emit("answer-question", {
    questionId: currentQuestion.value.id,
    answer: answerToSend,
  });

  selectedAnswer.value = answerToSend;
  hasAnswered.value = true;
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};
</script>

<template>
  <div class="quiz">
    <!-- Lobby View -->
    <div v-if="!currentRoom" ref="lobbyDom" class="lobby">
      <h1>Lobby</h1>

      <form id="room-form" @submit.prevent="joinOrCreateRoom(roomName)">
        <input
          id="name"
          v-model="roomName"
          placeholder="Enter room name"
          autofocus
          required
        />
        <button type="submit">Create/Join Room</button>
      </form>

      <table v-if="rooms.length > 0" id="room-listing">
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Users</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in rooms" :key="room.name">
            <td>{{ room.name }}</td>
            <td>{{ room.nbUsers }} / {{ room.maxUsers }}</td>
            <td>
              <button @click="joinOrCreateRoom(room.name)">Join</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-rooms">No active rooms. Create one to get started!</p>
    </div>

    <!-- Room View -->
    <div v-else ref="roomDom" class="room">
      <div class="room-header">
        <h1>
          Room: {{ currentRoom.name }}
          <span v-if="isHost" class="host-badge">(Host)</span>
        </h1>

        <div class="room-actions">
          <button
            id="ready"
            v-if="!gameRunning && !gameFinished"
            @click="toggleReady"
          >
            {{ isReady ? "Not ready" : "Ready" }}
          </button>

          <button
            id="start"
            v-if="isHost && !gameRunning && !gameFinished"
            @click="startGame"
          >
            Start game
          </button>

          <button id="leave" @click="leaveRoom">Leave Room</button>
        </div>
      </div>

      <div class="room-content">
        <div class="chat-container" v-if="!gameRunning && !gameFinished">
          <div id="chat">
            <p
              v-for="(message, index) in messages"
              :key="`${message.time}-${index}`"
            >
              <time>{{ formatTime(message.time) }}</time>
              <span class="user">{{ message.user }}:</span>
              <span class="msg">{{ message.msg }}</span>
            </p>
            <p v-if="messages.length === 0" class="no-messages">
              No messages yet. Start the conversation!
            </p>
          </div>

          <form id="chat-form" @submit.prevent="sendMessage">
            <input v-model="chatInput" placeholder="Type a message" autofocus />
            <button type="submit" :disabled="!chatInput.trim()">Send</button>
          </form>
        </div>

        <div class="quiz-panel" v-else>
          <h2>De quel film cette citation ?</h2>

          <div v-if="gameRunning">
            <p v-if="currentQuestion">
              <strong>{{ currentQuestion.text }}</strong>
            </p>
            <p>Time left: {{ timeLeft }}s</p>

            <div v-if="currentQuestion && currentQuestion.options">
              <button
                v-for="option in currentQuestion.options"
                :key="option"
                class="option-btn"
                :class="{ selected: selectedAnswer === option }"
                :disabled="hasAnswered"
                @click="submitAnswer(option)"
              >
                {{ option }}
              </button>
            </div>
            <p>{{ questionIndex }} / {{ totalQuestions }}</p>

            <p v-if="hasAnswered">Tu as déjà répondu à cette question.</p>
          </div>

          <div v-if="gameFinished">
            <h3>Final scores</h3>
            <ol>
              <li v-for="s in scores" :key="s.id">
                {{ s.user }} - {{ s.score }} pts
              </li>
            </ol>
          </div>
        </div>

        <!-- COLONNE DROITE : liste des users toujours visible -->
        <div id="users-list">
          <h2>Users ({{ users.length }})</h2>
          <ul v-if="users.length > 0">
            <li v-for="user in users" :key="user.id">
              <span class="user-name">
                {{ user.user }}
                <span v-if="user.host" class="host-tag">[Host]</span>
              </span>
              <span
                class="ready-tag"
                :class="user.ready ? 'ready' : 'not-ready'"
              >
                {{ user.ready ? "Ready" : "Waiting" }}
              </span>
            </li>
          </ul>
          <p v-else class="no-users">No users in this room</p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <Transition name="fade">
      <p v-if="errorMessage" id="error-message" role="alert">
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.quiz {
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.lobby,
.room {
  margin: 20px auto;
  max-width: 800px;
}

.lobby h1 {
  margin-bottom: 20px;
}

#room-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

#room-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

#room-form button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

#room-form button:hover {
  background-color: #359268;
}

#room-listing {
  width: 100%;
  border-collapse: collapse;
}

#room-listing th,
#room-listing td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

#room-listing th {
  background-color: #f5f5f5;
  color: #333;
  font-weight: 600;
}

#room-listing button {
  padding: 6px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#room-listing button:hover {
  background-color: #337ecc;
}

.no-rooms {
  text-align: center;
  color: #666;
  padding: 40px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.room-header h1 {
  margin: 0;
}

#leave {
  padding: 8px 16px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

#leave:hover {
  background-color: #d84545;
}

.room-content {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 20px;
}

.chat-container {
  display: flex;
  flex-direction: column;
}

#chat {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  background-color: #fafafa;
}

#chat p {
  margin: 8px 0;
  line-height: 1.5;
}

#chat time {
  color: #999;
  font-size: 0.85em;
  margin-right: 8px;
}

#chat .user {
  font-weight: 600;
  color: #42b983;
  margin-right: 8px;
}

#chat .msg {
  color: #333;
}

.no-messages {
  text-align: center;
  color: #999;
  padding: 20px;
}

#chat-form {
  display: flex;
  gap: 10px;
}

#chat-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

#chat-form button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

#chat-form button:hover:not(:disabled) {
  background-color: #359268;
}

#chat-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

#users-list {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

#users-list h2 {
  margin-top: 0;
  font-size: 1.2em;
  color: #f39c12;
}

#users-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

#users-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

#users-list li:last-child {
  border-bottom: none;
}

.no-users {
  color: #999;
  font-style: italic;
}

#error-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #f56c6c;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .room-content {
    grid-template-columns: 1fr;
  }

  #users-list {
    max-height: 200px;
    overflow-y: auto;
  }
}

.host-badge {
  font-size: 0.8rem;
  color: #f39c12;
  margin-left: 8px;
}

.room-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

#ready {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

#ready:hover {
  background-color: #337ecc;
}

#start {
  padding: 8px 16px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

#start:hover {
  background-color: #4aa52d;
}

.user-name {
  font-weight: 600;
  color: #4aa52d;
}

.host-tag {
  margin-left: 6px;
  color: #f39c12;
}

.ready-tag {
  float: right;
  font-size: 0.9rem;
  padding: 2px 8px;
  border-radius: 12px;
}

.ready-tag.ready {
  background-color: #e1f3d8;
  color: #67c23a;
}

.ready-tag.not-ready {
  background-color: #fde2e2;
  color: #f56c6c;
}

.option-btn {
  display: block;
  width: 100%;
  margin: 8px 0;
  padding: 10px 14px;
  text-align: left;
  border-radius: 4px;
  color: #333;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.option-btn:hover:not(:disabled) {
  background-color: #f5f7fa;
}

.option-btn.selected {
  border-color: #f9f04c;
  background-color: #f3efd8;
}

.option-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
