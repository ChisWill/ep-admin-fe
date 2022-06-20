<template>
  <div class="app-container" style="width: 95%;margin: 0px 30px 0 0;">
    <el-row>
      <el-divider content-position="left">浦发SSO地址</el-divider>
      <el-input v-model="surl" placeholder="落地页地址"></el-input>
      <el-button type="primary" style="margin-top: 10px" @click="generateSSO($event)">生成并复制</el-button>
    </el-row>
  </div>
</template>

<script>
import clip from '@/utils/clipboard'

export default {
  data() {
    return {
      surl: ''
    }
  },
  methods: {
    generateSSO(event) {
      const baseUrl = 'https://openapi.neigou.com/ChannelInterop/V1/PuFa/Web/SSo'
      let url
      if (this.surl) {
        url = baseUrl + '?surl=' + encodeURIComponent(this.surl)
      } else {
        url = baseUrl
      }
      clip(url, event)
    }
  }
}
</script>
