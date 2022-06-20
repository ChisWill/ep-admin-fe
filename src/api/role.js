import request from '@/utils/request'
import qs from 'qs'

export function getRoutes() {
  return request.get('/role/routes')
}

export function getRoles() {
  return request.get('/role/list')
}

export function addRole(data) {
  return request.post('/role/save', qs.stringify(data))
}

export function updateRole(id, data) {
  return request.post(`/role/save?id=${id}`, qs.stringify(data))
}

export function deleteRole(id) {
  return request.post(`/role/delete?id=${id}`)
}
