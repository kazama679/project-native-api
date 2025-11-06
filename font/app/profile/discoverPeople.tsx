import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const followRequests = [
  {
    id: "1",
    name: "kazam_a0207",
    desc: "quang",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    type: "follow",
  },
  {
    id: "2",
    name: "penrose_1612",
    desc: "Đào Đức",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    type: "confirm",
  },
  {
    id: "3",
    name: "t_mahn4_",
    desc: "Có 21thh04 + 1 người nữa theo dõi",
    avatar: "https://randomuser.me/api/portraits/men/13.jpg",
    type: "confirm",
  },
  {
    id: "4",
    name: "elaina_ashen.witch",
    desc: "Elaina-san",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    type: "confirm",
  },
];

const suggestions = [
  {
    id: "5",
    name: "_muse14.07.21_",
    desc: "Có ieltn_dyuu theo dõi",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: "6",
    name: "ttruc",
    desc: "Đang theo dõi aka__buns",
    avatar: "https://randomuser.me/api/portraits/women/13.jpg",
  },
  {
    id: "7",
    name: "Jenniferq031",
    desc: "Có aka__buns theo dõi",
    avatar: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    id: "8",
    name: "Lưu Minh Ánh",
    desc: "Gợi ý cho bạn",
    avatar: "https://randomuser.me/api/portraits/women/15.jpg",
  },
];

export default function DiscoverPeople() {
  const [search, setSearch] = useState("");
    const router = useRouter();
  const renderUserItem = ({ item }) => (
    <View style={styles.userContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.username}>{item.name}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
      </View>

      {item.type === "confirm" ? (
        <View style={styles.btnGroup}>
          <TouchableOpacity style={styles.confirmBtn}>
            <Text style={styles.btnTextWhite}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn}>
            <Text style={styles.btnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.followBtn}>
          <Text style={styles.btnTextWhite}>Theo dõi</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSuggestionItem = ({ item }) => (
    <View style={styles.userContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.username}>{item.name}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
      </View>
      <View style={styles.btnGroup}>
        <TouchableOpacity style={styles.followBtn}>
          <Text style={styles.btnTextWhite}>Theo dõi</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="close-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu theo dõi</Text>
        <Text style={styles.manageText}>Quản lý</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#888" />
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Follow requests */}
      <FlatList
        data={followRequests}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {/* Suggestions */}
      <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
      <FlatList
        data={suggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
  },
  manageText: {
    color: "#9333ff",
    fontSize: 14,
    marginLeft: "auto",
  },
  searchContainer: {
    backgroundColor: "#f1f1f1",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  searchInput: {
    marginLeft: 6,
    flex: 1,
    fontSize: 14,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontWeight: "600",
  },
  desc: {
    fontSize: 12,
    color: "#666",
  },
  btnGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  followBtn: {
    backgroundColor: "#9333ff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  confirmBtn: {
    backgroundColor: "#9333ff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  deleteBtn: {
    backgroundColor: "#eee",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnText: {
    fontSize: 13,
    color: "#000",
  },
  btnTextWhite: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
  sectionTitle: {
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 12,
  },
});
