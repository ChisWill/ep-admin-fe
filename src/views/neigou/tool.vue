<template>
  <div class="app-container" style="width: 95%;margin: 0px 30px 0 0;">
    <el-row>
      <el-divider content-position="left">京东库存更新</el-divider>
      <el-input v-model="jdStock" placeholder="SKU"></el-input>
      <el-button type="primary" style="margin-top: 10px" @click="updateJdStock">更新</el-button>
    </el-row>
    <el-row>
      <el-divider content-position="left">京东商品信息更新</el-divider>
      <el-input v-model="jdGoods" placeholder="SKU"></el-input>
      <el-button type="primary" style="margin-top: 10px" @click="updateJdGoods">更新</el-button>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jdStock: '',
      jdGoods: ''
    }
  },
  methods: {
    updateJdStock() {
      if (!this.checkJdSku(this.jdStock)) {
        return
      }
      const url = 'https://salyut.neigou.com/Home/CrontabJDMessage/pushJDStock/product_bn/' + this.jdStock
      window.open(url)
    },
    updateJdGoods() {
      if (!this.checkJdSku(this.jdGoods)) {
        return
      }
      const skuId = this.jdGoods.split('-')[1]
      const url = 'https://salyut.neigou.com/Home/CrontabJDMessage/updateJDByProductBn/skuId/' + skuId
      window.open(url)
    },
    checkJdSku(sku) {
      const pieces = sku.split('-')
      const name = pieces[0]
      const skuId = pieces[1]
      if (name !== 'JD') {
        this.$message.error('不是京东SKU')
        return false
      }
      if (!skuId) {
        this.$message.error('SKU格式错误')
        return false
      }
      return true
    }
  }
}
</script>
