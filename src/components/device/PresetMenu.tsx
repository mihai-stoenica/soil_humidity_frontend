import { useCallback, useEffect, useState } from "react";
import { get, post } from "../../services/http.ts";
import type { Preset } from "../../types/Preset.ts";

type FormProps = {
  id: string | undefined;
  activePreset: number | undefined;
  onSave: () => void;
};

const PresetMenu = ({ id, onSave, activePreset }: FormProps) => {
  type Pattern = "continuous" | "step" | "";

  const [wateringTime, setWateringTime] = useState("");
  const [pattern, setPattern] = useState<Pattern>("");
  const [steps, setSteps] = useState("");
  const [delay, setDelay] = useState("");
  const [presets, setPresets] = useState<Preset[]>();
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchPresets = useCallback(async () => {
    const response = await get(`${apiUrl}/presets/${id}`);
    if (!response.isError) {
      setPresets(response.data);
    }
  }, [apiUrl, id]);

  const setActive = async (presetId: number) => {
    const response = await post(
      `${apiUrl}/presets/device/${id}/preset/${presetId}`,
      {},
    );
    if (!response.isError) {
      onSave();
    }
  };

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  useEffect(() => {
    if (pattern !== "step") {
      setSteps("");
      setDelay("");
    }
  }, [pattern, presets]);

  const handleSubmit = async () => {
    if (!wateringTime || !pattern) return;

    const preset =
      pattern === "step"
        ? {
            pattern: "step" as const,
            watering_time: Number(wateringTime),
            steps: Number(steps),
            delay: Number(delay),
          }
        : {
            pattern: "continuous" as const,
            watering_time: Number(wateringTime),
          };
    const response = await post(`${apiUrl}/presets/${id}`, preset);
    if (!response.isError) {
      fetchPresets();
      onSave();
      setError("");
    } else {
      setError(response.message);
    }
  };

  if (!id) return;
  return (
    <div className="card">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg flex flex-col items-center">
        <legend className="fieldset-legend">Presets</legend>

        {presets ? (
          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th className="text-center truncate max-w-[80px]">Time(s)</th>
                  <th className="text-center truncate max-w-[80px]">Pattern</th>
                  <th className="text-center truncate max-w-[80px]">Steps</th>
                  <th className="text-center truncate max-w-[80px]">
                    Delay(s)
                  </th>
                </tr>
              </thead>
              <tbody>
                {presets?.map((p) => (
                  <tr
                    className={activePreset === p.id ? "bg-success" : ""}
                    onClick={() => setActive(p.id)}
                  >
                    <td className="text-center">{p.watering_time}</td>
                    <td className="text-center">{p.pattern}</td>
                    <td className="text-center">
                      {p.pattern === "step" ? p.steps : "-"}
                    </td>
                    <td className="text-center">
                      {p.pattern === "step" ? p.delay : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Loading..</p>
        )}

        <label className="label">Watering time</label>
        <input
          type="number"
          className="input border px-2"
          placeholder="Watering time"
          min={1}
          value={wateringTime}
          onChange={(e) => setWateringTime(e.target.value)}
          required={true}
        />

        <label className="label">Pattern</label>
        <select
          className="select appearance-none border px-2"
          value={pattern}
          onChange={(e) => setPattern(e.target.value as Pattern)}
          required={true}
        >
          <option value="" disabled>
            Pick one
          </option>
          <option value="continuous">Continuous</option>
          <option value="step">Step</option>
        </select>

        {pattern === "step" && (
          <>
            <label className="label">Steps</label>
            <input
              type="number"
              className="input border px-2"
              placeholder="Number of steps"
              min={1}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              required={true}
            />

            <label className="label">Delay between steps</label>
            <input
              type="number"
              className="input border px-2"
              placeholder="Delay between steps"
              min={1}
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              required={true}
            />
          </>
        )}
        {error && (
          <div className="alert alert-error text-sm py-2 mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <button className="btn btn-success mt-4 w-[20%]" onClick={handleSubmit}>
          Save
        </button>
      </fieldset>
    </div>
  );
};

export default PresetMenu;
