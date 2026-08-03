import { useParams } from "react-router-dom";
import { LineChart } from "@mui/x-charts/LineChart";
import { useCallback, useEffect, useState } from "react";
import { get } from "../../services/http.ts";
import { formatTime } from "../../services/datetime.ts";

type Record = {
  id: number;
  humidity: number;
  temperature: number;
  timestamp: string;
};

const HistoryPage = () => {
  const api_url = import.meta.env.VITE_API_BASE_URL;

  const { id } = useParams();
  const [page, setPage] = useState(0);
  const [humidityRecords, setHumidityRecords] = useState<Record[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [size, setSize] = useState(10);

  const fetchRecords = useCallback(async () => {
    const res = await get(
      `${api_url}/humidity/history/device/${id}?page=${page}&size=${size}`,
    );

    if (!res.isError) {
      setHumidityRecords(res.data.records);
      setTotalPages(res.data.totalPages);
    }
  }, [api_url, id, page, size]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleNext = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const pData = humidityRecords.map((r: Record) => r.humidity);
  const tData = humidityRecords.map((r: Record) => r.temperature);
  const xLabels = humidityRecords.map((r: Record) => formatTime(r.timestamp));

  return (
    <div className="w-[90%] h-[500px] ">
      <LineChart
        height={500}
        series={[
          {
            data: [...pData].reverse(),
            label: "Humidity (%)",
            yAxisId: "humidity-axis",
            color: "#02b2af",
          },
          {
            data: [...tData].reverse(),
            label: "Temperature (°C)",
            yAxisId: "temperature-axis",
            color: "#f44336",
          },
        ]}
        xAxis={[
          { scaleType: "point", data: [...xLabels].reverse(), height: 28 },
        ]}
        yAxis={[
          { id: "humidity-axis", position: "left", min: 0, max: 100 },
          { id: "temperature-axis", position: "right", min: -20, max: 50 },
        ]}
        margin={{ right: 50 }}
      />
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={handleNext}
            disabled={humidityRecords.length < size}
            className="px-4 py-2 rounded-lg border bg-white shadow-sm
               hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed
               transition"
          >
            ←
          </button>
          <span className="text-lg font-medium">Page {totalPages - page}</span>
          <button
            onClick={handlePrev}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg border bg-white shadow-sm
               hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed
               transition"
          >
            →
          </button>
        </div>
        <select
          value={size}
          className="select flex items-center justify-center mt-4"
          onChange={(e) => {
            setSize(Number(e.target.value));
            setPage(0);
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>
    </div>
  );
};

export default HistoryPage;
