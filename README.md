# Sistema de Gestión para Pastelería "La Soleil"

Proyecto enfocado en la digitalización de procesos de atención, desde la toma de pedidos en sala hasta el control de despachos mediante una interfaz móvil.

## Funcionalidades Principales
- **Gestión de Pedidos:** Registro centralizado para atención en mesa y envíos.
- **Tracking en Tiempo Real:** Simulación de geolocalización para motorizados, mostrando rutas y estados de entrega.
- **Gestión de Estados:** Actualización dinámica entre cocina, despacho y entrega final.
- **Búsqueda Inteligente:** Filtros rápidos por cliente, mesa o ubicación.

## Stack Tecnológico
- **Frontend:** React Native (Hooks, navegación, animaciones de UI).
- **Backend/State:** Context API para manejo de estados globales y persistencia en tiempo real.
- **Simulación:** Lógica propia para cálculo de tiempos de llegada y despacho.

## Instrucciones para levantar el proyecto
1. Instalar dependencias: `npm install`
2. Iniciar el entorno: `npx react-native run-android`