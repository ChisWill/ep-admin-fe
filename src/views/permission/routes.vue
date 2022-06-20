<template>
  <div class="app-container">
    <el-input v-model="filterText" placeholder="输入关键字进行过滤"></el-input>
    <el-tree
      ref="tree"
      v-loading="loading"
      style="width: 95%; margin: 30px 30px 0 0"
      class="tree-area"
      :data="routes"
      node-key="id"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      default-expand-all
      draggable
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>
          <input v-model="data.title" class="el-mini" placeholder="菜单名">
        </span>
        <span class="menu-name">
          <input v-model="data.path" class="el-mini" placeholder="访问路径">
        </span>
        <span>
          <input
            v-model="data.redirect"
            class="el-mini"
            placeholder="路径别名"
          >
        </span>
        <span>
          <input v-model="data.view" class="el-mini" placeholder="前端视图">
        </span>
        <span class="el-switch-box">
          <el-switch
            v-model="data.open"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
            inactive-text="是否展开"
          ></el-switch>
        </span>
        <span>
          <el-select
            v-model="data.icon"
            size="mini"
            placeholder="图标"
            filterable
            clearable
          >
            <el-option
              v-for="item in icons"
              :key="item"
              :value="item"
            ></el-option>
          </el-select>
        </span>
        <span class="el-switch-box">
          <el-switch
            v-model="data.hidden"
            :active-value="0"
            :inactive-value="1"
            active-color="#13ce66"
            inactive-color="#ff4949"
            inactive-text="是否显示"
          ></el-switch>
        </span>
        <span>
          <el-button type="text" size="mini" @click="() => append(data)">
            添加
          </el-button>
          <el-button type="text" size="mini" @click="() => remove(node, data)">
            删除
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-row v-if="showClickBtn" class="button-area">
      <el-button
        type="success"
        round
        :disabled="disableSaveBtn"
        @click="save"
      >确认保存</el-button>
    </el-row>
  </div>
</template>

<script>
import path from 'path'
import { getRoutes } from '@/api/role'
import { Message } from 'element-ui'

export default {
  data() {
    return {
      routes: [],
      filterText: '',
      maxId: 1,
      icons: [],
      showClickBtn: true,
      disableSaveBtn: true,
      loading: true
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.initIcons()
    this.initList()
  },
  methods: {
    async initList() {
      const res = await getRoutes()
      this.routes = this.generateRoutes(res.body)
      this.loading = false
      this.disableSaveBtn = false
    },
    initIcons() {
      const req = require.context('../../icons/svg', false, /\.svg$/)
      const requireAll = (requireContext) => requireContext.keys()
      this.icons = requireAll(req).map((i) => {
        return i.match(/\.\/(.*)\.svg/)[1]
      })
    },
    save() {
      this.disableSaveBtn = true
      this.$store
        .dispatch('permission/saveRoutes', this.$refs.tree.children)
        .then(() => {
          Message({
            message: '更新成功',
            type: 'success',
            duration: 1 * 1000,
            onClose: () => location.reload()
          })
        })
        .catch(() => {
          this.disableSaveBtn = false
        })
    },
    append(data) {
      const newChild = this.getDataTemplate()
      newChild.id = ++this.maxId
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      data.children.push(newChild)
    },
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex((d) => d.id === data.id)
      children.splice(index, 1)
    },
    filterNode(value, data) {
      if (!value) {
        this.showClickBtn = true
        return true
      }
      this.showClickBtn = false
      return data.title.indexOf(value) !== -1
    },
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (const route of routes) {
        const data = this.getDataTemplate()
        data.id = parseInt(route.id)
        data.path = path.resolve(basePath, route.path)
        data.title = route.title
        data.view = route.view
        data.hidden = route.hidden
        data.open = route.open
        data.icon = route.icon
        data.redirect = route.redirect

        if (data.id > this.maxId) {
          this.maxId = data.id
        }

        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    getDataTemplate() {
      return {
        id: '',
        path: '',
        title: '',
        view: '',
        hidden: 0,
        open: 0,
        icon: '',
        redirect: '',
        children: []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    position: relative;
      .menu-name{
          margin-left: 38px;
      }
    }
    .el-tree-node__children .custom-tree-node .menu-name{
          margin-left: 20px;
    }
    .el-tree-node__children .el-tree-node__children .custom-tree-node .menu-name{
          margin-left: 0px;
    }
  }
  .tree-area {
    margin-top: 30px;
  }
  .button-area {
    text-align: center;
    margin-top: 30px;
  }
  .el-mini {
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 25px;
    line-height: 25px;
    outline: none;
    padding: 0 15px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;
  }
</style>
<style lang="scss">
  .custom-tree-node {
    .el-input--mini{
      .el-input__inner {
        height: 25px;
        line-height: 25px;
      }
    }
  }
</style>
