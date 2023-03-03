import * as Cesium from "cesium";
import RadarReconnaossance from "./RadarReconnaossance.js";//雷达模型
import planeTail from "./planeTail.js";//飞机尾线 --- 暂时没用上，因为不能够操作 Primitive 生成的 Polyline 的 长度
import showAxis from "./showAxis.js";//雷达模型
import createCustomMaterialImg from "./createCustomMaterialImg.js";

// 创建侦察机模型,包括 模型引入，雷达模型，侦查机尾线
// 说明： 函数内 let 声明的变量基本都可配置的
function planeInReconnaossance(viewer,option) {
    if (!viewer) { alert('planeInReconnaossance 必须传入 viewer'); return; }
    let operational = option && option.operational ? option.operational : true;
    let speed = option && option.speed ? option.speed : 10;
    let radar = option && option.radar ? option.radar : true;
    let lengthOfTail = option && option.lengthOfTail ? option.lengthOfTail : 1200;// 决定 飞机模型 的 tail 的长度
    let ifShowAxis = option && option.showAxis ? option.showAxis : false;
    let tailObj = option && option.tail && typeof option.tail == 'object' ? option.tail : null;


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


    // ---
    // // console.log("pathPosition.getValue(pathPosition_Time[pathPosition_Time.length - 1])", pathPosition.getValue(pathPosition_Time[pathPosition_Time.length - 1]));
    // function getModelPos(time) {
    //     console.log("pathPosition_Time.length", pathPosition_Time.length);
    //     console.log("pathPosition_Time[pathPosition_Time.length - 1]", pathPosition_Time[pathPosition_Time.length - 1]);
    //     return pathPosition.getValue(pathPosition_Time[pathPosition_Time.length - 1])
    // }
    // let entityModel = viewer.entities.add({
    //     name: modelSrc,
    //     position: new Cesium.CallbackProperty(getModelPos,false),
    //     // position: pathPosition.getValue(pathPosition_Time[pathPosition_Time.length - 1]),//??  pathPosition_Time
    //     // orientation: orientation,
    //     model: {
    //         uri: modelSrc,
    //         minimumPixelSize: 128,
    //         maximumScale: 200,
    //         // color: getColor(viewModel.color, viewModel.alpha),
    //         // colorBlendMode: getColorBlendMode(viewModel.colorBlendMode),
    //         colorBlendMode: getColorBlendMode('Highlight'),
    //         // colorBlendAmount: parseFloat(viewModel.colorBlendAmount),
    //         silhouetteColor: getColor( 'white', 0.8 ),
    //         // silhouetteColor: getColor( viewModel.silhouetteColor, viewModel.silhouetteAlpha ),
    //         // silhouetteSize: parseFloat(viewModel.silhouetteSize),
    //         silhouetteSize: 9,
    //     },
    // });
    // function getColorBlendMode(colorBlendMode) {
    //     return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
    // }
    // function getColor(colorName, alpha) {
    //     const color = Cesium.Color[colorName.toUpperCase()];
    //     return Cesium.Color.fromAlpha(color, parseFloat(alpha));
    // }
    /* 引入模型 */


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
    if (tailObj) {
        //  lengthOfTail  ---  决定 飞机模型 的 tail 的长度
        let material = tailObj.material ? tailObj.material : new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.3, taperPower: 0.3, color: Cesium.Color.PALEGOLDENROD, })
        if(tailObj.length){lengthOfTail = tailObj.length}
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
                // material: new Cesium[newMaterialName](Cesium.Color.WHITE, 3000,1)
                material: material,
            },
        });
        //  二 --- 这个方法暂时不行
        // let posArr = [];
        // posArr.push(position);
        // function getLinePos(time, result) {
        //     // console.log("pathPosition.getValue(time, result)",pathPosition.getValue(time));//这一时刻，获取的是：最新的那个点
        //     if (pathPosition.getValue(time)) {
        //         posArr.push(pathPosition.getValue(time));
        //     }
        //     return posArr;
        // }
        // let tail = planeTail.createTailByFadeType(viewer, position);
        // tail.readyPromise.then(function (model) {
        //     // console.log("model", model);
        //     // console.log("model.modelMatrix", model.modelMatrix);
        //     // console.log("pathPosition.getValue(Cesium.JulianDate.now())", pathPosition.getValue(Cesium.JulianDate.now()));// 这样获取不到

        //     // new Cesium.CallbackProperty(getLinePos, false);
        //     // Cesium.Transforms.headingPitchRollToFixedFrame(
        //     //     posArr[posArr.length - 1],
        //     //     hpRoll,
        //     //     Cesium.Ellipsoid.WGS84,
        //     //     fixedFrameTransform,
        //     //     model.modelMatrix
        //     // );
        //     // ! 想要在这里实现 Primitive飞机模型的航迹添加 ---》 需要动态操作 传入的 position
        //     // 正常是传入 一个 ....Array([.....])
        //     //

        //     // model.color = Cesium.Color.fromAlpha(getColor(viewModel.color), Number(viewModel.alpha));
        //     // model.colorBlendMode = getColorBlendMode(viewModel.colorBlendMode);
        //     // model.colorBlendAmount = viewModel.colorBlendAmount;
        //     // // Play and loop all animations at half-speed
        //     // model.activeAnimations.addAll({
        //     //     speedup : 0.5,
        //     //     loop : Cesium.ModelAnimationLoop.REPEAT
        //     // });

        //     // var camera = viewer.camera;

        //     // // Zoom to model
        //     // var controller = scene.screenSpaceCameraController;
        //     // var r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
        //     // controller.minimumZoomDistance = r * 0.5;

        //     // var center = Cesium.Matrix4.multiplyByPoint(model.modelMatrix, model.boundingSphere.center, new Cesium.Cartesian3());
        //     // var heading = Cesium.Math.toRadians(230.0);
        //     // var pitch = Cesium.Math.toRadians(-20.0);
        //     // camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, r * 2.0));
        // },function (error) {
        //     window.alert(error);
        // })

        // 三 --- 和 一 实现的方式一致
        // const startLatitude = 35;
        // const startLongitude = -120;
        // var startHeight = 5000.0;
        // var endLongitude;
        // let posArr = [];
        // posArr.push(position);

        // function getLinePos(time, result) {
        //     // console.log("pathPosition.getValue(time, result)",pathPosition.getValue(time));//这一时刻，获取的是：最新的那个点
        //     if (pathPosition.getValue(time)) {
        //         posArr.push(pathPosition.getValue(time));
        //     }
        //     return posArr;
        // }

        // const glowingLine = viewer.entities.add({
        //     name: "Glowing blue line on the surface",
        //     polyline: {
        //         // positions: Cesium.Cartesian3.fromDegreesArray([-75, 37, -95, 37]),
        //         positions: new Cesium.CallbackProperty(getLinePos, false),
        //         width: 10,
        //         material: new Cesium.PolylineGlowMaterialProperty({
        //             glowPower: 0.2,
        //             taperPower: 0.5,
        //             color: Cesium.Color.RED,//CORNFLOWERBLUE,
        //         }),

        //     },
        // });
    }
    /* 侦查机尾线 */

    let axiosPrimitive;

    // 让 飞机/雷达模型/position 实时变化的函数
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

        if (pathPosition._property._values.length > lengthOfTail) {
            let curVal = pathPosition_Time.shift();
            pathPosition.removeSample(curVal)
        }

        let curTime = Cesium.JulianDate.now();
        pathPosition.addSample(curTime, position);
        pathPosition_Time.push(curTime)
        // pathPosition.addSample(Cesium.JulianDate.now(), position);
        // pathPosition_Time.push(Cesium.JulianDate.now())


        // posForTail.push(position);
        // if (posForTail.length > 5) {
        //     if (posForTail.length > 1000) {
        //         posForTail.shift();
        //     }
        //     // planeTail.createTailByFadeType(viewer, posForTail);
        //     // posForTail = pathPosition;
        // }


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

        /* 显示当前模型对应的坐标轴 */
        if (ifShowAxis) {
            if (!axiosPrimitive) {
                axiosPrimitive = showAxis(planePrimitive, scene);
            } else {
                axiosPrimitive.modelMatrix = planePrimitive.modelMatrix
            }
        }
        /* 显示当前模型对应的坐标轴 */
    });
}

// function showAxios(primitive,scene) {
//     const modelMatrix = primitive.modelMatrix;
//     let modelMatrixPrimitive = new Cesium.DebugModelMatrixPrimitive({
//         modelMatrix: modelMatrix,
//     });
//     modelMatrixPrimitive.length = 1000;// default 10000000
//     scene.primitives.add(modelMatrixPrimitive);
//     return modelMatrixPrimitive;
// }

export default planeInReconnaossance;
