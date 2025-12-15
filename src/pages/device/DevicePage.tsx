import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from "../../context/WebSocketContext";

const DevicePage = () => {
  const { id } = useParams<{ id: string }>();
  const [humidity, setHumidity] = useState<number | null>(null);

  const { client, isConnected } = useWebSocket();

  useEffect(() => {
    if (!id || !isConnected || !client) return;

    console.log(`Subscribing to device ${id}`);

    const subscription = client.subscribe(`/topic/device/${id}`, (message) => {
      const data = JSON.parse(message.body);

      if (data.humidity !== undefined) {
        setHumidity(data.humidity);
      }
    });

    return () => {
      console.log(`Unsubscribing from device ${id}`);
      subscription.unsubscribe();
    };
  }, [id, isConnected, client]);

  return (
    <div>
      <h2>Device {id}</h2>
      <p>STATUS: {isConnected ? "Connected" : "Connecting..."}</p>
      <p>Current Humidity: {humidity ?? "--"}</p>
    </div>
  );
};

export default DevicePage;
