//  addEntityModel_Rectangle

import * as Cesium from 'cesium'
import Cesium3DTile from 'cesium/Source/Scene/Cesium3DTile';
// import { construct } from 'core-js/fn/reflect';
import CartesianRaduis2Degree from "./CartesianRaduis2Degree.js"
import RadarReconnaossance from "./RadarReconnaossance.js";

class addEntityModel {
    constructor(viewer, option = {}) {

        if (!viewer) { alert('必须传入 viewer'); return; }
        if (!option.position) { alert('必须传入 position'); return; }

        this.viewer = viewer;
        this.option = option;
        this.position = option.position;
        this.beforePosition = null;
        this.property = null;
        this.entity = null;
        this.lastTime = null;
        this.tailPosition = new Cesium.SampledPositionProperty();
        this.interval = null;// 用于存放 tail 的position 从 this.property 的何处开始截取
        this.updateTimeStap = 0;
        this.tail = null;
        this.transitionLength = null;
        this.pos_for_tail = null;
        this.modelDemo = null;// for test
        this.customBox = null;// for test
        this.boxPos = new Cesium.SampledPositionProperty();// for test
        this.SampledPositionPropertyForTriangles = new Cesium.SampledPositionProperty();// for test
        this.lastAPos = null;// for test
        this.lastBPos = null;// for test
        this.lastLastAPos = null;// for test
        this.lastLastBPos = null;// for test
        this.APosS = [];// for test
        this.BPosS = [];// for test
        this.tailPrimitive = null;// for test
        this.transitionOfPointOfTail = 0;//需要初始化

        this.silhouetteColor = null; //Cesium.Color.WHITE;
        this.silhouetteSize = null; //10;

        this.radar = null;
        this.label = null;

        this.lastEntityPos = null;// for test
        this.lastLastEntityPos = null;// for test


        this.pixelsForPerColor = 600;//决定每多少个像素颜色发生渐变，即当前数目 pixel 的颜色是相同的
        this.tailLength = 2000;// 单位是什么呢？ 目前的逻辑算是 画的 四边形的数量。---2022.10.10

        this.init();
    }

    init() {
        this.addEntity(this.position);

        // this.customBoxFn();

        // 因为 法四 不需要在这里执行
        if (0) {
            let that_ = this;
            this.viewer.scene.preRender.addEventListener(function () {
                // console.log("that_", that_);
                // 主要思路就是把每个得到的点向前进方向的反方向平移 模型大小的一半

                // 法一：能获取当前模型的在当前相机position情况下的 size 吗？--- 看了一下 entity 实例，没有相关属性
                // if (that_.option.name == 'F-16') {
                //     // console.log(`${that_.option.name}--distance:${distance} * that_.transitionOfPointOfTail`, distance * that_.transitionOfPointOfTail);
                //     console.log("---this.entity", that_.entity);
                // }

                // 法二：结合 当前相机 距 模型 的距离，重新设置每个点平移的距离 ---》 distance 有了，如何进行设置？？这个之间关系可以是什么呢？
                // 大体思路：
                //      相机距离模型越近，点的平移距离越小。： 这个变化存在范围。
                //      与当时的飞机模型大小相关，模型越大，平移距离越大。（ 其实平移主要是为了让点平移到 飞机的 尾部，所以和飞机模型的大小有关 ）
                //      相机距离模型越近，模型越大---可以固定吗？：
                //             - 设置了最大最小之后，相机距离模型到一定距离的时候，模型的的大小才会改变. 这个 阀值 和模型最大倍数以及最小方法倍数有关
                //                  --->这个具体的关系？  Camera的源码里面？还是其他哪里的源码里面能够知道到底是什么关系吗？
                //                  ----> 其实可以暂时将模型的最大最小缩放设置成128，2000//分别是极限值
                //                  模型大小极限值  ---  模型大小改变时相机距离模型位置（ 期间模型的大小不会发生变化 ）---》 不会变化？ 那是多大啊？
                //                  128           ---  6372614.812844892(平均值)
                //                  2000          ---  4256997.8236908605(平均值)

                // 法 二: 通过动态计算相机到模型的距离动态计算出 tail中每个点向后平移的距离 --- 不好处理，且不好维护
                if (0) {
                    // 计算 Camera 到 当前模型的 距离
                    // 模型当前的 position
                    // console.log("that_.entity.position", that_.entity.position);
                    let curModelPos = that_.entity.position.getValue(Cesium.JulianDate.now())
                    // console.log("curModelPos", curModelPos);
                    if (curModelPos) {
                        // distance 与 平移距离 成正相关
                        let distance = Cesium.Cartesian3.distance(that_.viewer.camera.position, curModelPos);
                        // console.log("distance", distance);
                        // 根据 此距离进行判断 航迹平移的多少 --- 在找的过程中发现飞机模型大小变化的一个规律，换一种方式进行计算
                        // 法 二.法a
                        // // if(distance > )
                        // //! 此时模型大小：600
                        // // that_.transitionOfPointOfTail = 8000;//! 50391302254.83068  --- camera距离模型距离：6298912.781853835 --- 这个高度的 tail 太丑了，暂时不做展示了
                        // // that_.transitionOfPointOfTail = 6000;//! 38297667059.54962  --- camera距离模型距离：6382944.509924936 --- 这个时候 生成的tail 因为航线不是很平滑，航迹就不咋好看 --- 建议也不用
                        // // that_.transitionOfPointOfTail = 5000;//! 31908457348.218887 --- camera距离模型距离：6381691.469643779 --- 这个时候 生成的tail 因为航线不是很平滑，航迹就不咋好看 --- 建议也不用
                        // // that_.transitionOfPointOfTail = 3000;//! 1915423856.567756  --- camera距离模型距离：6384746.188559187 --- 这个时候 生成的tail 也是有锯齿的
                        // that_.transitionOfPointOfTail = 1000;// 6385777608.807137 --- camera距离模型距离：6385777.608807136 --- 这个时候 生成的tail 也是有锯齿的
                        // // let a = (6385777608.807137 / distance);//.toFixed();
                        // // console.log('a value', a);

                        // 法 二.法b
                        if (that_.option.name == 'F-16') {
                            that_.distance.push(distance);
                            // console.log("Math.abs(distance - 6372614.812844892)", Math.abs(distance - 6372614.812844892));
                            // 测试最小值相关
                            if (0) {
                                console.log("Math.abs(distance - 6377328.132638922)", Math.abs(distance - 6377328.132638922));
                                // console.log("Math.abs(distance - 6372614.812844892)", Math.abs(distance - 6372614.812844892));
                                // if (Math.abs(distance - 6372614.812844892) < 2) {// 128
                                if (Math.abs(distance - 6377328.132638922) < 20) {// 128

                                    // console.log("可以创建model了");
                                    let { lon, lat, alt } = CartesianRaduis2Degree(that_.viewer, model.position._value);
                                    // 计算模型大小不变时，模型的大小
                                    // assumeSize（this.transitionOfPointOfTail）:
                                    // 128:  15 确实已经可以了，14 就算不上外接圆了, 14.5也不算外接圆
                                    // 2000: // 找起来的思路和 128 的时候不一样。。。 --- 突然想到可能在很远的地方并不需要计算那么精准
                                    let assumeSize = 14;
                                    if (!that_.modelDemo) {
                                        that_.modelDemo = that_.viewer.entities.add({
                                            position: Cesium.Cartesian3.fromDegrees(lon, lat),
                                            name: "Blue translucent, rotated, and extruded ellipse with outline",
                                            ellipse: {
                                                semiMinorAxis: assumeSize,
                                                semiMajorAxis: assumeSize,
                                                height:alt,
                                                extrudedHeight: alt,
                                                // rotation: Cesium.Math.toRadians(45),
                                                material: Cesium.Color.PINK.withAlpha(0.8),
                                                // fill:false,
                                                outline: true,
                                                outlineColor:Cesium.Color.RED,//.withAlpha(0.5),
                                            },
                                        });

                                        // 平移添加的 ellipse
                                        // 如何平移：
                                        // 1.找到目标点，
                                        // 需要一个起始点（curModelPos），一个vector，一个距离/即平移距离
                                        // console.log("Cesium.JulianDate.now()", Cesium.JulianDate.now());
                                        console.log("-------this.position", that_.position);
                                        console.log("-------curModelPos", curModelPos);
                                        // 2.然后换算成矩阵，
                                        // 3.然后根据矩阵的到新的点，
                                        // 4.最后进行赋值
                                    }
                                    // entities.push(modelDemo);
                                } else {
                                    // if (entities.length > 0) {
                                    //     for (let i = 0; i < entities.length; i++){
                                    //         // if (that_.viewer.entities.contains(that_.blueEllipse)) {
                                    //         // console.log("Math.abs(distance - 6372614.812844892)", Math.abs(distance - 6372614.812844892));
                                    //         // console.log("that_.viewer.entities.remove", that_.viewer.entities.remove);

                                    //     }
                                    // }
                                    if (that_.modelDemo) {
                                        that_.viewer.entities.remove(that_.modelDemo);
                                        that_.modelDemo = null;
                                    }
                                }
                            }
                            // 测试最大值相关
                            if (0) {
                                console.log(`distance:${distance} - 4256997.8236908605`, distance - 4256997.8236908605);
                                if (distance - 4256997.8236908605 > 0) {// 2000 --鼠标滚动到这个距离的时候，再滚动数值即将变大，且因精度不高不方便继续监听，从正常使用的角度考虑，这个数值可以作为参考。
                                    console.log("times", that_.times);
                                    that_.times++;

                                    let { lon, lat, alt } = CartesianRaduis2Degree(viewer, model.position._value);
                                    // 计算模型大小不变时，模型的大小
                                    // assumeSize（this.transitionOfPointOfTail）:
                                    // 128:  15 确实已经可以了，14 就算不上外接圆了, 14.5也不算外接圆
                                    // 2000: // 找起来的思路和 128 的时候不一样。。。 --- 突然想到可能在很远的地方并不需要计算那么精准
                                    let assumeSize = 105000;
                                    let modelDemo = viewer.entities.add({
                                        position: Cesium.Cartesian3.fromDegrees(lon, lat),
                                        name: "Blue translucent, rotated, and extruded ellipse with outline",
                                        ellipse: {
                                            semiMinorAxis: assumeSize,
                                            semiMajorAxis: assumeSize,
                                            height:alt,
                                            extrudedHeight: alt,
                                            // rotation: Cesium.Math.toRadians(45),
                                            material: Cesium.Color.PINK.withAlpha(0.2),
                                            // fill:false,
                                            outline: true,
                                            outlineColor:Cesium.Color.RED,//.withAlpha(0.5),
                                        },
                                    });
                                    entities.push(modelDemo);
                                } else {
                                    if (entities.length > 0) {
                                        for (let i = 0; i < entities.length; i++){
                                            // if (that_.viewer.entities.contains(that_.blueEllipse)) {
                                            // console.log("Math.abs(distance - 6372614.812844892)", Math.abs(distance - 6372614.812844892));
                                            // console.log("that_.viewer.entities.remove", that_.viewer.entities.remove);
                                            that_.viewer.entities.remove(entities[i]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                //法三： 找到 BoundingSphere，通过 viewer.scene.primitives : 首先：获取到 BoundingSphere的半径后，并不能将点平移到飞机尾部。但是BoundingSphere自己确是可以保持包围模型不变，且随着模型的大小进行变化。
                if (0) {
                    let primitivesNum = that_.viewer.scene.primitives.length;
                    for (let i = 0; i < primitivesNum; i++){
                        // this.viewer.scene.primitives.get(i).id //Entity
                        // console.log("that_.viewer.scene.primitives.get(i).id", that_.viewer.scene.primitives.get(i).id);
                        if (that_.viewer.scene.primitives.get(i).id) {
                            // if (that_.viewer.scene.primitives.get(i).id.name == 'F-16') {
                            if (that_.viewer.scene.primitives.get(i).id.name == that_.option.name) {
                                let boundingSphere = that_.viewer.scene.primitives.get(i)._boundingSphere;
                                // console.log("boundingSphere", boundingSphere);
                                if (boundingSphere) {
                                    // if (that_.transitionLength) {

                                    // } else {
                                        /*
                                            center: Cartesian3 {x: -2.6960997581481934, y: 9.699385813230869e-17, z: 1.5840299129486084}
                                            radius: 17.180071972066564 --- 就用这个了！！
                                        */
                                    let transitionLength = boundingSphere.radius;
                                    // }

                                    // 下面这段代码： 要将 tail上的点每一个都平移对应的距离
                                    // 利用 模型当前的 position 和 飞机即将飞到的position 去求一个 vector
                                    let curModelPos = that_.entity.position.getValue(Cesium.JulianDate.now());
                                    // console.log("curModelPos", curModelPos);
                                    // console.log("that_.position", that_.position);
                                    if (curModelPos) {
                                        // let vec = Cesium.Cartesian3.subtract(curModelPos, that_.position, new Cesium.Cartesian3());// right -> left
                                        let vec = Cesium.Cartesian3.subtract( that_.position, curModelPos, new Cesium.Cartesian3());// right -> left
                                        // let vec = Cesium.Cartesian3.subtract(this.beforePosition, this.position, new Cesium.Cartesian3());// right -> left
                                        if (vec.x != 0 || vec.y != 0 || vec.z != 0) {
                                            let neg_vec = Cesium.Cartesian3.negate(vec, new Cesium.Cartesian3());
                                            let normalize_vec = Cesium.Cartesian3.normalize(neg_vec, new Cesium.Cartesian3());
                                            // 这里面的 300 需要动态改变。当 Camera 距离模型很近时，是可以生效的。即现在的：this.transitionOfPointOfTail ---> 现在改成使用 BoundingSphere 的半径了
                                            let transition_vec = Cesium.Cartesian3.multiplyByScalar(normalize_vec, transitionLength, new Cesium.Cartesian3())// 模型的半径？/纵向一半的长度？
                                            let transition_matrix = Cesium.Matrix4.fromTranslation(transition_vec, new Cesium.Matrix4()); // 得到对应的 平移矩阵
                                            // let pos_for_tail = Cesium.Matrix4.multiplyByPoint(transition_matrix, this.beforePosition, new Cesium.Cartesian3());

                                            that_.pos_for_tail = Cesium.Matrix4.multiplyByPoint(transition_matrix, curModelPos, new Cesium.Cartesian3());

                                            that_.viewer.entities.add({
                                                position: that_.pos_for_tail,
                                                point: {
                                                    pixelSize: 10,
                                                    color: Cesium.Color.YELLOW,
                                                },
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // 法四：将model的大小固定，而后将tail 的宽度也固定，最关键也是最后，将tail 的收尾写层渐变色！！！ --- 也是不行

                let position = that_.entity.position.getValue(Cesium.JulianDate.now())
                that_.customBox.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
            });
        }

    }

    addEntity(position) {
        this.property = new Cesium.SampledPositionProperty();
        const start = Cesium.JulianDate.now();
        // const position = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.alt);
        this.property.addSample(start, position);
        this.lastTime = start;

        let option = this.option;
        // this.entity = this.viewer.entities.add(entityOption);
        let modelSrc = option.src ? option.src : "./models/CesiumAir/Cesium_Air.glb";
        let name = option.name ? option.name : Symbol(modelSrc);
        let minimumPixelSize = option.size ? option.size : 128;
        let maximumScale = option.size ? option.size : 20000;
        let that_ = this;

        this.entity = this.viewer.entities.add({
            name: name,
            position: this.property,
            orientation: new Cesium.VelocityOrientationProperty( this.property ),
            model: {
                uri: modelSrc,
                scale:20,// 设定模型放大倍数                                                A numeric Property specifying a uniform linear scale.
                // minimumPixelSize: minimumPixelSize, // 模型的最小 in pixel                                   A numeric Property specifying the approximate minimum pixel size of the model regardless of zoom.
                // maximumScale: maximumScale, // 模型被放大的最大值                                       The maximum scale size of a model. An upper limit for minimumPixelSize.
                heightReference: Cesium.HeightReference.NONE, // 设置model 的 height 属性的参考 A Property specifying what the height is relative to.
                silhouetteColor: new Cesium.CallbackProperty(function (time, result) {
                    return that_.silhouetteColor;
                },false), // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                silhouetteSize: new Cesium.CallbackProperty(function (time, result) {
                    return that_.silhouetteSize;
                },false), // 设置model的轮廓的宽度 in pixel                         A numeric Property specifying the size of the silhouette in pixels.
                // silhouetteColor: this.getColor("white", 0.8), // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                // silhouetteSize: 4.6, // 设置model的轮廓的宽度 in pixel                          A numeric Property specifying the size of the silhouette in pixels.
                color: this.getColor("white", 1.0), // 设置模型blend颜色                            A Property specifying the Color that blends with the model's rendered color.
                colorBlendMode: this.getColorBlendMode("highlight"), //设置 color 生效(混合)的方式   An enum Property specifying how the color blends with the model.
                // colorBlendAmount: parseFloat(viewModel.colorBlendAmount),
                colorBlendAmount: 0.6, //  {useful when colorBlendMode is MIX} A numeric Property specifying the color strength when the colorBlendMode is MIX. A value of 0.0 results in the model's rendered color while a value of 1.0 results in a solid color, with any value in-between resulting in a mix of the two.
                distanceDisplayCondition: null, //new Cesium.DistanceDisplayCondition(near, far),// A Property specifying at what distance from the camera that this model will be displayed.

                nodeTransformations: null, // [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                articulations: null, //  [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                clippingPlanes: null, // [not usual] new Cesium.ClippingPlaneCollection(options) // 	A property specifying the ClippingPlaneCollection used to selectively disable rendering the model.
                lightColor: null, // Cesium.Color.RED // [not usual] A property specifying the light color when shading the model. When undefined the scene's light color is used instead.
                imageBasedLightingFactor: new Cesium.Cartesian2( 1.0, 1.0 ), // [not usual] A property specifying the contribution from diffuse and specular image-based lighting.
                clampAnimations: true, // [not usual] A boolean Property specifying if glTF animations should hold the last pose for time durations with no keyframes.
                shadows: Cesium.ShadowMode.ENABLED, //  [not usual] An enum Property specifying whether the model casts or receives shadows from light sources.
                incrementallyLoadTextures: true, //   [not usual] Determine if textures may continue to stream in after the model is loaded.
            },
        });
        // if (option.tail) {
            // this.addTail_Rectangle();//用不了。
            // this.addTail_Plane(start,position);// 这个只能是一个平面，这个不能用。 尝试给Polyline 添加material--——》 polyline 不能显示 俯仰
            // this.addTail();
            // this.addTail_Wall();// 拿 更新 里面去了，因为一开始不能没数据，不好用，每次生成都是竖着的
            // this.addTail_Ori();
            // this.addTail_useMatrix_notOK()
            // this.addPoint_test_distance(position)
        // }

        if (this.option.radar) {
            this.addRadar(this.option.radarOption);
        }

        // this.viewer.trackedEntity = this.entity;
        this.viewer.clock.startTime = start.clone();
        this.viewer.clock.currentTime = start.clone();
        this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
        this.viewer.clock.shouldAnimate = false;
    }
    customBoxFn() {
        var viewer = this.viewer;

        var boxLength = 1000.0;
        var position = Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * boxLength);

        // this.viewer.entities.add({
        //     position: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * boxLength),
        //     point: {
        //         pixelSize: 10,
        //         color: Cesium.Color.YELLOW,
        //     },
        // });

        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);

        // 0 立方体顶点位置标号，以及坐标系示意图
        // 立方体
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        // 坐标系
        //  z
        //  | /y
        //  |/
        //  o------x

        // 1 定义位置数组
        var v0 = [0.5, -0.5, 0.5];
        var v1 = [-0.5, -0.5, 0.5];
        var v2 = [-0.5, -0.5, -0.5];
        var v3 = [0.5, -0.5, -0.5];
        var v4 = [0.5, 0.5, -0.5];
        var v5 = [0.5, 0.5, 0.5];
        var v6 = [-0.5, 0.5, 0.5];
        var v7 = [-0.5, 0.5, -0.5];
        var rawVertex = [
            // 下 -z
            ...v2, ...v3, ...v4, ...v7,
            // 前 -y
            ...v2, ...v3, ...v0, ...v1,
            // 后 +y
            ...v4, ...v7, ...v6, ...v5,
            // 左 -x
            ...v7, ...v2, ...v1, ...v6,
            // 右 +x
            ...v3, ...v4, ...v5, ...v0,
            // 上 +z
            ...v1, ...v0, ...v5, ...v6,
        ];
        // 乘上box的长度
        var boxVertex = rawVertex.map(function(v) {
            return v * boxLength;
        });
        var positions = new Float64Array(boxVertex);

        // 2 定义法向数组
        var npx = [1, 0, 0];
        var nnx = [-1, 0, 0];
        var npy = [0, 1, 0];
        var nny = [0, -1, 0];
        var npz = [0, 0, 1];
        var nnz = [0, 0, -1];
        var normals = new Float32Array([
            // 下 -z
            ...nnz, ...nnz, ...nnz, ...nnz,
            // 前 -y
            ...nny, ...nny, ...nny, ...nny,
            // 后 +y
            ...npy, ...npy, ...npy, ...npy,
            // 左 -x
            ...nnx, ...nnx, ...nnx, ...nnx,
            // 右 +x
            ...npx, ...npx, ...npx, ...npx,
            // 上 +z
            ...npz, ...npz, ...npz, ...npz,
        ]);

        // 3 定义纹理数组
        var sts = new Float32Array([
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
            0, 0, 1, 0, 1, 1, 0, 1,
        ]);

        // 4 定义索引
        var indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
        ]);

        // 5 创建Primitive
        var myBox = viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.Geometry({
                    attributes: {
                        position: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                            componentsPerAttribute: 3,
                            values: positions
                        }),
                        normal: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 3,
                            values: normals
                        }),
                        st: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 2,
                            values: sts
                        }),
                    },
                    indices: indices,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
                }),
                // attributes : {
                //     color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1.0))
                // }
            }),
            // appearance: new Cesium.PerInstanceColorAppearance({
            //     flat : true,
            //     translucent : false
            // }),
            appearance: new Cesium.MaterialAppearance({
                material: Cesium.Material.fromType('Image', {
                    image: './imgs/blue.png'
                }),
                //faceForward : true // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
                closed: true // 是否为封闭体，实际上执行的是是否进行背面裁剪
            }),
            modelMatrix: modelMatrix,
            asynchronous: false
        }));
        this.customBox = myBox;

        viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, boxLength));

        // 6 创建material
        // 6.1 创建纯色material
        var colorMaterial = new Cesium.Material({
            fabric: {
                type: 'Color',
                uniforms: {
                    color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
                },
                components: {
                    diffuse: 'color.bgr',
                    alpha: 'color.a'
                }
            },
            translucent: false
        });

        // 6.2 创建图像material
        var imageMaterial = new Cesium.Material({
            fabric: {
                type: 'Image',
                uniforms: {
                    image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png',
                    repeat: new Cesium.Cartesian2(1.0, 1.0),
                    color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
                },
                components: {
                    diffuse: 'texture2D(image, fract(repeat * materialInput.st)).rgb * color.rgb',
                    alpha: 'texture2D(image, fract(repeat * materialInput.st)).a * color.a'
                }
            },
            translucent: false
        });

        // 6.3 创建组合material
        // Material创建几个material来组合使用，以下其写法
        var compositeMaterial = new Cesium.Material({
            fabric: {
                type: 'OurMappedPlastic',
                materials: {
                    diffuseMaterial: {
                        type: 'DiffuseMap',
                        uniforms: {
                            image: './imgs/white.png'
                        }
                    },
                    alphaMap: {
                        type: 'AlphaMap',
                        uniforms: {
                            image: './imgs/mixColor.png',
                            channel: 'r'
                        }
                    }
                },
                components: {
                    diffuse: 'diffuseMaterial.diffuse',
                    // specular: 'specularMaterial.specular',
                    // alpha: 'diffuseMaterial.diffuse.g',
                    alpha: 'alphaMap.alpha * 3.0',
                },
            },
            translucent: function(material) {
                // return material.uniforms.color.alpha < 1.0;
                return false;
            }
        });

        // 6.4 创建自定义shader的material
        // 模拟纯色到图像的过渡过程
        var customMaterial = new Cesium.Material({
            fabric: {
                type: 'MyCustomShader1',
                uniforms: {
                    image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png',
                    color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
                    cellAlpha: 0.3
                },
                source: `
                            uniform vec4 color;
                            uniform float cellAlpha;

                            czm_material czm_getMaterial(czm_materialInput materialInput)
                            {
                                czm_material material = czm_getDefaultMaterial(materialInput);

                                vec2 st = materialInput.st;
                                float aa = st.s * st.t;
                                vec3 halfColor = color.rgb * aa + texture2D(image, materialInput.st).rgb * (1.0 - aa);
                                halfColor *= 0.5;
                                material.diffuse = halfColor;
                                material.emission = halfColor;
                                // material.alpha = color.a * aa;
                                material.alpha = 1.0;

                                return material;
                            }
                        `
            },
            translucent: false
        });

        // // text: '使用纯色材质',
        // myBox.appearance.material = colorMaterial;
        // // text: '使用图像材质',
        // myBox.appearance.material = imageMaterial;
        // // text: '使用组合材质',
        myBox.appearance.material = compositeMaterial;
        // text: '自定义Shader材质',
        // myBox.appearance.material = customMaterial;
    }

    /**
     *  time： 秒
     *  position： 当前秒数内行驶路径的终点
     */
    updatePosition(time, position) {
        if (this.viewer.clock.shouldAnimate === false) {
            this.viewer.clock.shouldAnimate = true;
        }

        this.beforePosition = this.position.clone();
        this.position = position;


        const nextTime = Cesium.JulianDate.addSeconds(this.lastTime, time, new Cesium.JulianDate());
        this.property.addSample(nextTime, position);

        this.setTail();

        this.lastTime = nextTime;
    }

    setTail() {

        // that_.SampledPositionPropertyForTriangles._property._values;//所有的点都在这里
        // 可以通过获取飞机当前的position，从而得到飞机的当前点以及上一个时刻的点；
        // lastLastEntityPos ---- 在获取position的时候，需要
        if (this.lastEntityPos) {
            let entityCurPos = this.entity.position.getValue(Cesium.JulianDate.now());//现在存在在某一个时间点没有数据的情况

            let positionsToUse = [];

            if (!entityCurPos) {//如果当前时间点没有值，取上一个时间点的值
                entityCurPos = this.lastEntityPos;
                //  这里需要知道 2 个点：飞机当前点，下一个点
                // 那怎么知道这个 end ？： 利用向量，当前飞机的前进方向，计算出来一个点： 将 当前点 沿着该方向 平移很小的距离---》 只知道 heading，pitch，roll，如何知道飞机当前的前进方向
                // let orientation = this.entity.orientation.getValue(Cesium.JulianDate.now());
                // console.log("orientation", orientation);//! TODO 这里先留下，先处理其他更紧要的东西

                positionsToUse.push(this.lastEntityPos);
                positionsToUse.push(entityCurPos);
            } else {//如果当前时间点有值，进行 lerp(interpolation 插值) --- 为什么要插值？ 可以更精细，能让的到的 tail 的颜色渐变更好。 不进行插值会怎样？
                // 在 entityCurPos != this.lastEntityPos 时进行 插值
                // entityCurPos = Cesium.Cartesian3.lerp(this.lastEntityPos, end, 1/10, new Cesium.Cartesian3()); // 得到想要插值的 10 个点中的第 1 个点 --- 1/10
                let interpolatedPos = [];
                let interpolateNum = 10;// 2 个  --》 50 个 //! 这个数一定要是 2 的倍数
                // 更改 interpolateNum 的时候需要更改如下两个参数
                this.pixelsForPerColor = 600;
                this.tailLength = 12000;// 单位是什么呢？ 目前的逻辑算是 画的 四边形的数量。

                interpolatedPos.push(this.lastEntityPos);
                for (let i = 0; i < interpolateNum; i++) {
                    let t = i / interpolateNum;
                    // Cesium.Cartesian3.lerp = function (start, end, t, result) { }
                    let cur = new Cesium.Cartesian3();
                    Cesium.Cartesian3.lerp(this.lastEntityPos, entityCurPos, t, cur); // 这个涉及到数据如何给我？？

                    interpolatedPos.push(cur);
                }
                interpolatedPos.push(entityCurPos);
                // positionsToUse.push(...interpolatedPos);
                positionsToUse = interpolatedPos;

                // positionsToUse.push(entityCurPos);
            }

            // 处理 this.APosS
            const N_UNIT_X = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_X, new Cesium.Cartesian3())
            for (let p = 1; p < positionsToUse.length - 1 ;){// p = 1 代表 第一个点不进行平移，也将不会参与到 tail 描绘中----不会有什么影响

                // 先平移，
                let translateLengthY = 50;
                let translateLengthX = 0;
                let translateLengthZ = 0;
                // // 计算 沿各个坐标轴平移的距离
                // console.log("start");
                // let vector = Cesium.Cartesian3.subtract(positionsToUse[p - 1], positionsToUse[p], new Cesium.Cartesian3());
                // console.log('vector', vector);
                // if (!(vector.x || vector.y || vector.z)) {// vector xyz 全是0 的情况
                //     translateLengthX = 0;
                //     translateLengthZ = 0;
                // } else {
                //     // 通过这个方式计算并不合适，还是通过 heading，pitch，roll 的角度来计算吧。----至于怎么算，明天继续
                //     console.log("vector", vector);
                //     let curVectorFromPre2Cur = Cesium.Cartesian3.normalize( vector,new Cesium.Cartesian3() )
                //     console.log('curVectorFromPre2Cur', curVectorFromPre2Cur);

                //     let cosWithX = Cesium.Cartesian3.dot(N_UNIT_X, curVectorFromPre2Cur);
                //     let cosWithY = Cesium.Cartesian3.dot(Cesium.Cartesian3.UNIT_Y, curVectorFromPre2Cur);
                //     let cosWithZ = Cesium.Cartesian3.dot(Cesium.Cartesian3.UNIT_Z, curVectorFromPre2Cur);
                //     console.log('cosWithY', cosWithY);
                //     let l = cosWithY == 0 ?  0 : translateLengthY / cosWithY;
                //     console.log('l', l);
                //     translateLengthX = l * cosWithX;
                //     translateLengthZ = l * cosWithZ;
                // }

                let curA = this.translatePointAlongAxis(positionsToUse[p+1],{x: translateLengthX, y:translateLengthY,   z: translateLengthZ });
                let curB = this.translatePointAlongAxis(positionsToUse[p+1],{x: translateLengthX, y: -translateLengthY, z: translateLengthZ });
                let preA = this.translatePointAlongAxis(positionsToUse[p],  {x: translateLengthX, y:translateLengthY,   z: translateLengthZ });
                let preB = this.translatePointAlongAxis(positionsToUse[p],  {x: translateLengthX, y: -translateLengthY, z: translateLengthZ });
                // 再 push
                this.APosS.push(preB);// for test
                this.APosS.push(preA);// for test
                this.APosS.push(curB);// for test
                this.APosS.push(curA);// for test

                // this.APosS.push(preB);// for test
                // this.APosS.push(preA);// for test
                // this.APosS.push(curA);// for test
                // this.APosS.push(curA);// for test
                // this.APosS.push(curB);// for test
                // this.APosS.push(preB);// for test

                p += 1;
            }

            this.lastEntityPos = entityCurPos;

        }
        if (!this.lastEntityPos) {
            this.lastEntityPos = this.entity.position.getValue(Cesium.JulianDate.now());;
        }

        // if (this.option.name == 'F-16' && this.APosS.length > 3000) {
        //     console.log("this.APosS", JSON.stringify(this.APosS));
        // }

        if (this.APosS.length > 0) {
            if(!this.tailPrimitive){
                this.addTail(this.APosS);
            } else {
                // 在这里控制 tail 的长度
                // this.APosS 里面的 position 已经是 1-2-3-3-4-1 排好了，即： this.APosS.length/6 == 画的四边形 数量，
                // 直接通过得到的点进行动态变化，tail会是一卡一卡的，尝试通过插值得到更多的点，这样： 画四边形的数量 =  //? 这个方法，又一些效果
                // let tailLength = 2000;// 单位是什么呢？ 目前的逻辑算是 画的 四边形的数量。----》 想要的是表示（平移前）单个点的数量 ==》 this.tailLength/2 表示
                // if (this.APosS.length > 6 * this.tailLength) {//
                //     // 此时 抛弃旧的点
                //     this.APosS.splice(0,this.APosS.length - 6 * this.tailLength);
                //     // var a = [1,2,3,4,5];  //定义数组
                //     // var b = a.splice(0,2);  //从第三个元素开始执行删除
                //     // console.log('b',b,'a',a);  //被删除的子数组是[1,2]
                // }

                let { arr, stArr } = this.getTailParamters(this.APosS);
                this.tailPrimitive.positionArray = arr;
                this.tailPrimitive.stArray = stArr;

                // this.viewer.scene.primitives.remove(this.tailPrimitive);

                // this.addTail(this.APosS);
            }
        }


        // if (this.tailPrimitive) {
        //     console.log("this.tailPrimitive:", typeof this.tailPrimitive, this.tailPrimitive);
        //     let that_ = this;
        //     this.tailPrimitive.readyPromise.then(function (model) {
        //         const coords = that_.SampledPositionPropertyForTriangles._property._values;
        //         const coords_vbo = new Float64Array(coords.flat())

        //         model.geometryInstances[0].geometry.attributes.position.values = coords_vbo;
        //     })
        // }



        // 延迟时间这种方式不行
        // nextTime.secondsOfDay - 0.4;
        // this.tailPosition.addSample(nextTime, position);

        // 把每一个得到的点向后平移，然后给到 this.tailPosition
        /*
            通过 Cesium.Cartesian3.subtract(left, right, result) 计算出 上一个点到最新的点的向量
            Cesium.Cartesian3.normalize(position,new Cesium.Cartesian3()) 进行 取模
            获取模型的大小（in pixel ？？？）----即：模型大小要确定！！！
            Cesium.Cartesian3.multiplyByScalar(cartesian, 模型的半径？/纵向一半的长度？, result) 从而获得 一个 对应长度的 vector
            而后 Cesium.Cartesian3.negate(normalize,new Cesium.Cartesian3()); 获得 反方向的 对应的vector // 这一步不用了
            以上，获取了 一个 vector
            Cesium.Matrix4.fromTranslation(position.clone(), new Cesium.Matrix4() ); 得到对应的 平移矩阵
            然后把 当前点 ，根据这个矩阵，进行平移 // Cesium.Matrix4.multiplyByPoint(translation, negatePosition,new Cesium.Cartesian3());
        */
        // 新增变量： 上次 scoket.io 得到的点 this.beforePosition --- 移到别处
        // console.log("this.transitionLength", this.transitionLength);
        // if (this.transitionLength) {
        // let vec = Cesium.Cartesian3.subtract(this.beforePosition, this.position, new Cesium.Cartesian3());// right -> left
        // let vec = Cesium.Cartesian3.subtract( this.position, this.beforePosition, new Cesium.Cartesian3());// right -> left
        // if (vec.x != 0 || vec.y != 0 || vec.z != 0  ) {
        //     let normalize_vec = Cesium.Cartesian3.normalize(vec, new Cesium.Cartesian3());
        //     // 这里面的 300 需要动态改变。当 Camera 距离模型很近时，是可以生效的。即现在的：this.transitionOfPointOfTail ---> 现在改成使用 BoundingSphere 的半径了
        //     let transition_vec = Cesium.Cartesian3.multiplyByScalar(normalize_vec, this.transitionOfPointOfTail, new Cesium.Cartesian3())// 模型的半径？/纵向一半的长度？
        //     // let transition_vec = Cesium.Cartesian3.multiplyByScalar(normalize_vec, this.transitionLength, new Cesium.Cartesian3())// 模型的半径？/纵向一半的长度？
        //     let transition_matrix = Cesium.Matrix4.fromTranslation(transition_vec, new Cesium.Matrix4()); // 得到对应的 平移矩阵
        //     // let pos_for_tail = Cesium.Matrix4.multiplyByPoint(transition_matrix, this.beforePosition, new Cesium.Cartesian3());
        //     let now =this.entity.position.getValue(Cesium.JulianDate.now())
        //     if (now) {
        //         let pos_for_tail = Cesium.Matrix4.multiplyByPoint(transition_matrix, now, new Cesium.Cartesian3());
        //         this.tailPosition.addSample(nextTime, pos_for_tail);
        //     }
        // }
        // }
        // 最终用这个
        // if (this.pos_for_tail) {
        //     console.log("this.pos_for_tail", this.pos_for_tail);
        //     this.tailPosition.addSample(nextTime, this.pos_for_tail);
        // }


        // this.addPoint_test(this.position)
        // this.addPoint_test2(position)
        // this.addPoint_test_distance(position)
        // this.addTail_distance_notOK(position)
        // 这种方式再模型拐弯的时候，有延迟，看上去很明显
        // console.log("this.property._property._values.length---------------", this.property._property._values.length);
        // if (this.property._property._values.length > 600) {// 300 这个数字要根据模型的大小来，最好能取到 模型外接圆的半径大小

        //     // console.log("this.property._property._values---------------", this.property._property._values);
        //     let values = this.property._property._values;
        //     let length = this.property._property._values.length;
        //     let pos = values.slice(length - 600,length - 600 + 3);// 截取三个
        //     // console.log('pos',pos);
        //     // console.log("x:", x, " y:", y, ' z:', z);
        //     // let pso_ = Cesium.Cartesian3.fromRadians(pos[0], pos[1], pos[2])
        //     //  Cesium.Cartesian3.fromElements(x, y, z, result)
        //     let pso_ = Cesium.Cartesian3.fromElements(pos[0], pos[1], pos[2])
        //     // console.log("pso_", pso_);

        //     if (!this.tailPosition) {
        //         this.addTail(nextTime, pso_);
        //     } else {
        //         console.log("nextTime", nextTime);
        //         this.tailPosition.addSample(nextTime, pso_);
        //     }
        // }
    }

    custom2Triangle() {
        let viewer = this.viewer;
        /*
            + Primitive
                - GeometryInstance | GeometryInstance[]
                    - Geometry
                        - GeometryAttributes
                            - GeometryAttribute
                - Appearance
        */
        //  Primitive API 直到传递给 WebGL 之前，想要在地球上绘制正确，必须是世界坐标。

        const vsSourceOri = `
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
        }`
        const vsSource = `
        attribute vec3 position3DHigh;
        attribute vec3 position3DLow;
        attribute vec4 color;
        varying vec4 v_color;
        varying float batchId;

        void main() {
            vec4 position = czm_modelViewProjectionRelativeToEye * czm_computePosition();

            v_color = vec4(0, 0, 1.0, 1.0);
            gl_Position = position;
        }`
        const fsSource = `
        varying vec4 v_color;

        void main() {
            gl_FragColor = v_color;
        }`


        /* 计算顶点坐标 */
        const coords = this.SampledPositionPropertyForTriangles._property._values;
        // console.log("coords", coords);
        const coords_vbo = new Float64Array(coords.flat())

        // const coords = [
        //     [112.470, 25.694, 200000],
        //     [109.961, 19.862, 200000],
        //     [118.122, 21.921, 200000],
        //     [109.961, 19.862, 200000],
        //     [118.122, 21.921, 200000],
        //     [115.613, 16.089, 200000]
        // ]
        // const coords_world = coords.map((coord) => {
        //     const cart = Cesium.Cartesian3.fromDegrees(...coord)
        //     return [cart.x, cart.y, cart.z]
        // })
        // const coords_vbo = new Float64Array(coords_world.flat())
        /* 结束计算顶点坐标 */

        let that_ = this;
        /* 装配并创建 Primitive */
        const geometry = new Cesium.Geometry({
            attributes: {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: coords_vbo
                    // values: new Cesium.CallbackProperty(function (time, result) {
                    //     console.log("that_.SampledPositionPropertyForTriangles._property._values",that_.SampledPositionPropertyForTriangles._property._values)
                    //     let res = new Float64Array(that_.SampledPositionPropertyForTriangles._property._values.flat())
                    //     return res;
                    // },false)
                }),
                // color: new Cesium.GeometryAttribute({
                //     componentDatatype: Cesium.ComponentDatatype.UNSIGNED_BYTE,
                //     componentsPerAttribute: 4,
                //     values: new Uint8Array( new Array(this.SampledPositionPropertyForTriangles._property._values.length).fill([255, 10, 10, 123].flat()))
                //     // values: new Uint8Array([
                //     //     255, 10, 10, 123,
                //     //     10, 255, 10, 123,
                //     //     10, 10, 255, 123,
                //     //     255, 10, 10, 123,
                //     //     10, 255, 10, 123,
                //     //     10, 10, 255, 123,
                //     // ])
                // }),
            },
            // boundingSphere: Cesium.BoundingSphere.fromVertices(coords_world.flat())
            boundingSphere: Cesium.BoundingSphere.fromVertices(coords.flat())
        })
        const instance = new Cesium.GeometryInstance({
            geometry: geometry,
            id: 'aaa'
        })
        /* 使用着色器代码及专属于此 primitive 的渲染状态创建自定义外观 */
        const customAppearance = new Cesium.Appearance({
            renderState: {
                depthMask: true,
                blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,
                depthTest: {
                    enabled: true
                }
            },
            vertexShaderSource: vsSource,
            fragmentShaderSource: fsSource
        })
        const primitive = new Cesium.Primitive({
            geometryInstances: [instance],
            releaseGeometryInstances: false,
            compressVertices: false,
            appearance: customAppearance,
            asynchronous: false
        })
        /* 装配结束 */

        this.tailPrimitive = viewer.scene.primitives.add(primitive);

        /* 定位 */
        // let a = this.SampledPositionPropertyForTriangles._property._values[0];
        // let b = this.SampledPositionPropertyForTriangles._property._values[1];
        // let c = this.SampledPositionPropertyForTriangles._property._values[2];
        // viewer.camera.setView({
        //     destination: new Cesium.Cartesian3(-5079092, 11300083, 4872035),
        //     // orientation: {
        //     //     heading: 6.28,
        //     //     pitch: -1.57,
        //     //     roll: 0
        //     // }
        // })

        /* 点击拾取 */
        // const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        //     handler.setInputAction((e) => {
        //         const result = viewer.scene.pick(e.position)
        //         console.log(result)
        //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        // }

    }

    getColorBlendMode(colorBlendMode) {
        return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
    }

    getColor(colorName, alpha) {
        const color = Cesium.Color[colorName.toUpperCase()];
        return Cesium.Color.fromAlpha(color, parseFloat(alpha));
    }

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
    }
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
    }

    rotateAroundXAxis(a) {
        return [
            1,       0,        0,     0,
            0,  cos(a),  -sin(a),     0,
            0,  sin(a),   cos(a),     0,
            0,       0,        0,     1
        ];
    }
    rotateAroundYAxis(a) {
        return [
           cos(a),   0, sin(a),   0,
                0,   1,      0,   0,
          -sin(a),   0, cos(a),   0,
                0,   0,      0,   1
        ];
    }
    rotateAroundZAxis(a) {
        return [
          Math.cos(a), -Math.sin(a),    0,    0,
          Math.sin(a),  Math.cos(a),    0,    0,
               0,       0,    1,    0,
               0,       0,    0,    1
        ];
    }

    addRadar(option) {
        /*
            {
                "simRadarBeamDto":{
                    "state":1  //1 为照射 0 为取消照射

                    // 这个经纬度 不用！
                    "lat":25.443275,
                    "lon":117.79541,
                    "alt":10.0,

                    "colorRgb":"255,0,0",           //颜色 r g b，当前扫描区域和波束是同样颜色
                    "pellucidity":100,              //透明度，只有扫描区域可以设置透明度，波束默认为不透明

                    "scanzoneType":2,               //扫描区域形状，1渐变圆锥，2实心扇形，3波纹扇形，4地面雷达-半圆球(现在只有2好使)---后面这个注释？？ ---- 暂时先不管这个变量
                    "scanzonePointType":1, 	        //扫描区域指向类型 1使用给定机头指向，0自定义指向(现在因为不显示扫描区域，所以设1/0皆可) ---》 目前先不用管这个参数： 但是B端确实可以实现自定义指向
                    "scanzonePitchAngleRange":90.0, //扫描区域俯仰角范围
                    "scanzoneAzimuthRange":360.0,   //扫描区域方位范围
                    "scanzoneDistance":350000.0,    //扫描区域作用距离(雷达长度) ---OK
                    "scanzoneAzimuthPointTo":90.0,  //扫描区域方位指向
                    "scanzonePitchPointTo":0.0,     //扫描区域俯仰指向

                    / 飞机雷达没有波束---C端demo里没有
                    "beamScanType":2,               //1: 手动设置扫描波束指向角度（与扫描区域左侧边缘的夹角位置），2，自动同方向循环扫描 3：自动往复扫描.（现在用1,  2/3自定义参数接口都尚未开放） --- B端暂时也是
                    "beamAzimuthPointTo":90.0,      //波束方位指向
                    "beamPitchPointTo":0.0,         //波束俯仰指向
                    "beamAngle":0.0,                //波束俯仰指向
                    "beamDistance":350000.0,        //波束距离

                    "beamId":"F-35",
                    "id":2,
                    "intTime":0,
                },
            }
        */

        let { ellipsoid } = RadarReconnaossance(this.viewer, {
            position: this.property,
            radius: option.scanzoneDistance,//100000,
            outline: option.outline,
            //zoomTo:Boolean  是否将相机对准生成的 雷达模型，默认为true
            // color: option.colorRgb ? Cesium.Color.fromCssColorString(option.colorRgb) : 'blue',
            // alpha: option.pellucidity ? (Number(option.pellucidity) / 100).toFixed(2) : 0.1,
            color: 'blue',
            alpha: 0.1,
            beamWidth: Number(option.scanzoneAzimuthRange),//90,//波束宽度
            pitchAngleRange: option.scanzonePitchAngleRange,// :90.0, //扫描区域俯仰角范围
            // 这样看上去美观一点
            // beamWidth: 90,//波束宽度
            // pitchAngleRange: 90.0, //扫描区域俯仰角范围
        });
        this.radar = ellipsoid;

    }

    // 真正的 tail 来了  by  drawCommand
    addTail(cartesian3s) {
        // if (cartesian3s - 6 < 0 || cartesian3s%6 != 0) return;

        let { arr, stArr } = this.getTailParamters(cartesian3s);

        this.tailPrimitive = this.drawDynamicTriangles(arr, stArr);// 法向量目前不用

    }
    getTailParamters(cartesian3s) {//更改为： 这里获得的点是 组成 飞机航迹上组成 tail 的点的集合
        // 取想要的长度
        // 处理后的点每个点进行平移----平移就需要知道当前点的 俯仰 ---- 这个是接口每次给到的。即：可以在 update 中通过传参得到---》 在 update中使用最好，也不用进行本地存储
        // 将平移后的点 每4个一组，排序成6个点，便于后续画三角形---》是否可以只是4个点呢？直接画一个Polygon？
        // 得到的点进行如下的操作即可

        // 如此的话： uv 坐标在哪里计算？--先把上面的写完


        // 现在的问题是：需要把靠近飞机尾部的 tail 变成透明的。 关于多长，从里算起？最开始的时候 tail 非常短怎么办？

        // 获取 position 点集
        let arr = [];
        let len = cartesian3s.length;// 这些数据来的时候就已经被处理好了
        for (let i = 0; i < len;i++) {
            arr.push(cartesian3s[i].x);
            arr.push(cartesian3s[i].y);
            arr.push(cartesian3s[i].z);
        }

        // 获取 st 纹理坐标
        let stArr = [];
        let stLen = len / 2;

        if (0) { // 此种情况是：之前的 C 端的图片
            let pos = 6;// 1~6 // 6就是没颜色
            let sub = 1 / this.pixelsForPerColor;//20 个点变一个颜色， 60 个一变还比较自然，不过还是有
            /*  现在想通过动态设置纹理坐标，来达到 tail 的首尾都是渐变的效果
                具体： 和头尾分别想要变透明的长度有关。（这里的长度的单位是： ？？？）
                关于头和尾的长度：
                    尾：需要变透明的长度是固定的
                    头：需要变透明的长度，是固定的吗？ 暂时可以认为是固定的。

                    现在假设，头尾需要变透明的长度是固定的。
                    那么： 将当前的线的长度一分为二，分别计算纹理坐标

            */
            let transparent_len = 0;

            for (let i = 0; i < stLen; i++) {// stLen == 111

                // 找到 当前的 4个点
                /*
                    0,0
                    1,0
                    0,i/stLen
                    1,i/stLen
                */

                // 当前 img 是 128*128 的
                // 现在的想法：每20个点一变化
                // let a = [0, pos / 128];
                // let b = [1, pos / 128];
                // let c = [1, pos+1 / 128];// pos+1 这里不可以 +1，这样的颜色变化太明显
                // let d = [0, pos+1 / 128];

                // if (i <= stLen / 2) { // 尾
                    // tail  的 开始部分的渐变
                    if (i != 0 && pos >= 1) { pos -= sub };// pos 最大是6 最小是1
                    // if (pos > 1 && pos <= 1 + 1 * sub) { transparent_len = i; }
                // } else { // 头
                    pos = 3;
                    // if (stLen <= transparent_len + i) {// transparent_len 这里代表的时候头部透明的长度
                    //     // console.log("pos",pos);//0.9999999999998848
                    //     if(pos <= 6){pos += sub}
                    // }
                //     // tail 的结尾部分的渐变 // 靠近飞机的那一侧 ---》
                    // /*
                    //     stLen --- 总长度  ---》 想要处理的 长度
                    //     How: 取决于想处理的长度是多少----和另一侧的长度一样？倒也不必。暂定一样吧，然后按照不一样写？就是不一样的
                    //     另一侧的长度this.pixelsForPerColor + 需要变透明的长度
                    // */
                //     // let transparentLength = 100;// 单位是：画四边形的数量
                //     // let anotherSideLength = this.pixelsForPerColor + transparentLength;
                //     // if ( i - anotherSideLength <= 0  && i - anotherSideLength > - anotherSideLength ) {
                //     //     if ( pos <= 6) { pos += sub };// pos 最大是6 最小是1
                //     // }
                // }

                let transparent_pos = [0, pos / 128, 1, pos / 128, 1, pos / 128, 1, pos / 128, 0, pos / 128, 0, pos / 128];

                stArr.push(...transparent_pos)

            }
        }
        if (1) {
            // 50*200 ---LW 帮忙画的
            // 怎么用呢？
            const imgHeight = 200;
            this.pixelsForPerColor = stLen/(imgHeight/2);// 每几个点显示同一个pixel 的颜色
            let pos = 0;
            const sub = 1 / this.pixelsForPerColor;//20 个点变一个颜色， 60 个一变还比较自然，不过还是有
            const transparent_len = 100;
            // 通过 this.tailLength 动态计算 transparent_len


            for (let i = 0; i < stLen; i++) {// stLen == 111

                // 找到 当前的 4个点
                /*
                    0,0
                    1,0
                    0,i/stLen
                    1,i/stLen
                */

                // 当前 img 是 128*128 的
                // 现在的想法：每20个点一变化
                // let a = [0, pos / 128];
                // let b = [1, pos / 128];
                // let c = [1, pos+1 / 128];// pos+1 这里不可以 +1，这样的颜色变化太明显
                // let d = [0, pos+1 / 128];

                // 99 就是 不透明区域的长度
                // if (i <= 99) {
                //     pos = i;
                // } else if (stLen - i <= 99) {
                //     pos = stLen - i;
                // } else {
                //     pos = 100;
                // }

                // if (pos < 100) {
                //     pos += sub;
                // } else {
                //     pos = 100;
                // }

                // if (i <= stLen / 2) {
                //     pos = i;
                //     // transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
                // } else {
                //     // pos = 200 - pos;
                //     // console.log("(200 - pos)", (200 - pos));
                //     // transparent_pos = [0, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 0, (200 - pos) / imgHeight, 0, (200 - pos) / imgHeight];
                //     pos--;
                // }
                // ! 忽略了一件事： tail 的最终长度 是固定的。以这个为前提：两侧透明部分的长度最终也是固定的。
                // 两侧透明的长度：暂时按照相等进行计算，当前的值分别为 100（和图片的尺寸正好匹配）。 定义在循环外 transparent_len
                //
                // this.pixelsForPerColor = 600;
                // this.tailLength = 12000;// 单位是什么呢？ 目前的逻辑算是 画的 四边形的数量。
                // 这里最好有一步根据 tailLength 动态计算 透明部分长度的 步骤 ---- 放在外面

                if (i <= transparent_len) {
                    pos = i;
                } else {
                    pos = 100;
                }

                // if (i <= 99) {
                //     pos = i;
                // } else if (stLen - i <= 99) {
                //     pos--;
                // } else {
                //     pos = 100;
                // }
                // if (pos <= 99) {
                //     // pos += sub;// * i;
                //     pos = i;
                //     // transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
                // } else if(pos >= 102) {
                //     // pos = 200 - pos;
                //     // console.log("(200 - pos)", (200 - pos));
                //     // transparent_pos = [0, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 0, (200 - pos) / imgHeight, 0, (200 - pos) / imgHeight];
                //     pos--;
                // } else {
                //     pos = 101;
                //     // 这里，当
                //     if (stLen - i < 101) {
                //         pos++;
                //     }
                // }
                // console.log("pos", pos);

                // pos = 10;

                // let transparent_pos = [
                //     0, pos / 200,
                //     1, pos / 200,
                //     1, pos+1 / 200,
                //     1, pos+1 / 200,
                //     0, pos+1 / 200,
                //     0, pos / 200,
                // ];
                let transparent_pos = [
                    0, pos / 200,
                    1, pos / 200,
                    1, pos+1 / 200,
                    0, pos+1 / 200,
                ];
                // let transparent_pos = [
                //     0, pos / 200,
                //     1, pos / 200,
                //     1, pos / 200,
                //     1, pos / 200,
                //     0, pos / 200,
                //     0, pos / 200
                // ];

                stArr.push(...transparent_pos)

            }
        }


        if (0) {// 获取 normals --- 定义法向数组
            // 获取 normals --- 定义法向数组
            var npx = [1, 0, 0];
            var nnx = [-1, 0, 0];
            var npy = [0, 1, 0];
            var nny = [0, -1, 0];
            var npz = [0, 0, 1];
            var nnz = [0, 0, -1];
            let normalsArr = [];
            let normalsArr_n = [];
            let normalsArr_p = [];
            // 使用demo
            // let normals = new Float32Array([
            //     // 下 -z
            //     ...nnz, ...nnz, ...nnz, ...nnz,
            //     // // 前 -y
            //     // ...nny, ...nny, ...nny, ...nny,
            //     // // 后 +y
            //     // ...npy, ...npy, ...npy, ...npy,
            //     // // 左 -x
            //     // ...nnx, ...nnx, ...nnx, ...nnx,
            //     // // 右 +x
            //     // ...npx, ...npx, ...npx, ...npx,
            //     // 上 +z
            //     ...npz, ...npz, ...npz, ...npz,
            // ]);
            // 获取 每个点对应的normals
            // for (let i = 0; i < oriPoints + 1 ;i++) {
            //     /*
            //         计算出当前点的 法向量？？？
            //     */

            //     normalsArr_p.push(...npz);// 上 +z
            //     normalsArr_n.push(...nnz);// 下 -z
            // }

            // normalsArr = [
            //     ...normalsArr_n,
            //     ...normalsArr_p
            // ];
        }

        return { arr, stArr }
    }
    drawDynamicTriangles(typedArray,stArray,normalsArray) {
        const modelMatrix = Cesium.Matrix4.IDENTITY;

        const vertexShaderText = `
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 st;
        attribute float batchId;

        varying vec3 v_positionEC;
        varying vec3 v_normalEC;
        varying vec2 v_st;

        void main() {
            vec4 p = vec4(position,1.0);

            // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
            v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
            v_normalEC = czm_normal * normal;                         // normal in eye coordinates
            v_st = st;

            // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
            gl_Position = czm_projection * czm_view * czm_model * p;
            // gl_Position = czm_modelViewProjectionRelativeToEye * p;
        }`;
        const fragmentShaderText = `
        uniform vec4 u_color;
        uniform vec2 u_repeat;
        uniform sampler2D myImage;

        varying vec3 v_positionEC;
        varying vec2 v_st;

        void main(){
            czm_materialInput materialInput;
            materialInput.positionToEyeEC = v_positionEC;
            materialInput.st = v_st;

            czm_material material = czm_getDefaultMaterial(materialInput);

            material.diffuse = texture2D(myImage, fract(u_repeat * materialInput.st)).rgb * u_color.rgb;
            material.alpha = texture2D(myImage, fract(u_repeat * materialInput.st)).a * 1.0;

            gl_FragColor = vec4(material.diffuse , material.alpha);
        }`;

        let that = this;
        // 1.5 定义纹理
        var texture = undefined;

        // var imageUri = './imgs/fromShang/Dirlinetexture02.png';
        var imageUri = './imgs/fromLW/rectangle.png';//50*200
        Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
            console.log('image loaded!');
            var vtxfTexture;
            var context = that.viewer.scene.context;
            if (Cesium.defined(image.internalFormat)) {
                vtxfTexture = new Cesium.Texture({
                    context: context,
                    pixelFormat: image.internalFormat,
                    width: image.width,
                    height: image.height,
                    source: {
                        arrayBufferView: image.bufferView
                    }
                });
            } else {
                vtxfTexture = new Cesium.Texture({
                    context: context,
                    source: image
                });
            }

            texture = vtxfTexture;
        });

        /* ----- See Here ↓ ------ */
        class StaticTrianglePrimitive {
            /**
             * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
             */
            constructor(option = {}) {
                this._modelMatrix = option.modelMatrix;
                // this.createCommand = null
                this.preExecute = option.preExecute;
                this.positionArray = option.positionArray;
                // this.normalsArray = option.normalsArray;
                this.stArray = option.stArray;
                this.framebuffer = null;
                this.frameState = null;
                this.clearCommand = null;
            }

            createVertexBufferByData(frameState) {
                const positionBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float32Array(this.positionArray),
                    context: frameState.context,
                });

                // 在这里创建纹理坐标Buffer:
                const stBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float32Array(this.stArray),
                    context: frameState.context,
                });

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
                        {
                            index: 1, // 等于 attributeLocations['position']
                            vertexBuffer: stBuffer,
                            componentsPerAttribute: 2,
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        },
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
            createVertexBufferByDataNext_notUse(frameState) {
                console.log("this.positionArray", this.positionArray);
                console.log("this.stArray", this.stArray);
                console.log("this.indicesArray", this.indicesArray);
                var geometry = new Cesium.Geometry({
                    attributes: {
                        position: new Cesium.GeometryAttribute({
                            // vtxf 使用double类型的position进行计算
                            // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 3,
                            values: this.positionArray
                        }),
                        // normal: new Cesium.GeometryAttribute({
                        //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        //     componentsPerAttribute: 3,
                        //     values: normals
                        // }),
                        textureCoordinates: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 2,
                            values: this.stArray
                        })
                    },
                    // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
                    indices: this.indicesArray,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    // boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
                });

                const attributeLocations = {
                    position: 0,
                    // st: 1,
                    // position: 0,
                    // normal: 1,
                    textureCoordinates: 1,
                };

                var vertexArray = Cesium.VertexArray.fromGeometry({
                    context: frameState.context,
                    geometry: geometry,
                    attributeLocations: attributeLocations,
                    bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
                    // interleave : true
                });

                return vertexArray;
            }

            createCommand(frameState, matrix) {
                const attributeLocations = {
                    position: 0,
                    st: 1,
                    // normal: 2,
                    // textureCoordinates: 1,
                };
                const uniformMap = {
                    u_color() {
                        return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    },
                    u_repeat() {
                        return new Cesium.Cartesian2(1.0, 1.0);
                    },
                    myImage: function() {
                            if (Cesium.defined(texture)) {
                                return texture;
                            } else {
                                return frameState.context.defaultTexture;
                            }
                    }
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

                const context = frameState.context;
                const colorTextureOptions = {
                    context: context,
                    width: context.drawingBufferWidth,
                    height: context.drawingBufferHeight,
                    pixelFormat: Cesium.PixelFormat.RGBA,
                    pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
                };
                const depthTextureOptions = {
                    context: context,
                    width: context.drawingBufferWidth,
                    height: context.drawingBufferHeight,
                    pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
                    pixelDatatype: Cesium.PixelDatatype.UNSIGNED_INT
                };

                const colorTexture = this.createTexture(colorTextureOptions);
                const depthTexture = this.createTexture(depthTextureOptions);

                // this.framebuffer = this.createFramebuffer(context, colorTexture, depthTexture)
                // this.clearCommand = new Cesium.ClearCommand({
                //     color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
                //     depth: 1.0,
                //     framebuffer: this.framebuffer,
                //     pass: Cesium.Pass.TRANSLUCENT
                //     // pass: Cesium.Pass.OPAQUE
                // });

                return new Cesium.DrawCommand({
                    // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
                    modelMatrix: matrix,
                    vertexArray: vertexArray,
                    shaderProgram: program,
                    uniformMap: uniformMap,
                    renderState: renderState,
                    pass: Cesium.Pass.TRANSLUCENT,
                    // framebuffer:this.framebuffer,
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

                // if (Cesium.defined(this.clearCommand)) {
                //     frameState.commandList.push(this.clearCommand);
                // }

                const command = this.createCommand( frameState, this._modelMatrix );
                frameState.commandList.push(command);

                // this.frameState = frameState;
            }

            createTexture(options, typedArray) {
                if (Cesium.defined(typedArray)) {
                    // typed array needs to be passed as source option, this is required by Cesium.Texture
                    var source = {};
                    source.arrayBufferView = typedArray;
                    options.source = source;
                }

                var texture = new Cesium.Texture(options);
                return texture;
            }
            createFramebuffer(context, colorTexture, depthTexture) {
                var framebuffer = new Cesium.Framebuffer({
                    context: context,
                    colorTextures: [colorTexture],
                    depthTexture: depthTexture
                });
                return framebuffer;
            }

            // destroy() {
            //     // console.log("11111111111111");
            //     // // if (this.frameState) {
            //     // if (this.framebuffer) {

            //     //     console.log("this.framebuffer ", this.framebuffer);
            //     //     // this.clearCommand = new Cesium.ClearCommand({

            //     //     const clearCommand = new Cesium.ClearCommand({
            //     //         color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
            //     //         depth: 1.0,
            //     //         framebuffer: this.framebuffer,
            //     //         pass: Cesium.Pass.TRANSLUCENT
            //     //         // pass: Cesium.Pass.OPAQUE
            //     //     });
            //     //     this.frameState.commandList.push(clearCommand);

            //     //     console.log("222222222222222222");
            //     // }
            // }

        }


        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        let primitive = this.viewer.scene.primitives.add(
            new StaticTrianglePrimitive({
                modelMatrix: modelMatrix,
                positionArray: typedArray,
                stArray: stArray,
                // normalsArray:normalsArray,
            })
        );
        return primitive;
    }
    // 真正的 tail 来了

}

export default addEntityModel