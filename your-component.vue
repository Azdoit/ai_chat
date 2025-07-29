<template>
  <div class="w-full h-full flex flex-col">
    <!-- 图像显示区域 -->
    <div class="flex-1 flex justify-center items-center">
      <div class="perspective-[1000px] w-[60%] h-[60%] relative">
        <img src="../../../assets/imgs/correctBorder.webp" class="absolute z-10 w-full h-full" />
        <div
          class="w-full h-full transform-3d transform-gpu relative cflex"
          :style="{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
          }"
        >
          <!-- 前面 -->
          <img
            ref="imgRef"
            :src="camera?.pic || '../../../assets/imgs/test4.jpg'"
            alt="front"
            class="object-contain h-full backface-hidden absolute"
          />
        </div>
      </div>
    </div>

    <!-- 控制区域 -->
    <div class="h-48 p-4">
      <!-- 使用Ruler组件替代a-slider -->
      <Ruler v-model="activeValue" :min="-45" :max="45" />

      <!-- 控制按钮 -->
      <div class="flex justify-center space-x-16 mt-2">
        <div
          class="flex flex-col items-center gap-1 cursor-pointer"
          @click="activeControl = 'rotateZ'"
        >
          <div
            class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-1"
            :class="{ '!bg-blue-500 text-white': activeControl === 'rotateZ' }"
          >
            <span class="icon-[icon-park-outline--rotate]"></span>
          </div>
          <span class="text-xs">旋转</span>
        </div>

        <div
          class="flex flex-col items-center gap-1 cursor-pointer"
          @click="activeControl = 'rotateX'"
        >
          <div
            class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-1"
            :class="{ '!bg-blue-500 text-white': activeControl === 'rotateX' }"
          >
            <span class="icon-[material-symbols--height] text-xl"></span>
          </div>
          <span class="text-xs">垂直校正</span>
        </div>

        <div
          class="flex flex-col items-center gap-1 cursor-pointer"
          @click="activeControl = 'rotateY'"
        >
          <div
            class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-1"
            :class="{ '!bg-blue-500 text-white': activeControl === 'rotateY' }"
          >
            <span class="icon-[material-symbols--width] text-xl"></span>
          </div>
          <span class="text-xs">水平校正</span>
        </div>
      </div>
    </div>
    <canvas ref="canvasRef" style="display: none"></canvas>
  </div>
</template>

<script setup lang="ts">
import Ruler from './components/Ruler.vue'
import { ref, computed, watch, onMounted } from 'vue'
import GL from 'glfx'

const props = defineProps({
  camera: {
    type: Object,
    default: () => ({})
  }
})

// 旋转角度
const rotateX = ref(0)
const rotateY = ref(0)
const rotateZ = ref(0)

// 当前活动的控制类型
const activeControl = ref('rotateZ') // 默认为旋转(Z轴)

// 根据当前活动控制类型计算当前值
const activeValue = computed({
  get() {
    switch (activeControl.value) {
      case 'rotateX':
        return rotateX.value
      case 'rotateY':
        return rotateY.value
      case 'rotateZ':
        return rotateZ.value
      default:
        return 0
    }
  },
  set(value) {
    updateRotation(value)
  }
})

// 更新旋转
function updateRotation(value) {
  switch (activeControl.value) {
    case 'rotateX':
      rotateX.value = value
      break
    case 'rotateY':
      rotateY.value = value
      break
    case 'rotateZ':
      rotateZ.value = value
      break
  }
}

// 重置所有旋转
function resetRotation() {
  rotateX.value = 0
  rotateY.value = 0
  rotateZ.value = 0
}

// 监听camera变化，重置旋转
watch(
  () => props.camera,
  () => {
    resetRotation()
  },
  { deep: true }
)

const imgRef = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const fxCanvas = ref<any>(null)

onMounted(() => {
  fxCanvas.value = GL.canvas()
})

// 矩阵乘法函数
function multiplyMatrix(a: number[][], b: number[][]): number[][] {
  const result = []
  for (let i = 0; i < a.length; i++) {
    result[i] = []
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0
      for (let k = 0; k < b.length; k++) {
        sum += a[i][k] * b[k][j]
      }
      result[i][j] = sum
    }
  }
  return result
}

// 创建旋转矩阵
function createRotationMatrix(rotateX: number, rotateY: number, rotateZ: number) {
  const rx = (rotateX * Math.PI) / 180
  const ry = (rotateY * Math.PI) / 180
  const rz = (rotateZ * Math.PI) / 180

  // X轴旋转矩阵
  const Rx = [
    [1, 0, 0, 0],
    [0, Math.cos(rx), -Math.sin(rx), 0],
    [0, Math.sin(rx), Math.cos(rx), 0],
    [0, 0, 0, 1]
  ]

  // Y轴旋转矩阵
  const Ry = [
    [Math.cos(ry), 0, Math.sin(ry), 0],
    [0, 1, 0, 0],
    [-Math.sin(ry), 0, Math.cos(ry), 0],
    [0, 0, 0, 1]
  ]

  // Z轴旋转矩阵
  const Rz = [
    [Math.cos(rz), -Math.sin(rz), 0, 0],
    [Math.sin(rz), Math.cos(rz), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]

  // 组合旋转矩阵 (顺序: Z * Y * X)
  return multiplyMatrix(multiplyMatrix(Rz, Ry), Rx)
}

// 应用变换矩阵到点
function transformPoint(point: number[], matrix: number[][]) {
  const [x, y, z, w] = point
  return [
    matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z + matrix[0][3] * w,
    matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z + matrix[1][3] * w,
    matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z + matrix[2][3] * w,
    matrix[3][0] * x + matrix[3][1] * y + matrix[3][2] * z + matrix[3][3] * w
  ]
}

// 透视投影
function perspectiveProject(point: number[], perspective: number = 1000) {
  const [x, y, z] = point
  const scale = perspective / (perspective + z)
  return [x * scale, y * scale]
}

function getTransformedCorners(
  width: number,
  height: number,
  rotateX: number,
  rotateY: number,
  rotateZ: number
) {
  // 创建旋转矩阵
  const rotationMatrix = createRotationMatrix(rotateX, rotateY, rotateZ)
  
  // 四个角的3D坐标（以图片中心为原点）
  const halfWidth = width / 2
  const halfHeight = height / 2
  
  const corners = [
    [-halfWidth, -halfHeight, 0, 1], // 左上
    [halfWidth, -halfHeight, 0, 1],  // 右上
    [-halfWidth, halfHeight, 0, 1],  // 左下
    [halfWidth, halfHeight, 0, 1]    // 右下
  ]

  // 应用旋转变换
  const transformedCorners = corners.map(corner => transformPoint(corner, rotationMatrix))
  
  // 透视投影并转换回图片坐标系
  return transformedCorners.map(([x, y, z]) => {
    const [projX, projY] = perspectiveProject([x, y, z])
    return [projX + halfWidth, projY + halfHeight]
  })
}

// 导出校正后图片的方法
function getCorrectedImage(rotateX: number, rotateY: number, rotateZ: number): string | null {
  const img = imgRef.value
  if (!img || !fxCanvas.value) return null

  const width = img.naturalWidth
  const height = img.naturalHeight

  // 设置canvas尺寸
  fxCanvas.value.width = width
  fxCanvas.value.height = height

  try {
    // 计算四个角的新坐标
    const corners = getTransformedCorners(width, height, rotateX, rotateY, rotateZ)
    const [tl, tr, bl, br] = corners

    // 原图四个角的坐标
    const originalCorners = [0, 0, width, 0, 0, height, width, height]
    
    // 变换后的四个角坐标
    const transformedCorners = [...tl, ...tr, ...bl, ...br]

    // 创建纹理并做透视变换
    const texture = fxCanvas.value.texture(img)
    fxCanvas.value
      .draw(texture)
      .perspective(originalCorners, transformedCorners)
      .update()

    return fxCanvas.value.toDataURL('image/png')
  } catch (error) {
    console.error('导出图片时发生错误:', error)
    
    // 如果透视变换失败，尝试使用简单的canvas 2D变换
    const canvas = canvasRef.value
    if (!canvas) return null
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    canvas.width = width
    canvas.height = height
    
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotateZ * Math.PI) / 180)
    ctx.scale(
      Math.cos((rotateY * Math.PI) / 180),
      Math.cos((rotateX * Math.PI) / 180)
    )
    ctx.translate(-width / 2, -height / 2)
    ctx.drawImage(img, 0, 0, width, height)
    ctx.restore()
    
    return canvas.toDataURL('image/png')
  }
}

// 让父组件可以调用
defineExpose({
  getCorrectedImage: () => getCorrectedImage(rotateX.value, rotateY.value, rotateZ.value)
})
</script>

<style scoped>
.transform-3d {
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.backface-hidden {
  backface-visibility: hidden;
}
</style>