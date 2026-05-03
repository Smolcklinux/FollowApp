import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl, ActivityIndicator, FlatList,
  TextInput, Modal, Dimensions, Animated, Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Importamos os serviços que conectam ao seu Firebase
import { firestore } from '../services/firebaseConfig';
import { colors } from '../utils/colors';

const { width } = Dimensions.get('window');

export default function PopularScreen({ navigation }) {
  const [popularRooms, setPopularRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTopTab, setActiveTopTab] = useState('popular');
  
  // Estados de Busca
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState({ rooms: [], users: [] });
  const [searching, setSearching] = useState(false);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Banners de Eventos do Follow
  const banners = [
    { id: 1, title: '🎤 Noite de Talentos', subtitle: 'Mostre sua voz hoje!', color: [colors.primary, colors.secondary], icon: 'microphone' },
    { id: 2, title: '🏆 Top Rankings', subtitle: 'Veja quem dominou a semana', color: ['#4facfe', '#00f2fe'], icon: 'trophy' },
  ];

  useEffect(() => {
    loadRooms();
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const loadRooms = async () => {
    try {
      // Busca as salas ativas no seu Firestore
      const snapshot = await firestore()
        .collection('rooms')
        .orderBy('popularity', 'desc')
        .limit(20)
        .get();

      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPopularRooms(roomsData);
    } catch (error) {
      console.log("Erro ao carregar salas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setSearching(true);
    // Aqui faremos a busca no Firestore por nick de usuário ou nome de sala
    // Por enquanto simulamos para o layout
    setSearching(false);
  };

  const renderRoomCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.roomCard} 
      onPress={() => navigation.navigate('Room', { roomId: item.id })}
    >
      <View style={styles.roomAvatarContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.roomAvatar} />
        ) : (
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.roomAvatarGradient}>
            <Icon name="account-group" size={30} color="#fff" />
          </LinearGradient>
        )}
        <View style={styles.onlineBadge}>
          <Text style={styles.onlineText}>{item.onlineCount || 0}</Text>
        </View>
      </View>

      <View style={styles.roomInfo}>
        <Text style={styles.roomName} numberOfLines={1}>{item.name || 'Sala de Voz'}</Text>
        <Text style={styles.roomOwner}>{item.ownerNick || 'Usuário Follow'}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}><Text style={styles.tagText}>Voz</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>Amizade</Text></View>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={[colors.background, '#000']} style={styles.container}>
      {/* Header Fixo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>FOLLOW</Text>
          <Text style={styles.headerSubtitle}>Conectando vozes</Text>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={() => setSearchModalVisible(true)}>
          <Icon name="magnify" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Menu Superior de Abas */}
      <View style={styles.topMenu}>
        {['Popular', 'Novos', 'Amigos'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTopTab(tab.toLowerCase())}
            style={[styles.menuItem, activeTopTab === tab.toLowerCase() && styles.activeMenuItem]}
          >
            <Text style={[styles.menuText, activeTopTab === tab.toLowerCase() && styles.activeMenuText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadRooms} tintColor={colors.primary} />}
      >
        {/* Carrossel de Banners */}
        <FlatList
          data={banners}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, marginVertical: 15 }}
          renderItem={({ item }) => (
            <LinearGradient colors={item.color} style={styles.bannerCard}>
              <Icon name={item.icon} size={40} color="#fff" style={{ opacity: 0.5, position: 'absolute', right: 10, bottom: 10 }} />
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            </LinearGradient>
          )}
        />

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Salas em Destaque</Text>
          <Icon name="fire" size={20} color="#FFD700" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.listContainer}>
            {popularRooms.map((room, index) => (
              <View key={room.id}>{renderRoomCard({ item: room, index })}</View>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de Busca Estilizado */}
      <Modal visible={searchModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Buscar amigos ou salas..." 
              placeholderTextColor="#999"
              autoFocus
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
          {/* Resultados da busca apareceriam aqui */}
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 50, paddingBottom: 10 },
  headerTitle: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  headerSubtitle: { color: colors.textSecondary, fontSize: 12 },
  searchButton: { backgroundColor: colors.card, padding: 10, borderRadius: 15 },
  topMenu: { flexDirection: 'row', paddingHorizontal: 25, marginVertical: 10, gap: 20 },
  menuItem: { paddingBottom: 5 },
  activeMenuItem: { borderBottomWidth: 3, borderBottomColor: colors.primary },
  menuText: { color: colors.textSecondary, fontSize: 16, fontWeight: 'bold' },
  activeMenuText: { color: colors.text },
  bannerCard: { width: width * 0.7, height: 100, borderRadius: 20, padding: 20, marginRight: 15, justifyContent: 'center' },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerSubtitle: { color: '#fff', opacity: 0.8, fontSize: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginVertical: 15, gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 20 },
  roomCard: { backgroundColor: colors.card, borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  roomAvatarContainer: { position: 'relative' },
  roomAvatar: { width: 65, height: 65, borderRadius: 25 },
  roomAvatarGradient: { width: 65, height: 65, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  onlineBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#4CAF50', paddingHorizontal: 8, borderRadius: 10, borderWidth: 2, borderColor: colors.card },
  onlineText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  roomInfo: { flex: 1, marginLeft: 15 },
  roomName: { color: colors.text, fontSize: 17, fontWeight: 'bold' },
  roomOwner: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 5, marginTop: 8 },
  tag: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8 },
  tagText: { color: colors.primary, fontSize: 10, fontWeight: 'bold' },
  modalContent: { flex: 1, backgroundColor: colors.background, paddingTop: 50 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 15 },
  searchInput: { flex: 1, backgroundColor: colors.card, borderRadius: 15, padding: 12, color: colors.text }
});
