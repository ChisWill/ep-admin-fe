import request from '@/utils/request'
import qs from 'qs'

const state = {

}

const mutations = {

}

const actions = {
  getCompanyBns({ commit }, env) {
    return request.post('huaxing/get-company-bns', qs.stringify({ env }))
  },
  queryMember({ commit }, data) {
    return request.post('huaxing/query-member', qs.stringify(data))
  },
  queryOrder({ commit }, data) {
    return request.post('huaxing/query-order', qs.stringify(data))
  },
  createSso({ commit }, data) {
    return request.post('huaxing/create-sso', qs.stringify(data))
  },
  refreshVirtualStock({ commit }, data) {
    return request.post('huaxing/refresh-virtual-stock', qs.stringify(data))
  },
  importMember({ commit }, data) {
    return request.post('huaxing/import-member', qs.stringify(data))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
