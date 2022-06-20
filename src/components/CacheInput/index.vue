<template>
  <el-row>
    <el-col :span="18">
      <el-autocomplete v-model="form[name]" :placeholder="placeholder" :style="{width: width}" :fetch-suggestions="query" @select="handleSelect"></el-autocomplete>
    </el-col>
    <el-col :span="6"><el-button type="warning" @click="clearCache">{{ clearCacheText }}</el-button></el-col>
  </el-row>
</template>

<script>
import Cache from '@/utils/cache'
import { envMap } from '@/utils/app'

export default {
  name: 'CacheInput',
  props: {
    id: {
      type: String,
      required: true
    },
    form: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    width: {
      type: String,
      default: '90%'
    },
    cacheId: {
      type: Function,
      default: form => form.mk + ' - ' + form.bn + ' - ' + envMap[form.env]
    },
    placeholder: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: () => {
        return {
          searchDataSource: {
            type: null, // 'localCache',
            name: '',
            searchField: '',
            getValue: row => {

            }
          }
        }
      }
    }
  },
  data() {
    return {
      cache: null,
      extraCache: null,
      defaultForm: {},
      submitValue: '',
      lastRemark: '',
      resetRemark: false
    }
  },
  computed: {
    clearCacheText: function() {
      return this.form[this.name] ? '清除当前记录' : '清除未备注的记录'
    }
  },
  created() {
    this.cache = new Cache(this.id)
    this.defaultForm = Object.assign({}, this.form)
    if (this.options.searchDataSource.type === 'localCache') {
      this.extraCache = new Cache(this.options.searchDataSource.name)
    }

    this.$watch(function() {
      return this.form[this.name]
    }, function() {
      if (this.resetRemark) {
        if (this.form.remark === this.lastRemark) {
          this.form.remark = ''
          this.resetRemark = false
        } else {
          this.lastRemark = this.form.remark
        }
      }
    })
  },
  methods: {
    query(queryString, cb) {
      const filter = queryString => row => row.value.indexOf(queryString) >= 0
      let list = this.getQueryList()
      if (queryString !== this.submitValue) {
        list = queryString ? list.filter(filter(queryString)) : list
      }
      list.sort((a, b) => a.value.localeCompare(b.value))
      cb(list)
    },
    getQueryList() {
      let list = this.cache.getListValue('input-list') || []

      switch (this.options.searchDataSource.type) {
        case 'localCache': {
          const extraList = this.extraCache.getValue('list')
            .filter(row => !!row[this.options.searchDataSource.searchField])
            .map(row => Object.assign({}, this.form, this.options.searchDataSource.getValue(row)))
          list = list.concat(extraList)
          break
        }
      }

      return list
    },
    handleSelect(value) {
      this.$emit('select', value)
    },
    clearCache() {
      if (this.form[this.name]) {
        this.cache.deductDict('input-list', this.cacheId(this.form))
        this.$emit('select', this.defaultForm)
      } else {
        const raw = this.cache.getValue('input-list')
        const result = {}
        for (const k in raw) {
          if (raw[k]['remark'] !== '') {
            result[k] = raw[k]
          }
        }
        this.cache.setValue('input-list', result)
      }
    },
    save(item) {
      this.submitValue = item[this.name]
      this.resetRemark = true
      this.lastRemark = this.form.remark
      if (this.lastRemark) {
        this.form.remark = ''
        this.cache.deductDict('input-list', this.cacheId(this.form))
        this.form.remark = this.lastRemark
      }
      this.cache.addDict('input-list', this.cacheId(item), item)
    }
  }
}
</script>
