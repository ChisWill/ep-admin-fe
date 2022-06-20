<script>
export default {
  install(Vue, options) {
    Vue.prototype.$config = {
      API_UPLOAD_LOCAL: process.env.VUE_APP_BASE_API + '/upload/local'
    }
  }
}
</script>
