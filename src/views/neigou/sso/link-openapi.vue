<template>
  <div class="app-container" style="width: 95%; margin: 20px 30px 0 0;">
    <aside style="margin-bottom: 20px;">
      该SSO链接只有60秒有效期
    </aside>
    <el-form :model="form" label-width="120px">
      <el-form-item label="员工工号" required>
        <cache-input id="neigou-sso-link-openapi" ref="cache" :form="form" name="mk" :cache-id="getCacheId" @select="handleSelect"></cache-input>
      </el-form-item>
      <el-form-item label="渠道名称" required>
        <el-input v-model="form.channel" style="width: 200px"></el-input>
      </el-form-item>
      <el-form-item label="公司外部编号" required>
        <el-input v-model="form.bn" style="width: 500px"></el-input>
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
        <el-link type="success" style="margin-right: 10px;" @click="copyLink($event)">点我复制</el-link>
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
      envMap,
      surlMap: {
        prod: 'https://life.neigou.com',
        test: 'https://life.test.neigou.com'
      },
      form: {
        mk: '',
        env: 'prod',
        channel: '',
        bn: '',
        surl: 'https://life.neigou.com',
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
        text = form.channel + ' - ' + form.mk
      }
      return text + ' - ' + this.envMap[form.env]
    },
    handleSelect(item) {
      this.form = Object.assign({}, item)
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
        'neigou/createOpenapiSso',
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
