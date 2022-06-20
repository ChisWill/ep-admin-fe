<template>
  <div class="app-container" style="width: 95%; margin: 10px 30px 0 0;">
    <aside style="margin-bottom: 20px;">
      该SSO链接只有60秒有效期
    </aside>
    <el-form :model="form" label-width="120px">
      <el-tooltip effect="dark" content="支持华兴和内购订单号" placement="top-start">
        <el-form-item label="客户号或订单号" required>
          <cache-input id="huaxing-sso-link" ref="cache" :form="form" name="mk" :cache-id="getCacheId" @select="handleSelect"></cache-input>
        </el-form-item>
      </el-tooltip>
      <el-form-item label="公司编号" required>
        <el-autocomplete v-model="form.bn" :fetch-suggestions="queryBns" @select="handleBn"></el-autocomplete>
      </el-form-item>
      <el-form-item label="最终跳转地址">
        <el-input v-model="form.surl"></el-input>
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
        <el-button type="primary" @click="submit">创建</el-button>
      </el-form-item>
      <el-form-item v-if="showResult" label="生成结果">
        <el-link type="success" @click="copyLink($event)">点我复制</el-link>
        &nbsp;
        <el-link :href="ssoLink" type="warning" target="_blank">点我打开新页面</el-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import clip from '@/utils/clipboard'
import CacheInput from '@/components/CacheInput'
import { envMap, trimJson } from '@/utils/app'

export default {
  components: {
    CacheInput
  },
  data() {
    return {
      lastEnv: null,
      showResult: false,
      ssoLink: '',
      bnMap: {
        test: null,
        prod: null
      },
      envMap,
      surlMap: {
        prod: 'https://life-q.huaxing.leho.com',
        test: 'https://life-q.test.leho.com'
      },
      form: {
        mk: '', // 人员工号
        env: 'prod',
        bn: 'level_dazhong', // 外部企业编码
        surl: 'https://life-q.huaxing.leho.com',
        remark: ''
      }
    }
  },
  watch: {
    'form.env': function(val, oldVal) {
      this.showResult = this.lastEnv === val
      if (this.form.surl === this.surlMap[oldVal]) {
        this.form.surl = this.surlMap[val]
      }
    }
  },
  methods: {
    getCacheId(form) {
      let text
      if (form.remark) {
        text = form.remark
      } else {
        text = form.mk + ' - ' + form.bn
      }
      return text + ' - ' + this.envMap[form.env]
    },
    handleSelect(item) {
      this.form = Object.assign({}, item)
    },
    queryBns(queryString, cb) {
      const filter = queryString => row => row.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0
      const show = list => cb(queryString ? list.filter(filter(queryString)) : list)

      if (this.bnMap[this.form.env] !== null) {
        show(this.bnMap[this.form.env])
      } else {
        this.$store.dispatch('huaxing/getCompanyBns', this.form.env).then(({ body }) => {
          this.bnMap[this.form.env] = body
          show(this.bnMap[this.form.env])
        })
      }
    },
    handleBn(item) {
      this.form.bn = item.value
    },
    copyLink(event) {
      clip(this.ssoLink, event)
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
        'huaxing/createSso',
        this.form
      ).then(({ body }) => {
        this.$refs.cache.save(this.form)

        this.ssoLink = body
        this.showResult = true
        this.lastEnv = this.form.env
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    }
  }
}
</script>
