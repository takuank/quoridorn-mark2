<template>
  <ctrl-select
    v-model="localValue"
    :optionInfoList="optionInfoList"
    ref="component"
  />
</template>

<script lang="ts">
import SelectMixin from "./base/SelectMixin";

import { Component, Mixins } from "vue-mixin-decorator";
import { Task, TaskResult } from "task";
import LifeCycle from "../../../../core/decorator/LifeCycle";
import TaskProcessor from "../../../../core/task/TaskProcessor";
import CtrlSelect from "../../../../core/component/CtrlSelect.vue";
import ComponentVue from "../../../../core/window/ComponentVue";
import { HtmlOptionInfo } from "../../../../../@types/window";
import LanguageManager from "../../../../../LanguageManager";

interface MultiMixin extends SelectMixin, ComponentVue {}

@Component({
  components: { CtrlSelect }
})
export default class StartTimePlaceSelect extends Mixins<MultiMixin>(
  SelectMixin,
  ComponentVue
) {
  private optionInfoList: HtmlOptionInfo[] = [
    { value: "[title]", key: "", text: "", disabled: true },
    { value: "", key: "", text: "", disabled: false },
    { value: "field", key: "", text: "", disabled: false },
    { value: "graveyard", key: "", text: "", disabled: false },
    { value: "backstage", key: "", text: "", disabled: false }
  ];

  @LifeCycle
  private created() {
    this.createOptionInfoList();
  }

  @TaskProcessor("language-change-finished")
  private async languageChangeFinished(
    task: Task<never, never>
  ): Promise<TaskResult<never> | void> {
    this.createOptionInfoList();
    task.resolve();
  }

  private createOptionInfoList() {
    this.optionInfoList.forEach(o => {
      o.key = o.value;
      o.text = LanguageManager.instance.getText(`label.${o.value}`);
    });
    this.optionInfoList[0].text = LanguageManager.instance.getText(
      "label.place"
    );
    this.optionInfoList[1].text = LanguageManager.instance.getText(
      "label.no-target"
    );
  }
}
</script>
