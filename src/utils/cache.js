export default class Cache {
  constructor(keyPrefix) {
    this.key = keyPrefix + '-'
  }

  getValue(key) {
    return JSON.parse(localStorage.getItem(this.key + key))
  }

  setValue(key, value) {
    localStorage.setItem(this.key + key, JSON.stringify(value))
  }

  getListValue(key) {
    const dict = this.getValue(key) || {}
    const list = []
    for (const key in dict) {
      list.push(dict[key])
    }
    return list
  }

  getDict(key, id) {
    const dict = this.getValue(key) || {}
    return dict[id]
  }

  addDict(key, id, value) {
    const dict = this.getValue(key) || {}
    value['value'] = id
    dict[id] = value
    this.setValue(key, dict)
  }

  deductDict(key, id) {
    const dict = this.getValue(key) || {}
    delete dict[id]
    this.setValue(key, dict)
  }

  existDict(key, id) {
    const dict = this.getValue(key) || {}
    return dict[id] === undefined
  }

  getOrSet(key, value) {
    const result = this.getValue(key)
    if (result === null) {
      this.setValue(key, value)
      return value
    } else {
      return result
    }
  }
}
