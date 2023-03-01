<template>
    <div id="cesiumContainer"></div>
</template>

<script>
// import {
//   Cesium3DTileset,
//   createWorldTerrain,
//   IonResource,
//   Viewer,
//   viewerCesiumNavigationMixin,
//   Model,
//   Cartesian3,
//   Transforms,
//   Matrix4,
//   ModelAnimationLoop,
//   Camera,
//   Ion,
//   Widget
// } from 'cesium';
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
// import "./css/main.css";

export default {
  name: 'CesiumViewer',
  // props: {
  //   msg: String
  // },
  mounted: () => {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo';

    const mapbox = new Cesium.MapboxStyleImageryProvider({
        // styleId: 'streets-v11',
        styleId: 'satellite-v9',
        accessToken: 'pk.eyJ1IjoidXJhaGFyYTMyMSIsImEiOiJjbDQyaDdnaTgxN3ExM2pxeTNjMzRvN3lxIn0.OwTgfEZXi7Earae_erWKwA'
    });

    var viewer = new Cesium.Viewer('cesiumContainer',{
      shouldAnimate:false,
      geocoder:false,
      homeButton:false,
      animation:false,
      sceneModePicker:false,
      projectionPicker:false,
      animation:false,
      timeline:false,
      infoBox:false,
      // searchButton:false,
      // imageryLayers:false,
      navigationHelpButton: false,
      baseLayerPicker : false,
      //Use OpenStreetMaps
      imageryProvider : mapbox
    });


    // viewer.imageryLayers.addImageryProvider(mapbox);
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  div#cesiumContainer {
    height: 100vh;
    width: 100vw;
  }
</style>
