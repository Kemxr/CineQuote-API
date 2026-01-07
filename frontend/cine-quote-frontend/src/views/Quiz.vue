<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";
import { getCurrentUser } from "../services/api";

const socket = ref(null);

const roomName = ref("");
const rooms = ref([]);
const messages = ref([]);
const users = ref([]);
const chatInput = ref("");
const currentRoom = ref(null);
const errorMessage = ref("");
const currentUser = ref(null);

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
const revealAnswer = ref(false);
const correctAnswer = ref(null);
const questionHistory = ref([]);

const isHost = ref(false);
const isReady = ref(false);

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser();
  } catch (e) {
    currentUser.value = null;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socketUrl = `${protocol}//${import.meta.env.VITE_WS_HOST}:${
    import.meta.env.VITE_WS_PORT
  }`;

  socket.value = io(socketUrl, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: {
      username: currentUser.value?.name || null,
    },
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

  socket.value.on("host-promoted", ({ roomName: rn }) => {
    if (currentRoom.value && currentRoom.value.name === rn) {
      isHost.value = true;
    }
  });

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
    questionHistory.value = [];
  });

  socket.value.on("question", ({ question, timeLimitMs }) => {
    console.log("New question:", question);
    currentQuestion.value = question;
    questionIndex.value = question.index + 1;
    timeLeft.value = Math.floor(timeLimitMs / 1000);
    hasAnswered.value = false;
    selectedAnswer.value = "";
    revealAnswer.value = false;
    correctAnswer.value = question.correctAnswer || null;

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
    ({ questionIndex: qi, results, scores: sc, correctAnswer: ca }) => {
      console.log(
        "📋 Question ended - Index:",
        qi,
        "Results:",
        results,
        "Scores:",
        sc,
        "Correct Answer:",
        ca
      );

      if (questionTimer.value) {
        clearInterval(questionTimer.value);
        questionTimer.value = null;
      }

      // 1) déterminer la bonne réponse texte
      let finalCorrectAnswer = ca || correctAnswer.value;

      if (results && Array.isArray(results) && results.length > 0) {
        const correctResult = results.find((r) => r.isCorrect === true);
        if (correctResult && correctResult.answer) {
          finalCorrectAnswer = correctResult.answer;
        }
      }

      const userAnswered = (selectedAnswer.value || "").trim();
      const normalizedUser = userAnswered.toLowerCase().replace(/\s+/g, " ").trim();
      const normalizedCorrect = (finalCorrectAnswer || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      const isCorrect =
        normalizedUser.length > 0 && normalizedUser === normalizedCorrect;

      console.log("🔍 DEBUG ANSWER", {
        userAnswered,
        finalCorrectAnswer,
        normalizedUser,
        normalizedCorrect,
        isCorrect,
      });

      const questionData = {
        question: currentQuestion.value?.text || "",
        correctAnswer: finalCorrectAnswer || "",
        userAnswer: userAnswered,
        isCorrect,
      };
      questionHistory.value.push(questionData);

      console.log("✅ Historique ajouté:", questionData);

      revealAnswer.value = true;
      correctAnswer.value = finalCorrectAnswer;
      scores.value = sc;

      setTimeout(() => {
        revealAnswer.value = false;
      }, 2000);
    }
  );

  socket.value.on("game-ended", ({ scores: sc }) => {
    console.log("Game ended:", sc);
    gameRunning.value = false;
    gameFinished.value = true;
    currentQuestion.value = null;
    revealAnswer.value = false;
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

const vibrate = (pattern = 50) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
    console.log("vibre");
  }
};

const submitAnswer = (value) => {
  if (!socket.value || !currentRoom.value || !currentQuestion.value) return;
  if (hasAnswered.value) return;

  const answerToSend = value ?? selectedAnswer.value;

  vibrate(500);

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

const getCorrectAnswersCount = () => {
  const count = questionHistory.value.filter((q) => q.isCorrect).length;
  console.log(
    "✓ Bonnes réponses:",
    count,
    "/ Total:",
    totalQuestions.value,
    "Détails:",
    questionHistory.value
  );
  return count;
};

const getSuccessRate = () => {
  if (!totalQuestions.value || totalQuestions.value === 0) return 0;
  const rate = Math.round(
    (getCorrectAnswersCount() / totalQuestions.value) * 100
  );
  console.log("📊 Taux de réussite:", rate, "%");
  return rate;
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

      <p v-else class="no-rooms">
        No active rooms. Create one to get started!
      </p>
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
          <!-- En cours de question -->
          <div v-if="gameRunning && !revealAnswer" class="question-display">
            <div class="question-header-full">
              <span class="progress">
                {{ questionIndex }} / {{ totalQuestions }}
              </span>
              <span class="question-title-center">
                De quel film cette citation ?
              </span>
              <span
                class="timer"
                :class="{ 'timer-warning': timeLeft <= 5 }"
              >
                ⏱ {{ timeLeft }}s
              </span>
            </div>

            <div class="question-text-simple" v-if="currentQuestion">
              <p>{{ currentQuestion.text }}</p>
            </div>

            <div
              class="options-grid"
              v-if="currentQuestion && currentQuestion.options"
            >
              <button
                v-for="option in currentQuestion.options"
                :key="option"
                class="option-btn"
                :class="{
                  selected: selectedAnswer === option
                }"
                :disabled="hasAnswered"
                @click="submitAnswer(option)"
              >
                <span class="option-text">{{ option }}</span>
              </button>
            </div>

            <p v-if="hasAnswered" class="answered-msg">
              ⏳ En attente de l'autre joueur...
            </p>
          </div>

          <!-- Reveal après question -->
          <div v-if="revealAnswer && gameRunning" class="reveal-display">
            <div class="reveal-header">
              <span class="progress">{{ questionIndex }} / {{ totalQuestions }}</span>
            </div>

            <div class="question-text-reveal" v-if="currentQuestion">
              <p>Quiz question:</p>
              <p class="question-content">"{{ currentQuestion.text }}"</p>
            </div>

            <div
              class="options-reveal-grid"
              v-if="currentQuestion && currentQuestion.options"
            >
              <button
                v-for="option in currentQuestion.options"
                :key="option"
                class="option-reveal-btn"
                :class="{
                  correct: option === correctAnswer,
                  'user-correct': selectedAnswer === option && option === correctAnswer,
                  'user-incorrect': selectedAnswer === option && option !== correctAnswer,
                  unselected: selectedAnswer !== option
                }"
              >
                <span class="option-label">
                  {{ String.fromCharCode(65 + currentQuestion.options.indexOf(option)) }}.
                </span>
                <span class="option-reveal-text">{{ option }}</span>
                <span v-if="option === correctAnswer" class="reveal-checkmark">✓</span>
                <span
                  v-if="selectedAnswer === option && option !== correctAnswer"
                  class="reveal-crossmark"
                >
                  ✕
                </span>
              </button>
            </div>
          </div>

          <!-- Résumé de fin de partie -->
          <div v-if="gameFinished" class="game-summary">
            <h3>🎉 Quiz terminé !</h3>

            <div class="summary-stats">
              <div class="stat-box">
                <span class="stat-label">Bonnes réponses</span>
                <span class="stat-value">
                  {{ getCorrectAnswersCount() }} / {{ totalQuestions }}
                </span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Taux de réussite</span>
                <span class="stat-value">{{ getSuccessRate() }}%</span>
              </div>
            </div>

            <div class="scores-container">
              <h4>Classement final</h4>
              <ol class="scores-list">
                <li
                  v-for="(s, index) in scores"
                  :key="s.id"
                  :class="{ winner: index === 0 }"
                >
                  <span class="rank">
                    <span v-if="index === 0">🥇</span>
                    <span v-else-if="index === 1">🥈</span>
                    <span v-else-if="index === 2">🥉</span>
                    <span v-else>#{{ index + 1 }}</span>
                  </span>
                  <span class="user-name">{{ s.user }}</span>
                  <span class="score-points">{{ s.score }} pts</span>
                </li>
              </ol>
            </div>

            <div class="history-container">
              <h4>Réponses</h4>
              <div class="history-list">
                <div
                  v-for="(item, idx) in questionHistory"
                  :key="idx"
                  class="history-item"
                  :class="{ correct: item.isCorrect, incorrect: !item.isCorrect }"
                >
                  <span class="question-num">Q{{ idx + 1 }}</span>
                  <span
                    class="status-icon"
                    :class="{
                      'status-correct': item.isCorrect,
                      'status-incorrect': !item.isCorrect
                    }"
                  >
                    {{ item.isCorrect ? "✓" : "✕" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users list -->
        <div id="users-list" v-if="!gameRunning && !gameFinished">
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.quiz {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
  background: #050b1a;
  color: #f5f7ff;
}

/* Lobby */
.lobby {
  max-width: 1040px;
  margin: 0 auto;
  width: 100%;
}

.lobby h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
  letter-spacing: 0.04em;
}

/* Room Form */
#room-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

#room-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.04);
  color: #dde3ff;
}

#room-form input::placeholder {
  color: #9fa8c6;
}

#room-form button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: #f5f7ff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

#room-form button:hover {
  filter: brightness(1.1);
}

/* Room Listing */
#room-listing {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
}

#room-listing th,
#room-listing td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #dde3ff;
  font-size: 14px;
}

#room-listing th {
  background: rgba(255, 255, 255, 0.04);
  font-weight: 600;
}

#room-listing button {
  padding: 6px 16px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: #f5f7ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

#room-listing button:hover {
  filter: brightness(1.1);
}

.no-rooms {
  text-align: center;
  color: #9fa8c6;
  padding: 40px;
  font-size: 14px;
}

/* Room */
.room {
  max-width: 1040px;
  margin: 0 auto;
  width: 100%;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.room-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.host-badge {
  font-size: 13px;
  color: #fbbf24;
  margin-left: 8px;
}

.room-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Action Buttons */
#ready,
#start,
#leave {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

#ready {
  background: rgba(255, 255, 255, 0.04);
  color: #dde3ff;
}

#ready:hover {
  background: rgba(255, 255, 255, 0.08);
}

#start {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: #f5f7ff;
}

#start:hover {
  filter: brightness(1.1);
}

#leave {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #f5f7ff;
}

#leave:hover {
  filter: brightness(1.1);
}

/* Room Content */
.room-content {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 20px;
}

/* Chat Container */
.chat-container {
  display: flex;
  flex-direction: column;
}

#chat {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.04);
}

#chat p {
  margin: 8px 0;
  line-height: 1.5;
  color: #dde3ff;
  font-size: 14px;
}

#chat time {
  color: #9fa8c6;
  font-size: 12px;
  margin-right: 8px;
}

#chat .user {
  font-weight: 600;
  color: #a78bfa;
  margin-right: 8px;
}

#chat .msg {
  color: #d4d8e8;
}

.no-messages {
  text-align: center;
  color: #9fa8c6;
  padding: 20px;
  font-style: italic;
}

#chat-form {
  display: flex;
  gap: 10px;
}

#chat-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.04);
  color: #dde3ff;
}

#chat-form input::placeholder {
  color: #9fa8c6;
}

#chat-form button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: #f5f7ff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

#chat-form button:hover:not(:disabled) {
  filter: brightness(1.1);
}

#chat-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quiz Panel */
.quiz-panel {
  grid-column: 1 / -1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.04);
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.quiz-panel h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #f5f7ff;
}

/* Question Display (En cours de jeu) */
.question-display {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.question-header-full {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 16px;
}

.question-title-center {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #f5f7ff;
}

.progress {
  font-size: 14px;
  font-weight: 600;
  color: #a78bfa;
  white-space: nowrap;
}

.timer {
  font-size: 14px;
  font-weight: 700;
  color: #60a5fa;
  padding: 6px 12px;
  background: rgba(96, 165, 250, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  white-space: nowrap;
}

.timer-warning {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.question-text-simple {
  text-align: center;
  padding: 24px 0;
}

.question-text-simple p {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #f5f7ff;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  flex: 1;
}

.option-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  border-radius: 10px;
  color: #dde3ff;
  border: 2px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 15px;
  font-weight: 500;
}

.option-btn:hover:not(:disabled) {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.5);
  transform: translateX(4px);
}

.option-btn.selected {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.2);
  color: #f5f7ff;
}

.option-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-text {
  flex: 1;
}

.answered-msg {
  text-align: center;
  color: #60a5fa;
  font-size: 14px;
  padding: 12px;
  background: rgba(96, 165, 250, 0.1);
  border-radius: 8px;
  margin-top: 12px;
  animation: fadeInOut 2s infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Reveal Display (Affichage de la réponse après réponse de tous) */
.reveal-display {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.reveal-header {
  align-self: flex-start;
  width: 100%;
}

.reveal-header .progress {
  font-size: 14px;
  font-weight: 600;
  color: #a78bfa;
}

.question-text-reveal {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.question-text-reveal p {
  margin: 0;
  color: #9fa8c6;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

.question-content {
  margin-top: 12px !important;
  font-size: 18px;
  color: #dde3ff;
  font-weight: 600;
}

.options-reveal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 600px;
  padding: 20px;
}

.option-reveal-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  aspect-ratio: 1;
  padding: 16px;
  border-radius: 16px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  background: rgba(96, 165, 250, 0.1);
  color: #dde3ff;
  cursor: default;
  transition: all 0.3s ease;
  font-weight: 600;
}

.option-reveal-btn.correct {
  background: #34d399;
  border-color: #10b981;
  color: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.5);
}

.option-reveal-btn.user-correct {
  background: #34d399;
  border-color: #10b981;
  color: #ffffff;
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.5);
}

.option-reveal-btn.user-incorrect {
  background: #ef4444;
  border-color: #dc2626;
  color: #ffffff;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

.option-reveal-btn.unselected {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #9fa8c6;
}

.option-label {
  font-size: 14px;
  opacity: 0.8;
}

.option-reveal-text {
  font-size: 14px;
  text-align: center;
  line-height: 1.4;
}

.reveal-checkmark {
  position: absolute;
  font-size: 28px;
  font-weight: 700;
  top: 8px;
  right: 8px;
}

.reveal-crossmark {
  position: absolute;
  font-size: 28px;
  font-weight: 700;
  top: 8px;
  right: 8px;
  color: #fecaca;
}

/* Game Summary */
.game-summary {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.game-summary h3 {
  text-align: center;
  font-size: 24px;
  color: #f5f7ff;
  margin: 0 0 12px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 12px;
}

.stat-label {
  font-size: 12px;
  color: #9fa8c6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #60a5fa;
}

.scores-container {
  padding: 16px;
  background: rgba(167, 139, 250, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(167, 139, 250, 0.2);
}

.scores-container h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #f5f7ff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.scores-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scores-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  font-size: 14px;
}

.scores-list li.winner {
  background: rgba(34, 197, 94, 0.15);
  border-left: 4px solid #34d399;
}

.rank {
  min-width: 28px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
}

.user-name {
  flex: 1;
  color: #dde3ff;
  font-weight: 600;
}

.score-points {
  color: #a78bfa;
  font-weight: 700;
  font-size: 16px;
}

.history-container {
  padding: 16px;
  background: rgba(96, 165, 250, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.history-container h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #f5f7ff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.history-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  font-weight: 600;
}

.history-item.correct {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.history-item.incorrect {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

.question-num {
  color: #9fa8c6;
  font-size: 11px;
}

.history-item.correct .status {
  color: #34d399;
  font-size: 16px;
}

.history-item.incorrect .status {
  color: #ef4444;
  font-size: 16px;
}

/* Users List */
#users-list {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.04);
  max-height: 600px;
  overflow-y: auto;
}

#users-list h2 {
  margin-top: 0;
  font-size: 16px;
  font-weight: 700;
  color: #f5f7ff;
  margin-bottom: 12px;
}

#users-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

#users-list li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

#users-list li:last-child {
  border-bottom: none;
}

.user-name {
  font-weight: 600;
  color: #a78bfa;
}

.host-tag {
  margin-left: 6px;
  color: #fbbf24;
  font-size: 11px;
}

.ready-tag {
  float: right;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
}

.ready-tag.ready {
  background: rgba(52, 211, 153, 0.2);
  color: #a7f3d0;
}

.ready-tag.not-ready {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
}

.no-users {
  color: #9fa8c6;
  font-style: italic;
  text-align: center;
  padding: 12px;
}

/* Error Message */
#error-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(239, 68, 68, 0.9);
  color: #fecaca;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 14px;
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

/* Responsive */
@media (max-width: 768px) {
  .quiz {
    padding: 20px 16px;
  }

  .room-content {
    grid-template-columns: 1fr;
  }

  #users-list {
    max-height: 200px;
  }

  .room-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .room-actions {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .quiz {
    padding: 16px;
  }

  .lobby h1 {
    font-size: 20px;
  }

  .room-header h1 {
    font-size: 18px;
  }

  #room-form {
    flex-direction: column;
  }

  .room-actions {
    gap: 8px;
    flex-wrap: wrap;
  }

  #ready,
  #start,
  #leave {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
