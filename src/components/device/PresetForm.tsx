import { useEffect, useState } from "react";
import { post } from "../../services/http.ts";

type FormProps = {
  id: string | undefined;
  onClose: () => void;
};

const PresetForm = ({ id, onClose }: FormProps) => {
  type Pattern = "continuous" | "step" | "";

  const [wateringTime, setWateringTime] = useState("");
  const [pattern, setPattern] = useState<Pattern>("");
  const [steps, setSteps] = useState("");
  const [delay, setDelay] = useState("");

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (pattern !== "step") {
      setSteps("");
      setDelay("");
    }
  }, [pattern]);

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
      onClose();
    }
  };

  if (!id) return;
  return (
    <div className="card">
      <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-xs border p-4 shadow-lg">
        <legend className="fieldset-legend">Presets</legend>

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
        <button className="btn btn-neutral mt-4" onClick={handleSubmit}>
          Save
        </button>
      </fieldset>
    </div>
  );
};

export default PresetForm;
