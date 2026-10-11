import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { carmineRoutes } from './carmine'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  // dashboardRoutes,
  carmineRoutes,
  // systemRoutes,
  // resultRoutes,
  // exceptionRoutes
]
