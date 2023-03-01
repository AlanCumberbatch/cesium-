<template>
    <div id="cesiumContainer"></div>
</template>

<script>
// import {
//   Cartesian3,
//   Transforms,
//   HeadingPitchRoll,
//   Matrix4,
//   ModelInstanceCollection,
//   LabelCollection,
//   Color,
//   viewerCesiumInspectorMixin,
//     Cesium3DTileset,
//     createWorldTerrain,
//     IonResource,
//     Viewer,
//     viewerCesiumNavigationMixin,
//     Model,
//     ModelAnimationLoop,
//     Camera,
//     Ion,
//     Widget,
//     createOsmBuildings,
//     Math,
// } from "cesium";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import antiAliasing from "../utils/antiAliasing.js";
// import "./css/main.css";

export default {
    name: "modelInstanceCollection",
    data() {
        return {
            viewer: null,
            cesiumHandler: null,
            sectorEntity: {},
        };
    },
    methods: {
        /**
         * @description 画扇形
         * @param {int} lon 中心点经度
         * @param {*} lat 中心点纬度
         * @param {*} height 中心点高度
         * @param {*} direction 方向
         * @param {*} radius 半径
         */
        calculatingTargetPoints(lon, lat, height, direction, radius) {
            //根据 位置，方位，距离 求经纬度
            var viewPoint = Cesium.Cartesian3.fromDegrees(lon, lat, height);
            var webMercatorProjection = new Cesium.WebMercatorProjection(
                this.viewer.scene.globe.ellipsoid
            );
            var viewPointWebMercator = webMercatorProjection.project(
                Cesium.Cartographic.fromCartesian(viewPoint)
            );
            var toPoint = new Cesium.Cartesian3(
                viewPointWebMercator.x + radius * Math.cos(direction),
                viewPointWebMercator.y + radius * Math.sin(direction),
                0
            );
            toPoint = webMercatorProjection.unproject(toPoint);
            toPoint = Cesium.Cartographic.toCartesian(toPoint.clone());
            var cartographic = Cesium.Cartographic.fromCartesian(toPoint);
            var point = [
                Cesium.Math.toDegrees(cartographic.longitude),
                Cesium.Math.toDegrees(cartographic.latitude),
            ];
            return point;
        },
        /**
         * @description 画扇形（从正北开始顺时针旋转）
         * @param {Number} d1 扇形第一个边的角度
         * @param {Number} d2 扇形第二个边的角度
         * @param {Number} lng 中心点经度
         * @param {Number} lat 中心点纬度
         * @param {Number} zcjl 扇形半径
         */
        drawSector(params) {
            console.log("params", params);
            var d1 = params.d1;
            var d2 = params.d2;
            var list = [Number(params.lng), Number(params.lat)];
            for (let i = d1; i < d2; i += 1) {
                var point = this.calculatingTargetPoints(
                    params.lng,
                    params.lat,
                    0,
                    (90 - i) * (Math.PI / 180),
                    params.zcjl
                );
                list.push(point[0]);
                list.push(point[1]);
            }
            list.push(Number(params.lng));
            list.push(Number(params.lat));

            // console.log("list", list);
            if (!this.sectorEntity[params.id]) {
                this.viewer.entities.remove(this.sectorEntity[params.id]);
            }
            var box = this.viewer.entities.add({
                // var box = viewer.entities.add({
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(list),//fromDegreesArrayHeights
                    material: Cesium.Color.RED.withAlpha(0.4),
                    // perPositionHeight: true,
                },
            });
            // sectorEntity[params.id] = box;
            this.sectorEntity[params.id] = box;

            this.viewer.camera.flyTo({
                destination: new Cesium.Cartesian3.fromDegrees(
                    Number(params.lng),
                    Number(params.lat),
                    10000
                ),
            });
        },
    },

    mounted() {
        Cesium.Ion.defaultAccessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo";

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

        antiAliasing(viewer); // 抗锯齿
        // viewer.extend(Cesium.viewerCesiumInspectorMixin); //

        /* 类型一 */
        /* 创建一个立起来的扇形 */
        let params = {
            d1: 0,
            d2: 45,
            lng: 35,
            lat: 35,
            zcjl: 80000,
        };
        this.drawSector(params);

        /* 一个半圆，被挖掉一个圆锥 --- 扇形扫过的区域的轮廓 */

        /* 类型二 */
        /* 由飞机模型所在位置发出，发出4条线，组成的5个面中：左右两侧是平面，上下两侧是曲面，前面是曲面 */

        // Fly the camera to San Francisco at the given longitude, latitude, and height.
        // viewer.camera.flyTo({
        //   destination : Cartesian3.fromDegrees(-122.4175, 37.655, 400),
        //   orientation : {
        //     heading : Math.toRadians(0.0),
        //     pitch : Math.toRadians(-15.0),
        //   }
        // });
    },
    beforeDestroy() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div#cesiumContainer {
    height: 100vh;
    width: 100vw;
}
</style>
