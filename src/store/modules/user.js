import { getToken, setToken, removeToken } from '@/utils/auth'
import request from '@/utils/request'
import router, { resetRouter } from '@/router'
import qs from 'qs'

const state = {
  token: getToken(),
  name: '',
  realname: '',
  avatar: '',
  roles: [],
  power: 0
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_REALNAME: (state, realname) => {
    state.realname = realname
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_POWER: (state, power) => {
    state.power = power
  }
}

const actions = {
  getList() {
    return new Promise(resolve => {
      request.get('/user/list').then(response => resolve(response))
    })
  },

  addUser({ commit }, user) {
    return new Promise((resolve, reject) => {
      request
        .post('/user/save', qs.stringify(user))
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  },

  editUser({ commit }, { id, user }) {
    return new Promise((resolve, reject) => {
      request
        .post('/user/save?id=' + id, qs.stringify(user))
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  },

  editSelf({ commit }, user) {
    return new Promise((resolve, reject) => {
      request
        .post('/user/editSelf', qs.stringify(user))
        .then(response => {
          commit('SET_AVATAR', user.avatar)
          resolve(response)
        })
        .catch(error => reject(error))
    })
  },

  deleteUser({ commit }, user) {
    return new Promise((resolve, reject) => {
      request.post('/user/delete', qs.stringify({
        id: user.id,
        state: user.state
      })).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      request.post('/public/login', qs.stringify({
        username: username.trim(),
        password: password
      })).then(response => {
        commit('SET_TOKEN', response.body)
        setToken(response.body)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      request.get('/user/info').then(response => {
        const { body } = response

        if (!body) {
          reject('Verification failed, please Login again.')
        }

        const { name, realname, avatar, roles, power } = body

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('未设置账号角色，请联系管理员配置')
        }

        commit('SET_NAME', name)
        commit('SET_REALNAME', realname)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLES', roles)
        commit('SET_POWER', power)
        resolve(body)
      })
    })
  },

  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      request.get('/public/logout').then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  refreshToken({ commit }) {
    return new Promise((resolve, reject) => {
      request.post('/public/refreshToken').then(response => {
        commit('SET_TOKEN', response.body)
        setToken(response.body)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
