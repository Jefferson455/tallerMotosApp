import { Bike } from "./bike.interface";

export interface Customer {
  id: number;
  nombre: string;
  telefono: string;
  cantidadMotos?: number;
  documento: string;
  correo?: string;
  tipoDocumento?: number;
  tipoDocumentoCodigo?: string;
  tipoDocumentoNombre?: string;
  motos?: Bike[];
}
