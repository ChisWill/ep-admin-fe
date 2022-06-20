<template>
  <div class="app-container" style="width: 95%; margin: 30px 30px 0 0;">
    <el-form :model="form" label-width="120px">
      <el-form-item label="查询内容" required>
        <cache-input id="neigou-order-refund" ref="cache" placeholder="支持批量查询，空格或逗号分隔" :form="form" name="bn" :cache-id="getCacheId" @select="handleSelect"></cache-input>
      </el-form-item>
      <el-form-item label="查询类型" required>
        <el-radio-group v-model="form.bnType">
          <el-radio-button label="mis_refund_id">Mis退款单号</el-radio-button>
          <el-radio-button label="store_refund_id">Store退款单号</el-radio-button>
          <el-radio-button label="order_id">订单号</el-radio-button>
          <el-radio-button label="after_id">售后单号</el-radio-button>
          <el-radio-button label="payment_id">支付流水号</el-radio-button>
          <el-radio-button label="neigou_id">member_id</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" style="width: 300px;"></el-input>
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
            <el-button type="info" icon="el-icon-document-copy" @click="copyColumn($event)">复制所选列</el-button>
            <el-button type="success" icon="el-icon-document" @click="exportExcel">导出列表</el-button>
            <el-button type="danger" @click="clearList">清空列表</el-button>
          </el-badge>
        </div>
      </el-form-item>
    </el-form>

    <el-table :data="list" stripe border>
      <el-table-column type="expand">
        <template slot-scope="{row}">
          <el-table :data="row.assets">
            <el-table-column prop="assets_type_text" label="资产类型"></el-table-column>
            <el-table-column prop="refund_id" label="store退款单号"></el-table-column>
            <el-table-column prop="payment_id" label="支付流水号"></el-table-column>
            <el-table-column prop="money" label="退款金额"></el-table-column>
            <el-table-column prop="extend_text" label="扩展信息"></el-table-column>
            <el-table-column prop="status_text" label="状态"></el-table-column>
            <el-table-column prop="update_time" label="操作时间"></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="env" label="环境" width="50"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column prop="real_name" label="姓名">
        <template slot-scope="{row}">
          <el-tooltip :content="row.member_id">
            <a style="color: #409EFF;" @click="gotoUserDetail(row)">{{ row.real_name }}</a>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="company_name" label="公司名称">
        <template slot-scope="{row}">
          <el-tooltip :content="row.company_id">
            <a style="color: #409EFF;" @click="gotoCompanyDetail(row)">{{ row.company_name }}</a>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="refund_id">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="refund_id" style="vertical-align: middle;"> MIS退款单号 </label>
        </template>
      </el-table-column>
      <el-table-column prop="order_id">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="order_id" style="vertical-align: middle;"> 订单号 </label>
        </template>
      </el-table-column>
      <el-table-column prop="money" label="总退款金额"></el-table-column>
      <el-table-column prop="status_text" label="退款状态"></el-table-column>
      <el-table-column prop="process_status_text" label="处理状态"></el-table-column>
      <el-table-column prop="source_text" label="来源"></el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="160"></el-table-column>
      <el-table-column fixed="right" label="操作" width="210">
        <template slot-scope="{row}">
          <el-button type="primary" size="small" @click="openMisDetail(row)">详情</el-button>
          <el-button v-if="row.process_status !== '2'" type="warning" size="small" @click="retryRefund(row)">重试</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import clip from '@/utils/clipboard'
import CacheInput from '@/components/CacheInput'
import Cache from '@/utils/cache'
import Arr from '@/utils/arr'
import { envMap, misMap, envTextMap, trimJson, date, handleExportExcel, copyTableOneColumn } from '@/utils/app'

export default {
  components: {
    CacheInput
  },
  data() {
    return {
      cache: null,
      key: 'refund_id',
      envMap,
      form: {
        bn: '',
        bnType: 'mis_refund_id',
        env: 'prod',
        remark: ''
      },
      list: [],
      copyField: 'refund_id',
      copyFieldStringList: ['refund_id', 'order_id']
    }
  },
  created() {
    this.cache = new Cache('neigou-order-refund')
    const list = this.cache.getValue('list') || []
    this.list = list.reverse()
  },
  methods: {
    gotoUserDetail(row) {
      this.$router.push({ name: 'NeigouMemberQuery', params: {
        mk: row.member_id,
        mkType: 'neigou_id',
        env: envTextMap[row.env],
        bn: row.company_id,
        bnType: 'id',
        remark: ''
      }})
    },
    gotoCompanyDetail(row) {
      this.$router.push({ name: 'NeigouCorpQuery', params: {
        env: envTextMap[row.env],
        bn: row.company_id,
        bnType: 'id',
        remark: ''
      }})
    },
    openMisDetail(row) {
      window.open(misMap[envTextMap[row.env]] + '/Admin/Refund/refundDetails?refundId=' + row.refund_id, '_blank')
    },
    retryRefund(row) {
      window.open(misMap[envTextMap[row.env]] + '/Admin/Refund/restartRefund/refund_id/' + row.refund_id, '_blank')
    },
    copyColumn(event) {
      let isString = false
      if (this.copyFieldStringList.indexOf(this.copyField) !== -1) {
        isString = true
      }
      copyTableOneColumn(event, this.list, this.copyField, isString)
    },
    copyLink(event) {
      clip(this.ssoLink, event)
    },
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
      this.cache.setValue('list', this.list)
    },
    exportExcel() {
      handleExportExcel(this.list, {
        remark: '备注', real_name: '姓名', company_name: '公司名称', refund_id: 'Mis退款单号', order_id: '订单号', money: '退款金额', status_text: '退款状态', process_status_text: '处理状态', source_text: '来源', create_time: '创建时间'
      }, '退款列表 - ' + date('Y-m-d'))
    },
    clearList() {
      this.list = []
      this.cache.setValue('list', [])
    },
    submit() {
      trimJson(this.form)
      if (!this.form.bn) {
        return false
      }
      const loadingInstance = this.$loading({
        target: '.el-form'
      })
      this.$store.dispatch(
        'neigou/queryRefund',
        this.form
      ).then(({ body }) => {
        this.$refs.cache.save(this.form)
        for (const row of body) {
          row.env = this.envMap[this.form.env]
          row.remark = this.form.remark
        }
        const list = Arr.uniqueMergeDictArr(this.cache.getValue('list') || [], body, this.key)
        this.cache.setValue('list', list)
        this.list = list.reverse()
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    }
  }
}
</script>
