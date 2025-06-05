<template>
  <div class="flex h-screen">
    <!-- 联系人列表 -->
    <ContactList class="w-[320px] border-r border-gray-200" />

    <!-- 聊天区 -->
    <div class="flex-1">
      <MessageArea  />
    </div>
  </div>
</template>

<script setup>
import ContactList from './ContactList.vue'
import MessageArea from './MessageArea.vue'
</script>