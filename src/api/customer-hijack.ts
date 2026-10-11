import request from '@/utils/http'


/**
 * 获取劫持卡密列表
 * @param data 
 * @returns 
 */
export function selectCarmineByApi(data:any){
    return request.get<any>({
        url: '/user/carminePage',
        params: data
    })
}


/**
 * 添加劫持
 */
export function addCustomerHijackApi(data: any) {
    return request.post<any>({
      url: '/entry/add',
      data: data
    })
}

/**
 * 修改劫持
 */
export function updateCustomerHijackApi(data: any) {
    return request.post<any>({
        url: '/entry/update',
        data: data
    })
}

/**
 * 修改状态
 * @param data 
 * @returns 
 */
export function updateSwitchCodeApi(data: any) {
    return request.post<any>({
        url: '/entry/updateCode',
        params: data
    })
}

/**
 * 批量添加劫持配置
 * @param data
 * @returns 
 */
export function batchAddEntryRatioApi(data: any) {
    return request.post<any>({
        url: '/entry/batchAdd',
        data: data
    })
}


