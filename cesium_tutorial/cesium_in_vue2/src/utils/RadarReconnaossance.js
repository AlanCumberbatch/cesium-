import * as Cesium from 'cesium'

// 创建侦察机的雷达模型
class RadarReconnaossance {
    constructor(viewer, option = {}) {

        if (!viewer) { alert('必须传入 viewer'); return; }
        if (!option.position) { alert('position 必须通过第二个对象参数传入'); return; }

        this.viewer = viewer;
        this.option = option;
        this.position = option.position;
        this.radar = null;


        this.silhouetteColor = null; //Cesium.Color.WHITE;
        this.silhouetteSize = null; //10;

        this.hpRoll = new Cesium.HeadingPitchRoll();

        this.curPos = null;
        this.HeadingPitchRoll = null;
        this.curOrientation = null;

        this.init();
    }

    init() {
        // if (this.position instanceof Cesium.SampledPositionProperty) {
        //     this.createPropertyRadar(this.option);// use Primitive Create Model --- Cesium's Property means sth connected with clock
        // } else if (this.position instanceof Cesium.Cartesian3) {
        //     this.createRadar(this.option);
        // }

        // 用这种方式搭配 Primitive 的 Model，存在很大偏差，不能用
        this.position = new Cesium.SampledPositionProperty()
        this.position.addSample(new Cesium.JulianDate.now(), this.option.position);
        this.option.position = this.position;
        this.createPropertyRadar(this.option);
    }


    /**
     *  time： 秒
     *  position： 当前秒数内行驶路径的终点
     */
    updateOption(option) {

        if (option && option.position) {

            this.addPoint_test(option.position);// OK

            // this.radar.position = option.position;
            // this.radar.orientation = Cesium.Transforms.headingPitchRollQuaternion(option.position, option.HeadingPitchRoll);

            this.curPos = option.position;
            this.HeadingPitchRoll = option.HeadingPitchRoll;
            // this.curOrientation = Cesium.Transforms.headingPitchRollQuaternion(option.position, option.HeadingPitchRoll);


            // // 获取当前 fps--- start
            // // fpsContainer[0].style.display = 'none';// 在源码里面进行demo的不显示的操作
            // this.curFps = this.viewer.scene._performanceDisplay._fpsText.nodeValue.slice(0, 2);
            // // 获取当前 fps--- end
            // this.curFpsS.push(this.curFps);//for test

            // // 需要更新的有：
            // // 1. hpRoll （进而自动更新 hpRange
            // this.hpRoll.heading = option.heading;// 就是 弧度 //  Cesium.Math.toRadians(option.pitch);
            // this.hpRoll.pitch = option.pitch;
            // this.hpRoll.roll = option.roll;

            // // 2. position
            // this.beforePosition = this.position.clone();
            // this.position = option.position.clone();// 计算出 speed 就会有新的 position 了


            // this.num = 1;// 初始值是1
        }


    }

    createPropertyRadar() {
        // let positionForRadar = option.position;
        let option = this.option;
        let radius = option.radius ? option.radius : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定

        // let angleOfHollow = option.pitchAngleRange ? option.pitchAngleRange : 60.0; // 扇形的角度
        // // let angleOfHollow = 90.0 - angleOfSector;
        // let angleOfSector = 90.0 - angleOfHollow; // 扇形的角度
        let angleOfSector = option.pitchAngleRange ? Math.abs(option.pitchAngleRange) : 60.0; // 扇形的角度
        // let radius = this.radius; //200000.0; //球体半径/扇形侧边距/雷达扫描半径
        let innerRadius = 500.0;// 这个变了好像也没啥影响，但是必须要有值

        let beamWidth = option.beamWidth ? option.beamWidth : 40;// 雷达的 波束宽度 beam width

        this.radar = this.viewer.entities.add({
            name: "Dome with top cut out",
            // position: positionForRadar,
            position: this.position,
            // orientation: new Cesium.VelocityOrientationProperty(positionForRadar), // Automatically set the vehicle's orientation to the direction it's facing.
            orientation: new Cesium.VelocityOrientationProperty(this.position), // Automatically set the vehicle's orientation to the direction it's facing.
            ellipsoid: {
                radii: new Cesium.Cartesian3(radius, radius, radius), // 扇形半径
                innerRadii: new Cesium.Cartesian3( innerRadius, innerRadius, innerRadius ), //内半径
                // minimumCone: Cesium.Math.toRadians( 0 - angleOfSector/2),
                minimumCone: Cesium.Math.toRadians( 90 - angleOfSector/2 ),
                maximumCone: Cesium.Math.toRadians( 90 + angleOfSector/2 ),//Cesium.Math.PI,//_OVER_TWO,
                minimumClock: Cesium.Math.toRadians(beamWidth/2),
                maximumClock: Cesium.Math.toRadians(-beamWidth/2),
                // material: Cesium.Color.BLUE.withAlpha(0.1),
                material: option.color ? getColor(option.color,option.alpha ? option.alpha : 0.1) : Cesium.Color.RED.withAlpha(0.1),
                outline: option.outline ? option.outline : false,
                // slicePartitions: 32,
                // stackPartitions: 32,
                subdivisions:32,//
            },
        });

    }

    createRadar(option) {
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

        // let positionForRadar = option.position;
        this.curPos = option.position;
        let radius = option.radius ? option.radius : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定

        // let angleOfHollow = option.pitchAngleRange ? option.pitchAngleRange : 60.0; // 扇形的角度
        // // let angleOfHollow = 90.0 - angleOfSector;
        // let angleOfSector = 90.0 - angleOfHollow; // 扇形的角度
        let angleOfSector = option.pitchAngleRange ? Math.abs(option.pitchAngleRange) : 60.0; // 扇形的角度
        // let radius = this.radius; //200000.0; //球体半径/扇形侧边距/雷达扫描半径
        let innerRadius = 500.0;// 这个变了好像也没啥影响，但是必须要有值

        let beamWidth = option.beamWidth ? option.beamWidth : 40;// 雷达的 波束宽度 beam width

        // let orientation = option.HeadingPitchRoll ? option.HeadingPitchRoll : Cesium.Transforms.headingPitchRollQuaternion(positionForRadar, new Cesium.HeadingPitchRoll(0.0, 0.0, 0.0))
        // this.curOrientation = option.HeadingPitchRoll ? option.HeadingPitchRoll : Cesium.Transforms.headingPitchRollQuaternion(this.curPos, new Cesium.HeadingPitchRoll(0.0, 0.0, 0.0))
        this.HeadingPitchRoll = option.HeadingPitchRoll ? option.HeadingPitchRoll : new Cesium.HeadingPitchRoll(0.0, 0.0, 0.0);
        this.radar = this.viewer.entities.add({
            // name: "Dome with top cut out",
            name: option.beamId+'radar',
            // position: positionForRadar,
            position: this.curPos,
            // position: new Cesium.CallbackProperty(function (time, result) {
            //     return this.curPos;
            // },false),
            // orientation: Cesium.Transforms.headingPitchRollQuaternion(positionForRadar, new Cesium.HeadingPitchRoll(option.heading * Math.PI / 180, 0.0, 0.0)),
            // orientation: orientation,
            // orientation: Cesium.Transforms.headingPitchRollQuaternion(this.curPos, this.HeadingPitchRoll),
            // orientation: new Cesium.CallbackProperty(function (time, result) {
            //     // return this.curOrientation;
            //     // HeadingPitchRoll
            //     return Cesium.Transforms.headingPitchRollQuaternion(this.curPos, this.HeadingPitchRoll);
            // },false),
            ellipsoid: {
                radii: new Cesium.Cartesian3(radius, radius, radius), // 扇形半径
                innerRadii: new Cesium.Cartesian3( innerRadius, innerRadius, innerRadius ), //内半径
                minimumCone: Cesium.Math.toRadians(angleOfSector),
                maximumCone: Cesium.Math.toRadians(angleOfSector + 90),//Cesium.Math.PI,//_OVER_TWO,
                minimumClock: Cesium.Math.toRadians(beamWidth/2),
                maximumClock: Cesium.Math.toRadians(-beamWidth/2),
                material: option.color ? getColor(option.color,option.alpha ? option.alpha : 0.1) : Cesium.Color.BLUE,//Cesium.Color.RED.withAlpha(0.1),
                outline: option.outline ? option.outline : false,
                // slicePartitions: 32,
                // stackPartitions: 32,
                subdivisions:32,//
            },
        });

        // 尝试找到对应的Primitive，然后进行 Matrix4 设置 --- 刚生成完还没转换 --- 在外面找也找不到,因为转换成Primitive后，被放进了PrimitiveCollection里面了
        // let primitives = this.viewer.scene.primitives._primitives;
        // for (let i = 0; i < primitives.length; i++){
        //     // if (primitives[i].id instanceof Cesium.Entity && primitives[i].id.name == option.beamId) {
        //     console.log(' primitives[i].id ', primitives[i].id, ' primitives[i] ', primitives[i])
        //     // if (primitives[i].id instanceof Cesium.Entity) {
        //     //     console.log('primitives[i]', primitives[i]);
        //     //     // modelMatrix

        //     // }
        // }

        // this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
        //     if (!that_.pause) {
        //         // labels._labels
        //         // for (let i = 0; i < labels._labels.length; i++){
        //         // }

        //         // 通过类似 贝塞尔曲线的那种方式得到每一帧率对应的点
        //         // P = (1-t)P1 + tP2  t -->[0,1]
        //         let t = that_.num / that_.curFps;
        //         t = t > 1 ? 1 : t;// 不可以比 1 大
        //         // let t = 0.9;
        //         t = 0.99;
        //         // t *= 9;
        //         let P1 = Cesium.Cartesian3.multiplyByScalar(that_.curPos, t, new Cesium.Cartesian3());
        //         let P2 = Cesium.Cartesian3.multiplyByScalar(that_.modelOption.position, (1 - t), new Cesium.Cartesian3())

        //         that_.curPos = Cesium.Cartesian3.add(P1, P2, new Cesium.Cartesian3())
        //         that_.num++;

        //         // 通过更新 position 和 headingPitchRoll 来更新飞机的位置 --- 目前 position 是生效的，headingPitchRoll 未生效
        //         Cesium.Transforms.headingPitchRollToFixedFrame(
        //             // that_.position,
        //             that_.curPos,
        //             that_.hpRoll,
        //             Cesium.Ellipsoid.WGS84,
        //             fixedFrameTransform,
        //             that_.model.modelMatrix
        //         );

        //         // when Primitive
        //         let label_trans_matrix = null;
        //         if (!Cesium.Cartesian3.equals(that_.lastLabelPos,that_.labelOption.position)) {
        //             let label_vector = Cesium.Cartesian3.subtract(that_.curPos, that_.lastCurPos, new Cesium.Cartesian3());
        //             label_trans_matrix = Cesium.Matrix4.fromTranslation(label_vector)
        //             // Cesium.Matrix4.fromRotationTranslation(rotation, translation, result)
        //             label_trans_matrix = Cesium.Matrix4.multiply(line.modelMatrix, label_trans_matrix, new Cesium.Matrix4());
        //             that_.labelOption.position = Cesium.Cartesian3.add(that_.labelOption.position, label_vector,new Cesium.Cartesian3());
        //         }

        //         // 关于 相机当前距离 Label 的距离，如何确定？
        //         // let dis = Cesium.Cartesian3.distance(that_.label.position, camera.position);
        //         // if (dis < 50000) {
        //             // when Primitive
        //             // // 因为需要拖拽，这个实现的方式并不方便 ---》 这时拖拽如何实现？==》 拖拽的话线的收尾两点回发生变化，单纯的算矩阵的话，改变不了
        //             // // modelMatrix
        //             // if (label_trans_matrix) {
        //             //     line.modelMatrix = label_trans_matrix
        //             // }
        //         // } else {
        //         //     that_.label.show = false;
        //         //     that_.line.show = false;
        //         // }
        //     }
        // });

    }

    getColorBlendMode(colorBlendMode) {
        return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
    }

    getColor(colorName, alpha) {
        const color = Cesium.Color[colorName.toUpperCase()];
        return Cesium.Color.fromAlpha(color, parseFloat(alpha));
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

export default RadarReconnaossance