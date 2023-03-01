import * as Cesium from 'cesium'
// import Cesium3DTile from 'cesium/Source/Scene/Cesium3DTile';
import CartesianRaduis2Degree from "../CartesianRaduis2Degree"
import RadarReconnaossance from "../RadarReconnaossance.js";
import twoPointsLengthInMeters from "../twoPointsLengthInMeters.js";

class DynamicPrimitiveModel {
    constructor(viewer, option = {}) {

        if (!viewer) { alert('必须传入 viewer'); return; }
        if (!option.position) { alert('必须传入 position'); return; }

        this.viewer = viewer;
        this.clock = viewer.clock;
        this.option = option;
        this.position = option.position;
        this.model = null;
        this.speed = 1;
        this.curFps = 60;
        this.positions = [];//for test
        this.tailStamp = 30;//用于标示从飞机当前position后多少个点开始显示 tail scale 20 --- 30
        this.num = 1;// 初始值是1
        this.curPos = null;
        this.tail = null;// for test
        this.hpRoll = new Cesium.HeadingPitchRoll();
        this.tailLength = 500;// 单位是什么呢？ 目前的逻辑算是 画的 四边形的数量。---2022.10.10

        // 后续需要等后端数据
        this.radarClass = null;
        this.radar = null;


        // 不确定用不用的上
        // Date.prototype.getMilliseconds()
        this.lastMillisecond = null;//for test
        this.subMillisecond = null;//for test
        this.lastTime = null;


        this.init();

        // for test --- might be useful later for writing notes
        this.beforePosition = null;
    }

    init() {
        // const start = Cesium.JulianDate.now();
        // this.lastTime = start;


        this.positions.push(this.position);
        this.curPos = this.position;

        this.lastMillisecond = performance.now();//  performance 基于 Browser的API

        this.addModel();// use Primitive Create Model
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
        const hpRoll = this.hpRoll; //new Cesium.HeadingPitchRoll();
        const hpRange = new Cesium.HeadingPitchRange();
        if (!this.model) {
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

            this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
                // if (that_.option.name == 'F-16') {
                //     that_.addPoint_test(that_.position,Cesium.Color.RED)
                // }
                // if (that_.option.name == '$地空导弹_中远.111') {
                //     // that_.addPoint_test(that_.position,Cesium.Color.RED)
                //     console.log('%c [ this.position ]-135', 'font-size:13px; background:pink; color:#bf2c9f;', that_.position)
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

                    // 原 watcher 中的代码 --- start - 当时是利用 vue 中 watch 的特性及时拿到最新的点

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
        // 如果想要 继续使用 Entity 创建的 飞机雷达，现在的后端数据不行
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
            show:data.alive,// 1 就是模型还需要显示，0 不显示
         */

        if (this.option.name == 'F-16') {
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
        // this.beforePosition = this.position.clone();
        if (option.show) {
            this.position = option.position.clone();
        } else {
            // 当前模型相关的内容都消失
            // 模型，label， tail
            this.model.show = false;
            this.tail.clear = true;
            // this.radar.show = false;
        }


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

        this.speed = option.speed;

        // test
        //  测试 从后端得到的数据是否 连续: 结论：初始的10几个点不连续，之后的点都是连续的
        // if (this.option.name == 'F-16') {
        //     this.addPoint_test(option.position);//,color=Cesium.Color.YELLOW)
        // }
        // test



        // radar --- 相关的数据更新真的是毫无规律，所以尝试不用此处的到的数据的position，使用其他数据
        // const nextTime = Cesium.JulianDate.addSeconds(this.lastTime, option.timeStamp, new Cesium.JulianDate());
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

        if (!this.tail) {
            this.tail = this.DynamicTail(arr,stArr);// 法向量目前不用
        } else {
            this.tail.positionArray = arr;
            this.tail.stArray = stArr;
        }
        // this.tail = this.DynamicTail(arr,stArr);// 法向量目前不用
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
    DynamicTail(typedArray,stArray,normalsArray) {
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
        class DynamicTailPrimitive {
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
            new DynamicTailPrimitive({
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


    getColorBlendMode(colorBlendMode) {
        return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
    }
    getColor(colorName, alpha) {
        const color = Cesium.Color[colorName.toUpperCase()];
        return Cesium.Color.fromAlpha(color, parseFloat(alpha));
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

        option.position = this.curPos;
        this.radarClass = new RadarReconnaossance(this.viewer, option);
        this.radar = this.radarClass.radar;
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

}

export default DynamicPrimitiveModel