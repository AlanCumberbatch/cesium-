<template>
  <!--  @click="labelClicK"  添加了点击事件也用不了。。。。。 -->
  <div :id="id" class="divlabel-container" v-if="show">
    <div class="animate-maker-border">
      <span class="animate-marker__text">{{ title }}</span>
    </div>

  </div>
</template>

<script>
export default {
  name: "DynamicLabel",
  data() {
    return {
      show: true,
    };
  },
  props: {
    title: {
      type: String,
      default: "标题",
    },
    id:{
        type:String,
        default:'001'
    }
  },
  methods: {
    labelClick() {
      console.log('labelClicK --- in label.vue')
    },
    labelDblclick() {
      console.log('labelDblclick --- in label.vue')
    },


    getDomWidthAndHeight() {
      let label = document.getElementsByClassName('animate-maker-border');

      // label[0].offsetHeight,label[0].offsetWidth // 只有在 label 能够显示的时候才会有值
      return [label[0].offsetWidth, label[0].offsetHeight];
    }
  },
};
</script>

<style >
.divlabel-container , .divlabel-container::before, .divlabel-container::after {
  position: absolute;
  left: 0;
  bottom: 0;
  pointer-events: none;
  cursor: pointer;
}
.animate-maker-border, .animate-maker-border::before, .animate-maker-border::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
.animate-maker-border {
  width: 150px;
  height: 100px;
  margin: 0;
  color: #69ca62;

}
.animate-maker-border::before{
  /* //,.animate-maker-border::after */
    content: '';
    z-index: 10;
    /* box-shadow: inset 0 0 0 2px; */

    position: absolute;
    top: 100%;
    left: 50%;

    width: 0;
    height: 0;
    border-top: 10px solid rgba(66,77,86,0.8);
    border-bottom: 10px solid transparent;
    border-right: 10px solid transparent;
    border-left: 10px solid transparent;

    -webkit-transform: translateX(-10px);
    transform: translateX(-10px);
}

.animate-marker__text {
  color: #fff;
  font-size: 14px;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-weight: bolder;
  user-select: none;
  cursor: pointer;
  background: rgba(66,77,86,0.8);
}

</style>
