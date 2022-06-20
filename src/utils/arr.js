export default class Arr {
  static uniqueMergeDictArr(oldArr, newArr, keyField) {
    const map = {}
    for (const item of newArr) {
      map[item[keyField]] = 1
    }
    const result = []
    for (const i in oldArr) {
      if (!map[oldArr[i][keyField]]) {
        result.push(oldArr[i])
      }
    }
    return result.concat(newArr)
  }

  /**
   * 一维数组根据值删除
   */
  static remove(arr, value) {
    arr.splice(arr.indexOf(value), 1)
  }

  /**
   * 根据数组索引删除
   */
  static removeIndex(arr, index) {
    arr.splice(index, 1)
  }

  /**
   * 二维数组根据值删除
   */
  static removeValue(arr, field, value) {
    for (const i in arr) {
      if (arr[i][field] === value) {
        arr.splice(i, 1)
      }
    }
  }
}
