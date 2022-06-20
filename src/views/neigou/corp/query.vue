<template>
  <div class="app-container" style="width: 95%; margin: 30px 30px 0 0;">
    <el-form :model="form" label-width="120px">
      <el-form-item label="企业标识" required>
        <cache-input id="neigou-corp-query" ref="cache" placeholder="支持批量查询，空格或逗号分隔" :form="form" name="bn" :cache-id="getCacheId" @select="handleSelect"></cache-input>
      </el-form-item>
      <el-form-item label="标识类型" required>
        <el-radio-group v-model="form.bnType">
          <el-radio-button label="name">企业名称</el-radio-button>
          <el-radio-button label="bn">企业编号</el-radio-button>
          <el-radio-button label="id">company_id</el-radio-button>
          <el-radio-button label="gid">gcorp_id</el-radio-button>
          <el-radio-button label="channel">渠道名</el-radio-button>
          <el-radio-button label="outerid">外部企业编号</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.bnType === 'outerid'" label="渠道名">
        <el-input v-model="form.channel" style="width: 300px"></el-input>
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
      <el-table-column prop="full_name" label="企业全称"></el-table-column>
      <el-table-column prop="simple_name" label="企业简称"></el-table-column>
      <el-table-column prop="company_code">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="company_code" style="vertical-align: middle;"> 企业编号 </label>
        </template>
      </el-table-column>
      <el-table-column prop="gcorp_id">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="gcorp_id" style="vertical-align: middle;"> gcorp_id </label>
        </template>
      </el-table-column>
      <el-table-column prop="company_id">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="company_id" style="vertical-align: middle;"> company_id </label>
        </template>
      </el-table-column>
      <el-table-column prop="utm_source" label="来源"></el-table-column>
      <el-table-column label="积分金额" width="90">
        <template slot-scope="{row}">
          <el-button v-if="!point[row.gcorp_id]" type="warning" size="small" @click="queryCorpPoint(row.env, row.gcorp_id, row.simple_name)">查询</el-button>
          <span v-else v-html="point[row.gcorp_id]"></span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="{row}">
          <el-button v-if="row.login_account" type="primary" size="small" @click="queryLink(row)">B端链接</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="point.name + '的积分详情'" :visible.sync="showPointDialog">
      <el-row :gutter="20">
        <el-col :span="12"><el-divider content-position="left">是否为三方积分</el-divider></el-col>
        <el-col :span="12"><el-divider content-position="left">B端积分对应RMB（元）</el-divider></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><span>{{ point.type_text }}</span></el-col>
        <el-col :span="12"><span>{{ point.corp_total }}</span></el-col>
      </el-row>
      <template v-if="point.version === 1">
        <el-row :gutter="20">
          <el-col :span="12"><el-divider content-position="left">积分类型</el-divider></el-col>
          <el-col :span="12"><el-divider content-position="left">C端积分对应RMB（元）</el-divider></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><span>{{ point.version_text }}</span></el-col>
          <el-col :span="12"><span>{{ point.member_total }}</span></el-col>
        </el-row>
      </template>
      <template v-if="point.version === 2">
        <el-row :gutter="20">
          <el-col :span="12"><el-divider content-position="left">B端场景列表</el-divider></el-col>
          <el-col :span="12"><el-divider content-position="left">C端场景列表</el-divider></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-tree :data="point.corp_scene_data" default-expand-all></el-tree></el-col>
          <el-col :span="12"><el-tree :data="point.member_scene_data" default-expand-all></el-tree></el-col>
        </el-row>
      </template>
      <el-row :gutter="20">
        <el-col :span="12"><el-divider content-position="left">C端积分展示比例</el-divider></el-col>
        <el-col :span="12"><el-divider content-position="left">B、C端金额合计（元）</el-divider></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><span>{{ point.exchange_rate }}</span></el-col>
        <el-col :span="12"><span>{{ point.total }}</span></el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showPointDialog = false">关 闭</el-button>
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
import { envMap, envTextMap, adminSurlMap, trimJson, date, handleExportExcel, copyTableOneColumn } from '@/utils/app'

export default {
  components: {
    CacheInput
  },
  data() {
    return {
      cache: null,
      key: 'gcorp_id',
      envMap,
      envTextMap,
      form: {
        bn: '',
        bnType: 'bn',
        channel: '',
        env: 'prod',
        remark: ''
      },
      pointDataMap: {},
      point: {},
      list: [],
      showPointDialog: false,
      link: '',
      copyField: 'company_id'
    }
  },
  created() {
    this.cache = new Cache('neigou-corp-query')
    const list = this.cache.getValue('list') || []
    this.list = list.reverse()
  },
  activated() {
    if (this.$route.params.bn) {
      this.form = this.$route.params
    }
  },
  methods: {
    copyColumn(event) {
      copyTableOneColumn(event, this.list, this.copyField, false)
    },
    queryLink(row) {
      const loadingInstance = this.$loading({
        target: '.el-table'
      })
      this.$store.dispatch(
        'neigou/createAghSso',
        {
          mk: row.login_account,
          mkType: 'guid',
          env: envTextMap[row.env],
          bn: row.gcorp_id,
          bnType: 'gid',
          expire: 300,
          surl: adminSurlMap[envTextMap[row.env]]
        }
      ).then(({ body }) => {
        this.link = body
        this.$refs.copyBtn.click()
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    },
    copyLink(event) {
      clip(this.link, event)
    },
    getCacheId(form) {
      let text
      if (form.remark) {
        text = form.remark
      } else {
        text = form.bn
      }
      return text + ' - ' + this.envMap[this.form.env]
    },
    handleSelect(item) {
      this.form = Object.assign({}, item)
    },
    handleDelete(row) {
      Arr.removeValue(this.list, this.key, row[this.key])
      this.cache.setValue('list', this.list)
    },
    queryCorpPoint(env, gcorp_id, simple_name) {
      if (this.pointDataMap[gcorp_id]) {
        this.point = this.pointDataMap[gcorp_id]
        this.showPointDialog = true
        return
      }

      const loadingInstance = this.$loading({
        target: '.el-table'
      })
      env = this.envTextMap[env]

      const generateSceneTreeData = scenes => {
        const data = []
        for (const row of scenes) {
          const item = {
            label: row.name,
            children: [{
              label: 'point: ' + row.point
            }, {
              label: 'scene_id: ' + row.scene_id
            }]
          }
          data.push(item)
        }
        return data
      }

      this.$store.dispatch(
        'neigou/queryCorpPoint',
        { env, gcorp_id }
      ).then(({ body }) => {
        if (body.version === 1) {
          body.total = body.corp_total + body.member_total
        } else if (body.version === 2) {
          body.corp_scene_data = generateSceneTreeData(body.corp_scenes)
          body.member_scene_data = generateSceneTreeData(body.member_scenes)
          let total = 0
          for (const row of body.corp_scenes) {
            total += parseFloat(row.point)
          }
          for (const row of body.member_scenes) {
            total += parseFloat(row.point)
          }
          body.total = total
        } else {
          body.total = 0
        }
        body.total = body.total.toFixed(2)
        body.name = simple_name
        this.showPointDialog = true
        this.pointDataMap[gcorp_id] = body
        this.point = body
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    },
    exportExcel() {
      handleExportExcel(this.list, {
        remark: '备注', full_name: '企业全称', simple_name: '企业简称', company_code: '企业编码', gcorp_id: 'gcorp_id', company_id: 'company_id', utm_source: '来源'
      }, '企业列表 - ' + date('Y-m-d'))
    },
    clearList() {
      this.$confirm('此列表清空后将失去其它表单的企业搜索提示，确认清空么？', '请注意')
        .then(() => {
          this.list = []
          this.cache.setValue('list', [])
        })
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
        'neigou/queryCorp',
        this.form
      ).then(({ body }) => {
        this.$refs.cache.save(this.form)

        for (const row of body) {
          row['remark'] = this.form.remark
          row['env'] = this.envMap[this.form.env]
          if (row.channel !== '') {
            row['utm_source'] = row.channel
          }
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
