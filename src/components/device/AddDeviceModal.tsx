import { useState } from "react";
import { post } from "../../services/http.ts";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddDeviceModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddDeviceModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await post(`${apiUrl}/devices/claim`, {
        name: formData.name,
        apiKey: formData.apiKey,
      });
      if (!response.isError) {
        setFormData({ name: "", apiKey: "" });
        onSuccess();
        onClose();
      } else {
        setError(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <button
          onClick={() => {
            onClose();
            setError(null);
          }}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        <fieldset className="fieldset  bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">Register a new device</legend>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="alert alert-error text-sm py-2">
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

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Device Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Device key </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full font-mono"
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Usually found on the back of the sensor
                </span>
              </label>
            </div>

            <div className="modal-action mt-6">
              <button
                type="button"
                className="btn btn-error px-2 "
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success px-2"
                disabled={loading}
              >
                Register
              </button>
            </div>
          </form>
        </fieldset>
      </div>

      <div
        className="modal-backdrop"
        onClick={() => {
          onClose();
          setError(null);
        }}
      ></div>
    </div>
  );
};

export default AddDeviceModal;
