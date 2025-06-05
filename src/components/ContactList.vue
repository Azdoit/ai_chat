<template>
  <div class="p-4 space-y-4">
    <div>
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 bg-gray-400 rounded-full"></div>
        <span class="text-lg">xxx</span>
      </div>
      <div class="mt-2 flex items-center gap-4">
        <el-input
          v-model="contactSearch"
          style="width: 300px"
          placeholder="搜索"
          :prefix-icon="Search"
        />
        <img src="../assets/imgs/add.png" class="w-8 h-8" />
      </div>
    </div>
    <div class="h-[250px]">
      <div class="text-gray-600 flex items-center gap-2">
        <img src="../assets/imgs/pin.png" class="w-4 h-4" />
        置顶消息
      </div>
      <div
        v-for="(contact, index) in pinContacts"
        :key="index"
        class="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
      >
        <div class="flex space-x-3 items-center">
          <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
          <div class="flex-1">
            <div class="font-medium">{{ contact.ne }}</div>
            <div class="text-xs text-gray-400">{{ contact.lastMessage }}</div>
          </div>
        </div>
        <div class="text-xs text-gray-400 flex flex-col items-end gap-1">
          <div>
            {{ contact.time }}
          </div>
          <div class="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] cflex">
            {{ contact.count }}
          </div>
        </div>
      </div>
    </div>
    <div class="mt-5 h-[calc(100%-390px)]">
      <div class="text-gray-600 flex items-center gap-2 mb-2">
        <img src="../assets/imgs/message.png" class="w-4 h-4" />
        所有信息
      </div>
      <div class="overflow-y-auto h-[calc(100%-30px)]">
        <div
          v-for="(contact, index) in allContacts"
          :key="index"
          class="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
        >
          <div class="flex space-x-3 items-center">
            <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
            <div class="flex-1">
              <div class="font-medium">{{ contact.ne }}</div>
              <div class="text-xs text-gray-400">{{ contact.lastMessage }}</div>
            </div>
          </div>
          <div class="text-xs text-gray-400 flex flex-col items-end gap-1">
            <div>
              {{ contact.time }}
            </div>
            <div
              v-if="contact.count > 0"
              class="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] cflex"
            >
              {{ contact.count }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
const contactSearch = ref('')
const pinContacts = [
  { ne: 'xxx', lastMessage: '好的，我马上处理', time: '09:15 ', count: 2 },
  { ne: 'xxx', lastMessage: '项目进展如何？', time: '10:30 ', count: 5 },
  { ne: 'xxx', lastMessage: '会议纪要已发送', time: '11:45 ', count: 1 },
  { ne: 'xxx', lastMessage: '请查收文件', time: '02:20 ', count: 3 },
]

const allContacts = [
  { ne: 'xxx', lastMessage: '好的，我马上处理', time: '09:15 ', count: 2 },
  { ne: 'xxx', lastMessage: '项目进展如何？', time: '10:30 ', count: 5 },
  { ne: 'xxx', lastMessage: '会议纪要已发送', time: '11:45 ', count: 1 },
  { ne: 'xxx', lastMessage: '请查收文件', time: '02:20 ', count: 3 },
  { ne: 'xxx', lastMessage: '系统更新通知', time: '08:30 ', count: 0 },
  { ne: 'xxx', lastMessage: '新活动策划讨论', time: '09:00 ', count: 12 },
  { ne: 'xxx', lastMessage: '新版本发布计划', time: '10:00 ', count: 8 },
  { ne: 'xxx', lastMessage: '周末有空吗？', time: '昨天', count: 1 },
  { ne: 'xxx', lastMessage: '收到，谢谢', time: '昨天', count: 0 },
  { ne: 'xxx', lastMessage: '请帮忙看一下这个方案', time: '昨天', count: 3 },
  { ne: 'xxx', lastMessage: '好的，没问题', time: '昨天', count: 0 },
  { ne: 'xxx', lastMessage: '进度汇报', time: '昨天', count: 5 },
  { ne: 'xxx', lastMessage: '问题反馈', time: '昨天', count: 2 },
  { ne: 'xxx', lastMessage: '文件已更新', time: '前天', count: 0 },
  { ne: 'xxx', lastMessage: '会议时间确认', time: '前天', count: 1 },

  { ne: 'xxx', lastMessage: '进度汇报', time: '昨天', count: 5 },
  { ne: 'xxx', lastMessage: '问题反馈', time: '昨天', count: 2 },
  { ne: 'xxx', lastMessage: '文件已更新', time: '前天', count: 0 },
  { ne: 'xxx', lastMessage: '会议时间确认', time: '前天', count: 1 },
]
</script>
