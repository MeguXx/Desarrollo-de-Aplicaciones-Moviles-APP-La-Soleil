import React, {useMemo, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {TipoAtencion, EstadoPedido} from '../../domain/models/Pedido';
import {usePedido} from '../../infrastructure/PedidoContext';

const COLORS = { chocolate: '#412C27', crema: '#FFFAF2', caramelo: '#D9A05B', moca: '#A67B5B', fresa: '#E68A8C', blanco: '#FFFFFF', vainilla: '#E3C9B3', rojo: '#C85A5A', gris: '#A0A0A0' };

const tipoAtencionOptions: TipoAtencion[] = ['MESA', 'PARA_LLEVAR', 'DELIVERY', 'EVENTO'];
const estadoOptions: EstadoPedido[] = ['PENDIENTE', 'EN_COCINA', 'EN_CAMINO', 'ENTREGADO'];
const staffOptions = ['Chocola', 'Vanilla', 'Azuki', 'Coconut', 'Maple', 'Cinnamon', 'Fraise'];

const menuPostres = ['Chocolate Cake', 'Strawberry Shortcake', 'Tarta de Frutas', 'Macarons', 'Cupcakes', 'Croissant Clásico', 'Parfait de Vainilla'];
const menuBebidas = ['Café Americano', 'Latte Macchiato', 'Matcha Frappé', 'Té Darjeeling', 'Limonada Francesa'];
const mesas = Array.from({length: 12}, (_, i) => (i + 1).toString()); 

export default function FormularioPedidoScreen({route, navigation}: {route: any; navigation: any}) {
  const {pedido} = route.params ?? {};
  const {pedidos, agregarPedido, actualizarPedido, eliminarPedido} = usePedido();

  // Si el pedido existe y ya fue entregado, es de Solo Lectura
  const isReadOnly = pedido?.estado === 'ENTREGADO';
  const isEditing = useMemo(() => Boolean(pedido), [pedido]);

  const [form, setForm] = useState({
    tipoAtencion: pedido?.tipoAtencion || 'MESA',
    clienteNombre: pedido?.clienteNombre || '',
    telefono: pedido?.telefono || '',
    numeroMesa: pedido?.numeroMesa || '', 
    direccionEntrega: pedido?.direccionEntrega || '',
    metodoEntregaEvento: pedido?.metodoEntregaEvento || 'RECOJO',
    personalServicio: pedido?.personalServicio || '', 
    postre: pedido?.postre || '', 
    descripcion: pedido?.descripcion || '',
    prioridad: pedido?.prioridad || 'NORMAL',
    estado: pedido?.estado || 'PENDIENTE',
  });

  const isEnvio = form.tipoAtencion === 'DELIVERY' || form.tipoAtencion === 'EVENTO';
  const staffEnRuta = pedidos.filter(p => p.estado === 'EN_CAMINO').map(p => p.personalServicio);

  const handleSave = () => {
    if (form.tipoAtencion === 'MESA' && !form.numeroMesa) return Alert.alert('Error', 'Selecciona el número de mesa.');
    if (form.tipoAtencion !== 'MESA' && !form.clienteNombre.trim()) return Alert.alert('Error', 'El nombre del cliente es obligatorio.');
    if (form.tipoAtencion === 'DELIVERY' && !form.direccionEntrega.trim()) return Alert.alert('Error', 'Ingresa la dirección para el Delivery.');
    if (!form.personalServicio) return Alert.alert('Error', 'Selecciona quién atendió el pedido.');
    if (!form.postre) return Alert.alert('Error', 'Selecciona al menos un ítem del menú.');

    if (isEditing) actualizarPedido({...pedido, ...form});
    else agregarPedido(form as any);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Borrar este pedido?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Eliminar', style: 'destructive', onPress: () => { eliminarPedido(pedido.id); navigation.goBack(); }}
    ]);
  };

  const updateField = (field: string, value: any) => {
    if (!isReadOnly) setForm(prev => ({...prev, [field]: value}));
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{isReadOnly ? 'Detalles del Historial' : isEditing ? 'Editar pedido' : 'Nuevo pedido'}</Text>

        {isReadOnly && (
          <View style={styles.readOnlyBanner}>
            <Text style={styles.readOnlyText}>Este pedido ya fue entregado y no puede ser modificado.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>1. Detalles de Atención</Text>
        <View style={styles.optionRow}>
          {tipoAtencionOptions.map(opt => (
            <TouchableOpacity key={opt} activeOpacity={isReadOnly ? 1 : 0.2} style={[styles.optionChip, form.tipoAtencion === opt && styles.optionChipSelected, isReadOnly && form.tipoAtencion !== opt && styles.optionChipDisabled]} onPress={() => updateField('tipoAtencion', opt)}>
              <Text style={[form.tipoAtencion === opt ? styles.optionChipTextSelected : styles.optionChipText, isReadOnly && form.tipoAtencion !== opt && styles.textDisabled]}>{opt.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {form.tipoAtencion === 'MESA' ? (
          <View style={styles.optionRow}>
            {mesas.map(mesa => (
              <TouchableOpacity key={mesa} activeOpacity={isReadOnly ? 1 : 0.2} style={[styles.optionChip, form.numeroMesa === mesa && styles.optionChipSelected, isReadOnly && form.numeroMesa !== mesa && styles.optionChipDisabled]} onPress={() => updateField('numeroMesa', mesa)}>
                <Text style={[form.numeroMesa === mesa ? styles.optionChipTextSelected : styles.optionChipText, isReadOnly && form.numeroMesa !== mesa && styles.textDisabled]}>Mesa {mesa}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <TextInput style={[styles.input, isReadOnly && styles.inputDisabled]} editable={!isReadOnly} placeholder="Nombre del Cliente" value={form.clienteNombre} onChangeText={v => updateField('clienteNombre', v)} />
            <TextInput style={[styles.input, isReadOnly && styles.inputDisabled]} editable={!isReadOnly} placeholder="Celular (Ej: 987654321)" value={form.telefono} onChangeText={v => updateField('telefono', v)} keyboardType="phone-pad" maxLength={9} />
          </>
        )}

        {(form.tipoAtencion === 'DELIVERY' || form.tipoAtencion === 'EVENTO') && (
          <TextInput style={[styles.input, isReadOnly && styles.inputDisabled]} editable={!isReadOnly} placeholder="Dirección de entrega..." value={form.direccionEntrega} onChangeText={v => updateField('direccionEntrega', v)} />
        )}

        <Text style={styles.sectionTitle}>2. Personal Asignado</Text>
        <View style={styles.optionRow}>
          {staffOptions.map(opt => {
            const isFraiseRestricted = opt === 'Fraise' && isEnvio;
            const isBusy = staffEnRuta.includes(opt) && opt !== form.personalServicio;
            const disabled = isReadOnly ? (form.personalServicio !== opt) : (isFraiseRestricted || isBusy);

            if (isFraiseRestricted && !isReadOnly) return null; 

            return (
              <TouchableOpacity 
                key={opt} 
                activeOpacity={isReadOnly ? 1 : 0.2}
                disabled={disabled}
                style={[styles.optionChip, form.personalServicio === opt && styles.optionChipSelected, disabled && styles.optionChipDisabled]} 
                onPress={() => updateField('personalServicio', opt)}>
                <Text style={[form.personalServicio === opt ? styles.optionChipTextSelected : styles.optionChipText, disabled && styles.textDisabled]}>
                  {opt} {isBusy && !isReadOnly ? '(En ruta)' : ''}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>3. Menú Solicitado</Text>
        <Text style={styles.subLabel}>Postres Clásicos</Text>
        <View style={styles.optionRow}>
          {menuPostres.map(opt => (
            <TouchableOpacity key={opt} activeOpacity={isReadOnly ? 1 : 0.2} style={[styles.optionChip, form.postre === opt && styles.optionChipSelected, isReadOnly && form.postre !== opt && styles.optionChipDisabled]} onPress={() => updateField('postre', opt)}>
              <Text style={[form.postre === opt ? styles.optionChipTextSelected : styles.optionChipText, isReadOnly && form.postre !== opt && styles.textDisabled]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subLabel}>Bebidas & Café</Text>
        <View style={styles.optionRow}>
          {menuBebidas.map(opt => (
            <TouchableOpacity key={opt} activeOpacity={isReadOnly ? 1 : 0.2} style={[styles.optionChip, form.postre === opt && styles.optionChipSelected, isReadOnly && form.postre !== opt && styles.optionChipDisabled]} onPress={() => updateField('postre', opt)}>
              <Text style={[form.postre === opt ? styles.optionChipTextSelected : styles.optionChipText, isReadOnly && form.postre !== opt && styles.textDisabled]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={[styles.input, styles.textArea, isReadOnly && styles.inputDisabled]} editable={!isReadOnly} placeholder="Pedidos extras / Notas" multiline value={form.descripcion} onChangeText={v => updateField('descripcion', v)} />

        {isEditing && !isReadOnly && (
          <>
            <Text style={styles.sectionTitle}>4. Estado Operativo</Text>
            <View style={styles.optionRow}>
              {estadoOptions.map(opt => (
                <TouchableOpacity key={opt} style={[styles.optionChip, form.estado === opt && styles.optionChipSelected]} onPress={() => updateField('estado', opt)}>
                  <Text style={form.estado === opt ? styles.optionChipTextSelected : styles.optionChipText}>
                    {opt.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {!isReadOnly && (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar Pedido</Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Eliminar Pedido</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.crema },
  headerBar: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: COLORS.crema },
  backButton: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 20 },
  backButtonText: { color: COLORS.chocolate, fontWeight: '800', fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.chocolate, marginBottom: 10 },
  readOnlyBanner: { backgroundColor: '#FADBD8', padding: 12, borderRadius: 8, marginBottom: 20 },
  readOnlyText: { color: COLORS.rojo, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.chocolate, marginBottom: 12, marginTop: 15, borderBottomWidth: 1, borderBottomColor: COLORS.vainilla, paddingBottom: 5 },
  subLabel: { fontSize: 13, fontWeight: '700', color: COLORS.moca, marginBottom: 8 },
  input: { backgroundColor: COLORS.blanco, borderRadius: 12, padding: 14, marginBottom: 15, borderWidth: 1, borderColor: COLORS.vainilla },
  inputDisabled: { backgroundColor: '#F5F5F5', color: COLORS.moca },
  textArea: { height: 80, marginTop: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  optionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.vainilla, marginRight: 8, marginBottom: 8, backgroundColor: COLORS.blanco },
  optionChipSelected: { backgroundColor: COLORS.chocolate, borderColor: COLORS.chocolate },
  optionChipDisabled: { backgroundColor: '#EBEBEB', borderColor: '#D0D0D0' },
  optionChipText: { color: COLORS.moca, fontSize: 13, fontWeight: '700' }, 
  optionChipTextSelected: { color: COLORS.blanco, fontSize: 13, fontWeight: '700' },
  textDisabled: { color: COLORS.gris },
  saveButton: { backgroundColor: COLORS.chocolate, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 25 },
  saveButtonText: { color: COLORS.blanco, fontWeight: '800', fontSize: 16 },
  deleteButton: { backgroundColor: COLORS.rojo, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  deleteButtonText: { color: COLORS.blanco, fontWeight: '800', fontSize: 16 },
});