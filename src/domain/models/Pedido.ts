export type TipoAtencion = 'MESA' | 'DELIVERY' | 'EVENTO' | 'PARA_LLEVAR';
export type Prioridad = 'BAJA' | 'NORMAL' | 'ALTA';
export type EstadoPedido = 'PENDIENTE' | 'EN_COCINA' | 'EN_CAMINO' | 'ENTREGADO';

export interface Pedido {
  id: string;
  tipoAtencion: TipoAtencion;
  clienteNombre?: string; 
  telefono?: string;
  numeroMesa?: string;
  direccionEntrega?: string;
  metodoEntregaEvento?: 'RECOJO' | 'ENVIO';
  personalServicio: string;
  postre: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoPedido;
  fechaRegistro: string;
}