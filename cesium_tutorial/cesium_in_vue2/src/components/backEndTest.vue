<template>
    <div>
        <el-button @click="click" class="Btn">Start</el-button>
        <el-button @click="stop" class="Btn stopBtn">Stop</el-button>
        <div id="cesiumContainer"></div>
    </div>
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import antiAliasing from "../utils/antiAliasing.js";
import createGroundRader from "../utils/createGroundRader.js";
import preventCameraIntoUnderground from "../utils/preventCameraIntoUnderground.js";
import RadarReconnaossance from "../utils/RadarReconnaossance.js";
import planeInReconnaossance from "../utils/planeInReconnaossance.js";
import HPR2Orientation from "../utils/HPR2Orientation.js";
import createCustomMaterialImg from "../utils/createCustomMaterialImg.js";
import addLabel from "../utils/addLabel.js";
import showAxis from "../utils/showAxis.js";

export default {
    name: "modelInstanceCollection",
    data() {
        return {
            curModel:null,
            viewer: null,
            cesiumHandler: null,
            sectorEntity: {},
            sectorDegree: 60,
            radius: 100000.0,
            innerRadius: 10.0,
            heading: 10.0,
            position: null,
            modelMap:null,
            labelMap:null,
            axisMap:null,
        };
    },
    // sockets:{
    //     getSimDataEvent: data => {
    //         console.log('welcome data1111111111111111111111111 ', data)
    //         alert(111111111111111111111111111);
    //     }
    // },
    methods: {
        click() {
            this.$socket.open() // 开始连接socket
            this.$socket.emit('startEvent');
            // 订阅事件
            this.sockets.subscribe('getSimDataEvent', function(res){
                /*
                    {
                        "lat":23.870354,      //纬度
                        "lon":120.004336,     //经度
                        "alt":7568.568461,    //海拔高度

                        "phi":0.0,            //偏航 --- 绕 Y 轴，heading
                        "psi":-1.402504,      //俯仰 --- 绕 X 轴，pitch
                        "theta":-0.008625     //滚转 --- 绕 Z 轴，roll

                        "alive":1,            //实体标识，表示是否活着。
                        "id":7292,            // 这个 id 代表 模型？？还是这条数据？？？ 如果是这条数据，好像就不必有了（个人想法）
                        // "simRadarBeamDto":{}, //2022.08.18日返回的数据这个字段全是 {}
                        "simRadarBeamDto":{
                            "alt":10000.0,
                            "beamAngle":0.0,
                            "beamAzimuthPointTo":-90.0,
                            "beamDistance":120000.0,
                            "beamId":"飞机-6",
                            "beamPitchPointTo":0.0,
                            "beamScanType":2,
                            "colorRgb":"0,0,255",
                            "id":2,
                            "intTime":0,
                            "lat":24.236947,
                            "lon":120.9375,
                            "pellucidity":100,
                            "scanzoneAzimuthPointTo":-90.0,
                            "scanzoneAzimuthRange":120.0,
                            "scanzoneDistance":120000.0,
                            "scanzonePitchAngleRange":120.0,
                            "scanzonePitchPointTo":0.0,
                            "scanzonePointType":1,
                            "scanzoneType":2,
                            "state":0},
                            "theta":0.0
                        }
                    }

                    现在有了经纬度，但是怎么用？
                    这些点的数量时而 1个点，时而多个点

                    如果每次都是一个点来
                    想用 SampledPositionProperty 这个属性，每次都进行一次赋值
                    如果某次来了多个点，那就通过循环的方式 也是直接赋值？---》先尝试一下这种方式
                */

                // {
                //     "alive": 1,
                //     "alt": 1435.962426,
                //     "id": 1200,
                //     "lat": 24.239904,
                //     "lon": 120.885654,
                //     "phi": 0.0,
                //     "psi": -1.508752,
                //     "simRadarBeamDto": { },
                //     "theta": 0.266428,
                //     "unitId": 100,
                //     "unitName": "F-35"
                // }

                let data = JSON.parse(res);
                // console.log('welcome data ', res)

                if (data.lat && data.lon && data.alt) {

                    let curPosition = Cesium.Cartesian3.fromDegrees( data.lon, data.lat, data.alt );
                    console.log("curPosition", curPosition);

                    if (this.modelMap.has(data.unitName)) {
                        this.modelMap.get(data.unitName).position = curPosition;
                        this.labelMap.get(data.unitName).updatePosition(Cesium.JulianDate.now(),curPosition);
                        let matrix = this.modelMap.get(data.unitName).computeModelMatrix(Cesium.JulianDate.now());
                        console.log("model.computeModelMatrix------------", this.modelMap.get(data.unitName).computeModelMatrix);
                        console.log("matrix------------", matrix);
                        // this.axisMap.get(data.unitName).modelMatrix = matrix; //this.modelMap.get(data.unitName).computeModelMatrix(Cesium.JulianDate.now());
                        this.axisMap.get(data.unitName).modelMatrix = this.modelMap.get(data.unitName).computeModelMatrix(Cesium.JulianDate.now());
                    } else {
                        let curModel = this.importEntityModel(this.viewer, {
                            position: curPosition,
                            minimumPixelSize: 120,
                            // maximumScale: 2000,
                        });
                        let M = curModel.computeModelMatrix(Cesium.JulianDate.now());
                        let curAxis = showAxis({ modelMatrix: M }, this.viewer.scene);

                        // class addLable(viewer, modelCartesian3, labelOption) {
                        let label = new addLabel(this.viewer, curPosition, { text: data.unitName });

                        this.modelMap.set(data.unitName, curModel);
                        this.labelMap.set(data.unitName, label);
                        this.axisMap.set(data.unitName, curAxis);
                    }

                    if (data.phi || data.psi || data.theta) {
                        /*
                            "phi":0.0,            //偏航 --- 绕 Y 轴，heading
                            "psi":-1.402504,      //俯仰 --- 绕 X 轴， pitch
                            "theta":-0.008625     //滚转 --- 绕 Z 轴， roll
                        */
                        // let curOrientation = HPR2Orientation( curPosition, data.phi, data.psi, data.theta );
                        let heading = data.phi ? data.phi : 0;
                        let pitch = data.psi ? data.psi : 0;
                        let roll = data.theta ? data.theta : 0;
                        let curOrientation = HPR2Orientation(curPosition, heading, pitch, roll);
                        console.log("curOrientation", curOrientation);
                        this.modelMap.get(data.unitName).orientation = curOrientation;

                        // console.log("Cesium.Transforms.eastNorthUpToFixedFrame",Cesium.Transforms.eastNorthUpToFixedFrame)


                        // const hpRoll = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                        // console.log("hpRoll", hpRoll);
                        // const hpRange = new Cesium.HeadingPitchRange();
                        // // let speed = 10;
                        // // const deltaRadians = Cesium.Math.toRadians(3.0);
                        // // let position = Cesium.Cartesian3.fromDegrees( -123.0744619, 44.0503706, 5000.0 );
                        // let speedVector = new Cesium.Cartesian3();
                        // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "north", "west" );

                        // let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
                        //     curPosition,
                        //     hpRoll,
                        //     Cesium.Ellipsoid.WGS84,
                        //     fixedFrameTransform
                        // );

                        // console.log("this.modelMap.get(data.unitName)", this.modelMap.get(data.unitName));



                        // let viewer = this.viewer;
                        // let camera = viewer.camera;
                        // camera.flyTo({
                        //     destination: curPosition,// camera.position,
                        //     orientation: {
                        //         heading: data.phi,
                        //         pitch: data.psi,
                        //         roll: data.theta
                        //     },
                        //     maximumHeight: 10000,
                        //     complete: function () {
                        //         // callback();
                        //         console.log("this.viewer----", viewer);
                        //         viewer.trackedEntity = this.curModel;
                        //     }
                        // });

                    }
                }
            })

            // // 开始连接 socket
            // this.$socket.open();
            // // 订阅事件，testCall 是与后端约定好的名称
            // this.sockets.subscribe('getSimDataEvent', (...res) => {
            //     console.log('召唤成功1111111111111---res', res);
            // })
            // this.$socket.emit('startEvent');
            // 发送消息
            // socketSendmsg(){
            //     this.randomId = Math.random();
            //     // testCall 是与后端约定好的名称
            //     this.$socket.emit('testCall', {
            //         "randomId": this.randomId,
            //         "deviceId": "123456"
            //     });
            // },
            // 发送消息
            // sendMessage() {
            //     this.$socket.emit('hello', '这里是客户端')
            // }
        },
        stop() {
            this.$socket.close()
        },
        movingModel(){
            const viewer = this.viewer;
            const canvas = viewer.canvas;
            canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
            canvas.addEventListener("click", function () {
                canvas.focus();
            });
            canvas.focus();

            const scene = viewer.scene;

            const pathPosition = new Cesium.SampledPositionProperty();
            console.log("pathPosition instanceof Cesium.SampledPositionProperty",pathPosition instanceof Cesium.SampledPositionProperty)

            const entityPath = viewer.entities.add({
            position: pathPosition,
            name: "path",
            path: {
            show: true,
            leadTime: 0,
            trailTime: 60,
            width: 10,
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              taperPower: 0.3,
              color: Cesium.Color.PALEGOLDENROD,
            }),
            },
            });

            const camera = viewer.camera;
            const controller = scene.screenSpaceCameraController;
            let r = 0;

            const hpRoll = new Cesium.HeadingPitchRoll();
            const hpRange = new Cesium.HeadingPitchRange();
            let speed = 10;
            const deltaRadians = Cesium.Math.toRadians(3.0);
            let position = Cesium.Cartesian3.fromDegrees( -123.0744619, 44.0503706, 5000.0 );
            let speedVector = new Cesium.Cartesian3();
            const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "north", "west" );

            const planePrimitive = scene.primitives.add(
              Cesium.Model.fromGltf({
                  url: "./models/CesiumAir/Cesium_Air.glb",
                  modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
                      position,
                      hpRoll,
                      Cesium.Ellipsoid.WGS84,
                      fixedFrameTransform
                  ),
                  minimumPixelSize: 128,
              })
            );

            planePrimitive.readyPromise.then(function (model) {
              // Play and loop all animations at half-speed
              model.activeAnimations.addAll({
                  multiplier: 0.5,
                  loop: Cesium.ModelAnimationLoop.REPEAT,
              });

              // Zoom to model
              r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
              controller.minimumZoomDistance = r * 0.5;
              const center = model.boundingSphere.center;
              const heading = Cesium.Math.toRadians(230.0);
              const pitch = Cesium.Math.toRadians(-20.0);
              hpRange.heading = heading;
              hpRange.pitch = pitch;
              hpRange.range = r * 50.0;
              camera.lookAt(center, hpRange);
            });

            /*  */
            let { positionForRadar } = RadarReconnaossance(viewer, { position: pathPosition });
            positionForRadar = pathPosition;
            /*  */
            document.addEventListener("keydown", function (e) {
              switch (e.keyCode) {
                  case 40:
                      if (e.shiftKey) {
                          // speed down
                          speed = Math.max(--speed, 1);
                      } else {
                          // pitch down
                          hpRoll.pitch -= deltaRadians;
                          if (hpRoll.pitch < -Cesium.Math.TWO_PI) {
                              hpRoll.pitch += Cesium.Math.TWO_PI;
                          }
                      }
                      break;
                  case 38:
                      if (e.shiftKey) {
                          // speed up
                          speed = Math.min(++speed, 100);
                      } else {
                          // pitch up
                          hpRoll.pitch += deltaRadians;
                          if (hpRoll.pitch > Cesium.Math.TWO_PI) {
                              hpRoll.pitch -= Cesium.Math.TWO_PI;
                          }
                      }
                      break;
                  case 39:
                      if (e.shiftKey) {
                          // roll right
                          hpRoll.roll += deltaRadians;
                          if (hpRoll.roll > Cesium.Math.TWO_PI) {
                              hpRoll.roll -= Cesium.Math.TWO_PI;
                          }
                      } else {
                          // turn right
                          hpRoll.heading += deltaRadians;
                          if (hpRoll.heading > Cesium.Math.TWO_PI) {
                              hpRoll.heading -= Cesium.Math.TWO_PI;
                          }
                      }
                      break;
                  case 37:
                      if (e.shiftKey) {
                          // roll left until
                          hpRoll.roll -= deltaRadians;
                          if (hpRoll.roll < 0.0) {
                          hpRoll.roll += Cesium.Math.TWO_PI;
                          }
                      } else {
                          // turn left
                          hpRoll.heading -= deltaRadians;
                          if (hpRoll.heading < 0.0) {
                          hpRoll.heading += Cesium.Math.TWO_PI;
                          }
                      }
                      break;
                  default:
              }
            });

            console.log("addEventListener---viewer.scene.preUpdate", viewer.scene.preUpdate);
            viewer.scene.preUpdate.addEventListener(function (scene, time) {
            speedVector = Cesium.Cartesian3.multiplyByScalar(
              Cesium.Cartesian3.UNIT_X,
              speed / 10,
              speedVector
            );
            position = Cesium.Matrix4.multiplyByPoint(
              planePrimitive.modelMatrix,
              speedVector,
              position
            );

            pathPosition.addSample(Cesium.JulianDate.now(), position);

            Cesium.Transforms.headingPitchRollToFixedFrame(
              position,
              hpRoll,
              Cesium.Ellipsoid.WGS84,
              fixedFrameTransform,
              planePrimitive.modelMatrix
            );

              //   if (fromBehind.checked) {
              //     // Zoom to model
              //     const center = planePrimitive.boundingSphere.center;
              //     hpRange.heading = hpRoll.heading;
              //     hpRange.pitch = hpRoll.pitch;
              //     camera.lookAt(center, hpRange);
              //   }
            });

        },
        importEntityModel(viewer,option) {
            // 如果 position数据 不是 Cesium.SampledPositionProperty 的实例--》 entity 如何设置 orientation
            let position = option && option.position ? option.position : null;
            let modelSrc = option&&option.modelSrc ? option.modelSrc : "./models/CesiumAir/Cesium_Air.glb";
            let minimumPixelSize = option&&option.minimumPixelSize ? option.minimumPixelSize : 200;
            let maximumScale = option&&option.maximumScale ? option.maximumScale : 20000;
            if (!position) { this.$message.error(" position 为必传 ！！！"); return; };

            let entityModel;
            // 这一步还是要分吗？  要分：因为设置 orientation 的方式不一样
            if (position instanceof Cesium.SampledPositionProperty) {

                entityModel = viewer.entities.add({
                    name: modelSrc,
                    position: position,
                    orientation: new Cesium.VelocityOrientationProperty(position),
                    model: {
                        uri: modelSrc,
                        // scale:290000,// 设定模型放大倍数                                                A numeric Property specifying a uniform linear scale.
                        minimumPixelSize: minimumPixelSize,// 模型的最小 in pixel                                   A numeric Property specifying the approximate minimum pixel size of the model regardless of zoom.
                        maximumScale: maximumScale,// 模型被放大的最大值                                       The maximum scale size of a model. An upper limit for minimumPixelSize.
                        heightReference: Cesium.HeightReference.NONE,// 设置model 的 height 属性的参考 A Property specifying what the height is relative to.
                        silhouetteColor: getColor( 'white', 0.8 ), // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                        silhouetteSize: 4.6,// 设置model的轮廓的宽度 in pixel                          A numeric Property specifying the size of the silhouette in pixels.
                        color: getColor('white', 1.0),// 设置模型blend颜色                            A Property specifying the Color that blends with the model's rendered color.
                        colorBlendMode: getColorBlendMode('highlight'),//设置 color 生效(混合)的方式   An enum Property specifying how the color blends with the model.
                        // colorBlendAmount: parseFloat(viewModel.colorBlendAmount),
                        colorBlendAmount: 0.6,//  {useful when colorBlendMode is MIX} A numeric Property specifying the color strength when the colorBlendMode is MIX. A value of 0.0 results in the model's rendered color while a value of 1.0 results in a solid color, with any value in-between resulting in a mix of the two.
                        distanceDisplayCondition: null,//new Cesium.DistanceDisplayCondition(near, far),// A Property specifying at what distance from the camera that this model will be displayed.

                        nodeTransformations: null,// [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                        articulations: null,//  [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                        clippingPlanes:null,// [not usual] new Cesium.ClippingPlaneCollection(options) // 	A property specifying the ClippingPlaneCollection used to selectively disable rendering the model.
                        lightColor: null,// Cesium.Color.RED // [not usual] A property specifying the light color when shading the model. When undefined the scene's light color is used instead.
                        imageBasedLightingFactor: new Cesium.Cartesian2(1.0, 1.0),// [not usual] A property specifying the contribution from diffuse and specular image-based lighting.
                        clampAnimations: true,// [not usual] A boolean Property specifying if glTF animations should hold the last pose for time durations with no keyframes.
                        shadows: Cesium.ShadowMode.ENABLED,//  [not usual] An enum Property specifying whether the model casts or receives shadows from light sources.
                        incrementallyLoadTextures: true,//   [not usual] Determine if textures may continue to stream in after the model is loaded.
                    },
                });

                function getColorBlendMode(colorBlendMode) {
                    return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
                }
                function getColor(colorName, alpha) {
                    const color = Cesium.Color[colorName.toUpperCase()];
                    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
                }

                // 这一步大概率就是在函数外面写了
                // let pos = 0;
                // viewer.scene.preUpdate.addEventListener(function (scene, time) {
                //     if (pos < flightData.length) {
                //         const dataPoint = flightData[pos];
                //         const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
                //         pathPosition.addSample(Cesium.JulianDate.now(), position);
                //         pos++;
                //     }
                // });
            } else {
                // const scene = viewer.scene;
                // const camera = viewer.camera;
                // let r = 0;
                // const hpRange = new Cesium.HeadingPitchRange();
                // const deltaRadians = Cesium.Math.toRadians(3.0);
                // let speedVector = new Cesium.Cartesian3();
                // let speed = 10;//暂时未生效

                // /* 引入模型 ---》 //! 这一步先进行对比验证*/
                // const hpRoll = new Cesium.HeadingPitchRoll();
                // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");


                entityModel = viewer.entities.add({
                    name: modelSrc,
                    position: position,
                    // orientation: orientation,
                    model: {
                        uri: modelSrc,
                        // scale:290000,// 设定模型放大倍数                                                A numeric Property specifying a uniform linear scale.
                        minimumPixelSize: minimumPixelSize,// 模型的最小 in pixel                                   A numeric Property specifying the approximate minimum pixel size of the model regardless of zoom.
                        maximumScale: maximumScale,// 模型被放大的最大值                                            The maximum scale size of a model. An upper limit for minimumPixelSize.
                        heightReference: Cesium.HeightReference.NONE,// 设置model 的 height 属性的参考 A Property specifying what the height is relative to.
                        silhouetteColor: getColor( 'white', 0.8 ), // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                        silhouetteSize: 4.6,// 设置model的轮廓的宽度 in pixel                          A numeric Property specifying the size of the silhouette in pixels.
                        color: getColor('white', 1.0),// 设置模型blend颜色                            A Property specifying the Color that blends with the model's rendered color.
                        colorBlendMode: getColorBlendMode('highlight'),//设置 color 生效(混合)的方式   An enum Property specifying how the color blends with the model.
                        // colorBlendAmount: parseFloat(viewModel.colorBlendAmount),
                        colorBlendAmount: 0.6,//  {useful when colorBlendMode is MIX} A numeric Property specifying the color strength when the colorBlendMode is MIX. A value of 0.0 results in the model's rendered color while a value of 1.0 results in a solid color, with any value in-between resulting in a mix of the two.
                        distanceDisplayCondition: null,//new Cesium.DistanceDisplayCondition(near, far),// A Property specifying at what distance from the camera that this model will be displayed.

                        nodeTransformations: null,// [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                        articulations: null,//  [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                        clippingPlanes:null,// [not usual] new Cesium.ClippingPlaneCollection(options) // 	A property specifying the ClippingPlaneCollection used to selectively disable rendering the model.
                        lightColor: null,// Cesium.Color.RED // [not usual] A property specifying the light color when shading the model. When undefined the scene's light color is used instead.
                        imageBasedLightingFactor: new Cesium.Cartesian2(1.0, 1.0),// [not usual] A property specifying the contribution from diffuse and specular image-based lighting.
                        clampAnimations: true,// [not usual] A boolean Property specifying if glTF animations should hold the last pose for time durations with no keyframes.
                        shadows: Cesium.ShadowMode.ENABLED,//  [not usual] An enum Property specifying whether the model casts or receives shadows from light sources.
                        incrementallyLoadTextures: true,//   [not usual] Determine if textures may continue to stream in after the model is loaded.
                    },
                });
                // console.log("entityModel", entityModel);
                if (option && option.orientation) {
                    entityModel.orientation = option.orientation;
                }

                function getColorBlendMode(colorBlendMode) {
                    return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
                }
                function getColor(colorName, alpha) {
                    const color = Cesium.Color[colorName.toUpperCase()];
                    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
                }

                // 这一步大概率就是在函数外面写了
                // let pos = 0;
                // viewer.scene.preUpdate.addEventListener(function (scene, time) {
                //     if (pos < flightData.length) {
                //         const dataPoint = flightData[pos];
                //         const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
                //         pathPosition.addSample(Cesium.JulianDate.now(), position);
                //         pos++;
                //     }
                // });
            }

            return entityModel;

        },
        planeInReconnaossance(viewer,option) {
            if (!viewer) { alert('planeInReconnaossance 必须传入 viewer'); return; }
            let operational = option && option.operational ? option.operational : true;
            let speed = option && option.speed ? option.speed : 10;
            let radar = option && option.radar ? option.radar : true;
            let lengthOfTail = option && option.lengthOfTail ? option.lengthOfTail : 800;


            const canvas = viewer.canvas;
            canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
            canvas.addEventListener("click", function () {
                canvas.focus();
            });
            canvas.focus();

            const scene = viewer.scene;

            const pathPosition = new Cesium.SampledPositionProperty();
            let pathPosition_Time = [];
            // console.log("pathPosition", pathPosition);
            /* 雷达模型 */
            if (radar) {
                let { positionForRadar } = RadarReconnaossance(viewer, {
                    position: pathPosition,
                });
                positionForRadar = pathPosition;//这里必须有，因为用了 Cesium.SampledPositionProperty
            }
            /* 雷达模型 */


            const camera = viewer.camera;
            const controller = scene.screenSpaceCameraController;
            let r = 0;

            const hpRange = new Cesium.HeadingPitchRange();
            const deltaRadians = Cesium.Math.toRadians(3.0);
            let speedVector = new Cesium.Cartesian3();

            /* 引入模型 ---》 //! 这一步先进行对比验证*/
            let modelSrc = option&&option.modelSrc ? option.modelSrc : "./models/CesiumAir/Cesium_Air.glb";
            let position = option&&option.modelPos ? option.modelPos : Cesium.Cartesian3.fromDegrees( -123.0744619, 44.0503706, 5000.0 );
            const hpRoll = new Cesium.HeadingPitchRoll();
            const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");
            const planePrimitive = scene.primitives.add(
                Cesium.Model.fromGltf({
                    url: modelSrc,
                    modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
                        position,
                        hpRoll,
                        Cesium.Ellipsoid.WGS84,
                        fixedFrameTransform
                    ),
                    minimumPixelSize: 128,
                    maximumScale:200,
                })
            );
            /* 引入模型 */

            // /* 显示当前模型对应的坐标轴 */
            // // console.log("Cesium.DebugModelMatrixPrimitive", Cesium.DebugModelMatrixPrimitive);
            // const modelMatrix = planePrimitive.modelMatrix;
            // let modelMatrixPrimitive = new Cesium.DebugModelMatrixPrimitive({
            //     modelMatrix: modelMatrix,
            // });
            // modelMatrixPrimitive.length = 1000;// default 10000000
            // scene.primitives.add(modelMatrixPrimitive);
            // /* 显示当前模型对应的坐标轴 */




            planePrimitive.readyPromise.then(function (model) {
                // Play and loop all animations at half-speed
                model.activeAnimations.addAll({
                    multiplier: 0.5,
                    loop: Cesium.ModelAnimationLoop.REPEAT,
                });

                // Zoom to model
                r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
                controller.minimumZoomDistance = r * 0.5;
                const center = model.boundingSphere.center;
                const heading = Cesium.Math.toRadians(230.0);
                const pitch = Cesium.Math.toRadians(-20.0);
                hpRange.heading = heading;
                hpRange.pitch = pitch;
                hpRange.range = r * 50.0;
                camera.lookAt(center, hpRange);
            });

            // 通过上下左右键控制 飞机 前进方向并一直沿着该方向前进
            if (operational) {
                document.addEventListener("keydown", function (e) {
                    switch (e.keyCode) {
                        case 40:
                            if (e.shiftKey) {
                                // speed down
                                speed = Math.max(--speed, 1);
                            } else {
                                // pitch down
                                hpRoll.pitch -= deltaRadians;
                                if (hpRoll.pitch < -Cesium.Math.TWO_PI) {
                                    hpRoll.pitch += Cesium.Math.TWO_PI;
                                }
                            }
                            break;
                        case 38:
                            if (e.shiftKey) {
                                // speed up
                                speed = Math.min(++speed, 100);
                            } else {
                                // pitch up
                                hpRoll.pitch += deltaRadians;
                                if (hpRoll.pitch > Cesium.Math.TWO_PI) {
                                    hpRoll.pitch -= Cesium.Math.TWO_PI;
                                }
                            }
                            break;
                        case 39:
                            if (e.shiftKey) {
                                // roll right
                                hpRoll.roll += deltaRadians;
                                if (hpRoll.roll > Cesium.Math.TWO_PI) {
                                    hpRoll.roll -= Cesium.Math.TWO_PI;
                                }
                            } else {
                                // turn right
                                hpRoll.heading += deltaRadians;
                                if (hpRoll.heading > Cesium.Math.TWO_PI) {
                                    hpRoll.heading -= Cesium.Math.TWO_PI;
                                }
                            }
                            break;
                        case 37:
                            if (e.shiftKey) {
                                // roll left until
                                hpRoll.roll -= deltaRadians;
                                if (hpRoll.roll < 0.0) {
                                    hpRoll.roll += Cesium.Math.TWO_PI;
                                }
                            } else {
                                // turn left
                                hpRoll.heading -= deltaRadians;
                                if (hpRoll.heading < 0.0) {
                                    hpRoll.heading += Cesium.Math.TWO_PI;
                                }
                            }
                            break;
                        default:
                    }
                });
            }


            /* 侦查机尾线 */
            // 一
            const entityPath = viewer.entities.add({
                position: pathPosition,
                name: "path",
                path: {
                    show: true,
                    leadTime: 0,
                    trailTime: 60,
                    width: 10,
                    resolution: 1,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.3,
                        taperPower: 0.3,
                        color: Cesium.Color.PALEGOLDENROD,
                    }),
                },
            });
            /* 侦查机尾线 */


            // 让 飞机/雷达模型/position 实时变化的函数
            // viewer.scene.preUpdate.addEventListener(function (scene, time) {
            //     speedVector = Cesium.Cartesian3.multiplyByScalar(
            //         Cesium.Cartesian3.UNIT_X,
            //         speed / 10,
            //         speedVector
            //     );
            //     position = Cesium.Matrix4.multiplyByPoint(
            //         planePrimitive.modelMatrix,
            //         speedVector,
            //         position
            //     );

            //     if (pathPosition._property._values.length > lengthOfTail) {
            //         let curVal = pathPosition_Time.shift();
            //         pathPosition.removeSample(curVal)
            //     }

            //     let curTime = Cesium.JulianDate.now();
            //     pathPosition.addSample(curTime, position);
            //     pathPosition_Time.push(curTime)
            //     // pathPosition.addSample(Cesium.JulianDate.now(), position);
            //     // pathPosition_Time.push(Cesium.JulianDate.now())


            //     // posForTail.push(position);
            //     // if (posForTail.length > 5) {
            //     //     if (posForTail.length > 1000) {
            //     //         posForTail.shift();
            //     //     }
            //     //     // planeTail.createTailByFadeType(viewer, posForTail);
            //     //     // posForTail = pathPosition;
            //     // }


            //     Cesium.Transforms.headingPitchRollToFixedFrame(
            //         position,
            //         hpRoll,
            //         Cesium.Ellipsoid.WGS84,
            //         fixedFrameTransform,
            //         planePrimitive.modelMatrix
            //     );


            //     //   if (fromBehind.checked) {
            //     //     // Zoom to model
            //     //     const center = planePrimitive.boundingSphere.center;
            //     //     hpRange.heading = hpRoll.heading;
            //     //     hpRange.pitch = hpRoll.pitch;
            //     //     camera.lookAt(center, hpRange);
            //     //   }
            // });
        },

        movePolylineDemo() {
            let positions = [];
            positions.push(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0));
            positions.push(Cesium.Cartesian3.fromDegrees(-103.0744619, 44.0503706, 5000.0));

            let line = this.viewer.entities.add({
                name: "line on terrain",
                polyline: {
                    positions: positions,
                    width: 2,
                    material: Cesium.Color.BLACK,
                    // clampToGround: true,
                },
            });

            return line;
        },
    },
    created() {
        this.modelMap = new Map();
        this.labelMap = new Map();
        this.axisMap = new Map();
    },
    mounted() {
        Cesium.Ion.defaultAccessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo";

        let viewer = new Cesium.Viewer("cesiumContainer", {
            shouldAnimate: true, //有动画
            animation: false,  //动画控制不显示
            timeline: false,    //时间线不显示
            // fullscreenButton: false, //全屏按钮不显示
            // infoBox: false
            // selectionIndicator: true,
        });
        this.viewer = viewer;

        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        this.cesiumHandler = handler;

        antiAliasing(viewer); // 抗锯齿
        preventCameraIntoUnderground(viewer);//让相机不能进入地球内部---不然飞机模型的扫描区域的地下部分可以被很明显的看见
        // viewer.extend(Cesium.viewerCesiumInspectorMixin); //

        let line = this.movePolylineDemo();

        let positions = [];
        positions.push(Cesium.Cartesian3.fromDegrees(123.0744619, 44.0503706, 5000.0));
        positions.push(Cesium.Cartesian3.fromDegrees(103.0744619, 44.0503706, 5000.0));

        line.positions = positions;

        // 创建一个demo，侦查机侦查的雷达扫描范围
        // this.movingModel();
        // let positions = new Cesium.SampledPositionProperty();
        // let positions = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0);
        // this.curModel = this.importEntityModel(viewer, {
        //     position: positions,
        //     minimumPixelSize: 120,
        //     // maximumScale: 2000,
        // });
        // console.log("this.curModel", this.curModel);
        // viewer.scene.preUpdate.addEventListener(function (scene, time) {
        //     if (pos < flightData.length) {
        //         const dataPoint = flightData[pos];
        //         const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
        //         pathPosition.addSample(Cesium.JulianDate.now(), position);
        //         pos++;
        //     }
        // });



        // 通过引入图片的方式创建新的 material
        // let newMaterialName = createCustomMaterialImg({
        //     img: "./imgs/blue.png",
        //     type: 'PolylineBlueColor',//type的命名规则： polyline/polygon/图元名称 + 描述(根据具体特性)
        //     // diffuse: 4.0,// 这个值为 1 或者 小于 1 ，成为白色；  大于 1，颜色表面增加一层灰度； 默认 2.0；
        //     // animationSpeed:0.5,// 动画效果的速率，必须大于0。 大于 1 相当于 加速相应倍数； 大于 0 小于 1 相当于 减慢 相应倍数
        //     glowPower: 0.1,// 暂时不好使
        //     taperPower: 0.1// 暂时不好使
        // });
        // "./imgs/pureWhite.png";
        // "./imgs/white.png";
        // "./imgs/mixColor.png";
        // "./imgs/blue.png";
        // "./imgs/colors.png";



        // this.planeInReconnaossance(viewer);
        // planeInReconnaossance(viewer, {
        //     speed: 100,
        //     lengthOfTail: 300,
        //     showAxis: false,// 默认是 false
        //     tail: {
        //         material: new Cesium[newMaterialName](Cesium.Color.WHITE, 3000, 1),
        //         length:90000,
        //     }
        // });

    },

    beforeDestroy(){
        // 关闭 Socket
        // this.sockets.unsubscribe('getSimDataEvent');
        this.$socket.close()
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.stopBtn{
    margin-left: 80px !important;
}
div#cesiumContainer {
    height: 100vh;
    width: 100vw;
}

.Btn {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
}
</style>
