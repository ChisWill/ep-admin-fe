import { Message } from 'element-ui'
import Arr from '@/utils/arr'
import clip from '@/utils/clipboard'

export const envMap = {
  prod: '生产',
  test: '测试'
}

export const envTextMap = {
  '生产': 'prod',
  '测试': 'test'
}

export const surlMap = {
  prod: 'https://life.neigou.com',
  test: 'https://life.test.neigou.com'
}

export const adminSurlMap = {
  prod: 'https://b.ddguanhuai.com',
  test: 'https://b.test.ddguanhuai.com'
}

export const misMap = {
  prod: 'https://mis.neigou.com',
  test: 'https://mis.test.neigou.com'
}

export function trimJson(json) {
  if (typeof json !== 'object') {
    return
  }
  for (const key in json) {
    switch (typeof json[key]) {
      case 'string':
      case 'number':
        json[key] = json[key].toString().trim()
        break
    }
  }
}

export function handleExportExcel(list, map, title) {
  if (list.length === 0) {
    Message.warning('列表为空，无法导出')
    return
  }
  const header = []
  const fields = []
  for (const k in map) {
    fields.push(k)
    header.push(map[k])
  }
  const filterData = (data, fields) => data.map(v => fields.map(j => v[j]))
  import('@/vendor/Export2Excel').then(excel => {
    excel.export_json_to_excel({
      header,
      data: filterData(list, fields),
      filename: title,
      autoWidth: true
    })
  })
}

export function handleTableColumnCheckbox(list, { prop, label, value }) {
  const item = { prop, label }
  if (value === true) {
    list.push(item)
  } else {
    Arr.removeValue(list, 'prop', prop)
  }
}

export function copyTableColumn(event, list, fields) {
  if (fields.length === 0) {
    Message.warning('未勾选要复制的列')
    return
  }
  if (list.length === 0) {
    Message.warning('当前列表为空，无法复制')
    return
  }

  let content = ''
  let d = ''
  const arr = []
  fields.map(item => arr.push(item.label))
  content += d + arr.join('\t')
  d = '\n'
  list.map(row => {
    const arr = []
    fields.map(item => arr.push(row[item.prop]))
    content += d + arr.join('\t')
  })
  clip(content, event)
}

export function copyTableOneColumn(event, list, field, isString = true) {
  if (!field) {
    Message.warning('未勾选要复制的列')
    return
  }
  if (list.length === 0) {
    Message.warning('当前列表为空，无法复制')
    return
  }

  const arr = []
  list.map(row => {
    arr.push(row[field])
  })
  if (isString) {
    clip('"' + arr.join('","') + '"', event)
  } else {
    clip(arr.join(','), event)
  }
}

export function date(format, date) {
  if (!format) {
    return ''
  }
  if (!date) {
    date = new Date()
  } else {
    if (!isNaN(date)) {
      date = Number(date)
    }
    date = new Date(date)
  }
  var dealNum = function(num) {
    if (num < 10) {
      return '0' + num
    } else {
      return num
    }
  }
  var formatArr = ['Y', 'm', 'd', 'H', 'i', 's']
  for (var i = 0; i < formatArr.length; i++) {
    switch (formatArr[i]) {
      case 'Y':
        format = format.replace(formatArr[i], date.getFullYear())
        break
      case 'm':
        format = format.replace(formatArr[i], dealNum(date.getMonth() + 1))
        break
      case 'd':
        format = format.replace(formatArr[i], dealNum(date.getDate()))
        break
      case 'H':
        format = format.replace(formatArr[i], dealNum(date.getHours()))
        break
      case 'i':
        format = format.replace(formatArr[i], dealNum(date.getMinutes()))
        break
      case 's':
        format = format.replace(formatArr[i], dealNum(date.getSeconds()))
        break
    }
  }
  return format
}

export function strtotime(date) {
  return new Date(date).getTime()
}

export const pickerOptions = {
  shortcuts: [{
    text: '昨天',
    onClick(picker) {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 24 * 1000)
      picker.$emit('pick', date)
    }
  }, {
    text: '一周前',
    onClick(picker) {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 24 * 7 * 1000)
      picker.$emit('pick', date)
    }
  }, {
    text: '一个月前',
    onClick(picker) {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 24 * 30 * 1000)
      picker.$emit('pick', date)
    }
  }, {
    text: '一年前',
    onClick(picker) {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 24 * 365 * 1000)
      picker.$emit('pick', date)
    }
  }]
}

export const rangePickerOptions = {
  shortcuts: [{
    text: '今天',
    onClick(picker) {
      const start = strtotime(date('Y-m-d 00:00:00'))
      const end = start + 86400000
      picker.$emit('pick', [new Date(start), new Date(end)])
    }
  }, {
    text: '上个月',
    onClick(picker) {
      const end = strtotime(date('Y-m-01 00:00:00')) - 1000
      const start = strtotime(date('Y-m-01 00:00:00', end))
      picker.$emit('pick', [new Date(start), new Date(end)])
    }
  }, {
    text: '最近七天',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      picker.$emit('pick', [start, end])
    }
  }, {
    text: '最近一个月',
    onClick(picker) {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      picker.$emit('pick', [start, end])
    }
  }]
}
