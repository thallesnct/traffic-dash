export type VehicleTypeSeed = {
  code: string;
  name: string;
  baseline: number;
};

export const VEHICLE_TYPE_SEEDS = [
  { code: "car", name: "Car", baseline: 1200 },
  { code: "truck", name: "Truck", baseline: 300 },
  { code: "bus", name: "Bus", baseline: 80 },
  { code: "motorcycle", name: "Motorcycle", baseline: 220 },
  { code: "bicycle", name: "Bicycle", baseline: 150 },
  { code: "pedestrian", name: "Pedestrian", baseline: 400 },
] satisfies readonly VehicleTypeSeed[];
