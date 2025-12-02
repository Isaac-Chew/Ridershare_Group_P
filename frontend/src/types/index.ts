export interface Rider {
  RiderID: number;
  FirstName: string;
  LastName: string;
  DateOfBirth: string; // ISO date string
  signup_date: string; // ISO date string
  rider_status: 'Active' | 'Inactive';
  PhoneNumber: string | null;
  Email: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  LocationStatus: 'on' | 'off';
  AccountStatus: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface RiderFormData {
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  signup_date: string;
  rider_status: 'Active' | 'Inactive';
  PhoneNumber: string;
  Email: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  LocationStatus: 'on' | 'off';
}

export interface Driver {
  DriverID: number;
  FirstName: string;
  LastName: string;
  DateOfBirth: string; // ISO date string
  PhoneNumber: string | null;
  Email: string;
  StreetAddress: string | null;
  City: string | null;
  State: string | null;
  ZipCode: string | null;
  Status: string | null;
  LicenseNumber: string | null;
  InsuranceID: number | null;
  BankID: number | null;
  VehicleID: number | null;
  VehicleColor: string | null;
  VehicleMake: string | null;
  VehicleModel: string | null;
  VehicleLicensePlate: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverFormData {
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  PhoneNumber: string;
  Email: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Status: string;
  LicenseNumber: string;
  InsuranceID: string;
  BankID: string;
  VehicleID: string;
  VehicleColor: string;
  VehicleMake: string;
  VehicleModel: string;
  VehicleLicensePlate: string;
}

