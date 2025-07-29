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
import { ref, computed, watch } from 'vue'

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

// 3D点变换
function transform3D(x: number, y: number, z: number, rotateX: number, rotateY: number, rotateZ: number) {
  // 转换为弧度
  const rx = (rotateX * Math.PI) / 180
  const ry = (rotateY * Math.PI) / 180
  const rz = (rotateZ * Math.PI) / 180

  // 绕X轴旋转
  let y1 = y * Math.cos(rx) - z * Math.sin(rx)
  let z1 = y * Math.sin(rx) + z * Math.cos(rx)
  
  // 绕Y轴旋转
  let x1 = x * Math.cos(ry) + z1 * Math.sin(ry)
  let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry)
  
  // 绕Z轴旋转
  let x2 = x1 * Math.cos(rz) - y1 * Math.sin(rz)
  let y2 = x1 * Math.sin(rz) + y1 * Math.cos(rz)

  return [x2, y2, z2]
}

// 透视投影
function perspectiveProject(x: number, y: number, z: number, perspective: number = 1000) {
  const scale = perspective / (perspective - z)
  return [x * scale, y * scale]
}

// 获取四个角的变换后坐标
function getTransformedCorners(width: number, height: number, rotateX: number, rotateY: number, rotateZ: number) {
  const halfW = width / 2
  const halfH = height / 2
  
  // 四个角的原始坐标（相对于中心）
  const corners = [
    [-halfW, -halfH, 0], // 左上
    [halfW, -halfH, 0],  // 右上
    [-halfW, halfH, 0],  // 左下
    [halfW, halfH, 0]    // 右下
  ]
  
  // 应用3D变换和透视投影
  return corners.map(([x, y, z]) => {
    const [tx, ty, tz] = transform3D(x, y, z, rotateX, rotateY, rotateZ)
    const [px, py] = perspectiveProject(tx, ty, tz)
    return [px + halfW, py + halfH]
  })
}

// 双线性插值
function bilinearInterpolate(
  x: number, 
  y: number, 
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number,
  q11: number[], 
  q12: number[], 
  q21: number[], 
  q22: number[]
): number[] {
  const r1 = [
    q11[0] * (x2 - x) / (x2 - x1) + q21[0] * (x - x1) / (x2 - x1),
    q11[1] * (x2 - x) / (x2 - x1) + q21[1] * (x - x1) / (x2 - x1),
    q11[2] * (x2 - x) / (x2 - x1) + q21[2] * (x - x1) / (x2 - x1),
    q11[3] * (x2 - x) / (x2 - x1) + q21[3] * (x - x1) / (x2 - x1)
  ]
  
  const r2 = [
    q12[0] * (x2 - x) / (x2 - x1) + q22[0] * (x - x1) / (x2 - x1),
    q12[1] * (x2 - x) / (x2 - x1) + q22[1] * (x - x1) / (x2 - x1),
    q12[2] * (x2 - x) / (x2 - x1) + q22[2] * (x - x1) / (x2 - x1),
    q12[3] * (x2 - x) / (x2 - x1) + q22[3] * (x - x1) / (x2 - x1)
  ]
  
  return [
    r1[0] * (y2 - y) / (y2 - y1) + r2[0] * (y - y1) / (y2 - y1),
    r1[1] * (y2 - y) / (y2 - y1) + r2[1] * (y - y1) / (y2 - y1),
    r1[2] * (y2 - y) / (y2 - y1) + r2[2] * (y - y1) / (y2 - y1),
    r1[3] * (y2 - y) / (y2 - y1) + r2[3] * (y - y1) / (y2 - y1)
  ]
}

// 检查点是否在四边形内
function isPointInQuadrilateral(x: number, y: number, corners: number[][]): boolean {
  const [p1, p2, p3, p4] = corners
  
  // 使用重心坐标判断
  function sign(p1: number[], p2: number[], p3: number[]): number {
    return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
  }
  
  const d1 = sign([x, y], p1, p2)
  const d2 = sign([x, y], p2, p4)
  const d3 = sign([x, y], p4, p3)
  const d4 = sign([x, y], p3, p1)
  
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0)
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0)
  
  return !(hasNeg && hasPos)
}

// 透视变换的逆变换，将输出坐标映射回输入坐标
function inversePerspectiveMapping(
  destX: number,
  destY: number,
  srcCorners: number[][],
  destCorners: number[][]
): number[] | null {
  // 使用双线性插值的逆变换
  const [tl, tr, bl, br] = destCorners
  const [srcTl, srcTr, srcBl, srcBr] = srcCorners
  
  // 计算在目标四边形中的相对位置
  const width = Math.max(tr[0] - tl[0], br[0] - bl[0])
  const height = Math.max(bl[1] - tl[1], br[1] - tr[1])
  
  if (width === 0 || height === 0) return null
  
  // 简化的逆映射（适用于轻微变换）
  const u = (destX - tl[0]) / width
  const v = (destY - tl[1]) / height
  
  // 双线性插值计算源坐标
  const srcX = srcTl[0] * (1 - u) * (1 - v) + 
               srcTr[0] * u * (1 - v) + 
               srcBl[0] * (1 - u) * v + 
               srcBr[0] * u * v
               
  const srcY = srcTl[1] * (1 - u) * (1 - v) + 
               srcTr[1] * u * (1 - v) + 
               srcBl[1] * (1 - u) * v + 
               srcBr[1] * u * v
  
  return [srcX, srcY]
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
  
  canvas.width = width
  canvas.height = height
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  // 如果没有旋转，直接绘制原图
  if (rotateX === 0 && rotateY === 0 && rotateZ === 0) {
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/png')
  }
  
  // 获取源图像数据
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  const tempCtx = tempCanvas.getContext('2d')!
  tempCtx.drawImage(img, 0, 0, width, height)
  const sourceImageData = tempCtx.getImageData(0, 0, width, height)
  const sourceData = sourceImageData.data
  
  // 创建目标图像数据
  const destImageData = ctx.createImageData(width, height)
  const destData = destImageData.data
  
  // 计算变换后的四个角
  const transformedCorners = getTransformedCorners(width, height, rotateX, rotateY, rotateZ)
  const sourceCorners = [[0, 0], [width, 0], [0, height], [width, height]]
  
  // 对每个像素进行逆变换采样
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const destIndex = (y * width + x) * 4
      
      // 计算源坐标
      const sourceCoord = inversePerspectiveMapping(x, y, sourceCorners, transformedCorners)
      
      if (sourceCoord) {
        let [srcX, srcY] = sourceCoord
        
        // 边界检查
        if (srcX >= 0 && srcX < width - 1 && srcY >= 0 && srcY < height - 1) {
          // 双线性插值采样
          const x1 = Math.floor(srcX)
          const y1 = Math.floor(srcY)
          const x2 = x1 + 1
          const y2 = y1 + 1
          
          const fx = srcX - x1
          const fy = srcY - y1
          
          const getPixel = (px: number, py: number) => {
            const idx = (py * width + px) * 4
            return [
              sourceData[idx],     // R
              sourceData[idx + 1], // G
              sourceData[idx + 2], // B
              sourceData[idx + 3]  // A
            ]
          }
          
          const p1 = getPixel(x1, y1)
          const p2 = getPixel(x2, y1)
          const p3 = getPixel(x1, y2)
          const p4 = getPixel(x2, y2)
          
          // 双线性插值
          for (let c = 0; c < 4; c++) {
            const top = p1[c] * (1 - fx) + p2[c] * fx
            const bottom = p3[c] * (1 - fx) + p4[c] * fx
            destData[destIndex + c] = Math.round(top * (1 - fy) + bottom * fy)
          }
        } else {
          // 超出边界，设为透明
          destData[destIndex] = 0
          destData[destIndex + 1] = 0
          destData[destIndex + 2] = 0
          destData[destIndex + 3] = 0
        }
      } else {
        // 无法映射，设为透明
        destData[destIndex] = 0
        destData[destIndex + 1] = 0
        destData[destIndex + 2] = 0
        destData[destIndex + 3] = 0
      }
    }
  }
  
  // 绘制到画布
  ctx.putImageData(destImageData, 0, 0)
  
  return canvas.toDataURL('image/png')
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