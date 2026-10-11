<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="batchShowDialog('add')" v-ripple>批量设置</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
        @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange">
      </ArtTable>

      <!-- 默认配置 -->
      <UserDialog v-model:visible="dialogVisible" :type="dialogType" :user-data="currentUserData"
        @submit="handleDialogSubmit" />
      <CustomerAddDialog v-model:visible="entryDialogVisible" :type="entryDialogType" :user-data="entryRatioData" @submit="handleEntryDialogSubmit"></CustomerAddDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { useTable } from '@/hooks/core/useTable'
import UserSearch from './modules/customer-search.vue'
import UserDialog from './modules/customer-dialog.vue'
import CustomerAddDialog from './modules/customer-add-dialog.vue'
import { ElTag } from 'element-plus'
import { DialogType } from '@/types'
import { selectCarmineByApi,updateSwitchCodeApi } from '@/api/customer-hijack.js'
defineOptions({ name: 'User' })

type UserListItem = Api.SystemManage.UserListItem

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentUserData = ref<Partial<any>>({})


// 修改弹框相关
const entryDialogType = ref<DialogType>('add')
const entryDialogVisible = ref(false)
const entryRatioData = ref<Partial<any>>({})


// 续费弹窗
const renewDialogVisible = ref(false)

// 禁用弹框
const freezeDialogVisible = ref(false)

// 选中行
const selectedRows = ref<UserListItem[]>([])

// 搜索表单
const searchForm = ref({
  carmine: undefined
})

// 激活状态配置
const USER_STATUS_CONFIG = {
  1: { type: 'danger' as const, text: '关闭' },
  0: { type: 'success' as const, text: '开启' }
} as const

/**
 * 获取用户状态配置
 */
const getUserStatusConfig = (status: any) => {
  return (
    USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
      type: 'info' as const,
      text: '未知'
    }
  )
}

const {
  columns,
  columnChecks,
  data,
  loading,
  pagination,
  getData,
  replaceSearchParams,
  resetSearchParams,
  handleSizeChange,
  handleCurrentChange,
  refreshData
} = useTable({
  // 核心配置
  core: {
    apiFn: selectCarmineByApi,
    apiParams: {
      ...searchForm.value
    },
    // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
    // paginationKey: {
    //   current: 'pageNum',
    //   size: 'pageSize'
    // },
    columnsFactory: () => [
      {
        prop: 'mainCarmine',
        label: '主卡卡密',
        width: 280
      },
      {
        prop: 'subCarmine',
        label: '副卡卡密',
        width: 280
      },
      // {
      //   prop: 'dosage',
      //   label: '进人总数',
      //   width: 100,
      //   formatter: (row) => {
      //     const number = row.dosage ? row.dosage : 0
      //     return number
      //   }
      // },
      // {
      //   prop: 'bcHackNumber',
      //   label: '劫持数量',
      //   width: 100
      // },
      {
        prop: 'mainRadioNumber',
        label: '主卡比例',
        width: 100
      },
      {
        prop: 'subRadioNumber',
        label: '副卡比例',
        width: 100
      },
      {
        prop: 'systemTotalNumber',
        label: '头寸',
        width: 100
      },
      {
        prop: 'switchCode',
        label: '禁用状态',
        formatter: (row:any) => {
          const statusConfig = getUserStatusConfig(row.switchCode)
          return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
        }
      },
      {
        prop: 'createTime',
        label: '创建日期',
        width: 280,
        sortable: true
      },
      {
        prop: 'operation',
        label: '操作',
        width: 150,
        fixed: 'right', // 固定列
        formatter: (row:any) => {
          if (row.switchCode === 0) {
            return h('div', [
              h(ArtButtonTable, {
                type: 'delete',
                text: '关闭',
                onClick: () => updateSwitchCode(row)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                text: '修改',
                onClick: () => showDialog('edit', row)
              }),
            ])
          } else {
            return h('div', [
              h(ArtButtonTable, {
                type: 'add',
                text: '开启',
                onClick: () => updateSwitchCode(row)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                text: '修改',
                onClick: () => showDialog('edit', row)
              }),
            ])
          }
        }
      }
    ]
  }
})

/**
 * 搜索处理
 * @param params 参数
 */
const handleSearch = (params: Api.SystemManage.UserSearchParams) => {
  replaceSearchParams(params)
  getData()
}

/**
 * 批量设置
 */
const showDialog = (type: DialogType, row?: any): void => {
  // console.log('打开弹窗:', { type, row })
  entryDialogType.value = type
  entryRatioData.value = row || {}
  nextTick(() => {
    entryDialogVisible.value = true
  })
}

const batchShowDialog = (type: DialogType, row?: any): void => {
  // console.log('打开弹窗:', { type, row })
  dialogType.value = type
  currentUserData.value = row || {}
  nextTick(() => {
    dialogVisible.value = true
  })
}

/**
 * 修改卡密状态
 * @param row 
 */
const updateSwitchCode = async(row: any) => {

  let result:any = await updateSwitchCodeApi({ id: row.id, switchCode: row.switchCode })
  if(result.code === 200){
    ElMessage.success('操作成功')
  }
  currentUserData.value = {}
  getData()
}

/**
 * 处理弹窗提交事件,刷新数据并关闭弹框
 */
const handleDialogSubmit = async () => {
  try {
    dialogVisible.value = false
    currentUserData.value = {}
    getData()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

/**
 * 修改配置
 */
const handleEntryDialogSubmit = async ()=>{
  try {
    entryDialogVisible.value = false
    entryRatioData.value = {}
    getData()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

/**
 * 禁用窗口关闭
 */
const handleDialogFreezeSubmit = async () => {
  try {
    freezeDialogVisible.value = false
    currentUserData.value = {}
  } catch (error) {
    console.error('提交失败:', error)
  }
}

/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection: any): void => {
  selectedRows.value = selection
  console.log('选中行数据:', selectedRows.value)
}
</script>