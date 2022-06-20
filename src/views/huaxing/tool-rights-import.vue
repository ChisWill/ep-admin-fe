<template>
  <div class="app-container" style="width: 95%;margin: 0 30px 0 0;">
    <iframe src="https://apps.51guanhuai.com/third/api/huaxing/uploadSocialRightsList" :style="{width, height}"></iframe>
  </div>
</template>

<script>
export default {
  data() {
    return {
      width: '100%',
      height: 0
    }
  },
  created() {
    this.height = (document.documentElement.clientHeight - 150) + 'px'
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  * {
    margin: 0;
    padding: 0;
    border: 0;
  }
}
</style>>
