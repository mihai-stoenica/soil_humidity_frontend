import { useState, useEffect } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import "./App.css";
import { post } from "./services/http.ts";

// Interface for UI state
interface ReceivedMessage {
  id: number;
  text: string;
  receivedAt: string;
}

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  // Use localhost for API calls to ensure cookies match domain
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const login = async () => {
    try {
      await post(`${apiUrl}/auth/login`, {
        email: "abc@abc.com",
        password: "abc123",
      });
      console.log("Login successful! Cookie should be set.");
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  useEffect(() => {
    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL,

      reconnectDelay: 5000,

      debug: (str) => {
        console.log("STOMP Debug:", str);
      },

      // Handlers
      onConnect: () => {
        setIsConnected(true);
        console.log("STOMP: Connected via Raw WebSockets!");

        client.subscribe("/topic/device/2", (message: IMessage) => {
          const newMessage: ReceivedMessage = {
            id: Date.now(),
            text: message.body,
            receivedAt: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, newMessage]);
          console.log("Received:", message.body);
        });
      },

      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Details: " + frame.body);
      },

      onWebSocketClose: () => {
        setIsConnected(false);
        console.log("WebSocket Connection Closed");
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (stompClient && isConnected) {
      const payload = JSON.stringify({
        messageId: Date.now(),
        data: "Hello from Raw WebSockets!",
      });

      stompClient.publish({
        destination: "/app/device",
        body: payload,
        headers: { "content-type": "application/json" },
      });
      console.log("Message sent!");
    }
  };

  return (
    <div className="App">
      <button onClick={login} style={{ marginBottom: "20px" }}>
        1. Login First (Set Cookie)
      </button>

      <h1>STOMP Raw WebSocket Tester</h1>

      <p>
        Status:{" "}
        <span
          style={{ color: isConnected ? "green" : "red", fontWeight: "bold" }}
        >
          {isConnected ? "CONNECTED" : "DISCONNECTED"}
        </span>
      </p>

      <button onClick={sendMessage} disabled={!isConnected}>
        2. Send Test Data
      </button>

      <h2>Live Messages</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {messages.map((msg) => (
          <li
            key={msg.id}
            style={{ borderBottom: "1px solid #ccc", padding: "5px" }}
          >
            <strong>[{msg.receivedAt}]</strong> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
