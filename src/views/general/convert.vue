<template>
  <div class="app-container" style="width: 95%;">
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-cloudy-and-sunny" /> 日常</span>
        <el-row>
          <el-divider content-position="left">时间戳</el-divider>
          <el-input v-model="timestamp" style="width: 160px;" @paste.native.capture.prevent="pasteStamp($event)"></el-input>
          <span class="separator"></span>
          <span style="line-height: 35px;">
            <i class="el-icon-arrow-left" />
            <i class="el-icon-minus" />
            <i class="el-icon-arrow-right" />
          </span>
          <span class="separator"></span>
          <el-date-picker v-model="datetime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :picker-options="pickerOptions" :clearable="false" @paste.native.capture.prevent="pasteDate($event)"></el-date-picker>
          <el-button type="primary" icon="el-icon-date" style="margin-left: 10px;" @click="copyText($event, timestamp = parseInt(new Date().getTime() / 1000))"> 现在 </el-button>
        </el-row>
        <el-row>
          <span class="separator"></span>
          <el-divider content-position="left">随机值</el-divider>
          <el-input v-model="length" :step="2" type="number" style="width: 120px;"></el-input>
          <span class="separator"></span>
          <el-button type="warning" icon="el-icon-copy-document" @click="handleRandom($event)"> 生成并复制 </el-button>
        </el-row>
        <el-row>
          <span class="separator"></span>
          <el-divider content-position="left">PHP序列化转换</el-divider>
          <el-input v-model="serializeString" type="textarea" :autosize="{minRows: 5}"></el-input>
          <div style="text-align: center; margin: 30px 0 30px">
            <el-button type="success" icon="el-icon-sort" @click="handleSerialize"> 转换 </el-button>
          </div>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>转换记录</span>
              <el-button type="text" style="float: right; padding: 0 5px;" @click="serializeList = []">清空列表</el-button>
            </div>
            <el-table :data="serializeList" stripe border>
              <el-table-column prop="raw" label="原始数据"></el-table-column>
              <el-table-column prop="data" label="结果">
                <template slot-scope="{row}">
                  <a v-if="row.type === 'encode'" style="color: #67C23A;" @click="copyText($event, row.data)">{{ row.data }}</a>
                  <json-editor v-else :value="unserializeString(row.data)" />
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="操作" width="90">
                <template slot-scope="{row}">
                  <el-button type="danger" size="small" @click="handleDeleteList('serializeList', row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-row>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-coffee-cup" /> Json</span>
        <el-divider content-position="left">Json Totally Decode</el-divider>
        <el-input v-model="jsonString" type="textarea" :autosize="{minRows: 5}"></el-input>
        <div style="text-align: center; margin: 30px 0 30px">
          <el-button type="success" icon="el-icon-s-operation" @click="handleJson"> Totally Decode </el-button>
        </div>
        <div class="json-editor-container">
          <json-editor v-model="jsonData" />
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-baseball" /> Base64</span>
        <el-divider content-position="left">Base64 编码/解码</el-divider>
        <el-input v-model="base64String" type="textarea" :autosize="{minRows: 5}"></el-input>
        <div style="text-align: center; margin: 30px 0 30px">
          <el-button type="success" icon="el-icon-chat-line-square" @click="handleBase64('decode')"> 解码 </el-button>
          <span class="separator"></span>
          <el-button type="warning" icon="el-icon-message" @click="handleBase64('encode')"> 编码 </el-button>
        </div>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>编码/解码记录</span>
            <el-button type="text" style="float: right; padding: 0 5px;" @click="base64List = []">清空列表</el-button>
          </div>
          <el-table :data="base64List" stripe border>
            <el-table-column prop="raw" label="原始数据"></el-table-column>
            <el-table-column prop="data" label="结果">
              <template slot-scope="{row}">
                <a style="color: #67C23A;" @click="copyText($event, row.data)">{{ row.data }}</a>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="90">
              <template slot-scope="{row}">
                <el-button type="danger" size="small" @click="handleDeleteList('base64List', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-lock" /> Hash</span>
        <el-divider content-position="left">MD5 / SHA256 / Password</el-divider>
        <el-input v-model="hashString" type="textarea" :autosize="{minRows: 5}"></el-input>
        <div style="text-align: center; margin: 30px 0 30px">
          <el-button type="success" icon="el-icon-download" @click="handleHash"> Hash </el-button>
        </div>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>Hash 记录</span>
            <el-button type="text" style="float: right; padding: 0 5px;" @click="hashList = []">清空列表</el-button>
          </div>
          <el-table :data="hashList" stripe border>
            <el-table-column prop="raw" label="原始数据"></el-table-column>
            <el-table-column prop="md5" label="MD5">
              <template slot-scope="{row}">
                <a style="color: #67C23A;" @click="copyText($event, row.md5)">{{ row.md5 }}</a>
              </template>
            </el-table-column>
            <el-table-column prop="sha256" label="SHA256">
              <template slot-scope="{row}">
                <a style="color: #67C23A;" @click="copyText($event, row.sha256)">{{ row.sha256 }}</a>
              </template>
            </el-table-column>
            <el-table-column prop="password" label="Password">
              <template slot-scope="{row}">
                <a style="color: #67C23A;" @click="copyText($event, row.password)">{{ row.password }}</a>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="90">
              <template slot-scope="{row}">
                <el-button type="danger" size="small" @click="handleDeleteList('hashList', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-location-outline" /> UrlEncode</span>
        <el-divider content-position="left">Url Encode/Decode</el-divider>
        <el-input v-model="urlString" type="textarea" :autosize="{minRows: 5}"></el-input>
        <div style="text-align: center; margin: 30px 0 30px">
          <el-button type="success" icon="el-icon-add-location" @click="handleUrl('encode')"> Encode </el-button>
          <span class="separator"></span>
          <el-button type="warning" icon="el-icon-delete-location" @click="handleUrl('decode')"> Decode </el-button>
        </div>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>Encode/Decode 记录</span>
            <el-button type="text" style="float: right; padding: 0 5px;" @click="urlList = []">清空列表</el-button>
          </div>
          <el-table :data="urlList" stripe border>
            <el-table-column prop="raw" label="原始数据"></el-table-column>
            <el-table-column prop="data" label="结果">
              <template slot-scope="{row}">
                <a style="color: #67C23A;" @click="copyText($event, row.data)">{{ row.data }}</a>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="90">
              <template slot-scope="{row}">
                <el-button type="danger" size="small" @click="handleDeleteList('urlList', row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <span ref="copyBtn" style="display: none;" @click="copyLink"></span>
  </div>
</template>

<script>
import clip from '@/utils/clipboard'
import Arr from '@/utils/arr'
import Str from '@/utils/str'
import { date, strtotime, pickerOptions } from '@/utils/app'
import JsonEditor from '@/components/JsonEditor'

export default {
  components: {
    JsonEditor
  },
  data() {
    return {
      timestamp: parseInt(new Date().getTime() / 1000),
      length: 18,
      listId: 1,
      serializeString: '',
      serializeList: [],
      base64String: '',
      base64List: [],
      urlString: '',
      urlList: [],
      hashString: '',
      hashList: [],
      jsonString: '',
      jsonData: '',
      link: '',
      pickerOptions
    }
  },
  computed: {
    datetime: {
      get: function() {
        return date('Y-m-d H:i:s', this.timestamp * 1000)
      },
      set: function(value) {
        this.link = this.timestamp = strtotime(value) / 1000
        this.$refs.copyBtn.click()
      }
    },
    unserializeString() {
      return string => {
        return this.parseJson(string)
      }
    }
  },
  methods: {
    pasteStamp(event) {
      this.timestamp = event.clipboardData.getData('Text')
    },
    pasteDate(event) {
      this.datetime = event.clipboardData.getData('Text')
    },
    copyLink(event) {
      clip(this.link, event)
    },
    copyText(event, text) {
      clip(text, event)
    },
    handleDeleteList(listName, row) {
      Arr.removeValue(this[listName], 'id', row.id)
    },
    addList(listName, raw, result) {
      this[listName].push({
        id: this.listId++,
        raw: raw,
        ...result
      })
    },
    handleRandom(event) {
      clip(Str.random(this.length), event)
    },
    handleSerialize() {
      const loadingInstance = this.$loading({
        target: '.el-tabs'
      })
      this.$store
        .dispatch('neigou/toolSerialize', {
          data: this.serializeString
        })
        .then(({ body }) => {
          this.addList('serializeList', this.serializeString, body)
          this.serializeString = ''
        })
        .finally(() => loadingInstance.close())
    },
    handleBase64(type) {
      if (type === 'decode') {
        this.addList('base64List', this.base64String, { data: Buffer.from(this.base64String, 'base64').toString('utf-8') })
      } else {
        this.addList('base64List', this.base64String, { data: Buffer.from(this.base64String, 'utf-8').toString('base64') })
      }
      this.base64String = ''
    },
    handleUrl(type) {
      if (type === 'decode') {
        this.addList('urlList', this.urlString, { data: decodeURIComponent(this.urlString) })
      } else {
        this.addList('urlList', this.urlString, { data: encodeURIComponent(this.urlString) })
      }
      this.urlString = ''
    },
    handleHash() {
      const loadingInstance = this.$loading({
        target: '.el-tabs'
      })
      this.$store
        .dispatch('neigou/toolHash', {
          data: this.hashString
        })
        .then(({ body }) => {
          this.addList('hashList', this.hashString, body)
          this.hashString = ''
        })
        .finally(() => loadingInstance.close())
    },
    parseJson(jsonString) {
      try {
        const jsonData = JSON.parse(jsonString)
        if (typeof jsonData === 'object') {
          for (const k in jsonData) {
            try {
              jsonData[k] = this.parseJson(jsonData[k])
            } catch (e) {
              // dothing
            }
          }
        }
        return jsonData
      } catch (e) {
        // dothing
      }
      return jsonString
    },
    handleJson() {
      this.jsonData = this.parseJson(this.jsonString)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .separator {
    margin: 0 20px;
  }
  .json-editor-container {
    position: relative;
    height: 100%;
  }
}
</style>
