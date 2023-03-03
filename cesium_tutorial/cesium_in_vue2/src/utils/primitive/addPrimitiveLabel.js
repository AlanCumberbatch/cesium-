import * as Cesium from 'cesium'
import CartesianRaduis2Degree from "../CartesianRaduis2Degree.js"
import translatePointAlongAxis from "../translatePointAlongAxis.js"
import StaticLine from "./StaticLine.js";
import StaticLineClass from "./StaticLineClass.js";
/*
    说明： 当前 label 对应的每一个 polyline 都是通过 Entity 实现的。
    原因： 在实现拖拽时，被拖拽的线的首尾两点会发生变化，单纯的算矩阵的话，改变不了，同时有不能设置position。
*/
// 此方法每次只能添加一个Label
/**
 *
 * demo
 *  let label = new addPrimitiveLabel(
 *    this.viewer,
 *    { position: this.modelMap.get(data.unitName).curPos, id:this.modelMap.get(data.unitName).model.id}, // modelOption about
 *    { text: data.unitName, } // for label
 *  );
 */
class addPrimitiveLabel {
    constructor(viewer, modelOption = {}, labelOption = {}) {

        if (!viewer) { alert('必须传入 viewer'); return; }
        if (!modelOption.position) { alert('必须在第二个参数重传入 position, 含义是 position of model'); return; }
        // Primitive model
        if (!modelOption.id) { alert('必须在第三个参数重传入 id (id for Entity model), 含义是 position of model'); return; }//为什么一定要有id？不过对于之后的维护，确实有id要好得多

        this.modelOption = modelOption;
        this.labelOption = labelOption;
        this.viewer = viewer;
        this.label = null;
        this.line = null;
        this.show = true;

        this.num = 1;// 初始值是1
        this.curFps = 0;
        this.curPos = null;

        this.pause = false;

        // this.linePos = null;//for test -- Primitive

        this.init();
    }

    init() {
        if (!this.labelOption.position) {
            this.labelOption.position = this.calLabelPos(this.modelOption.position);
        }

        this.curPos = this.modelOption.position.clone();

        this.linePos = [this.curPos.clone(),this.labelOption.position.clone()]


        // Label
        var labels = new Cesium.LabelCollection();
        this.label = labels.add({
            position : this.labelOption.position,
            text: this.labelOption.text ? this.labelOption.text : 'no text',
            id: this.labelOption.text ? this.labelOption.text : Symbol('no text'),
            show:true,


            font: '24px Helvetica',// CSS font-family  // font: "28pt Source Han Sans CN", //字体样式 //
            // fillColor: Cesium.Color.fromCssColorString( "rgba(118,225,230,1.0)" ),// new Cesium.Color(0.6, 0.9, 1.0),// 决定的是 文字的颜色
            fillColor: Cesium.Color.fromCssColorString( "rgba(0,0,0,1.0)" ),// new Cesium.Color(0.6, 0.9, 1.0),// 决定的是 文字的颜色
            outlineWidth: 1, // 文字轮廓
            // outlineColor: Cesium.Color.fromCssColorString( "rgba(118,225,230,1.0)" ), //.withAlpha(0.3),
            outlineColor: Cesium.Color.fromCssColorString( "rgba(0,0,0,1.0)" ), //.withAlpha(0.3),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,

            showBackground:true,
            // backgroundColor: Cesium.Color.fromCssColorString( "rgba(35,89,101,0.6)" ), //Cesium.Color.AQUA,    //背景颜色
            backgroundColor: Cesium.Color.fromCssColorString( "rgba(255,225,255,1.0)" ), //Cesium.Color.AQUA,    //背景颜色
            backgroundPadding: new Cesium.Cartesian2(6.0, 6.0),//default: new Cartesian2(7, 5);
            verticalOrigin: Cesium.VerticalOrigin.BASELINE,// by default
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,// by default
            pixelOffset: new Cesium.Cartesian2(2,-5),//Cesium.Cartesian2.ZERO,// by default
            eyeOffset: Cesium.Cartesian3.ZERO,// by default
            scale:1.0,// by default

            // translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0) // fade by Distance --- 源码中对应的计算距离的方法在  vertex shader 里面写的
            // pixelOffsetScaleByDistance: // A label's pixel offset will be scaled when the distance changed
            // scaleByDistance:  // A label's pixel offset will be scaled when the distance changed
            // heightReference: HeightReference.NONE
        });
        this.viewer.scene.primitives.add(labels);


        // Line
        // line 的逻辑和 label 的逻辑暂时不一样，line暂时是动态生成；

        // Line ---- Entity
        let that_ = this;
        // this.line = this.viewer.entities.add({
        //     name: "Black line on terrain",
        //     polyline: {
        //         positions: new Cesium.CallbackProperty(function (time, result) {
        //             return that_.linePos;
        //         },false),
        //         width: 1.0,
        //         material: Cesium.Color.RED,
        //         // clampToGround: true,
        //     },
        // });
        // this.line = StaticLine(this.viewer, this.linePos[0],this.linePos[1],10)
        // this.line = new StaticLineClass(this.viewer, this.linePos[0],this.linePos[1],10)
        // Line ---- DrawCommand
        this.line = new StaticLineClass(this.viewer, {
            modelPos:this.linePos[0],
            labelPos:this.linePos[1],
            width: 2,
        })

        // 让 Label 距离相机到达一定距离的时候才开始显示
        this.viewer.scene.preUpdate.addEventListener(function (scene, time) {
            if (!that_.pause) {
                if (that_.show) {
                    // labels._labels
                    // for (let i = 0; i < labels._labels.length; i++){
                    // }

                    that_.lastCurPos = that_.curPos.clone();

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
                    // that_.addPoint_test(that_.curPos,Cesium.Color.BROWN)
                    that_.num++;

                    that_.labelOption.position = that_.calLabelPos(that_.curPos);

                    // when Primitive
                    // let label_trans_matrix = null;
                    // if (!Cesium.Cartesian3.equals(that_.lastLabelPos,that_.labelOption.position)) {
                    //     let label_vector = Cesium.Cartesian3.subtract(that_.curPos, that_.lastCurPos, new Cesium.Cartesian3());
                    //     label_trans_matrix = Cesium.Matrix4.fromTranslation(label_vector)
                    //     // Cesium.Matrix4.fromRotationTranslation(rotation, translation, result)
                    //     label_trans_matrix = Cesium.Matrix4.multiply(line.modelMatrix, label_trans_matrix, new Cesium.Matrix4());
                    //     that_.labelOption.position = Cesium.Cartesian3.add(that_.labelOption.position, label_vector,new Cesium.Cartesian3());
                    // }

                    // 关于 相机当前距离 Label 的距离，如何确定？
                    // let dis = Cesium.Cartesian3.distance(that_.label.position, camera.position);
                    // if (dis < 50000) {
                        that_.label.show = true;
                        that_.label.position = that_.labelOption.position;
                        that_.line.show = true;
                        // line.positions = [that_.curPos.clone(), that_.labelOption.position.clone()];// 这种方式不生效 when add line by Primitive --- not work

                        that_.linePos = [that_.curPos.clone(), that_.labelOption.position.clone()]// add line by Entity --- OK
                        that_.line.updateOption({
                            modelPos: that_.curPos.clone(),
                            labelPos: that_.labelOption.position.clone(),
                        })

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
                } else {
                    that_.label.show = false;
                    that_.line.show = false;
                }
            }
        });

    }


    updatePosition(time, modelPos,show) {
        if (this.viewer.clock.shouldAnimate === false) {
            this.viewer.clock.shouldAnimate = true;
        }

        // 获取当前 fps--- start
        // fpsContainer[0].style.display = 'none';// 在源码里面进行demo的不显示的操作
        this.curFps = this.viewer.scene._performanceDisplay._fpsText.nodeValue.slice(0, 2);
        // 获取当前 fps--- end

        this.modelOption.position = modelPos;

        // 计算出 新的 label 的 position
        this.labelOption.position = this.calLabelPos(modelPos);

        this.show = show;

        this.num = 1;// 初始值是1
    }

    calLabelPos( modelCartesian3) {
        let { lon, lat, alt } = CartesianRaduis2Degree(this.viewer, modelCartesian3);

        let point = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
        let pos = translatePointAlongAxis(point,{x:150,y:80,z:200})//模型前进方向默认是X轴负方向

        return pos;
    }
}

//  let labelOption = this.labelOption;
//             console.log("labelOption", labelOption);
//             console.log("labelOption.position", labelOption.position);
//     Object.defineProperty(labelOption,"position",{
//     get: function (obj) {
//         console.log("obj", obj);
//         // labelOption.position;
//     },
//     set:function(newVal){
//         console.log("labelOption.position 发生了改变",labelOption)
//         // labelOption.position= newVal;
//     }
//     })

export default addPrimitiveLabel