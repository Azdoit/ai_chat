// 计算当前日期
export const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // 月份从0开始，需要加1
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 将日期和时间转换为时间戳
export const getTimestamp = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return 0

  const [hours, minutes] = timeStr.split(':')
  const date = new Date(dateStr)
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

  return date.getTime()
}
