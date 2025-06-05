import * as XLSX from 'xlsx'

/**
 * 导出表格数据到Excel
 * @param {Array} data - 要导出的数据数组
 * @param {String} fileName - 导出的文件名
 * @param {Array} headers - 表头配置，格式：[{label: '显示名称', prop: '字段名'}]
 */
export const exportToExcel = (data, fileName, headers) => {
  // 转换数据格式
  const exportData = data.map(item => {
    const row = {}
    headers.forEach(header => {
      // 处理特殊字段
      if (header.prop === 'status') {
        row[header.label] = item[header.prop] === 1 ? '已消除' : '告警中'
      } else {
        row[header.label] = item[header.prop]
      }
    })
    return row
  })

  // 创建工作簿
  const wb = XLSX.utils.book_new()
  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(exportData)
  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  // 导出文件
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

