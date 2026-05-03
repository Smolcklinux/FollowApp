import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../utils/colors';
import { auth, firestore } from '../services/firebaseConfig'; // Usando sua config criada

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login com Firebase
        await auth().signInWithEmailAndPassword(email.trim(), password);
      } else {
        // Cadastro no Firebase Auth
        const userCredential = await auth().createUserWithEmailAndPassword(email.trim(), password);
        const user = userCredential.user;

        // Criando o perfil inicial no Firestore para o Follow
        await firestore().collection('users').doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          nick: email.split('@')[0],
          profileCompleted: false,
          createdAt: firestore.FieldValue.serverTimestamp(),
          status: 'online'
        });

        Alert.alert('Sucesso!', 'Conta criada com sucesso.');
      }
    } catch (error) {
      let errorMessage = 'Ocorreu um erro na autenticação.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Este e-mail já está em uso.';
      if (error.code === 'auth/wrong-password') errorMessage = 'Senha incorreta.';
      if (error.code === 'auth/user-not-found') errorMessage = 'Usuário não encontrado.';
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.logoCircle}>
            <Icon name="account-voice" size={45} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>FOLLOW</Text>
          <Text style={styles.tagline}>Conecte-se por voz</Text>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor={colors.textSecondary} 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address"
          />
          
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="Senha" 
              placeholderTextColor={colors.textSecondary} 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {!isLogin && (
            <TextInput 
              style={styles.input} 
              placeholder="Confirmar senha" 
              placeholderTextColor={colors.textSecondary} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              secureTextEntry 
            />
          )}
          
          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.buttonGradient}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{isLogin ? 'ENTRAR' : 'CADASTRAR'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              {isLogin ? 'Não tem uma conta? ' : 'Já possui conta? '}
              <Text style={{ fontWeight: 'bold', color: colors.primary }}>
                {isLogin ? 'Cadastre-se' : 'Faça Login'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  logoSection: { alignItems: 'center', marginBottom: 30 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5 },
  appName: { color: colors.text, fontSize: 32, fontWeight: 'bold', letterSpacing: 3 },
  tagline: { color: colors.textSecondary, fontSize: 13, marginTop: 5 },
  card: { backgroundColor: colors.card, borderRadius: 30, padding: 25, elevation: 10, shadowColor: colors.primary, shadowOpacity: 0.1 },
  cardTitle: { color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, padding: 15, color: colors.text, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  passwordInput: { flex: 1, color: colors.text, paddingVertical: 15 },
  button: { borderRadius: 15, overflow: 'hidden', marginTop: 10 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  switchBtn: { marginTop: 20 },
  switchText: { color: colors.textSecondary, textAlign: 'center', fontSize: 14 },
});
