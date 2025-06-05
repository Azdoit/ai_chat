<template>
  <div class="w-full h-full flex">
    <div
      class="bg-gray-50 flex flex-col h-full"
      :class="isShowAIDrawer ? 'w-[calc(100%-500px)]' : 'w-full'"
    >
      <div
        class="h-16 w-full bg-white flex items-center justify-between px-10 border-b border-gray-200 shadow-sm"
      >
        <span>联系人xxx</span>
        <img src="../assets/imgs/robot.png" class="w-6 h-6 cursor-pointer hover:scale-110" @click="addToAI"/>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="flex p-4 group relative"
          :class="msg.isMe ? 'justify-end' : 'justify-start'"
          @click="toggleMessageSelect(index)"
        >
          <!-- 选择框 -->
          <div v-if="isSelectMode" class="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer"
              :class="
                selectedMessages.includes(index)
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              "
            >
              <i
                v-if="selectedMessages.includes(index)"
                class="fas fa-check text-white text-xs"
              ></i>
            </div>
          </div>

          <div
            class="flex"
            :class="[msg.isMe ? 'flex-row-reverse' : 'flex-row', isSelectMode ? 'ml-8' : '']"
          >
            <!-- 头像 -->
            <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-400"></div>

            <!-- 消息内容 -->
            <div class="mx-2 max-w-[80%]">
              <!-- 名字 -->
              <div
                class="text-xs text-gray-500 mb-1"
                :class="msg.isMe ? 'text-right' : 'text-left'"
              >
                {{ msg.ne }}
              </div>

              <!-- 消息气泡 -->
              <div
                :class="[
                  'px-4 py-2 rounded-lg text-sm',
                  msg.isMe ? 'bg-[#a9e87a] ' : 'bg-white border border-gray-200 ',
                ]"
              >
                <div class="text-sm p-1" v-html="msg.text"></div>
              </div>

              <!-- 时间 -->
              <div
                class="text-xs text-gray-400 mt-1"
                :class="msg.isMe ? 'text-right' : 'text-left'"
              >
                {{ msg.time }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="!isSelectMode"
        class="h-56 w-full bg-white px-4 pt-2 border-t border-gray-200 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <img src="../assets/imgs/module.png" class="w-60 h-10" />
          <img src="../assets/imgs/history.png" class="w-6 h-6 mt-2" />
        </div>
        <div>
          <!-- 输入框区域 -->
          <div class="">
            <div class="relative">
              <div
                class="w-full h-[120px] p-3 text-sm bg-transparent outline-none overflow-y-auto"
                contenteditable="true"
                placeholder="请输入消息..."
                @input="handleInput"
                @keydown.enter.prevent="handleEnter"
                ref="inputBox"
              ></div>
              <div
                class="absolute top-3 left-3 text-gray-400 pointer-events-none"
                v-if="!inputContent"
              >
                请输入消息...
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <el-button size="small" @click="handleEnter">发送</el-button>
          </div>
        </div>
      </div>
      <!-- 底部操作栏 -->
      <div
        v-if="isSelectMode"
        class="h-56 w-full bg-white border-t border-gray-200 flex items-center justify-center px-4"
      >
        <div class="h-full cflex space-x-12">
          <div class="flex flex-col items-center gap-4">
            <button
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              @click="forwardSelected"
              title="逐条转发"
            >
              <i class="fas fa-share-alt text-gray-600 text-2xl"></i>
            </button>
            <span class="text-sm text-gray-600">逐条转发</span>
          </div>

          <div class="flex flex-col items-center gap-4">
            <button
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              @click="mergeForward"
              title="合并转发"
            >
              <i class="fas fa-object-group text-gray-600 text-2xl"></i>
            </button>
            <span class="text-sm text-gray-600">合并转发</span>
          </div>

          <div class="flex flex-col items-center gap-4">
            <button
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              @click="batchSave"
              title="批量保存"
            >
              <i class="fas fa-download text-gray-600 text-2xl"></i>
            </button>
            <span class="text-sm text-gray-600">批量保存</span>
          </div>

          <div class="flex flex-col items-center gap-4">
            <button
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              @click="addToAI"
              title="添加到AI助手"
            >
              <i class="fas fa-robot text-gray-600 text-2xl"></i>
            </button>
            <span class="text-sm text-gray-600">添加到AI助手</span>
          </div>

          <div class="flex flex-col items-center gap-4">
            <button
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              @click="addToFavorites"
              title="收藏"
            >
              <i class="fas fa-star text-gray-600 text-2xl"></i>
            </button>
            <span class="text-sm text-gray-600">收藏</span>
          </div>

          <div class="flex flex-col items-center gap-4">
            <button
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              @click="deleteMessages"
              title="删除"
            >
              <i class="fas fa-trash text-gray-600 text-2xl"></i>
            </button>
            <span class="text-sm text-gray-600">删除</span>
          </div>

          <div class="flex flex-col items-center gap-4">
            <button
              class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              @click="reportMessages"
              title="举报"
            >
              <i class="fas fa-flag text-gray-600 text-2xl"></i>
            </button>
            <span class="text-sm text-gray-600">举报</span>
          </div>
        </div>

        <div class="">
          <button
            class="flex items-center justify-center ml-20 cursor-pointer"
            @click="cancelSelect"
            title="取消"
          >
            <i class="fas fa-times text-gray-600 text-2xl"></i>
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="isShowAIDrawer"
      class="w-[500px] h-full bg-white border-l border-gray-200 shadow-sm flex flex-col"
    >
      <div class="flex items-center justify-between p-6">
        <img
          src="../assets/imgs/back.png"
          class="w-6 h-6 cursor-pointer"
          @click="isShowAIDrawer = false"
        />
        <div class="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-400"></div>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-for="(msg, index) in aiMessages" :key="index">
          <!-- AI消息 -->
          <div v-if="!msg.isMe" class="flex items-start space-x-3 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
            >
              <i class="fas fa-robot text-white"></i>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <div class="text-xs text-gray-500 mb-1">AI助手</div>
                <!-- 添加应用按钮 -->
                <button
                  v-if="index > 0"
                  class="text-xs text-green-500 hover:text-green-600 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors cursor-pointer"
                  @click="applyToInput(msg.text)"
                  title="应用到输入框"
                >
                  <i class="fas fa-arrow-down mr-1"></i>应用
                </button>
              </div>
              <div class="bg-white rounded-lg p-3 text-sm shadow-sm" v-html="msg.text"></div>
              <div class="text-xs text-gray-400 mt-1">{{ msg.time }}</div>
            </div>
          </div>

          <!-- 用户消息 -->
          <div v-else class="flex items-start space-x-3 mb-4 flex-row-reverse">
            <div class="w-10 h-10 rounded-full bg-gray-400 flex-shrink-0"></div>
            <div class="flex-1 text-right">
              <div class="text-xs text-gray-500 mb-4">我</div>
              <div
                class="bg-[#a9e87a] rounded-lg p-3 text-sm inline-block max-w-[200px] text-center"
              >
                <el-button class="min-w-[120px] mb-2" @click="toggleSelectMode">
                  {{ ` ${selectedMessages.length}条聊天记录` }}
                </el-button>
                <div class="text-left">
                  <div class="pl-2 text-sm" v-html="msg.text"></div>
                </div>
              </div>
              <div class="text-xs text-gray-400 mt-1">{{ msg.time }}</div>
            </div>
          </div>
        </div>

        <!-- 加载动画 -->
        <div v-if="isLoading" class="flex items-center space-x-2">
          <div
            class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
          >
            <i class="fas fa-robot text-white"></i>
          </div>
          <div class="bg-white rounded-lg p-3 text-sm shadow-sm">
            <span class="inline-flex space-x-1">
              <span class="animate-bounce">.</span>
              <span class="animate-bounce delay-100">.</span>
              <span class="animate-bounce delay-200">.</span>
            </span>
          </div>
        </div>
      </div>
      <div class="h-56 border-t border-gray-200 shadow-sm p-6">
        <div class="flex items-center justify-between">
          <el-button @click="toggleSelectMode" class="min-w-[120px]">
            {{
              selectedMessages.length > 0 ? `${selectedMessages.length}条聊天记录` : '选择聊天记录'
            }}
          </el-button>
          <el-select v-model="keyWord" placeholder="请选择" style="width: 240px">
            <el-option
              v-for="item in keyWordOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <!-- 输入框区域 -->
        <div class="">
          <div class="relative">
            <div
              class="w-full h-[120px] p-3 text-sm bg-transparent outline-none overflow-y-auto"
              contenteditable="true"
              placeholder="请输入您的问题..."
              @input="handleInput2"
              @keydown.enter.prevent="handleEnter2"
              ref="inputBox2"
            ></div>
            <div
              class="absolute top-3 left-3 text-gray-400 pointer-events-none"
              v-if="!inputContent2"
            >
              请输入您的问题...
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <el-button size="small" @click="handleEnter2">发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([
  {
    text: '什么叫境内货源地？',
    isMe: false,
    time: '10:30 ',
    ne: 'xxx',
  },
  {
    text: '境内货源地是指出口货物在国内的产地或原始发货地…',
    isMe: true,
    time: '10:30 ',
    ne: '我',
  },
  {
    text: '如何评估与特定贸易国交易的潜在风险？🤔',
    isMe: false,
    time: '10:30 ',
    ne: 'xxx',
  },
  {
    text: '应考虑政治风险、经济波动、法律合规、信用风险等。',
    isMe: true,
    time: '10:30 ',
    ne: '我',
  },
  {
    text: '那具体要怎么操作呢？能详细说明一下吗？',
    isMe: false,
    time: '10:31 ',
    ne: 'xxx',
  },
  {
    text: '好的，我来详细说明一下：\n1. 政治风险：关注目标国家的政治稳定性\n2. 经济风险：分析汇率波动、通货膨胀等因素\n3. 法律风险：了解当地贸易法规和限制\n4. 信用风险：评估交易对手的信用状况',
    isMe: true,
    time: '10:32 ',
    ne: '我',
  },
  {
    text: '明白了，谢谢！👍',
    isMe: false,
    time: '10:32 ',
    ne: 'xxx',
  },
  {
    text: '对了，还有一个问题，关于出口退税的流程是怎样的？',
    isMe: false,
    time: '10:33 ',
    ne: 'xxx',
  },
  {
    text: '出口退税的基本流程是：\n1. 准备相关单据（报关单、发票等）\n2. 向海关申报\n3. 等待审核\n4. 退税到账\n需要我发一份详细的流程图给你吗？',
    isMe: true,
    time: '10:34 ',
    ne: '我',
  },
  {
    text: '好的，麻烦发一下流程图，谢谢！',
    isMe: false,
    time: '10:34 ',
    ne: 'xxx',
  },
  {
    text: '[图片]',
    isMe: true,
    time: '10:35 ',
    ne: '我',
  },
  {
    text: '收到，这个流程图很清晰！',
    isMe: false,
    time: '10:35 ',
    ne: 'xxx',
  },
  {
    text: '如果还有其他问题随时问我',
    isMe: true,
    time: '10:36 ',
    ne: '我',
  },
  {
    text: '好的，感谢！🙏',
    isMe: false,
    time: '10:36 ',
    ne: 'xxx',
  },
])

const inputContent = ref('')
const inputBox = ref(null)

const handleInput = (e) => {
  inputContent.value = e.target.innerText
}

const handleEnter = (e) => {
  if(inputContent.value.trim()==='')return
  if (e.shiftKey) {
    // 如果按住shift+enter，插入换行
    document.execCommand('insertLineBreak')
  } else {
    // 处理文本格式，保持一致性
    let messageText = inputContent.value.trim()
    messageText = messageText
      .replace(/\n\n/g, '<br><br>') // 先处理双换行
      .replace(/\n/g, '<br>') // 再处理单换行
      .replace(/(\d+)\./g, '$1.') // 确保数字序号格式正确

    // 发送消息
    messages.value.push({
      text: messageText,
      isMe: true,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      ne: '我',
    })

    // 清空输入框
    inputContent.value = ''
    inputBox.value.innerText = ''

    // 滚动到底部
    nextTick(() => {
      const messageContainer = document.querySelector('.flex-1.overflow-y-auto')
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight
      }
    })
  }
}

// 新增的状态和方法
const isSelectMode = ref(false)
const selectedMessages = ref([])

const toggleMessageSelect = (index) => {
  if (!isSelectMode.value) {
    isSelectMode.value = true
  }

  const messageIndex = selectedMessages.value.indexOf(index)
  if (messageIndex === -1) {
    selectedMessages.value.push(index)
  } else {
    selectedMessages.value.splice(messageIndex, 1)
  }
}

const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
}

const cancelSelect = () => {
  isSelectMode.value = false
  // selectedMessages.value = []
}

// 功能方法
const forwardSelected = () => {
  console.log('逐条转发', selectedMessages.value)
  cancelSelect()
}

const mergeForward = () => {
  console.log('合并转发', selectedMessages.value)
  cancelSelect()
}

const batchSave = () => {
  console.log('批量保存', selectedMessages.value)
  cancelSelect()
}

const isShowAIDrawer = ref(false)
const addToAI = () => {
  isShowAIDrawer.value = true
  cancelSelect()
}

const addToFavorites = () => {
  console.log('收藏', selectedMessages.value)
  cancelSelect()
}

const deleteMessages = () => {
  console.log('删除', selectedMessages.value)
  cancelSelect()
}

const reportMessages = () => {
  console.log('举报', selectedMessages.value)
  cancelSelect()
}

const keyWord = ref('')
const keyWordOptions = [
  {
    value: '常用提示词',
    label: '常用提示词',
  },
  {
    value: '行业知识',
    label: '行业知识',
  },
  {
    value: '业务知识',
    label: '业务知识',
  },
  {
    value: '制单审核',
    label: '制单审核',
  },
  {
    value: '申报要素',
    label: '申报要素',
  },
]

const inputContent2 = ref('')
const inputBox2 = ref(null)

const aiMessages = ref([
  {
    text: '您好，我是AI助手，我会根据提供的聊天记录来回答您！',
    isMe: false,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  },
])
const isLoading = ref(false)

const handleInput2 = (e) => {
  inputContent2.value = e.target.innerText
}

const handleEnter2 = async (e) => {
  if (e && e.shiftKey) {
    document.execCommand('insertLineBreak')
    return
  }

  const message = inputContent2.value.trim()
  if (!message) return

  // 清空输入框
  inputContent2.value = ''
  inputBox2.value.innerText = ''

  // 添加用户消息
  const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  aiMessages.value.push({
    text: message,
    isMe: true,
    time: currentTime,
  })

  // 滚动到底部
  nextTick(() => {
    const aiMessageContainer = document.querySelector('.flex-1.overflow-y-auto.p-4')
    if (aiMessageContainer) {
      aiMessageContainer.scrollTop = aiMessageContainer.scrollHeight
    }
  })

  // 显示加载动画
  isLoading.value = true

  // 模拟AI响应延迟
  setTimeout(() => {
    // 添加AI回复
    aiMessages.value.push({
      text: generateAIResponse(message),
      isMe: false,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })
    isLoading.value = false

    // AI回复后也滚动到底部
    nextTick(() => {
      const aiMessageContainer = document.querySelector('.flex-1.overflow-y-auto.p-4')
      if (aiMessageContainer) {
        aiMessageContainer.scrollTop = aiMessageContainer.scrollHeight
      }
    })
  }, 1000)
}

// 模拟AI回复生成
const generateAIResponse = (message) => {
  const responses = [
    `与特定贸易国交易的主要风险：<br><br>
1.政治风险<br>
政策变化：关税、配额、监管制度等可能突然调整<br>
政治不稳定：可能出现政变、骚乱或外交关系紧张<br>
国有化风险：存在资产被征收或国有化的可能性<br><br>
2.经济风险<br>
汇率波动：直接影响交易成本与利润率<br>
市场环境：高通胀、经济衰退会削弱市场需求与付款能力<br>
资金流动：资本管制可能导致资金回流困难<br><br>
3.法律与合规风险<br>
法规环境：法规变化频繁，执行过程不够透明<br>
合同履行：合同执行难度大，法律环境有待完善<br>
知识产权：保护机制可能不够健全<br>
国际合规：需注意制裁、反腐败等合规要求<br><br>
4.信用与商业风险<br>
客户信用：可能存在拖欠或违约风险<br>
信用评估：缺乏透明的评估机制<br>
支付安全：支付方式和银行履约存在不确定性<br><br>
5.其他风险<br>
供应链风险：物流中断、基础设施落后等问题<br>
文化差异：可能影响日常沟通与合作<br>
自然因素：自然灾害或极端天气可能影响交付`,
    `贸易风险防范建议：<br><br>
1.事前预防<br>
深入研究目标市场政治经济环境<br>
建立完善的风险评估体系<br>
选择可靠的商业伙伴<br><br>
2.过程控制<br>
规范合同签订流程<br>
严格把控支付条件<br>
加强供应链管理<br>
持续监控市场变化<br><br>
3.风险对冲<br>
利用金融工具规避汇率风险<br>
购买贸易信用保险<br>
选择适当的贸易方式<br>
分散市场投资`,
    `贸易风险实操指南：<br><br>
1.交易前准备<br>
收集交易对手详细信息<br>
评估目标市场准入门槛<br>
了解当地法律法规<br>
制定应急预案<br><br>
2.合同签订<br>
明确违约责任<br>
约定争议解决方式<br>
规定不可抗力条款<br>
注意付款条件设置<br><br>
3.执行阶段<br>
严格跟踪订单进度<br>
保持通畅沟通渠道<br>
做好文件存档<br>
及时应对异常情况`,
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

// 添加应用到输入框的方法
const applyToInput = (text) => {
  // 1. 先移除开头和结尾的空白
  let plainText = text.trim()

  // 2. 处理HTML标签和特殊格式
  plainText = plainText
    // 处理<br>标签为换行
    .replace(/<br><br>/g, '\n\n') // 先处理双换行
    .replace(/<br>/g, '\n') // 再处理单换行
    // 移除其他HTML标签
    .replace(/<[^>]*>/g, '')
    // 处理可能的多余空行
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // 处理每行开头的空格
    .replace(/\n\s+/g, '\n')
    // 确保数字序号格式正确
    .replace(/(\d+)\./g, '$1.')

  inputContent.value = plainText
  if (inputBox.value) {
    inputBox.value.innerText = plainText
  }
}
</script>

<style scoped>
/* 添加延迟动画效果 */
.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}

/* 添加按钮悬停效果 */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(1px);
}
</style>
