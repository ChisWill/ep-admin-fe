<template>
  <div>
    <template v-for="(v,k) in data">
      <el-form-item v-if="v.show === true" :key="k" :label="v.label">
        <el-date-picker v-if="v.type === 'dateRange'" v-model="v.value" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="dateRangePickerOptions" unlink-panels></el-date-picker>
        <el-input v-else-if="v.type === 'text'" v-model="v.value" style="width: 300px" :placeholder="v.placeholder"></el-input>
        <el-button class="button" type="danger" @click="removeItem(v.field)">删除</el-button>
      </el-form-item>
    </template>
    <template v-if="restItems.length > 0">
      <el-form-item label="其它条件">
        <el-select v-model="selectedItem" placeholder="请选择条件" clearable>
          <el-option v-for="v in restItems" :key="v.field" :label="v.label" :value="v.field"></el-option>
        </el-select>
        <el-button v-if="selectedItem !== ''" class="button" type="success" @click="addItem">确认添加</el-button>
      </el-form-item>
    </template>
  </div>
</template>

<script>
import { rangePickerOptions } from '@/utils/app'

export default {
  name: 'FormMoreItem',
  props: {
    data: {
      type: Array,
      required: true
    },
    autoAdd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dateRangePickerOptions: rangePickerOptions,
      selectedItem: ''
    }
  },
  computed: {
    restItems() {
      return this.data.filter(v => v.show === false)
    }
  },
  created() {
    if (this.autoAdd === true) {
      this.$watch('selectedItem', function() {
        this.addItem()
      })
    }
  },
  methods: {
    addItem() {
      this.data.forEach(v => {
        if (v.field === this.selectedItem) {
          v.show = true
          this.selectedItem = ''
        }
      })
    },
    removeItem(field) {
      this.data.forEach(v => {
        if (v.field === field) {
          v.show = false
        }
      })
    },
    getFormData(form) {
      if (form.more && form.more.length > 0) {
        const newForm = Object.assign({}, form)
        const newItems = {}
        const moreItems = newForm.more
        delete newForm.more

        moreItems.forEach(v => {
          if (v.value !== '' && v.show === true) {
            newItems[v.field] = v.value
          }
        })
        return Object.assign(newForm, newItems)
      }
      return form
    }
  }
}
</script>

<style lang="scss" scoped>
.button {
  margin-left: 10px;
}
</style>
