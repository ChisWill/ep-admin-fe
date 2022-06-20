import request from '@/utils/request'
import qs from 'qs'

const state = {

}

const mutations = {

}

const actions = {
  createOpenapiSso({ commit }, data) {
    return request.post('sso/create-openapi', qs.stringify(data))
  },
  createAghSso({ commit }, data) {
    return request.post('sso/create-agh', qs.stringify(data))
  },
  queryMember({ commit }, data) {
    return request.post('member/query', qs.stringify(data))
  },
  queryCorp({ commit }, data) {
    return request.post('corp/query', qs.stringify(data))
  },
  queryCorpPoint({ commit }, data) {
    return request.post('corp/query-point', qs.stringify(data))
  },
  queryProduct({ commit }, data) {
    return request.post('goods/query-product', qs.stringify(data))
  },
  queryOrder({ commit }, data) {
    return request.post('order/query', qs.stringify(data))
  },
  queryRefund({ commit }, data) {
    return request.post('order/refund', qs.stringify(data))
  },
  toolSerialize({ commit }, data) {
    return request.post('tool/serialize', qs.stringify(data))
  },
  toolHash({ commit }, data) {
    return request.post('tool/hash', qs.stringify(data))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
