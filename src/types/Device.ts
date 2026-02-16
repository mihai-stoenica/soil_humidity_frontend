export default interface Device {
  id: number;
  name: string;
  connected: boolean;
  lastSeen: string;
  lastHumidity: number;
  activePreset: number;
  temperature: number;
}
