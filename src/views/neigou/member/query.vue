<template>
  <div class="app-container" style="width: 95%; margin: 30px 30px 0 0;">
    <el-form :model="form" label-width="120px">
      <el-form-item label="账号" required>
        <cache-input id="neigou-member-query" ref="cache" placeholder="支持批量查询，空格或逗号分隔" :form="form" name="mk" :cache-id="getCacheId" @select="handleSelect"></cache-input>
      </el-form-item>
      <el-form-item label="账号类型" required>
        <el-radio-group v-model="form.mkType">
          <el-radio-button label="mk">员工工号</el-radio-button>
          <el-radio-button label="order_id">订单号</el-radio-button>
          <el-radio-button label="name">姓名</el-radio-button>
          <el-radio-button label="guid">guid</el-radio-button>
          <el-radio-button label="neigou_id">member_id</el-radio-button>
          <el-radio-button label="uc_id">uc_id</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="ignoreBnFields.indexOf(form.mkType) === -1" label="企业标识" required>
        <el-input v-model="form.bn" style="width: 300px;"></el-input>
      </el-form-item>
      <el-form-item v-if="ignoreBnFields.indexOf(form.mkType) === -1" label="标识类型" required>
        <el-radio-group v-model="form.bnType">
          <el-radio-button label="bn">企业编号</el-radio-button>
          <el-radio-button label="id">company_id</el-radio-button>
          <el-radio-button label="gid">gcorp_id</el-radio-button>
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
      <el-table-column prop="env" label="环境" width="50"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column prop="real_name" label="姓名"></el-table-column>
      <el-table-column prop="company_name" label="企业名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="mobile" label="手机号" width="110"></el-table-column>
      <el-table-column prop="member_key_raw">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="member_key_raw" style="vertical-align: middle;"> 工号 </label>
        </template>
      </el-table-column>
      <el-table-column prop="guid">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="guid" style="vertical-align: middle;"> guid </label>
        </template>
      </el-table-column>
      <el-table-column prop="member_id" width="115">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="member_id" style="vertical-align: middle;"> member_id </label>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="uc_id">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="id" style="vertical-align: middle;"> uc_id </label>
        </template>
      </el-table-column>
      <el-table-column prop="corp_id" label="gcorp_id"></el-table-column>
      <el-table-column prop="company_id" label="company_id" width="105"></el-table-column>
      <el-table-column prop="state" label="在职状态"></el-table-column>
      <el-table-column prop="data_source" label="员工来源">
        <template slot-scope="{row}">
          <el-tooltip v-if="row.data_source !== row.last_source" :content="row.last_source_text">
            <span style="color: #E6A23C">{{ row.data_source_text }}</span>
          </el-tooltip>
          <span v-else>{{ row.data_source_text }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="channel_info" label="渠道信息">
        <template slot-scope="{row}">
          <el-button v-if="row.channel_info.qy.error === '0'" type="success" size="small" circle @click="showQyWeixinInfo(row.member_key_raw, row.channel_info.qy)">企业微信</el-button>
          <el-button v-else-if="row.channel_info.qy.error === '-1'" type="info" size="small" circle>企业微信</el-button>
          <el-button v-else type="warning" size="small" circle @click="showQyWeixinInfo(row.channel_info.qy)">企业微信</el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="{row}">
          <el-button type="warning" size="small" @click="queryLink(row)">C端链接</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="qyInfo.mk + '的企业微信详情'" :visible.sync="showQiyeDialog">
      <el-row :gutter="20">
        <el-col :span="12"><el-divider content-position="left">qy_corp_id</el-divider></el-col>
        <el-col :span="12"><el-divider content-position="left">suite_id</el-divider></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><span>{{ qyInfo.qy_corp_id }}</span></el-col>
        <el-col :span="12"><span v-html="qyInfo.suite_id.join('<br>')"></span></el-col>
      </el-row>
      <template v-if="qyInfo.error === '0'">
        <el-row :gutter="20">
          <el-col :span="12"><el-divider content-position="left">用户ID</el-divider></el-col>
          <el-col :span="12"><el-divider content-position="left">姓名</el-divider></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><span>{{ qyInfo.body.userid }}</span></el-col>
          <el-col :span="12"><span>{{ qyInfo.body.name }}</span></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-divider content-position="left">Email</el-divider></el-col>
          <el-col :span="12"><el-divider content-position="left">手机号</el-divider></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><span>{{ qyInfo.body.email }}</span></el-col>
          <el-col :span="12"><span>{{ qyInfo.body.mobile }}</span></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-divider content-position="left">部门</el-divider></el-col>
          <el-col :span="12"><el-divider content-position="left">附加属性</el-divider></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><span v-html="qyInfo.body.department.join('<br>')"></span></el-col>
          <el-col :span="12"><span>{{ JSON.stringify(qyInfo.body.extattr) }}</span></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-divider content-position="left">性别</el-divider></el-col>
          <el-col :span="12"><el-divider content-position="left">状态</el-divider></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><span>{{ qyInfo.body.gender }}</span></el-col>
          <el-col :span="12"><span>{{ qyInfo.body.status }}</span></el-col>
        </el-row>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showQiyeDialog = false">关 闭</el-button>
      </span>
    </el-dialog>

    <span ref="copyBtn" style="display: none;" @click="copyLink"></span>
  </div>
</template>

<script>
import clip from '@/utils/clipboard'
import CacheInput from '@/components/CacheInput'
import Cache from '@/utils/cache'
import Arr from '@/utils/arr'
import { envMap, envTextMap, surlMap, trimJson, date, handleExportExcel, copyTableOneColumn } from '@/utils/app'

export default {
  components: {
    CacheInput
  },
  data() {
    return {
      cache: null,
      key: 'guid',
      envMap,
      form: {
        mk: '',
        mkType: 'mk',
        env: 'prod',
        bn: '',
        bnType: 'bn',
        remark: ''
      },
      qyInfo: {
        mk: '',
        error: '-1',
        qy_corp_id: '',
        suite_id: []
      },
      ignoreBnFields: ['order_id', 'neigou_id', 'uc_id'],
      list: [],
      showQiyeDialog: false,
      ssoLink: '',
      copyField: 'member_key_raw',
      copyFieldStringList: ['member_key_raw']
    }
  },
  created() {
    this.cache = new Cache('neigou-member-query')
    const list = this.cache.getValue('list') || []
    this.list = list.reverse()
  },
  activated() {
    if (this.$route.params.bn) {
      if (this.$route.params.mkType === 'any') {
        this.$route.params.mkType = 'mk'
      }
      this.form = this.$route.params
    }
  },
  methods: {
    copyColumn(event) {
      let isString = false
      if (this.copyFieldStringList.indexOf(this.copyField) !== -1) {
        isString = true
      }
      copyTableOneColumn(event, this.list, this.copyField, isString)
    },
    queryLink(row) {
      const loadingInstance = this.$loading({
        target: '.el-table'
      })
      this.$store.dispatch(
        'neigou/createAghSso',
        {
          mk: row.member_key_raw,
          mkType: 'mk',
          env: envTextMap[row.env],
          bn: row.corp_id,
          bnType: 'gid',
          expire: 300,
          surl: surlMap[envTextMap[row.env]]
        }
      ).then(({ body }) => {
        this.ssoLink = body
        this.$refs.copyBtn.click()
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    },
    copyLink(event) {
      clip(this.ssoLink, event)
    },
    getCacheId(form) {
      let text
      if (form.remark) {
        text = form.remark
      } else {
        switch (form.mkType) {
          case 'order_id':
            text = '订单 - ' + form.mk
            break
          case 'neigou_id':
            text = 'NG - ' + form.mk
            break
          case 'uc_id':
            text = 'AGH - ' + form.mk
            break
          default:
            text = form.bn + ' - ' + form.mk
            break
        }
      }
      return text + ' - ' + this.envMap[form.env]
    },
    showQyWeixinInfo(mk, data) {
      this.qyInfo = data
      this.qyInfo.mk = mk
      this.showQiyeDialog = true
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
        remark: '备注', real_name: '姓名', member_key_raw: '工号', mobile: '手机号', guid: 'guid', corp_id: 'gcorp_id', member_id: 'member_id', company_id: 'company_id', id: 'uc_id', state: '在职状态'
      }, '员工列表 - ' + date('Y-m-d'))
    },
    clearList() {
      this.list = []
      this.cache.setValue('list', [])
    },
    submit() {
      trimJson(this.form)
      if (!this.form.mk) {
        return false
      }
      const loadingInstance = this.$loading({
        target: '.el-form'
      })
      if (this.form.mkType === 'order_id') {
        this.form.bn = ''
      }
      this.$store.dispatch(
        'neigou/queryMember',
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
