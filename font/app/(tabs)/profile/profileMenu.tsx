import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { logout as logoutService } from '@/services/auth';

const { width } = Dimensions.get('window');

type ProfileMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const slideAnim = React.useRef(new Animated.Value(width)).current;
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = React.useCallback(async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await logoutService();
      onClose();
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      Alert.alert('Đăng xuất thất bại', error?.message || 'Vui lòng thử lại');
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, onClose, router]);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}
        >
          <View style={styles.header}>
            <Text style={styles.username}>s.khasanov_</Text>
          </View>

          <View style={styles.menu}>
            {[
              { icon: 'time-outline', label: 'Archive' },
              { icon: 'analytics-outline', label: 'Your Activity' },
              { icon: 'qr-code-outline', label: 'Nametag' },
              { icon: 'bookmark-outline', label: 'Saved' }
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} >
                <Ionicons name={item.icon} size={22} color="#000" />
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.menuItem} onPress={() => {
                onClose();
                setTimeout(() => router.push('/profile/closeFriends'), 200);
              }}
              >
                <Ionicons name="people-outline" size={22} color="#000" />
                <Text style={styles.menuText}>Close Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
                onClose();
                setTimeout(() => router.push('/profile/discoverPeople'), 200);
              }}
              >
                <Ionicons name="person-add-outline" size={22} color="#000" />
                <Text style={styles.menuText}>Discover People</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <FontAwesome name="facebook-square" size={22} color="#1877F2" />
              <Text style={styles.menuText}>Open Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout} disabled={loggingOut}>
              <Feather name="log-in" size={24} color={loggingOut ? '#999' : '#000'} />
              <Text style={styles.menuText}>{loggingOut ? 'Đang đăng xuất...' : 'Logout'}</Text>
              {loggingOut ? <ActivityIndicator size="small" color="#000" style={styles.loadingIndicator} /> : null}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.menuItem, styles.setting]}>
            <Ionicons name="settings-outline" size={22} color="#000" />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    width: width * 0.7,
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  menu: {
    flexGrow: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  setting: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
    marginTop: 20,
  },
});