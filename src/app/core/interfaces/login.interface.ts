export interface Login {
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  rolId: number;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
