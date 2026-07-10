import type {Pedido, EstadoPedido} from '../domain/models/Pedido';

export type PedidoAction =
  | {type: 'AGREGAR_PEDIDO'; payload: Pedido}
  | {type: 'ACTUALIZAR_PEDIDO'; payload: Pedido}
  | {type: 'ELIMINAR_PEDIDO'; payload: string}
  | {type: 'CAMBIAR_ESTADO'; payload: {id: string; estado: EstadoPedido}};

export function createPedidoDraft(data: Omit<Pedido, 'id' | 'fechaRegistro'>): Pedido {
  return {
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    fechaRegistro: new Date().toISOString(),
  };
}

export function pedidoReducer(state: Pedido[], action: PedidoAction): Pedido[] {
  switch (action.type) {
    case 'AGREGAR_PEDIDO': return [action.payload, ...state];
    case 'ACTUALIZAR_PEDIDO': return state.map(item => (item.id === action.payload.id ? action.payload : item));
    case 'ELIMINAR_PEDIDO': return state.filter(item => item.id !== action.payload);
    case 'CAMBIAR_ESTADO': return state.map(item => item.id === action.payload.id ? {...item, estado: action.payload.estado} : item);
    default: return state;
  }
}

// Historial rico en datos para que no se vea vacío
export const initialPedidos: Pedido[] = [
  // SALÓN Y PARA LLEVAR (En vivo)
  createPedidoDraft({
    tipoAtencion: 'MESA', numeroMesa: '4', personalServicio: 'Chocola',
    postre: 'Strawberry Shortcake', descripcion: 'Con extra fresas',
    prioridad: 'ALTA', estado: 'PENDIENTE',
  }),
  createPedidoDraft({
    tipoAtencion: 'PARA_LLEVAR', clienteNombre: 'Ana Gómez', telefono: '911222333',
    personalServicio: 'Azuki', postre: 'Matcha Frappé', descripcion: 'Leche de almendras, bien frío.',
    prioridad: 'NORMAL', estado: 'EN_COCINA',
  }),
  createPedidoDraft({
    tipoAtencion: 'MESA', numeroMesa: '1', personalServicio: 'Vanilla',
    postre: 'Chocolate Cake', descripcion: 'Dos cucharitas, es para compartir.',
    prioridad: 'NORMAL', estado: 'PENDIENTE',
  }),

  // ENVÍOS (En vivo - Para el simulador GPS)
  createPedidoDraft({
    tipoAtencion: 'DELIVERY', clienteNombre: 'Ricardo Pérez', telefono: '987654321',
    direccionEntrega: 'Av. Larco 123, Miraflores', personalServicio: 'Coconut',
    postre: 'Macarons', descripcion: 'Empaque de regalo.',
    prioridad: 'NORMAL', estado: 'EN_CAMINO',
  }),
  createPedidoDraft({
    tipoAtencion: 'EVENTO', metodoEntregaEvento: 'ENVIO', clienteNombre: 'Corporación Arca', telefono: '999888777',
    direccionEntrega: 'Av. Javier Prado Este 456, San Isidro', personalServicio: 'Maple',
    postre: 'Tarta de Frutas', descripcion: 'Llegar por la puerta posterior.',
    prioridad: 'ALTA', estado: 'EN_CAMINO',
  }),
  createPedidoDraft({
    tipoAtencion: 'DELIVERY', clienteNombre: 'Lucía Fernández', telefono: '933444555',
    direccionEntrega: 'Calle Las Camelias 789, Lince', personalServicio: 'Cinnamon',
    postre: 'Cupcakes', descripcion: 'Dejar en recepción.',
    prioridad: 'NORMAL', estado: 'EN_COCINA',
  }),

  // HISTORIAL (Ya completados)
  createPedidoDraft({
    tipoAtencion: 'MESA', numeroMesa: '12', personalServicio: 'Chocola',
    postre: 'Chocolate Cake', descripcion: 'Mesa de cumpleaños.',
    prioridad: 'NORMAL', estado: 'ENTREGADO',
  }),
  createPedidoDraft({
    tipoAtencion: 'DELIVERY', clienteNombre: 'Marcos Ruiz', telefono: '922111000',
    direccionEntrega: 'Malecón Cisneros 101, Miraflores', personalServicio: 'Vanilla',
    postre: 'Té Darjeeling', descripcion: '',
    prioridad: 'BAJA', estado: 'ENTREGADO',
  }),
  createPedidoDraft({
    tipoAtencion: 'PARA_LLEVAR', clienteNombre: 'Elena Torres', telefono: '966555444',
    personalServicio: 'Azuki', postre: 'Croissant Clásico', descripcion: 'Caliente por favor.',
    prioridad: 'NORMAL', estado: 'ENTREGADO',
  }),
  createPedidoDraft({
    tipoAtencion: 'MESA', numeroMesa: '7', personalServicio: 'Maple',
    postre: 'Parfait de Vainilla', descripcion: 'Sin jalea.',
    prioridad: 'NORMAL', estado: 'ENTREGADO',
  }),
];