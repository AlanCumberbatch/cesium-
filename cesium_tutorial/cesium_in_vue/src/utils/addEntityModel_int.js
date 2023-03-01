import * as Cesium from 'cesium'
import Cesium3DTile from 'cesium/Source/Scene/Cesium3DTile';
// import { construct } from 'core-js/fn/reflect';
import CartesianRaduis2Degree from "./CartesianRaduis2Degree.js"
import RadarReconnaossance from "./RadarReconnaossance.js";
import twoPointsLengthInMeters from "./twoPointsLengthInMeters.js";

class addEntityModel {
    constructor(viewer, option = {}) {

        if (!viewer) { alert('必须传入 viewer'); return; }
        if (!option.position) { alert('必须传入 position'); return; }

        this.positions = [];
        this.speed = 0;
        this.headingPitchRoll = null;

        this.viewer = viewer;
        this.option = option;
        this.position = option.position;
        this.beforePosition = null;
        this.beforeBeforePosition = null;
        this.beforeNumber = 0;// for find the 223th/24th position from this.position
        this.before24Positions = [];// for find the 223th/24th position from this.position
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
        this.tailStamp = 15;// 单位是什么呢？ 目前的逻辑算是 画的 四边形的数量。---2022.10.10

        this.init();
    }

    init() {
        // this.addEntity(this.position);
        this.addEntity();
    }

    addEntity(position) {
        this.property = new Cesium.SampledPositionProperty();
        const start = Cesium.JulianDate.now();
        if (position) {
            // const position = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.alt);
            this.property.addSample(start, position);
        }
        this.lastTime = start;

        let option = this.option;
        // this.entity = this.viewer.entities.add(entityOption);
        let modelSrc = option.src ? option.src : "./models/CesiumAir/Cesium_Air.glb";
        let name = option.name ? option.name : Symbol(modelSrc);
        let minimumPixelSize = option.size ? option.size : 128;
        let maximumScale = option.size ? option.size : 20000;
        this.headingPitchRoll = new Cesium.HeadingPitchRoll(option.heading, option.pitch, option.roll)
        let that_ = this;


        this.entity = this.viewer.entities.add({
            name: name,
            position: this.property,
            // orientation: new Cesium.VelocityOrientationProperty( this.property ),
            // orientation: Cesium.Quaternion.fromHeadingPitchRoll(this.headingPitchRoll),
            // orientation: new Cesium.CallbackProperty(function (time, result) {
            //         // let quaternion = Cesium.Quaternion.fromHeadingPitchRoll(that_.headingPitchRoll);
            //         // const result = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
            //         //     new Cesium.Cartesian3(1.0, 1.0, 1.0), // translation
            //         //     quaternion,                           // rotation
            //         //     new Cesium.Cartesian3(1.0, 1.0, 1.0), // scale
            //         // );
            //         // M = Cesium.Matrix4.multiply(M, result, M);
            //     let pos = that_.property.getValue(time);
            //     if (pos) {
            //         that_.addPoint_test(pos, Cesium.Color.PURPLE)
            //         return Cesium.Transforms.headingPitchRollQuaternion( pos, that_.headingPitchRoll );
            //     }
            //     // return Cesium.Quaternion.fromRotationMatrix(Cesium.Matrix4.getMatrix3(M, new Cesium.Matrix3()));
            //     // return Cesium.Quaternion.fromHeadingPitchRoll(that_.headingPitchRoll)
            // },false),
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
        console.log('%c [ this.entity ]-88', 'font-size:13px; background:pink; color:#bf2c9f;', this.entity)

        if (this.option.radar) {
            this.addRadar(this.option.radarOption);
        }
        this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
            if (that_.speed > 0) { // speed == 0 意思是暂停
                // this.positions 里面的点进行使用

                if (that_.option.name == 'F-16') {

                    let pos = that_.property.getValue(time);
                    // that_.addPoint_test(pos, Cesium.Color.PURPLE)
                    let M = that_.entity.computeModelMatrix(time, new Cesium.Matrix4());

                    if (M) {
                        let quaternion = Cesium.Quaternion.fromHeadingPitchRoll(that_.headingPitchRoll);
                        const result = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
                            new Cesium.Cartesian3(1.0, 1.0, 1.0), // translation
                            quaternion,                           // rotation
                            new Cesium.Cartesian3(1.0, 1.0, 1.0), // scale
                        );
                        let mat = Cesium.Matrix4.multiply(M, result, new Cesium.Matrix4());

                        // let sub = Cesium.Cartesian3.subtract(that_.position,pos,new Cesium.Cartesian3())
                        // let sub = Cesium.Cartesian3.subtract(pos,that_.position,new Cesium.Cartesian3())

                        that_.entity.orientation = Cesium.Quaternion.fromRotationMatrix(Cesium.Matrix4.getMatrix3(M, new Cesium.Matrix3()));
                        // 把这个 Matrix4 赋值给 entity --- 下面的不生效
                        // for (let p = 0; p < that_.viewer.scene.primitives._primitives.length; p++){
                        //     if (that_.viewer.scene.primitives._primitives[p] instanceof Cesium.Model && that_.viewer.scene.primitives._primitives[p].id.name == that_.option.name) {
                        //     // if (that_.viewer.scene.primitives._primitives[p] instanceof Cesium.Model ) {
                        //         // console.log(1111111111111111, that_.viewer.scene.primitives._primitives[p]._modelMatrix)
                        //         that_.viewer.scene.primitives._primitives[p]._modelMatrix = M;
                        //     }
                        // }

                        // 只需要关注当前 position 的 pitch ---》  y轴的旋转即可 ---》 沿着 y 轴方向平移 50【具体单位暂时还不清楚】
                        let y_pos = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Y, 50, new Cesium.Cartesian3());
                        let y = Cesium.Matrix4.multiplyByPoint( mat, y_pos, new Cesium.Cartesian3());
                        // that_.addPoint_test(y, Cesium.Color.BLUE);
                        let neg_y_vector = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Y, new Cesium.Cartesian3());
                        let y_pos_n = Cesium.Cartesian3.multiplyByScalar(neg_y_vector, 50, new Cesium.Cartesian3());
                        let y_n = Cesium.Matrix4.multiplyByPoint( mat, y_pos_n, new Cesium.Cartesian3());
                        // that_.addPoint_test(y_n, Cesium.Color.PURPLE);

                        // 原 watcher 中的代码 --- start
                        // let curDealPos = that_.point2Use[that_.point2Use.length - 1];// 拿到最新的点
                        // let curDealPos = that_.position;// 拿到最新的点

                        //* 30 是 以当前飞机的位置向后延长30个点，目的是让 tail 能够正好出现在 飞机尾部
                        if (that_.positions.length > that_.tailLength + that_.tailStamp) {
                            that_.positions.shift();
                            that_.positions.shift();
                        }
                        // 将得到的点进行平移 --- 点的更新 完毕
                        that_.positions.push(y);
                        that_.positions.push(y_n);
                        // 更新 DrawCommand 相关数据 --- 更新 DrawCommand
                            // 而后 处理得到可以当作 vertex 坐标的点
                            // 计算 st 坐标
                        that_.addTail(that_.positions);
                        // 原 watcher 中的代码 --- end
                    }
                }
            }

        });

        // this.viewer.trackedEntity = this.entity;
        this.viewer.clock.startTime = start.clone();
        this.viewer.clock.currentTime = start.clone();
        this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
        this.viewer.clock.shouldAnimate = false;

    }

    /**
     *  time： 秒
     *  position： 当前秒数内行驶路径的终点
     */
    updatePosition(option) {
        /*
            timeStamp: 0.11,
            position: curPosition,
            speed:data.speed,
            // heading: data.phi,
            // pitch: data.psi,
            // roll: data.theta,
            heading: data.psi - Math.PI/2, //
            pitch: data.theta,
            roll: data.phi,
        */
        if (this.viewer.clock.shouldAnimate === false) {
            this.viewer.clock.shouldAnimate = true;
        }

        //  测试 从后端得到的数据是否 连续
        // if (this.option.name == 'F-16') {
        //     this.addPoint_test(option.position);//,color=Cesium.Color.YELLOW)
        // }

        this.beforePosition = Cesium.Cartesian3.fromElements(this.position.x,this.position.y,this.position.z);//.clone();
        this.position = option.position;

        const nextTime = Cesium.JulianDate.addSeconds(this.lastTime, option.timeStamp, new Cesium.JulianDate());
        this.property.addSample(nextTime, option.position);

        this.lastTime = nextTime;

        this.speed = option.speed;

        this.headingPitchRoll = new Cesium.HeadingPitchRoll(option.heading, option.pitch, option.roll)
    }

    // 真正的 tail 来了  by  drawCommand
    addTail_before(cartesian3s) {
        // if (cartesian3s - 6 < 0 || cartesian3s%6 != 0) return;

        let { arr, stArr } = this.getTailParamters(cartesian3s);

        this.tailPrimitive = this.drawDynamicTriangles(arr, stArr);// 法向量目前不用

    }
    addTail(cartesian3s) {
        if (cartesian3s.length < 4 + this.tailStamp*2) { return; }
        let vertexPositions = [];

        for (let p = 0; p < cartesian3s.length - 2 - this.tailStamp*2;  ){
            let curA = cartesian3s[p]
            let curB = cartesian3s[p+1]
            let nxtA = cartesian3s[p+2]
            let nxtB = cartesian3s[p+3]

            // 1-2-3-3-4-1 ---- curA - curB - nxtB - nxtB - nxtA - curA
            vertexPositions.push(curA)
            vertexPositions.push(curB)
            vertexPositions.push(nxtB)
            vertexPositions.push(nxtB)
            vertexPositions.push(nxtA)
            vertexPositions.push(curA)

            p += 2;
        }

        let { arr,stArr } = this.getTailParamters(vertexPositions);

        if (!this.tailPrimitive) {
            this.tailPrimitive = this.drawDynamicTriangles(arr,stArr);// 法向量目前不用
        } else {
            this.tailPrimitive.positionArray = arr;
            this.tailPrimitive.stArray = stArr;
        }
        // this.tailPrimitive = this.drawDynamicTriangles(arr,stArr);// 法向量目前不用
    }
    getTailParamters(cartesian3s) {
        //! 计算 distance 会让画面变得卡顿
        // let sumDistance = this.getSumDistanceByCartesianDistance(cartesian3s);
        // this.getSumDistanceInMeters(cartesian3s);

        // 获取 position 点集
        let arr = [];
        let len = cartesian3s.length;// 这些数据来的时候就已经被处理好了
        for (let i = 0; i < len;i++) {
            arr.push(cartesian3s[i].x);
            arr.push(cartesian3s[i].y);
            arr.push(cartesian3s[i].z);
        }

        // 获取 st 纹理坐标 --- （以时间为基准）
        let stArr = [];
        // // 1-2-3-3-1-4
        // let st_y = [0, 0, 1, 1, 0, 1];// 6 个一循环，每次loop每个数递增 1
        // let st_x =     [0, 1, 1, 1, 0, 0];
        // 1-2-3-3-4-1
        let st_y = [0, 0, 1, 1, 1, 0];// 6 个一循环，每次loop每个数递增 1
        let st_x = [0, 1, 1, 1, 0, 0];
        let stamp = len / 6;// 有多少组 四边形，就有多少组 2个点，则： 当前tail 点的数量就是 stamp + 1
        for (let j = 0; j < stamp + 1; j++){
            for (let p = 0; p < st_y.length; p++){
                stArr.push(st_x[p]);
                stArr.push( st_y[p] / stamp );
            }
            for (let p = 0; p < st_y.length; p++){
                st_y[p]++;
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

        // console.log("stArr.length/2", stArr.length/2,"arr.length/3", arr.length/3);
        // console.log("stArr", stArr);

        return { arr,stArr }
    }
    drawDynamicTriangles(typedArray,stArray,normalsArray) {
        const modelMatrix = Cesium.Matrix4.IDENTITY;

        const vertexShaderText = `
        // precision me float;
        attribute vec3 position;
        // attribute vec3 normal;
        attribute vec2 st;
        // uniform int pointsNum
        attribute float batchId;

        varying vec3 v_positionEC;
        // varying vec3 v_normalEC;
        varying vec2 v_st;

        void main() {
            vec4 p = vec4(position,1.0);

            // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
            v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
            // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
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
        // var imageUri = './imgs/fromLW/rectangle.png';//200*200
        var imageUri = './imgs/fromLW/rectangle1.png';//200*200
        // var imageUri = './imgs/fromLW/diamond.png';//200*200
        // var imageUri = './imgs/colors.png';//512*32
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
                            index: 1,
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
                    },
                    // pointsNum() {
                    //     return this.positionArray.length;
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


    // for test
    addPoint_test(position,color=Cesium.Color.YELLOW) {
        // console.log("position", position);

        this.viewer.entities.add({
            position: position,
            point: {
                pixelSize: 10,
                color: color,
            },
        });
    }
    getSumDistanceInMeters(positions) {
        // 算出每相邻的2个点的距离，然后加起来
        let distance = 0;
        for (let i = 0; i < positions.length - 1; i++){
            distance += twoPointsLengthInMeters(positions[i], positions[i + 1]);
        }
        // console.log("distance1", distance);
        // return
    }
    getSumDistanceByCartesianDistance(positions) {
        // 算出每相邻的2个点的距离，然后加起来
        let distance = 0;
        for (let i = 0; i < positions.length - 1; i++){
            distance += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
        }
        // console.log("distance2", distance);
        return distance;
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
}

export default addEntityModel