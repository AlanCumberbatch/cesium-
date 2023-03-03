<template>
    <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import antiAliasing from "../utils/antiAliasing.js";
import importModelsByModelInstanceWithLine from "../utils/importModelsByModelInstanceWithLine.js";

export default {
    name: "modelInstanceCollection",
    data() {
        return {
            viewer: null,
            cesiumHandler: null,
            curSelectedPrimitive: null,
            curLabelAlt: 0,
        };
    },
    methods: {
    },
    mounted() {
        Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo";

        let viewer = new Cesium.Viewer("cesiumContainer", {
            shouldAnimate: true, //有动画
            animation: false,  //动画控制不显示
            timeline: false,    //时间线不显示
            // fullscreenButton: false, //全屏按钮不显示
            // infoBox: false
            // selectionIndicator: true,
        });
        this.viewer = viewer;

        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        this.cesiumHandler = handler;

        antiAliasing(viewer);
        // viewer.extend(Cesium.viewerCesiumInspectorMixin);


        /*
            option:{
                numberOfModel:Number  需要的模型数量，
                modelUri:String       想要展示的模型
                flyTo:Boolean         是否将相机对准展示的模型，默认为true
            }
        */
        importModelsByModelInstanceWithLine(viewer, {
            numberOfModel:16,
        });

        if ('想全部模型都添加轮廓，且用这个轮廓不代表任何意义，可以用这个方法') {
            // const stages = viewer.scene.postProcessStages;
            // const silhouette = stages.add(
            //     Cesium.PostProcessStageLibrary.createSilhouetteStage()
            // );
            // console.log("silhouette", silhouette);
            // silhouette.enabled = true;
            // silhouette.uniforms.color = Cesium.Color.YELLOW;
        }


        let that = this;
        // 鼠标左键-双击
        handler.setInputAction(function(movement) {
            viewer.trackedEntity = undefined;
            // 获取模型定位
            let feature = viewer.scene.pick(movement.position);
            if (!Cesium.defined(feature)) { return; }
            if (feature.id && feature.id.label) {
                const entity = feature.id; // 此时是个 Label
                // 处理双击事件
                // 进行Label内容的切换
                entity.label.text = "1111111?\n双击双击双击双击双击双击"; //  \n 可以实现换行
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        // 鼠标左键 - 选中：   LEFT_DOWN	---  Label以及相关的线随鼠标移动
        handler.setInputAction(function(movement) {
            viewer.trackedEntity = undefined;
            // 获取模型定位
            let feature = viewer.scene.pick(movement.position);
            if (!Cesium.defined(feature)) { return; }
            if (feature.id && feature.id.label) {
                const entity = feature.id; // 此时是个 Label
                // 进行Label内容的切换
                // entity.label.text = "1111111?\n12121"; //  \n 可以实现换行
                that.curSelectedPrimitive = entity;

                let cartesian3 = that.curSelectedPrimitive.position._value;
                console.log("cartesian3", cartesian3);
                let cartographic = that.viewer.scene.globe.ellipsoid.cartesianToCartographic( cartesian3 );
                let lat = Cesium.Math.toDegrees(cartographic.latitude);
                let lng = Cesium.Math.toDegrees(cartographic.longitude);
                let alt = cartographic.height;
                that.curLabelAlt = cartographic.height;
                console.log("lat", lat, " lng ", lng, " alt ", alt);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        // 鼠标左键 - 鼠标抬起：	LEFT_UP --- Label以及相关的线不继续随鼠标移动
        handler.setInputAction(function (movement) {
            // viewer.trackedEntity = undefined;
            // // 获取模型定位
            // let feature = viewer.scene.pick(movement.position);
            // if (!Cesium.defined(feature)) {
            //     return;
            // }
            // if (feature.id && feature.id.label) {
            if (that.curSelectedPrimitive) {

                that.curSelectedPrimitive = null;
            }

            that.viewer.screenSpaceEventHandler.removeInputAction( Cesium.ScreenSpaceEventType.LEFT_DOWN ); // 解除viewer的LEFT_DOWN事件监听器
            that.viewer.screenSpaceEventHandler.removeInputAction(15); //15Cesium.ScreenSpaceEventType.MOUSE_MOVE);// 解除viewer的MOUSE_MOVE事件监听器
            that.viewer.screenSpaceEventHandler.removeInputAction( Cesium.ScreenSpaceEventType.LEFT_DOWN ); // 解除viewer的LEFT_DOWN事件监听器
            that.viewer.scene.screenSpaceCameraController.enableRotate = true; // 取消相机锁定
            // }
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        handler.setInputAction(function(arg) {
            // 为viewer绑定MOUSE_MOVE事件监听器（执行函数，监听的事件）
            /*
                在鼠标移动的过程中：
                    时刻获取当前鼠标位置的世界坐标，然后赋值给模型---》现在没有高程
            */
            console.log("MOUSE_MOVE");
            if (that.curSelectedPrimitive) {
                let viewer = that.viewer;
                let ellipsoid = that.viewer.scene.globe.ellipsoid;
                viewer.scene.screenSpaceCameraController.enableRotate = false; // 将相机锁定，不然后续移动实体时相机也会动

                // let ray = viewer.camera.getPickRay(arg.endPosition);
                // let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                // console.log('cartesian',cartesian);
                // pointDraged.id.position = new Cesium.CallbackProperty(function () {
                //     return cartesian;
                // }, false);//防止闪烁，在移动的过程

                // const position = arg.endPosition;// arg有startPosition与endPosition两个属性，即移动前后的位置信息：Cartesian2对象
                // const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(position), viewer.scene);//将Cartesian2转为Cartesian3
                // console.log("cartesian", cartesian);
                // that.curSelectedPrimitive.position._value = cartesian;// 更新实体位置为当前鼠标位置
                //  pointDraged.id.position = new Cesium.CallbackProperty(function () {
                //         return cartesian;
                //     }, false);//防止闪烁，在移动的过程

                // let cartographic= that.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                // let lat = Cesium.Math.toDegrees(cartographic.latitude);
                // let lng = Cesium.Math.toDegrees(cartographic.longitude);
                // let alt = cartographic.height;
                // that.curLabelAlt = cartographic.height;
                // console.log("lat", lat," lng ", lng," alt ", alt);

                //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
                var cartesian = viewer.camera.pickEllipsoid(
                    arg.endPosition,
                    ellipsoid
                );
                if (cartesian) {
                    //将笛卡尔三维坐标转为地图坐标（弧度）
                    var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(
                        cartesian
                    );
                    console.log("cartographic", cartographic);
                    //将地图坐标（弧度）转为十进制的度数
                    var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
                    var lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
                    var height = (viewer.camera.positionCartographic.height / 1000).toFixed(2);

                    console.log(lng+','+lat+","+height);
                    // _this.mousePosition = lng + ", " + lat + ", " + height;
                }
            }
        }, 15); //Cesium.screenSpaceEventType.MOUSE_MOVE);

        // Fly the camera to San Francisco at the given longitude, latitude, and height.
        // viewer.camera.flyTo({
        //   destination : Cartesian3.fromDegrees(-122.4175, 37.655, 400),
        //   orientation : {
        //     heading : Math.toRadians(0.0),
        //     pitch : Math.toRadians(-15.0),
        //   }
        // });
    },
    beforeDestroy() {
        this.cesiumHandler.removeInputAction( Cesium.ScreenSpaceEventType.LEFT_UP );
        this.cesiumHandler.removeInputAction( Cesium.ScreenSpaceEventType.LEFT_DOWN );
        this.cesiumHandler.removeInputAction( Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div#cesiumContainer {
    height: 100vh;
    width: 100vw;
}
</style>
