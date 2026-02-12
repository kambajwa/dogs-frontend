export interface Dog {
  id: string;
  name: string;
  breed: string;
  supplier: string;
  badgeId: string;
  gender: 'Male' | 'Female';
  birthDate: string;
  dateAcquired: string;
  currentStatus: DogStatus;
  leavingDate?: string | null;
  leavingReason?: LeavingReason | null;
  kennellingCharacteristic?: string | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DogStatus = 'In Training' | 'In Service' | 'Retired' | 'Left';

export type LeavingReason = 
  | 'Transferred'
  | 'Retired (Put Down)'
  | 'KIA'
  | 'Rejected'
  | 'Retired (Re-housed)'
  | 'Died';

export interface DogsResponse {
  data: Dog[];
  page: number;
  size: number;
  total: number;
}

export interface DogFilter {
  name?: string;
  breed?: string;
  supplier?: string;
}

export interface DogQueryParams {
  page?: number;
  size?: number;
  includeDeleted?: boolean;
  filter?: string;
}

export interface EnumsResponse {
  status: DogStatus[];
  leavingReasons: LeavingReason[];
}



