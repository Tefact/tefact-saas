<template>
  <BaseProperties title="表单设置" v-bind="$attrs">
    <div class="resolu-container" v-if="tmpNode">
      <div class="resolu-row">
        <div class="resolu-label">样式</div>
        <el-select
          size="mini"
          v-model="tmpNode.data.formId"
          placeholder="请选择"
          @change="handleDataChange"
        >
          <el-option
            v-for="item in formList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <div class="resolu-row">
        <div class="resolu-label"></div>
        <el-button size="mini" @click="handleEdit" :disabled="!tmpNode.data.formId"
          >编辑表单</el-button
        >
        <el-button type="primary" size="mini" @click="handleAdd"
          >新增表单</el-button
        >
      </div>
    </div>
  </BaseProperties>
</template>
<style lang="scss" scoped></style>
<script lang="ts">
import { Component } from "vue-property-decorator";
import PropertiesClass from "../components/PropertiesClass";
import BaseProperties from "./Base.vue";
import PropertiesMixin from "../components/PropertiesMixin";
import get from "lodash/get";
import type { ITarget } from "@tefact/core";

@Component({
  components: { BaseProperties },
  mixins: [PropertiesMixin],
})
export default class Form extends PropertiesClass {
  formList = [] as Array<ITarget>;

  get formId() {
    return this.tmpNode.data?.formId;
  }

  handleDataChange() {
    if (!this.tmpNode || !this.tmpNode.data) return;
    this.$nextTick(() => {
      this.handleSave();
    })
  }

  handleEdit() {
    if (!this.formId) return;
    this.engine.targetEdit(this.formId);
  }

  handleAdd() {
    this.engine.targetAdd()
  }

  async initData() {
    this.formList = this.setting.formList || [];
  }

  mounted() {
    this.initData();
  }
}
</script>
