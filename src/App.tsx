import { useState, useEffect } from "react";
import { Client, type IMessage } from "@stomp/stompjs"; // IMessage is helpful for typing the received message
import SockJS from "sockjs-client";
import "./App.css";
import { post } from "./services/http.ts";

// 1. Define an Interface for the Message Object (for state clarity)
interface ReceivedMessage {
  id: number;
  text: string;
  receivedAt: string;
}

// 2. Define the STOMP Client type (Client or null)
type StompClient = Client | null;

// Helper function to create the WebSocket/SockJS instance
const socketFactory = (): WebSocket => {
  // Ensure the path and port (8081) are correct for your Spring Boot app
  return new SockJS("http://localhost:8081/stomp-ws", null, {
    transports: ["websocket", "xhr-streaming", "xhr-polling"],
    // THIS IS KEY: Must be true to include cookies
    withCredentials: true,
  }) as WebSocket;
};

function App() {
  // 3. Explicitly type state variables
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [stompClient, setStompClient] = useState<StompClient>(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const login = async () => {
    await post(`${apiUrl}/auth/login`, {
      email: "abc@abc.com",
      password: "abc123",
    });
  };
  // 1. Connection and Subscription Setup
  useEffect(() => {
    // Initialize the STOMP client
    const client = new Client({
      webSocketFactory: socketFactory,
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 10000,
      connectHeaders: {},

      onConnect: () => {
        setIsConnected(true);
        console.log("STOMP: Successfully connected!");

        // 2. Subscribe to the public topic used in TesterController
        // The message argument is strongly typed as IMessage
        client.subscribe("/topic/response", (message: IMessage) => {
          const newMessage: ReceivedMessage = {
            // Use the defined interface
            id: Date.now(),
            text: message.body,
            receivedAt: new Date().toLocaleTimeString(),
          };
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          console.log(`Received message: ${message.body}`);
        });
      },

      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },

      onDisconnect: () => {
        setIsConnected(false);
        console.log("STOMP: Disconnected.");
      },
    });

    client.activate();
    setStompClient(client);

    // 3. Cleanup function: Runs when the component unmounts
    return () => {
      if (client) {
        // Deactivate the client to gracefully close the connection
        client.deactivate();
      }
    };
  }, []);

  // 4. Function to Send a Message (SEND Frame)
  const sendMessage = () => {
    if (stompClient && isConnected) {
      // Define the payload structure
      const payloadObject = {
        messageId: Date.now(),
        data: "Hello from React (TS)!",
      };

      const payload = JSON.stringify(payloadObject);

      stompClient.publish({
        destination: "/app/send-data",
        body: payload,
        headers: { "content-type": "application/json" },
      });
      console.log("Published message to /app/send-data");
    } else {
      console.warn("STOMP client not connected or initialized.");
    }
  };

  return (
    <div className="App">
      <button onClick={login}>login</button>
      <h1>STOMP WebSocket Tester (TS)</h1>
      <p>
        Connection Status:{" "}
        <span
          style={{ color: isConnected ? "green" : "red", fontWeight: "bold" }}
        >
          {isConnected ? "CONNECTED" : "DISCONNECTED"}
        </span>
      </p>

      <button onClick={sendMessage} disabled={!isConnected}>
        Send Test Data to Spring Boot
      </button>

      <h2>Received Server ACKs (/topic/response)</h2>
      <div className="messages-list">
        {messages.length === 0 ? (
          <p>Waiting for messages...</p>
        ) : (
          <ul>
            {messages.map((msg) => (
              <li key={msg.id}>
                <strong>[{msg.receivedAt}]</strong> {msg.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
