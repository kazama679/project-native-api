import { FontAwesome } from '@expo/vector-icons'; // nếu dùng Expo
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* Logo Instagram */}
      <Text style={styles.logo}>Instagram</Text>

      {/* Ô nhập Username */}
      <TextInput
        style={styles.input}
        placeholder="Phone number, username, or email"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
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

      {/* Quên mật khẩu */}
      <TouchableOpacity style={styles.forgotContainer}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Nút đăng nhập */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>Log in</Text>
      </TouchableOpacity>

      {/* Nút đăng nhập bằng Facebook */}
      <TouchableOpacity style={styles.facebookButton}>
        <FontAwesome name="facebook-square" size={20} color="#3797EF" />
        <Text style={styles.facebookText}> Log in with Facebook</Text>
      </TouchableOpacity>

      {/* Dòng kẻ OR */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* Footer: tạo tài khoản */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account? </Text>
        <Text style={styles.signUp}>Sign up.</Text>
      </View>

      {/* Dòng nhỏ cuối */}
      <Text style={styles.bottomText}>Instagram or Facebook</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 42,
    fontFamily: 'Billabong',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotText: {
    color: '#3797EF',
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: '#3797EF',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  facebookText: {
    color: '#3797EF',
    fontWeight: '600',
    fontSize: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    color: '#999',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    marginBottom: 60,
  },
  footerText: {
    color: '#999',
  },
  signUp: {
    color: '#000',
    fontWeight: '600',
  },
  bottomText: {
    position: 'absolute',
    bottom: 20,
    color: '#999',
    fontSize: 12,
  },
});