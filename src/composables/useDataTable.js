import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useDataTable(fetchFunction, options = {}) {
  const {
    pageSize = 10,
    defaultSortBy = 'id',
    sortOrder = 'asc',
    searchFields = [],
    autoLoad = true
  } = options

  // 資料狀態
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // 分頁狀態
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(pageSize)
  
  // 排序狀態
  const sortField = ref(defaultSortBy)
  const sortDirection = ref(sortOrder)
  
  // 搜尋狀態
  const searchQuery = ref('')
  const filters = ref({})
  
  // 選擇狀態
  const selectedItems = ref([])
  const selectAll = ref(false)

  // 計算屬性
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
  const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalItems.value))

  // 篩選和搜尋後的資料
  const filteredData = computed(() => {
    let result = [...data.value]

    // 應用搜尋
    if (searchQuery.value && searchFields.length > 0) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item => 
        searchFields.some(field => 
          String(item[field]).toLowerCase().includes(query)
        )
      )
    }

    // 應用篩選器
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter(item => {
          if (Array.isArray(value)) {
            return value.includes(item[key])
          }
          return item[key] === value
        })
      }
    })

    return result
  })

  // 排序後的資料
  const sortedData = computed(() => {
    if (!sortField.value) return filteredData.value

    return [...filteredData.value].sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      
      let comparison = 0
      if (aVal > bVal) comparison = 1
      if (aVal < bVal) comparison = -1
      
      return sortDirection.value === 'desc' ? -comparison : comparison
    })
  })

  // 分頁後的資料
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return sortedData.value.slice(start, end)
  })

  // 更新總數
  const updateTotalItems = () => {
    totalItems.value = filteredData.value.length
  }

  // 載入資料
  const loadData = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const result = await fetchFunction(params)
      data.value = Array.isArray(result) ? result : result.data || []
      updateTotalItems()
    } catch (err) {
      error.value = err.message
      console.error('載入資料失敗:', err)
    } finally {
      loading.value = false
    }
  }

  // 重新載入資料
  const reload = () => {
    return loadData()
  }

  // 分頁控制
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--
    }
  }

  const setPageSize = (size) => {
    itemsPerPage.value = size
    currentPage.value = 1 // 重設到第一頁
    updateTotalItems()
  }

  // 排序控制
  const sortByField = (field) => {
    if (sortField.value === field) {
      // 切換排序方向
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      // 新的排序欄位
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  const setSorting = (field, direction = 'asc') => {
    sortField.value = field
    sortDirection.value = direction
  }

  // 搜尋控制
  const search = (query) => {
    searchQuery.value = query
    currentPage.value = 1 // 重設到第一頁
    updateTotalItems()
  }

  const clearSearch = () => {
    searchQuery.value = ''
    currentPage.value = 1
    updateTotalItems()
  }

  // 篩選控制
  const setFilter = (key, value) => {
    filters.value = { ...filters.value, [key]: value }
    currentPage.value = 1 // 重設到第一頁
    updateTotalItems()
  }

  const removeFilter = (key) => {
    const newFilters = { ...filters.value }
    delete newFilters[key]
    filters.value = newFilters
    currentPage.value = 1
    updateTotalItems()
  }

  const clearFilters = () => {
    filters.value = {}
    currentPage.value = 1
    updateTotalItems()
  }

  // 選擇控制
  const toggleSelectAll = () => {
    if (selectAll.value) {
      selectedItems.value = []
    } else {
      selectedItems.value = [...paginatedData.value.map(item => item.id)]
    }
    selectAll.value = !selectAll.value
  }

  const toggleSelectItem = (itemId) => {
    const index = selectedItems.value.indexOf(itemId)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(itemId)
    }
    
    // 更新全選狀態
    selectAll.value = selectedItems.value.length === paginatedData.value.length
  }

  const clearSelection = () => {
    selectedItems.value = []
    selectAll.value = false
  }

  const isSelected = (itemId) => {
    return selectedItems.value.includes(itemId)
  }

  // 重設狀態
  const reset = () => {
    currentPage.value = 1
    searchQuery.value = ''
    filters.value = {}
    selectedItems.value = []
    selectAll.value = false
    sortField.value = defaultSortBy
    sortDirection.value = sortOrder
  }

  // 監聽器
  const unwatchFilters = computed(() => {
    updateTotalItems()
  })

  // 生命週期
  onMounted(() => {
    if (autoLoad) {
      loadData()
    }
  })

  onUnmounted(() => {
    // 清理
  })

  return {
    // 資料狀態
    data: paginatedData,
    allData: data,
    loading,
    error,
    
    // 分頁狀態
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    
    // 排序狀態
    sortField,
    sortDirection,
    
    // 搜尋與篩選狀態
    searchQuery,
    filters,
    
    // 選擇狀態
    selectedItems,
    selectAll,
    
    // 計算屬性
    filteredData,
    sortedData,
    
    // 資料方法
    loadData,
    reload,
    
    // 分頁方法
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    
    // 排序方法
    sortByField,
    setSorting,
    
    // 搜尋方法
    search,
    clearSearch,
    
    // 篩選方法
    setFilter,
    removeFilter,
    clearFilters,
    
    // 選擇方法
    toggleSelectAll,
    toggleSelectItem,
    clearSelection,
    isSelected,
    
    // 工具方法
    reset
  }
}