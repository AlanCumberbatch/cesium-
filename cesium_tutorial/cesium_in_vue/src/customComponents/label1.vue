<template>
  <div :id="id" class="divlabel-container" v-if="show" >
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
};
</script>


<style >

.divlabel-container, .divlabel-container::before, .divlabel-container::after {
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
  height: 30px;
  margin: 0;
  /* color: #69ca62; */
  color: rgba(0, 173, 181, 1.0);
  border: 1px solid rgba(105, 202, 98, 1.0);
  /* box-shadow: inset 0 0 0 1px rgba(105, 202, 98, 0.5); */
  /* box-shadow: 0 0 0 1px rgba(105, 202, 98, 0.5); */
/* //   outline:2px solid red;
//   outline-offset:5px; */

}
.animate-maker-border::before,.animate-maker-border::after{
    content: '';
    z-index: 10;
    /* margin: -5%; */
    /* box-shadow: inset 0 0 0 2px; */
    /* animation: clipMe 8s linear infinite; */
}
/* .animate-maker-border::before {
    animation-delay: -4s;
} */
@keyframes clipMe {
  0%, 100% {
    clip: rect(0px, 170.0px, 2px, 0px);
  }
  25% {
    clip: rect(0px, 2px, 47.0px, 0px);
  }
  50% {
    clip: rect(45.0px, 170.0px, 47.0px, 0px);
  }
  75% {
    clip: rect(0px, 170.0px, 47.0px, 45.0px);
  }
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
  background: rgba(0, 173, 181, 0.32);
}
</style>
