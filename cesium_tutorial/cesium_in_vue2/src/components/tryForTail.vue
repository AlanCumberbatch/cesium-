<template>
    <div>
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
import addEntityModel from "../utils/entity/addEntityModel.js";
// ---
// import wind3D from "../utils/wind3D/wind3D.js";
// import gui from "../utils/wind3D/gui.js";
// ---
import CustomPrimitive from "../utils/customPrimitive.js";


export default {
    name: "modelInstanceCollection",
    data() {
        return {
            curModel: null,
            viewer: null,
            cesiumHandler: null,
            sectorEntity: {},
            sectorDegree: 60,
            radius: 100000.0,
            innerRadius: 10.0,
            heading: 10.0,
            position: null,
            modelMap: null,
            labelMap: null,
            axisMap: null,
            staticMap: null,
            groundRadarMap: null,
            searcher2TargetLine: null,
            // 用于将得到的 position 插值 并的得到数据
            twoPointMap: null,
            interpolatedPosMap: null,
            timeStap: null,
            timeStapMap: null,
            speed: 1,
        };
    },
    methods: {
        movingModel() {
            const viewer = this.viewer;
            const canvas = viewer.canvas;
            canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
            canvas.addEventListener("click", function () {
                canvas.focus();
            });
            canvas.focus();

            const scene = viewer.scene;

            const pathPosition = new Cesium.SampledPositionProperty();
            console.log(
                "pathPosition instanceof Cesium.SampledPositionProperty",
                pathPosition instanceof Cesium.SampledPositionProperty
            );

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
            let position = Cesium.Cartesian3.fromDegrees(
                -123.0744619,
                44.0503706,
                5000.0
            );
            let speedVector = new Cesium.Cartesian3();
            const fixedFrameTransform =
                Cesium.Transforms.localFrameToFixedFrameGenerator(
                    "north",
                    "west"
                );

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
                r =
                    2.0 *
                    Math.max(model.boundingSphere.radius, camera.frustum.near);
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
            let { positionForRadar } = RadarReconnaossance(viewer, {
                position: pathPosition,
            });
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

            // console.log(
            //     "addEventListener---viewer.scene.preUpdate",
            //     viewer.scene.preUpdate
            // );
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
        importEntityModel(viewer, option) {
            // 如果 position数据 不是 Cesium.SampledPositionProperty 的实例--》 entity 如何设置 orientation
            let position = option && option.position ? option.position : null;
            let modelSrc =
                option && option.modelSrc
                    ? option.modelSrc
                    : "./models/CesiumAir/Cesium_Air.glb";
            let minimumPixelSize =
                option && option.minimumPixelSize
                    ? option.minimumPixelSize
                    : 200;
            let maximumScale =
                option && option.maximumScale ? option.maximumScale : 20000;
            if (!position) {
                this.$message.error(" position 为必传 ！！！");
                return;
            }

            let entityModel;
            // 这一步还是要分吗？  要分：因为设置 orientation 的方式不一样
            if (position instanceof Cesium.SampledPositionProperty) {
                entityModel = viewer.entities.add({
                    name: modelSrc,
                    position: position,
                    orientation: new Cesium.VelocityOrientationProperty(
                        position
                    ),
                    model: {
                        uri: modelSrc,
                        // scale:290000,// 设定模型放大倍数                                                A numeric Property specifying a uniform linear scale.
                        minimumPixelSize: minimumPixelSize, // 模型的最小 in pixel                                   A numeric Property specifying the approximate minimum pixel size of the model regardless of zoom.
                        maximumScale: maximumScale, // 模型被放大的最大值                                       The maximum scale size of a model. An upper limit for minimumPixelSize.
                        heightReference: Cesium.HeightReference.NONE, // 设置model 的 height 属性的参考 A Property specifying what the height is relative to.
                        silhouetteColor: getColor("white", 0.8), // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                        silhouetteSize: 4.6, // 设置model的轮廓的宽度 in pixel                          A numeric Property specifying the size of the silhouette in pixels.
                        color: getColor("white", 1.0), // 设置模型blend颜色                            A Property specifying the Color that blends with the model's rendered color.
                        colorBlendMode: getColorBlendMode("highlight"), //设置 color 生效(混合)的方式   An enum Property specifying how the color blends with the model.
                        // colorBlendAmount: parseFloat(viewModel.colorBlendAmount),
                        colorBlendAmount: 0.6, //  {useful when colorBlendMode is MIX} A numeric Property specifying the color strength when the colorBlendMode is MIX. A value of 0.0 results in the model's rendered color while a value of 1.0 results in a solid color, with any value in-between resulting in a mix of the two.
                        distanceDisplayCondition: null, //new Cesium.DistanceDisplayCondition(near, far),// A Property specifying at what distance from the camera that this model will be displayed.

                        nodeTransformations: null, // [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                        articulations: null, //  [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                        clippingPlanes: null, // [not usual] new Cesium.ClippingPlaneCollection(options) // 	A property specifying the ClippingPlaneCollection used to selectively disable rendering the model.
                        lightColor: null, // Cesium.Color.RED // [not usual] A property specifying the light color when shading the model. When undefined the scene's light color is used instead.
                        imageBasedLightingFactor: new Cesium.Cartesian2(
                            1.0,
                            1.0
                        ), // [not usual] A property specifying the contribution from diffuse and specular image-based lighting.
                        clampAnimations: true, // [not usual] A boolean Property specifying if glTF animations should hold the last pose for time durations with no keyframes.
                        shadows: Cesium.ShadowMode.ENABLED, //  [not usual] An enum Property specifying whether the model casts or receives shadows from light sources.
                        incrementallyLoadTextures: true, //   [not usual] Determine if textures may continue to stream in after the model is loaded.
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
                        minimumPixelSize: minimumPixelSize, // 模型的最小 in pixel                                   A numeric Property specifying the approximate minimum pixel size of the model regardless of zoom.
                        maximumScale: maximumScale, // 模型被放大的最大值                                            The maximum scale size of a model. An upper limit for minimumPixelSize.
                        heightReference: Cesium.HeightReference.NONE, // 设置model 的 height 属性的参考 A Property specifying what the height is relative to.
                        silhouetteColor: getColor("white", 0.8), // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                        silhouetteSize: 4.6, // 设置model的轮廓的宽度 in pixel                          A numeric Property specifying the size of the silhouette in pixels.
                        color: getColor("white", 1.0), // 设置模型blend颜色                            A Property specifying the Color that blends with the model's rendered color.
                        colorBlendMode: getColorBlendMode("highlight"), //设置 color 生效(混合)的方式   An enum Property specifying how the color blends with the model.
                        // colorBlendAmount: parseFloat(viewModel.colorBlendAmount),
                        colorBlendAmount: 0.6, //  {useful when colorBlendMode is MIX} A numeric Property specifying the color strength when the colorBlendMode is MIX. A value of 0.0 results in the model's rendered color while a value of 1.0 results in a solid color, with any value in-between resulting in a mix of the two.
                        distanceDisplayCondition: null, //new Cesium.DistanceDisplayCondition(near, far),// A Property specifying at what distance from the camera that this model will be displayed.

                        nodeTransformations: null, // [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                        articulations: null, //  [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                        clippingPlanes: null, // [not usual] new Cesium.ClippingPlaneCollection(options) // 	A property specifying the ClippingPlaneCollection used to selectively disable rendering the model.
                        lightColor: null, // Cesium.Color.RED // [not usual] A property specifying the light color when shading the model. When undefined the scene's light color is used instead.
                        imageBasedLightingFactor: new Cesium.Cartesian2(
                            1.0,
                            1.0
                        ), // [not usual] A property specifying the contribution from diffuse and specular image-based lighting.
                        clampAnimations: true, // [not usual] A boolean Property specifying if glTF animations should hold the last pose for time durations with no keyframes.
                        shadows: Cesium.ShadowMode.ENABLED, //  [not usual] An enum Property specifying whether the model casts or receives shadows from light sources.
                        incrementallyLoadTextures: true, //   [not usual] Determine if textures may continue to stream in after the model is loaded.
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

        planeInReconnaossance(viewer, option) {
            if (!viewer) {
                alert("planeInReconnaossance 必须传入 viewer");
                return;
            }
            let operational =
                option && option.operational ? option.operational : true;
            let speed = option && option.speed ? option.speed : 10;
            let radar = option && option.radar ? option.radar : true;
            let lengthOfTail =
                option && option.lengthOfTail ? option.lengthOfTail : 800;

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
                positionForRadar = pathPosition; //这里必须有，因为用了 Cesium.SampledPositionProperty
            }
            /* 雷达模型 */

            const camera = viewer.camera;
            const controller = scene.screenSpaceCameraController;
            let r = 0;

            const hpRange = new Cesium.HeadingPitchRange();
            const deltaRadians = Cesium.Math.toRadians(3.0);
            let speedVector = new Cesium.Cartesian3();

            /* 引入模型 ---》 //! 这一步先进行对比验证*/
            let modelSrc =
                option && option.modelSrc
                    ? option.modelSrc
                    : "./models/CesiumAir/Cesium_Air.glb";
            let position =
                option && option.modelPos
                    ? option.modelPos
                    : Cesium.Cartesian3.fromDegrees(
                        -123.0744619,
                        44.0503706,
                        5000.0
                    );
            const hpRoll = new Cesium.HeadingPitchRoll();
            const fixedFrameTransform =
                Cesium.Transforms.localFrameToFixedFrameGenerator(
                    "north",
                    "west"
                );
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
                    maximumScale: 200,
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
                r =
                    2.0 *
                    Math.max(model.boundingSphere.radius, camera.frustum.near);
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


        tryParticleSystem_Demo(viewer) {
            const scene = viewer.scene;
            scene.debugShowFramesPerSecond = true;

            Cesium.Math.setRandomNumberSeed(315);

            const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
                Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883)
            );
            const emitterInitialLocation = new Cesium.Cartesian3(0.0, 0.0, 100.0);

            let particleCanvas;

            function getImage() {
                if (!Cesium.defined(particleCanvas)) {
                    particleCanvas = document.createElement("canvas");
                    particleCanvas.width = 20;
                    particleCanvas.height = 20;
                    const context2D = particleCanvas.getContext("2d");
                    context2D.beginPath();
                    context2D.arc(8, 8, 8, 0, Cesium.Math.TWO_PI, true);
                    context2D.closePath();
                    // context2D.strokeRect(50,50,200,50);
                    context2D.fillStyle = "rgb(255, 255, 255)";
                    context2D.fill();
                }
                return particleCanvas;
            }

            const minimumExplosionSize = 30.0;
            const maximumExplosionSize = 100.0;
            const particlePixelSize = new Cesium.Cartesian2(7.0, 7.0);
            const burstSize = 400.0;
            const lifetime = 10.0;
            const numberOfFireworks = 20.0;

            const emitterModelMatrixScratch = new Cesium.Matrix4();

            function createFirework(offset, color, bursts) {
                const position = Cesium.Cartesian3.add(
                    emitterInitialLocation,
                    offset,
                    new Cesium.Cartesian3()
                );
                const emitterModelMatrix = Cesium.Matrix4.fromTranslation(
                    position,
                    emitterModelMatrixScratch
                );
                const particleToWorld = Cesium.Matrix4.multiply(
                    modelMatrix,
                    emitterModelMatrix,
                    new Cesium.Matrix4()
                );
                const worldToParticle = Cesium.Matrix4.inverseTransformation(
                    particleToWorld,
                    particleToWorld
                );

                const size = Cesium.Math.randomBetween(
                    minimumExplosionSize,
                    maximumExplosionSize
                );
                const particlePositionScratch = new Cesium.Cartesian3();
                const force = function (particle) {
                    const position = Cesium.Matrix4.multiplyByPoint(
                        worldToParticle,
                        particle.position,
                        particlePositionScratch
                    );
                    if (
                        Cesium.Cartesian3.magnitudeSquared(position) >=
                        size * size
                    ) {
                        Cesium.Cartesian3.clone(
                            Cesium.Cartesian3.ZERO,
                            particle.velocity
                        );
                    }
                };

                const normalSize =
                    (size - minimumExplosionSize) /
                    (maximumExplosionSize - minimumExplosionSize);
                const minLife = 0.3;
                const maxLife = 1.0;
                const life = normalSize * (maxLife - minLife) + minLife;

                scene.primitives.add(
                    new Cesium.ParticleSystem({
                        image: getImage(),
                        startColor: color,
                        endColor: color.withAlpha(0.0),
                        particleLife: life,
                        speed: 100.0,
                        imageSize: particlePixelSize,
                        emissionRate: 0,
                        emitter: new Cesium.SphereEmitter(0.1),
                        bursts: bursts,
                        lifetime: lifetime,
                        updateCallback: force,
                        modelMatrix: modelMatrix,
                        emitterModelMatrix: emitterModelMatrix,
                    })
                );
            }

            const xMin = -100.0;
            const xMax = 100.0;
            const yMin = -80.0;
            const yMax = 100.0;
            const zMin = -50.0;
            const zMax = 50.0;

            const colorOptions = [
                {
                    minimumRed: 0.75,
                    green: 0.0,
                    minimumBlue: 0.8,
                    alpha: 1.0,
                },
                {
                    red: 0.0,
                    minimumGreen: 0.75,
                    minimumBlue: 0.8,
                    alpha: 1.0,
                },
                {
                    red: 0.0,
                    green: 0.0,
                    minimumBlue: 0.8,
                    alpha: 1.0,
                },
                {
                    minimumRed: 0.75,
                    minimumGreen: 0.75,
                    blue: 0.0,
                    alpha: 1.0,
                },
            ];

            for (let i = 0; i < numberOfFireworks; ++i) {
                const x = Cesium.Math.randomBetween(xMin, xMax);
                const y = Cesium.Math.randomBetween(yMin, yMax);
                const z = Cesium.Math.randomBetween(zMin, zMax);
                const offset = new Cesium.Cartesian3(x, y, z);
                const color = Cesium.Color.fromRandom(
                    colorOptions[i % colorOptions.length]
                );

                const bursts = [];
                for (let j = 0; j < 3; ++j) {
                    bursts.push(
                        new Cesium.ParticleBurst({
                            time: Cesium.Math.nextRandomNumber() * lifetime,
                            minimum: burstSize,
                            maximum: burstSize,
                        })
                    );
                }

                createFirework(offset, color, bursts);
            }

            const camera = viewer.scene.camera;
            const cameraOffset = new Cesium.Cartesian3(-300.0, 0.0, 0.0);
            camera.lookAtTransform(modelMatrix, cameraOffset);
            camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

            const toFireworks = Cesium.Cartesian3.subtract(
                emitterInitialLocation,
                cameraOffset,
                new Cesium.Cartesian3()
            );
            Cesium.Cartesian3.normalize(toFireworks, toFireworks);
            const angle =
                Cesium.Math.PI_OVER_TWO -
                Math.acos(
                    Cesium.Cartesian3.dot(toFireworks, Cesium.Cartesian3.UNIT_Z)
                );
            camera.lookUp(angle);
        },

        // drawCommand + customPrimitive demo
        createSegmentsGeometry() {
            let userInput = {

            };

            const repeatVertex = 6;
            var st = [];
            for (var s = 0; s < userInput.particlesTextureSize; s++) {
                for (var t = 0; t < userInput.particlesTextureSize; t++) {
                    for (var i = 0; i < repeatVertex; i++) {
                        st.push(s / userInput.particlesTextureSize);
                        st.push(t / userInput.particlesTextureSize);
                    }
                }
            }
            st = new Float32Array(st);

            var normal = [];
            const pointToUse = [-1, 0, 1];
            const offsetSign = [-1, 1];
            for (var i = 0; i < userInput.maxParticles; i++) {
                for (var j = 0; j < pointToUse.length; j++) {
                    for (var k = 0; k < offsetSign.length; k++) {
                        normal.push(pointToUse[j]);
                        normal.push(offsetSign[k]);
                        normal.push(0);
                    }
                }
            }
            normal = new Float32Array(normal);

            const indexSize = 12 * userInput.maxParticles;
            var vertexIndexes = new Uint32Array(indexSize);
            for (var i = 0, j = 0, vertex = 0; i < userInput.maxParticles; i++) {
                vertexIndexes[j++] = vertex + 0;
                vertexIndexes[j++] = vertex + 1;
                vertexIndexes[j++] = vertex + 2;

                vertexIndexes[j++] = vertex + 2;
                vertexIndexes[j++] = vertex + 1;
                vertexIndexes[j++] = vertex + 3;

                vertexIndexes[j++] = vertex + 2;
                vertexIndexes[j++] = vertex + 4;
                vertexIndexes[j++] = vertex + 3;

                vertexIndexes[j++] = vertex + 4;
                vertexIndexes[j++] = vertex + 3;
                vertexIndexes[j++] = vertex + 5;

                vertex += repeatVertex;
            }

            var geometry = new Cesium.Geometry({
                attributes: new Cesium.GeometryAttributes({
                    st: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 2,
                        values: st
                    }),
                    normal: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 3,
                        values: normal
                    }),
                }),
                indices: vertexIndexes
            });

            return geometry;
        },
        drawCommandAndCustomPrimitive(coords, colors) {
            const vsSource = `
            attribute vec3 position3DHigh;
            attribute vec3 position3DLow;
            attribute vec4 color;
            varying vec4 v_color;
            varying float batchId;

            void main() {
                vec4 position = czm_modelViewProjectionRelativeToEye * czm_computePosition();
                float r = color.r / 255.0;
                float g = color.g / 255.0;
                float b = color.b / 255.0;
                float a = color.a / 255.0;

                v_color = vec4(r, g, b, a);
                gl_Position = position;
            }`;
            const fsSource = `
            varying vec4 v_color;

            void main() {
                gl_FragColor = v_color;
            }`;

            let geometry = this.createSegmentsGeometry(coords);

            let segments = new CustomPrimitive({
                commandType: 'Draw',
                attributeLocations: {
                    normal: 0,
                    st: 1
                },
                geometry: geometry,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                uniformMap: {
                    posotion: function () {
                        return coords;
                    },
                    color: function () {
                        return colors;
                    },
                },
                vertexShaderSource: new Cesium.ShaderSource({
                    // sources: [Util.loadText(fileOptions.glslDirectory + 'segmentDraw.vert')]
                    sources: [vsSource]
                }),
                fragmentShaderSource: new Cesium.ShaderSource({
                    // sources: [Util.loadText(fileOptions.glslDirectory + 'segmentDraw.frag')]
                    sources: [fsSource]
                }),
                rawRenderState: Util.createRawRenderState({
                    // undefined value means let Cesium deal with it
                    viewport: undefined,
                    depthTest: {
                        enabled: true
                    },
                    depthMask: true
                }),
                // framebuffer: this.framebuffers.segments,
                framebuffer: undefined,
                autoClear: true
            });

            this.viewer.scene.primitives.add(segments);
        },
    },
    mounted() {
        Cesium.Ion.defaultAccessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo";

        let viewer = new Cesium.Viewer("cesiumContainer", {
            shouldAnimate: true, //有动画
            animation: false, //动画控制不显示
            timeline: false, //时间线不显示
            // fullscreenButton: false, //全屏按钮不显示
            infoBox: false,
            selectionIndicator: false,
        });
        this.viewer = viewer;

        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        this.cesiumHandler = handler;

        antiAliasing(viewer); // 抗锯齿
        preventCameraIntoUnderground(viewer); //让相机不能进入地球内部---不然飞机模型的扫描区域的地下部分可以被很明显的看见
        // viewer.extend(Cesium.viewerCesiumInspectorMixin); //


        // this.drawCommandAndCustomPrimitive(coords, colors)// 这个用不了


        // try Particle System
        // this.tryParticleSystem_Demo(viewer);

        this.testAddMultiModel();

        // let cameraPos = Cesium.Cartesian3.fromDegrees(112.47, 25.694, 210000);
        // this.viewer.camera.flyTo({
        //     destination: cameraPos,
        //     // orientation: {
        //     //     heading: data.phi,
        //     //     pitch: data.psi,
        //     //     roll: data.theta
        //     // },
        //     // maximumHeight: 10000,
        //     // complete: function () {
        //     //     // callback();
        //     //     console.log("this.viewer----", viewer);
        //     //     viewer.trackedEntity = this.curModel;
        //     // }
        // });
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.stopBtn {
    margin-left: 80px !important;
}
.pauseBtn {
    margin-left: 160px !important;
}
.speedUpBtn {
    margin-left: 250px !important;
}
.speedDownBtn {
    margin-left: 360px !important;
}
.getValBtn {
    margin-left: 490px !important;
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
