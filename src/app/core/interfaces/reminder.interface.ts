export interface Reminder {
  id: number;
  clienteNombre: string;
  telefono: string;
  correo: string;
  motoPlaca: string;
  motoMarca: string;
  motoModelo: string;
  fechaUltimoServicio: string;
  fechaProximaNotificacion: string;
  estado: 'PENDIENTE' | 'ENVIADO';
  fechaEnvio?: string | null;
}
