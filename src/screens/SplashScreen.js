import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../utils/colors';

export default function SplashScreen({ navigation }) {
  // Animações de entrada
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    // Inicia as animações em paralelo
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 1000, 
        useNativeDriver: true 
      }),
      Animated.spring(scaleAnim, { 
        toValue: 1, 
        friction: 4, 
        tension: 50, 
        useNativeDriver: true 
      }),
    ]).start();

    // Redireciona para a tela de Login (Auth) após 2.5 segundos
    setTimeout(() => {
      navigation.replace('Login'); // Ajuste o nome conforme sua navegação
    }, 2500);
  }, []);

  return (
    <LinearGradient 
      colors={[colors.background, '#000000']} 
      style={styles.container}
    >
      <StatusBar hidden />
      
      <Animated.View 
        style={[
          styles.logoContainer, 
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Círculo do Logo com Gradiente */}
        <LinearGradient 
          colors={[colors.primary, colors.secondary]} 
          style={styles.logoCircle}
        >
          {/* Ícone de fone/microfone que representa as salas de voz */}
          <Icon name="account-voice" size={70} color="#fff" />
        </LinearGradient>

        <Text style={styles.title}>FOLLOW</Text>
        
        <View style={styles.taglineRow}>
          <View style={styles.line} />
          <Text style={styles.subtitle}>AMIZADE & CASAL</Text>
          <View style={styles.line} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoContainer: { 
    alignItems: 'center' 
  },
  logoCircle: { 
    width: 130, 
    height: 130, 
    borderRadius: 65, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    elevation: 10, // Sombra no Android
  },
  title: { 
    color: colors.text, 
    fontSize: 35, 
    fontWeight: 'bold', 
    letterSpacing: 5,
    fontFamily: 'sans-serif-medium' 
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  line: {
    width: 30,
    height: 1,
    backgroundColor: colors.primary,
    marginHorizontal: 10
  },
  subtitle: { 
    color: colors.textSecondary, 
    fontSize: 12, 
    fontWeight: '600',
    textTransform: 'uppercase'
  },
});
