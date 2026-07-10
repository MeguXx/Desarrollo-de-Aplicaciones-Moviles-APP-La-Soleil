import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/infrastructure/AuthContext';
import {PedidoProvider} from './src/infrastructure/PedidoContext';
import LoginScreen from './src/presentation/screens/LoginScreen';
import ListadoScreen from './src/presentation/screens/ListadoScreen';
import FormularioPedidoScreen from './src/presentation/screens/FormularioPedidoScreen';

type ScreenName = 'login' | 'listado' | 'formulario';

type Navigation = {
  navigate: (screen: ScreenName, params?: {pedido?: any}) => void;
  goBack: () => void;
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <PedidoProvider>
          <AppContent />
        </PedidoProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const {isAuthenticated} = useAuth();
  const [screen, setScreen] = useState<ScreenName>('login');
  const [formParams, setFormParams] = useState<{pedido?: any}>({});

  useEffect(() => {
    if (isAuthenticated) {
      setScreen('listado');
    } else {
      setScreen('login');
    }
  }, [isAuthenticated]);

  const navigation: Navigation = {
    navigate: (nextScreen, params) => {
      if (nextScreen === 'formulario') {
        setFormParams(params ?? {});
      }
      setScreen(nextScreen);
    },
    goBack: () => {
      setScreen('listado');
      setFormParams({});
    },
  };

  if (!isAuthenticated && screen === 'login') {
    return <LoginScreen />;
  }

  if (screen === 'formulario') {
    return (
      <View style={styles.container}>
        <FormularioPedidoScreen route={{params: formParams}} navigation={navigation} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ListadoScreen navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
