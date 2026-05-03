import axios from 'axios';

export const CLOUDINARY_CONFIG = {
  cloudName: "dz6aer3tp",
  uploadPreset: "follow_uploads", // Nome do preset que você acabou de criar
  apiBaseUrl: "https://api.cloudinary.com/v1_1/dz6aer3tp/image/upload"
};

export const uploadToCloudinary = async (fileUri) => {
  const formData = new FormData();
  
  // Preparando o arquivo para o upload
  formData.append('file', {
    uri: fileUri,
    type: 'image/jpeg',
    name: `profile_${Date.now()}.jpg`, // Nome dinâmico para evitar conflitos
  });
  
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  try {
    const response = await axios.post(CLOUDINARY_CONFIG.apiBaseUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      success: true,
      url: response.data.secure_url,
    };
  } catch (error) {
    console.error("Erro no Cloudinary:", error);
    return { success: false, error: error.message };
  }
};
