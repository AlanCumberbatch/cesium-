import * as Cesium from 'cesium'

// 创建侦察机的雷达模型
function RadarReconnaossance(viewer,option = {}) {
    if (!viewer) { alert('RadarReconnaossance 必须传入 viewer'); return; }
    if (!option.position) { alert('position 必须通过第二个对象参数传入'); return; }

    let positionForRadar = option.position;
    let radius = option.radius ? option.radius : 10000.0; //球体半径/扇形侧边距/雷达扫描半径 ---- 是否可变？？？ 待定

    // let angleOfHollow = option.pitchAngleRange ? option.pitchAngleRange : 60.0; // 扇形的角度
    // // let angleOfHollow = 90.0 - angleOfSector;
    // let angleOfSector = 90.0 - angleOfHollow; // 扇形的角度
    let angleOfSector = option.pitchAngleRange ? Math.abs(option.pitchAngleRange) : 60.0; // 扇形的角度
    // let radius = this.radius; //200000.0; //球体半径/扇形侧边距/雷达扫描半径
    let innerRadius = 500.0;// 这个变了好像也没啥影响，但是必须要有值

    let beamWidth = option.beamWidth ? option.beamWidth : 40;// 雷达的 波束宽度 beam width

    let ellipsoid = null;

    // const position = new Cesium.SampledPositionProperty();
    // 带 空心 的半球体
    if (positionForRadar instanceof Cesium.SampledPositionProperty) {//! （前提是传进来的 指针 并不能在后续的执行环境中进行状态更改）此种情况封装成方法在使用存在弊端， position 不能及时响应, 需要将 position 暴露出去，在输入进来的 position 变化时重新进行赋值
        ellipsoid = viewer.entities.add({
            name: "Dome with top cut out",
            position: positionForRadar,
            orientation: new Cesium.VelocityOrientationProperty(positionForRadar), // Automatically set the vehicle's orientation to the direction it's facing.
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

        return { ellipsoid, positionForRadar };

    }
    if (positionForRadar instanceof Cesium.Cartesian3) {
        console.log("1111111111111111111111111111111111111111")
        // if(!option.heading){alert('heading 必须传入且是角度而不是弧度')}
        // if (!option.HeadingPitchRoll) { alert('HeadingPitchRoll 必须传入') }
        let orientation = option.HeadingPitchRoll ? option.HeadingPitchRoll : Cesium.Transforms.headingPitchRollQuaternion(positionForRadar, new Cesium.HeadingPitchRoll(0.0, 0.0, 0.0))
        ellipsoid = viewer.entities.add({
            name: "Dome with top cut out",
            position: positionForRadar,
            // orientation: Cesium.Transforms.headingPitchRollQuaternion(positionForRadar, new Cesium.HeadingPitchRoll(option.heading * Math.PI / 180, 0.0, 0.0)),
            orientation: orientation,
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

        this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
            if (!that_.pause) {
                // labels._labels
                // for (let i = 0; i < labels._labels.length; i++){
                // }

                // 通过类似 贝塞尔曲线的那种方式得到每一帧率对应的点
                // P = (1-t)P1 + tP2  t -->[0,1]
                let t = that_.num / that_.curFps;
                t = t > 1 ? 1 : t;// 不可以比 1 大
                // let t = 0.9;
                t = 0.99;
                // t *= 9;
                let P1 = Cesium.Cartesian3.multiplyByScalar(that_.curPos, t, new Cesium.Cartesian3());
                let P2 = Cesium.Cartesian3.multiplyByScalar(that_.modelOption.position, (1 - t), new Cesium.Cartesian3())

                that_.curPos = Cesium.Cartesian3.add(P1, P2, new Cesium.Cartesian3())
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

                // when Primitive
                let label_trans_matrix = null;
                if (!Cesium.Cartesian3.equals(that_.lastLabelPos,that_.labelOption.position)) {
                    let label_vector = Cesium.Cartesian3.subtract(that_.curPos, that_.lastCurPos, new Cesium.Cartesian3());
                    label_trans_matrix = Cesium.Matrix4.fromTranslation(label_vector)
                    // Cesium.Matrix4.fromRotationTranslation(rotation, translation, result)
                    label_trans_matrix = Cesium.Matrix4.multiply(line.modelMatrix, label_trans_matrix, new Cesium.Matrix4());
                    that_.labelOption.position = Cesium.Cartesian3.add(that_.labelOption.position, label_vector,new Cesium.Cartesian3());
                }

                // 关于 相机当前距离 Label 的距离，如何确定？
                // let dis = Cesium.Cartesian3.distance(that_.label.position, camera.position);
                // if (dis < 50000) {
                    // when Primitive
                    // // 因为需要拖拽，这个实现的方式并不方便 ---》 这时拖拽如何实现？==》 拖拽的话线的收尾两点回发生变化，单纯的算矩阵的话，改变不了
                    // // modelMatrix
                    // if (label_trans_matrix) {
                    //     line.modelMatrix = label_trans_matrix
                    // }
                // } else {
                //     that_.label.show = false;
                //     that_.line.show = false;
                // }
            }
        });

        return ellipsoid;
    }

}

function getColor(colorName, alpha) {
    const color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}

export default RadarReconnaossance