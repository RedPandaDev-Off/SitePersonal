export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
