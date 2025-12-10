<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { WSClientRoom } from "wsmini";

// WebSocket instance
const ws = new WSClientRoom(`ws://${import.meta.env.VITE_WS_HOST}:${import.meta.env.VITE_WS_PORT}`);

// Reactive state
const roomName = ref("");
const rooms = ref([]);
const messages = ref([]);
const users = ref([]);
const chatInput = ref("");
const currentRoom = ref(null);
const errorMessage = ref("");

// Template refs
const lobbyDom = ref(null);
const roomDom = ref(null);

// Connect to WebSocket server
onMounted(async () => {
  try {
    await ws.connect();

    // Listen for room updates
    ws.roomOnRooms((updatedRooms) => {
      rooms.value = updatedRooms;
    });
  } catch (err) {
    errorMessage.value = "Failed to connect to server";
    console.error("WebSocket connection error:", err);
  }
});

// Cleanup on component unmount
onUnmounted(() => {
  if (currentRoom.value) {
    currentRoom.value.leave();
  }
  ws.disconnect?.();
});

// Join or create a room
const joinOrCreateRoom = async (name) => {
  if (!name?.trim()) {
    errorMessage.value = "Room name cannot be empty";
    setTimeout(() => (errorMessage.value = ""), 3000);
    return;
  }

  try {
    const room = await ws.roomCreateOrJoin(name);
    showRoom(room);
    errorMessage.value = "";
  } catch (err) {
    errorMessage.value = err.message || "Failed to join room";
    setTimeout(() => (errorMessage.value = ""), 3000);
  }
};

// Show the room interface
const showRoom = (room) => {
  currentRoom.value = room;
  messages.value = [];
  users.value = [];
  
  room.onMessage(onRoomMessage);
  room.onClients(onClients);
  room.onCmd("foo", (data) =>
    console.log("Received foo cmd from server:", data)
  );
};

// Handle incoming messages
const onRoomMessage = (data) => {
  messages.value.push(data);
};

// Handle user list updates
const onClients = (updatedUsers) => {
  users.value = updatedUsers;
};

// Send a message
const sendMessage = () => {
  const message = chatInput.value.trim();
  
  if (message && currentRoom.value) {
    currentRoom.value.send(message);
    chatInput.value = "";
  }
};

// Leave the room
const leaveRoom = () => {
  if (currentRoom.value) {
    currentRoom.value.leave();
    currentRoom.value = null;
    messages.value = [];
    users.value = [];
  }
};

// Format time helper
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
        <h1>Room: {{ currentRoom.name }}</h1>
        <button id="leave" @click="leaveRoom">Leave Room</button>
      </div>

      <div class="room-content">
        <div class="chat-container">
          <div id="chat">
            <p v-for="(message, index) in messages" :key="`${message.time}-${index}`">
              <time>{{ formatTime(message.time) }}</time>
              <span class="user">{{ message.user }}:</span>
              <span class="msg">{{ message.msg }}</span>
            </p>
            <p v-if="messages.length === 0" class="no-messages">
              No messages yet. Start the conversation!
            </p>
          </div>

          <form id="chat-form" @submit.prevent="sendMessage">
            <input
              v-model="chatInput"
              placeholder="Type a message"
              autofocus
            />
            <button type="submit" :disabled="!chatInput.trim()">Send</button>
          </form>
        </div>

        <div id="users-list">
          <h2>Users ({{ users.length }})</h2>
          <ul v-if="users.length > 0">
            <li v-for="user in users" :key="user.id">
              {{ user.user }}
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

/* Lobby Styles */
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

/* Room Styles */
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

/* Error Message */
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

/* Transitions */
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
  .room-content {
    grid-template-columns: 1fr;
  }

  #users-list {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>