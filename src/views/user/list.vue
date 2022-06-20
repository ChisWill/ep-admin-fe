<template>
  <div class="app-container">
    <el-button type="primary" @click="addUser">创建新账号</el-button>

    <el-table v-loading="loading" :data="list" :row-class-name="tableRowClassName" style="width: 95%; margin: 30px 30px 0 0;" border>
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="username" label="账号"></el-table-column>
      <el-table-column prop="realname" label="姓名"></el-table-column>
      <el-table-column prop="rolename" label="角色"></el-table-column>
      <el-table-column prop="power" label="Power"></el-table-column>
      <el-table-column prop="avatar" label="头像">
        <template slot-scope="{row}">
          <img class="user-avatar" :src="row.avatar">
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="{row}">
          <el-button type="text" size="small" @click="() => editUser(row)">编辑</el-button>
          <el-button type="text" size="small" @click="() => deleteUser(row)">{{ row.state === '-1' ? '恢复' : '删除' }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType === 'create' ? '创建账号' : '编辑账号'">
      <el-form :model="user" label-width="80px" label-position="left">
        <el-form-item label="账号">
          <el-input v-model="user.username" placeholder="必填" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="user.password" :placeholder="dialogType === 'create' ? '不填默认为123123' : '不填表示不修改'" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="user.realname" placeholder="必填" />
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="user.roles">
            <el-checkbox v-for="item in roleList" :key="item.id" :label="item.id" border>{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Power">
          <el-input v-model="user.power" :step="500" type="number" placeholder="必填" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-area" @click="showFaceList">
            <el-avatar :size="100" :src="user.avatar"></el-avatar>
          </div>
        </el-form-item>
        <!-- <el-form-item label="自定义头像">
          <el-upload class="avatar-uploader" :action="uploadPath" :headers="uploadHeader" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="user.avatar" :src="user.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item> -->
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmUser">确认</el-button>
      </div>
    </el-dialog>

    <face-dialog ref="dialog" @click="chooseFace"></face-dialog>
  </div>
</template>

<script>
import FaceDialog from '@/components/FaceDialog'
import { deepClone } from '@/utils'
import { getToken } from '@/utils/auth'
import { getRoles } from '@/api/role'

const defaultUser = {
  id: '',
  username: '',
  password: '',
  realname: '',
  roles: [],
  avatar: '',
  power: 5000,
  state: '1'
}

export default {
  components: {
    FaceDialog
  },
  data() {
    return {
      user: Object.assign({}, defaultUser),
      uploadPath: this.$config.API_UPLOAD_LOCAL,
      uploadHeader: {
        'x-token': getToken()
      },
      list: [],
      roleList: [],
      roleMap: {},
      loading: true,
      dialogVisible: false,
      dialogType: 'create'
    }
  },
  async created() {
    await this.initRoleList()
    this.initList()
  },
  methods: {
    showFaceList() {
      this.$refs.dialog.show()
    },
    chooseFace(avatar) {
      this.user.avatar = avatar
    },
    async initList() {
      const { body } = await this.$store.dispatch('user/getList')
      this.list = body
      this.loading = false
      for (const role of this.roleList) {
        this.roleMap[role.id] = role.name
      }
      for (const key in this.list) {
        this.list[key].rolename = this.createRolename(this.list[key].roles)
      }
    },
    async initRoleList() {
      const { body } = await getRoles()
      this.roleList = body
    },
    createRolename(roles) {
      const names = []
      for (const id of roles) {
        names.push(this.roleMap[id])
      }
      return names.join(', ')
    },
    addUser() {
      this.dialogType = 'create'
      this.dialogVisible = true
      this.user = Object.assign({}, defaultUser)
    },
    editUser(row) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.user = deepClone(row)
    },
    confirmUser() {
      const loadingInstance = this.$loading({
        target: '.el-dialog'
      })
      const isEdit = this.dialogType === 'edit'

      const notify = () => {
        const { realname } = this.user
        const text = isEdit ? '修改' : '创建'
        this.dialogVisible = false
        this.$notify({
          title: 'Success',
          dangerouslyUseHTMLString: true,
          message: `
              <div>账号: ${realname}</div>
              <div>${text}成功</div>
            `,
          type: 'success'
        })
      }

      if (this.user.username === '' || this.user.realname === '') {
        this.$message.error('账号和姓名必填')
        this.$nextTick(() => loadingInstance.close())
        return
      }
      if (!isEdit && this.user.password === '') {
        this.user.password = '123123'
      }

      if (isEdit) {
        this.$store.dispatch('user/editUser', {
          id: this.user.id,
          user: this.user
        }).then(() => {
          this.user.password = ''
          for (let index = 0; index < this.list.length; index++) {
            if (this.list[index].id === this.user.id) {
              this.user.rolename = this.createRolename(this.user.roles)
              this.list.splice(index, 1, Object.assign({}, this.user))
              break
            }
          }
          notify()
        }).finally(() => this.$nextTick(() => loadingInstance.close()))
      } else {
        this.$store.dispatch(
          'user/addUser',
          this.user
        ).then(response => {
          this.user.id = response.body
          this.user.password = ''
          this.user.rolename = this.createRolename(this.user.roles)
          this.list.push(this.user)
          notify()
        }).finally(() => this.$nextTick(() => loadingInstance.close()))
      }
    },
    deleteUser(row) {
      const loadingInstance = this.$loading({
        target: '.el-table'
      })
      const rawState = row.state
      let text
      if (row.state === '-1') {
        row.state = '1'
        text = '恢复'
      } else {
        row.state = '-1'
        text = '删除'
      }
      this.$store
        .dispatch('user/deleteUser', row)
        .then(() => {
          this.$message.success(text + '成功')
        })
        .catch(error => {
          row.state = rawState
          this.$message.error(error)
        })
        .finally(() => this.$nextTick(() => loadingInstance.close()))
    },
    beforeAvatarUpload(file) {
      const isPic = ['image/jpeg', 'image/gif', 'image/png'].indexOf(file.type) >= 0
      const limit = file.size / 1024 < 300

      if (!isPic) {
        this.$message.error('上传头像图片只能是 JPG、PNG、GIF 格式!')
      }
      if (!limit) {
        this.$message.error('上传头像图片大小不能超过 300KB!')
      }
      return isPic && limit
    },
    handleAvatarSuccess({ errno, error, body }) {
      if (errno === 0) {
        this.user.avatar = process.env.VUE_APP_BASE_DOMAIN + body
      } else {
        this.$message.error(error)
      }
    },
    tableRowClassName({ row }) {
      if (row.state === '-1') {
        return 'delete-row'
      } else {
        return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .el-table .user-avatar {
    cursor: pointer;
    width: 50px;
    height: 50px;
    border-radius: 10px;
  }
  .el-table .delete-row {
    background: oldlace
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .el-checkbox.is-bordered + .el-checkbox.is-bordered {
    margin-left: 0px;
  }
}
</style>
