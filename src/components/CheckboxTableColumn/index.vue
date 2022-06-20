<template>
  <el-table-column :prop="prop" scoped-slot>
    <template slot="header">
      <label><el-checkbox style="margin-right: 5px;" :checked="checked" @change="handleChange"></el-checkbox>{{ label }}</label>
    </template>
    <template slot-scope="{row}">
      <slot :row="row">{{ row[prop] }}</slot>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'CheckboxTableColumn',
  props: {
    prop: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    checked: {
      type: Boolean,
      default: false
    }
  },
  created() {
    if (this.checked === true) {
      this.$emit('change', {
        prop: this.prop,
        label: this.label,
        value: true
      })
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('change', {
        prop: this.prop,
        label: this.label,
        value
      })
    }
  }
}
</script>
