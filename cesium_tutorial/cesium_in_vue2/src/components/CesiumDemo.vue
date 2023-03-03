<template>
    <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
// import { Script } from 'vm';
import twoPointsLengthInMeters from "../utils/twoPointsLengthInMeters";
import BezierBy4Point from "../utils/BezierBy4Point.js";
import customGeometry from "../utils/primitive/customGeometry.js";
// import "./css/main.css";

export default {
  name: 'CesiumViewer',
  data() {
    return {
      viewer:null,
      scene:null,
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
    this.scene = viewer.scene;

    var position = Cesium.Cartesian3.fromDegrees(
          -123.0744619,
          44.0503706,
          50
        );

    // These noise parameters are set to default, but can be changed
    // to produce different cloud results. However, the noise is precomputed,
    // so this cannot be changed dynamically.
    var clouds = viewer.scene.primitives.add(
      new Cesium.CloudCollection({
        noiseDetail: 16.0,
        noiseOffset: Cesium.Cartesian3.ZERO,
      })
    );







    // Add Cesium OSM Buildings, a global 3D buildings layer. --- 为建筑添加虚拟模型，OSM Buildings 有官网
    // const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

    //* Primitive
    // this.rotatePrimitiveAirplane();
    // this.Cartesian3Lerp();//确定插值之后得到的点是否包括原来的点: //* 结论： 包括开始点，不包括结束点
    let realPos = [];
    let p0 = new Cesium.Cartesian3.fromDegrees(120.0, 22.0,100000);
    let p1 = new Cesium.Cartesian3.fromDegrees(120.0, 18.0,100000);
    let p2 = new Cesium.Cartesian3.fromDegrees(124.0, 18.0,100000);
    let p3 = new Cesium.Cartesian3.fromDegrees(124.0, 22.0,100000);
    let p4 = new Cesium.Cartesian3.fromDegrees(122.0, 20.0,1000);
    realPos.push(p0.x)
    realPos.push(p0.y)
    realPos.push(p0.z)

    realPos.push(p1.x)
    realPos.push(p1.y)
    realPos.push(p1.z)

    realPos.push(p3.x)
    realPos.push(p3.y)
    realPos.push(p3.z)


    realPos.push(p1.x)
    realPos.push(p1.y)
    realPos.push(p1.z)

    realPos.push(p3.x)
    realPos.push(p3.y)
    realPos.push(p3.z)

    realPos.push(p2.x)
    realPos.push(p2.y)
    realPos.push(p2.z)


    realPos.push(p0.x)
    realPos.push(p0.y)
    realPos.push(p0.z)

    realPos.push(p4.x)
    realPos.push(p4.y)
    realPos.push(p4.z)

    realPos.push(p3.x)
    realPos.push(p3.y)
    realPos.push(p3.z)


    realPos.push(p3.x)
    realPos.push(p3.y)
    realPos.push(p3.z)

    realPos.push(p4.x)
    realPos.push(p4.y)
    realPos.push(p4.z)

    realPos.push(p2.x)
    realPos.push(p2.y)
    realPos.push(p2.z)


    realPos.push(p2.x)
    realPos.push(p2.y)
    realPos.push(p2.z)

    realPos.push(p4.x)
    realPos.push(p4.y)
    realPos.push(p4.z)

    realPos.push(p1.x)
    realPos.push(p1.y)
    realPos.push(p1.z)


    realPos.push(p1.x)
    realPos.push(p1.y)
    realPos.push(p1.z)

    realPos.push(p4.x)
    realPos.push(p4.y)
    realPos.push(p4.z)

    realPos.push(p0.x)
    realPos.push(p0.y)
    realPos.push(p0.z)



    let indices = [
      0, 1, 3,
      1, 3, 2,
      0, 4, 3,
      3, 4, 2,
      2, 4, 1,
      1, 4, 0,
    ];

    customGeometry(viewer, realPos, [1.0, 0.0, 0.0, 0.6], indices, true);//function addPrimitive(viewer, realPos, __colors, __indices, wire) {
    this.viewer.camera.flyTo({
      destination:p4,
    })

    // Label
    // this.addPrimitiveLabel();
    // this.inReferenceFrameLabels();
    // this.offsetByDistanceLabels();
    // this.fadeByDistance_Labels();

    // Polyline
    // this.addPrimitivePolyline();

    // a Label with a Polyline --- start
    // this.addLabelWithPolyline();


    //* Entity
    // this.addRadarReconnaossance();

    // Material/Shader
    // this.shaderIntro();
    // this.shaderIntro2Dynamic();


    //* from cesium.sandcastle.com
    // this.globalMaterial();

    // just for test
    // this.bezier4PointTest()
  },
  methods: {
    // Polyline --- start
    addPrimitivePolyline() {
      // Example 1: Draw a red polyline on the globe surface
      this.scene.primitives.add(
          new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
              geometry: new Cesium.PolylineGeometry({
                positions: Cesium.Cartesian3.fromDegreesArray([ -124.0, 40.0, -80.0, 40.0, ]),
                width: 5.0,
                vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
              }),
              attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                  new Cesium.Color(1.0, 0.0, 0.0, 0.8)
                ),
              },
            }),
            appearance: new Cesium.PolylineColorAppearance(),
            // appearance: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
            // appearance: new Cesium.PolylineArrowMaterialProperty(),//isTranslucent
          })
      );

      // Example 2: Draw a straight blue polyline
      this.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: Cesium.Cartesian3.fromDegreesArrayHeights([ -84.0, 50.0, 0.0, -100.0, 30.0, 1000000.0, ]),
              width: 5.0,
              vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
              followSurface: false,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.BLUE
              ),
            },
          }),
          appearance: new Cesium.PolylineColorAppearance(),
        })
      );
    },
    // Polyline --- end

    // Label about ----  start
    addPrimitiveLabel() {
      var labels = new Cesium.LabelCollection();
      var l = labels.add({
        position : Cesium.Cartesian3.fromDegrees(-75.10, 39.57,10000),
        text: 'Philadelphia',
        id: 'Philadelphia',
        show:false,

        font      : '24px Helvetica',// CSS font-family
        fillColor : new Cesium.Color(0.6, 0.9, 1.0),// 决定的是 文字的颜色
        outlineColor : Cesium.Color.BLACK,// 决定的是 文字的
        outlineWidth : 2,// 决定的是 文字的
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,

        showBackground:true,
        backgroundColor: Cesium.Color.ORANGE,
        backgroundPadding: new Cesium.Cartesian2(6.0, 6.0),//default: new Cartesian2(7, 5);
        verticalOrigin: Cesium.VerticalOrigin.BASELINE,// by default
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,// by default
        pixelOffset: new Cesium.Cartesian2(0,-10),//Cesium.Cartesian2.ZERO,// by default
        eyeOffset: Cesium.Cartesian3.ZERO,// by default
        scale:1.0,// by default

        // translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0) // fade by Distance --- 源码中对应的计算距离的方法在  vertex shader 里面写的
        // pixelOffsetScaleByDistance: // A label's pixel offset will be scaled when the distance changed
        // scaleByDistance:  // A label's pixel offset will be scaled when the distance changed
        // heightReference: HeightReference.NONE
      });
      this.scene.primitives.add(labels);

      // l.position = Cesium.Cartesian3.fromDegrees(-75.10, 39.57, 300000.0);
      // l.scale = 2.0;
      l.fillColor = Cesium.Color.RED;

    },
    inReferenceFrameLabels() {
      var center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
      let M = Cesium.Transforms.eastNorthUpToFixedFrame(center);
      var labels = new Cesium.LabelCollection(undefined);
      labels.modelMatrix = M;
      labels.add({
          position : new Cesium.Cartesian3(0.0, 0.0, 0.0),
          text     : 'Center'
      });
      labels.add({
          position : new Cesium.Cartesian3(1000000.0, 0.0, 0.0),
          text     : 'East'
      });
      labels.add({
          position : new Cesium.Cartesian3(0.0, 1000000.0, 0.0),
          text     : 'North'
      });
      labels.add({
          position : new Cesium.Cartesian3(0.0, 0.0, 1000000.0),
          text     : 'Up'
      });
      this.scene.primitives.add(labels);

      //  想验证1000000.0 的单位是什么 ---总之不是meter，其他的暂时不知道咋测试
      let p1 = Cesium.Matrix4.multiplyByPoint(M, new Cesium.Cartesian3(0.0, 0.0, 0.0), new Cesium.Cartesian3()); this.addPoint_test(p1);
      let p2 = Cesium.Matrix4.multiplyByPoint(M, new Cesium.Cartesian3(0.0, 0.0, 1000000.0), new Cesium.Cartesian3()); this.addPoint_test(p2,Cesium.Color.GREEN);
      let dis = Cesium.Cartesian3.distance(p1, p2);
      let disInMeters = twoPointsLengthInMeters(p1, p2);
      console.log('%c [ p1 instanceof Cartesian3 ]-132', 'font-size:13px; background:pink; color:#bf2c9f;', p1 instanceof Cesium.Cartesian3)
      console.log("p1",p1, "p2",p2)
      console.log('%c [ dis ]-129', 'font-size:13px; background:pink; color:#bf2c9f;', dis,disInMeters)
    },
    offsetByDistanceLabels() {
      var image = new Image();
      let that_ = this;
      image.onload = function() {
          var billboards = new Cesium.BillboardCollection();
          billboards.add({
              position : Cesium.Cartesian3.fromDegrees(-75.10, 39.57),
              scaleByDistance : new Cesium.NearFarScalar(1.5e2, 5.0, 1.5e7, 0.5),
              image : image
          });

          var labels = new Cesium.LabelCollection();
          labels.add({
              position : Cesium.Cartesian3.fromDegrees(-75.10, 39.57),
              text     : 'Label on top of scaling billboard',
              font : '20px sans-serif',
              horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
              pixelOffset : new Cesium.Cartesian2(0.0, -image.height),
              pixelOffsetScaleByDistance : new Cesium.NearFarScalar(1.5e2, 3.0, 1.5e7, 0.5)
          });

          that_.scene.primitives.add(billboards);
          that_.scene.primitives.add(labels);
      };
      // image.src = './imgs/facility.gif';
      image.src = './imgs/mixColor.png';
    },
    fadeByDistance_Labels() {
      var labels = new Cesium.LabelCollection();
      labels.add({
          position : Cesium.Cartesian3.fromDegrees(-73.94, 40.67),
          text     : 'New York',
          translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0)
      });
      labels.add({
          position : Cesium.Cartesian3.fromDegrees(-84.39, 33.75),
          text     : 'Atlanta',
          translucencyByDistance : new Cesium.NearFarScalar(1.5e5, 1.0, 1.5e7, 0.0)
      });
      this.scene.primitives.add(labels);
    },
    // Label about ----  end


    // a Label with a Polyline --- start
    addLabelWithPolyline() {
      var labels = new Cesium.LabelCollection();
      var l = labels.add({
        position : Cesium.Cartesian3.fromDegrees(-75.10, 39.57,10000),
        text: 'Philadelphia',
        id: 'Philadelphia',
        show:false,

        font      : '24px Helvetica',// CSS font-family
        fillColor : new Cesium.Color(0.6, 0.9, 1.0),// 决定的是 文字的颜色
        outlineColor : Cesium.Color.BLACK,// 决定的是 文字的
        outlineWidth : 2,// 决定的是 文字的
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,

        showBackground:true,
        backgroundColor: Cesium.Color.ORANGE,
        backgroundPadding: new Cesium.Cartesian2(6.0, 6.0),//default: new Cartesian2(7, 5);
        verticalOrigin: Cesium.VerticalOrigin.BASELINE,// by default
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,// by default
        pixelOffset: new Cesium.Cartesian2(0,-10),//Cesium.Cartesian2.ZERO,// by default
        eyeOffset: Cesium.Cartesian3.ZERO,// by default
        scale:1.0,// by default

        // translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0) // fade by Distance --- 源码中对应的计算距离的方法在  vertex shader 里面写的
        // pixelOffsetScaleByDistance: // A label's pixel offset will be scaled when the distance changed
        // scaleByDistance:  // A label's pixel offset will be scaled when the distance changed
        // heightReference: HeightReference.NONE
      });
      this.scene.primitives.add(labels);

      // l.position = Cesium.Cartesian3.fromDegrees(-75.10, 39.57, 300000.0);
      // l.scale = 2.0;
      l.fillColor = Cesium.Color.RED;

      // test
      // this.addPoint_test(Cesium.Cartesian3.fromDegrees(-75.10, 39.57,10000));

      // 让 Label 距离相机到达一定距离的时候才开始显示
      let camera = this.scene.camera;
      this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
        // console.log('labels', labels);
        // 关于 相机当前距离 Label 的距离，如何确定？
        // labels._labels
        // for (let i = 0; i < labels._labels.length; i++){
        // }

        let dis = Cesium.Cartesian3.distance(l.position, camera.position);
        // console.log('%c [ dis ]-154', 'font-size:13px; background:pink; color:#bf2c9f;', dis)
        if (dis < 50000) {
          l.show = true;
        } else {
          l.show = false;
        }


      });

      // 添加一条相关的Polyline
      this.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                -75.10, 39.57, 10000,
                -75.02, 39.507, 10000
              ]),
              width: 2.0,
              vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
              followSurface: false,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.BLACK
              ),
            },
          }),
          appearance: new Cesium.PolylineColorAppearance(),
        })
      );

    },
    // a Label with a Polyline --- end

    // Radar -- start
    addPrimitiveRadarReconnaossance(option) {
      if (!option) {
        option = {
          beamId: "F-16",

          alt: 1,
          lat: 24.427145,
          lon: 120.970459,

          colorRgb: "0,0,255",
          pellucidity: 100,

          scanzonePointType: 1,
          scanzoneType: 2,

          scanzonePitchAngleRange: 120,
          scanzoneAzimuthRange: 120,
          scanzoneDistance: 120000,    //扫描区域作用距离(雷达长度)
          scanzoneAzimuthPointTo: -90,
          scanzonePitchPointTo: 0,

          beamScanType: 2,
          beamAzimuthPointTo: -90,
          beamPitchPointTo: 0,
          beamAngle: 0,
          beamDistance: 120000,

          state: 0,

          intTime: 0,
          id: 6,
        }
      }
      // if (!option.position) { option.position = Cesium.Cartesian3.fromElements(-2720254.816104167, 5089238.80746724, 2707597.802027883) }
      if (!option.position) { option.position = Cesium.Cartesian3.fromDegrees(option.lon, option.lat, option.alt) }

      this.setCamera(option);

      let positionForRadar = option.position;
      // let radius = option.radius ? option.radius : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定
      let radius = option.scanzoneDistance ? option.scanzoneDistance : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定

      // let angleOfHollow = option.pitchAngleRange ? option.pitchAngleRange : 60.0; // 扇形的角度
      // // let angleOfHollow = 90.0 - angleOfSector;
      // let angleOfSector = 90.0 - angleOfHollow; // 扇形的角度
      let angleOfSector = option.pitchAngleRange ? Math.abs(option.pitchAngleRange) : 60.0; // 扇形的角度
      // let radius = this.radius; //200000.0; //球体半径/扇形侧边距/雷达扫描半径
      let innerRadius = 500.0;// 这个变了好像也没啥影响，但是必须要有值

      let beamWidth = option.beamWidth ? option.beamWidth : 40;// 雷达的 波束宽度 beam width

      let ellipsoid = this.viewer.entities.add({
            name: "Dome with top cut out",
            position: positionForRadar,
            // orientation: Cesium.Transforms.headingPitchRollQuaternion(positionForRadar, new Cesium.HeadingPitchRoll(option.heading * Math.PI / 180, 0.0, 0.0)),
            // orientation: orientation,
            show:true,
            ellipsoid: {
                radii: new Cesium.Cartesian3(radius, radius, radius), // 扇形半径
                innerRadii: new Cesium.Cartesian3( innerRadius, innerRadius, innerRadius ), //内半径
                minimumCone: Cesium.Math.toRadians(angleOfSector),
                maximumCone: Cesium.Math.toRadians(angleOfSector + 90),//Cesium.Math.PI,//_OVER_TWO,
                minimumClock: Cesium.Math.toRadians(beamWidth/2),
                maximumClock: Cesium.Math.toRadians(-beamWidth/2),
                material: option.color ? getColor(option.color,option.alpha ? option.alpha : 0.1) : Cesium.Color.RED.withAlpha(0.1),
                outline: option.outline ? option.outline : false,
                // slicePartitions: 32,
                // stackPartitions: 32,
                subdivisions:32,//
            },
        });

    },
    // Radar -- end

    rotatePrimitiveAirplane() {
      const hpRoll = new Cesium.HeadingPitchRoll();

      var pos1 = new Cesium.Cartesian3.fromDegrees(60, 60, 10000); this.addPoint_test(pos1,Cesium.Color.RED)
      var pos2 = new Cesium.Cartesian3.fromDegrees(65, 65, 10000); this.addPoint_test(pos2, Cesium.Color.GREEN)
      this.addPolyline_test([pos1,pos2])
      const model2 = this.scene.primitives.add(
        Cesium.Model.fromGltf({
          // url: "../../SampleData/models/CesiumAir/Cesium_Air.glb",
          url: "./models/CesiumAir/Cesium_Air.glb",
          modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
            pos1,
            hpRoll,
            Cesium.Ellipsoid.WGS84,
            null,//fixedFrameTransform
          ),
          minimumPixelSize: 128,
        })
      );
      //vec1 Cartesian3    vec2 Cartesian3
      function vec1ToVec2Mat(vec1, vec2) {
        //求旋转轴
        var axis = Cesium.Cartesian3.cross(vec1, vec2, new Cesium.Cartesian3(0, 0, 0));
        //求夹角
        var angle = Cesium.Math.acosClamped(
          Cesium.Cartesian3.dot(vec1, vec2) / (Cesium.Cartesian3.magnitude(vec1) * Cesium.Cartesian3.magnitude(vec2))
        );
        //求四元数
        var quaternion = Cesium.Quaternion.fromAxisAngle(axis, angle, new Cesium.Quaternion(0, 0, 0, 0));
        //旋转矩阵
        var rotMat3 = Cesium.Matrix3.fromQuaternion(quaternion, new Cesium.Matrix3());

        return rotMat3;
      }

      var mat41 = Cesium.Transforms.eastNorthUpToFixedFrame(pos1);

      var resQua = Cesium.Quaternion.clone(Cesium.Quaternion.IDENTITY);
      var quaMatrix = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY);
      var roatMat3 = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY);
      var inveRoatMat3 = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY);
      var curAxis = new Cesium.Cartesian3(0, 0, 0);

      roatMat3 = Cesium.Matrix4.getRotation(mat41, roatMat3);
      var orientMat;
      var hpr;

      function computerOrient() {
        curAxis = Cesium.Cartesian3.subtract(pos2, pos1, curAxis);
        inveRoatMat3 = Cesium.Matrix3.inverse(roatMat3, inveRoatMat3)
        curAxis = Cesium.Matrix3.multiplyByVector(inveRoatMat3, curAxis, curAxis);//  得到 模型坐标系下的航向向量
        orientMat = vec1ToVec2Mat(Cesium.Cartesian3.UNIT_X, Cesium.Cartesian3.normalize(curAxis, curAxis));
        resQua = Cesium.Quaternion.fromRotationMatrix(orientMat, resQua);
        var tHpr = Cesium.HeadingPitchRoll.fromQuaternion(resQua, tHpr);
        hpr = [Cesium.Math.toDegrees(tHpr.heading), Cesium.Math.toDegrees(tHpr.pitch),
        Cesium.Math.toDegrees(tHpr.roll)];
      }
      computerOrient();
      model2.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(model2.modelMatrix, orientMat, model2.modelMatrix);
    },
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


    // Entity
    addPoint_test(position,color=Cesium.Color.YELLOW) {
      let point = this.viewer.entities.add({
          position: position,
          point: {
              pixelSize: 10,
              color: color,
          },
      });
      return point;
    },
    addPolyline_test(position,color=Cesium.Color.YELLOW) {
        this.viewer.entities.add({
            polyline: {
                positions: position,//Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]),
                width: 5,
                material: color,
                // clampToGround: true,
            },
        });
    },

    /* Radar*/
    addRadarReconnaossance(option) {
      if (!option) {
        option = {
          beamId: "F-16",

          alt: 1,
          lat: 24.427145,
          lon: 120.970459,

          colorRgb: "0,0,255",
          pellucidity: 100,

          scanzonePointType: 1,
          scanzoneType: 2,

          scanzonePitchAngleRange: 120,
          scanzoneAzimuthRange: 120,
          scanzoneDistance: 120000,    //扫描区域作用距离(雷达长度)
          scanzoneAzimuthPointTo: -90,
          scanzonePitchPointTo: 0,

          beamScanType: 2,
          beamAzimuthPointTo: -90,
          beamPitchPointTo: 0,
          beamAngle: 0,
          beamDistance: 120000,

          state: 0,

          intTime: 0,
          id: 6,
        }
      }
      // if (!option.position) { option.position = Cesium.Cartesian3.fromElements(-2720254.816104167, 5089238.80746724, 2707597.802027883) }
      if (!option.position) { option.position = Cesium.Cartesian3.fromDegrees(option.lon, option.lat, option.alt) }
      option.outline = true;

      this.setCamera(option);

      let positionForRadar = option.position;
      // let radius = option.radius ? option.radius : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定
      let radius = option.scanzoneDistance ? option.scanzoneDistance : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定

      // let angleOfHollow = option.pitchAngleRange ? option.pitchAngleRange : 60.0; // 扇形的角度
      // // let angleOfHollow = 90.0 - angleOfSector;
      // let angleOfSector = 90.0 - angleOfHollow; // 扇形的角度
      let angleOfSector = option.pitchAngleRange ? Math.abs(option.pitchAngleRange) : 60.0; // 扇形的角度
      // let radius = this.radius; //200000.0; //球体半径/扇形侧边距/雷达扫描半径
      let innerRadius = 500.0;// 这个变了好像也没啥影响，但是必须要有值

      let beamWidth = option.beamWidth ? option.beamWidth : 40;// 雷达的 波束宽度 beam width

      let ellipsoid = this.viewer.entities.add({
            name: "RadarDemo",
            position: positionForRadar,
            // orientation: Cesium.Transforms.headingPitchRollQuaternion(positionForRadar, new Cesium.HeadingPitchRoll(option.heading * Math.PI / 180, 0.0, 0.0)),
            // orientation: orientation,
            show:true,
            ellipsoid: {
                radii: new Cesium.Cartesian3(radius, radius, radius), // 扇形半径
                innerRadii: new Cesium.Cartesian3( innerRadius, innerRadius, innerRadius ), //内半径
                minimumCone: Cesium.Math.toRadians(angleOfSector),
                maximumCone: Cesium.Math.toRadians(angleOfSector + 90),//Cesium.Math.PI,//_OVER_TWO,
                minimumClock: Cesium.Math.toRadians(beamWidth/2),
                maximumClock: Cesium.Math.toRadians(-beamWidth/2),
                material: option.color ? getColor(option.color,option.alpha ? option.alpha : 0.1) : Cesium.Color.RED.withAlpha(0.1),
                outline: option.outline ? option.outline : false,
                // slicePartitions: 32,
                // stackPartitions: 32,
                subdivisions:32,//
            },
      });


      let primitives = this.viewer.scene.primitives._primitives;
      for (let i = 0; i < primitives.length; i++){
          // if (primitives[i].id instanceof Cesium.Entity && primitives[i].id.name == 'RadarDemo') {
          console.log(' primitives[i].id ', primitives[i].id, ' primitives[i] ', primitives[i])
          // if (primitives[i].id instanceof Cesium.Entity) {
          //     console.log('primitives[i]', primitives[i]);
          //     // modelMatrix
          // primitives[i].removeAll()

          // }
      }

    },

    // Material / Shader
    shaderIntro() {
      let rectangle = this.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
              rectangle: Cesium.Rectangle.fromDegrees(116, 39, 117, 39.7),
              // EllipsoidSurfaceAppearance.VERTEX_FORMAT = Cesium.VertexFormat.POSITION_AND_ST;
              vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            })
          }),
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false
          })
        })
      );
      rectangle.appearance.material = new Cesium.Material({
        fabric: {
          uniforms: {
            // image: './sky.JPG',
            image: './models/DracoCompressed/CesiumMilkTruck.png',
            alpha: 1.0,
          },
          // 将图片贴上：
          // source: /* glsl */ `
          //   czm_material czm_getMaterial(czm_materialInput materialInput){
          //     czm_material material=czm_getDefaultMaterial(materialInput);
          //     material.diffuse=texture2D(image,materialInput.st).rgb;
          //     return material;
          //   }
          // `
          // 把中间的和外面的挖掉:
          source: /* glsl */ `
            czm_material czm_getMaterial(czm_materialInput materialInput){
              czm_material material=czm_getDefaultMaterial(materialInput);
              material.diffuse=texture2D(image,materialInput.st).rgb;
              material.alpha=alpha;
              vec2 center=vec2(0.5,0.5);
              float dis=distance(center,materialInput.st);
              if(dis>0.25){
                  material.diffuse=vec3(1.0,0.0,0.0);
              }
              if(dis<0.1){
                  material.diffuse=vec3(1.0);
              }
              return material;
            }
          `
        }
      })

      // set Camera
      this.viewer.camera.flyTo({
        destination: Cesium.Rectangle.fromDegrees(116, 39, 117, 39.7),
      })
    },
    shaderIntro2Dynamic() {
      let wall = () => {
        // var positions = Cesium.Cartesian3.fromDegreesArray([
        //   -95.0, 50.0, -85.0, 50.0, -75.0, 50.0,
        // ]);
        var positions = Cesium.Cartesian3.fromDegreesArrayHeights([
          -107.0, 43.0, 100000.0,
          -97.0, 43.0, 100000.0,
          -97.0, 40.0, 100000.0,
          -107.0, 40.0, 100000.0,
          -107.0, 43.0, 100000.0,
        ]);
        var maximumHeights = [500000, 1000000, 500000];
        var minimumHeights = [0, 500000, 0];
        var wallInstance = new Cesium.GeometryInstance({
          geometry: new Cesium.WallGeometry({
            positions: positions,
            // maximumHeights: maximumHeights,
            // minimumHeights: minimumHeights,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromRandom({
                alpha: 0.7,
              })
            ),
          },
        });

        let wall = new Cesium.Primitive({
          geometryInstances: [
            wallInstance,
          ],
          appearance: new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType('Color'),
            faceForward: true
          })
        })
        this.viewer.scene.primitives.add(wall);
        wall.appearance.material = new Cesium.Material({
          fabric: {
            uniforms: {
              color: 'vec3(1.0,1.0,0.0)',
              alpha: 1.0,
              // image: './abc.png',
              image: './imgs/fromLW/rectangle.png',
              // image2: './imgs/pureWhite.png',
              // image2: './sky.JPG',
              t: 0.0,
              color:Cesium.Color.RED.withAlpha(0.6),
            },
            // source: /* glsl */ `
            //   czm_material czm_getMaterial(czm_materialInput materialInput){
            //     czm_material material=czm_getDefaultMaterial(materialInput);
            //     material.diffuse=vec3(1.0,1.0,0.0);
            //     // material.alpha=fract(1.0-materialInput.st.s+t);
            //     // material.alpha=mod(1.0-materialInput.st.s+t,1.0);
            //     material.alpha=mod(materialInput.st.s+t,1.0);
            //     // material.alpha= mod(alpha*t,1.0);
            //     // clamp(x,0.,1.)
            //     // material.alpha= pow(abs(t),1.0);

            //     return material;
            //   }
            // `
            source: /* glsl */ `
              czm_material czm_getMaterial(czm_materialInput materialInput){
                czm_material material = czm_getDefaultMaterial(materialInput);
                vec2 st = materialInput.st*10.0;
                vec4 colorImage = texture2D(image, vec2(fract(st.s-t*10.0), fract(st.t)));
                // vec4 colorImage = texture2D(image, vec2(fract(st.s-t), fract(st.t)));
                // material.alpha = colorImage.a * color.a;
                material.diffuse = color.rgb;
                // material.diffuse = colorImage.rgb;
                return material;
              }
            `
          }
        })
        setInterval(() => {
          wall.appearance.material.uniforms.t += 0.1;
          if (wall.appearance.material.uniforms.t > 1.0) {
            wall.appearance.material.uniforms.t = 0.0;
          }
        }, 2000);


        this.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-107.0, 43.0, 100000.0),
        })
      };

      let polyline = () => {
        let positions = [];
        for (let i = 0; i < 40; ++i) {
          positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 15.0));
        }
        let primitive = this.viewer.scene.primitives.add(
          new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
              geometry: new Cesium.PolylineGeometry({
                positions: positions,
                width: 10.0,
                vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
              }),
            }),
            appearance: new Cesium.PolylineMaterialAppearance({
              material: Cesium.Material.fromType(Cesium.Material.PolylineGlowType),
            }),
          })
        );
        let time = 0.0;
        primitive.appearance.material = new Cesium.Material({
          fabric: {
            uniforms: {
              color: 'vec3(1.0,1.0,0.0)',
              alpha: 1.0,
              // image: './abc.png',
              // image: './imgs/fromLW/rectangle-S.png',
              // image: './imgs/fromLW/rectangle-TSmall.png',
              image: './imgs/fromLW/rectangle-T.png',
              // image2: './imgs/pureWhite.png',
              // image2: './sky.JPG',
              t: time,
            },
            // source: /* glsl */ `
            //   czm_material czm_getMaterial(czm_materialInput materialInput){
            //     czm_material material=czm_getDefaultMaterial(materialInput);
            //     material.diffuse=vec3(1.0,1.0,0.0);
            //     // material.alpha=fract(1.0-materialInput.st.s+t);
            //     // material.alpha=mod(1.0-materialInput.st.s+t,1.0);
            //     material.alpha=mod(materialInput.st.s+t,1.0);
            //     // material.alpha= mod(alpha*t,1.0);
            //     // clamp(x,0.,1.)
            //     // material.alpha= pow(abs(t),1.0);

            //     return material;
            //   }
            // `
            source: /* glsl */ `
              czm_material czm_getMaterial(czm_materialInput materialInput){
                czm_material material = czm_getDefaultMaterial(materialInput);
                vec2 st = materialInput.st*10.0;
                // vec4 colorImage = texture2D(image, vec2(fract(st.s-t*10.0), fract(st.t)));
                vec4 colorImage = texture2D(image, vec2(fract(st.s-t*10.0), st.t));
                material.alpha = colorImage.a;// * color.a;
                material.diffuse = colorImage.rgb;
                return material;
              }
            `
          }
        })

        console.log('%c [ primitive.appearance.material ]-792', 'font-size:13px; background:pink; color:#bf2c9f;', primitive.appearance.material)
        console.log('%c [ primitive.appearance.material.uniforms ]-793', 'font-size:13px; background:pink; color:#bf2c9f;', primitive.appearance.material.uniforms)
        setInterval(() => {
          primitive.appearance.material.uniforms.t += 0.001;
          if (primitive.appearance.material.uniforms.t > 1.0) {
            primitive.appearance.material.uniforms.t = 0.0;
          }
        }, 20);
        // setInterval(() => {
        //     time += 0.001;
        //     if (time > 1.0) {
        //         time = 0.0;
        //     }
        // }, 20);

        // this.viewer.camera.flyTo({
        //   destination: Cesium.Cartesian3.fromDegrees(-100.0, 15.0, 100000.0),
        // })
      }
      polyline();
    },

    // 其他
    Cartesian3Lerp() {
      var pos1 = new Cesium.Cartesian3.fromDegrees(60, 60, 10000);
      var pos1_ = new Cesium.Cartesian3.fromDegrees(60.0001, 60, 10000);
      this.addPoint_test(pos1_, Cesium.Color.PINK)
      var pos2 = new Cesium.Cartesian3.fromDegrees(65, 65, 10000);
      var pos2_ = new Cesium.Cartesian3.fromDegrees(65.0001, 65, 10000);
      this.addPoint_test(pos2_, Cesium.Color.PINK)

      let interpolateNum = 20;

      for (let i = 0; i < interpolateNum; i++) {
          let t = i / interpolateNum;
          // Cesium.Cartesian3.lerp = function (start, end, t, result) { }
          let cur = new Cesium.Cartesian3();
          Cesium.Cartesian3.lerp(pos1, pos2, t, cur); // 这个涉及到数据如何给我？？

          this.addPoint_test(cur)
      }
    },

    setCamera(position) {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          position.lon,
          position.lat,
          position.alt + 1000.0
        ),
    });
    },

    // from cesium.sandcastle.com
    globalMaterial() {
      /*
        关于这个demo：我最主要的是想知道Cesium 如何实现随着相机的缩放，然后地球表面的shader动态变化的。（描述一下怎么变化的： 相机离地表越近，顶点数越多，线越精细）
        所以： 这个功能是默认支持？还是需要手动设置？？？---》看对应的fragmentShader
      */
        let viewer = this.viewer;
        viewer.terrainProvider = Cesium.createWorldTerrain({
            requestVertexNormals: true, //Needed to visualize slope
        }),

        viewer.scene.globe.enableLighting = true;

        function getElevationContourMaterial() {
          // Creates a composite material with both elevation shading and contour lines
          return new Cesium.Material({
            fabric: {
              type: "ElevationColorContour",
              materials: {
                contourMaterial: {
                  type: "ElevationContour",
                },
                elevationRampMaterial: {
                  type: "ElevationRamp",
                },
              },
              components: {
                diffuse:
                  "contourMaterial.alpha == 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse",
                alpha:
                  "max(contourMaterial.alpha, elevationRampMaterial.alpha)",
              },
            },
            translucent: false,
          });
        }

        function getSlopeContourMaterial() {
          // Creates a composite material with both slope shading and contour lines
          return new Cesium.Material({
            fabric: {
              type: "SlopeColorContour",
              materials: {
                contourMaterial: {
                  type: "ElevationContour",
                },
                slopeRampMaterial: {
                  type: "SlopeRamp",
                },
              },
              components: {
                diffuse:
                  "contourMaterial.alpha == 0.0 ? slopeRampMaterial.diffuse : contourMaterial.diffuse",
                alpha: "max(contourMaterial.alpha, slopeRampMaterial.alpha)",
              },
            },
            translucent: false,
          });
        }

        function getAspectContourMaterial() {
          // Creates a composite material with both aspect shading and contour lines
          return new Cesium.Material({
            fabric: {
              type: "AspectColorContour",
              materials: {
                contourMaterial: {
                  type: "ElevationContour",
                },
                aspectRampMaterial: {
                  type: "AspectRamp",
                },
              },
              components: {
                diffuse:
                  "contourMaterial.alpha == 0.0 ? aspectRampMaterial.diffuse : contourMaterial.diffuse",
                alpha: "max(contourMaterial.alpha, aspectRampMaterial.alpha)",
              },
            },
            translucent: false,
          });
        }

        var elevationRamp = [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0];
        var slopeRamp = [0.0, 0.29, 0.5, Math.sqrt(2) / 2, 0.87, 0.91, 1.0];
        var aspectRamp = [0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0];
        function getColorRamp(selectedShading) {
          var ramp = document.createElement("canvas");
          ramp.width = 100;
          ramp.height = 1;
          var ctx = ramp.getContext("2d");

          var values;
          if (selectedShading === "elevation") {
            values = elevationRamp;
          } else if (selectedShading === "slope") {
            values = slopeRamp;
          } else if (selectedShading === "aspect") {
            values = aspectRamp;
          }

          var grd = ctx.createLinearGradient(0, 0, 100, 0);
          grd.addColorStop(values[0], "#000000"); //black
          grd.addColorStop(values[1], "#2747E0"); //blue
          grd.addColorStop(values[2], "#D33B7D"); //pink
          grd.addColorStop(values[3], "#D33038"); //red
          grd.addColorStop(values[4], "#FF9742"); //orange
          grd.addColorStop(values[5], "#ffd700"); //yellow
          grd.addColorStop(values[6], "#ffffff"); //white

          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, 100, 1);

          return ramp;
        }

        var minHeight = -414.0; // approximate dead sea elevation
        var maxHeight = 8777.0; // approximate everest elevation
        var contourColor = Cesium.Color.RED.clone();
        var contourUniforms = {};
        var shadingUniforms = {};


        let enableContour = 1;//false
        let contourSpacing = 150.0;//记得给 float
        let contourWidth = 2.0;
        let selectedShading = "elevation";// "elevation" "slope" "aspect"
        // let selectedShading = "slope";// "elevation" "slope" "aspect"
        // let selectedShading = "aspect";// "elevation" "slope" "aspect"


        function updateMaterial() {
          var globe = viewer.scene.globe;
          var material;
          if (enableContour) {

            if (selectedShading === "elevation") {
              material = getElevationContourMaterial();
              // console.log('%c [ material ]-271', 'font-size:13px; background:pink; color:#bf2c9f;', material)
              /* shaderSource：
                "
                  uniform sampler2D image_4;
                  uniform float minimumHeight_5;
                  uniform float maximumHeight_6;

                  czm_material czm_getMaterial_7(czm_materialInput materialInput)
                  {
                      czm_material material = czm_getDefaultMaterial(materialInput);
                      float scaledHeight = clamp((materialInput.height - minimumHeight_5) / (maximumHeight_6 - minimumHeight_5), 0.0, 1.0);
                      vec4 rampColor = texture2D(image_4, vec2(scaledHeight, 0.5));
                      rampColor = czm_gammaCorrect(rampColor);
                      material.diffuse = rampColor.rgb;
                      material.alpha = rampColor.a;
                      return material;
                  }

                  #ifdef GL_OES_standard_derivatives
                      #extension GL_OES_standard_derivatives : enable
                  #endif

                  uniform vec4 color_1;
                  uniform float spacing_0;
                  uniform float width_2;

                  czm_material czm_getMaterial_3(czm_materialInput materialInput)
                  {
                      czm_material material = czm_getDefaultMaterial(materialInput);

                      float distanceToContour = mod(materialInput.height, spacing_0);

                      #ifdef GL_OES_standard_derivatives
                          float dxc = abs(dFdx(materialInput.height));
                          float dyc = abs(dFdy(materialInput.height));
                          float dF = max(dxc, dyc) * czm_pixelRatio * width_2;
                          float alpha = (distanceToContour < dF) ? 1.0 : 0.0;
                      #else
                          float alpha = (distanceToContour < (czm_pixelRatio * width_2)) ? 1.0 : 0.0;
                      #endif

                      vec4 outColor = czm_gammaCorrect(vec4(color_1.rgb, alpha * color_1.a));
                      material.diffuse = outColor.rgb;
                      material.alpha = outColor.a;

                      return material;
                  }

                  czm_material czm_getMaterial(czm_materialInput materialInput)
                  {
                  czm_material material = czm_getDefaultMaterial(materialInput);
                  material.diffuse = czm_getMaterial_3(materialInput).alpha == 0.0 ? czm_getMaterial_7(materialInput).diffuse : czm_getMaterial_3(materialInput).diffuse;
                  material.alpha = max(czm_getMaterial_3(materialInput).alpha, czm_getMaterial_7(materialInput).alpha);
                  return material;
                  }
                "
              */
              shadingUniforms = material.materials.elevationRampMaterial.uniforms;
              shadingUniforms.minimumHeight = minHeight;
              shadingUniforms.maximumHeight = maxHeight;
              contourUniforms = material.materials.contourMaterial.uniforms;
            } else if (selectedShading === "slope") {
              material = getSlopeContourMaterial();
              shadingUniforms = material.materials.slopeRampMaterial.uniforms;
              contourUniforms = material.materials.contourMaterial.uniforms;
            } else if (selectedShading === "aspect") {
              material = getAspectContourMaterial();
              shadingUniforms = material.materials.aspectRampMaterial.uniforms;
              contourUniforms = material.materials.contourMaterial.uniforms;
            } else {
              material = Cesium.Material.fromType("ElevationContour");
              contourUniforms = material.uniforms;
            }

            contourUniforms.width = contourWidth;
            contourUniforms.spacing = contourSpacing;
            contourUniforms.color = contourColor;

          } else if (selectedShading === "elevation") {
            material = Cesium.Material.fromType("ElevationRamp");
            // console.log('%c [ ElevationRamp ]-295', 'font-size:13px; background:pink; color:#bf2c9f;', material)
            /* shaderSource：
              "
                uniform sampler2D image_0;
                uniform float minimumHeight_1;
                uniform float maximumHeight_2;

                czm_material czm_getMaterial(czm_materialInput materialInput)
                {
                    czm_material material = czm_getDefaultMaterial(materialInput);
                    float scaledHeight = clamp((materialInput.height - minimumHeight_1) / (maximumHeight_2 - minimumHeight_1), 0.0, 1.0);
                    vec4 rampColor = texture2D(image_0, vec2(scaledHeight, 0.5));
                    rampColor = czm_gammaCorrect(rampColor);
                    material.diffuse = rampColor.rgb;
                    material.alpha = rampColor.a;
                    return material;
                }
              "
            */
            shadingUniforms = material.uniforms;
            shadingUniforms.minimumHeight = minHeight;
            shadingUniforms.maximumHeight = maxHeight;
          } else if (selectedShading === "slope") {
            material = Cesium.Material.fromType("SlopeRamp");
            shadingUniforms = material.uniforms;
          } else if (selectedShading === "aspect") {
            material = Cesium.Material.fromType("AspectRamp");
            shadingUniforms = material.uniforms;
          }

          if (selectedShading !== "none") {
            shadingUniforms.image = getColorRamp(selectedShading);
          }

          globe.material = material;
        }
        updateMaterial();

        // 更改添加轮廓的颜色
        let changeContourColor = ()=>{
          contourUniforms.color = Cesium.Color.fromRandom(
            { alpha: 1.0 },
            contourColor
          );
        }
        // changeContourColor();


        // 更改相机的位置以及俯仰
        // "Himalayas"
        let Himalayas = () => {
          viewer.camera.setView({
            destination: new Cesium.Cartesian3(
              322100.7492728492,
              5917960.047024654,
              3077602.646977297
            ),
            orientation: {
              heading: 5.988151498702285,
              pitch: -1.5614542839414822,
              roll: 0,
            },
          });
          viewer.clockViewModel.currentTime = Cesium.JulianDate.fromIso8601(
            "2017-09-22T04:00:00Z"
          );
        }
        // "Half Dome",
        let halfDome = () => {
          viewer.camera.setView({
          destination: new Cesium.Cartesian3(
            -2495709.521843174,
            -4391600.804712465,
            3884463.7192916023
          ),
          orientation: {
            heading: 1.7183056487769202,
            pitch: -0.06460370548034144,
            roll: 0.0079181631783527,
          },
        });
        viewer.clockViewModel.currentTime = Cesium.JulianDate.fromIso8601(
          "2017-09-22T18:00:00Z"
        );
        }

        // "Vancouver"
        let Vancouver = ()=>{
          viewer.camera.setView({
            destination: new Cesium.Cartesian3(
              -2301222.367751603,
              -3485269.915771613,
              4812080.961755785
            ),
            orientation: {
              heading: 0.11355958593902571,
              pitch: -0.260011078090858,
              roll: 0.00039019018274721873,
            },
          });
          viewer.clockViewModel.currentTime = Cesium.JulianDate.fromIso8601(
            "2017-09-22T18:00:00Z"
          );
        }

        // "Mount Everest",
        let mountEverest = () => {
          viewer.camera.setView({
          destination: new Cesium.Cartesian3(
            282157.6960889096,
            5638892.465594703,
            2978736.186473513
          ),
          orientation: {
            heading: 4.747266966349747,
            pitch: -0.2206998858596192,
            roll: 6.280340554587955,
          },
        });
        viewer.clockViewModel.currentTime = Cesium.JulianDate.fromIso8601(
          "2017-09-22T04:00:00Z"
        );
        }

        Himalayas()//by default
        // halfDome()
        // Vancouver()
        // mountEverest()
    },


    // want to have a try
    // 关于利用4个控制点生成贝塞尔曲线，传入4个在XY平面的点会如何 --- OK,不过要是给的 经纬度的话，就会因为地图的关系弧度存在偏差
    bezier4PointTest() {
      let p1 = new Cesium.Cartesian3.fromDegrees(90.0, 100.0, 1000);
      let p2 = new Cesium.Cartesian3.fromDegrees(90.0, 105.0, 1000);
      let p3 = new Cesium.Cartesian3.fromDegrees(85.0, 110.0, 1000);
      let p4 = new Cesium.Cartesian3.fromDegrees(80.0, 110.0, 1000);
      let poss = BezierBy4Point(p1, p2, p3, p4);
      console.log('%c [ poss ]-1205', 'font-size:13px; background:pink; color:#bf2c9f;', poss)
      this.addPolyline_test(poss)
    },
    LineDCPrimitiveTest() {
      let drawStaticLine = (option) => {
        /*  option:{
                matrix:
                typedArray,
                stArray,
                normalsArray,
                time
            }
        */
        let viewer = this.viewer;

        const modelMatrix = option.matrix ? option.matrix : Cesium.Matrix4.IDENTITY;

        const vertexShaderText = `
          attribute vec3 position;
          // attribute vec3 normal;
          // attribute vec2 st;
          attribute float batchId;

          // varying vec3 v_positionEC;
          // varying vec3 v_normalEC;
          // varying vec2 v_st;

          void main() {
              vec4 p = vec4(position,1.0);

              // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
              // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
              // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
              // v_st = st;

              // v_normal = czm_normal;// * normal;
              // v_normalEC = normal;
              // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

              // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
              gl_Position = czm_projection * czm_view * czm_model * p;
              // gl_Position = czm_modelViewProjectionRelativeToEye * p;
          }`;

        const fragmentShaderText = `
          uniform vec4 u_color;
          uniform float u_alpha;
          // uniform sampler2D image;

          // varying vec3 v_positionEC;
          // varying vec2 v_st;

          void main(){
              czm_materialInput materialInput;
              // materialInput.positionToEyeEC = v_positionEC;
              // materialInput.st = v_st;

              czm_material material = czm_getDefaultMaterial(materialInput);
              // vec2 st = materialInput.st;//*10.0;
              // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
              // vec4 colorImage = texture2D(image, vec2(st.s, st.t));
              // material.alpha = colorImage.a * u_alpha;
              // material.diffuse = colorImage.rgb * u_color.rgb;
              material.alpha = u_alpha;
              material.diffuse = u_color.rgb;

              gl_FragColor = vec4(material.diffuse , material.alpha);
          }`;

        // 1.5 定义纹理
        let u_color = option.color ? option.color : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
        let u_alpha = option.alpha ? option.alpha : 1.0;


        /* ----- See Here ↓ ------ */
        class LineDCPrimitive {
          /**
           * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
           */
          constructor(option = {}) {
            this._modelMatrix = option.modelMatrix;
            // this.createCommand = null
            this.preExecute = option.preExecute;
            this.positionArray = option.positionArray;
            // this.normalsArray = option.normalsArray;
            // this.stArray = option.stArray;
          }

          createVertexBufferByData(frameState) {
            const positionBuffer = Cesium.Buffer.createVertexBuffer({
              usage: Cesium.BufferUsage.STATIC_DRAW,
              typedArray: new Float32Array(this.positionArray),
              context: frameState.context,
            });

            // 2 定义法向数组  n-normal  n-negative/p-positive  x/y/z
            // var npx = [1, 0, 0];
            // var nnx = [-1, 0, 0];
            // var npy = [0, 1, 0];
            // var nny = [0, -1, 0];
            // var npz = [0, 0, 1];
            // var nnz = [0, 0, -1];
            // const normalBuffer = Cesium.Buffer.createVertexBuffer({
            //     context: frameState.context,
            //     // sizeInBytes: 12,
            //     usage: Cesium.BufferUsage.STATIC_DRAW,
            //     typedArray: new Float32Array([
            //         ...npz, ...npz, ...npz,
            //         ...nnz, ...nnz, ...nnz,
            //         ...npz, ...npz, ...npz,
            //         ...nnz, ...nnz, ...nnz,
            //     ]),
            // })

            // 在这里创建纹理坐标Buffer:
            // const stBuffer = Cesium.Buffer.createVertexBuffer({
            //     usage: Cesium.BufferUsage.STATIC_DRAW,
            //     typedArray: new Float32Array(this.stArray),
            //     context: frameState.context,
            // });

            // 在这里创建 normal Buffer:
            // const normalBuffer = Cesium.Buffer.createVertexBuffer({
            //     usage: Cesium.BufferUsage.STATIC_DRAW,
            //     typedArray: new Float32Array(this.normalsArray),
            //     context: frameState.context,
            // });

            const vertexArray = new Cesium.VertexArray({
              context: frameState.context,
              attributes: [
                {
                  index: 0, // 等于 attributeLocations['position']
                  vertexBuffer: positionBuffer,
                  componentsPerAttribute: 3,
                  componentDatatype: Cesium.ComponentDatatype.FLOAT,
                },
                // {
                //     index: 1, // 等于 attributeLocations['position']
                //     vertexBuffer: stBuffer,
                //     componentsPerAttribute: 2,
                //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                // },
                // {
                //     index: 2,
                //     vertexBuffer: normalBuffer,
                //     componentsPerAttribute: 3,
                //     componentDatatype: Cesium.ComponentDatatype.FLOAT
                // }
              ],
            });
            return vertexArray;
          }

          createCommand(frameState, matrix) {
            const attributeLocations = {
              position: 0,
              // st: 1,
              // normal: 2,
              // textureCoordinates: 1,
            };
            const uniformMap = {
              u_color() {
                // return Cesium.Color.RED;
                // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                return u_color;
              },
              u_alpha() {
                return u_alpha;
              },
              // u_time() {
              //     u_time += 0.001;
              //     if (u_time > 1.0) {
              //         u_time = 0.0;
              //     }
              //     return u_time;
              // },
              // image: function() {
              //     if (Cesium.defined(texture)) {
              //         return texture;
              //     } else {
              //         return frameState.context.defaultTexture;
              //     }
              // }
            };

            const vertexArray = this.createVertexBufferByData(frameState);

            const program = Cesium.ShaderProgram.fromCache({
              context: frameState.context,
              vertexShaderSource: vertexShaderText,
              fragmentShaderSource: fragmentShaderText,
              attributeLocations: attributeLocations,
            });
            const renderState = Cesium.RenderState.fromCache({
              depthTest: {
                enabled: true,
              },
              // blending : {
              //     enabled : true,
              //     color : {
              //         red : 1.0,
              //         green : 1.0,
              //         blue : 1.0,
              //         alpha : 1.0
              //     },
              //     equationRgb : Cesium.BlendEquation.ADD,
              //     equationAlpha : Cesium.BlendEquation.SUBTRACT,
              //     functionSourceRgb : Cesium.BlendFunction.ONE,
              //     functionSourceAlpha : Cesium.BlendFunction.ONE,
              //     functionDestinationRgb : Cesium.BlendFunction.ONE,
              //     functionDestinationAlpha : Cesium.BlendFunction.ONE
              // },
            });
            return new Cesium.DrawCommand({
              primitiveType: Cesium.PrimitiveType.LINES,//默认就是 PrimitiveType.TRIANGLE
              modelMatrix: matrix,
              vertexArray: vertexArray,
              shaderProgram: program,
              uniformMap: uniformMap,
              renderState: renderState,
              pass: Cesium.Pass.TRANSLUCENT,
              // pass: Cesium.Pass.OPAQUE,
            });
          }

          /**
           * @param {FrameState} frameState
           */
          update(frameState) {
            if (this.preExecute) {
              this.preExecute();
            }
            const command = this.createCommand(
              frameState,
              this._modelMatrix
            );

            frameState.commandList.push(command);

          }
        }

        viewer.scene.globe.depthTestAgainstTerrain = true;

        let primitive = viewer.scene.primitives.add(
          new LineDCPrimitive({
            modelMatrix: modelMatrix,
            positionArray: option.typedArray,
            stArray: option.stArray,
            // time: option.time,
            // normalsArray:normalsArray,
          })
        );

        return primitive;
      };
      let p1 = new Cesium.Cartesian3.fromDegrees(90.0, 100.0, 1000);
      let p2 = new Cesium.Cartesian3.fromDegrees(90.0, 105.0, 1000);
      let p3 = new Cesium.Cartesian3.fromDegrees(85.0, 110.0, 1000);
      let p4 = new Cesium.Cartesian3.fromDegrees(80.0, 110.0, 1000);
      let poss = BezierBy4Point(p1, p2, p3, p4);
      console.log('%c [ poss ]-1470', 'font-size:13px; background:pink; color:#bf2c9f;', poss)
      let posInOrder = [];

      // for (let i = 0; i < poss.length; ){


      // }

      // drawStaticLine()

    },
    generateMatrix(pos1, pos2) {
        // 利用 this.beforePosition, this.position 计算出  上一个点的行驶方向：
        // 算出 this.beforePosition 的旋转矩阵，
         //vec1 Cartesian3    vec2 Cartesian3
        function vec1ToVec2Mat(vec1, vec2) {
            //求旋转轴
            var axis = Cesium.Cartesian3.cross(vec1, vec2, new Cesium.Cartesian3(0, 0, 0));
            //求夹角
            var angle = Cesium.Math.acosClamped( Cesium.Cartesian3.dot(vec1, vec2) / (Cesium.Cartesian3.magnitude(vec1) * Cesium.Cartesian3.magnitude(vec2)) );
            //求四元数
            var quaternion = Cesium.Quaternion.fromAxisAngle(axis, angle, new Cesium.Quaternion(0, 0, 0, 0));
            //旋转矩阵
            var rotMat3 = Cesium.Matrix3.fromQuaternion(quaternion, new Cesium.Matrix3());

            return rotMat3;
        }
        var mat41 = Cesium.Transforms.eastNorthUpToFixedFrame(pos1);
        var resQua = Cesium.Quaternion.clone(Cesium.Quaternion.IDENTITY);
        var quaMatrix = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY);
        var roatMat3 = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY);
        var inveRoatMat3 = Cesium.Matrix3.clone(Cesium.Matrix3.IDENTITY);
        var curAxis = new Cesium.Cartesian3(0, 0, 0);
        roatMat3 = Cesium.Matrix4.getRotation(mat41, roatMat3);
        var orientMat;
        var hpr;
        function computerOrient() {
            curAxis = Cesium.Cartesian3.subtract(pos2, pos1, curAxis);
            console.log("curAxis", curAxis);
            if(curAxis.x == 0 && curAxis.y == 0 && curAxis.z == 0 ){return}
            inveRoatMat3 = Cesium.Matrix3.inverse(roatMat3, inveRoatMat3)
            curAxis = Cesium.Matrix3.multiplyByVector(inveRoatMat3, curAxis, curAxis);//  得到 模型坐标系下的航向向量(？？？)
            orientMat = vec1ToVec2Mat(Cesium.Cartesian3.UNIT_X, Cesium.Cartesian3.normalize(curAxis, curAxis));
            // orientMat = vec1ToVec2Mat(pos1, Cesium.Cartesian3.normalize(curAxis, curAxis));
            resQua = Cesium.Quaternion.fromRotationMatrix(orientMat, resQua);
            var tHpr = Cesium.HeadingPitchRoll.fromQuaternion(resQua, tHpr);
            hpr = [Cesium.Math.toDegrees(tHpr.heading), Cesium.Math.toDegrees(tHpr.pitch),
            Cesium.Math.toDegrees(tHpr.roll)];
        }
        computerOrient();
        if (orientMat) {
            this.model.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(this.model.modelMatrix, orientMat, this.model.modelMatrix);
        }
    },
    rotatePoint(pos) {
        // 旋转
        const backto_matrix = Cesium.Matrix4.fromTranslation(pos);
        const moveto_vec = Cesium.Cartesian3.multiplyByScalar(pos, -1, new Cesium.Cartesian3());
        const moveto_matrix = Cesium.Matrix4.fromTranslation(moveto_vec);

        /* 绕x（即东方轴）转90度 */
        const cos_rotateX = Math.cos(Math.PI/2);
        const sin_rotateX = Math.sin(Math.PI/2);
        const arrX = [
            1, 0, 0, 0,
            0, cos_rotateX, sin_rotateX, 0,
            0, -sin_rotateX, cos_rotateX, 0,
            0, 0, 0, 1
        ];
        const arrZ = [
            cos_rotateX, -sin_rotateX, 0, 0,
            sin_rotateX, cos_rotateX, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 1
        ];
        const arrY = [
            cos_rotateX,   0, sin_rotateX,   0,
                 0,   1,      0,   0,
           -sin_rotateX,   0, cos_rotateX,   0,
                 0,   0,      0,   1
        ];
        const rotateX_matrix = Cesium.Matrix4.fromArray(arrZ);

        /* 计算最终矩阵 */
        const temp = Cesium.Matrix4.multiply(rotateX_matrix, moveto_matrix, new Cesium.Matrix4());
        const r = Cesium.Matrix4.multiply(backto_matrix, temp, new Cesium.Matrix4());

        let target_pos = Cesium.Matrix4.multiplyByPoint( r, pos, new Cesium.Cartesian3())

        return target_pos;
    },
    translatePointAlongAxis(pos,distances={x:0,y:500,z:0}, local_rotate) {
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

        let transitionMatrix = Cesium.Matrix4.fromTranslation(world_translation); // 构造平移矩阵并赋值 --- 在这一步 得到 平移矩阵，如果有旋转的话，

        let target_pos = null;

        if (0 && local_rotate) {
            const rotate_result = Cesium.Matrix4.multiplyByMatrix3(frompoint_to_world_matrix, local_rotate, new Cesium.Matrix3());
            const r_targetpoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(rotate_result);
            // const world_rotate = new Cesium.Matrix3(
            //     r_targetpoint_to_world_matrix[0] - frompoint_to_world_matrix[0],
            //     r_targetpoint_to_world_matrix[1] - frompoint_to_world_matrix[1],
            //     r_targetpoint_to_world_matrix[2] - frompoint_to_world_matrix[2],
            //     r_targetpoint_to_world_matrix[3] - frompoint_to_world_matrix[4],
            //     r_targetpoint_to_world_matrix[4] - frompoint_to_world_matrix[5],
            //     r_targetpoint_to_world_matrix[5] - frompoint_to_world_matrix[6],
            //     r_targetpoint_to_world_matrix[6] - frompoint_to_world_matrix[8],
            //     r_targetpoint_to_world_matrix[7] - frompoint_to_world_matrix[9],
            //     r_targetpoint_to_world_matrix[8] - frompoint_to_world_matrix[10],
            // ); // 向量相减，得到世界坐标下的平移向量

            // let rotateMatrix = Cesium.Matrix4.fromRotation(world_rotate);
            let rotateMatrix = r_targetpoint_to_world_matrix;
            // 先 平移 后 旋转
            // let final_matrix = Cesium.Matrix4.multiply(rotateMatrix, transitionMatrix, new Cesium.Matrix4())
            // target_pos = Cesium.Matrix4.multiplyByPoint( final_matrix, pos, new Cesium.Cartesian3())
            // 先 旋转 后 平移
            // let final_matrix = Cesium.Matrix4.multiply(rotateMatrix, transitionMatrix, new Cesium.Matrix4())
            // let final_matrix = new Cesium.Matrix4();
            // final_matrix[0] = rotateMatrix[0];
            // final_matrix[1] = rotateMatrix[1];
            // final_matrix[2] = rotateMatrix[2];
            // final_matrix[3] = 0;
            // final_matrix[4] = rotateMatrix[3];
            // final_matrix[5] = rotateMatrix[4];
            // final_matrix[6] = rotateMatrix[5];
            // final_matrix[7] = 0;
            // final_matrix[8] = rotateMatrix[6];
            // final_matrix[9] = rotateMatrix[7];
            // final_matrix[10] = rotateMatrix[8];
            // final_matrix[11] = 0;
            // final_matrix[12] = transitionMatrix[12];
            // final_matrix[13] = transitionMatrix[13];
            // final_matrix[14] = transitionMatrix[14];
            // final_matrix[15] = 1.0;
            target_pos = Cesium.Matrix4.multiplyByPoint(transitionMatrix, pos, new Cesium.Cartesian3())
            Cesium.Matrix3.multiplyByVector(local_rotate, target_pos, target_pos);
        } else {
            target_pos = Cesium.Matrix4.multiplyByPoint( transitionMatrix, pos, new Cesium.Cartesian3())
        }

        return target_pos;
    },
    //
    addRadarReconnaossanceTest(option) {
        if (!option) {
          option = {
            beamId: "F-16",

            alt: 1,
            lat: 24.427145,
            lon: 120.970459,

            colorRgb: "0,0,255",
            pellucidity: 100,

            scanzonePointType: 1,
            scanzoneType: 2,

            scanzonePitchAngleRange: 120,
            scanzoneAzimuthRange: 120,
            scanzoneDistance: 120000,    //扫描区域作用距离(雷达长度)
            scanzoneAzimuthPointTo: -90,
            scanzonePitchPointTo: 0,

            beamScanType: 2,
            beamAzimuthPointTo: -90,
            beamPitchPointTo: 0,
            beamAngle: 0,
            beamDistance: 120000,

            state: 0,

            intTime: 0,
            id: 6,
          }
        }
        // if (!option.position) { option.position = Cesium.Cartesian3.fromElements(-2720254.816104167, 5089238.80746724, 2707597.802027883) }
        if (!option.position) { option.position = Cesium.Cartesian3.fromDegrees(option.lon, option.lat, option.alt) }
        this.addPoint_test(option.position);

        // this.setCamera(option);

        let positionForRadar = option.position;
        // let radius = option.radius ? option.radius : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定
        let radius = option.scanzoneDistance ? option.scanzoneDistance : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定

        // let angleOfHollow = option.pitchAngleRange ? option.pitchAngleRange : 60.0; // 扇形的角度
        // // let angleOfHollow = 90.0 - angleOfSector;
        // let angleOfSector = 90.0 - angleOfHollow; // 扇形的角度
        let angleOfSector = option.pitchAngleRange ? Math.abs(option.pitchAngleRange) : 60.0; // 扇形的角度
        // let radius = this.radius; //200000.0; //球体半径/扇形侧边距/雷达扫描半径
        let innerRadius = 500.0;// 这个变了好像也没啥影响，但是必须要有值

        let beamWidth = option.beamWidth ? option.beamWidth : 40;// 雷达的 波束宽度 beam width

        let ellipsoid = this.viewer.entities.add({
              name: "Dome with top cut out",
              position: positionForRadar,
              // orientation: Cesium.Transforms.headingPitchRollQuaternion(positionForRadar, new Cesium.HeadingPitchRoll(option.heading * Math.PI / 180, 0.0, 0.0)),
              // orientation: orientation,
              show:true,
              ellipsoid: {
                  radii: new Cesium.Cartesian3(radius, radius, radius), // 扇形半径
                  innerRadii: new Cesium.Cartesian3( innerRadius, innerRadius, innerRadius ), //内半径
                  minimumCone: Cesium.Math.toRadians(angleOfSector),
                  maximumCone: Cesium.Math.toRadians(angleOfSector + 90),//Cesium.Math.PI,//_OVER_TWO,
                  minimumClock: Cesium.Math.toRadians(beamWidth/2),
                  maximumClock: Cesium.Math.toRadians(-beamWidth/2),
                  material: option.color ? getColor(option.color,option.alpha ? option.alpha : 0.1) : Cesium.Color.RED.withAlpha(0.1),
                  outline: option.outline ? option.outline : false,
                  // slicePartitions: 32,
                  // stackPartitions: 32,
                  subdivisions:32,//
              },
        });

        this.radar = ellipsoid;

    },
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
