<template>
  <div>
    <el-form>
      <el-form-item label="姓名">
        <el-input v-model.trim="form.name" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model.trim="form.pwd" show-password />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input v-model.trim="form.cfmpwd" show-password />
      </el-form-item>
      <el-form-item label="更改头像">
        <div class="avatar-area" @click="showFaceList">
          <el-avatar :size="100" :src="form.avatar"></el-avatar>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">修改</el-button>
      </el-form-item>
    </el-form>

    <face-dialog ref="dialog" @click="chooseFace"></face-dialog>
  </div>
</template>

<script>
import FaceDialog from '@/components/FaceDialog'

export default {
  components: {
    FaceDialog
  },
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: this.$store.getter.realname,
          avatar: this.$store.getter.avatar
        }
      }
    }
  },
  data() {
    return {
      form: {}
    }
  },
  created() {
    this.form = Object.assign({}, this.user)
  },
  methods: {
    showFaceList() {
      this.$refs.dialog.show()
    },
    chooseFace(avatar) {
      this.form.avatar = avatar
    },
    submit() {
      if (this.form.pwd !== this.form.cfmpwd) {
        this.$message.error('密码与确认密码不一致')
        return
      }

      const loadingInstance = this.$loading({
        target: '.el-form'
      })

      this.$store
        .dispatch('user/editSelf', this.form)
        .then(() => {
          this.user.avatar = this.form.avatar
          this.$message.success('修改成功')
        })
        .finally(() => {
          loadingInstance.close()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 80px;
}
</style>
