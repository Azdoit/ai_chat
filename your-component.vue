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

// 矩阵乘法函数
function multiplyMatrix(a: number[][], b: number[][]): number[][] {
  const result: number[][] = []
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

// 计算变换后的四个角坐标
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
    [halfWidth, -halfHeight, 0, 1], // 右上
    [-halfWidth, halfHeight, 0, 1], // 左下
    [halfWidth, halfHeight, 0, 1] // 右下
  ]

  // 应用旋转变换
  const transformedCorners = corners.map((corner) => transformPoint(corner, rotationMatrix))

  // 透视投影并转换回图片坐标系
  return transformedCorners.map(([x, y, z]) => {
    const [projX, projY] = perspectiveProject([x, y, z])
    return [projX + halfWidth, projY + halfHeight]
  })
}

// 使用双线性插值进行像素采样
function bilinearInterpolation(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): [number, number, number, number] {
  // 边界检查
  x = Math.max(0, Math.min(width - 1, x))
  y = Math.max(0, Math.min(height - 1, y))

  const x1 = Math.floor(x)
  const y1 = Math.floor(y)
  const x2 = Math.min(x1 + 1, width - 1)
  const y2 = Math.min(y1 + 1, height - 1)

  const dx = x - x1
  const dy = y - y1

  // 获取四个相邻像素
  const getPixel = (px: number, py: number) => {
    const index = (py * width + px) * 4
    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3]
    ]
  }

  const [r1, g1, b1, a1] = getPixel(x1, y1)
  const [r2, g2, b2, a2] = getPixel(x2, y1)
  const [r3, g3, b3, a3] = getPixel(x1, y2)
  const [r4, g4, b4, a4] = getPixel(x2, y2)

  // 双线性插值
  const r = r1 * (1 - dx) * (1 - dy) + r2 * dx * (1 - dy) + r3 * (1 - dx) * dy + r4 * dx * dy
  const g = g1 * (1 - dx) * (1 - dy) + g2 * dx * (1 - dy) + g3 * (1 - dx) * dy + g4 * dx * dy
  const b = b1 * (1 - dx) * (1 - dy) + b2 * dx * (1 - dy) + b3 * (1 - dx) * dy + b4 * dx * dy
  const a = a1 * (1 - dx) * (1 - dy) + a2 * dx * (1 - dy) + a3 * (1 - dx) * dy + a4 * dx * dy

  return [Math.round(r), Math.round(g), Math.round(b), Math.round(a)]
}

// 计算逆变换矩阵（用于从输出坐标映射回输入坐标）
function invertMatrix4x4(matrix: number[][]): number[][] | null {
  const m = matrix.map(row => [...row]) // 复制矩阵
  const inv = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]

  // 高斯-约旦消元法
  for (let i = 0; i < 4; i++) {
    // 寻找主元
    let maxRow = i
    for (let k = i + 1; k < 4; k++) {
      if (Math.abs(m[k][i]) > Math.abs(m[maxRow][i])) {
        maxRow = k
      }
    }

    // 交换行
    if (maxRow !== i) {
      [m[i], m[maxRow]] = [m[maxRow], m[i]];
      [inv[i], inv[maxRow]] = [inv[maxRow], inv[i]]
    }

    // 检查是否为奇异矩阵
    if (Math.abs(m[i][i]) < 1e-10) {
      return null
    }

    // 归一化当前行
    const pivot = m[i][i]
    for (let j = 0; j < 4; j++) {
      m[i][j] /= pivot
      inv[i][j] /= pivot
    }

    // 消元
    for (let k = 0; k < 4; k++) {
      if (k !== i) {
        const factor = m[k][i]
        for (let j = 0; j < 4; j++) {
          m[k][j] -= factor * m[i][j]
          inv[k][j] -= factor * inv[i][j]
        }
      }
    }
  }

  return inv
}

// 使用逆向映射进行3D变换
function apply3DTransform(
  sourceImageData: ImageData,
  width: number,
  height: number,
  rotateX: number,
  rotateY: number,
  rotateZ: number
): ImageData {
  const outputImageData = new ImageData(width, height)
  const rotationMatrix = createRotationMatrix(rotateX, rotateY, rotateZ)
  const inverseMatrix = invertMatrix4x4(rotationMatrix)

  if (!inverseMatrix) {
    console.error('无法计算逆变换矩阵')
    return sourceImageData
  }

  const halfWidth = width / 2
  const halfHeight = height / 2
  const perspective = 1000

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 将输出坐标转换为以中心为原点的坐标系
      const centerX = x - halfWidth
      const centerY = y - halfHeight

      // 逆透视投影（假设z=0平面）
      const sourcePoint = [centerX, centerY, 0, 1]

      // 应用逆变换矩阵
      const [srcX, srcY, srcZ] = transformPoint(sourcePoint, inverseMatrix)

      // 透视投影
      const scale = perspective / (perspective + srcZ)
      const projectedX = srcX * scale
      const projectedY = srcY * scale

      // 转换回图片坐标系
      const sourcePixelX = projectedX + halfWidth
      const sourcePixelY = projectedY + halfHeight

      // 检查是否在源图像范围内
      if (sourcePixelX >= 0 && sourcePixelX < width && sourcePixelY >= 0 && sourcePixelY < height) {
        // 使用双线性插值获取像素值
        const [r, g, b, a] = bilinearInterpolation(sourceImageData, sourcePixelX, sourcePixelY, width, height)

        const outputIndex = (y * width + x) * 4
        outputImageData.data[outputIndex] = r
        outputImageData.data[outputIndex + 1] = g
        outputImageData.data[outputIndex + 2] = b
        outputImageData.data[outputIndex + 3] = a
      } else {
        // 超出范围的像素设为透明
        const outputIndex = (y * width + x) * 4
        outputImageData.data[outputIndex] = 0
        outputImageData.data[outputIndex + 1] = 0
        outputImageData.data[outputIndex + 2] = 0
        outputImageData.data[outputIndex + 3] = 0
      }
    }
  }

  return outputImageData
}

// 导出校正后图片的方法
function getCorrectedImage(rotateX: number, rotateY: number, rotateZ: number): string | null {
  const img = imgRef.value
  const canvas = canvasRef.value
  if (!img || !canvas) return null

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const width = img.naturalWidth
  const height = img.naturalHeight

  // 设置canvas尺寸
  canvas.width = width
  canvas.height = height

  try {
    // 创建临时canvas来获取原始图像数据
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return null

    tempCanvas.width = width
    tempCanvas.height = height
    tempCtx.drawImage(img, 0, 0, width, height)

    // 获取原始图像数据
    const sourceImageData = tempCtx.getImageData(0, 0, width, height)

    // 应用3D变换
    const transformedImageData = apply3DTransform(sourceImageData, width, height, rotateX, rotateY, rotateZ)

    // 将变换后的图像数据绘制到输出canvas
    ctx.putImageData(transformedImageData, 0, 0)

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('导出图片时发生错误:', error)

    // 如果3D变换失败，使用简单的2D变换作为备选方案
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotateZ * Math.PI) / 180)
    
    // 简单的缩放来模拟X和Y轴旋转效果
    const scaleX = Math.cos((rotateY * Math.PI) / 180)
    const scaleY = Math.cos((rotateX * Math.PI) / 180)
    ctx.scale(scaleX, scaleY)
    
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