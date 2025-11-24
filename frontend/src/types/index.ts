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

