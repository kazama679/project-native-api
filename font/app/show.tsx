import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Image,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Show() {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
        }}
        style={styles.background}
      >
        {/* Overlay gradient for readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Interviews with leading designers{'\n'}of large companies ▼
            </Text>

            <View style={styles.userRow}>
              <Image
                source={{
                  uri: 'https://randomuser.me/api/portraits/women/44.jpg',
                }}
                style={styles.avatar}
              />
              <Text style={styles.username}>amanda_design</Text>
              <Text style={styles.dot}>·</Text>
              <TouchableOpacity>
                <Text style={styles.follow}>Follow</Text>
              </TouchableOpacity>
              <Text style={styles.date}>September 13</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View style={styles.footer}>
          <View style={styles.stats}>
            <Text style={styles.statText}>37,256 views</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.statText}>373 comments</Text>
          </View>

          <View style={styles.iconRow}>
            <TouchableOpacity>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
                }}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/1946/1946406.png',
                }}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/5948/5948565.png',
                }}
                style={styles.icon}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton}>
              <Text style={styles.nextText}>Up Next</Text>
            </TouchableOpacity>
          </View>

          {/* Progress + time */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar} />
            <Text style={styles.time}>08:31</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  background: { flex: 1, justifyContent: 'space-between' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // HEADER
  header: {
    paddingHorizontal: 15,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  username: { color: '#fff', fontWeight: '600' },
  dot: { color: '#ccc', marginHorizontal: 5 },
  follow: { color: '#4da6ff', fontWeight: '600' },
  date: { color: '#aaa', marginLeft: 6 },
  close: { color: '#fff', fontSize: 20 },

  // FOOTER
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statText: { color: '#fff', fontSize: 14 },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
    marginRight: 18,
  },
  nextButton: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  nextText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  // PROGRESS BAR
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  time: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 8,
  },
});
