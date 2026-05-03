import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen'; // Novo Import

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Splash" 
      screenOptions={{ headerShown: false }}
    >
      {/* 1. Tela de Carregamento */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      
      {/* 2. Tela de Login/Cadastro */}
      <Stack.Screen name="Login" component={AuthScreen} />
      
      {/* 3. Tela de Configuração de Perfil (Cloudinary + Firestore) */}
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
}
