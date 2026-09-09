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

export interface UserPreferences {
  default_landing_page: string;
  remember_last_visited_page: boolean;
  last_visited_page: string;
}

export interface CurrentUserResponse {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  permissions: string[];
}
