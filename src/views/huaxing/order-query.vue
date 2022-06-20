<template>
  <div class="app-container" style="width: 95%; margin: 10px 30px 0 0;">
    <aside style="margin-bottom: 20px;">
      可混合华兴订单号、华兴支付流水号和内购订单号进行批量查询，并校验订单号是否重复，结果顺序保持和输入内容一致
    </aside>
    <el-form class="main-form" :model="form" label-width="120px">
      <el-form-item label="查询内容" required>
        <cache-input id="huaxing-order-query" ref="cache" placeholder="支持批量查询，空格或逗号分隔" :form="form" name="bn" :cache-id="getCacheId" @select="handleSelect"></cache-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="环境" required>
        <el-radio-group v-model="form.env">
          <el-radio v-for="(v, k) in envMap" :key="k" :label="k">{{ v }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">查询</el-button>
        <div style="display:inline-block; right:0; position: absolute;">
          <el-badge :value="list.length">
            <el-button type="info" icon="el-icon-document-copy" @click="copyColumn($event)">复制列</el-button>
            <el-button type="success" icon="el-icon-document" @click="exportExcel">导出列表</el-button>
            <el-button type="danger" @click="clearList">清空列表</el-button>
          </el-badge>
        </div>
      </el-form-item>
    </el-form>

    <el-table :data="list" stripe border>
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <el-table :data="row.items">
            <el-table-column prop="bn" label="商品编号"></el-table-column>
            <el-table-column prop="name" label="商品名称"></el-table-column>
            <el-table-column prop="cost" label="成本"></el-table-column>
            <el-table-column prop="price" label="价格"></el-table-column>
            <el-table-column prop="nums" label="数量"></el-table-column>
            <el-table-column prop="pmt_amount" label="优惠价"></el-table-column>
            <el-table-column prop="cost_freight" label="运费"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="env" label="环境" width="50"></el-table-column>
      <el-table-column prop="input" label="查询内容"></el-table-column>
      <checkbox-table-column prop="order_id" label="华兴订单号" checked @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="neigou_order_id" label="内购订单号" checked @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="mk" label="工号" checked @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="ship_name" label="收货人" @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="final_amount" label="总金额" @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="pay_status_text" label="支付状态" @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="pay_time" label="支付时间" @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="status_text" label="订单状态" @change="handleCheckbox"></checkbox-table-column>
      <el-table-column prop="wms_code" label="订单类型"></el-table-column>
      <el-table-column fixed="right" label="操作" width="90">
        <template slot-scope="{row}">
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import CacheInput from '@/components/CacheInput'
import CheckboxTableColumn from '@/components/CheckboxTableColumn'
import Arr from '@/utils/arr'
import { envMap, trimJson, date, handleExportExcel, handleTableColumnCheckbox, copyTableColumn } from '@/utils/app'

export default {
  components: {
    CacheInput,
    CheckboxTableColumn
  },
  data() {
    return {
      cache: null,
      key: 'order_id',
      envMap,
      form: {
        bn: '',
        remark: '',
        env: 'prod'
      },
      list: [],
      copyFields: []
    }
  },
  created() {
  },
  methods: {
    getCacheId(form) {
      let text
      if (form.remark) {
        text = form.remark
      } else {
        text = form.bn
      }
      return text + ' - ' + this.envMap[form.env]
    },
    handleSelect(item) {
      this.form = Object.assign({}, item)
    },
    handleDelete(row) {
      Arr.removeValue(this.list, this.key, row[this.key])
    },
    exportExcel() {
      handleExportExcel(this.list, {
        order_id: '华兴订单号', neigou_order_id: '内购订单号', mk: '工号', ship_name: '收货人', final_amount: '支付总金额', pay_status_text: '支付状态', pay_time: '支付时间', status_text: '订单状态'
      }, '订单列表 - ' + date('Y-m-d'))
    },
    clearList() {
      this.list = []
    },
    handleCheckbox(value) {
      handleTableColumnCheckbox(this.copyFields, value)
    },
    copyColumn(event) {
      copyTableColumn(event, this.list, this.copyFields)
    },
    submit() {
      trimJson(this.form)
      if (!this.form.bn) {
        return false
      }
      const loadingInstance = this.$loading({
        target: '.main-form'
      })
      this.$store.dispatch(
        'huaxing/queryOrder',
        this.form
      ).then(({ body }) => {
        this.$refs.cache.save(this.form)
        for (const row of body) {
          row.env = this.envMap[this.form.env]
        }
        this.list = body
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    }
  }
}
</script>
