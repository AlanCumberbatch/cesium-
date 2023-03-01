import * as Cesium from 'cesium'
// import Cesium3DTile from 'cesium/Source/Scene/Cesium3DTile';
// import CartesianRaduis2Degree from "./CartesianRaduis2Degree.js"
import RadarReconnaossance from "../RadarReconnaossance.js";
import StaticPrimitiveLabel from "./StaticPrimitiveLabel.js";

/*
    说明：
        1. 关于 model 的 ID 和 Label 的 ID： model的ID为 model.name + 'ID', label的ID为 model.name（因为label的ID 与 label.text 一样）
*/
class StaticPrimitiveModel {
    constructor(viewer, option = {}) {

        if (!viewer) { alert('必须传入 viewer'); return; }
        if (!option.position) { alert('必须传入 position'); return; }

        this.viewer = viewer;
        this.url = option.url ? option.url : "./models/CesiumAir/Cesium_Air.glb";

        this.position = option.position;
        // this.modelSize = option.size ? option.size : 128;
        this.name = option.name ? option.name : Cesium.createGuid();
        this.beforePosition = null;
        this.property = null;
        this.model = null;
        this.label = null;

        this.silhouetteColor = null; //Cesium.Color.WHITE;
        this.silhouetteSize = null; //10;

        this.init();
    }

    init() {
        this.create();
    }

    create() {
        // height = Cesium.defaultValue(height, 0.0);
        // var modelMatrix = Cesium.Transforms.northEastDownToFixedFrame(
        //     Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, height)
        // );


        // var modelMatrix = Cesium.Transforms.northEastDownToFixedFrame(this.position);
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this.position);

        this.model = this.viewer.scene.primitives.add(
            Cesium.Model.fromGltf({
                url: this.url,
                show : true,                     // default
                modelMatrix: modelMatrix,
                // minimumPixelSize: 128,// never smaller than 128 pixels
                // maximumScale: 20000,             // never larger than 20000 * model size (overrides minimumPixelSize)
                // allowPicking : false,            // not pickable
                // debugShowBoundingVolume : false, // default
                // debugWireframe: false,
                // minimumPixelSize: 128,//单位是什么？？ in pixel
                // maximumScale: 20,//The maximum scale for the model.？？？
                scale: 20,//只设置这个就可以让飞机保持固定大小 // double size
            })
        );

        // model.readyToRender.addEventListener(function (model) {
        //     // Play and loop all animations at half-spead
        //     model.activeAnimations.addAll({
        //         speedup: 0.5,
        //         loop: Cesium.ModelAnimationLoop.REPEAT,
        //     });

        //     // Zoom to model
        //     var center = Cesium.Matrix4.multiplyByPoint(
        //         model.modelMatrix,
        //         model.boundingSphere.center,
        //         new Cesium.Cartesian3()
        //     );
        //     var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        //     var camera = scene.camera;
        //     camera.transform = transform;
        //     var controller = scene.screenSpaceCameraController;
        //     var r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
        //     controller.minimumZoomDistance = r * 0.5;
        //     camera.lookAt(
        //         new Cesium.Cartesian3(r, r, r),
        //         Cesium.Cartesian3.ZERO,
        //         Cesium.Cartesian3.UNIT_Z
        //     );
        // });

        // 创建对应的 Label
        this.label = new StaticPrimitiveLabel(
            this.viewer,
            { position: this.position,id:this.name+'ID' },
            { text:this.name }
        )
    }

    showOrNot(status) {
        // model， Label 都跟着改变
        this.model.show = status ? true :false;
        this.label.label.show = status ? true :false;
        this.label.line.clear =  status ? false : true;
    }

    getColorBlendMode(colorBlendMode) {
        return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
    }

    getColor(colorName, alpha) {
        const color = Cesium.Color[colorName.toUpperCase()];
        return Cesium.Color.fromAlpha(color, parseFloat(alpha));
    }

    addRadar() {
        let { positionForRadar } = RadarReconnaossance(this.viewer, {
            position: this.property,
            radius: 100000,
            beamWidth:90,//波束宽度
        });
    }

}

export default StaticPrimitiveModel