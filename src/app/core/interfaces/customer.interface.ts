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

export interface updateCustomerRequest {
  nombre: string;
  telefono: string;
  correo: string;
  documento: string;
}

export interface UsuarioStorage {
  id: number;
  nombre: string;
  username: string;
  rolId: number;
}

