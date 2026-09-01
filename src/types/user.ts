export interface UserInfo {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  permissions: string[];
}

export interface UsersListResponse {
  results: UserInfo[];
  count: number;
  next: string | null;
  previous: string | null;
}
