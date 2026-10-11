import request from '@/utils/http'


/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetCustomerList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.CarmineMange.CarmineList>({
    url: '/customer/page',
    params
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}