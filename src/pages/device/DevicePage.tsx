import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type Device from "../../types/Device.ts";
import { get } from "../../services/http.ts";
import { useWebSocket } from "../../context/WebSocketContext";
import { RefreshCw, Settings } from "lucide-react";
import PresetForm from "../../components/device/PresetForm.tsx";

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const { client, isConnected } = useWebSocket();

  const fetchDevice = useCallback(async () => {
    try {
      const devicesResponse = await get(`${apiUrl}/devices/${id}`);
      setDevice(devicesResponse.data);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, id]);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  useEffect(() => {
    if (!id || !isConnected || !client) return;

    const subscription = client.subscribe(`/topic/device/${id}`, (message) => {
      const data = JSON.parse(message.body);
      if (data.humidity !== undefined) {
        setDevice((prev) =>
          prev ? { ...prev, lastHumidity: data.humidity } : prev,
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id, isConnected, client]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getHumidityColor = (value: number) => {
    if (value < 30) return "text-warning";
    if (value > 70) return "text-info";
    return "text-success";
  };

  const getHumidityStatusText = (value: number) => {
    if (value < 30) return "Dry - Needs Water";
    if (value > 70) return "Wet - Risk of Rot";
    return "Optimal Levels";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  if (!device) return <div>Device not found</div>;

  return (
    <div className="h-full bg-base-200 p-4 pb-20">
      <div className="max-w-md mx-auto mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-circle btn-ghost btn-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{device.name}</h1>
          <div className="flex items-center gap-2 text-xs opacity-60">
            <div
              className={`w-2 h-2 rounded-full ${device.connected ? "bg-success" : "bg-error"}`}
            ></div>
            {device.connected ? "Online" : "Offline"}
          </div>
        </div>
        <button onClick={() => setShowSettings((prev) => !prev)}>
          <Settings size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {showSettings ? (
          <PresetForm
            id={id}
            onClose={() => {
              setShowSettings(false);
            }}
          />
        ) : (
          <></>
        )}

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body items-center text-center py-8">
            <h2 className="card-title text-sm uppercase tracking-wide opacity-50 mb-2">
              Current Moisture
            </h2>

            <div
              className={`radial-progress ${getHumidityColor(device.lastHumidity)}`}
              style={
                {
                  "--value": device.lastHumidity,
                  "--size": "10rem",
                  "--thickness": "1rem",
                } as never
              }
              role="progressbar"
            >
              <div className="flex flex-col items-center text-base-content">
                <span className="text-4xl font-black">
                  {device.lastHumidity}%
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p
                className={`font-medium ${getHumidityColor(device.lastHumidity)}`}
              >
                {getHumidityStatusText(device.lastHumidity)}
              </p>
              <p className="text-xs text-base-content/50 mt-1">
                Target: 40% - 60%
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4 mb-2">
            <div className={"flex flex-row justify-between items-center"}>
              <h3 className="font-bold text-sm ">Actions</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost p-1"
                onClick={fetchDevice}
                title="Refresh devices"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  client?.publish({
                    destination: "/app/user",
                    body: JSON.stringify({
                      command: 1,
                      deviceId: id,
                    }),
                  });
                }}
                className="btn btn-primary btn-sm flex-1"
              >
                Water Now
              </button>
              <button className="btn btn-outline btn-sm flex-1">History</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 flex flex-col items-center justify-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-primary mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-xs opacity-50">Last Sync</div>
              <div className="font-bold text-sm">
                {formatTime(device.lastSeen)}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 flex flex-col items-center justify-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-primary mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
                />
              </svg>
              <div className="text-xs opacity-50">Signal</div>
              <div className="font-bold text-sm">
                {device.connected ? "Strong" : "No Signal"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;
