import { constantRoutes } from '@/router'
import { getRoutes } from '@/api/role'
import Layout from '@/layout'
import qs from 'qs'
import request from '@/utils/request'
import Str from '@/utils/str'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = routes.concat(constantRoutes, [
      { path: '*', redirect: '/404', hidden: true }
    ])
  }
}

const actions = {
  async generateRoutes({ commit }, roles) {
    const { body } = await getRoutes()
    const asyncRoutes = createDynamicRoute(body)
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('master')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  saveRoutes({ commit }, routes) {
    return new Promise((resolve, reject) => {
      request.post(
        '/role/saveRoutes',
        qs.stringify(routes)
      ).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

function createDynamicRoute(routes) {
  const createChildren = function(routes) {
    const result = []
    for (const route of routes) {
      if (route['hidden'] === 1) {
        continue
      }
      const row = {
        path: route['path'],
        name: Str.explode('-/', route['path']).map(r => Str.ucfirst(r)).join(''),
        open: route['open'],
        meta: {
          title: route['title'],
          icon: route['icon'],
          roles: route['roles'] || []
        }
      }
      if (route['view']) {
        row.component = (resolve) => require(['@/views/' + route['view']], resolve)
      } else {
        row.component = Layout
      }
      if (route['redirect']) {
        row.redirect = route['redirect']
      }
      if (route['children'] && route['children'].length > 0) {
        row.children = createChildren(route['children'])
      }
      result.push(row)
    }
    return result
  }
  return createChildren(routes)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
