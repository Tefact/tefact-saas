import request from '../utils/request'
import { LoginParams, LoginEntity } from '~/services/common/entities/user'

export const login = (params: LoginParams) => request({
  url: '/auth/phone/login',
  data: params,
  method: 'post'
})

export const verification = (params: LoginEntity) => request({
  url: '/auth/phone/code',
  data: params,
  method: 'post'
})