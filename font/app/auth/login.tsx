import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { login as loginApi } from '@/services/auth';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    setSubmitting(true);
    try {
      const res = await loginApi({ username, password });
      console.log('Login response:', JSON.stringify(res, null, 2));
      
      // Kiểm tra nhiều cách response có thể trả về
      // Backend trả về "response" thay vì "data"
      const token = res?.response?.token || res?.data?.token || res?.token || res?.data?.data?.token;
      
      if (token) {
        router.replace('/(tabs)/home');
      } else {
        console.error('Token không tìm thấy trong response:', res);
        Alert.alert('Lỗi', `Không nhận được token. Response: ${JSON.stringify(res)}`);
      }
    } catch (e: any) {
      console.error('Login error:', e);
      Alert.alert('Đăng nhập thất bại', e?.message || 'Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Instagram */}
      <Text style={styles.logo}>Instagram</Text>

      {/* Ô nhập Username */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {/* Ô nhập Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Nút đăng nhập */}
      <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Log in</Text>}
      </TouchableOpacity>

      {/* Đổi tài khoản */}
      <TouchableOpacity>
        <Text style={styles.switchAccount}>Switch accounts</Text>
      </TouchableOpacity>

      {/* Dòng tạo tài khoản */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account? </Text>
        <Text style={styles.signUp} onPress={() => router.replace('/auth/register')}>Sign up.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: '600',
    fontFamily: 'Billabong', // font giống Instagram (có thể cần custom font)
    marginBottom: 40,
  },
  input: {
    width: '90%',
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#3797EF',
    paddingVertical: 12,
    width: '90%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  switchAccount: {
    color: '#3797EF',
    fontSize: 14,
    marginBottom: 50,
  },
  footer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: '#666',
  },
  signUp: {
    color: '#000',
    fontWeight: '600',
  },
});