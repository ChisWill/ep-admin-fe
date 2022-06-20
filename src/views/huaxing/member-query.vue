<template>
  <div class="app-container" style="width: 95%; margin: 10px 30px 0 0;">
    <aside style="margin-bottom: 20px;">
      可混合客户号、华兴订单号和内购订单号进行批量查询，结果顺序保持和输入内容一致
    </aside>
    <el-form :model="form" label-width="120px">
      <el-form-item label="客户号或订单号" required>
        <cache-input id="huaxing-member-query" ref="cache" placeholder="支持批量查询，空格或逗号分隔" :form="form" name="mk" :cache-id="getCacheId" @select="handleSelect"></cache-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="环境" required>
        <el-radio-group v-model="form.env">
          <el-radio v-for="(v, k) in envMap" :key="k" :label="k">{{ v }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="agh-corp_id">
        <span>{{ aghCorpIdMap[form.env] }}</span>
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
      <el-table-column prop="env" label="环境" width="50"></el-table-column>
      <checkbox-table-column prop="remark" label="备注" @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="mk" label="客户号" checked @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="order_id" label="关联订单号" checked @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="member_id" label="member_id" @change="handleCheckbox"></checkbox-table-column>
      <checkbox-table-column prop="company_ids" label="company_ids" @change="handleCheckbox">
        <template slot-scope="{row}">
          <span v-html="row.company_ids.split(',').join('<br>')"></span>
        </template>
      </checkbox-table-column>
      <checkbox-table-column prop="company_bns" label="所在企业" @change="handleCheckbox">
        <template slot-scope="{row}">
          <span v-html="row.company_bns.split(',').join('<br>')"></span>
        </template>
      </checkbox-table-column>
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
import Cache from '@/utils/cache'
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
      key: 'member_id',
      envMap,
      aghCorpIdMap: {
        test: 53958,
        prod: 2671540
      },
      form: {
        mk: '',
        remark: '',
        env: 'prod'
      },
      list: [],
      copyFields: []
    }
  },
  created() {
    this.cache = new Cache('huaxing-member-query')
    const list = this.cache.getValue('list') || []
    this.list = list.reverse()
  },
  methods: {
    getCacheId(form) {
      let text
      if (form.remark) {
        text = form.remark
      } else {
        text = form.mk
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
        remark: '备注', mk: '工号', order_id: '关联订单号', member_id: 'member_id', company_ids: 'company_ids', company_bns: '所在企业'
      }, '华兴人员列表 - ' + date('Y-m-d'))
    },
    clearList() {
      this.list = []
      this.cache.setValue('list', [])
    },
    handleCheckbox(value) {
      handleTableColumnCheckbox(this.copyFields, value)
    },
    copyColumn(event) {
      copyTableColumn(event, this.list, this.copyFields)
    },
    submit() {
      trimJson(this.form)
      if (!this.form.mk) {
        return false
      }
      const loadingInstance = this.$loading({
        target: '.el-form'
      })
      this.$store.dispatch(
        'huaxing/queryMember',
        this.form
      ).then(({ body }) => {
        this.$refs.cache.save(this.form)
        for (const row of body) {
          row.env = this.envMap[this.form.env]
          row.remark = this.form.remark
        }
        this.cache.setValue('list', body)
        this.list = body
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    }
  }
}
</script>
