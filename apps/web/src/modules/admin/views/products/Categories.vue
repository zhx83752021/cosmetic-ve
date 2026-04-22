<template>
  <div class="categories-page">
    <div class="page-header">
      <h2 class="page-title">商品分类</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加分类</el-button>
    </div>

    <el-card shadow="never">
      <el-table
        :data="tableData"
        border
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column label="图标" width="100">
          <template #default="{ row }">
            <span v-if="row.icon" style="font-size: 24px">{{ row.icon }}</span>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="row.image"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
            />
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="商品数" width="100">
          <template #default="{ row }">
            {{ row._count?.products || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="formData.parentId"
            :data="categoryTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="选择上级分类（不选为顶级分类）"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="分类图标">
          <el-input v-model="formData.icon" placeholder="1～2 字简称，可留空" maxlength="2" />
          <div class="form-tip">用于列表展示，如：护、彩、香</div>
        </el-form-item>
        <el-form-item label="分类图片">
          <el-input v-model="formData.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
          <div class="form-tip">数字越小，排序越靠前</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '@/api/product'

const loading = ref(false)
const tableData = ref<Category[]>([])
const allCategories = ref<Category[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const formRef = ref<FormInstance>()
const formData = reactive<any>({
  id: null,
  name: '',
  parentId: null,
  icon: '',
  image: '',
  sort: 0,
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
}

// 构建分类树
const categoryTree = computed(() => {
  return buildTree(allCategories.value.filter(c => c.id !== formData.id))
})

// 构建树结构
const buildTree = (categories: Category[], parentId: number | null = null): any[] => {
  return categories
    .filter(c => c.parentId === parentId)
    .map(c => ({
      ...c,
      children: buildTree(categories, c.id),
    }))
}

// 获取分类列表
const loadCategories = async () => {
  loading.value = true
  try {
    const res = await getCategories()
    if (res.success && res.data) {
      // 处理响应数据格式
      const data = res.data
      allCategories.value = data
      tableData.value = buildTree(data)
    }
  } catch (error: any) {
    console.error('获取分类列表失败:', error)
    // 只在非网络错误时显示错误提示
    if (error?.response && error.response.status !== 0) {
      ElMessage.error('获取分类列表失败')
    } else {
      // 网络错误或后端未启动，使用空数据
      console.warn('后端服务未启动，使用空数据')
      allCategories.value = []
      tableData.value = []
    }
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增分类'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Category) => {
  dialogTitle.value = '编辑分类'
  formData.id = row.id
  formData.name = row.name
  formData.parentId = row.parentId
  formData.icon = row.icon
  formData.image = row.image
  formData.sort = row.sort
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: Category) => {
  try {
    // 检查是否有子分类
    const hasChildren = allCategories.value.some(c => c.parentId === row.id)
    if (hasChildren) {
      ElMessage.warning('请先删除子分类')
      return
    }

    // 检查是否有商品
    if (row._count && row._count.products > 0) {
      ElMessage.warning(`该分类下还有 ${row._count.products} 个商品，无法删除`)
      return
    }

    await ElMessageBox.confirm(`确定要删除分类“${row.name}”吗？`, '提示', {
      type: 'warning',
    })

    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async valid => {
    if (valid) {
      try {
        const submitData = {
          name: formData.name,
          parentId: formData.parentId || null,
          icon: formData.icon || null,
          image: formData.image || null,
          sort: formData.sort,
        }

        if (formData.id) {
          await updateCategory(formData.id, submitData)
          ElMessage.success('更新成功')
        } else {
          await createCategory(submitData)
          ElMessage.success('创建成功')
        }

        dialogVisible.value = false
        loadCategories()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败')
      }
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
  formData.id = null
  formData.name = ''
  formData.parentId = null
  formData.icon = ''
  formData.image = ''
  formData.sort = 0
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
