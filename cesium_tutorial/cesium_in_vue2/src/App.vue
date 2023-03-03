<template>
  <div id="app">
    <CesiumVue/>
    <!-- <CesiumDemo></CesiumDemo> -->
    <!-- <PrimitiveDemo></PrimitiveDemo> -->
    <!-- <EntityDemo></EntityDemo> -->
    <!-- <drawCommandTry></drawCommandTry> -->
  </div>
</template>

<script>
import CesiumVue from "./components/cesiumVue.vue"

// import CesiumDemo from './components/CesiumDemo.vue'
// import PrimitiveDemo from './components/demo/primitives.vue'// 用于存放使用Cesium.Primitive API创建的图元的demo
// import EntityDemo from './components/demo/entities.vue'// 用于存放使用Cesium.Entity 创建的图元的demo
// import drawCommandTry from './components/drawCommandTry.vue'


export default {
  name: 'App',
  components: {
    CesiumVue,
    // CesiumDemo,
    // drawCommandTry,
    // PrimitiveDemo,
    // EntityDemo,
  },
  data: function () {
    return {
      fullHeight: document.documentElement.clientHeight
    }
  },
  methods: {
    get_BodyHeight(){  //动态获取浏览器的高度
      const that = this
      window.onresize = () => {
        return (()=>{
          window.fullHeight = document.documentElement.clientHeight
          that.fullHeight = window.fullHeight
        })
      }
    }
  },
}
</script>

<style>
*{
  margin:0;
  padding:0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100vh;
  color: #2c3e50;
}
</style>
