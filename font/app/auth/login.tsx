import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      {/* Logo Instagram */}
      <Text style={styles.logo}>Instagram</Text>

      {/* Ảnh đại diện người dùng */}
      <Image
        source={{ uri: 'https://i.imgur.com/2nCt3Sbl.jpg' }} // thay bằng ảnh thật nếu có
        style={styles.avatar}
      />

      {/* Tên người dùng */}
      <Text style={styles.username}>jacob_w</Text>

      {/* Nút đăng nhập */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>Log in</Text>
      </TouchableOpacity>

      {/* Đổi tài khoản */}
      <TouchableOpacity>
        <Text style={styles.switchAccount}>Switch accounts</Text>
      </TouchableOpacity>

      {/* Dòng tạo tài khoản */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account? </Text>
        <Text style={styles.signUp}>Sign up.</Text>
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
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 15,
  },
  username: {
    fontSize: 16,
    color: '#000',
    marginBottom: 25,
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