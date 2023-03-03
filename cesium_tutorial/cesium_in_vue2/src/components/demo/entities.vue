<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
// import "./css/main.css";

export default {
name: 'CesiumViewer',
data() {
  return {
    viewer:null,
  }
},
mounted(){
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo';

  // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
  // const viewer = new Cesium.Viewer('cesiumContainer', {
  //   terrainProvider: Cesium.createWorldTerrain()
  // });
  let viewer = new Cesium.Viewer("cesiumContainer", {
      shouldAnimate: true, //有动画
      // animation: false, //动画控制不显示
      timeline: false, //时间线不显示
      // fullscreenButton: false, //全屏按钮不显示
      infoBox: false,
      // selectionIndicator: true,
      contextOptions: {
          requestWebgl2: true,
      },
  });
  this.viewer = viewer;

  var scene = viewer.scene;

  this.billboardAsGif();

},
methods: {
  translatePointAlongAxis(pos,distances={x:0,y:500,z:0}) {
      //平移：
      const frompoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(pos); // Matrix4
      // const local_translation = new Cesium.Cartesian3(310, -140, 10); // 向模型中心为原点，正北为y，正东为x，地心朝上为z分别平移 310、-140、10米
      const local_translation = new Cesium.Cartesian3(distances.x, distances.y, distances.z);
      const result = Cesium.Matrix4.multiplyByPoint(frompoint_to_world_matrix, local_translation, new Cesium.Cartesian3(0,0,0)); // 转换矩阵左乘局部平移向量，结果存储在 result 中，结果是世界坐标下的平移终点向量
      const targetpoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(result);

      const world_translation = new Cesium.Cartesian3(
          targetpoint_to_world_matrix[12] - frompoint_to_world_matrix[12],
          targetpoint_to_world_matrix[13] - frompoint_to_world_matrix[13],
          targetpoint_to_world_matrix[14] - frompoint_to_world_matrix[14],
      ); // 向量相减，得到世界坐标下的平移向量

      let transitionMatrix = Cesium.Matrix4.fromTranslation(world_translation); // 构造平移矩阵并赋值

      // 最终的矩阵
      let target_pos = Cesium.Matrix4.multiplyByPoint( transitionMatrix, pos, new Cesium.Cartesian3())

      return target_pos;
  },

  billboardAsGif() {
    const viewer = this.viewer;

    let property, entity, lastTime;
    const addEntity = (point) => {
        property = new Cesium.SampledPositionProperty();
        const start = Cesium.JulianDate.now();
        // console.log("point", point);
        // console.log("typeof point.x", typeof point.x);
        // console.log("typeof point.y", typeof point.y);
        const position = Cesium.Cartesian3.fromDegrees(
            point.x,
            point.y,
            0
        );
        // console.log("position", position);
        property.addSample(start, position);
        lastTime = start;

        const id = "router-fly-line";
        const entityOption = {
            // id,
            name: Symbol(id),
            position: property, //position,//
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            billboard: {
                image: "https://st-gdx.dancf.com/gaodingx/0/uxms/design/20201124-112715-54af.gif",
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            },
            orientation: new Cesium.VelocityOrientationProperty(
                property
            ),
        };

        // const entityOption = {
        //     // id,
        //     name: Symbol(id),
        //     position: property,//position,//
        //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        //     billboard: {
        //         image: "https://st-gdx.dancf.com/gaodingx/0/uxms/design/20201124-112715-54af.gif",
        //         verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        //     },
        //     orientation: new Cesium.VelocityOrientationProperty(property),
        // };

        entity = viewer.entities.add(entityOption);

        // const start = Cesium.JulianDate.now();
        viewer.trackedEntity = entity;
        viewer.clock.startTime = start.clone();
        viewer.clock.currentTime = start.clone();
        viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
        viewer.clock.shouldAnimate = false;
    };

    const getPosition = (time, point) => {
        if (viewer.clock.shouldAnimate === false) {
            viewer.clock.shouldAnimate = true;
        }
        const position = Cesium.Cartesian3.fromDegrees(
            point.x,
            point.y,
            0
        );
        const nextTime = Cesium.JulianDate.addSeconds(
            lastTime,
            time,
            new Cesium.JulianDate()
        );
        property.addSample(nextTime, position);
        lastTime = nextTime;
    };
    let x = 103,
        y = 36,
        time = 3; //秒
    // setInterval(() => {
    //     if (!property) {
    addEntity({ x, y });
    let x_ = x + 0.0001;
    let y_ = y + 0.0001;
    // console.log("x_", x_);
    addEntity({ x: x_, y: y_ });
    addEntity({ x: x_ + 0.0001, y: y_ + 0.0001 });
    //     } else {
    //         // x += 0.0003 * Math.random();
    //         // y += 0.0001;
    //         // const point = { x, y };
    //         // getPosition(time, point);
    //     }
    // }, time * 1000);
  },

  // for test
  addPolyline_test(position,color=Cesium.Color.YELLOW) {
      this.viewer.entities.add({
          polyline: {
              positions: position,//Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]),
              width: 5,
              material: color,
              // clampToGround: true,
          },
      });
  }
},
}
</script>

// <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div#cesiumContainer {
  height: 100vh;
  width: 100vw;
}
</style>
