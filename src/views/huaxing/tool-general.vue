<template>
  <div class="app-container" style="width: 95%;margin: 0px 30px 0 0;">
    <el-row :gutter="20">
      <el-divider content-position="left">虚拟卡券 - 库存更新</el-divider>
      <el-col :span="6">
        <el-input v-model="virtualGoods.sku" placeholder="SKU"></el-input>
      </el-col>
      <el-col :span="6">
        <el-input v-model="virtualGoods.stock" :step="10" type="number" placeholder="库存数"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="refreshVirtualStock">更新</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-divider content-position="left">人员 - 导入</el-divider>
      <el-col :span="6">
        <el-input v-model="importMemberList" type="textarea" :autosize="{ minRows: 3}" :placeholder="'请输入工号\n一行一个\n支持“公司ID@工号”格式'"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="importMember">导入</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      env: '',
      virtualGoods: {
        sku: '',
        stock: ''
      },
      importMemberList: '',
      importMemberCompanyId: 'level_dazhong'
    }
  },
  created() {
    if (process.env.NODE_ENV === 'production') {
      this.env = 'prod'
    } else {
      this.env = 'test'
    }
  },
  methods: {
    refreshVirtualStock() {
      if (!this.virtualGoods.sku.trim() || (!this.virtualGoods.stock || parseInt(this.virtualGoods.stock) <= 0)) {
        this.$message.warning('请输入SKU和库存数')
        return
      }
      const loadingInstance = this.$loading({
        target: '.app-container'
      })

      this.$store
        .dispatch('huaxing/refreshVirtualStock', Object.assign({}, this.virtualGoods, { env: this.env }))
        .then(() => {
          this.$message.success('更新成功，一分钟左右生效')
        })
        .finally(() => loadingInstance.close())
    },
    importMember() {
      if (!this.importMemberList.trim()) {
        this.$message.warning('请输入工号')
        return
      }

      const loadingInstance = this.$loading({
        target: '.app-container',
        text: '若导入人员过多，请耐心等待'
      })
      this.$store
        .dispatch('huaxing/importMember', Object.assign({}, {
          content: this.importMemberList,
          bn: this.importMemberCompanyId,
          env: this.env
        }))
        .then(({ body }) => {
          if (body === 0) {
            this.$message.success('该批次人员都已在系统中，无须导入')
          } else {
            this.$message.success('成功导入' + body + '个人员')
          }
        })
        .finally(() => loadingInstance.close())
    }
  }
}
</script>
