export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: AuthUser;
}

export interface Vehicle {
  id: string;
  vehicleName: string;
  licensePlate: string | null;
  createdAt: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  serviceDate: string;
  odometer: number;
  partsReplaced: string | null;
  totalCost: number | null;
  receiptImageUrl: string | null;
  notes: string | null;
  createdAt: string;
}
