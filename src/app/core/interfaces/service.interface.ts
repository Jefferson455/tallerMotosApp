export interface Service {
  id: number;
  descripcion: string;
  precio: number;
  motoId: number;
  motoPlaca: string;
  usuarioId?: number;
  usuarioNombre?: string;
}
