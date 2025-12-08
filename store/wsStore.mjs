import { WSServerRoomManager, WSServerRoom } from "wsmini";

const origins = process.env.VITE_WS_HOST ?? "localhost";

/**
 * WebSocket server instance
 * Note: port is not specified here as it will use the HTTP server port
 */
export const wsServer = new WSServerRoomManager({
  origins,
  maxUsersByRoom: 10,
  roomClass: class extends WSServerRoom {
    onMsg(msg, clientMeta, client) {
      return {
        time: Date.now(),
        user: "Anon. " + clientMeta.id.slice(0, 4),
        msg,
      };
    }

    onSendClient(clientMeta) {
      return { user: "Anon. " + clientMeta.id.slice(0, 4) };
    }

    onCreate(name, msg = null, clientMeta = null, client = null) {
      // Example bot messages
      this.timer = setInterval(() => this.broadcastCmd("foo", { foo: "bar" }), 5000);
      this.timer2 = setInterval(() =>
        this.broadcast({
          time: Date.now(),
          user: "Bot",
          msg: "I'm a bot, I send a message every 10 seconds",
        }), 10000);
    }

    onDispose() {
      // Clear timers when the room is deleted
      clearInterval(this.timer);
      clearInterval(this.timer2);
    }
  },
});