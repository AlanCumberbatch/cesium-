<template>
  <div id="cesiumContainer"></div>
</template>

<script>

export default {
  name: "cesium",
  mounted() {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo';

    const viewer = new Cesium.Viewer('cesiumContainer');
  }
}
</script>

<style scoped>
#cesiumContainer{
  /* width: 100%;
  height: 100%; */
  width: 100vw;
  height: 100vh;
}
</style>
