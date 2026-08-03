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

  const [name, setName] = useState("");
  const [wateringTime, setWateringTime] = useState("");
  const [pattern, setPattern] = useState<Pattern>("");
  const [steps, setSteps] = useState("");
  const [delay, setDelay] = useState("");
  const [presets, setPresets] = useState<Preset[]>();

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
      await onSave();
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
    if (!wateringTime || !pattern || !name) return;

    const preset =
      pattern === "step"
        ? {
            pattern: "step" as const,
            watering_time: Number(wateringTime),
            name: name,
            steps: Number(steps),
            delay: Number(delay),
          }
        : {
            pattern: "continuous" as const,
            name: name,
            watering_time: Number(wateringTime),
          };
    const response = await post(`${apiUrl}/presets/${id}`, preset);
    if (!response.isError) {
      fetchPresets();
      onSave();
    }
  };

  if (!id) return;
  return (
    <div className="card ">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4 shadow-lg flex flex-col items-center">
        <legend className="fieldset-legend">Presets</legend>

        {presets ? (
          <div className="overflow-x-auto">
            <table className="table table-compact w-full border">
              <thead>
                <tr>
                  <th className="text-center truncate max-w-20">Name</th>
                  <th className="text-center truncate max-w-20">Time(s)</th>
                  <th className="text-center truncate max-w-20">Pattern</th>
                  <th className="text-center truncate max-w-20">Steps</th>
                  <th className="text-center truncate max-w-20">Delay(s)</th>
                </tr>
              </thead>
              <tbody>
                {presets?.map((p) => (
                  <tr
                    className={activePreset === p.id ? "bg-success" : ""}
                    onClick={() => setActive(p.id)}
                  >
                    <td className="text-center">{p.name}</td>
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

        <label className="label">Name</label>
        <input
          type="text"
          className="input border px-2"
          placeholder="Name"
          required={true}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="label">Watering time</label>
        <input
          type="number"
          className="input border px-2"
          placeholder="Watering time"
          min={1}
          value={wateringTime}
          onChange={(e) => setWateringTime(e.target.value)}
        />

        <label className="label">Pattern</label>
        <select
          className="select appearance-none border px-2"
          value={pattern}
          onChange={(e) => setPattern(e.target.value as Pattern)}
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
            />

            <label className="label">Delay between steps</label>
            <input
              type="number"
              className="input border px-2"
              placeholder="Delay between steps"
              min={1}
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
            />
          </>
        )}
        <button className="btn btn-success mt-4 w-[20%]" onClick={handleSubmit}>
          Save
        </button>
      </fieldset>
    </div>
  );
};

export default PresetMenu;
