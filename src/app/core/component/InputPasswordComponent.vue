<template>
  <div class="password-component" ref="component">
    <password
      :id="compKey"
      :defaultClass="`Password__field input${isPending ? ' pending' : ''}`"
      v-model="localValue"
      :secureLength="10"
      :toggle="!disabled"
      :required="false"
      title=""
      :placeholder="$t('label.password-placeholder')"
      :showStrengthMeter="setting"
      :badge="setting"
      :disabled="disabled"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import Password from "vue-password-strength-meter";
import LifeCycle from "../decorator/LifeCycle";

@Component({
  components: { Password }
})
export default class InputPasswordComponent extends Vue {
  @Prop({ type: String, required: true })
  public value!: string;

  @Prop({ type: String, required: true })
  public compKey!: string;

  @Prop({ type: Boolean, required: true })
  public setting!: boolean;

  @Prop({ type: Boolean, required: false, default: false })
  public disabled!: boolean;

  @Prop({ type: Boolean, default: false })
  public isPending!: boolean;

  private isMounted: boolean = false;

  @LifeCycle
  private mounted() {
    this.isMounted = true;
  }

  public input(password: string) {
    this.$emit("input", password);
  }

  public get localValue(): string {
    return this.value;
  }

  public set localValue(password: string) {
    this.input(password);
  }

  private get elm(): HTMLElement {
    return this.$refs.component as HTMLElement;
  }

  public focus() {
    this.elm.focus();
  }

  @Watch("isMounted")
  @Watch("setting")
  private onChangeIsSetting() {
    this.elm.style.setProperty("--height", this.setting ? "2.5em" : "2em");
  }
}
</script>

<style lang="scss">
@import "../../../assets/common";

.password-component {
  flex: 1;

  .Password {
    height: var(--height);
    max-width: inherit;
    margin: 0;

    .Password__field {
      padding: 0;
      font-size: inherit;
      height: 2em;
      background-color: white;
      border: solid 1px gray;
    }

    .Password__strength-meter {
      height: 0.5em;
      margin: 0;
    }
  }

  input:disabled {
    background-color: var(--uni-color-light-gray) !important;
  }
}
</style>
