import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { get } from "../../services/http.ts";

interface Device {
  id: string;
  name: string;
  connected: boolean;
}

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchDevices = useCallback(async () => {
    try {
      const devicesResponse = await get(`${apiUrl}/devices/`);
      setDevices(devicesResponse.data);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleDeviceClick = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-md mx-auto md:max-w-4xl mb-6 flex justify-between items-end">
        <div>
          <p className="text-sm text-base-content/60 font-medium">
            Welcome back,
          </p>
          <h1 className="text-3xl font-bold text-primary">
            {user?.name || user?.email?.split("@")[0] || "Gardener"}
          </h1>
        </div>
        <button className="btn btn-circle btn-ghost btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.157.92c.44.085.86.232 1.256.425l.853-.474c.48-.266 1.096-.134 1.408.31l.546.945c.312.54.168 1.196-.282 1.55l-.719.565c.037.24.062.485.062.73 0 .245-.025.49-.062.73l.72.564c.45.354.594 1.01.282 1.55l-.547.945c-.312.444-.928.576-1.408.31l-.853-.474a6.035 6.035 0 01-1.256.425l-.157.92c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.157-.92a6.05 6.05 0 01-1.256-.425l-.853.474c-.48.266-1.096.134-1.408-.31l-.546-.945c-.312-.54-.168-1.196.282-1.55l.719-.565a5.85 5.85 0 00-.062-.73c0-.245.025-.49.062-.73l-.72-.564c-.45-.354-.594-1.01-.282-1.55l.547-.945c.312-.444.928-.576 1.408-.31l.853.474c.44-.193.86-.34 1.256-.425l.157-.92z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      <div className="max-w-md mx-auto md:max-w-4xl">
        <div className="stats shadow w-full mb-6 bg-base-100">
          <div className="stat">
            <div className="stat-title">Active Devices</div>
            <div className="stat-value text-secondary text-2xl">
              {devices.filter((d) => d.connected).length} / {devices.length}
            </div>
            <div className="stat-desc">All systems normal</div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-3 px-1">Your Devices</h2>

        {loading ? (
          <div className="flex justify-center p-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => handleDeviceClick(device.id)}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-all cursor-pointer border border-base-200 active:scale-95 duration-200"
              >
                <div className="card-body p-4 flex flex-row items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                    ${device.connected ? "bg-primary/10 text-primary" : "bg-base-300 text-base-content/40"}`}
                  >
                    🎛
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate">
                      {device.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      <span
                        className={`badge badge-xs ${device.connected ? "badge-success" : "badge-error"}`}
                      ></span>
                      <span className="capitalize">
                        {device.connected ? "online" : "offline"}
                      </span>
                    </div>
                  </div>

                  <div className="text-base-content/30">
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
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}

            <div className="card border-2 border-dashed border-base-300 bg-transparent hover:border-primary hover:bg-base-100/50 transition-colors cursor-pointer flex items-center justify-center min-h-[5rem]">
              <div className="flex flex-col items-center gap-1 py-4 text-base-content/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="text-xs font-bold">Add Device</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
