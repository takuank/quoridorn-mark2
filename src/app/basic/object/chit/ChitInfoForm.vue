<template>
  <div class="chit-info-form">
    <!-- 掴む -->
    <div class="object-cell">
      <div
        class="object"
        :class="{ 'type-add': isAdd }"
        ref="object"
        :draggable="isAdd && imageDocId"
        @dragstart="dragStart"
        @dragend="dragEnd"
      ></div>
    </div>

    <!-- コマ情報 -->
    <table class="info-table">
      <tr>
        <tr-number-input-component
          labelName="width"
          inputWidth="3em"
          v-model="widthVolatile"
          :min="1"
        />
      </tr>
      <tr>
        <tr-number-input-component
          labelName="height"
          inputWidth="3em"
          v-model="heightVolatile"
          :min="1"
        />
      </tr>
      <tr>
        <th>
          <label
            :for="`${key}-background-size`"
            class="label-background-size label-input"
            v-t="'label.background-location'"
          ></label>
        </th>
        <td class="value-cell">
          <background-location-select
            :id="`${key}-background-size`"
            v-model="backgroundSizeVolatile"
          />
        </td>
      </tr>
    </table>

    <simple-tab-component
      :windowKey="windowKey"
      :tabList="tabList"
      v-model="currentTabInfo"
    >
      <!-- 画像タブ -->
      <image-picker-component
        v-if="currentTabInfo.target === 'image'"
        v-model="imageDocIdVolatile"
        :windowKey="key"
        :imageTag.sync="imageTagVolatile"
        :direction.sync="directionVolatile"
        ref="imagePicker"
      />

      <!-- 追加情報タブ -->
      <div
        class="layer-block"
        v-if="currentTabInfo.target === 'additional-info'"
      >
        <table>
          <tr>
            <tr-string-input-component
              labelName="tag"
              width="100%"
              v-model="tagVolatile"
            />
          </tr>
          <tr>
            <tr-string-input-component
              labelName="name"
              width="100%"
              v-model="nameVolatile"
            />
          </tr>
          <tr>
            <th>
              <label
                :for="`${key}-layer`"
                class="label-layer label-input"
                v-t="'label.layer'"
              ></label>
            </th>
            <td class="value-cell">
              <scene-layer-select
                v-model="layerIdVolatile"
                :id="`${key}-layer`"
              />
            </td>
          </tr>
        </table>
      </div>

      <!-- その他欄タブ -->
      <other-text-edit-component
        v-if="currentTabInfo.target === 'other-text'"
        v-model="otherTextListVolatile"
        :windowKey="windowKey"
      />
    </simple-tab-component>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from "vue-property-decorator";
import { Mixins } from "vue-mixin-decorator";
import { Task, TaskResult } from "task";
import TaskProcessor from "../../../core/task/TaskProcessor";
import LifeCycle from "../../../core/decorator/LifeCycle";
import ComponentVue from "../../../core/window/ComponentVue";
import { BackgroundSize, Direction } from "@/@types/room";
import GameObjectManager from "../../GameObjectManager";
import { TabInfo } from "@/@types/window";
import VueEvent from "../../../core/decorator/VueEvent";
import TrNumberInputComponent from "../../common/components/TrNumberInputComponent.vue";
import BackgroundLocationSelect from "../../common/components/select/BackgroundLocationSelect.vue";
import SimpleTabComponent from "../../../core/component/SimpleTabComponent.vue";
import ImagePickerComponent from "../../../core/component/ImagePickerComponent.vue";
import TrStringInputComponent from "../../common/components/TrStringInputComponent.vue";
import SceneLayerSelect from "../../common/components/select/SceneLayerSelect.vue";
import { StoreUseData } from "@/@types/store";
import { MemoStore } from "@/@types/gameObject";
import OtherTextEditComponent from "@/app/basic/other-text/OtherTextEditComponent.vue";

@Component({
  components: {
    OtherTextEditComponent,
    SceneLayerSelect,
    TrStringInputComponent,
    ImagePickerComponent,
    SimpleTabComponent,
    BackgroundLocationSelect,
    TrNumberInputComponent
  }
})
export default class ChitInfoForm extends Mixins<ComponentVue>(ComponentVue) {
  @Prop({ type: String, required: true })
  private windowKey!: string;

  @Prop({ type: String, default: "image" })
  private initTabTarget!: string;

  @Prop({ type: Boolean, required: true })
  private isAdd!: boolean;

  private mediaList = GameObjectManager.instance.mediaList;
  private isMounted: boolean = false;
  private imageSrc: string = "";

  @Prop({ type: String, required: true })
  private name!: string;

  private nameVolatile: string = "";
  @Watch("name", { immediate: true })
  private onChangeName(value: string) {
    this.nameVolatile = value;
  }
  @Watch("nameVolatile")
  private onChangeNameVolatile(value: string) {
    this.$emit("update:name", value);
  }

  @Prop({ type: String, required: true })
  private tag!: string;

  private tagVolatile: string = "";
  @Watch("tag", { immediate: true })
  private onChangeTag(value: string) {
    this.tagVolatile = value;
  }
  @Watch("tagVolatile")
  private onChangeTagVolatile(value: string) {
    this.$emit("update:tag", value);
  }

  @Prop({ type: Array, required: true })
  private otherTextList!: StoreUseData<MemoStore>[];
  private otherTextListVolatile: StoreUseData<MemoStore>[] = [];
  @Watch("otherTextList", { immediate: true })
  private onChangeOtherTextList(value: StoreUseData<MemoStore>[]) {
    this.otherTextListVolatile = value;
  }
  @Watch("otherTextListVolatile")
  private onChangeOtherTextListVolatile(value: StoreUseData<MemoStore>[]) {
    this.$emit("update:otherTextList", value);
  }

  @Prop({ type: Number, required: true })
  private width!: number;

  private widthVolatile: number = 0;
  @Watch("width", { immediate: true })
  private onChangeWidth(value: number) {
    this.widthVolatile = value;
  }
  @Watch("widthVolatile")
  private onChangeWidthVolatile(value: number) {
    this.$emit("update:width", value);
  }

  @Prop({ type: Number, required: true })
  private height!: number;

  private heightVolatile: number = 0;
  @Watch("height", { immediate: true })
  private onChangeHeight(value: number) {
    this.heightVolatile = value;
  }
  @Watch("heightVolatile")
  private onChangeHeightVolatile(value: number) {
    this.$emit("update:height", value);
  }

  @Prop({ type: String, default: null })
  private imageDocId!: string | null;

  private imageDocIdVolatile: string | null = null;
  @Watch("imageDocId", { immediate: true })
  private onChangeImageDocId(value: string | null) {
    this.imageDocIdVolatile = value;
  }
  @Watch("imageDocIdVolatile")
  private onChangeImageDocIdVolatile(value: string | null) {
    this.$emit("update:imageDocId", value);
  }

  @Prop({ type: String, default: null })
  private imageTag!: string | null;

  private imageTagVolatile: string | null = null;
  @Watch("imageTag", { immediate: true })
  private onChangeImageTag(value: string | null) {
    this.imageTagVolatile = value;
  }
  @Watch("imageTagVolatile")
  private onChangeImageTagVolatile(value: string | null) {
    this.$emit("update:imageTag", value);
  }

  @Prop({ type: String, required: true })
  private direction!: Direction;

  private directionVolatile: Direction = "none";
  @Watch("direction", { immediate: true })
  private onChangeDirection(value: Direction) {
    this.directionVolatile = value;
  }
  @Watch("directionVolatile")
  private onChangeDirectionVolatile(value: Direction) {
    this.$emit("update:direction", value);
  }

  @Prop({ type: String, required: true })
  private backgroundSize!: BackgroundSize;

  private backgroundSizeVolatile: BackgroundSize = "contain";
  @Watch("backgroundSize", { immediate: true })
  private onChangeBackgroundSize(value: BackgroundSize) {
    this.backgroundSizeVolatile = value;
  }
  @Watch("backgroundSizeVolatile")
  private onChangeBackgroundSizeVolatile(value: BackgroundSize) {
    this.$emit("update:backgroundSize", value);
  }

  @Prop({ type: String, required: true })
  private layerId!: string;

  private layerIdVolatile: string = "";
  @Watch("layerId", { immediate: true })
  private onChangeLayerId(value: string) {
    this.layerIdVolatile = value;
  }
  @Watch("layerIdVolatile")
  private onChangeLayerIdVolatile(value: string) {
    this.$emit("update:layerId", value);
  }

  private tabList: TabInfo[] = [
    { key: "1", target: "image", text: "" },
    { key: "2", target: "additional-info", text: "" },
    { key: "3", target: "other-text", text: "" }
  ];
  private currentTabInfo: TabInfo = this.tabList[0];

  @TaskProcessor("language-change-finished")
  private async languageChangeFinished(
    task: Task<never, never>
  ): Promise<TaskResult<never> | void> {
    this.createTabInfoList();
    task.resolve();
  }

  @LifeCycle
  private async created() {
    this.createTabInfoList();
  }

  private createTabInfoList() {
    this.tabList.forEach(t => {
      t.text = this.$t(`label.${t.target}`)!.toString();
    });
  }

  @LifeCycle
  public async mounted() {
    this.isMounted = true;
    this.currentTabInfo = this.tabList.filter(
      t => t.target === this.initTabTarget
    )[0];
  }

  @Watch("isMounted")
  @Watch("imageDocId")
  @Watch("direction")
  @Watch("backgroundSize")
  private onChangeImage() {
    if (!this.isMounted) return;
    const imageObj = this.mediaList.filter(
      obj => obj.id === this.imageDocId
    )[0];
    if (!imageObj) return;
    this.imageSrc = imageObj.data!.url;
    this.objectElm.style.setProperty("--imageSrc", `url('${this.imageSrc}')`);
    let direction = "";
    if (this.direction === "horizontal") direction = "scale(-1, 1)";
    if (this.direction === "vertical") direction = "scale(1, -1)";
    if (this.direction === "180") direction = "rotate(180deg)";
    this.objectElm.style.setProperty(`--image-direction`, direction);
    this.objectElm.style.setProperty(
      "--isEmpty",
      (this.imageSrc ? 0 : 1).toString()
    );
  }

  private get objectElm(): HTMLElement {
    return this.$refs.object as HTMLElement;
  }

  @VueEvent
  private dragStart(event: DragEvent) {
    this.$emit("drag-start", event);
  }

  @VueEvent
  private dragEnd(event: DragEvent) {
    this.$emit("drag-end", event);
  }

  @Watch("isMounted")
  @Watch("width")
  @Watch("height")
  private onChangeSize() {
    if (!this.isMounted) return;
    let ratio: number = Math.min(4 / this.width, 4 / this.height, 1);
    this.objectElm.style.setProperty(
      "--width-ratio",
      (this.width * ratio).toString()
    );
    this.objectElm.style.setProperty(
      "--height-ratio",
      (this.height * ratio).toString()
    );
  }

  @Watch("isMounted")
  @Watch("backgroundSize")
  private onChangeLocation() {
    if (!this.isMounted) return;
    let backgroundSize = "";
    let backgroundPosition = "center";
    if (this.backgroundSize === "contain") backgroundSize = "contain";
    if (this.backgroundSize === "cover-start") {
      backgroundSize = "cover";
      backgroundPosition = "top left";
    }
    if (this.backgroundSize === "cover-center") {
      backgroundSize = "cover";
    }
    if (this.backgroundSize === "cover-end") {
      backgroundSize = "cover";
      backgroundPosition = "bottom right";
    }
    if (this.backgroundSize === "100%") {
      backgroundSize = "100% 100%";
    }
    this.objectElm.style.setProperty("--image-background-size", backgroundSize);
    this.objectElm.style.setProperty(
      "--image-background-position",
      backgroundPosition
    );
  }
}
</script>

<style scoped lang="scss">
@import "../../../../assets/common";

.chit-info-form {
  display: contents;
}

.object {
  @include inline-flex-box(row, center, center);
  width: calc(var(--width-ratio) * 3em);
  height: calc(var(--height-ratio) * 3em);
  background-image: var(--imageSrc);
  transform: var(--image-direction);
  background-size: var(--image-background-size);
  background-repeat: no-repeat;
  background-position: var(--image-background-position);
  border-style: solid;
  border-color: rgb(255, 255, 153);
  border-width: 3px;
  box-sizing: border-box;

  &.type-add {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    &[draggable="false"] {
      cursor: not-allowed;

      background-image: linear-gradient(
          -45deg,
          transparent calc(50% - 1px),
          var(--uni-color-red) calc(50% - 1px),
          var(--uni-color-red) calc(50% + 1px),
          transparent calc(50% + 1px)
        ),
        linear-gradient(
          45deg,
          transparent calc(50% - 1px),
          var(--uni-color-red) calc(50% - 1px),
          var(--uni-color-red) calc(50% + 1px),
          transparent calc(50% + 1px)
        );
    }
  }
}

.simple-tab-component {
  grid-row: 1 / 3;
  grid-column: 2 / 3;

  > *:not(:first-child) {
    width: 100%;
    height: calc(100% - 2em);
    flex: 1;
  }

  > div:not(.image-picker-container) {
    border: solid 1px gray;
    box-sizing: border-box;
    padding: 0.2rem;
  }

  textarea {
    resize: none;
    padding: 0;
    box-sizing: border-box;
  }
}

.object-cell {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  @include flex-box(row, center, center);
}

> table {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
  table-layout: fixed;

  th,
  td {
    label {
      @include inline-flex-box(row, flex-start, center);
    }
  }

  th {
    text-align: right;
    padding: 0;
    white-space: nowrap;
    width: 1px;
  }

  td {
    text-align: left;
    padding: 0;

    input {
      margin: 0;
    }
  }
}
</style>
