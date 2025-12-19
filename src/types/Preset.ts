export type Preset =
  | {
      watering_time: number | null;
      pattern: "step";
      steps: number;
      delay: number;
    }
  | {
      watering_time: number | null;
      pattern: "continuous";
    };
