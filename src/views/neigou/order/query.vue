<template>
  <div class="app-container" style="width: 95%; margin: 10px 30px 0 0;">
    <aside style="margin-bottom: 20px;">
      一次查询最多返回1000条记录
    </aside>

    <el-form class="main-form" :model="form" label-width="120px">
      <el-form-item label="查询内容" required>
        <cache-input id="neigou-order-query" ref="cache" placeholder="除企业ID类型外，支持批量查询，空格或逗号分隔" :form="form" :options="cacheInpuOptions" name="bn" :cache-id="getCacheId" @select="handleSelect"></cache-input>
      </el-form-item>
      <el-form-item label="查询类型" required>
        <el-radio-group v-model="form.type">
          <el-radio-button label="order_id">内购订单号</el-radio-button>
          <el-radio-button label="supplier_id">供应商订单号</el-radio-button>
          <el-radio-button label="payment_id">支付流水号</el-radio-button>
          <el-radio-button label="company_id">企业标识</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.type === 'company_id'" label="企业标识类型" required>
        <el-radio-group v-model="form.bnType">
          <el-radio-button label="bn">企业编号</el-radio-button>
          <el-radio-button label="id">company_id</el-radio-button>
          <el-radio-button label="gid">gcorp_id</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <form-more-item v-show="form.type === 'company_id'" ref="formMoreItem" :data="form.more" auto-add></form-more-item>
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
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column prop="order_id" width="100">
        <template slot="header">
          <label><input v-model="copyField" type="radio" name="copyField" value="order_id" style="vertical-align: middle;"> 订单号 </label>
        </template>
        <template slot-scope="{row}">
          <el-tooltip v-if="row.pid !== ''" :content="row.pid">
            <span style="color: #E6A23C">{{ row.order_id }}</span>
          </el-tooltip>
          <span v-else>{{ row.order_id }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="real_name" label="姓名">
        <template slot-scope="{row}">
          <el-tooltip :content="row.member_id">
            <a style="color: #409EFF;" @click="gotoUserDetail(row)">{{ row.real_name }}</a>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="company_name" label="公司名称">
        <template slot-scope="{row}">
          <el-tooltip :content="row.company_id">
            <a style="color: #409EFF;" @click="gotoCompanyDetail(row)">{{ row.company_name }}</a>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="final_amount" label="总金额" width="80">
        <template slot-scope="{row}">
          <el-tooltip :content="'￥' + row.cur_money + ' + ' + row.point_amount">
            <span>{{ row.final_amount }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="create_time_text" label="下单时间" width="95">
        <template slot-scope="{row}">
          <span v-html="row.create_time_text.split(' ').join('<br>')"></span>
        </template>
      </el-table-column>
      <el-table-column prop="payment" label="支付方式"></el-table-column>
      <el-table-column prop="pay_time_text" label="支付时间">
        <template slot-scope="{row}">
          <span v-if="row.pay_time !== '0'" v-html="row.pay_time_text.split(' ').join('<br>')"></span>
        </template>
      </el-table-column>
      <el-table-column prop="refund_status_text" label="售后状态"></el-table-column>
      <el-table-column prop="split_text" label="是否拆单">
        <template slot-scope="{row}">
          <span v-if="row.split === '2'" style="color: #E6A23C">{{ row.split_text }}</span>
          <span v-else>{{ row.split_text }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ship_status_text" label="物流状态">
        <template slot-scope="{row}">
          <span v-if="row.ship_status === '3'" style="color: #67C23A">{{ row.ship_status_text }}</span>
          <span v-else-if="row.ship_status === '2'" style="color: #E6A23C">{{ row.ship_status_text }}</span>
          <span v-else>{{ row.ship_status_text }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="pay_status_text" label="支付状态">
        <template slot-scope="{row}">
          <span v-if="row.pay_status === '2'" style="color: #67C23A">{{ row.pay_status_text }}</span>
          <span v-else>{{ row.pay_status_text }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status_text" label="订单状态">
        <template slot-scope="{row}">
          <span v-if="row.status === '3'" style="color: #67C23A">{{ row.status_text }}</span>
          <span v-else-if="row.status === '2'" style="color: #F56C6C">{{ row.status_text }}</span>
          <span v-else>{{ row.status_text }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="afters" label="售后" width="100">
        <template slot-scope="{row}">
          <span v-if="row.afters.length === 0">无</span>
          <template v-else>
            <a v-for="(v, k) in row.afters" :key="k" :href="showAfterLink(row.env, v)" style="color: #E6A23C;" target="_blank"> 售后{{ k+1 }} </a>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="refunds" label="退款" width="100">
        <template slot-scope="{row}">
          <span v-if="row.refunds.length === 0">无</span>
          <template v-else>
            <a v-for="(v, k) in row.refunds" :key="k" :href="showRefundLink(row.env, v)" style="color: #E6A23C;" target="_blank"> 退款{{ k+1 }} </a>
          </template>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template slot-scope="{row}">
          <el-button type="primary" size="small" @click="showOrderDetail(row)">详情</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="'订单“' + orderDetail.order_id + '”的详情'" :visible.sync="showOrderDetailDialog" width="75%">
      <el-form>
        <el-row>
          <el-col :span="24"><el-divider content-position="center"><b>订单金额</b></el-divider></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="4"><el-form-item label="支付总金额：">{{ orderDetail.final_amount }}</el-form-item></el-col>
          <el-col v-if="orderDetail.final_amount !== orderDetail.cost_item" :span="4"><el-form-item label="订单成本：">{{ orderDetail.cost_item }}</el-form-item></el-col>
          <el-col :span="4"><el-form-item label="现金支付：">{{ orderDetail.cur_money }}</el-form-item></el-col>
          <el-col :span="4"><el-form-item label="积分支付：">{{ orderDetail.point_amount }}</el-form-item></el-col>
          <el-col :span="4"><el-form-item label="优惠金额：">{{ orderDetail.pmt_amount }}</el-form-item></el-col>
          <el-col :span="4"><el-form-item label="运费：">{{ orderDetail.cost_freight }}</el-form-item></el-col>
        </el-row>
        <el-row>
          <el-col :span="24"><el-divider content-position="center"><b>基本状态</b></el-divider></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6"><el-form-item label="订单号：">{{ orderDetail.order_id }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="父订单：">{{ orderDetail.pid !== '' ? orderDetail.pid : '无' }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="根订单：">{{ orderDetail.root_pid === orderDetail.order_id ? '无' : orderDetail.root_pid }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="是否拆单：">{{ orderDetail.split_text }}</el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6"><el-form-item label="支付方式：">{{ orderDetail.payment }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="支付状态：">{{ orderDetail.pay_status_text }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="退款状态：">{{ orderDetail.refund_status_text }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="订单状态：">{{ orderDetail.status_text }}</el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6"><el-form-item label="发货状态：">{{ orderDetail.ship_status_text }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="发货时间：">{{ orderDetail.delivery_time !== '0' ? orderDetail.delivery_time_text : '无' }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="收货模式：">{{ orderDetail.receive_mode_text }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="积分渠道：">{{ orderDetail.point_channel !== '' ? orderDetail.point_channel : '无' }}</el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6"><el-form-item label="创建时间：">{{ orderDetail.create_time !== '0' ? orderDetail.create_time_text : '无' }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="支付时间：">{{ orderDetail.pay_time !== '0' ? orderDetail.pay_time_text : '无' }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="取消时间：">{{ orderDetail.cancel_time !== '0' ? orderDetail.cancel_time_text : '无' }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="完成时间：">{{ orderDetail.finish_time !== '0' ? orderDetail.finish_time_text : '无' }}</el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="6"><el-form-item label="商品来源：">{{ orderDetail.wms_code }}</el-form-item></el-col>
          <el-col :span="6"><el-form-item label="发货单号：">{{ orderDetail.wms_delivery_bn !== '' ? orderDetail.wms_delivery_bn : '无' }}</el-form-item></el-col>
        </el-row>
        <el-row>
          <el-col :span="24"><el-divider content-position="center"><b>订单明细</b></el-divider></el-col>
        </el-row>
        <el-table :data="orderDetail.items" stripe border>
          <el-table-column prop="name" label="商品名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="bn" label="SKU"></el-table-column>
          <el-table-column prop="point_amount" label="积分支付"></el-table-column>
          <el-table-column prop="cost_freight" label="运费"></el-table-column>
          <el-table-column prop="pmt_amount" label="优惠金额"></el-table-column>
          <el-table-column prop="cost_tax" label="服务费"></el-table-column>
          <el-table-column prop="cost" label="成本价"></el-table-column>
          <el-table-column prop="price" label="销售价"></el-table-column>
          <el-table-column prop="nums" label="数量"></el-table-column>
          <el-table-column prop="amount" label="小计"></el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showOrderDetailDialog = false">关 闭</el-button>
        </span>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import CacheInput from '@/components/CacheInput'
import FormMoreItem from '@/components/FormMoreItem'
import Cache from '@/utils/cache'
import Arr from '@/utils/arr'
import { envMap, envTextMap, misMap, trimJson, date, rangePickerOptions, handleExportExcel, copyTableOneColumn } from '@/utils/app'

export default {
  components: {
    CacheInput,
    FormMoreItem
  },
  data() {
    return {
      cache: null,
      key: 'order_id',
      cacheInpuOptions: {
        searchDataSource: {
          type: 'localCache',
          name: 'neigou-corp-query',
          searchField: 'remark',
          getValue: row => {
            return {
              bn: row.company_code,
              type: 'company_id',
              bnType: 'bn',
              env: envTextMap[row.env],
              value: row.remark + ' - ' + row.env
            }
          }
        }
      },
      envMap,
      form: {
        bn: '',
        type: 'order_id',
        bnType: 'bn',
        remark: '',
        env: 'prod',
        more: [
          {
            show: false,
            label: '工号',
            field: 'mk',
            type: 'text',
            placeholder: '请输入员工工号，支持批量',
            value: ''
          },
          {
            show: false,
            label: 'SKU',
            field: 'productBn',
            type: 'text',
            placeholder: '请输入SKU，支持批量',
            value: ''
          },
          {
            show: false,
            label: 'member_id',
            field: 'memberId',
            type: 'text',
            placeholder: '请输入member_id，支持批量',
            value: ''
          },
          {
            show: false,
            label: '起止日期',
            field: 'dateRange',
            type: 'dateRange',
            value: ''
          }
        ]
      },
      pickerOptions: rangePickerOptions,
      list: [],
      showOrderDetailDialog: false,
      orderDetail: {
        order_id: ''
      },
      copyField: 'order_id',
      copyFieldStringList: ['order_id']
    }
  },
  created() {
    this.cache = new Cache('neigou-order-query')
    const list = this.cache.getValue('list') || []
    this.list = list.reverse()
  },
  methods: {
    gotoUserDetail(row) {
      this.$router.push({ name: 'NeigouMemberQuery', params: {
        mk: row.member_id,
        mkType: 'neigou_id',
        env: envTextMap[row.env],
        bn: row.company_id,
        bnType: 'id',
        remark: ''
      }})
    },
    gotoCompanyDetail(row) {
      this.$router.push({ name: 'NeigouCorpQuery', params: {
        env: envTextMap[row.env],
        bn: row.company_id,
        bnType: 'id',
        remark: ''
      }})
    },
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
    showRefundLink(env, bn) {
      return misMap[envTextMap[env]] + '/Admin/Refund/refundDetails?refundId=' + bn
    },
    showAfterLink(env, bn) {
      return misMap[envTextMap[env]] + '/Admin/newReturnOrder/returnOderDetail?after_sale_bn=' + bn
    },
    showOrderDetail(order) {
      this.orderDetail = order
      this.showOrderDetailDialog = true
    },
    exportExcel() {
      handleExportExcel(this.list, {
        remark: '备注', order_id: '订单号', pid: '父订单', root_pid: '根订单', final_amount: '支付总金额', cost_item: '订单成本', cur_money: '现金支付', point_amount: '积分支付', cost_freight: '运费', pmt_amount: '优惠金额', payment: '支付方式', status_text: '订单状态', pay_status_text: '支付状态', refund_status_text: '售后状态', create_time_text: '下单时间', delivery_time_text: '发货时间', pay_time_text: '支付时间', finish_time_text: '完成时间', cancel_time_text: '取消时间', receive_mode_text: '收货方式', ship_status_text: '物流状态', split_text: '是否拆单', wms_code: '商品来源', wms_delivery_bn: '发货单号', point_channel: '积分渠道'
      }, '订单列表 - ' + date('Y-m-d'))
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
        target: '.main-form'
      })
      this.$store.dispatch(
        'neigou/queryOrder',
        this.$refs.formMoreItem.getFormData(Object.assign({}, this.form, { limit: 1000 }))
      ).then(({ body }) => {
        this.$refs.cache.save(this.form)
        for (const row of body) {
          row.env = this.envMap[this.form.env]
          row.remark = this.form.remark
        }
        const list = Arr.uniqueMergeDictArr(this.cache.getValue('list') || [], body, this.key)
        this.cache.setValue('list', list)
        this.list = list.reverse()
      }).finally(() => {
        this.$nextTick(() => loadingInstance.close())
      })
    }
  }
}
</script>
