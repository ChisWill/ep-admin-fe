<template>
  <div class="app-container" style="width: 95%; margin: 10px 30px 0 0;">
    <aside style="margin-bottom: 20px;">
      该SSO链接默认为60秒内有效
    </aside>
    <el-form :model="form" label-width="120px">
      <el-form-item label="企业标识" required>
        <cache-input id="neigou-sso-link-agh" ref="cache" :form="form" name="bn" :cache-id="getCacheId" @select="handleSelect"></cache-input>
      </el-form-item>
      <el-form-item label="标识类型" required>
        <el-radio-group v-model="form.bnType">
          <el-radio-button label="bn">企业编号</el-radio-button>
          <el-radio-button label="id">company_id</el-radio-button>
          <el-radio-button label="gid">gcorp_id</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.mkType !== 'any'" label="账号">
        <el-input v-model="form.mk" style="width: 310px;"></el-input>
      </el-form-item>
      <el-form-item label="账号类型" required>
        <el-radio-group v-model="form.mkType">
          <el-radio-button label="mk">员工工号</el-radio-button>
          <el-radio-button label="guid">guid</el-radio-button>
          <el-radio-button label="neigou_id">member_id</el-radio-button>
          <el-radio-button label="uc_id">uc_id</el-radio-button>
          <el-radio-button label="any">任意</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="this.$store.getters.power >= 9000" label="有效时间（秒）">
        <el-input v-model="form.expire" type="number" style="width: 200px;"></el-input>
      </el-form-item>
      <el-form-item label="最终跳转地址">
        <el-input v-model="form.surl"></el-input>
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
        <el-button type="primary" @click="submit">创建</el-button>
        <el-button type="info" style="margin-left: 30px;" @click="gotoQuery">跳转到查询</el-button>
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
import { envMap, surlMap, trimJson } from '@/utils/app'

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
      surlMap,
      form: {
        mk: '',
        mkType: 'mk',
        env: 'prod',
        bn: '',
        bnType: 'bn',
        expire: 60,
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
    gotoQuery() {
      this.$router.push({ name: 'NeigouMemberQuery', params: {
        mk: this.form.mk,
        mkType: this.form.mkType,
        env: this.form.env,
        bn: this.form.bn,
        bnType: this.form.bnType,
        remark: this.form.remark
      }})
    },
    getCacheId(form) {
      let text
      if (form.remark) {
        text = form.remark
      } else {
        text = form.bn
        if (form.mk) {
          text = form.mk + ' - ' + text
        }
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
      if (!this.form.bn) {
        return false
      }
      const loadingInstance = this.$loading({
        target: '.el-form'
      })
      this.$store.dispatch(
        'neigou/createAghSso',
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
