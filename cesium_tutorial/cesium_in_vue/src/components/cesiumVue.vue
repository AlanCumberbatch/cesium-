<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import Utils from '../utils/Utils'

export default {
  name: "cesium",
  mounted() {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo';

    const viewer = new Cesium.Viewer('cesiumContainer', {
      infoBox: false,
    });

    /*
      * @descripion:
     * @param {Viewer} viewer
     * @param {Cartesian2} position
     * @param {String} title
     * @param {String} id
     * @return {*}
    */
    let label = new Utils.DivLabel({
      viewer,
      position:[124.54035, 38.92146],//此时传入的是经纬度
      height:10,
      title:'CL标签',
      id:'210201025'
    })
    // label.setColor();
    let that_ = this;
    var handlerVideo = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerVideo.setInputAction(function (click) {//
      // console.log('x', click.position.x,'y', click.position.x);//此时的position 就是 Canvas 二维坐标系里的坐标 --- 不是的

      // label.posRangeInCanvas
      console.log('%c [ label.posRangeInCanvas ]-39', 'font-size:13px; background:pink; color:#bf2c9f;', label.posRangeInCanvas)
      // const windowPosition = new Cesium.Cartesian2();
      // Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      //   viewer.scene,
      //   click.position,
      //   windowPosition
      // );
      // console.log('%c [ windowPosition ]-42', 'font-size:13px; background:pink; color:#bf2c9f;', windowPosition)

      // var pick = viewer.scene.pick(click.position);
      // console.log('%c [ pick ]-36', 'font-size:13px; background:pink; color:#bf2c9f;', pick)
      // if (pick && pick.id._name == "video") {
      //   //  monitorEntity._billboard._image._value = './imgs/blue.png';
      //   monitorEntity._label._text._value = "label";
      // } else {
      //     return;
      // }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // window.onclick = function (event) {
    //   var rect = event.target.getBoundingClientRect();
    //   var x = event.clientX-rect.left;
    //   // var y = -(event.clientY-rect.top);
    //   var y = event.clientY - rect.top;
    //   console.log('x', x, 'y', y);
    // }

    // Output the window position of longitude/latitude (0, 0) every time the mouse moves.
    var scene = viewer.scene;
    var ellipsoid = scene.globe.ellipsoid;
    var position = Cesium.Cartesian3.fromDegrees(0.0, 0.0);
    console.log('%c [ position ]-69', 'font-size:13px; background:pink; color:#bf2c9f;', position)
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(movement) {
      // console.log('%c [ movement ]-71', 'font-size:13px; background:pink; color:#bf2c9f;', movement)
      // console.log('%c [ movement ]-71', 'font-size:13px; background:pink; color:#bf2c9f;', movement.endPosition)
        // console.log(Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, movement.endPosition));
        // console.log(Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, movement.endPosition));
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 想要实现： 选中，然后拖拽，双击，关于PopUP之后再说
    // 先尝试实现选中：



    let test1 = () => {
      var entity = viewer.entities.add({
        name: 'billboard',
        position: Cesium.Cartesian3.fromDegrees(120.941169, 27.9932,30.0),
        // point: { //点
        //   pixelSize: 0,
        //   HeightReference: 1000
        // },
        label: { //文字标签
          text: '文字标签',
          font: '500 30px Helvetica',// 15pt monospace
          scale: 0.5,
          style: Cesium.LabelStyle.FILL,
          fillColor: Cesium.Color.WHITE,
          pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
          showBackground: true,
          backgroundColor: new Cesium.Color(0.5, 0.6, 1, 1.0)
        },
        billboard: { //图标
          image: '…/imgs/black.png',
          width: 50,
          height: 50
        },
      });
      // 视角定位
      viewer.flyTo(entity, {
        duration: 2,
        offset: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-30),
          range: 720
        }
      });
      //点击广告牌改变文本和图标
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (click) {
      var pick = viewer.scene.pick(click.position);
      if (pick && pick.id._name == 'billboard') {
        // monitorEntity._billboard._image._value = '…/images/marker2.png';
        // monitorEntity._label._text._value = 'label';
        console.log('%c [ entity ]-72', 'font-size:13px; background:pink; color:#bf2c9f;', entity)
      } else {

        return;
      }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    let test2 = () => {
      var monitorEntity = viewer.entities.add({
        name: "video",
        position: Cesium.Cartesian3.fromDegrees(109.44, 32.11,30.0),
        point: { //点
            pixelSize: 0,
            HeightReference: 1000
        },
        label: { //文字标签
          text: "文字标签",
          font: '500 30px Helvetica',// 15pt monospace
          scale: 0.5,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,//FILL,
          // fillColor: Cesium.Color.WHITE,
          pixelOffset: new Cesium.Cartesian2(-8, -35),   //偏移量
          showBackground: true,
          backgroundColor: new Cesium.Color(0.5, 0.6, 1, 1.0),
          outlineColor:Cesium.Color.RED,
          outlineWidth:50.0,
        },
        // billboard: { //图标
        //     image: './imgs/black.png',
        //     width: 50,
        //     height: 50
        // },
      });
      // 视角定位
      viewer.flyTo(monitorEntity, {
          duration: 2,
          offset: {
              heading: Cesium.Math.toRadians(0.0),
              pitch: Cesium.Math.toRadians(-30),
              range: 720
          }
      });
      //点击广告牌改变文本和图标
      var handlerVideo = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handlerVideo.setInputAction(function (click) {
        var pick = viewer.scene.pick(click.position);
        if (pick && pick.id._name == "video") {
          //  monitorEntity._billboard._image._value = './imgs/blue.png';
           monitorEntity._label._text._value = "label";
        } else {
            return;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    }
    // test2();

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
