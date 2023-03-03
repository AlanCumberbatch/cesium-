// addEntityModel_useShader_modelCreatedByPrimitive
// addEntityModel_ByPrimitiveModelBySpeed_init

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

        this.viewer = viewer;
        this.clock = viewer.clock;
        this.clockTrackedDataSource = viewer.clockTrackedDataSource;//不一定用
        this.option = option;
        this.position = option.position;
        this.model = null;
        this.beforePosition = null;
        this.speed = 1;
        this.curFps = 60;
        this.point2Use = [];
        this.positions = [];//for test
        this.tailStamp = 30;//用于标示从飞机当前position后多少个点开始显示 tail scale 20 --- 30
        this.lastSpeedVector = null;
        this.num = 1;// 初始值是1
        this.nums = [];// for test
        this.biasTheta = 0;
        this.tick = 0;
        // test---start
        this.aaa = null;//for test
        this.aaa2 = [];//for test
        this.storedPoints = [];//for test
        this.curPos = null;//for test
        // Date.prototype.getMilliseconds()
        this.lastMillisecond = null;//for test
        this.subMillisecond = null;//for test
        // test---end

        this.beforeBeforePosition = null;
        this.beforeNumber = 0;// for find the 223th/24th position from this.position
        this.beforePositions = [];// save positions needed from airplane's position
        this.property = null;
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

        this.radarClass = null;
        this.radar = null;
        this.label = null;

        this.lastEntityPos = null;// for test
        this.lastLastEntityPos = null;// for test

        this.numbers = [];//test
        this.tailPositions = [];//test
        this.hpRoll = new Cesium.HeadingPitchRoll();


        this.pixelsForPerColor = 600;//决定每多少个像素颜色发生渐变，即当前数目 pixel 的颜色是相同的
        this.tailLength = 500;// 单位是什么呢？ 目前的逻辑算是 画的 四边形的数量。---2022.10.10

        this.init();
    }

    get aaa() {
        // return this.positions
        console.log('22222222222');
        // return this.test();
        return this._aaa;
    }
    set aaa(value) {
        console.log('111111111111', value);
        this._aaa = value;
    }

    init() {
        // // this.property = new Cesium.SampledPositionProperty();
        // // // const position = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.alt);
        // // this.property.addSample(start, this.position);
        // const start = Cesium.JulianDate.now();
        // this.lastTime = start;


        this.positions.push(this.position);
        this.curPos = this.position;

        // this.lastMillisecond = new Date().getTime();
        this.lastMillisecond = performance.now();


        this.storedPoints = new Proxy(this.storedPoints, {
            set(obj, prop, value) {
                // console.log('%c [ value ]-103', 'font-size:13px; background:pink; color:#bf2c9f;', value)
                // console.log('%c [ prop ]-103', 'font-size:13px; background:pink; color:#bf2c9f;', prop)
                // console.log('%c [ obj ]-103', 'font-size:13px; background:pink; color:#bf2c9f;', obj)

                /*
                    [ value ]-103 Cartesian3 {x: -2991592.2841929044, y: 4991394.418532064, z: 2602254.7225352544}
                    [ prop ]-103  0
                    [ obj ]-103   []
                */

                // if (prop === 'maker' && value.length < 1) {
                // throw new Error('Invalid maker');
                // }

                // if (prop === 'year' && typeof value !== 'number') {
                // throw new Error('Invalid year');
                // }
                // obj[prop] = value;
                obj.push(value);
                console.log("obj.length", obj.length);
                if (obj.length > 2) {
                    // 就 每 0.1s 更新一次 飞机的状态
                    setTimeout(() => {
                        // 通过更新 position 和 headingPitchRoll 来更新飞机的位置 --- 目前 position 是生效的，headingPitchRoll 未生效
                        Cesium.Transforms.headingPitchRollToFixedFrame(
                            // this.position,
                            this.storedPoints[this.tick],
                            // obj[this.tick],
                            this.hpRoll,
                            Cesium.Ellipsoid.WGS84,
                            null,//fixedFrameTransform,
                            this.model.modelMatrix
                        );

                        // 只需要关注当前 position 的 pitch ---》  y轴的旋转即可 ---》 沿着 y 轴方向平移 50【具体单位暂时还不清楚】
                        // let y_pos = Cesium.Cartesian3.multiplyByScalar(cur_unit_y, 8000000, new Cesium.Cartesian3());
                        let y_pos = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Y, 50, new Cesium.Cartesian3());
                        let y = Cesium.Matrix4.multiplyByPoint(this.model.modelMatrix.clone(), y_pos, new Cesium.Cartesian3());
                        this.addPoint_test(y, Cesium.Color.BLUE);
                        let neg_y_vector = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Y, new Cesium.Cartesian3());
                        let y_pos_n = Cesium.Cartesian3.multiplyByScalar(neg_y_vector, 50, new Cesium.Cartesian3());
                        let y_n = Cesium.Matrix4.multiplyByPoint(this.model.modelMatrix.clone(), y_pos_n, new Cesium.Cartesian3());
                        this.addPoint_test(y_n, Cesium.Color.PURPLE);


                        //* 30 是 以当前飞机的位置向后延长30个点，目的是让 tail 能够正好出现在 飞机尾部
                        // if (this.positions.length > this.tailLength + this.tailStamp*2) {
                        if (this.positions.length > this.tailLength + this.tailStamp) {
                            this.positions.shift();
                            this.positions.shift();
                        }
                        // 将得到的点进行平移 --- 点的更新 完毕
                        this.positions.push(y);
                        this.positions.push(y_n);
                        // 更新 DrawCommand 相关数据 --- 更新 DrawCommand
                            // 而后 处理得到可以当作 vertex 坐标的点
                            // 计算 st 坐标
                        this.addTail(this.positions);
                        // 原 watcher 中的代码 --- end

                        this.tick++;
                    }, 100);
                }
                return true;
            }
        });
        this.storedPoints.push(this.position);


        // this.tailPositions.push(this.position);
        let that_ = this;
        that_.addModel();// use Primitive Create Model
        // 因为在得到后端的 position数据后，viewer.scene.preUpdate 添加的 监听事件中 不能够自动变化，但是下面这个方法也是不可以
        // 而且这个方法 每一帧 都执行一次
        this.viewer.cesiumWidget.clock.onTick.addEventListener(function(...args){
            /* args : [ Clock ]
                    canAnimate: true
                    clockRange: 0
                    onStop: Event
                    onTick: Event
                    startTime: JulianDate
                    stopTime: JulianDate
                    _clockStep: 1
                    _currentTime: JulianDate
                    _lastSystemTime: 39952.799999952316
                    _multiplier: 1
                    _shouldAnimate: true
            */

        })

        // this.clockTrackedDataSource
    }

    addModel() {



        let option = this.option;
        let modelSrc = option.src ? option.src : "./models/CesiumAir/Cesium_Air.glb";
        let name = option.name ? option.name : Symbol(modelSrc);
        let minimumPixelSize = option.size ? option.size : 128;
        let maximumScale = option.size ? option.size : 20000;//!!!!!
        let that_ = this;



        // primitive start------------------------------------------------------------------------------
        const scene = this.viewer.scene;
        const camera = scene.camera;
        const controller = scene.screenSpaceCameraController;
        let r = 0;
        const center = new Cesium.Cartesian3();
        const hpRoll = this.hpRoll; //new Cesium.HeadingPitchRoll();
        const hpRange = new Cesium.HeadingPitchRange();
        // let speed = 10;
        // let position = Cesium.Cartesian3.fromDegrees( -123.0744619, 44.0503706, 5000.0 );
        // let position = this.position;
        if (!this.model) {
            let speedVector = new Cesium.Cartesian3();
            // east, north, up, west, south or down.
            // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "north", "up" );//? 初始状态 NO // TODO 决定了什么？
            // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "up","north" );//? 初始状态 NO // TODO 决定了什么？ --- 相机 会不对的感觉,但是大体是对的感觉（有headingPitch的情况下）
            // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(  "east", "north" );//? 源码里默认就是这个 // TODO 决定了什么？ --- 此时飞机朝着 north 方向飞.  初始情况下飞机的朝向是正常的
            // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "north", "east" );//? 初始状态 NO // TODO 决定了什么？ --- 此时飞机朝着 north 方向飞
            // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "up", "east" );//? 初始状态 NO // TODO 决定了什么？--- 此时飞机翻养着飞
            // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "east", "up" );//? 初始状态 NO // TODO 决定了什么？
            // const fixedFrameTransform = function (origin) {
            //     console.log("origin", origin)// origin 是地表一个点（当前demo里应该是飞机的position）---》 将地表坐标系转换到 世界坐标系？？？
            //     that_.addPoint_test(origin)
            // };//? // TODO 决定了什么？
            // let fixedFrameTransform = Cesium.Transforms.rotationMatrixFromPositionVelocity(
            //     positionScratch,
            //     velocity,// 当前的 position 和上一个 position 的距离 / 0.1s
            //     Cesium.Ellipsoid.WGS84,
            //     rotationScratch
            // );
            const fixedFrameTransform = null;//用默认的东北天坐标系

            const planePrimitive = this.viewer.scene.primitives.add(
                Cesium.Model.fromGltf({
                    url: "./models/CesiumAir/Cesium_Air.glb",
                    modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
                        this.position,
                        this.hpRoll,
                        Cesium.Ellipsoid.WGS84,
                        fixedFrameTransform
                    ),
                    // minimumPixelSize: 128,//单位是什么？？ in pixel
                    // maximumScale: 20,//The maximum scale for the model.？？？
                    scale: 20,//只设置这个就可以让飞机保持固定大小
                })
            );
            // console.log("planePrimitive", planePrimitive);
            // planePrimitive.id = Symbol(this.option.name);
            planePrimitive.id = this.option.name;

            planePrimitive.readyPromise.then(function (model) {
                // Play and loop all animations at half-speed
                model.activeAnimations.addAll({
                    // multiplier: 0.95,
                    // multiplier: 0.0001,// 这个被率是相比于 Cesium.Clock 的时间的
                    // multiplier: 10.0,
                    // loop: Cesium.ModelAnimationLoop.MIRRORED_REPEAT,
                    loop: Cesium.ModelAnimationLoop.NONE,
                    // loop: Cesium.ModelAnimationLoop.REPEAT,
                    // removeOnStop:true,// 模型并没有消失，只是不动了。不加这个 模型也会暂停，因为数据没更新
                });

                // // Zoom to model
                // r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
                // controller.minimumZoomDistance = r * 0.5;
                // Cesium.Matrix4.multiplyByPoint( model.modelMatrix, model.boundingSphere.center, center );
                // const heading = Cesium.Math.toRadians(230.0);
                // const pitch = Cesium.Math.toRadians(-20.0);
                // hpRange.heading = heading;
                // hpRange.pitch = pitch;
                // hpRange.range = r * 50.0;
                // camera.lookAt(center, hpRange);
            });
            this.model = planePrimitive;

            // 现在的飞机没有用 SamplePositionProperty ,但是 Radar 用了，之后需要进行修改
            // if (this.option.radar && JSON.stringify(this.option.radarOption) != '{}') {
            // // if (this.option.radar) {
            //     console.log('%c [ this.option.radarOption ]-440', 'font-size:13px; background:pink; color:#bf2c9f;', this.option.radarOption)
            //     this.addRadar(this.option.radarOption);
            //     console.log('%c [ that_.radar ]-378', 'font-size:13px; background:pink; color:#bf2c9f;', this.radar)
            // }

            // test --- start
            // 先根据最开始的点 平移出来2个点。然后将这些点利用矩阵进行变换
            let translateLengthY = 50;
            let translateLengthX = 0;
            let translateLengthZ = 0;
            // let curA = that_.translatePointAlongAxis(that_.position, { x: translateLengthX, y: translateLengthY, z: translateLengthZ });
            // let curAMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(curA);
            // curA = Cesium.Matrix4.multiplyByPoint(curAMatrix, speedVector, curA);
            // that_.addPoint_test(curA , Cesium.Color.PINK)

            // let curB = that_.translatePointAlongAxis(that_.position, {x: translateLengthX, y: -translateLengthY, z: translateLengthZ });
            // let curBMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(curB)
            // that_.addPoint_test(curB , Cesium.Color.RED)
            // test --- end

            this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
                // if (that_.option.name == 'F-16') {
                //     that_.addPoint_test(that_.position,Cesium.Color.RED)
                // }

                // if ( that_.speed > 0 && that_.option.name == 'F-16') { // speed == 0 意思是暂停
                if ( that_.speed > 0 ) { // speed == 0 意思是暂停

                    //* 1. 更新 model
                    // 通过类似 贝塞尔曲线的那种方式得到每一帧率对应的点
                    // P = (1-t)P1 + tP2  t -->[0,1]
                    // let t = that_.num / (that_.curFps*0.1);
                    // console.log('%c [ t ]-309', 'font-size:13px; background:pink; color:#bf2c9f;', t)

                    let t = that_.num / that_.curFps;
                    t = t > 1 ? 1 : t;// 不可以比 1 大
                    // let t = 0.9;
                    t = 0.99;
                    // t *= 9;
                    let P1 = Cesium.Cartesian3.multiplyByScalar(that_.curPos, t, new Cesium.Cartesian3());
                    let P2 = Cesium.Cartesian3.multiplyByScalar(that_.position, (1 - t), new Cesium.Cartesian3())

                    that_.curPos = Cesium.Cartesian3.add(P1, P2, new Cesium.Cartesian3())
                    // that_.addPoint_test(that_.curPos,Cesium.Color.BROWN)
                    that_.num++;

                    // 通过更新 position 和 headingPitchRoll 来更新飞机的位置 --- 目前 position 是生效的，headingPitchRoll 未生效
                    Cesium.Transforms.headingPitchRollToFixedFrame(
                        // that_.position,
                        that_.curPos,
                        that_.hpRoll,
                        Cesium.Ellipsoid.WGS84,
                        fixedFrameTransform,
                        that_.model.modelMatrix
                    );


                    //* 2. 更新 tail
                    // 只需要关注当前 position 的 pitch ---》  y轴的旋转即可 ---》 沿着 y 轴方向平移 50【具体单位暂时还不清楚】
                    // let y_pos = Cesium.Cartesian3.multiplyByScalar(cur_unit_y, 8000000, new Cesium.Cartesian3());
                    let y_pos = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Y, 50, new Cesium.Cartesian3());
                    let y = Cesium.Matrix4.multiplyByPoint(that_.model.modelMatrix.clone(), y_pos, new Cesium.Cartesian3());

                    let neg_y_vector = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Y, new Cesium.Cartesian3());
                    let y_pos_n = Cesium.Cartesian3.multiplyByScalar(neg_y_vector, 50, new Cesium.Cartesian3());
                    let y_n = Cesium.Matrix4.multiplyByPoint(that_.model.modelMatrix.clone(), y_pos_n, new Cesium.Cartesian3());

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


                    //* 3. 更新 radar

                    // this.radar
                    // console.log('%c [ that_.radar ]-378', 'font-size:13px; background:pink; color:#bf2c9f;', that_.radar)
                    if (that_.radar) {
                        // that_.radar.update(that_.curPos);

                        // that_.option.radarOption.position = that_.curPos;
                        // that_.option.radarOption.HeadingPitchRoll = that_.hpRoll;
                        // that_.radarClass.updateOption(that_.option.radarOption)

                        // that_.radarClass.curPos = that_.curPos;
                        // that_.radarClass.HeadingPitchRoll = that_.hpRoll;

                        // that_.radar.position = that_.curPos;
                        // that_.radar.orientation = Cesium.Transforms.headingPitchRollQuaternion(that_.curPos, that_.hpRoll);

                        // that_.radarClass.position.addSample(time, that_.curPos);// 这个方法可以让 飞机雷达跟随着移动，但是依据现在数据，根本判断不了是否可用。
                    }
                }

                if (0 && that_.speed > 0 && that_.option.name == 'F-16') { // speed == 0 意思是暂停

                    // // 通过类似 贝塞尔曲线的那种方式得到每一帧率对应的点
                    // // P = (1-t)P1 + tP2  t -->[0,1]
                    // let t = that_.num / that_.curFps;
                    // t = t > 1 ? 1 : t;// 不可以比 1 大
                    // let P1 = Cesium.Cartesian3.multiplyByScalar(that_.positions[that_.tick],    (1 - t), new Cesium.Cartesian3())
                    // let P2 = Cesium.Cartesian3.multiplyByScalar(that_.positions[that_.tick + 1],      t, new Cesium.Cartesian3())
                    // let P = Cesium.Cartesian3.add(P1, P2, new Cesium.Cartesian3())
                    // that_.addPoint_test(P,Cesium.Color.BROWN)
                    // that_.num++;

                    // that_.position = P;


                    // that_.position = that_.positions[that_.tick];

                    // 每一帧绕Z轴旋转  that_.biasTheta/ FPS 个角度---》 即： 在现在的heading 基础上进行递增的渐变（作用在每一个 position 上，而不是模型上）
                    // let mixedVector = Cesium.Matrix3.multiplyByVector(that_.rotateAroundZAxis(that_.biasTheta*1 / that_.curFps), that_.lastSpeedVector, new Cesium.Cartesian3());
                    // that_.position = Cesium.Matrix4.multiplyByPoint(
                    //     that_.model.modelMatrix,
                    //     mixedVector,
                    //     that_.position
                    // );

                    // 通过更新 position 和 headingPitchRoll 来更新飞机的位置 --- 目前 position 是生效的，headingPitchRoll 未生效
                    // Cesium.Transforms.headingPitchRollToFixedFrame(
                    //     that_.position,
                    //     // P,
                    //     that_.hpRoll,
                    //     Cesium.Ellipsoid.WGS84,
                    //     fixedFrameTransform,
                    //     that_.model.modelMatrix
                    // );

                }

                that_.tick++;
            });

        }
        // else {
            // 只更新数据---  相关数据在 update 方法里面进行更新
            /*
                需要更新的有：
                    1. hpRoll （进而自动更新 hpRange
                    2. position
            */
        // }

        // primitive end------------------------------------------------------------------------------

        // 如果不使用 SamplePositionProperty ，虽然可以将更新后的点传入，但是生成的雷达模型根本不动。但是如果使用 SamplePositionProperty ，依据现在的数据，误差越来越明显
        // if (!this.radar) {
        //     // this.addRadar({
        //     //     position: this.curPos,
        //     //     option:this.option.radarOption,
        //     //     // HeadingPitchRoll: Cesium.Transforms.headingPitchRollQuaternion(this.curPos, this.hpRoll)
        //     // });
        //     this.option.radarOption.outline = true;
        //     this.addRadar(this.option.radarOption);
        // }
    }

    /**
     *  time： 秒
     *  position： 当前秒数内行驶路径的终点
     */
    updatePosition(option) {
        /* option:
            timeStamp: 0.11,
            position: curPosition,
            heading: data.psi - Math.PI/2,
            pitch: data.theta,
            roll: data.phi,
            radarOption:data.simRadarBeamDto,
         */

        if (this.option.name == 'F-16') {
                // // console.log("speed: ", option.speed,"--- speed/60: ", option.speed / 60);//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // this.addPoint_test(option.position);//,color=Cesium.Color.YELLOW)
                // this.addPoint_test(option.position,Cesium.Color.RED);

            // 确定数据的更新是不是 0.1s
            // Date.prototype.getMilliseconds()
            // let curDate = new Date().getTime();
            let curDate = performance.now();
            this.subMillisecond = curDate - this.lastMillisecond
            // console.log('%c [ subValue ]-532', 'font-size:13px; background:pink; color:#bf2c9f;', this.subMillisecond)
            this.lastMillisecond += this.subMillisecond
        }

        if (this.viewer.clock.shouldAnimate === false) {
            this.viewer.clock.shouldAnimate = true;
        }
        // test--start
        // this.aaa = option.heading;// 引用类型 监听不到
        // test--end

        // 获取当前 fps--- start
        // fpsContainer[0].style.display = 'none';// 在源码里面进行demo的不显示的操作: Scene.js#3669 注释掉
        this.curFps = this.viewer.scene._performanceDisplay._fpsText.nodeValue.slice(0, 2);
        // 获取当前 fps--- end

        // 需要更新的有：
        // 1. hpRoll （进而自动更新 hpRange
        this.hpRoll.heading = option.heading;// 就是 弧度 //  Cesium.Math.toRadians(option.pitch);
        this.hpRoll.pitch = option.pitch;
        this.hpRoll.roll = option.roll;

        // 2. position
        this.beforePosition = this.position.clone();
        this.position = option.position.clone();

        // this.storedPoints.push(option.position);

        // 这里面的点的时间间隔是 0.1s---》 preRender里面的时间间隔是 1s/帧率 ==》 需要差值： 插值的数量是 当前帧率 * 0.1 个
        // let interpolateNum = Math.ceil(this.curFps * 0.1);
        // for (let i = 0; i < interpolateNum; i++) {
        //     let t = i / interpolateNum;
        //     // Cesium.Cartesian3.lerp = function (start, end, t, result) { }
        //     let cur = new Cesium.Cartesian3();
        //     Cesium.Cartesian3.lerp(this.beforePosition, option.position, t, cur); // 这个涉及到数据如何给我？？

        //     // this.addPoint_test(cur)
        //     this.positions.push(cur);
        // }

        if (0 && this.option.name == 'F-16') {
            // // console.log("speed: ", option.speed,"--- speed/60: ", option.speed / 60);//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // this.addPoint_test(option.position);//,color=Cesium.Color.YELLOW)
            // this.addPoint_test(option.position,Cesium.Color.RED);
            // 通过类似 贝塞尔曲线的那种方式得到每一帧率对应的点
            // P = (1-t)P1 + tP2  t -->[0,1]
            for (let i = 0; i < Math.ceil(this.curFps); i++){
                let t = 1 / this.curFps;
                t = t > 1 ? 1 : t;// 不可以比 1 大
                t = 0.0001;
                // let P1 = Cesium.Cartesian3.multiplyByScalar(this.beforePosition,    (1 - t), new Cesium.Cartesian3())
                // let P2 = Cesium.Cartesian3.multiplyByScalar(option.position,        t,       new Cesium.Cartesian3())
                let P1 = Cesium.Cartesian3.multiplyByScalar(this.curPos,    (1 - t), new Cesium.Cartesian3())
                let P2 = Cesium.Cartesian3.multiplyByScalar(option.position, t, new Cesium.Cartesian3())
                // this.curPos
                this.curPos = Cesium.Cartesian3.add(P1, P2, new Cesium.Cartesian3())
                this.addPoint_test(this.curPos, Cesium.Color.BROWN)

                Cesium.Transforms.headingPitchRollToFixedFrame(
                    this.curPos,
                    this.hpRoll,
                    Cesium.Ellipsoid.WGS84,
                    null,//fixedFrameTransform,
                    this.model.modelMatrix
                );

                // 只需要关注当前 position 的 pitch ---》  y轴的旋转即可 ---》 沿着 y 轴方向平移 50【具体单位暂时还不清楚】
                // let y_pos = Cesium.Cartesian3.multiplyByScalar(cur_unit_y, 8000000, new Cesium.Cartesian3());
                let y_pos = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Y, 50, new Cesium.Cartesian3());
                let y = Cesium.Matrix4.multiplyByPoint(this.model.modelMatrix.clone(), y_pos, new Cesium.Cartesian3());
                // this.addPoint_test(y, Cesium.Color.BLUE);
                let neg_y_vector = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Y, new Cesium.Cartesian3());
                let y_pos_n = Cesium.Cartesian3.multiplyByScalar(neg_y_vector, 50, new Cesium.Cartesian3());
                let y_n = Cesium.Matrix4.multiplyByPoint(this.model.modelMatrix.clone(), y_pos_n, new Cesium.Cartesian3());
                // this.addPoint_test(y_n, Cesium.Color.PURPLE);
                // this.positions.push(P);
            }
            // this.positions.push(option.position);
        }


        // 这样可以，就是在时间上不连续
        if (0 && this.option.name == 'F-16') {// 转移到上面了
            // 通过更新 position 和 headingPitchRoll 来更新飞机的位置 --- 目前 position 是生效的，headingPitchRoll 未生效
            Cesium.Transforms.headingPitchRollToFixedFrame(
                this.position,
                // this.positions[this.tick],
                this.hpRoll,
                Cesium.Ellipsoid.WGS84,
                null,//fixedFrameTransform,
                this.model.modelMatrix
            );

            // 只需要关注当前 position 的 pitch ---》  y轴的旋转即可 ---》 沿着 y 轴方向平移 50【具体单位暂时还不清楚】
            // let y_pos = Cesium.Cartesian3.multiplyByScalar(cur_unit_y, 8000000, new Cesium.Cartesian3());
            let y_pos = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Y, 50, new Cesium.Cartesian3());
            let y = Cesium.Matrix4.multiplyByPoint(this.model.modelMatrix.clone(), y_pos, new Cesium.Cartesian3());
            this.addPoint_test(y, Cesium.Color.BLUE);
            let neg_y_vector = Cesium.Cartesian3.negate(Cesium.Cartesian3.UNIT_Y, new Cesium.Cartesian3());
            let y_pos_n = Cesium.Cartesian3.multiplyByScalar(neg_y_vector, 50, new Cesium.Cartesian3());
            let y_n = Cesium.Matrix4.multiplyByPoint(this.model.modelMatrix.clone(), y_pos_n, new Cesium.Cartesian3());
            this.addPoint_test(y_n, Cesium.Color.PURPLE);


            //* 30 是 以当前飞机的位置向后延长30个点，目的是让 tail 能够正好出现在 飞机尾部
            // if (this.positions.length > this.tailLength + this.tailStamp*2) {
            if (this.positions.length > this.tailLength + this.tailStamp) {
                this.positions.shift();
                this.positions.shift();
            }
            // 将得到的点进行平移 --- 点的更新 完毕
            this.positions.push(y);
            this.positions.push(y_n);
            // 更新 DrawCommand 相关数据 --- 更新 DrawCommand
                // 而后 处理得到可以当作 vertex 坐标的点
                // 计算 st 坐标
            this.addTail(this.positions);
            // 原 watcher 中的代码 --- end

            // this.tick++;
        }

        // let distance = Cesium.Cartesian3.distance(this.beforePosition, this.position);
        // // let distance = twoPointsLengthInMeters(this.beforePosition, this.position);
        // this.speed = distance / (0.1 * this.curFps);// speed in m/s
        // console.log(`this.speed(${this.speed}) ==? option.speed(${option.speed})`, this.speed == option.speed);
        this.speed = option.speed;
        // this.generateMatrix(this.beforePosition, this.position);
        // test
        //  测试 从后端得到的数据是否 连续: 结论：初始的10几个点不连续，之后的点都是连续的
        if (this.option.name == 'F-16') {
                // console.log("speed: ", option.speed,"--- speed/60: ", option.speed / 60);//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // this.addPoint_test(option.position);//,color=Cesium.Color.YELLOW)
        }
        // test

        // this.beforePosition = Cesium.Cartesian3.fromElements(this.position.x,this.position.y,this.position.z);//.clone();
        // this.position = position;



        // radar --- 相关的数据更新真的是毫无规律，所以尝试不用此处的到的数据的position，使用其他数据
        // const nextTime = Cesium.JulianDate.addSeconds(this.lastTime, option.timeStamp, new Cesium.JulianDate());
        // // this.property.addSample(nextTime, option.position);
        // this.radarClass.position.addSample(nextTime, this.curPos);
        // this.lastTime = nextTime;
        //
        // console.log("option.radarOption", option.radarOption);
        // this.option.radarOption = option.radarOption;
        //
        // this.radarClass.curPos = this.curPos;
        // this.radarClass.HeadingPitchRoll = this.hpRoll;


        this.num = 1;// 初始值是1
    }

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
    }
    generateMatrix_demo_notOK(pos1,pos2) {
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
    }

    // 真正的 tail 来了  by  drawCommand --- start
    addTail(cartesian3s) {
        // if (cartesian3s.length < 4 + this.tailStamp*2) { return; }
        if (cartesian3s.length < 4 + this.tailStamp) { return; }
        // if (cartesian3s.length < 4 ) { return; }
        let vertexPositions = [];

        // for (let p = 0; p < cartesian3s.length - 2 - this.tailStamp*2;  ){
        for (let p = 0; p < cartesian3s.length - 2 - this.tailStamp;  ){
        // for (let p = 0; p < cartesian3s.length - 2;  ){
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
                this.clearCommand = new Cesium.ClearCommand({
                    color : new Cesium.Color(),
                    stencil : 0,
                    owner : this
                });
                this.clear = false;
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
                    owner : this
                });
            }

            createClearCommand() {
                return new Cesium.ClearCommand({
                    color : new Cesium.Color(),
                    stencil : 0,
                    owner: this,
                    // pass: Cesium.Pass.OPAQUE,
                    pass: Cesium.Pass.OVERLAY,// 这个参数必须有，没有就报错。但是每个参数如下备注，都有问题。
                    // ENVIRONMENT: 0,
                    // COMPUTE: 1, --- 此时 context 还没有
                    // GLOBE: 2, --- OK，但是 sky 没有了
                    // TERRAIN_CLASSIFICATION: 3,---全都白了，不行
                    // CESIUM_3D_TILE: 4,
                    // CESIUM_3D_TILE_CLASSIFICATION: 5,
                    // CESIUM_3D_TILE_CLASSIFICATION_IGNORE_SHOW: 6,
                    // OPAQUE: 7,
                    // TRANSLUCENT: 8,
                    // OVERLAY: 9,
                    // NUMBER_OF_PASSES: 10,
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
                if (this.clear) {
                    // const command = this.createClearCommand();
                    // frameState.commandList.push(command);
                    // frameState.commandList.push(this.clearCommand);

                    // frameState.commandList.push(null);// 这样也不行

                    // console.log("frameState", frameState);
                    // frameState.commandList.forEach( item => {
                    //     if (item.own === this) {
                    //         console.log("item", item);// 找不到
                    //     }
                    // })

                    // 最终结论： 在想要清除的时候直接不让当前的 command push 进去即可
                } else {
                    const command = this.createCommand(frameState, this._modelMatrix);
                    frameState.commandList.push(command);
                }

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
    // 真正的 tail 来了  --- end

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
    }

    rotateAroundXAxis(a) {
        return [
            1,       0,        0,     0,
            0,  Math.cos(a),  -Math.sin(a),     0,
            0,  Math.sin(a),   Math.cos(a),     0,
            0,       0,        0,     1
        ];
    }
    rotateAroundYAxis(a) {
        return [
            Math.cos(a),   0, Math.sin(a),   0,
                0,   1,      0,   0,
            -Math.sin(a),   0, Math.cos(a),   0,
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

    // 这个方法不能成功计算出相应的矩阵，别的地方同样的方法是可以的啊！！！---这个方法没用了，暂时还没删，可以在实例中通过 ***。entity.computeModelMatrix 调用的方式进行执行
    computeModelMatrixForCurEntity(time) {
        // console.log('computeModelMatrixForCurEntity--------this.entity', this.entity);
        // console.log('computeModelMatrixForCurEntity--------this.entity._orientation', this.entity._orientation);
        // console.log('computeModelMatrixForCurEntity--------this.entity._position', this.entity._position);
        // console.log('computeModelMatrixForCurEntity--------this.entity.computeModelMatrix', this.entity.computeModelMatrix);

        let orientation = this.entity._orientation.getValue(time,new Cesium.Quaternion());
        let position = this.entity._position.getValue(time);
        if (orientation && position) {
            let matrix = this.entity.computeModelMatrix(time, new Cesium.Matrix4());
            // let matrix = Cesium.Matrix4.fromRotationTranslation(
            //     Cesium.Matrix3.fromQuaternion(orientation, new Cesium.Matrix3()),
            //     position,
            //     new Cesium.Matrix4()
            // );
            // console.log("computeModelMatrixForCurEntity--------matrix", matrix);
            return matrix;
        }
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

        // let { ellipsoid } = RadarReconnaossance(this.viewer, {
        //     position: this.property,
        //     radius: option.scanzoneDistance,//100000,
        //     outline: option.outline,
        //     //zoomTo:Boolean  是否将相机对准生成的 雷达模型，默认为true
        //     // color: option.colorRgb ? Cesium.Color.fromCssColorString(option.colorRgb) : 'blue',
        //     // alpha: option.pellucidity ? (Number(option.pellucidity) / 100).toFixed(2) : 0.1,
        //     color: 'blue',
        //     alpha: 0.1,
        //     beamWidth: Number(option.scanzoneAzimuthRange),//90,//波束宽度
        //     pitchAngleRange: option.scanzonePitchAngleRange,// :90.0, //扫描区域俯仰角范围
        //     // 这样看上去美观一点
        //     // beamWidth: 90,//波束宽度
        //     // pitchAngleRange: 90.0, //扫描区域俯仰角范围
        // });

        /*  */
        // let { ellipsoid } = RadarReconnaossance(this.viewer, {
        //     position: this.curPos,
        //     HeadingPitchRoll:this.hpRoll,
        //     radius: option.scanzoneDistance,//100000,
        //     outline: true,// option.outline,
        //     //zoomTo:Boolean  是否将相机对准生成的 雷达模型，默认为true
        //     // color: option.colorRgb ? Cesium.Color.fromCssColorString(option.colorRgb) : 'blue',
        //     // alpha: option.pellucidity ? (Number(option.pellucidity) / 100).toFixed(2) : 0.1,
        //     color: 'blue',
        //     alpha: 0.1,
        //     beamWidth: Number(option.beamAngle),//90,//波束宽度
        //     pitchAngleRange: option.scanzonePitchAngleRange,// :90.0, //扫描区域俯仰角范围
        //     // 这样看上去美观一点
        //     // beamWidth: 90,//波束宽度
        //     // pitchAngleRange: 90.0, //扫描区域俯仰角范围
        // });

        option.position = this.curPos;
        this.radarClass = new RadarReconnaossance(this.viewer, option);
        this.radar = this.radarClass.radar;
        // console.log('%c [ this.radar ]-1617', 'font-size:13px; background:pink; color:#bf2c9f;', this.radar)

        // console.log('ellipsoid', ellipsoid);

    }

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

    }

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

    // demo
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
}

export default addEntityModel