export default class Str {
  static ucfirst(string) {
    return string.toLowerCase().replace(/( |^)[a-z]/g, s => s.toUpperCase())
  }

  static explode(chars, string) {
    return string.split(new RegExp('[' + chars + ']'))
  }

  static random(length, chars) {
    chars = chars || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '2', '3', '4', '5', '6', '7', '8', '9']
    chars.sort(() => Math.random() > 0.5 ? -1 : 1)
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[Math.round(Math.random() * (chars.length - 1))]
    }
    return result
  }
}
