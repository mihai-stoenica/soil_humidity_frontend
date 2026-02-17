import { useParams } from "react-router-dom";
import { LineChart } from "@mui/x-charts/LineChart";
import { useCallback, useEffect, useState } from "react";
import { get } from "../../services/http.ts";
import { formatTime } from "../../services/datetime.ts";

type HumidityRecord = {
  id: number;
  value: number;
  timestamp: string;
};

const HistoryPage = () => {
  const api_url = import.meta.env.VITE_API_BASE_URL;

  const { id } = useParams();
  const [page] = useState(0);
  const [humidityRecords, setHumidityRecords] = useState<HumidityRecord[]>([]);

  const fetchRecords = useCallback(async () => {
    const res = await get(
      `${api_url}/humidity/history/device/${id}?page=${page}`,
    );

    if (!res.isError) {
      setHumidityRecords(res.data);
    }
  }, [api_url, id, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const margin = { right: 24 };
  const pData = humidityRecords.map((r: HumidityRecord) => r.value);
  const xLabels = humidityRecords.map((r: HumidityRecord) =>
    formatTime(r.timestamp),
  );

  return (
    <>
      <div className="w-[50%]">
        <LineChart
          series={[{ data: pData.reverse(), label: "humidity" }]}
          xAxis={[{ scaleType: "point", data: xLabels.reverse(), height: 28 }]}
          yAxis={[
            {
              width: 50,
              min: 0,
              max: 100,
            },
          ]}
          margin={margin}
          height={500}
        />
      </div>
    </>
  );
};

export default HistoryPage;
