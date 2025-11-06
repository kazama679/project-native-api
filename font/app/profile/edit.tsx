import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getProfile, updateProfile, User } from '../../services/user';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        <Image
          source={{ 
            uri: profile.avatarUrl || 'https://photo.znews.vn/w660/Uploaded/mdf_eioxrd/2021_07_06/2.jpg' 
          }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <TouchableOpacity>
          <Text style={{ color: '#0095f6', marginTop: 8 }}>Thay đổi ảnh đại diện</Text>
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
