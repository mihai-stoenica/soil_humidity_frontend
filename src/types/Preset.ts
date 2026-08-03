export type Preset =
  | {
      id: number;
      watering_time: number | null;
      name: string | null;
      pattern: "step";
      steps: number;
      delay: number;
    }
  | {
      id: number;
      watering_time: number | null;
      name: string | null;
      pattern: "continuous";
    };
