<template>
  <div class="app-container" style="width: 95%; margin: 10px 30px 0 0;">
    <aside style="margin-bottom: 20px;">
      查询结果列表中展示的为商城系统数据，提示框中展示的为供应商系统数据
    </aside>

    <el-form :model="form" label-width="120px">
      <el-tooltip effect="dark" content="仅支持京东和内购的商品详情页链接，如：https://item.jd.com/100010670421.html" placement="top-start">
        <el-form-item label="查询内容" required>
          <cache-input id="neigou-goods-query" ref="cache" placeholder="支持批量查询，空格或逗号分隔" :form="form" name="bn" :cache-id="getCacheId" @select="handleSelect"></cache-input>
        </el-form-item>
      </el-tooltip>
      <el-form-item label="查询类型" required>
        <el-radio-group v-model="form.bnType">
          <el-radio-button label="sku">SKU</el-radio-button>
          <el-radio-button label="spu">SPU</el-radio-button>
          <el-radio-button label="product_id">product_id</el-radio-button>
          <el-radio-button label="goods_id">goods_id</el-radio-button>
          <el-radio-button label="url">链接</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="环境" required>
        <el-radio-group v-model="form.env">
          <el-radio v-for="(v, k) in envMap" :key="k" :label="k">{{ v }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">查询</el-button>
        <div style="display:inline-block; right:0; position: absolute;">
          <el-badge :value="list.length">
            <el-button type="info" icon="el-icon-document-copy" @click="copyColumn($event)">复制所选列</el-button>
            <el-button type="success" icon="el-icon-document" @click="exportExcel">导出列表</el-button>
            <el-button type="danger" @click="clearList">清空列表</el-button>
          </el-badge>
        </div>
      </el-form-item>
    </el-form>

    <el-table :data="list" stripe border>
      <el-table-column prop="env" label="环境" width="50"></el-table-column>
      <el-table-column prop="goods_cover" label="封面" width="100">
        <template slot-scope="{row}">
          <img class="product-cover" :src="row.goods_cover">
        </template>
      </el-table-column>
      <el-table-column prop="goods_bn">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="goods_bn" style="vertical-align: middle;"> SPU </label>
        </template>
        <template slot-scope="{row}">
          <el-tooltip :content="row.goods_id">
            <a @click="copyLink($event, row.goods_bn)">{{ row.goods_bn }}</a>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="product_bn">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="product_bn" style="vertical-align: middle;"> SKU </label>
        </template>
        <template slot-scope="{row}">
          <el-tooltip :content="row.product_id">
            <a @click="copyLink($event, row.product_bn)">{{ row.product_bn }}</a>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="product_name" label="商品名称" show-overflow-tooltip>
        <template slot-scope="{row}">
          <a @click="copyLink($event, row.product_name)">{{ row.product_name }}</a>
        </template>
      </el-table-column>
      <el-table-column prop="store_cost" label="成本价" width="70">
        <template slot-scope="{row}">
          <el-tooltip v-if="row.store_cost !== row.raw_cost" :content="'供应商：' + row.raw_cost">
            <span style="color: #E6A23C">{{ row.store_cost }}</span>
          </el-tooltip>
          <span v-else>{{ row.store_cost }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="store_price" label="销售价" width="70">
        <template slot-scope="{row}">
          <el-tooltip v-if="row.store_price !== row.raw_price" :content="'供应商：' + row.raw_price">
            <span style="color: #E6A23C">{{ row.store_price }}</span>
          </el-tooltip>
          <span v-else>{{ row.store_price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="store_marketable" label="上架状态" width="80">
        <template slot-scope="{row}">
          <el-tooltip v-if="row.store_marketable !== row.raw_marketable" :content="'供应商：' + (row.raw_marketable ? '上架' : '下架')">
            <span style="color: #E6A23C">{{ row.store_marketable ? '上架' : '下架' }}</span>
          </el-tooltip>
          <span v-else>{{ row.store_marketable ? '上架' : '下架' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="store_status" label="状态" width="70">
        <template slot-scope="{row}">
          <el-tooltip v-if="row.store_status !== row.raw_status" :content="'供应商：' + (row.raw_status ? '有效' : '无效')">
            <span style="color: #E6A23C">{{ row.store_status ? '有效' : '无效' }}</span>
          </el-tooltip>
          <span v-else>{{ row.store_status ? '有效' : '无效' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="server_stock" label="库存(冻结)" width="100">
        <template slot-scope="{row}">
          <el-tooltip v-if="row.server_stock !== row.raw_stock || row.server_freez !== row.raw_freez" :content="'供应商：' + row.raw_stock + '(' + row.raw_freez + ')'">
            <span style="color: #E6A23C">{{ row.server_stock + '(' + row.server_freez + ')' }}</span>
          </el-tooltip>
          <span v-else>{{ row.server_stock + '(' + row.server_freez + ')' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="store_up_time" label="同步时间" width="200">
        <template slot-scope="{row}">
          <el-tooltip :content="'供应商商品：' + row.raw_up_time + '，供应商库存：' + row.raw_stockprice_up_time + ''">
            <span v-html="'商品：' + row.store_up_time + '<br>库存：' + row.server_stock_up_time"></span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="所在商城" align="center" width="95">
        <template slot-scope="{row}">
          <template v-if="row.malls.length > 0">
            <el-popover :ref="'malls-' + row.product_id" trigger="click">
              <div v-for="(v,k) in row.malls" :key="'1-' + k">
                <template v-if="v.type === '1'"><b>{{ v.name }}</b><template v-if="v.tag"> - {{ v.tag }}</template></template>
              </div>
              <div v-for="(v,k) in row.malls" :key="'2-' + k">
                <i v-if="v.type === '2'">微商城：{{ v.name }}</i>
              </div>
            </el-popover>
            <el-button v-popover="'malls-' + row.product_id">查看</el-button>
          </template>
          <template v-else>无</template>
        </template>
      </el-table-column>
      <el-table-column prop="store_product_type_text" label="商品来源" width="100">
        <template slot-scope="{row}">
          <span v-html="row.store_product_type_text + '<br>' + row.server_product_type_text"></span>
        </template>
      </el-table-column>
      <el-table-column prop="pop_shop_name" label="店铺名称" width="160">
        <template slot-scope="{row}">
          <span v-html="'shop_id: ' + row.pop_shop_id + '<br>name: ' + row.pop_shop_name + '<br>owner：' + row.pop_owner_name"></span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="210">
        <template slot-scope="{row}">
          <el-button type="primary" size="small" @click="copyLink($event, row.ng_link)">内购</el-button>
          <el-button v-if="row.jd_link" type="success" size="small" @click="copyLink($event, row.jd_link)">京东</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import clip from '@/utils/clipboard'
import CacheInput from '@/components/CacheInput'
import Cache from '@/utils/cache'
import Arr from '@/utils/arr'
import { envMap, trimJson, date, handleExportExcel, copyTableOneColumn } from '@/utils/app'

export default {
  components: {
    CacheInput
  },
  data() {
    return {
      cache: null,
      key: 'product_bn',
      envMap,
      form: {
        bn: '',
        bnType: 'sku',
        remark: '',
        env: 'prod'
      },
      list: [],
      copyField: 'product_bn',
      copyFieldStringList: ['goods_bn', 'product_bn']
    }
  },
  created() {
    this.cache = new Cache('neigou-goods-query')
    const list = this.cache.getValue('list') || []
    this.list = list.reverse()
  },
  methods: {
    copyColumn(event) {
      let isString = false
      if (this.copyFieldStringList.indexOf(this.copyField) !== -1) {
        isString = true
      }
      copyTableOneColumn(event, this.list, this.copyField, isString)
    },
    getCacheId(form) {
      let text
      if (form.remark) {
        text = form.remark
      } else {
        text = form.bn
      }
      return text + ' - ' + this.envMap[form.env]
    },
    handleSelect(item) {
      this.form = Object.assign({}, item)
    },
    handleDelete(row) {
      Arr.removeValue(this.list, this.key, row[this.key])
      this.cache.setValue('list', this.list)
    },
    copyLink(event, link) {
      clip(link, event)
    },
    exportExcel() {
      handleExportExcel(this.list, {
        goods_bn: 'SPU', product_bn: 'SKU', product_name: '商品名称', store_price: '销售价', store_cost: '成本价'
      }, '商品列表 - ' + date('Y-m-d'))
    },
    clearList() {
      this.list = []
      this.cache.setValue('list', [])
    },
    submit() {
      trimJson(this.form)
      if (!this.form.bn) {
        return false
      }
      const loadingInstance = this.$loading({
        target: '.el-form'
      })
      this.$store.dispatch(
        'neigou/queryProduct',
        this.form
      ).then(({ body }) => {
        this.$refs.cache.save(this.form)
        for (const row of body) {
          row.env = this.envMap[this.form.env]
        }
        const list = Arr.uniqueMergeDictArr(this.cache.getValue('list') || [], body, [this.key])
        this.cache.setValue('list', list)
        this.list = list.reverse()
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .product-cover {
    cursor: pointer;
    width: 75px;
    height: 75px;
    border-radius: 10px;
  }
}
</style>
