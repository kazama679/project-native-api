import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getProfile, updateProfile, uploadAvatar, User } from '@/services/user';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    website: '',
    bio: '',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res?.data) {
        const user = res.data;
        setProfile({
          fullName: user.fullName || '',
          username: user.username || '',
          website: user.website || '',
          bio: user.bio || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          avatarUrl: user.avatarUrl || '',
        });
      }
    } catch (e: any) {
      console.error('Error loading profile:', e);
      Alert.alert('Lỗi', e?.message || 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setProfile({ ...profile, [key]: value });
  };

  const handleChangeAvatar = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.');
          return;
        }
      }

      // Mở image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Ảnh đại diện thường là hình vuông
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const imageUri = result.assets[0].uri;

      // Upload ảnh lên backend (backend sẽ upload lên Cloudinary)
      setUploadingAvatar(true);
      try {
        const res = await uploadAvatar(imageUri);
        
        if (res?.data?.avatarUrl) {
          // Cập nhật avatarUrl trong state
          setProfile({ ...profile, avatarUrl: res.data.avatarUrl });
          
          Alert.alert('Thành công', 'Đã thay đổi ảnh đại diện thành công');
        } else {
          throw new Error('Không nhận được URL ảnh từ server');
        }
      } catch (uploadError: any) {
        console.error('Error uploading avatar:', uploadError);
        Alert.alert('Lỗi', uploadError?.message || 'Không thể upload ảnh. Vui lòng thử lại.');
      } finally {
        setUploadingAvatar(false);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        fullName: profile.fullName,
        username: profile.username,
        website: profile.website,
        bio: profile.bio,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        avatarUrl: profile.avatarUrl,
      });
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      console.error('Error updating profile:', e);
      Alert.alert('Lỗi', e?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }}>
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#0095f6', fontSize: 16 }}>Hủy</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Chỉnh sửa trang cá nhân</Text>
        
        <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#0095f6" />
            ) : (
              <Text style={{ color: '#0095f6', fontSize: 16 }}>Xong</Text>
            )}
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        {uploadingAvatar ? (
          <View style={{ width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
            <ActivityIndicator size="large" color="#0095f6" />
          </View>
        ) : (
          <Image
            source={{ 
              uri: profile.avatarUrl || 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' 
            }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        )}
        <TouchableOpacity 
          onPress={handleChangeAvatar} 
          disabled={uploadingAvatar}
          style={{ opacity: uploadingAvatar ? 0.5 : 1 }}
        >
          <Text style={{ color: '#0095f6', marginTop: 8 }}>
            {uploadingAvatar ? 'Đang tải ảnh...' : 'Thay đổi ảnh đại diện'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Fields */}
      <View style={{ marginTop: 20 }}>
        {[
          { label: 'Họ tên', key: 'fullName' },
          { label: 'Tên đăng nhập', key: 'username' },
          { label: 'Website', key: 'website' },
          { label: 'Tiểu sử', key: 'bio', multiline: true },
        ].map((item) => (
          <View key={item.key} style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={{ width: 90, fontSize: 16 }}>{item.label}</Text>
            <TextInput
              value={profile[item.key as keyof typeof profile] || ''}
              onChangeText={(text) => handleChange(item.key, text)}
              style={{
                flex: 1,
                borderBottomWidth: 0.5,
                borderColor: '#ddd',
                paddingVertical: 2,
                fontSize: 16,
              }}
              multiline={item.multiline}
              placeholder={item.label}
            />
          </View>
        ))}
      </View>

      {/* Private Information */}
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Thông tin riêng tư</Text>

        {[
          { label: 'Email', key: 'email', keyboardType: 'email-address' },
          { label: 'Số điện thoại', key: 'phoneNumber', keyboardType: 'phone-pad' },
        ].map((item) => (
          <View key={item.key} style={{ flexDirection: 'row', paddingVertical: 10 }}>
            <Text style={{ width: 90, fontSize: 16 }}>{item.label}</Text>
            <TextInput
              value={profile[item.key as keyof typeof profile] || ''}
              onChangeText={(text) => handleChange(item.key, text)}
              style={{
                flex: 1,
                borderBottomWidth: 0.5,
                borderColor: '#ddd',
                paddingVertical: 2,
                fontSize: 16,
              }}
              keyboardType={item.keyboardType}
              autoCapitalize="none"
              placeholder={item.label}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
