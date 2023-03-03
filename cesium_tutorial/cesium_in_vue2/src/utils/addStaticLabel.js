import * as Cesium from 'cesium'
import CartesianRaduis2Degree from "./CartesianRaduis2Degree.js"
import translatePointAlongAxis from "./translatePointAlongAxis.js"


function calLabelPos(viewer, modelCartesian3) {
    let { lon, lat, alt } = CartesianRaduis2Degree(viewer, modelCartesian3);

    let point = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
    let pos = translatePointAlongAxis(point,{x:1500,y:800,z:2000})//模型前进方向默认是X轴负方向

    return pos;
}

function getSuitableModelPos(viewer, modelPrimitiveId, curModelPos, labelPos) {
    // debugger;
    let primitives = viewer.scene.primitives._primitives;
    //! 因为此时的 Model 是通过 Entity 添加的，所以一下代码有效！
    // console.log("primitives", primitives);
    for (let i = 0; i < primitives.length; i++){
        // if (primitives[i] instanceof Cesium.Model) {
            // console.log("primitives[i].id", primitives[i].id);

            let primitive = primitives[i];
            let id = primitives[i].id;// Entity
            // console.log()
            if (id && id.name == modelPrimitiveId) {
                let boundingSphere = primitive._boundingSphere;
                console.log("boundingSphere", boundingSphere);
                if (boundingSphere) {
                    /*
                        center: Cartesian3 {x: -2.6960997581481934, y: 9.699385813230869e-17, z: 1.5840299129486084}
                        radius: 17.180071972066564 --- 就用这个了！！
                    */
                    let transitionLength = boundingSphere.radius;

                    // 下面这段代码： 要将 tail 上的点每一个都平移对应的距离
                    // 利用 模型当前的 position 和 飞机即将飞到的position 去求一个 vector
                    // let vec = Cesium.Cartesian3.subtract(curModelPos, that_.position, new Cesium.Cartesian3());// right -> left
                    let vec = Cesium.Cartesian3.subtract(labelPos, curModelPos, new Cesium.Cartesian3());// right -> left
                    // let vec = Cesium.Cartesian3.subtract(this.beforePosition, this.position, new Cesium.Cartesian3());// right -> left
                    if (vec.x != 0 || vec.y != 0 || vec.z != 0) {
                        // let neg_vec = Cesium.Cartesian3.negate(vec, new Cesium.Cartesian3());
                        let normalize_vec = Cesium.Cartesian3.normalize(vec, new Cesium.Cartesian3());
                        // 这里面的 300 需要动态改变。当 Camera 距离模型很近时，是可以生效的。即现在的：this.transitionOfPointOfTail ---> 现在改成使用 BoundingSphere 的半径了
                        let transition_vec = Cesium.Cartesian3.multiplyByScalar(normalize_vec, transitionLength, new Cesium.Cartesian3())// 模型的半径？/纵向一半的长度？
                        let transition_matrix = Cesium.Matrix4.fromTranslation(transition_vec, new Cesium.Matrix4()); // 得到对应的 平移矩阵
                        // let pos_for_tail = Cesium.Matrix4.multiplyByPoint(transition_matrix, this.beforePosition, new Cesium.Cartesian3());

                        let pos_needed = Cesium.Matrix4.multiplyByPoint(transition_matrix, curModelPos, new Cesium.Cartesian3());
                        console.log("pos_needed", pos_needed);
                        viewer.entities.add({
                            position: pos_needed,
                            point: {
                                pixelSize: 10,
                                color: Cesium.Color.YELLOW,
                            },
                        });

                        return pos_needed;
                    }
                }
            }
        // }
    }

    // let primitivesNum = primitives.length;
    // for (let i = 0; i < primitivesNum; i++){
    //     // this.viewer.scene.primitives.get(i).id //Entity
    //     console.log("viewer.scene.primitives", primitives);
    //     console.log("viewer.scene.primitives.get(i)", primitives.get(i));
    //     console.log("viewer.scene.primitives.get(i).id", primitives.get(i).id);
    //     let id = viewer.scene.primitives.get(i).id;
    //     if ( id && id.name == modelPrimitiveId) {
    //         let boundingSphere = viewer.scene.primitives.get(i)._boundingSphere;
    //         // console.log("boundingSphere", boundingSphere);
    //         if (boundingSphere) {
    //             /*
    //                 center: Cartesian3 {x: -2.6960997581481934, y: 9.699385813230869e-17, z: 1.5840299129486084}
    //                 radius: 17.180071972066564 --- 就用这个了！！
    //             */
    //             let transitionLength = boundingSphere.radius;

    //             // 下面这段代码： 要将 tail 上的点每一个都平移对应的距离
    //             // 利用 模型当前的 position 和 飞机即将飞到的position 去求一个 vector
    //             // let vec = Cesium.Cartesian3.subtract(curModelPos, that_.position, new Cesium.Cartesian3());// right -> left
    //             let vec = Cesium.Cartesian3.subtract( labelPos, curModelPos, new Cesium.Cartesian3());// right -> left
    //             // let vec = Cesium.Cartesian3.subtract(this.beforePosition, this.position, new Cesium.Cartesian3());// right -> left
    //             if (vec.x != 0 || vec.y != 0 || vec.z != 0) {
    //                 // let neg_vec = Cesium.Cartesian3.negate(vec, new Cesium.Cartesian3());
    //                 let normalize_vec = Cesium.Cartesian3.normalize(vec, new Cesium.Cartesian3());
    //                 // 这里面的 300 需要动态改变。当 Camera 距离模型很近时，是可以生效的。即现在的：this.transitionOfPointOfTail ---> 现在改成使用 BoundingSphere 的半径了
    //                 let transition_vec = Cesium.Cartesian3.multiplyByScalar(normalize_vec, transitionLength, new Cesium.Cartesian3())// 模型的半径？/纵向一半的长度？
    //                 let transition_matrix = Cesium.Matrix4.fromTranslation(transition_vec, new Cesium.Matrix4()); // 得到对应的 平移矩阵
    //                 // let pos_for_tail = Cesium.Matrix4.multiplyByPoint(transition_matrix, this.beforePosition, new Cesium.Cartesian3());

    //                 let pos_needed = Cesium.Matrix4.multiplyByPoint(transition_matrix, curModelPos, new Cesium.Cartesian3());
    //                 console.log("pos_needed", pos_needed);
    //                 viewer.entities.add({
    //                     position: pos_needed,
    //                     point: {
    //                         pixelSize: 10,
    //                         color: Cesium.Color.YELLOW,
    //                     },
    //                 });

    //                 return pos_needed;
    //             }

    //         }
    //     }
    // }
}


// addLable_fn 方法也被淘汰了：因为需要添加动态修改 position 的方法，写成了 class 更方便
function addStaticLabel(viewer, modelOption={}, labelOption={}) {
    if (!viewer) { alert('必须传入 viewer'); return; }
    if (!modelOption.position) { alert('必须在第二个参数中传入model 的 position'); return; }
    if (!labelOption.position) {
        labelOption.position = calLabelPos(viewer,modelOption.position);
    }

    this.viewer = viewer;
    // let res = getSuitableModelPos(viewer, modelOption.id, modelOption.position, labelOption.position);
    // console.log("res", res);
    // this.modelPos = modelOption.id ? getSuitableModelPos(viewer,modelOption.id,modelOption.position,labelOption.position) : modelOption.position;// 这里换成当前 向量方向上 和 当前模型BoundingSphere的交点我觉得回好很多
    // this.modelPos = modelOption.position;//这个先不找了，先直接平移吧，先实现基本功能再说，这个可以后期优化。
    this.modelPos = translatePointAlongAxis(modelOption.position,{x:300,y:100,z:900});//这个先不找了，先直接平移吧，先实现基本功能再说，这个可以后期优化。
    this.labelOption = labelOption;

    this.label = this.viewer.entities.add({
        position: this.labelOption.position,
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
    resPos.push(this.labelOption.position);
    resPos.push(this.modelPos);

    this.line = this.viewer.entities.add({
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

export default addStaticLabel