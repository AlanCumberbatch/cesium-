<template>

  <div>
    <div id="toolTip"></div>
    <div :class="change?'btn':'change'" @click="signPlace()">
            {{change?"测距":"测面积"}}
        </div>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script>
import Utils from '../utils/Utils'
import FZLabelCollection from '../utils/FZLabelCollection'
import ForTest from '../utils/ForTest.js'
import cesiumMeasure from '../utils/cesium_measure.js'

export default {
  name: "cesium",
  data() {
    return {
      viewer:null,
      forTest: null,
      measure: null,
      change: true,
    }
  },
  created() {
  },
  mounted() {

    this.initCesium();

    this.forTest = new ForTest(this.viewer);

    // 关于 自定义Label
    // this.customLabel();

    // 关于 投影距离--- start
    // this.projectionDistance();

    //
    // var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // this.measureAreaSpace(this.viewer);
  },
  methods: {
    initCesium() {
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo';

      // this.viewer = new Cesium.Viewer('cesiumContainer', {
      //   infoBox: false,
      // });

      this.viewer = new Cesium.Viewer('cesiumContainer', {
        animation: false, //是否显示动画控件
        shouldAnimate: true,
        homeButton: false, //是否显示Home按钮
        fullscreenButton: true, //是否显示全屏按钮
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        requestRenderMode: false, //启用请求渲染模式
        scene3DOnly: false, //每个几何实例将只能以3D渲染以节省GPU内存
        sceneMode: 3, //初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
        selectionIndicator: false,
        skyAtmosphere: false,
        infoBox: false
      });

      // this.measure = new Utils.cesiumMeasure(Cesium);
      // this.viewer._cesiumWidget._creditContainer.style.display = "none";
      this.measure = new Cesium.Measure(this.viewer);

      this.mapFlyTo(this.viewer);

    },

    mapFlyTo(viewer) {
      viewer.camera.flyTo({
        destination: new Cesium.Cartesian3.fromDegrees(132.02294829, 53.323929, 180000),
        duration: 3
      })
    },
    signPlace() {

        if (this.change) {
            this.change = false;
            this.measure.drawLineMeasureGraphics({// 尝试优化一下 label 的显示位置，现在的位置有点儿别扭的感觉
                clampToGround: true,
                callback: function(){console.log('121212121',arguments)},// 此时可以获取 arguments。 此函数在 测量结束的时候调用。
                // callback: () => {console.log('121212121',arguments)},// 此时获取不到 arguments
            });
        } else {
            this.change = true;
            this.measure.drawAreaMeasureGraphics({
                clampToGround: true,
                callback: (e) => {}
            });
        }
    },


    // 关于 自定义Label
    customLabel() {
      let LabelCollection = new FZLabelCollection(viewer);

      /*
       * @descripion:
       * @param {Viewer} viewer
       * @param {Cartesian2} position
       * @param {String} title
       * @param {String} id
       * @return {*}
      */
      let label3 = LabelCollection.add({
        position:[-82.97763582628434, 33.53847169305344],//此时传入的是经纬度
        height:10,
        title:'CL标签3333',
        id:'210201025'
      })
      let label2 = LabelCollection.add({
        position:[-90.58591112799144, 45.63020180810127],//此时传入的是经纬度
        height:10,
        title:'CL标签222',
        id:'210201025'
      })
      let label = LabelCollection.add({
        position:[-87.31236609679046, 41.527695809917674 ],//此时传入的是经纬度
        height:10,
        title:'CL标签',
        id:'210201025'
      })
      console.log('%c [ LabelCollection ]-72', 'font-size:13px; background:pink; color:#bf2c9f;', LabelCollection)

      /*  */
      let forTest = new ForTest(viewer)

      // label.setColor();
      let that_ = this;
      var handlerVideo = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      // 关于 label 的单击和双击事件，如果是通过Cesium的单击/双击，会存在双击的时候，单击的事件也会执行的问题，不过目前看问题不大，因为C端单击涉及到的状态更改不与双击冲突。
      // 左键 单击
      handlerVideo.setInputAction(function (click) {
        // console.log('x', click.position.x,'y', click.position.x);//此时的position 就是 Canvas 二维坐标系里的坐标， x(横-- 右+)，y(竖着--下+)

        // find intersection of ray through a pixel and the globe
        var ray = viewer.camera.getPickRay(click.position);//windowCoordinates
        var intersection = viewer.scene.globe.pick(ray, viewer.scene);// 地表的 position
        console.log('%c [ intersection ]-53', 'font-size:13px; background:pink; color:#bf2c9f;', intersection)
        // forTest.createPoint(intersection)

        // 获取 当前 click 被选中的 label
        let selectedLabel = LabelCollection.getSelected(click.position)
        if (selectedLabel) { selectedLabel.click(); }

      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 左键 双击
      handlerVideo.setInputAction(function (click) {
        // console.log('x', click.position.x,'y', click.position.x);//此时的position 就是 Canvas 二维坐标系里的坐标， x(横-- 右+)，y(竖着--下+)

        // find intersection of ray through a pixel and the globe
        var ray = viewer.camera.getPickRay(click.position);//windowCoordinates
        var intersection = viewer.scene.globe.pick(ray, viewer.scene);// 地表的 position
        console.log('%c [ intersection ]-53', 'font-size:13px; background:pink; color:#bf2c9f;', intersection)
        // forTest.createPoint(intersection)

        let selectedLabel = LabelCollection.getSelected(click.position)
        selectedLabel ? selectedLabel.dblClick() : window.throw('没有label 被选中');

      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      // 关于 label 的拖拽
      /*
        拖拽的过程：
          按下鼠标左键， -- LEFT_DOWN
          移动鼠标 -- MOUSE_MOVE
          然后松开鼠标左键 -- LEFT_UP

        发现问题：
          在 LEFT_DOWN 事件中，鼠标移动时 球体也会跟着一动，所以，不能共用这个监听事件。

          scene.canvas 的监听事件吧还是
      */
      let canvas = viewer.scene.canvas;
      console.log('%c [ canvas ]-139', 'font-size:13px; background:pink; color:#bf2c9f;', canvas)
      /*
        onmousedown: null
        onmouseenter: null
        onmouseleave: null
        onmousemove: null
        onmouseout: null
        onmouseover: null
        onmouseup: null
        onmousewheel: null
      */
      let selectedLabel = null;
      let startPos = null;
      let endPos = null;
      // canvas.onmousedown = function (e) {
      //   console.log('x', e.x, 'y', e.y);
      // }
      canvas.addEventListener("mousedown", function (e) {
        console.log('mousedown---x', e.x, 'y', e.y);
      },false);
      canvas.addEventListener("click", function (e) {
        console.log('click---x', e.x, 'y', e.y);
        // startPos = new Cesium.Cartesian2(e.x, e.y);
        // selectedLabel = LabelCollection.getSelected(startPos);
      },false);

      // canvas.addEventListener('mousemove', doMouseMove,false);
      // canvas.addEventListener('mouseup', doMouseUp, false);
      // canvas.addEventListener('onblur', doMouseUp, false);

      if (0) { // cesium的鼠标监听事件
        handlerVideo.setInputAction(function (movement) {
          console.log('%c [ LEFT_DOWN - movement ]-137', 'font-size:13px; background:pink; color:#bf2c9f;', movement)
          // movement:  { position: vt {x: 366.46484375, y: 292.515625} }
          // label.destroy()

          selectedLabel = LabelCollection.getSelected(movement.position);
          startPos = Cesium.Cartesian2.clone(movement.position, new Cesium.Cartesian2());

        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        handlerVideo.setInputAction(function (movement) {
          /*
            movement:
              endPosition: vt {x: 730.07421875, y: 264.21875}
              startPosition: vt {x: 719.2578125, y: 260.83984375}
          */

          // 在这里面获取获取鼠标的偏移量
          endPos = movement.endPosition;

          // 同时 更新 label 的 position
          // 把 屏幕坐标Cartesian2 转换成 Cartesian3
          var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(endPos), viewer.scene);
          // console.log('%c [ cartesian ]-159', 'font-size:13px; background:pink; color:#bf2c9f;', cartesian)
          // 在 Cartesian3 中 更新 Label 的 position
          if (selectedLabel) { selectedLabel.position = cartesian; }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handlerVideo.setInputAction(function (movement) {
          // label.display();
          // movement:  position: vt {x: 366.46484375, y: 292.515625}
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
      }


      // // Output the window position of longitude/latitude (0, 0) every time the mouse moves.
      // var scene = viewer.scene;
      // var ellipsoid = scene.globe.ellipsoid;
      // var position = Cesium.Cartesian3.fromDegrees(0.0, 0.0);
      // console.log('%c [ position ]-69', 'font-size:13px; background:pink; color:#bf2c9f;', position)
      // var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      // handler.setInputAction(function(movement) {
      //   // console.log('%c [ movement ]-71', 'font-size:13px; background:pink; color:#bf2c9f;', movement)
      //   // console.log('%c [ movement ]-71', 'font-size:13px; background:pink; color:#bf2c9f;', movement.endPosition)
      //   // console.log(Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, movement.endPosition));
      //   // console.log(Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, movement.endPosition));
      // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // 想要实现： 选中，然后拖拽；双击，关于PopUP之后再说
      // 先尝试实现 双击：



      // 用Cesium内置的方法实现 label
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
    },
  },
}
</script>

<style scoped>
#cesiumContainer{
  /* width: 100%;
  height: 100%; */
  width: 100vw;
  height: 100vh;
}

.btn {
    z-index: 999;
    width: 100px;
    height: 30px;
    background-color: #fff;
    position: absolute;
    top: 30px;
    right: 40px;
    line-height: 30px;
    text-align: center;
    user-select: none;
}

.change {
    z-index: 999;
    width: 100px;
    height: 30px;
    position: absolute;
    top: 30px;
    right: 40px;
    line-height: 30px;
    text-align: center;
    color: #fff;
    background-color: #007acc;
    user-select: none;
}
</style>
