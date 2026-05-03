import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth, firestore } from '../services/firebaseConfig';
import { colors } from '../utils/colors';
import { uploadToCloudinary } from '../services/cloudinaryConfig'; // Agora importado corretamente

export default function CompleteProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [nick, setNick] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');
  const [language, setLanguage] = useState('Português');

  const countries = ['Brasil', 'Portugal', 'Angola', 'Moçambique', 'Outro'];

  const handleUploadAvatar = async () => {
    const options = { 
      mediaType: 'photo', 
      quality: 0.7,
      selectionLimit: 1 
    };
    
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;
      
      if (response.assets && response.assets[0]) {
        setUploading(true);
        try {
          const result = await uploadToCloudinary(response.assets[0].uri);
          if (result.success) {
            setAvatarUrl(result.url); // URL segura retornada pelo Cloudinary
          } else {
            Alert.alert('Erro', 'Não foi possível subir a foto: ' + result.error);
          }
        } catch (err) {
          Alert.alert('Erro', 'Erro na conexão com o servidor de imagens.');
        } finally {
          setUploading(false);
        }
      }
    });
  };

  const handleCompleteProfile = async () => {
    if (!nick.trim() || !gender || !country || !age) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("Usuário não autenticado");

      await firestore().collection('users').doc(user.uid).update({
        nick: nick.trim(),
        avatarUrl: avatarUrl,
        gender: gender,
        country: country,
        age: parseInt(age),
        language: language,
        profileCompleted: true,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });

      // Redireciona para a tela principal (Home ou Main)
      navigation.replace('Home'); 
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar seu perfil. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.header}>
          <Icon name="account-circle-outline" size={60} color={colors.primary} />
          <Text style={styles.title}>Crie sua identidade</Text>
          <Text style={styles.subtitle}>Como os outros verão você no Follow</Text>
        </View>

        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={handleUploadAvatar} 
          disabled={uploading}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="camera-plus" size={36} color={colors.textSecondary} />
              <Text style={styles.avatarText}>Foto de Perfil</Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Icon name="pencil" size={16} color="#fff" />
          </View>
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apelido</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Gabriel_Dev" 
            placeholderTextColor={colors.textSecondary} 
            value={nick} 
            onChangeText={setNick} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gênero</Text>
          <View style={styles.genderRow}>
            {['Masculino', 'Feminino'].map((g) => (
              <TouchableOpacity 
                key={g}
                style={[styles.genderButton, gender === g && styles.genderActive]} 
                onPress={() => setGender(g)}
              >
                <Icon 
                  name={g === 'Masculino' ? 'gender-male' : 'gender-female'} 
                  size={24} 
                  color={gender === g ? '#fff' : colors.primary} 
                />
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                  {g === 'Masculino' ? 'Homem' : 'Mulher'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Idade</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Sua idade" 
            placeholderTextColor={colors.textSecondary} 
            value={age} 
            onChangeText={setAge} 
            keyboardType="numeric" 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>País</Text>
          <View style={styles.chipsContainer}>
            {countries.map(c => (
              <TouchableOpacity 
                key={c} 
                style={[styles.chip, country === c && styles.chipActive]} 
                onPress={() => setCountry(c)}
              >
                <Text style={[styles.chipText, country === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, (loading || uploading) && styles.buttonDisabled]} 
          onPress={handleCompleteProfile} 
          disabled={loading || uploading}
        >
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.buttonGradient}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>CONCLUIR PERFIL</Text>}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 25, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { color: colors.text, fontSize: 26, fontWeight: 'bold', marginTop: 10 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 5 },
  avatarContainer: { alignItems: 'center', marginBottom: 30, alignSelf: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: colors.primary },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' },
  avatarText: { color: colors.textSecondary, fontSize: 12, marginTop: 5 },
  avatarBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: colors.secondary, width: 35, height: 35, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.background },
  uploadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 10, marginLeft: 5 },
  input: { backgroundColor: colors.card, borderRadius: 15, padding: 15, color: colors.text, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  section: { marginBottom: 25 },
  genderRow: { flexDirection: 'row', gap: 15 },
  genderButton: { flex: 1, backgroundColor: colors.card, borderRadius: 15, padding: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  genderActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { color: colors.textSecondary, fontSize: 15, fontWeight: 'bold' },
  genderTextActive: { color: '#fff' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: colors.card, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { color: colors.textSecondary, fontSize: 14 },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  button: { borderRadius: 15, overflow: 'hidden', marginTop: 20 },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { paddingVertical: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
