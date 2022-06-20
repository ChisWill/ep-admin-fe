<template>
  <el-dialog title="选择头像" :visible.sync="visible" width="1200px">
    <el-row :gutter="20">
      <el-col v-for="id in mailFaceList" :key="id" :span="4">
        <div class="avatar-area" @click="chooseFace('https://s2.aghcdn.com/wadmin/face/' + id + '.jpg')">
          <el-avatar :src="'https://s2.aghcdn.com/wadmin/face/' + id + '.jpg'" :size="150"></el-avatar>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 50px;">
      <el-col v-for="id in femailFaceList" :key="id" :span="4">
        <div class="avatar-area" @click="chooseFace('https://s2.aghcdn.com/wadmin/face/' + id + '.jpg')">
          <el-avatar :src="'https://s2.aghcdn.com/wadmin/face/' + id + '.jpg'" :size="150"></el-avatar>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      mailFaceList: [11, 12, 13, 14, 15, 16],
      femailFaceList: [21, 22, 23, 24, 25, 26]
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    chooseFace(avatar) {
      this.$emit('click', avatar)
      this.visible = false
    }
  }
}
</script>

<style lang="scss">
.avatar-area {
  display: inline-block;
  width: 100px;
  height: 100px;

  .el-avatar {
    cursor: pointer;
  }
}
</style>
