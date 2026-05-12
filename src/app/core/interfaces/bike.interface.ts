export interface Bike {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  clienteId?: number;
  nombreCliente?: string;
}

export interface BikeCreateRequest {
  marca: string;
  modelo: string;
  placa: string;
  clienteId: number;
}

export interface BikeUpdateRequest {
  marca: string;
  modelo: string;
  placa: string;
}
