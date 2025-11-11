import { Stack } from 'expo-router'
import React from 'react'

export default function _layout() {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="index" options={{ title: "Trang cá nhân" }} />
      <Stack.Screen name="postDetail" options={{ title: "Chỉnh sửa cá nhân" }} />
      <Stack.Screen name="titlePost" options={{ title: "Chỉnh sửa cá nhân" }} />
      <Stack.Screen name="comment" options={{ title: "Chỉnh sửa cá nhân" }} />
    </Stack>
  )
}