import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Dados extraídos do seu google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyDYFO3LxFR4LvwLB0gBgJlT6tU8nSXh_Rs",
  authDomain: "follow-bc8f1.firebaseapp.com",
  projectId: "follow-bc8f1",
  storageBucket: "follow-bc8f1.firebasestorage.app",
  messagingSenderId: "775650546514",
  appId: "1:775650546514:android:01830f91e5481449d7e08b"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { auth, firestore };
