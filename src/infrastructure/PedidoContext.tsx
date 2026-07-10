import React, {createContext, useContext, useReducer, type ReactNode} from 'react';
import type {Pedido, EstadoPedido} from '../domain/models/Pedido';
import {createPedidoDraft, initialPedidos, pedidoReducer} from './pedidoReducer';

type PedidoContextValue = {
  pedidos: Pedido[];
  agregarPedido: (pedido: Omit<Pedido, 'id' | 'fechaRegistro'>) => void;
  actualizarPedido: (pedido: Pedido) => void;
  eliminarPedido: (id: string) => void;
  cambiarEstado: (id: string, estado: EstadoPedido) => void;
};

const PedidoContext = createContext<PedidoContextValue | undefined>(undefined);

export function PedidoProvider({children}: {children: ReactNode}) {
  const [pedidos, dispatch] = useReducer(pedidoReducer, initialPedidos);

  const agregarPedido = (pedido: Omit<Pedido, 'id' | 'fechaRegistro'>) => {
    dispatch({type: 'AGREGAR_PEDIDO', payload: createPedidoDraft(pedido)});
  };

  const actualizarPedido = (pedido: Pedido) => {
    dispatch({type: 'ACTUALIZAR_PEDIDO', payload: pedido});
  };

  const eliminarPedido = (id: string) => {
    dispatch({type: 'ELIMINAR_PEDIDO', payload: id});
  };

  const cambiarEstado = (id: string, estado: EstadoPedido) => {
    dispatch({type: 'CAMBIAR_ESTADO', payload: {id, estado}});
  };

  return (
    <PedidoContext.Provider
      value={{pedidos, agregarPedido, actualizarPedido, eliminarPedido, cambiarEstado}}>
      {children}
    </PedidoContext.Provider>
  );
}

export function usePedido() {
  const context = useContext(PedidoContext);

  if (!context) {
    throw new Error('usePedido must be used within a PedidoProvider');
  }

  return context;
}
