<template>
  <div :id="id" class="divlabel-container" v-if="show" >
    <div class="animate-maker-border">
      <span class="animate-marker__text_one"></span>
      <span class="animate-marker__text_tow"></span>
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

.animate-maker-border{
    position: relative;
}
.animate-marker__text_one
{
    position: absolute;
    width:10px;
    height:10px;
    border: 1px solid green ;
    border-radius:50%;
    animation:myOne 2s ease-out;
    animation-iteration-count: infinite;
    background: green;
}
.animate-marker__text_tow{
    position: absolute;
    width:10px;
    height:10px;
    border: 1px solid green  ;
    border-radius:50%;
    animation:myTwo 2s ease-out;
    animation-iteration-count: infinite;
    background: green;
}

@keyframes myOne
{
    0%   {
        transform: scale(1);
        opacity: 1;
    }
    25%   {
        transform: scale(1.25);
        opacity: 0.5;
    }
    50%   {
        transform: scale(1.25);
        opacity: 0.25;
    }
    100%   {
        transform: scale(1.5);
        opacity: 0;
    }
}

@keyframes myTwo
{
    0%   {
        transform: scale(1);
        opacity: 1;
    }
    25%   {
        transform: scale(1.25);
        opacity: 0.5;
    }
    50%   {
        transform: scale(1.5);
        opacity: 0.25;
    }
    100%   {
        transform: scale(2);
        opacity: 0;
    }
}
</style>
