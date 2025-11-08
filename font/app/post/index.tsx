import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function Post() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUp = async () => {
    try {
      setLoading(true);
      
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        // Navigate to titlePost with imageUri
        router.push({
          pathname: '/post/titlePost',
          params: { imageUri },
        });
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <ImageBackground
      source={{ uri: 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' }}
      style={styles.container}
    >
      {/* khung overlay camera */}
      <View style={styles.overlay}>

        {/* các nút điều khiển phía dưới */}
        <View style={styles.bottomContainer}>

          {/* icon bên trái: gallery */}
          <TouchableOpacity onPress={handleUp} disabled={loading}>
            {loading ? (
              <Text style={{ color: '#fff', fontSize: 20 }}>...</Text>
            ) : (
              <Ionicons name="images-outline" size={28} color="#fff" />
            )}
          </TouchableOpacity>

          {/* nút chụp ảnh */}
          <View style={styles.captureButton}>
            <View style={styles.innerCircle} />
          </View>

          {/* icon bên phải: đổi camera */}
          <TouchableOpacity>
            <MaterialCommunityIcons name="camera-switch-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* thanh chế độ chụp */}
        <View style={styles.modeBar}>
          {['type', 'live', 'normal', 'boomerang', 'superzoom'].map((mode, i) => (
            <Text
              key={i}
              style={[
                styles.modeText,
                mode === 'normal' && styles.activeMode
              ]}
            >
              {mode.toUpperCase()}
            </Text>
          ))}
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  modeBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modeText: {
    color: '#999',
    fontSize: 13,
    marginHorizontal: 8,
    letterSpacing: 0.5,
  },
  activeMode: {
    color: '#fff',
    fontWeight: '600',
  },
})