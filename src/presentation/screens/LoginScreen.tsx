import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {useAuth} from '../../infrastructure/AuthContext';

type Mode = 'LOGIN' | 'REGISTER' | 'RECOVER';

export default function LoginScreen() {
  const {login, register, recoverPassword} = useAuth();
  
  const [mode, setMode] = useState<Mode>('LOGIN');
  
  // Estados del formulario
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [terminos, setTerminos] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setCorreo(''); setPassword(''); setConfirmPassword('');
    setNombre(''); setTelefono(''); setDireccion('');
    setTerminos(false); setErrors({});
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    
    if (!correo.trim()) nextErrors.correo = 'El correo es obligatorio';

    if (mode === 'LOGIN') {
      if (!password.trim()) nextErrors.password = 'Ingresa tu contraseña';
    } 
    
    if (mode === 'REGISTER') {
      if (!nombre.trim()) nextErrors.nombre = 'Ingresa tu nombre y apellido';
      if (!telefono.trim()) nextErrors.telefono = 'Ingresa tu celular';
      if (!direccion.trim()) nextErrors.direccion = 'Ingresa tu dirección';
      if (!password.trim()) nextErrors.password = 'Crea una contraseña';
      if (!confirmPassword.trim()) nextErrors.confirmPassword = 'Repite tu contraseña';
      else if (password !== confirmPassword) nextErrors.confirmPassword = 'Las contraseñas no coinciden';
      if (!terminos) nextErrors.terminos = 'Debes aceptar las condiciones';
    }
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (mode === 'LOGIN') {
      const success = login(correo, password);
      if (!success) Alert.alert('Acceso denegado', 'Usuario o contraseña incorrectos.');
    } 
    else if (mode === 'REGISTER') {
      const success = register({
        email: correo,
        password: password,
        nombre: nombre,
        telefono: telefono,
        direccion: direccion
      });
      if (success) {
        Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
        setMode('LOGIN');
        resetForm();
      } else {
        Alert.alert('Error', 'Este correo ya está registrado.');
      }
    } 
    else if (mode === 'RECOVER') {
      const exists = recoverPassword(correo);
      if (exists) {
        Alert.alert('Correo enviado', `Se ha enviado un código de recuperación a ${correo}.`);
        setMode('LOGIN');
        resetForm();
      } else {
        Alert.alert('No encontrado', 'No hay ninguna cuenta asociada a este correo.');
      }
    }
  };

  const changeMode = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  const getTitles = () => {
    if (mode === 'REGISTER') return { title: 'Nuevo Miembro', sub: 'Crea tu cuenta para gestionar pedidos.' };
    if (mode === 'RECOVER') return { title: 'Recuperar Acceso', sub: 'Te enviaremos un código por correo.' };
    return { title: 'Cocina de sueños', sub: 'Inicia sesión para gestionar pedidos.' };
  };

  const { title, sub } = getTitles();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        
        {/* Botón de Volver (Flecha en la esquina) */}
        {mode !== 'LOGIN' && (
          <TouchableOpacity style={styles.backButton} onPress={() => changeMode('LOGIN')}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
          <Text style={styles.eyebrow}>Plataforma La Soleil</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{sub}</Text>

          {mode === 'REGISTER' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombres y Apellidos</Text>
                <TextInput placeholder="Ej: Ricky Estrella" placeholderTextColor="#A89285" value={nombre} onChangeText={t => { setNombre(t); setErrors(c => ({...c, nombre: ''})); }} style={styles.input} />
                {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Celular</Text>
                  <TextInput placeholder="987654321" placeholderTextColor="#A89285" value={telefono} onChangeText={t => { setTelefono(t); setErrors(c => ({...c, telefono: ''})); }} keyboardType="phone-pad" maxLength={9} style={styles.input} />
                  {errors.telefono ? <Text style={styles.errorText}>{errors.telefono}</Text> : null}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Dirección</Text>
                  <TextInput placeholder="Av. Principal 123" placeholderTextColor="#A89285" value={direccion} onChangeText={t => { setDireccion(t); setErrors(c => ({...c, direccion: ''})); }} style={styles.input} />
                  {errors.direccion ? <Text style={styles.errorText}>{errors.direccion}</Text> : null}
                </View>
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{mode === 'LOGIN' ? 'Usuario o Correo' : 'Correo Electrónico'}</Text>
            <TextInput
              placeholder={mode === 'LOGIN' ? "admin o admin@lasoleil.com" : "ejemplo@lasoleil.com"}
              placeholderTextColor="#A89285"
              value={correo}
              onChangeText={t => { setCorreo(t); setErrors(c => ({...c, correo: ''})); }}
              autoCapitalize="none"
              keyboardType={mode === 'LOGIN' ? 'default' : 'email-address'}
              style={styles.input}
            />
            {errors.correo ? <Text style={styles.errorText}>{errors.correo}</Text> : null}
          </View>

          {mode !== 'RECOVER' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder={mode === 'REGISTER' ? "Crea una contraseña segura" : "Ingresa tu contraseña"}
                  placeholderTextColor="#A89285"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(c => ({...c, password: ''})); }}
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>
          )}

          {mode === 'REGISTER' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Repetir Contraseña</Text>
                <TextInput
                  placeholder="Vuelve a escribir tu contraseña"
                  placeholderTextColor="#A89285"
                  value={confirmPassword}
                  onChangeText={t => { setConfirmPassword(t); setErrors(c => ({...c, confirmPassword: ''})); }}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  autoCapitalize="none"
                />
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>

              <TouchableOpacity style={styles.checkboxContainer} onPress={() => { setTerminos(!terminos); setErrors(c => ({...c, terminos: ''})); }}>
                <View style={[styles.checkbox, terminos && styles.checkboxChecked]}>
                  {terminos && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Acepto las condiciones de trato y políticas de privacidad de La Soleil.</Text>
              </TouchableOpacity>
              {errors.terminos ? <Text style={styles.errorText}>{errors.terminos}</Text> : null}
            </>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>
              {mode === 'LOGIN' ? 'Iniciar Sesión' : mode === 'REGISTER' ? 'Crear Cuenta' : 'Enviar Código'}
            </Text>
          </TouchableOpacity>

          {mode === 'LOGIN' && (
            <View style={styles.secondaryActions}>
              <TouchableOpacity onPress={() => changeMode('REGISTER')}><Text style={styles.linkText}>Registrarse</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => changeMode('RECOVER')}><Text style={styles.linkText}>Olvidé mi contraseña</Text></TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#412C27' },
  card: { backgroundColor: '#FFFAF2', borderRadius: 20, padding: 24, elevation: 10, maxHeight: '90%' },
  backButton: { alignSelf: 'flex-start', marginBottom: 15, paddingVertical: 5, paddingRight: 10 },
  backButtonText: { color: '#8B4513', fontWeight: '700', fontSize: 16 },
  eyebrow: { color: '#D9A05B', fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontSize: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#5A2D22', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#8A5F4C', marginBottom: 20, lineHeight: 22 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#5A2D22', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E3C9B3', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', color: '#5A2D22' },
  passwordContainer: { borderWidth: 1, borderColor: '#E3C9B3', borderRadius: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF' },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: '#5A2D22' },
  eyeButton: { paddingHorizontal: 16 },
  eyeText: { fontSize: 14, fontWeight: '700', color: '#8B4513' },
  errorText: { color: '#C85A5A', fontSize: 12, marginTop: 6, fontWeight: '500' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5, paddingRight: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#E3C9B3', borderRadius: 6, marginRight: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  checkboxChecked: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 13, color: '#8A5F4C', flexShrink: 1 },
  primaryButton: { backgroundColor: '#8B4513', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  secondaryActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  linkText: { color: '#A67B5B', fontWeight: '600', fontSize: 14 },
});