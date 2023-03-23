<template>

  <div>
    <div id="toolTip"></div>
    <div :class="change?'btn':'change'" @click="signPlace()" v-if="testMeasure">
      {{change?"测距":"测面积"}}
    </div>

    <div id="cesiumContainer"></div>
  </div>
</template>

<script>
import Utils from '../utils/Utils'
import FZLabelCollection from '../utils/FZLabelCollection'
import ForTest from '../utils/ForTest.js'
import cesiumMeasure from '../utils/cesium_measure.js'//引入时便执行了，Cesium.Measure 使用，是一个 构造函数

export default {
  name: "cesium",
  data() {
    return {
      viewer:null,
      forTest: null,
      measure: null,
      change: true,
      testMeasure:false,
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

    // 方位角： 地平经度(Azimuth angle，缩写为Az)
    // this.courseAngle();
    // this.testArc();
    // this.testArc2();
    // this.testArc3();
    this.testArc4();// OK

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
        homeButton: true, //是否显示Home按钮
        fullscreenButton: true, //是否显示全屏按钮
        baseLayerPicker: true, //是否显示图层选择控件
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

      // this.testMeasure = true;
      // this.measure = new Cesium.Measure(this.viewer);
      // this.mapFlyTo(this.viewer);

    },

    // for measure --- start
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
    // for measure --- end


    // 关于 自定义Label
    customLabel() {
      const viewer = this.viewer;
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

      if (0) {// 关于鼠标 单击，双击 方法组织方式 1
        // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        // 关于 label 的单击和双击事件，如果是通过Cesium的单击/双击，会存在双击的时候，单击的事件也会执行的问题，不过目前看问题不大，因为C端单击涉及到的状态更改不与双击冲突。
        // 左键 单击
        let clickLabel = function () {
          if (!handler) {
            handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          }
          handler.setInputAction(function (click) {
            // console.log('x', click.position.x,'y', click.position.x);//此时的position 就是 Canvas 二维坐标系里的坐标， x(横-- 右+)，y(竖着--下+)

            // find intersection of ray through a pixel and the globe
            var ray = viewer.camera.getPickRay(click.position);//windowCoordinates
            var intersection = viewer.scene.globe.pick(ray, viewer.scene);// 地表的 position
            console.log('%c [ intersection ]-53', 'font-size:13px; background:pink; color:#bf2c9f;', intersection)
            // forTest.createPoint(intersection)

            // 获取 当前 click 被选中的 label
            let selectedLabel = LabelCollection.getSelected(click.position)
            if (selectedLabel) { selectedLabel.click(); }

            handler.destroy();
            handler = null;

          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
        // 左键 双击
        let dblClickLabel = function () {
          if (!handler) {
            handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          }
          handler.setInputAction(function (click) {
            // console.log('x', click.position.x,'y', click.position.x);//此时的position 就是 Canvas 二维坐标系里的坐标， x(横-- 右+)，y(竖着--下+)

            // find intersection of ray through a pixel and the globe
            var ray = viewer.camera.getPickRay(click.position);//windowCoordinates
            var intersection = viewer.scene.globe.pick(ray, viewer.scene);// 地表的 position
            console.log('%c [ intersection ]-53', 'font-size:13px; background:pink; color:#bf2c9f;', intersection)
            // forTest.createPoint(intersection)

            let selectedLabel = LabelCollection.getSelected(click.position)
            selectedLabel ? selectedLabel.dblClick() : window.throw('没有label 被选中');

            handler.destroy();
            handler = null;

          }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }

        // 关于 label 的拖拽
        /*
          拖拽的过程：
            按下鼠标左键， -- LEFT_DOWN
            移动鼠标 -- MOUSE_MOVE
            然后松开鼠标左键 -- LEFT_UP

          发现问题：
            在 LEFT_DOWN 事件中，鼠标移动时 球体也会跟着一动，所以，不能共用这个监听事件。 ---》 viewer.scene.screenSpaceCameraController.enableRotate = false;
        */
        let dragLabel = function () {
          console.log("11111111111111")
          if (!handler) {
            var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
          }
          let startPos, selectedLabel, endPos;
          // cesium的鼠标监听事件
          handler.setInputAction(function (movement) {
            viewer.scene.screenSpaceCameraController.enableRotate = true;

            // movement:  { position: vt {x: 366.46484375, y: 292.515625} }

            selectedLabel = LabelCollection.getSelected(movement.position);
            startPos = Cesium.Cartesian2.clone(movement.position, new Cesium.Cartesian2());

          }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
          handler.setInputAction(function (movement) {
            viewer.scene.screenSpaceCameraController.enableRotate = false;
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
            // 在 Cartesian3 中 更新 Label 的 position
            if (selectedLabel) { selectedLabel.position = cartesian; }

          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
          handler.setInputAction(function (movement) {

            handler.destroy();
            handler = null;
            viewer.scene.screenSpaceCameraController.enableRotate = true;

            selectedLabel = null;

            // label.display();
            // movement:  position: vt {x: 366.46484375, y: 292.515625}
          }, Cesium.ScreenSpaceEventType.LEFT_UP);
          console.log("22222222222222")
        }
        // dragLabel();
      }
      // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      // 关于 label 的单击和双击事件，如果是通过Cesium的单击/双击，会存在双击的时候，单击的事件也会执行的问题，不过目前看问题不大，因为C端单击涉及到的状态更改不与双击冲突。
      let startPos, selectedLabel, endPos;
      let isClicked = false;
      let isDblClicked = false;
      let isLeftDown = false;
      // 明天：关于如何整理 自定义label的单击/双击/拖拽的事件添加
      // 左键 单击
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (click) {

        isClicked = true;
        if (isDblClicked) { return; }
        // console.log('x', click.position.x,'y', click.position.x);//此时的position 就是 Canvas 二维坐标系里的坐标， x(横-- 右+)，y(竖着--下+)

        // find intersection of ray through a pixel and the globe
        var ray = viewer.camera.getPickRay(click.position);//windowCoordinates
        var intersection = viewer.scene.globe.pick(ray, viewer.scene);// 地表的 position
        // forTest.createPoint(intersection)

        // 获取 当前 click 被选中的 label
        let selectedLabel = LabelCollection.getSelected(click.position)
        if (selectedLabel) { selectedLabel.click(); }

        console.log('%c [ LEFT_CLICK ]-296', 'font-size:13px; background:pink; color:#bf2c9f;')
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 左键 双击
      handler.setInputAction(function (click) {

        isDblClicked = true;
        // console.log('x', click.position.x,'y', click.position.x);//此时的position 就是 Canvas 二维坐标系里的坐标， x(横-- 右+)，y(竖着--下+)

        // find intersection of ray through a pixel and the globe
        var ray = viewer.camera.getPickRay(click.position);//windowCoordinates
        var intersection = viewer.scene.globe.pick(ray, viewer.scene);// 地表的 position
        // forTest.createPoint(intersection)

        let selectedLabel = LabelCollection.getSelected(click.position)
        selectedLabel ? selectedLabel.dblClick() : window.throw('没有label 被选中');

        console.log('%c [ LEFT_DOUBLE_CLICK ]-296', 'font-size:13px; background:pink; color:#bf2c9f;')
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      // 关于 label 的拖拽
      /*
        拖拽的过程：
          按下鼠标左键， -- LEFT_DOWN
          移动鼠标 -- MOUSE_MOVE
          然后松开鼠标左键 -- LEFT_UP

        发现问题：
          在 LEFT_DOWN 事件中，鼠标移动时 球体也会跟着一动，所以，不能共用这个监听事件。 ---》 viewer.scene.screenSpaceCameraController.enableRotate = false;
      */
        // cesium的鼠标监听事件
      handler.setInputAction(function (movement) {
        // movement:  { position: vt {x: 366.46484375, y: 292.515625} }
        isLeftDown = true;

        selectedLabel = LabelCollection.getSelected(movement.position);
        startPos = Cesium.Cartesian2.clone(movement.position, new Cesium.Cartesian2());

      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

      handler.setInputAction(function (movement) {
        /* movement:{
            endPosition: vt {x: 730.07421875, y: 264.21875}
            startPosition: vt {x: 719.2578125, y: 260.83984375}
        }*/
        if (isClicked) { return; }
        if (isLeftDown && selectedLabel) {
          viewer.scene.screenSpaceCameraController.enableRotate = false;

          // 在这里面获取获取鼠标的偏移量
          endPos = movement.endPosition;

          // 同时 更新 label 的 position
          // 把 屏幕坐标Cartesian2 转换成 Cartesian3
          var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(endPos), viewer.scene);
          // 在 Cartesian3 中 更新 Label 的 position
          if (selectedLabel) { selectedLabel.position = cartesian; }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(function (movement) {
        // movement:  position: vt {x: 366.46484375, y: 292.515625}
        if (isClicked) { return; }
        viewer.scene.screenSpaceCameraController.enableRotate = true;

        selectedLabel = null;
        isLeftDown = false;

      }, Cesium.ScreenSpaceEventType.LEFT_UP);



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

    // 地平经度(Azimuth angle，缩写为Az)
    courseAngle(lng_a, lat_a, lng_b, lat_b) {
      /*
        画
          1. 虚线：直的，半圆
          2. 点
          3. solid line
      */

      const redDottedLine = this.viewer.entities.add({
        name: "Red dashed line",
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            -75,
            38,
            250000,
            -125,
            38,
            250000,
          ]),
          width: 5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.RED,
          }),
        },
      });

      // let radii = 300000.0;
      // const greenCircle = this.viewer.entities.add({
      //   // position: Cesium.Cartesian3.fromDegrees(-111.0, 40.0, 150000.0),
      //   position: Cesium.Cartesian3.fromDegrees(-111.0, 40.0),
      //   name: "Green circle at height with outline",
      //   ellipse: {
      //     semiMinorAxis: radii,
      //     semiMajorAxis: radii,
      //     height: 200000.0,
      //     fill:false,
      //     material: Cesium.Color.GREEN,
      //     outline: true, // height must be set for outline to display
      //     outlineWidth: 20.0,
      //     outlineColor:Cesium.Color.RED,
      //   },
      // });

      // Primitive
      // const ellipse = new Cesium.EllipseOutlineGeometry({
      //   center : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
      //   semiMajorAxis : 500000.0,
      //   semiMinorAxis : 300000.0,
      //   rotation : Cesium.Math.toRadians(60.0)
      // });
      // const geometry = Cesium.EllipseOutlineGeometry.createGeometry(ellipse);

      let center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883,1000.0);
      let radii = 3000000.0;
      let centralAngle = 60;// in degree
      // let positions = [];// <Cartesian3>
      // let indices = [];// <Number>
      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center); // Cesium.Matrix4.IDENTITY;

      let pointsInSectorArc = centralAngle / 5;// 每 5度 找一个点

      let scratchCartesian3 = new Cesium.Cartesian3();

      if (0) {

        positions.push(center)

        const localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        //求世界坐标到局部坐标的变换矩阵
        const worldToLocal_Matrix = Cesium.Matrix4.inverse( localToWorld_Matrix, new Cesium.Matrix4() );

        let curPos = new Cesium.Cartesian3(0, radii, 0);
        console.log('%c [ Utils ]-541', 'font-size:13px; background:pink; color:#bf2c9f;', Utils)
        console.log('%c [ Utils.rotateAroundZAxis ]-540', 'font-size:13px; background:pink; color:#bf2c9f;', Utils.rotateAroundZAxis)


        let scratchCartesian3 = new Cesium.Cartesian3();
        // -----
        //a点在局部坐标的位置，其实就是局部坐标原点
        const curPos_inENU = Cesium.Matrix4.multiplyByPoint( worldToLocal_Matrix, curPos, scratchCartesian3);
        positions.push(curPos_inENU)
        // -----
        for (let i = 1; i < pointsInSectorArc; i++){
          // 这个点要在 球心 所在坐标系计算，然后再放到 center 的ENU中。
          // 旋转时绕Z轴旋转
          // curPos
          const localPosition_A = Cesium.Matrix4.multiplyByPoint(rotateM, curPos, scratchCartesian3);
          const targetPos = Cesium.Matrix4.multiplyByPoint( worldToLocal_Matrix, localPosition_A, scratchCartesian3);

          positions.push(targetPos);
        }
        console.log('%c [ positions ]-559', 'font-size:13px; background:pink; color:#bf2c9f;', positions)
      }

      // 1 定义位置数组
      var v0 = [0.0, 0.5, 0.0];
      var rawVertex = [];

      var v0Carestian3 = new Cesium.Cartesian3(v0[0], v0[1], v0[2]);//  {x: 0, y: 0.5, z: 0}

      for (let i = 0; i < pointsInSectorArc; i++){
        // 此时只是在 clip space中进行计算
        // 旋转时绕Z轴旋转
        const M = Utils.rotateAroundZAxis((i * 5) * Math.PI / 180);
        Cesium.Matrix4.multiplyByPoint(M, v0Carestian3, scratchCartesian3);

        rawVertex.push(...[scratchCartesian3.x, scratchCartesian3.y, scratchCartesian3.z]);
      }
      console.log('%c [ rawVertex ]-581', 'font-size:13px; background:pink; color:#bf2c9f;', rawVertex, rawVertex.length/3)//12

      // 乘上box的长度
      var boxVertex = rawVertex.map(function(v) {
       return v * radii;
      });
      var positions = new Float64Array(boxVertex);


      // 2 定义法向数组
      var npx = [1, 0, 0];
      var nnx = [-1, 0, 0];
      var npy = [0, 1, 0];
      var nny = [0, -1, 0];
      var npz = [0, 0, 1];
      var nnz = [0, 0, -1];
      // var normals = new Float32Array([
      // // 下 -z
      // ...nnz, ...nnz, ...nnz, ...nnz,
      // // 前 -y
      // ...nny, ...nny, ...nny, ...nny,
      // // 后 +y
      // ...npy, ...npy, ...npy, ...npy,
      // // 左 -x
      // ...nnx, ...nnx, ...nnx, ...nnx,
      // // 右 +x
      // ...npx, ...npx, ...npx, ...npx,
      // // 上 +z
      // ...npz, ...npz, ...npz, ...npz,
      // ]);
      var normalArr = [];
      for (let j = 1; j < pointsInSectorArc-2; j++){
        normalArr.push(...npz);
        normalArr.push(...npz);
        normalArr.push(...npz);
      }
      console.log('%c [ normalArr ]-621', 'font-size:13px; background:pink; color:#bf2c9f;', normalArr, normalArr.length/3)//
      var normals = new Float32Array(normalArr);


      // 3 定义纹理数组
      var stArr = [0, 0, 1, 0, 1, 1, 0, 1];//[];
      // for (let j = 1; j <= pointsInSectorArc-2; j++){
      //   stArr.push(0)
      //   stArr.push(j)
      //   stArr.push(j+1)
      //   // [0, 0, 1, 0, 1, 1, 0, 1]
      // }
      var sts = new Float32Array(stArr);

      // 4 定义索引
      var indexArr = [];
      for (let j = 1; j < pointsInSectorArc-2; j++){
        indexArr.push(0)
        indexArr.push(j)
        indexArr.push(j+1)
      }
      console.log('%c [ indexArr ]-634', 'font-size:13px; background:pink; color:#bf2c9f;', indexArr, indexArr.length/3)
      var indices = new Uint16Array(indexArr);

      var mySector = this.viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    // normal: new Cesium.GeometryAttribute({
                    //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    //     componentsPerAttribute: 3,
                    //     values: normals
                    // }),
                    // st: new Cesium.GeometryAttribute({
                    //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    //     componentsPerAttribute: 2,
                    //     values: sts
                    // }),
                },
                indices: indices,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            }),
            attributes : {
                color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1.0))
            }
        }),
        appearance: new Cesium.PerInstanceColorAppearance({
            flat : true,
            translucent : false
        }),
        // appearance: new Cesium.MaterialAppearance({
        //     material: Cesium.Material.fromType('Image', {
        //         image: './imgs/blue.png'
        //     }),
        //     //faceForward : true // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
        //     closed: true // 是否为封闭体，实际上执行的是是否进行背面裁剪
        // }),
        modelMatrix: modelMatrix,
        asynchronous: false
      }));
      this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(center, 10000));


      if (0) {
        //以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
        const localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            new Cesium.Cartesian3.fromDegrees(lng_a, lat_a)
        );
        //求世界坐标到局部坐标的变换矩阵
        const worldToLocal_Matrix = Cesium.Matrix4.inverse( localToWorld_Matrix, new Cesium.Matrix4() );
        //a点在局部坐标的位置，其实就是局部坐标原点
        const localPosition_A = Cesium.Matrix4.multiplyByPoint(
            worldToLocal_Matrix,
            new Cesium.Cartesian3.fromDegrees(lng_a, lat_a),
            new Cesium.Cartesian3()
        );
        //B点在以A点为原点的局部的坐标位置
        const localPosition_B = Cesium.Matrix4.multiplyByPoint(
            worldToLocal_Matrix,
            new Cesium.Cartesian3.fromDegrees(lng_b, lat_b),
            new Cesium.Cartesian3()
        );

        //弧度
        // const angle = Math.atan2(
        //     localPosition_B.y - localPosition_A.y,
        //     localPosition_B.x - localPosition_A.x
        // );
        //弧度
        const angle = Math.atan2(
            localPosition_B.x - localPosition_A.x,
            localPosition_B.y - localPosition_A.y
        );
        //角度
        let theta = angle * (180 / Math.PI);
        if (theta < 0) {
            theta = theta + 360;
        }
        return theta;
      }
    },
    /**
     * @description 画扇形
     * @param {int} lon 中心点经度
     * @param {*} lat 中心点纬度
     * @param {*} height 中心点高度
     * @param {*} direction 方向
     * @param {*} radius 半径
    */
    calculatingTargetPoints(lon, lat, height, direction, radius) {
        //根据 位置，方位，距离 求经纬度
        var viewPoint = Cesium.Cartesian3.fromDegrees(lon, lat, height);
        var webMercatorProjection = new Cesium.WebMercatorProjection(
            this.viewer.scene.globe.ellipsoid
        );
        var viewPointWebMercator = webMercatorProjection.project(
            Cesium.Cartographic.fromCartesian(viewPoint)
        );
        var toPoint = new Cesium.Cartesian3(
            viewPointWebMercator.x + radius * Math.cos(direction),
            viewPointWebMercator.y + radius * Math.sin(direction),
            0
        );
        toPoint = webMercatorProjection.unproject(toPoint);
        toPoint = Cesium.Cartographic.toCartesian(toPoint.clone());
        var cartographic = Cesium.Cartographic.fromCartesian(toPoint);
        var point = [
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
        ];
        return point;
    },
    drawSector(params) {
      var d1 = params.d1;
      var d2 = params.d2;
      var list = [Number(params.lng), Number(params.lat)];
      for (let i = d1; i < d2; i += 1) {
          var point = this.calculatingTargetPoints(
              params.lng,
              params.lat,
              0,
              (90 - i) * (Math.PI / 180),
              params.zcjl
          );
          list.push(point[0]);
          list.push(point[1]);
      }
      list.push(Number(params.lng));
      list.push(Number(params.lat));

      // console.log("list", list);
      if (!this.sectorEntity[params.id]) {
          this.viewer.entities.remove(this.sectorEntity[params.id]);
      }
      var box = this.viewer.entities.add({
          polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(list), //fromDegreesArrayHeights
              material: Cesium.Color.RED.withAlpha(0.4),
              // perPositionHeight: true,
          },
      });
      // sectorEntity[params.id] = box;
      // this.sectorEntity[params.id] = box;

      // this.viewer.camera.flyTo({
      //     destination: new Cesium.Cartesian3.fromDegrees(
      //         Number(params.lng),
      //         Number(params.lat),
      //         10000
      //     ),
      // });
    },

    testArc() {
      // 创建一个GeometryInstance来定义圆弧：
      var center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
      var startAngle = Cesium.Math.toRadians(0);
      var endAngle = Cesium.Math.toRadians(90);
      var radius = 100000.0;
      var arc = new Cesium.ArcGeometry({
        center : center,
        radius : radius,
        startAngle : startAngle,
        endAngle : endAngle
      });
      var geometry = Cesium.GeometryPipeline.generateArc(arc);
      var instance = new Cesium.GeometryInstance({
        geometry : geometry,
        attributes : {
          color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
        }
      });
      // 创建一个Primitive来渲染GeometryInstance：
      var primitive = new Cesium.Primitive({
        geometryInstances : instance,
        appearance : new Cesium.PerInstanceColorAppearance({
          flat : true,
          renderState : {
            depthTest : {
              enabled : true
            },
            depthMask : true
          }
        })
      });

      this.viewer.scene.primitives.add(primitive);

    },
    testArc2() {
      // 创建圆弧的位置
      var center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
      var radii = 5000.0;
      var startAngle = Cesium.Math.toRadians(45.0);
      var endAngle = Cesium.Math.toRadians(135.0);


      this.viewer.camera.flyTo({
          destination: new Cesium.Cartesian3.fromDegrees(
            -75.59777,
            40.03883,
              10000
          ),
      });

      // 创建圆弧primitive
      var primitive = new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
              geometry: new Cesium.EllipseGeometry({
                  center: center,
                  semiMajorAxis: radii,
                  semiMinorAxis: radii,
                // rotation: 0,
                rotation : Cesium.Math.toRadians(60.0),
                  startAngle: startAngle,
                  endAngle: endAngle,
                  vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
              }),
              attributes : {
                color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1.0))
              }
          }),
          appearance: new Cesium.PerInstanceColorAppearance({
              // flat : true,
            translucent: false,
            closed: true
          }),
          show: true,
          releaseGeometryInstances: false,
          // asynchronous: false,
      });

      // 将primitive设置为贴地
      // primitive.asynchronous = false;// 不可以通过这种方式更改
      // primitive.appearance.closed = true;// 不可以通过这种方式更改
      // primitive.appearance.faceForward = true;
      primitive.appearance.translucent = false;
      primitive.appearance.material = new Cesium.Material({
          fabric: {
              type: 'Color',
              uniforms: {
                  color: new Cesium.Color(1.0, 1.0, 0.0, 0.5)
              }
          }
      });
      // primitive.appearance.material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
      // primitive.appearance.material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);
      primitive.appearance.material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.5);

      this.viewer.scene.primitives.add(primitive);


    },
    testArc3() {
      var entities = this.viewer.entities;

      var stripeMaterial = new Cesium.StripeMaterialProperty({
        evenColor: Cesium.Color.WHITE.withAlpha(0),
        oddColor: Cesium.Color.BLUE.withAlpha(1),
        repeat: 30.0,
      });

      entities.add({
        position: Cesium.Cartesian3.fromDegrees(-72.0, 25.0),
        ellipse: {
          semiMinorAxis: 250000.0,
          semiMajorAxis: 250000.0,
          outline: true,
          outlineColor: Cesium.Color.RED,
          height: 1000,
          stRotation: Cesium.Math.toRadians(50.0),
          material: stripeMaterial,
        },
      });
    },
    testArc4() {

      var redLine = this.viewer.entities.add({
        name: "Red dashed line",
        polyline: {
          positions: computeCircle(1000000),
          width: 5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.RED,
          }),
          clampToGround:true,
        },
      });

      function computeCircle(radius) {

        let curPos = Cesium.Cartesian3.fromDegrees(-72.0, 25.0);
        let curMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(curPos);

        // var radius = 1.0;// 半径？ 直径？
        var positions = [];
        for (var i = 0; i < 360; i++) {
          var radians = Cesium.Math.toRadians(i);
          let point =  new Cesium.Cartesian3(
              radius * Math.cos(radians),
              radius * Math.sin(radians),
              0.0
          );
          Cesium.Matrix4.multiplyByPoint(curMatrix, point, point);
          positions.push(point);
        }
        return positions;
      }
      function computeCircle_Ori(radius) {
        var positions = [];
        for (var i = 0; i < 360; i++) {
          var radians = Cesium.Math.toRadians(i);
          let point =  new Cesium.Cartesian3(
              radius * Math.cos(radians),
              radius * Math.sin(radians),
              6371000
          );
          positions.push(point);
        }
        return positions;
      }

      this.viewer.zoomTo(viewer.entities);
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
