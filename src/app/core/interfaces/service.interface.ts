export interface Service {
  id: number;
  descripcion: string;
  costo: number;
  estado: string;
  fecha: string;
  kilometraje: string;
  motoId: number;
  motoPlaca: string;
  nombreUsuario?: string;
  usuarioId?: number;
}
