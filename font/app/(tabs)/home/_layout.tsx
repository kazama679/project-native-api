import { Stack } from 'expo-router'
import React from 'react'

export default function _layout() {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="index" options={{ title: "Trang cá nhân" }} />
      <Stack.Screen name="messages" options={{ title: "Chỉnh sửa cá nhân" }} />
      <Stack.Screen name="message" options={{ title: "Nhắn tin" }} />
    </Stack>
  )
}
