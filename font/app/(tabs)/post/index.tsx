import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function Post() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cameraType, setCameraType] = useState<ImagePicker.CameraType>(ImagePicker.CameraType.back);

  const navigateToTitlePost = useCallback(
    (imageUri: string) => {
      router.push({
        pathname: '/(tabs)/post/titlePost',
        params: { imageUri },
      });
    },
    [router]
  );

  const handleUp = async () => {
    try {
      setLoading(true);
      
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.');
          setLoading(false);
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
        navigateToTitlePost(imageUri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    try {
      setLoading(true);

      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập camera để chụp ảnh.');
          setLoading(false);
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        cameraType,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        navigateToTitlePost(imageUri);
      }
    } catch (error: any) {
      console.error('Error capturing image:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCamera = useCallback(() => {
    setCameraType((prev) =>
      prev === ImagePicker.CameraType.back ? ImagePicker.CameraType.front : ImagePicker.CameraType.back
    );
  }, []);

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
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="images-outline" size={28} color="#fff" />
            )}
          </TouchableOpacity>

          {/* nút chụp ảnh */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.captureButton, loading && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={loading}
          >
            <View style={[styles.innerCircle, loading && styles.innerCircleDisabled]} />
          </TouchableOpacity>

          {/* icon bên phải: đổi camera */}
          <TouchableOpacity onPress={handleToggleCamera} disabled={loading}>
            <MaterialCommunityIcons
              name="camera-switch-outline"
              size={32}
              color={loading ? 'rgba(255,255,255,0.5)' : '#fff'}
            />
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
  captureButtonDisabled: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  innerCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
  innerCircleDisabled: {
    backgroundColor: 'rgba(255,255,255,0.6)',
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