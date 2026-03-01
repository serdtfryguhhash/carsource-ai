export interface Vehicle {
  id: string;
  slug: string;
  make: string;
  model: string;
  generation: string;
  years: string;
  engine_code: string;
  stock_hp: number;
  stock_torque: number;
  stock_weight: number;
  drivetrain: string;
  transmission: string;
  fuel_type: string;
  body_style: string;
  category: VehicleCategory;
  image_url: string;
  description: string;
  mod_potential: "Low" | "Medium" | "High" | "Extreme";
  community_rating: number;
}

export interface ModPart {
  id: string;
  slug: string;
  name: string;
  brand: string;
  part_number: string;
  category: ModCategory;
  subcategory: string;
  price: number;
  image_url: string;
  description: string;

  // PERFORMANCE GAINS - the key feature
  hp_gain: number;
  torque_gain: number;
  weight_change: number; // negative = lighter

  // Additional stats
  sound_level: "Stock" | "Mild" | "Moderate" | "Loud" | "Very Loud" | "Race";
  fuel_economy_impact: string;

  // Compatibility
  compatible_vehicles: string[]; // vehicle slugs

  // Install info
  difficulty: "Bolt-On" | "Moderate" | "Advanced" | "Professional Only";
  install_time: string;
  requires_tune: boolean;
  additional_parts_needed: string[];
  warranty_impact: string;

  // Social
  rating: number;
  review_count: number;

  // Links
  buy_url: string;

  // Tags
  features: string[];
  is_popular: boolean;
}

export type VehicleCategory =
  | "JDM"
  | "Muscle"
  | "European"
  | "Truck"
  | "SUV"
  | "Sports"
  | "Domestic";

export type ModCategory =
  | "Engine"
  | "Exhaust"
  | "Turbo & Supercharger"
  | "Intake"
  | "Suspension"
  | "Wheels & Tires"
  | "Brakes"
  | "Exterior"
  | "Interior"
  | "Lighting"
  | "Audio"
  | "ECU & Tuning"
  | "Drivetrain"
  | "Cooling"
  | "Fuel System";

export interface ModBuild {
  vehicle: Vehicle;
  selectedParts: ModPart[];
  totalHpGain: number;
  totalTorqueGain: number;
  totalWeightChange: number;
  totalCost: number;
  estimatedHp: number;
  estimatedTorque: number;
  estimatedWeight: number;
}
