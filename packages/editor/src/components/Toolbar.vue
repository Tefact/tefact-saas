<template>
  <div class="editor-toolbar">
    <i class="el-icon-arrow-left" @click="engine.back()"></i>
    <div class="page-title" @click="handleOpenModify">
      {{ target.title }}
      <i class="el-icon-edit"></i>
    </div>

    <div class="tool-list">
      <el-button
        type="info"
        icon="el-icon-receiving"
        size="small"
        @click="handleSavePage"
        >保存</el-button
      >
      <el-button
        type="info"
        icon="el-icon-data-analysis"
        size="small"
        @click="handlePreviewer"
        >预览</el-button
      >
      <SharePageEditor :page="target" :pageType="featureType">
        <el-button type="info" icon="el-icon-share" size="small"
          >分享</el-button
        >
      </SharePageEditor>
    </div>

    <div class="right-button">
      <el-button-group>
        <el-button
          v-for="(device, i) in deviceList"
          :key="i"
          :type="engine.setting.device === device.value ? 'primary' : 'default'"
          size="small"
          @click="handleSelectDevices(device)"
        >
          <i :class="`tefact-icon ${device.icon}`"></i>
        </el-button>
      </el-button-group>
    </div>
    <Previewer
      :page="target"
      :isForm="engine.isForm"
      :show="showPreviewer"
      @cancel="handlePreviewerHide"
    />
  </div>
</template>
<style lang="scss"></style>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import SharePageEditor from "@/components/common/SharePageEditor.vue";
import Previewer from "@/components/common/Previewer.vue";
import { BaseView, ITarget, ISetting, DeviceType } from "@tefact/core";

@Component({
  components: { Previewer, SharePageEditor },
})
export default class Toolbar extends BaseView {
  @Prop() target?: ITarget;

  showPreviewer = false;
  appId: string | null = null;
  dialogVisible = false;

  deviceList = [
    { icon: "tf-icon-pc", name: "PC", value: "pc" },
    { icon: "tf-icon-mobile-phone", name: "Mobile", value: "mobile" },
  ];

  get featureType() {
    return this.engine.featureType;
  }

  handleSavePage() {}

  handlePreviewer(): void {
    this.showPreviewer = true;
  }

  handlePreviewerHide() {
    this.showPreviewer = false;
  }

  handleOpenModify() {}

  handleSelectDevices(device: DeviceType) {
    this.engine.changeSetting({
      ...this.engine.setting,
      device,
    } as ISetting);
  }
}
</script>
<style lang="scss">
.editor-toolbar {
  display: flex;
  align-items: center;

  .el-icon-arrow-left {
    cursor: pointer;

    &:hover {
      color: $editor-main-color;
    }
  }

  .page-title {
    margin: 0 10px;
    cursor: pointer;

    &:hover {
      color: $editor-main-color;
    }
  }

  .tool-list {
    flex: 1;
    display: flex;
    justify-content: center;

    .el-button {
      border: 0;
      background: none;
      color: $editor-text-color;

      &:hover {
        color: $editor-text-active-color;
      }
    }
  }

  .right-button {
    float: right;
  }
}

.editor-toolbar {
  height: 32px;
  padding: 10px;
  background-color: white;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid $borderSecondColor;
}
</style>