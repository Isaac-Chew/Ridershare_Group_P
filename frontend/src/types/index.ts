export interface Rider {
  RiderID: number;
  FirstName: string;
  LastName: string;
  DateOfBirth: string; // ISO date string
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
  PhoneNumber: string;
  Email: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  LocationStatus: 'on' | 'off';
}

