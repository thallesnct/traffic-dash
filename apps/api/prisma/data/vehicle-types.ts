export type VehicleTypeSeed = {
  code: string;
  name: string;
};

export const VEHICLE_TYPE_SEEDS = [
  { code: "car", name: "Car" },
  { code: "truck", name: "Truck" },
  { code: "bus", name: "Bus" },
  { code: "motorcycle", name: "Motorcycle" },
  { code: "bicycle", name: "Bicycle" },
  { code: "pedestrian", name: "Pedestrian" },
] satisfies readonly VehicleTypeSeed[];
