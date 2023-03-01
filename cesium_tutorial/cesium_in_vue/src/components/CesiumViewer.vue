<template>
    <div id="cesiumContainer"></div>
</template>

<script>
import {
  Cesium3DTileset,
  createWorldTerrain,
  IonResource,
  Viewer,
  viewerCesiumNavigationMixin,
  Model,
  Cartesian3,
  Transforms,
  Matrix4,
  ModelAnimationLoop,
  Camera,
  Ion,
  Widget
} from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
// import "./css/main.css";

export default {
  name: 'CesiumViewer',
  props: {
    msg: String
  },
  mounted: () => {
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo';

    var viewer = new Viewer('cesiumContainer',{
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
      navigationHelpButton:false,
    });
    var scene = viewer.scene;
    var camera = scene.camera;

    // var tileset = new Cesium3DTileset({
    //     url: IonResource.fromAssetId(40866)
    // });

    // viewer.scene.primitives.add(tileset);
    // viewer.zoomTo(tileset);

    function createModel(options) {

      var position = Cartesian3.fromDegrees(options.points[0], options.points[1], options.height);

      var model_Instance = Model.fromGltf({
        url:options.url,
        modelMatrix: Transforms.northEastDownToFixedFrame(position),
        minimumPixelSize:options.moduleSize
      });
      scene.primitives.add(model_Instance);
      // console.log(Object.keys(scene.primitives).map(item => item.indexOf('pitch') > -1 ? item : ''));
    }

    /*
      _guid"
      "_zIndex"
      "show"
      "destroyPrimitives"
    */
    console.log(scene.primitives.show);



    var positions = [];
    var lon = -122.99875;
    var lat = 44.0503706;
    var lonIncrement = 12.5;
    var height = 100.0;
    for(var i = 1 ; i < 25 ;i++){
      // positions.push(lon + i*lonIncrement,lat,height);
      var position = [lon + i*lonIncrement,lat,height]
      var bloomOpt = {
        points: position,
        url:"CesiumBalloon.glb",
        moduleSize:64,
        height:5000.0
      };

      createModel(bloomOpt);

      // scene.primitives.show = false;
    }


    // camera.flyTo({
    //   destination:position,
    // });

    // IonResource.fromAssetId(530185)
    // .then(function (resource) {
    //   var model = createModel(resource, 500000.0);
    // })
    // .otherwise(function (error) {
    //   console.log(error);
    // });

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
