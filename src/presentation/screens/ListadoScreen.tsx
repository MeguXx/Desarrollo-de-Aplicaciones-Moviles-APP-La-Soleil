import React, {useMemo, useState, useEffect, useRef} from 'react';
import {Animated, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import type {Pedido} from '../../domain/models/Pedido';
import {usePedido} from '../../infrastructure/PedidoContext';

const COLORS = { chocolate: '#412C27', crema: '#FFFAF2', caramelo: '#D9A05B', moca: '#A67B5B', fresa: '#E68A8C', blanco: '#FFFFFF', vainilla: '#E3C9B3', azul: '#4A7C82', verde: '#5B8A5A', gris: '#A0A0A0' };

function getEstadoColor(estado: Pedido['estado']) {
  switch (estado) {
    case 'ENTREGADO': return COLORS.moca;
    case 'EN_COCINA': return COLORS.fresa;
    case 'EN_CAMINO': return COLORS.azul;
    default: return COLORS.caramelo;
  }
}

const getDistrito = (direccion: string) => {
  if (!direccion) return '';
  const partes = direccion.split(',');
  return partes.length > 1 ? partes[partes.length - 1].trim() : 'Lima';
};


let activeTabSaved: 'SALA' | 'ENVIOS' | 'HISTORIAL' = 'SALA';

type DeliveryState = { timeLeft: number, status: 'YENDO' | 'ENTREGANDO' | 'VOLVIENDO', maxTime: number };
const activeDeliveries: Record<string, DeliveryState> = {};

export default function ListadoScreen({navigation}: {navigation: any}) {
  const {pedidos, cambiarEstado} = usePedido();
  
  const [activeTab, setActiveTab] = useState(activeTabSaved);
  const [query, setQuery] = useState('');
  const [tick, setTick] = useState(0); 
  const [trackingPedido, setTrackingPedido] = useState<Pedido | null>(null);

  const modalProgress = useRef(new Animated.Value(0)).current;

  const changeTab = (tab: typeof activeTabSaved) => {
    setActiveTab(tab);
    activeTabSaved = tab;
  };


  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;

      Object.keys(activeDeliveries).forEach(id => {
        const d = activeDeliveries[id];
        
        if (d.timeLeft > 0) {
          d.timeLeft -= 1;
          changed = true;
        } else {
          if (d.status === 'YENDO') {
            d.status = 'ENTREGANDO';
            d.timeLeft = 2;
            d.maxTime = 2;
            changed = true;
          } 
          else if (d.status === 'ENTREGANDO') {
            d.status = 'VOLVIENDO';
            d.timeLeft = 10;
            d.maxTime = 10;
            changed = true;
            cambiarEstado(id, 'ENTREGADO');
          } 
          else if (d.status === 'VOLVIENDO') {
            delete activeDeliveries[id];
            changed = true;
          }
        }
      });

      if (changed) setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Detectar nuevos envíos y agregarlos al reloj
  useEffect(() => {
    pedidos.forEach(p => {
      if (p.estado === 'EN_CAMINO' && !activeDeliveries[p.id]) {
        activeDeliveries[p.id] = { timeLeft: 15, status: 'YENDO', maxTime: 15 };
      }
    });
  }, [pedidos]);

  // Animación del Modal vinculada exactamente a los minutos restantes
  useEffect(() => {
    if (trackingPedido && activeDeliveries[trackingPedido.id]) {
      const d = activeDeliveries[trackingPedido.id];
      let targetVal = 1 - (d.timeLeft / d.maxTime);
      
      if (d.status === 'ENTREGANDO') targetVal = 1; // Se queda en la casa
      if (d.status === 'VOLVIENDO') targetVal = 1 - targetVal; // Se invierte el %

      Animated.timing(modalProgress, {
        toValue: targetVal,
        duration: 1000, // Movimiento fluido de 1 segundo
        useNativeDriver: false
      }).start();
    }
  }, [trackingPedido, tick, modalProgress]);

  // ==========================================
  // LÓGICA DE FILTROS INTELIGENTES
  // ==========================================
  const filteredPedidos = useMemo(() => {
    let result = pedidos;
    
    if (activeTab === 'SALA') {
      result = result.filter(p => p.estado !== 'ENTREGADO' && (p.tipoAtencion === 'MESA' || p.tipoAtencion === 'PARA_LLEVAR'));
    } 
    else if (activeTab === 'ENVIOS') {
      // Muestra pedidos en camino O entregados pero cuya moto sigue retornando
      result = result.filter(p => 
        (p.tipoAtencion === 'DELIVERY' || p.tipoAtencion === 'EVENTO') && 
        (p.estado !== 'ENTREGADO' || activeDeliveries[p.id])
      );
    } 
    else if (activeTab === 'HISTORIAL') {
      // Solo muestra los entregados donde la moto ya llegó a tienda
      result = result.filter(p => p.estado === 'ENTREGADO' && !activeDeliveries[p.id]);
    }

    const normalized = query.trim().toLowerCase();
    if (normalized) {
      result = result.filter(p => 
        (p.clienteNombre && p.clienteNombre.toLowerCase().includes(normalized)) || 
        p.postre.toLowerCase().includes(normalized) ||
        (p.numeroMesa && p.numeroMesa.includes(normalized)) ||
        (p.direccionEntrega && p.direccionEntrega.toLowerCase().includes(normalized))
      );
    }
    return result;
  }, [pedidos, query, activeTab, tick]); // Reacciona al reloj 'tick'

  // ==========================================
  // RENDERIZADO
  // ==========================================
  const renderItem = ({item}: {item: Pedido}) => {
    const title = item.tipoAtencion === 'MESA' ? `Mesa ${item.numeroMesa}` : item.clienteNombre;
    const isEnvio = item.tipoAtencion === 'DELIVERY' || (item.tipoAtencion === 'EVENTO' && item.metodoEntregaEvento === 'ENVIO');
    const deliveryState = activeDeliveries[item.id];
    
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('formulario', {pedido: item})}>
        <View style={styles.cardHeader}>
          <Text style={styles.clientName}>{title} <Text style={styles.tipoAtencion}>({item.tipoAtencion.replace('_', ' ')})</Text></Text>
          {item.telefono && <Text style={styles.phone}>{item.telefono}</Text>}
        </View>
        
        {isEnvio && item.direccionEntrega && (
          <Text style={styles.distritoText}>📍 Destino: <Text style={{fontWeight: '700'}}>{getDistrito(item.direccionEntrega)}</Text></Text>
        )}
        
        <Text style={styles.description}>Atendido por: <Text style={{fontWeight: '700'}}>{item.personalServicio}</Text></Text>
        <Text style={styles.description}>Pedido: {item.postre}</Text>

        {/* Indicador de tiempo sin necesidad de abrir modal */}
        {isEnvio && deliveryState && (
          <Text style={styles.etaCardText}>
            {deliveryState.status === 'YENDO' ? `⏱ Llegando en ${deliveryState.timeLeft} min` : 
             deliveryState.status === 'ENTREGANDO' ? `📦 Entregando pedido...` : 
             `🔁 Retornando (${deliveryState.timeLeft} min)`}
          </Text>
        )}
        
        <View style={styles.chipRow}>
          <View style={[styles.chip, {backgroundColor: getEstadoColor(item.estado)}]}>
            <Text style={styles.chipText}>{item.estado.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</Text>
          </View>
          
          {deliveryState && (
            <TouchableOpacity style={styles.trackButton} onPress={(e) => { e.stopPropagation(); setTrackingPedido(item); }}>
              <Text style={styles.trackButtonText}>📡 Rastreo en vivo</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const gpsLeftPosition = modalProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '85%']
  });

  const getStatusText = () => {
    if (!trackingPedido || !activeDeliveries[trackingPedido.id]) return '';
    const st = activeDeliveries[trackingPedido.id].status;
    if (st === 'YENDO') return '🛵 En camino a entregar pedido...';
    if (st === 'ENTREGANDO') return '📦 En la puerta entregando...';
    return '🔁 Pedido finalizado. Volviendo a tienda...';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos La Soleil</Text>
      
      <View style={styles.tabContainer}>
        {[{ id: 'SALA', label: 'Sala' }, { id: 'ENVIOS', label: 'Envíos en vivo' }, { id: 'HISTORIAL', label: 'Historial' }].map(tab => (
          <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.activeTab]} onPress={() => changeTab(tab.id as any)}>
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput placeholder="Buscar pedido, mesa o distrito..." placeholderTextColor={COLORS.moca} value={query} onChangeText={setQuery} style={styles.searchInput} />
      
      <FlatList
        data={filteredPedidos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay pedidos en esta categoría.</Text>}
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('formulario', {pedido: null})}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL DEL SIMULADOR GPS REFINADO */}
      <Modal visible={!!trackingPedido && !!(trackingPedido && activeDeliveries[trackingPedido.id])} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rastreo de {trackingPedido?.personalServicio}</Text>
            <Text style={styles.modalSubtitle}>Destino: {trackingPedido?.direccionEntrega}</Text>
            
            <View style={styles.statusBox}>
              <Text style={styles.statusBoxText}>{getStatusText()}</Text>
            </View>

            <View style={styles.mapContainer}>
              <View style={styles.routeLine} />
              <Animated.View style={[
                styles.deliveryVehicle, 
                // MAGIA: La moto gira dependiendo si va o vuelve
                { left: gpsLeftPosition, transform: [{ scaleX: activeDeliveries[trackingPedido?.id || '']?.status === 'VOLVIENDO' ? -1 : 1 }] } 
              ]}>
                <Text style={styles.vehicleIcon}>🛵</Text>
              </Animated.View>
              <Text style={styles.storeIcon}>🏪</Text>
              <Text style={styles.destinationIcon}>🏠</Text>
            </View>
            
            <Text style={styles.etaText}>
              {activeDeliveries[trackingPedido?.id || '']?.status === 'ENTREGANDO' 
                ? 'Llegó al destino' 
                : `Tiempo restante: ${activeDeliveries[trackingPedido?.id || '']?.timeLeft || 0} min`}
            </Text>
            
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setTrackingPedido(null)}>
              <Text style={styles.closeModalText}>Cerrar Rastreo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.crema, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.chocolate, marginBottom: 10 },
  tabContainer: { flexDirection: 'row', marginBottom: 15, backgroundColor: COLORS.vainilla, borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: COLORS.chocolate },
  tabText: { color: COLORS.chocolate, fontWeight: '700', fontSize: 13 },
  activeTabText: { color: COLORS.blanco },
  searchInput: { borderWidth: 1, borderColor: COLORS.vainilla, borderRadius: 12, padding: 12, backgroundColor: COLORS.blanco, color: COLORS.chocolate, marginBottom: 10 },
  listContent: { paddingBottom: 90 },
  card: { backgroundColor: COLORS.blanco, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.vainilla, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  clientName: { fontSize: 16, fontWeight: '700', color: COLORS.chocolate },
  tipoAtencion: { fontSize: 12, fontWeight: '500', color: COLORS.moca },
  phone: { color: COLORS.moca, fontSize: 13 },
  distritoText: { fontSize: 13, color: COLORS.azul, marginBottom: 4, fontStyle: 'italic' },
  description: { fontSize: 14, color: COLORS.chocolate, marginBottom: 2 },
  etaCardText: { fontSize: 13, color: COLORS.verde, fontWeight: '800', marginTop: 4, fontStyle: 'italic' },
  chipRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center', justifyContent: 'space-between' },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { color: COLORS.blanco, fontSize: 11, fontWeight: '700' },
  trackButton: { backgroundColor: COLORS.verde, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  trackButtonText: { color: COLORS.blanco, fontSize: 11, fontWeight: '800' },
  emptyText: { textAlign: 'center', color: COLORS.moca, marginTop: 20 },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.chocolate, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { color: COLORS.blanco, fontSize: 30, fontWeight: '300' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.crema, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 300, elevation: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.chocolate, marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: COLORS.moca, marginBottom: 20 },
  statusBox: { backgroundColor: COLORS.vainilla, padding: 10, borderRadius: 8, marginBottom: 20 },
  statusBoxText: { color: COLORS.chocolate, fontWeight: '700', textAlign: 'center' },
  mapContainer: { height: 60, justifyContent: 'center', marginVertical: 10, paddingHorizontal: 10 },
  routeLine: { height: 4, backgroundColor: COLORS.vainilla, width: '100%', position: 'absolute', top: 28, left: 10, borderRadius: 2 },
  storeIcon: { position: 'absolute', left: 0, fontSize: 24, top: 15 },
  destinationIcon: { position: 'absolute', right: 0, fontSize: 24, top: 15 },
  deliveryVehicle: { position: 'absolute', top: 10, zIndex: 10 },
  vehicleIcon: { fontSize: 30 },
  etaText: { textAlign: 'center', color: COLORS.moca, fontWeight: '700', fontSize: 14, marginTop: 10 },
  closeModalButton: { backgroundColor: COLORS.chocolate, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  closeModalText: { color: COLORS.blanco, fontWeight: '800', fontSize: 16 },
});