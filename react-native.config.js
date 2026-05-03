module.exports = {
  dependencies: {
    'react-native-image-picker': {
      platforms: {
        android: null, // Desativa o autolinking nativo que causa o erro de CMake
      },
    },
    'react-native-vector-icons': {
      platforms: {
        android: null, // Desativa o autolinking nativo que causa o erro de CMake
      },
    },
  },
};
