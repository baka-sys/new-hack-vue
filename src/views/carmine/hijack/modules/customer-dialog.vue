<template>
  <ElDialog v-model="dialogVisible" title="批量生成卡密" width="40%" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="主卡卡密" prop="mainCarmineSet">
        <ElInput v-model="formData.mainCarmineSet" type="textarea" :autosize="{ minRows: 4, maxRows: 4 }"
          placeholder="请输入主卡卡密，批量查询时不同卡密请换行，最多设置50张卡密比例" />
      </ElFormItem>
      <ElFormItem label="副卡卡密" prop="subCarmineSet">
        <ElInput v-model="formData.subCarmineSet" type="textarea" :autosize="{ minRows: 4, maxRows: 4 }"
          placeholder="请输入副卡卡密，和主卡1对1" />
      </ElFormItem>
      <ElFormItem label="主卡人数" prop="mainRadioNumber">
        <ElInput v-model="formData.mainRadioNumber" type="number" :min="0" :max="100" placeholder="请输入卡密张数" />
      </ElFormItem>
      <ElFormItem label="副卡人数" prop="subRadioNumber">
        <ElInput v-model="formData.subRadioNumber" type="number" :min="0" :max="100" placeholder="请输入卡密张数" />
      </ElFormItem>
      <ElFormItem label="头寸" prop="systemTotalNumber">
        <ElInput v-model="formData.systemTotalNumber" type="number" :min="0" :max="100" placeholder="请输入卡密张数" />
      </ElFormItem>
      <ElFormItem label="劫持开关" prop="switchCode">
        <ElRadioGroup v-model="formData.switchCode">
          <ElRadioButton :label="0">开</ElRadioButton>
          <ElRadioButton :label="1">关</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { batchAddEntryRatioApi } from '@/api/customer-hijack'
import { ROLE_LIST_DATA } from '@/mock/temp/formData'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, nextTick, reactive, ref, watch } from 'vue';

interface Props {
  visible: boolean
  type: string
  userData?: Partial<Api.SystemManage.UserListItem>
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 角色列表数据
const roleList = ref(ROLE_LIST_DATA)

// 对话框显示控制
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const dialogType = computed(() => props.type)

// 表单实例
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  mainCarmineSet: '',
  subCarmineSet: '',
  mainRadioNumber: 0,
  subRadioNumber: 0,
  switchCode: 0,
  systemTotalNumber: 0
})

// 表单验证规则
const rules: FormRules = {
  mainCarmineSet: [{ required: true, message: '请输入主卡集合' }],
  subCarmineSet: [{ required: true, message: '请输入副卡集合' }],
  mainRadioNumber: [{ required: true, message: '请输入生成条数', trigger: "chage" }],
  subRadioNumber: [{ required: true, message: '请输入生成条数', }],
  switchCode: [{ required: true, message: '请输入到期天数', }],
  systemTotalNumber: [{ required: true, message: '请输入限制人数', }]
  // password: [{ required: true, message: '请输入密码' }],
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
  const isEdit = props.type === 'edit' && props.userData
  const row = props.userData

  Object.assign(formData, {
    username: isEdit && row ? row.userName || '' : '',
    phone: isEdit && row ? row.userPhone || '' : '',
    gender: isEdit && row ? row.userGender || '男' : '男',
    role: isEdit && row ? (Array.isArray(row.userRoles) ? row.userRoles : []) : []
  })
}

/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据并清除验证状态
 */
watch(
  () => [props.visible, props.type, props.userData],
  ([visible]) => {
    if (visible) {
      initFormData()
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  },
  { immediate: true }
)

/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      const params = {
        mainCarmineSet: formData.mainCarmineSet.split(/[(\r\n)\r\n]+/).join(','),
        subCarmineSet: formData.subCarmineSet.split(/[(\r\n)\r\n]+/).join(','),
        mainRadioNumber: formData.mainRadioNumber,
        subRadioNumber: formData.subRadioNumber,
        switchCode: formData.switchCode,
        systemTotalNumber: formData.systemTotalNumber
      }
      let result: any = await batchAddEntryRatioApi(params)
      if (result.code === 200) {
        ElMessage.success("设置成功")
      }
      emit('submit')
    }
  })
}
</script>
