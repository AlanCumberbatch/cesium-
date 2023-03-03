import * as Cesium from 'cesium'
import CartesianRaduis2Degree from "./CartesianRaduis2Degree.js"
import translatePointAlongAxis from "./translatePointAlongAxis.js"

// 此方法每次只能添加一个Label
class addEntityLabel {
    constructor(viewer, modelOption = {}, labelOption = {}) {

        if (!viewer) { alert('必须传入 viewer'); return; }
        if (!modelOption.position) { alert('必须在第二个参数重传入 position, 含义是 position of model'); return; }
        // Entity model
        if (!modelOption.id) { alert('必须在第二个参数重传入 id (id for Entity model), 含义是 position of model'); return; }

        this.modelOption = modelOption;
        this.modelPos = modelOption.position;
        this.labelOption = labelOption;
        this.viewer = viewer;
        this.label = null;
        this.line = null;
        this.property = null;//---
        this.lastTime = null;//---
        this.init();
    }

    init() {
        if (!this.labelOption.position) {
            this.labelOption.position = this.calLabelPos(this.modelPos);
        }
        // ---
        this.property = new Cesium.SampledPositionProperty();
        const start = Cesium.JulianDate.now();
        this.property.addSample(start, this.labelOption.position);
        this.lastTime = start;
        // ---
        let labelOption = this.labelOption;
        this.label =  this.viewer.entities.add({
            position: this.property,//labelOption.position,
            label: {
                text: labelOption.text?labelOption.text:"Test Text",
                font: "28pt Source Han Sans CN", //字体样式
                scale: 0.5,
                backgroundColor: Cesium.Color.fromCssColorString( "rgba(35,89,101,0.6)" ), //Cesium.Color.AQUA,    //背景颜色
                showBackground: true, //是否显示背景颜色
                // backgroundPadding: new Cesium.Cartesian2(5, 5),
                style: Cesium.LabelStyle.FILL_AND_OUTLINE, //FILL,        //label样式
                fillColor: Cesium.Color.fromCssColorString( "rgba(118,225,230,1.0)" ), //.withAlpha(0.3),        //字体颜色  rgb(46,111,162)
                outlineWidth: 1, // 文字轮廓
                outlineColor: Cesium.Color.fromCssColorString( "rgba(118,225,230,1.0)" ), //.withAlpha(0.3),        //字体颜色  rgb(46,111,162)
                verticalOrigin: Cesium.VerticalOrigin.CENTER, //垂直位置
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT, //水平位置
                // pixelOffset: new Cesium.Cartesian2(0.0, -16), //偏移
                pixelOffset: new Cesium.Cartesian2(0.0, -0.16), //偏移
            },
        });

        this.viewer.clock.startTime = start.clone();
        this.viewer.clock.currentTime = start.clone();
        this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
        this.viewer.clock.shouldAnimate = false;


        // line 的逻辑和 label 的逻辑暂时不一样，line暂时是动态生成；
        // let resPos = [];
        // resPos.push(labelOption.position);
        // resPos.push(this.modelPos);

        let that_ = this;
        this.line = this.viewer.entities.add({
            name: "Black line on terrain",
            polyline: {
                // positions: resPos,
                positions: new Cesium.CallbackProperty(function (time, result) {
                    // 根据   当前model position 和 Label position   获取  当前Polyline的首尾坐标
                    let modelPos = that_.viewer.entities.getById(that_.modelOption.id).position.getValue(time);
                    let labelPos = that_.label.position.getValue(time);
                    // let labelPos_pre = that_.label.position.getValue(time);
                    // 如果 labelPos 不做处理，将和 Label 存在一个间隙，尝试平移一段距离 ---> 因为之前设置了Label 的 offset，清空或者添加很少就好了
                    if (modelPos && labelPos) {
                        // let labelPos = translatePointAlongAxis(labelPos_pre, { x: 0, y: 0, z: 0 });
                        return [modelPos,labelPos];
                    }
                },false),
                width: 1,
                material: Cesium.Color.BLACK,
                // clampToGround: true,
            },
        });
    }

    updatePosition(time, modelPos) {
        if (this.viewer.clock.shouldAnimate === false) {
            this.viewer.clock.shouldAnimate = true;
        }

        this.modelPos = modelPos;

        // 计算出 新的 label 的 position
        let nextPos = this.calLabelPos(modelPos);

        const nextTime = Cesium.JulianDate.addSeconds(this.lastTime, time, new Cesium.JulianDate());
        this.property.addSample(nextTime, nextPos);

        this.lastTime = nextTime;
        this.labelOption.position = nextPos;
    }
    calLabelPos( modelCartesian3) {
        let { lon, lat, alt } = CartesianRaduis2Degree(this.viewer, modelCartesian3);

        let point = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
        let pos = translatePointAlongAxis(point,{x:150,y:80,z:200})//模型前进方向默认是X轴负方向

        return pos;
    }
}

Object.defineProperties(addEntityLabel, {
    // 'modelPos': {
    //     get() { return this.modelPos; },
    //     set(newValue) {
    //         console.log("modelPos changed")
    //         this.modelPos = newValue;// 状态保存
    //     },
    // }
});

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



// addLable_fn 方法也被淘汰了：因为需要添加动态修改 position 的方法，写成了 class 更方便
function addLable_fn(viewer, modelCartesian3, labelOption) {
    if (!viewer) { alert('必须传入 viewer'); return; }
    if (!modelCartesian3) { alert('必须传入 modelCartesian3'); return; }
    if (!labelOption) { alert('必须传入 labelOption'); return; }
    if (!labelOption.position) {
        this.labelOption.position = calLabelPos(modelCartesian3, labelOption);
    }

    this.viewer = viewer;
    this.modelPos = modelCartesian3;
    this.labelOption = labelOption;
    this._labelOption = labelOption;

    this.label =  viewer.entities.add({
        position: labelOption.position,
        label: {
            text: labelOption.text?labelOption.text:"Test Text",
            font: "28pt Source Han Sans CN", //字体样式
            scale: 0.5,
            backgroundColor: Cesium.Color.fromCssColorString( "rgba(35,89,101,0.6)" ), //Cesium.Color.AQUA,    //背景颜色
            showBackground: true, //是否显示背景颜色
            // backgroundPadding: new Cesium.Cartesian2(5, 5),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, //FILL,        //label样式
            fillColor: Cesium.Color.fromCssColorString( "rgba(118,225,230,1.0)" ), //.withAlpha(0.3),        //字体颜色  rgb(46,111,162)
            outlineWidth: 1, // 文字轮廓
            outlineColor: Cesium.Color.fromCssColorString( "rgba(118,225,230,1.0)" ), //.withAlpha(0.3),        //字体颜色  rgb(46,111,162)
            verticalOrigin: Cesium.VerticalOrigin.CENTER, //垂直位置
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT, //水平位置
            pixelOffset: new Cesium.Cartesian2(0.0, -16), //偏移
        },
    });

    let resPos = [];
    resPos.push(labelOption.position);
    resPos.push(modelCartesian3);

    this.line = viewer.entities.add({
        name: "Black line on terrain",
        polyline: {
            positions: resPos,
            width: 2,
            material: Cesium.Color.BLACK,
            // clampToGround: true,
        },
    });
}

// 这个方法暂时还不能使用，因为现在还不能获取 entity 的 boundingSphere.radius/半径
function addLable_useModelBoundingSphere(viewer, modelCartesian3, modelBOunderSphereRadius) {
    if (!viewer) { alert('必须传入 viewer'); return; }
    if (!modelCartesian3) { alert('必须传入 modelCartesian3'); return; }

    // Cartesian3 --> degree
    let { lon, lat, alt } = CartesianRaduis2Degree(viewer, modelCartesian3);
    // console.log("lon", lon,"lat", lat,"alt", alt);
    console.log("lon", lon,);
    // console.log('modelBOunderSphereRadius', modelBOunderSphereRadius);
    // 为了让 Label 一直在飞机尾部上方左右
    let re_lon = Number(lon) + 0.001;
    // 5900 -- 0.5
    if (lon < 0) {
        lon -= 0.0001;
    } else {
        lon += 0.0001;
    }
    console.log("lon", lon,);


    let labelCartesian3 = Cesium.Cartesian3.fromDegrees( lon, lat , alt * 1.0001 );
    // let labelCartesian3 = Cesium.Cartesian3.fromDegrees( lon, lat , alt + modelBOunderSphereRadius * 0.5 );

    const entity = viewer.entities.add({
     position: labelCartesian3,
     label: {
         text: "Philadelphia",
         font: "28pt Source Han Sans CN", //字体样式
         scale: 0.5,
         backgroundColor: Cesium.Color.fromCssColorString( "rgba(35,89,101,0.6)" ), //Cesium.Color.AQUA,    //背景颜色
         showBackground: true, //是否显示背景颜色
         // backgroundPadding: new Cesium.Cartesian2(5, 5),
         style: Cesium.LabelStyle.FILL_AND_OUTLINE, //FILL,        //label样式
         fillColor: Cesium.Color.fromCssColorString( "rgba(118,225,230,1.0)" ), //.withAlpha(0.3),        //字体颜色  rgb(46,111,162)
         outlineWidth: 1, // 文字轮廓
         outlineColor: Cesium.Color.fromCssColorString( "rgba(118,225,230,1.0)" ), //.withAlpha(0.3),        //字体颜色  rgb(46,111,162)
         verticalOrigin: Cesium.VerticalOrigin.CENTER, //垂直位置
         horizontalOrigin: Cesium.HorizontalOrigin.LEFT, //水平位置
         pixelOffset: new Cesium.Cartesian2(0.0, -16), //偏移
     },
    });

    let resPos = [];
    resPos.push(labelCartesian3);
    resPos.push(modelCartesian3);
    let lineOnGround = viewer.entities.add({
        name: "Black line on terrain",
        polyline: {
            positions: resPos,
            width: 2,
            material: Cesium.Color.BLACK,
            // clampToGround: true,
        },
    });
}

export default addEntityLabel