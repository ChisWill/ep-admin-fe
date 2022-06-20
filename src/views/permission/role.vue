<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">创建新角色</el-button>

    <el-table v-loading="loading" :data="roleList" style="width: 95%; margin: 30px 30px 0 0;" border stripe>
      <el-table-column prop="id" label="序号" width="120"></el-table-column>
      <el-table-column prop="name" label="角色名称" width="220"></el-table-column>
      <el-table-column prop="roles" label="子角色">
        <template slot-scope="{row}">
          <span>{{ row.roles.map(id => roleNameMap[id]).join(', ') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="power" label="权利值"></el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="showDialog" :title="dialogType==='edit' ? '编辑角色' : '创建新角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色名称" required>
          <el-input v-model="role.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="role.description" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="权利值">
          <el-input v-model="role.power" type="number" placeholder="请输入权利值" />
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="role.roles">
            <el-checkbox v-for="v in limitedRoles" :key="v.id" :label="v.id" border>{{ v.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="模块">
          <el-tree
            ref="tree"
            class="permission-tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            default-expand-all
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="showDialog=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getRoutes, getRoles, addRole, deleteRole, updateRole } from '@/api/role'

const defaultRole = {
  id: '',
  name: '',
  power: 5000,
  description: '',
  roles: [],
  routes: []
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      roleNameMap: {},
      routes: [],
      roleList: [],
      showDialog: false,
      checkStrictly: false,
      dialogType: 'new',
      loading: true,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    },
    limitedRoles() {
      return this.roleList.filter(v => {
        let result = parseInt(this.role.power) >= parseInt(v.power)
        if (this.dialogType === 'new') {
          result = result && this.role.name !== v.name
        } else {
          result = result && this.role.id !== v.id
        }
        return result
      })
    }
  },
  created() {
    this.getRoutes()
    this.getRoles()
  },
  methods: {
    async getRoutes() {
      const { body } = await getRoutes()
      this.serviceRoutes = body
      this.routes = this.generateRoutes(body)
      this.loading = false
    },
    async getRoles() {
      const { body } = await getRoles()
      this.roleList = body
      this.updateRoleMap()
    },

    updateRoleMap() {
      this.roleList.forEach(row => {
        this.roleNameMap[row.id] = row.name
      })
    },

    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild) {
          route = onlyOneShowingChild
        }

        const data = {
          id: route.id,
          path: path.resolve(basePath, route.path),
          title: route.title,
          children: []
        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.showDialog = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.showDialog = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        const routes = this.generateRoutes(this.role.routes)
        this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确认删除该角色?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const loadingInstance = this.$loading({
          target: '.el-table'
        })

        try {
          await deleteRole(row.id)
        } finally {
          loadingInstance.close()
        }
        this.roleList.splice($index, 1)

        this.$message({
          type: 'success',
          message: '成功删除'
        })
      })
    },
    generateTree(routes, checkedKeys) {
      const res = []

      for (const route of routes) {
        const key = route.id

        // recursive child routes
        if (route.children && route.children.length > 0) {
          route.children = this.generateTree(route.children, checkedKeys)
        }

        if (checkedKeys.includes(key) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    async confirmRole() {
      const loadingInstance = this.$loading({
        target: '.el-dialog'
      })
      const isEdit = this.dialogType === 'edit'
      const checkedKeys = this.$refs.tree.getCheckedKeys()

      this.role.routes = this.generateTree(deepClone(this.serviceRoutes), checkedKeys)

      if (isEdit) {
        try {
          await updateRole(this.role.id, this.role)
          for (let index = 0; index < this.roleList.length; index++) {
            if (this.roleList[index].id === this.role.id) {
              this.roleList.splice(index, 1, Object.assign({}, this.role))
              break
            }
          }
        } catch (err) {
          return
        } finally {
          this.$nextTick(() => loadingInstance.close())
        }
      } else {
        try {
          const { body } = await addRole(this.role)
          this.role.id = body
          this.roleList.push(this.role)
        } catch (err) {
          return
        } finally {
          this.$nextTick(() => loadingInstance.close())
        }
      }

      this.updateRoleMap()
      const { description, name } = this.role
      this.showDialog = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色名称: ${name}</div>
            <div>描述: ${description}</div>
          `,
        type: 'success'
      })
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
  .el-checkbox.is-bordered + .el-checkbox.is-bordered {
    margin-left: 0px;
  }
}
</style>
