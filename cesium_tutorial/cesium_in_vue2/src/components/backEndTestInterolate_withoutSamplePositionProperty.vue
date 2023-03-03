<template>
    <div>
        <el-button @click="start" class="Btn">Start</el-button>
        <el-button @click="stop" class="Btn stopBtn">Stop</el-button>
        <el-button @click="pause" class="Btn pauseBtn">Pause</el-button>
        <el-button @click="speedUp(1)" class="Btn speedUpBtn"
            >Speed Up</el-button
        >
        <el-button @click="speedUp(0)" class="Btn speedDownBtn"
            >Speed Down</el-button
        >
        <el-button @click="getVal" class="Btn getValBtn">获取数据</el-button>
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
import addEntityModel from "../utils/addEntityModel.js";
import translatePointAlongAxis from "../utils/translatePointAlongAxis.js";
import addStaticEntityModel from "../utils/addStaticEntityModel.js";
import addStaticLabel from "../utils/addStaticLabel.js";
import createCustomMaterialForLineNoImg from "../utils/createCustomMaterialForLineNoImg.js";

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
            SampledPositionProperty: new Cesium.SampledPositionProperty(),//for test
            modelPoss:[],//for test
        };
    },
    // sockets:{
    //     getSimDataEvent: data => {
    //         console.log('welcome data1111111111111111111111111 ', data)
    //         alert(111111111111111111111111111);
    //     }
    // },
    methods: {
        addPoint_test(position,color=Cesium.Color.YELLOW) {
            this.viewer.entities.add({
                position: position,
                point: {
                    pixelSize: 10,
                    color: color,
                },
            });
        },

        getVal() {
            console.log("this.modelPoss", JSON.stringify(this.modelPoss));
            // console.log("this.modelMap", this.modelMap);
            // let res = this.modelMap.get("F-16"); //.distance;
            // console.log("res", res);
            // console.log(`F-16对应的 radiusS: `, JSON.stringify(res.radiusS));


            // console.log("this.viewer.scene.primitives", this.viewer.scene.primitives);

        },
        initStatus() {
            this.groundRadarMap.clear();
            this.staticMap.clear();
            this.modelMap.clear();
            this.labelMap.clear();
            this.axisMap.clear();
            this.twoPointMap.clear();
            this.interpolatedPosMap.clear();
            this.timeStapMap.clear();
        },
        pause() {
            this.$socket.emit("suspendEvent");
            this.sockets.unsubscribe("getSimDataEvent");

            this.viewer.clock.shouldAnimate = false; // 用于暂停 Viewer.Clock 的时间继续向前跑---因为用了 SampledPositionProperty，和 clock 有关联。
        },

        // 加速 减速-----------
        // 两个浮点数相减
        accSub(num1, num2) {
            var r1, r2, m;
            try {
                r1 = num1.toString().split(".")[1].length;
            } catch (e) {
                r1 = 0;
            }
            try {
                r2 = num2.toString().split(".")[1].length;
            } catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2));
            var n = r1 >= r2 ? r1 : r2;
            return (Math.round(num1 * m - num2 * m) / m).toFixed(n);
        },
        output(message) {
            var currentTime =
                "<span class='time'>" +
                moment().format("HH:mm:ss.SSS") +
                "</span>";
            var element = $("<div>" + currentTime + " " + message + "</div>");
            $("#console").prepend(element);
        },
        speedUp(flag) {
            let speed = this.speed;
            if (flag == 1) {
                //加速
                speed = speed >= 1 ? speed + 1 : this.accAdd(speed, 0.1);
            } else {
                //减速
                speed = speed > 1 ? speed - 1 : this.accSub(speed, 0.1);
            }
            // console.log(flag == 1 ? '加速，speed=' + speed : '减速，speed=' + speed);

            // $('#speed').attr('value', speed);

            // if (speed == 10) {
            //     $("#addSpeed").attr("disabled", true);
            // } else if (speed == 0.1) {
            //     $("#subtractSpeed").attr("disabled", true);
            // } else {
            //     $("#addSpeed").attr("disabled", false);
            //     $("#subtractSpeed").attr("disabled", false);
            // }

            this.$socket.emit("setSpeedEvent", { message: speed });
            // this.$socket.emit('suspendEvent');
            this.sockets.unsubscribe('setSpeedEvent');
            console.log("1111111111111");
        },
        // 加速 减速----------

        start() {
            this.$socket.open(); // 开始连接socket
            this.$socket.emit("startEvent");
            // 订阅事件
            this.sockets.subscribe("getSimDataEvent", function (res) {
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

                let data = JSON.parse(res);
                // console.log('welcome data ', res)
                // console.log((new Date()).getMilliseconds(), 'current data:', data);

                if (data.lat && data.lon || data.alt) {
                    let curPosition = Cesium.Cartesian3.fromDegrees(data.lon, data.lat, data.alt);

                    if (data.unitName == 'F-16') {
                        this.addPoint_test(curPosition, Cesium.Color.RED);// 得到的点除了偶尔的丢包之外，没问题。
                    }

                    if (0) {
                        if (this.twoPointMap.has(data.unitName)) {
                            // 保持长度为 2
                            if (this.twoPointMap.get(data.unitName).length > 2) {
                                this.twoPointMap.get(data.unitName).shift();
                            }
                            this.twoPointMap.get(data.unitName).push(curPosition);
                        } else {
                            this.twoPointMap.set(data.unitName, []);
                            this.twoPointMap.get(data.unitName).push(curPosition);
                        }
                        if (this.twoPointMap.get(data.unitName).length > 1) {
                            let start = this.twoPointMap.get(data.unitName)[0];
                            let end = this.twoPointMap.get(data.unitName)[1];

                            let interpolatedPos = [];
                            let interpolateNum = 500;
                            for (let i = 0; i < interpolateNum; i++) {
                                let t = i / interpolateNum;
                                // console.log("t", t);
                                // Cesium.Cartesian3.lerp = function (start, end, t, result) { }
                                let cur = new Cesium.Cartesian3();
                                Cesium.Cartesian3.lerp(start, end, t, cur); // 这个涉及到数据如何给我？？

                                interpolatedPos.push(cur);
                            }
                            // console.log("interpolatedPos", interpolatedPos);
                        }

                        // 这个方法 模型的移动一下子一下子的
                        if (this.modelMap.has(data.unitName)) {
                            this.modelMap.get(data.unitName).position = curPosition;
                            this.labelMap.get(data.unitName).updatePosition(curPosition);
                            this.axisMap.get(data.unitName).modelMatrix = this.modelMap.get(data.unitName).computeModelMatrix(Cesium.JulianDate.now());
                        } else {
                            let curModel = this.importEntityModel(this.viewer, {
                                position: curPosition,
                                minimumPixelSize: 120,
                                // maximumScale: 2000,
                            });
                            let M = curModel.computeModelMatrix(
                                Cesium.JulianDate.now()
                            );
                            let curAxis = showAxis(
                                { modelMatrix: M },
                                this.viewer.scene
                            );

                            // class addLable(viewer, modelCartesian3, labelOption) {
                            let label = new addLabel(this.viewer, curPosition, {
                                text: data.unitName,
                            });

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
                            let curOrientation = HPR2Orientation(
                                curPosition,
                                heading,
                                pitch,
                                roll
                            );
                            // console.log("curOrientation", curOrientation);
                            // this.modelMap.get(data.unitName).orientation = curOrientation;

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
                    // 添加静态
                    if (data.unitName.indexOf('阵地') > -1 ) {
                        // if (data.unitName == "红旗9阵地") {
                        // if (data.unitName == "近程地导阵地-2") {
                        // if (data.unitName == "地导阵地-1") {
                        if (this.staticMap.has(data.unitName)) {
                            if (this.groundRadarMap.has(data.unitName) && data.simRadarBeamDto.state != undefined) {
                            // if ((data.simRadarBeamDto.state + 1)) {
                                this.groundRadarMap.get(data.unitName).showOrNot(data.simRadarBeamDto.state);//1 为照射 0 为取消照射
                            }
                        } else {
                            let curModel = new addStaticEntityModel(this.viewer, {
                                position: curPosition,
                                name: data.unitName,
                                src: './models/WoodTower/Wood_Tower.gltf'
                            });
                            this.staticMap.set(data.unitName, curModel);
                            // this.staticMap.set(data.unitName, true);//因为只是作为判断标识，并不需要存储起来进行后续操作

                            // 添加对应的Label
                            let label = new addStaticLabel(
                                this.viewer,
                                { position: curPosition, id: curModel.entity.id },
                                { text: data.unitName, }
                            );
                            // 添加对应的雷达
                            /*
                                option:{
                                    angleOfHollow: Number  0 < number < 90
                                    radius:  Number  0 < number < 90
                                    position: Cartesian3
                                    zoomTo:Boolean  是否将相机对准生成的 雷达模型，默认为true
                                }
                            */
                            if (!this.groundRadarMap.has(data.unitName)) {
                                let curGroundRadar = new createGroundRader(this.viewer, {
                                    name:data.unitName,
                                    // angleOfHollow:30.0,
                                    // radius: 50,// 200000.0
                                    position: Cesium.Cartesian3.fromDegrees( data.simRadarBeamDto.lon, data.simRadarBeamDto.lat, data.simRadarBeamDto.alt ),
                                    // zoomTo:Boolean  是否将相机对准生成的 雷达模型，默认为true
                                    color: data.simRadarBeamDto.colorRgb ? Cesium.Color.fromCssColorString(data.simRadarBeamDto.colorRgb) : Cesium.Color.RED,
                                    alpha: data.simRadarBeamDto.pellucidity ? (Number(data.simRadarBeamDto.pellucidity) / 100).toFixed(2) : 0.01,
                                    pitchAngleRange: data.simRadarBeamDto.scanzonePitchAngleRange,// :90.0, //扫描区域俯仰角范围
                                    radius:data.simRadarBeamDto.scanzoneDistance,
                                });
                                this.groundRadarMap.set(data.unitName, curGroundRadar);
                            }
                            /*
                                {
                                    "alive":1,
                                    id":4,
                                    "lat":25.443275,
                                    "lon":117.79541,
                                    "alt":0.0,
                                    "phi":0.0,
                                    "psi":1.570796,
                                    "simRadarBeamDto":{
                                        "state":1  //1 为照射 0 为取消照射   ---OK

                                        //! 需要给个新的定位  ---OK
                                        "lat":25.443275,
                                        "lon":117.79541,
                                        "alt":10.0,

                                        "colorRgb":"255,0,0",           //颜色 r g b，当前扫描区域和波束是同样颜色        ---OK
                                        "pellucidity":100,              //透明度，只有扫描区域可以设置透明度，波束默认为不透明   ---OK

                                        "scanzoneType":2,               //扫描区域形状，1渐变圆锥，2实心扇形，3波纹扇形，4地面雷达-半圆球(现在只有2好使)---后面这个注释？？ ---- 暂时先不管这个变量
                                        "scanzonePointType":1, 	        //扫描区域指向类型 1使用给定机头指向，0自定义指向(现在因为不显示扫描区域，所以设1/0皆可) ---》 目前先不用管这个参数： 但是B端确实可以实现自定义指向
                                        "scanzonePitchAngleRange":90.0, //扫描区域俯仰角范围   ---OK
                                        "scanzoneAzimuthRange":360.0,   //扫描区域方位范围 --- 如果不是360 度怎么办？
                                        "scanzoneDistance":350000.0,    //扫描区域作用距离(雷达长度) --- OK
                                        "scanzoneAzimuthPointTo":90.0,  //扫描区域方位指向 --- 没用到
                                        "scanzonePitchPointTo":0.0,     //扫描区域俯仰指向 --- 没用到

                                        "beamScanType":2,               //1: 手动设置扫描波束指向角度（与扫描区域左侧边缘的夹角位置），2，自动同方向循环扫描 3：自动往复扫描.（现在用1,  2/3自定义参数接口都尚未开放） --- B端暂时也是
                                        "beamAzimuthPointTo":90.0,      //波束方位指向
                                        "beamPitchPointTo":0.0,         //波束俯仰指向
                                        "beamAngle":0.0,                //波束俯仰指向
                                        "beamDistance":350000.0,        //波束距离

                                        "beamId":"红旗9阵地",
                                        "id":7,
                                        "intTime":0,
                                    },
                                    "theta":0.0,
                                    "time":0.0,
                                    "unitId":103,
                                    "unitName":"红旗9阵地"
                                }
                            */
                        }
                    }
                    // 添加会动的模型
                    if (data.unitName.indexOf('阵地') == -1 && data.alt) {
                        // 添加 model
                        if (this.modelMap.has(data.unitName)) {
                            // this.modelMap.get(data.unitName).updatePosition(curStap/1000 -  0.1 > 0 ?  curStap/1000 : 0.1 ,curPosition);
                            // let stap = data.time > 0 ? 0.1 : 0.000001;
                            if (data.time > 0) {
                                // this.modelMap.get(data.unitName).updatePosition(0.1,curPosition);

                                this.modelMap.get(data.unitName).updatePosition({
                                    position: curPosition,
                                    heading: data.phi,
                                    pitch: data.psi,
                                    roll: data.theta
                                });
                                if (data.unitName == 'F-16') {
                                    this.modelPoss.push(curPosition);
                                }
                                // this.timeStapMap.set(data.unitName, curTime);
                            }
                        } else {
                            let isMissile = data.unitName.indexOf('导弹') > -1;//导弹 不加 radar
                            // data.simRadarBeamDto.outline = true;// 可以通过这种方式设置 outline
                            let curModel = new addEntityModel(this.viewer, {
                                position: curPosition,
                                name: data.unitName,
                                radar: isMissile ? false : true,
                                radarOption:data.simRadarBeamDto,//只有在 radar 为 true 时生效
                                // src: data.unitName.indexOf('导弹') > -1 ?
                                heading: data.phi,
                                pitch: data.psi,
                                roll: data.theta
                            });
                            this.modelMap.set(data.unitName, curModel);

                            // this.timeStapMap.set(data.unitName, (new Date()).getMilliseconds());
                        }
                        // // 添加 坐标轴
                        // if (this.axisMap.has(data.unitName)) {
                        //     if (data.time > 0) {
                        //         let M = this.modelMap.get(data.unitName).entity.computeModelMatrix(Cesium.JulianDate.now(), new Cesium.Matrix4());
                        //         this.axisMap.get(data.unitName).modelMatrix = M;
                        //     }
                        // } else {
                        //     let M = this.modelMap.get(data.unitName).entity.computeModelMatrix(Cesium.JulianDate.now(), new Cesium.Matrix4());
                        //     if (M) {
                        //         let curAxis = showAxis( { modelMatrix: M }, this.viewer.scene );
                        //         this.axisMap.set(data.unitName, curAxis);
                        //     }
                        // }
                        // 添加 Label
                        if (this.labelMap.has(data.unitName)) {
                            if (data.time > 0) {
                                this.labelMap.get(data.unitName).updatePosition(0.11,curPosition);
                            }
                        } else {
                            // class addLable(viewer, modelOption={position:'must'}, labelOption={name:'needed,better must'}) {
                            let label = new addLabel(
                                this.viewer,
                                { position: curPosition, id:this.modelMap.get(data.unitName).entity.id},
                                { text: data.unitName, }
                            );
                            this.labelMap.set(data.unitName, label);
                        }
                    }
                    // 飞机模型与地面战之间的连线
                    // 查看C端demo后，发现基本规则是：
                    //     1.飞机进度地面战雷达，开始出现飞机到地面战雷达的连线；
                    //     2.在飞机雷达的监测范围触碰到小地面站雷达是，出现地面战雷达到飞机的连线
                    // function lineFromMiddileToTarget(viewer,lineOption,materialOption) {
                    // lineFromMissileToTarget

                }

            });

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
            this.sockets.unsubscribe("getSimDataEvent");
            this.$socket.close();

            // 删除 目前已经渲染完成的所有primitive
            this.viewer.entities.removeAll(); // 加上这句话是因为： 在切断与后端链接时，飞机尾迹 不能消失。
            // 目前 tail 是通过 DrawCommand 生成的---- 想办法删除
            // this.viewer.scene.primitives.removeAll(); // 通过这种方式删除DrawCommand的话，会在 DrawCommand 删除后报错： This object was destroyed, i.e., destroy() was called.
            // 每个创建的 Model 都有一个 tailPrimitive 属性
            // this.modelMap.clear();
            // this.modelMap.forEach(function(value,key){
            //     // console.log('value', value, 'key', key);
            //     // console.log('value.tailPrimitive', value.tailPrimitive);
            //     value.tailPrimitive.destroy()

            // });

            this.initStatus();

        },
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

        fromDoc() {
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

        testAddMultiModel() {
            let lon = -123.0744619;
            let lat = 44.0503706;
            let curPosition = Cesium.Cartesian3.fromDegrees(lon, lat, 5000.0);
            let a = new addEntityModel(this.viewer, curPosition);
            let curPosition2 = Cesium.Cartesian3.fromDegrees(
                lon - 10.8,
                lat,
                5000.0
            );
            let b = new addEntityModel(this.viewer, curPosition2);
            let curPosition3 = Cesium.Cartesian3.fromDegrees(
                lon - 21.6,
                lat,
                5000.0
            );
            let c = new addEntityModel(this.viewer, curPosition3);

            let lastTime;
            setInterval(() => {
                lon = 0.0003 * Math.random();
                lat = 0.0001;

                let curPosition = Cesium.Cartesian3.fromDegrees(
                    lon,
                    lat,
                    50000.0
                );
                let curPosition2 = Cesium.Cartesian3.fromDegrees(
                    lon - 10.8,
                    lat,
                    50000.0
                );
                let curPosition3 = Cesium.Cartesian3.fromDegrees(
                    lon - 21.6,
                    lat,
                    50000.0
                );

                a.updatePosition(30, curPosition);
                b.updatePosition(30, curPosition2);
                c.updatePosition(30, curPosition3);

                // a.getPosition(1,curPosition)
                // b.getPosition(1,curPosition2)
                // c.getPosition(1,curPosition3)
            }, 30000);
        },

        // waiting for test : 初步尝试了一下，不好用，：再次尝试，使用 PlaneGeometry 进行添加，再不行就得自己创建一个自定义Primitive了。。。
        addTail_Plane_Ori(time,pos) {
            // 在 this.property 的基础上，在 this.property 已经有了一定数量的点之后，再给 path 的 position 进行赋值
            // if (!this.tailPosition) {
            //     this.tailPosition = new Cesium.SampledPositionProperty();
            // }
            // this.tailPosition.addSample(time, pos);

            // Plane
            /*
                使用注意事项：
                1. dimensions 的 第一个参数是动态变化的： Cesium.Cartesian3.distance(left, right)
                2. plane 的 position 需要时刻处在变化中的 width 的中间，： Cesium.Cartesian3.midpoint(left, right, result)
            */

            // Primitive Model
            const plane = new Cesium.PlaneGeometry({
                vertexFormat : Cesium.VertexFormat.POSITION_ONLY
            });
            console.log("plane", plane);
            let planeGeometry = Cesium.PlaneGeometry.createGeometry(plane);
            console.log("planeGeometry", planeGeometry);
            planeGeometry.attributes.position = new Cesium.GeometryAttribute({
                componentDatatype : Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute : 3,
                values : new Float32Array([
                    0.0, 0.0, 0.0,
                    7500000.0, 0.0, 0.0,
                    0.0, 7500000.0, 0.0
                ])
            })
            // const geometry = new Cesium.Geometry({
            //     attributes : {
            //       position : new Cesium.GeometryAttribute({
            //         componentDatatype : Cesium.ComponentDatatype.FLOAT,
            //         componentsPerAttribute : 3,
            //         values : new Float32Array([
            //           0.0, 0.0, 0.0,
            //           7500000.0, 0.0, 0.0,
            //           0.0, 7500000.0, 0.0
            //         ])
            //       })
            //     },
            //     primitiveType : Cesium.PrimitiveType.LINE_LOOP
            //   });

            const geometry = new Cesium.GeometryInstance({
                geometry: planeGeometry,
            });
            console.log("geometry", geometry);

            const primitive = new Cesium.Primitive({
                id: Symbol('image'),
                geometryInstances: geometry,
                appearance: new Cesium.EllipsoidSurfaceAppearance({
                    aboveGround: false,
                    material: new Cesium.Material({
                        fabric: {
                            type: 'Image',
                            // @link https://github.com/CesiumGS/cesium-materials-pack
                            uniforms: {
                                image: 'https://sakitam-1255686840.cos.ap-beijing.myqcloud.com/public/codepen/wind/20200620-0p50/raster/var_tmp.png',
                            },
                        }
                    }),
                }),
                asynchronous: false, // 确定图元是异步创建还是阻塞直到准备就绪
                compressVertices: false, // 启用顶点压缩
            });

            this.viewer.scene.primitives.add(primitive);
        },
        customBox(time,pos) {
            var viewer = this.viewer;

            var boxLength = 100000.0;
            var position = Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * boxLength);// Box 的质心
            // viewer.entities.add({
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

            showAxis(myBox, viewer.scene,100000);

            viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, 100000));

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
            // 平移 myBox
            // position

            let translatedPos = translatePointAlongAxis(position, { x: 100000, y: 0, z: 0 });
            // viewer.entities.add({
            //     position: translatedPos,
            //     point: {
            //         pixelSize: 10,
            //         color: Cesium.Color.RED,
            //     },
            // });

            // let translateMatrix = this.getTranslateModelMatrix(position, { x: -100000, y: 0, z: 0 });
            // let newMatrix = Cesium.Matrix4.multiply(modelMatrix, translateMatrix, new Cesium.Matrix4());
            // myBox.modelMatrix = newMatrix;

            // let newMatrix4 = Cesium.Matrix4.multiply(modelMatrix, rotationM, new Cesium.Matrix4());// 计算矩阵4的变换矩阵（在原变换中，累加变换）
            let ray = viewer.camera.getPickRay(translatedPos);
            let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            let headingPitchRoll = new Cesium.HeadingPitchRoll( Cesium.Math.toRadians(0),0,0);
            let m = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
            myBox.modelMatrix = m;


            // 旋转 --- OK
            // let rotationM = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(45)); // rtaleX表示水平方向旋转的度数
            // let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotationM, new Cesium.Matrix4())
            // myBox.modelMatrix = newMatrix4;

            // 平移 Primitive Model： https://blog.csdn.net/qq_24641385/article/details/106085428

        },

        getTranslateModelMatrix(pos,distances={x:0,y:500,z:0}) {
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

            // 最终的矩阵
            let transitionMatrix = Cesium.Matrix4.fromTranslation(world_translation); // 构造平移矩阵并赋值

            return transitionMatrix;
        },

        custom2Triangle(viewer) {
            /*
                + Primitive
                    - GeometryInstance | GeometryInstance[]
                        - Geometry
                            - GeometryAttributes
                                - GeometryAttribute
                    - Appearance
            */
            //  Primitive API 直到传递给 WebGL 之前，想要在地球上绘制正确，必须是世界坐标。

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
            }`
            const fsSource = `
            varying vec4 v_color;

            void main() {
                gl_FragColor = v_color;
            }`


            /* 计算顶点坐标 */
            const coords = this.SampledPositionProperty;
            // const coords = new Cesium.SampledPositionProperty();
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
            const coords_vbo = new Float64Array(coords.flat())
            /* 结束计算顶点坐标 */


            /* 装配并创建 Primitive */
            const geometry = new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: coords_vbo
                    }),
                    color: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.UNSIGNED_BYTE,
                        componentsPerAttribute: 4,
                        values: new Uint8Array([
                            255, 10, 10, 123,
                            10, 255, 10, 123,
                            10, 10, 255, 123,
                            255, 10, 10, 123,
                            10, 255, 10, 123,
                            10, 10, 255, 123,
                        ])
                    }),
                },
                boundingSphere: Cesium.BoundingSphere.fromVertices(coords_world.flat())
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

            viewer.scene.primitives.add(primitive)

            /* 定位 */
            viewer.camera.setView({
                destination: new Cesium.Cartesian3(-5079092, 11300083, 4872035),
                orientation: {
                    heading: 6.28,
                    pitch: -1.57,
                    roll: 0
                }
            })

            /* 点击拾取 */
            // const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
            //     handler.setInputAction((e) => {
            //         const result = viewer.scene.pick(e.position)
            //         console.log(result)
            //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
            // }

        }
    },
    created() {
        this.searcher2TargetLine = new Map();
        this.groundRadarMap = new Map();
        this.modelMap = new Map();
        this.staticMap = new Map();
        this.labelMap = new Map();
        this.axisMap = new Map();
        this.twoPointMap = new Map();
        this.interpolatedPosMap = new Map();

        this.timeStapMap = new Map();
    },
    mounted() {
        Cesium.Ion.defaultAccessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo";

        let viewer = new Cesium.Viewer("cesiumContainer", {
            shouldAnimate: true, //有动画
            animation: false,  //动画控制不显示
            timeline: false,    //时间线不显示
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

        // 设置相机初始位置
        // 这一步不要放到 click 里面，会引发问题
        // 将相机设置到台湾，因为目前的demo 在 台湾附近
        // 东经119°18′03〃至124°34′30〃，北纬20°45′25〃至25°56′30〃之间
        let taiwan = Cesium.Cartesian3.fromDegrees(119.19, 24.46, 800000);
        this.viewer.camera.flyTo({
            destination: taiwan, // camera.position,
            // orientation: {
            //     heading: data.phi,
            //     pitch: data.psi,
            //     roll: data.theta
            // },
            // maximumHeight: 10000,
            // complete: function () {
            //     // callback();
            //     console.log("this.viewer----", viewer);
            //     viewer.trackedEntity = this.curModel;
            // }
        });

        let that_ = this;
        let lastSilhouettedModel = null;
        // 鼠标双击模型，对应的模型显示轮廓
        handler.setInputAction(function (movement) {
            // 首先进行状态清理 --- 在允许的范围内，同时只有一个模型显示轮廓
            if (lastSilhouettedModel) {
                if (lastSilhouettedModel instanceof Cesium.Entity) {
                    lastSilhouettedModel.silhouetteColor = null;
                    lastSilhouettedModel.silhouetteSize = null;
                } else {
                    alert('current model is a instance of Primitive')
                }
            }

            // console.log('双击......')
            // 获取模型定位
            let feature = viewer.scene.pick(movement.position);
            if (!Cesium.defined(feature)) { return; }
            if (feature.id) {
                const entity = feature.id;
                // 处理双击事件
                if (entity instanceof Cesium.Entity) {
                    if (entity._model) {

                        if (that_.modelMap.has(entity.name)) {
                            let curModel = that_.modelMap.get(entity.name);
                            curModel.silhouetteColor = Cesium.Color.GREEN;
                            curModel.silhouetteSize = 5;

                            lastSilhouettedModel = curModel;
                        }
                        if (that_.staticMap.has(entity.name)) {
                            let curModel = that_.staticMap.get(entity.name);
                            curModel.silhouetteColor = Cesium.Color.RED;
                            curModel.silhouetteSize = 5;

                            lastSilhouettedModel = curModel;
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // this.custom2Triangle(viewer);


        // 在这里添加 模型间的连线 -- 可以成功添加连线，但是material还没有进行添加
        if (0) {
            viewer.scene.postUpdate.addEventListener(function (scene, time) {
                // 判断条件大概率是距离，和雷达半径进行比较
                // 如果距离 《= 对应的雷达半径，则显示 对应的 连线
                // 这条线，地面站的点是不动的，飞机的点是动的//CallbackProperty ，这样的话，两个点都是动的都OK
                // this.modelMap = new Map(); //
                // this.groundRadarMap = new Map(); // 任何一个目标都可以进入地面雷达的扫描范围
                // 和测试进行了确认：这个line 的显示与否，完全由后端数据决定，C端的前段不必计算

                for (let [modelKey, modelValue] of that_.modelMap) {
                    if (modelValue.option.name == 'F-16') {
                        for (let [radarKey, radarValue] of that_.groundRadarMap) {
                            // console.log("modelValue.position", modelValue.position);//addEntityModel   .position
                            // console.log("radarValue.position", radarValue.position);//createGroundRader   .position  .radius
                            // console.log("radarValue.radius", radarValue.radius);//createGroundRader   .position  .radius
                            // console.log("radarValue.name", radarValue.name);//createGroundRader   .position  .radius
                            if (radarValue.name == '红旗9阵地') {
                                let name;

                                let modelCurPos = modelValue.property.getValue(time);
                                // console.log("modelCurPos", modelCurPos);
                                if (modelCurPos) {
                                    let distance = Cesium.Cartesian3.distance( modelCurPos, radarValue.position);
                                    // console.log("distance", distance, "radarValue.radius", radarValue.radius);
                                    // console.log("Math.abs(distance - radarValue.radius)",Math.abs(distance - radarValue.radius))
                                    if (distance - radarValue.radius <= 0) {
                                        let newMaterialName = createCustomMaterialImg({
                                            img: "./imgs/fromShang/Dirlinetexture01.png",
                                            type: 'PolylineBlackWhiteColor',//type的命名规则： polyline/polygon/图元名称 + 描述(根据具体特性)
                                            // diffuse: 4.0,// 这个值为 1 或者 小于 1 ，成为白色；  大于 1，颜色表面增加一层灰度； 默认 2.0；
                                            // animationSpeed: 0.5,// 动画效果的速率，必须大于0。 大于 1 相当于 加速相应倍数； 大于 0 小于 1 相当于 减慢 相应倍数
                                        });
                                        let newMaterialName2 = createCustomMaterialForLineNoImg({
                                            // img: "./imgs/blackAndWhite.png",
                                            type: 'runningGreen&TransparentLine',//type的命名规则： polyline/polygon/图元名称 + 描述(根据具体特性)
                                            // diffuse: 4.0,// 这个值为 1 或者 小于 1 ，成为白色；  大于 1，颜色表面增加一层灰度； 默认 2.0；
                                            // animationSpeed: 0.5,// 动画效果的速率，必须大于0。 大于 1 相当于 加速相应倍数； 大于 0 小于 1 相当于 减慢 相应倍数
                                            uniforms:{
                                                color: new Cesium.Color(0.2, 1.0, 0.0, 1.0),
                                                repeat: 30.0,
                                                offset: 0.01,
                                                thickness: 0.83,
                                            },
                                            fragmentShader: `
                                                uniform vec4 color;
                                                uniform float repeat;
                                                uniform float offset;
                                                uniform float thickness;

                                                czm_material czm_getMaterial(czm_materialInput materialInput)
                                                {
                                                    czm_material material = czm_getDefaultMaterial(materialInput);
                                                    float sp = 1.0/repeat;
                                                    vec2 st = materialInput.st;
                                                    float dis = distance(st, vec2(20.0,10.0));
                                                    float m = mod(dis + offset, sp);
                                                    // float m = step(dis + offset, sp);
                                                    float a = step(sp*(1.0-thickness), m);

                                                    material.diffuse = color.rgb;
                                                    material.alpha = a * color.a;

                                                    return material;
                                                }
                                            `,
                                        });
                                        // "./imgs/pureWhite.png";
                                        // "./imgs/white.png";
                                        // "./imgs/mixColor.png";
                                        // "./imgs/blue.png";
                                        // "./imgs/colors.png";

                                        let appearance = new Cesium.MaterialAppearance({
                                            // 贴图像纹理
                                            // material: Cesium.Material.fromType('Image', {
                                            //     image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png'
                                            // }),

                                            // 贴棋盘纹理
                                            // material: Cesium.Material.fromType('Checkerboard'),

                                            // 自定义纹理
                                            material: new Cesium.Material({
                                                fabric: {
                                                    type: 'VtxfShader1',
                                                    uniforms: {
                                                        color: new Cesium.Color(0.2, 1.0, 0.0, 1.0),
                                                        repeat: 30.0,
                                                        offset: 0.0,
                                                        thickness: 0.3,
                                                    },
                                                    source: `
                                                uniform vec4 color;
                                                uniform float repeat;
                                                uniform float offset;
                                                uniform float thickness;

                                                czm_material czm_getMaterial(czm_materialInput materialInput)
                                                {
                                                    czm_material material = czm_getDefaultMaterial(materialInput);
                                                    float sp = 1.0/repeat;
                                                    vec2 st = materialInput.st;
                                                    float dis = distance(st, vec2(0.5));
                                                    float m = mod(dis + offset, sp);
                                                    float a = step(sp*(1.0-thickness), m);

                                                    material.diffuse = color.rgb;
                                                    material.alpha = a * color.a;

                                                    return material;
                                                }
                                            `
                                                },
                                                translucent: false
                                            }),
                                            faceForward: false, // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
                                            closed: true // 是否为封闭体，实际上执行的是是否进行背面裁剪
                                        });
                                        // console.log("newMaterialName2",newMaterialName2)

                                        name = `${modelValue.option.name}2${radarValue.name}`;//地面站雷达为基准
                                        let line = that_.viewer.entities.add({
                                            name: name,
                                            polyline: {
                                                // positions: Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]),
                                                positions: new Cesium.CallbackProperty(function (time, result) {
                                                    let modelPos = modelValue.property.getValue(time);
                                                    // console.log("modelPos", modelPos);
                                                    if (modelPos) {
                                                        return [radarValue.position,modelPos]
                                                    }
                                                },false),
                                                // positions: Cesium.Cartesian3.fromDegreesArray([55, 35, 125, 35]),
                                                width: 5,
                                                // material: new Cesium[newMaterialName2](Cesium.Color.GREEN, 300, 1),
                                                material: new Cesium[newMaterialName](null, 300, 1),
                                                // material: Cesium.Color.RED,
                                                // material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.WHITE, 3000, 1),
                                                // material: new Cesium[newMaterialName](Cesium.Color.WHITE.withAlpha(0.6), 3000, 1),

                                                // clampToGround: true,
                                            },
                                        });

                                        if (!that_.searcher2TargetLine.has(name)) {
                                            that_.searcher2TargetLine.set(name, line);
                                        }
                                    } else {
                                        if (name && that_.searcher2TargetLine.has(name)) {
                                            let curLine = that_.searcher2TargetLine.get(name, line);//Entity
                                            if (that_.viewer.entities.remove(curLine)) {
                                                console.log("删除成功");
                                            } else {
                                                console.log("删除失败");
                                            }
                                        }
                                    }
                                }
                            }

                        }
                    }
                }

            });
        }




        // 关于Plane 变成 Tail 的测试
        // this.customBox();// 转移到 addEntityModel 测试是否可以使用 SamplePositionProperty


        // 创建一个demo，侦查机侦查的雷达扫描范围
        // this.movingModel();
        // let positions = new Cesium.SampledPositionProperty();
        // let positions = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0);
        // this.curModel = this.importEntityModel(viewer, {
        //     position: positions,
        //     minimumPixelSize: 12000,
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

        // this.fromDoc();

        // this.testAddMultiModel();

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

    beforeDestroy() {
        // 关闭 Socket
        // this.sockets.unsubscribe('getSimDataEvent');
        // this.$socket.close();
        this.stop();
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
