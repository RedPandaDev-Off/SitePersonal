export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  getAuthHeaders: () => { Authorization: string } | {};
}
