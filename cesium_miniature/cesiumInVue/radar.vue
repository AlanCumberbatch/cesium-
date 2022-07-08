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
            sectorDegree: 60,
            radius: 100000.0,
            innerRadius: 10.0,
            heading: 10.0,
            position:null,
        };
    },
    methods: {
        // 创建一个圆锥
        crreateCylinder() {
            let len = this.radius * Math.sin(60);
            console.log("len", len);
            // let topRadius = this.radius * Math.sin(Math.PI / 2 - this.sectorDegree);
            let topRadius =
                this.radius * Math.sin((30 * Math.PI) / 180).toFixed(1);
            let cylinderHeight = this.radius * Math.cos((30 * Math.PI) / 180); //.toFixed(1);
            console.log("topRadius", topRadius);

            const entity = this.viewer.entities.add({
                name: "Red cone",
                // position: Cesium.Cartesian3.fromDegrees(-80, 35,topRadius),
                position: Cesium.Cartesian3.fromDegrees(-80, 35),
                cylinder: {
                    // length: topRadius*2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    length: cylinderHeight,
                    bottomRadius: 0.0,
                    topRadius: topRadius,
                    material: Cesium.Color.RED.withAlpha(0.2),
                    fill: false,
                    outline: true,
                    // slices:100
                },
            });
            return entity;
        },
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
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(list), //fromDegreesArrayHeights
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

        // 根据第一个点 偏移距离 角度 求取第二个点的坐标,
        calcPoints(x1, y1, radius, sectorAngle, heading) {
            var m = Cesium.Transforms.eastNorthUpToFixedFrame(
                Cesium.Cartesian3.fromDegrees(x1, y1)
            );
            var rx = radius * Math.cos((heading * Math.PI) / 180.0);
            var ry = radius * Math.sin((heading * Math.PI) / 180.0);
            var translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
            var d = Cesium.Matrix4.multiplyByPoint(
                m,
                translation,
                new Cesium.Cartesian3()
            );
            var c = Cesium.Cartographic.fromCartesian(d);
            var x2 = Cesium.Math.toDegrees(c.longitude);
            var y2 = Cesium.Math.toDegrees(c.latitude);

            return this.computeCirclularFlight(x1, y1, x2, y2, sectorAngle, 0);
        },
        // 根据两个点（圆心，对应地面圆上的点） 开始角度、夹角度 求取立面的扇形
        computeCirclularFlight(x1, y1, x2, y2, fx, angle) {
            let positionArr = [];
            positionArr.push(x1); // 这个还是有必要的
            positionArr.push(y1);
            positionArr.push(0);
            var radius = Cesium.Cartesian3.distance(
                Cesium.Cartesian3.fromDegrees(x1, y1),
                Cesium.Cartesian3.fromDegrees(x2, y2)
            );
            for (let i = 0; i <= fx; i++) {
                //+ angle
                let h = radius * Math.sin((i * Math.PI) / 180.0);
                let rCos = Math.cos((i * Math.PI) / 180.0);
                let x = (x2 - x1) * rCos + x1;
                let y = (y2 - y1) * rCos + y1;

                positionArr.push(x);
                positionArr.push(y);
                positionArr.push(h);
            }
            // for (let i = fx; i <= fx + angle; i++) {//+ angle
            //     let h = radius * Math.sin((i * Math.PI) / 180.0);
            //     let l = Math.cos((i * Math.PI) / 180.0);
            //     let x = (x2 - x1) * l + x1;
            //     let y = (y2 - y1) * l + y1;
            //     positionArr.push(x);
            //     positionArr.push(y);
            //     positionArr.push(h);
            // }
            positionArr.push(x1); // 这个还是有必要的
            positionArr.push(y1);
            positionArr.push(0);

            return positionArr;
        },

        rotateEntityOri(instance, _rotation, _amount) {
            console.log("instance", instance);
            // console.log("instance.stRotation", instance.stRotation);
            // console.log("instance.rotation", instance.rotation);
            // instance.rotation = new Cesium.CallbackProperty(function() {
            //  _rotation += _amount;
            //  if (_rotation >= 360 || _rotation <= -360) {
            //      _stRotation = 0;
            //  }
            //  return Cesium.Math.toRadians(_rotation);
            // }, false);
            let position = instance.position.getValue(Cesium.JulianDate.now()); //先得到entity的位置
            console.log("position", position);

            let orientation = instance.orientation.getValue(
                Cesium.JulianDate.now()
            ); //entity的朝向
            console.log("orientation", orientation);

            function rotatingByMatrix4(mat, options) {
                let _rotateX = Cesium.Matrix3.fromRotationX(
                    Cesium.Math.toRadians(options.x)
                );

                let _rotateY = Cesium.Matrix3.fromRotationY(
                    Cesium.Math.toRadians(options.y)
                );

                let _rotateZ = Cesium.Matrix3.fromRotationZ(
                    Cesium.Math.toRadians(options.z)
                );

                mat = Cesium.Matrix4.multiplyByMatrix3(mat, _rotateX, mat);

                mat = Cesium.Matrix4.multiplyByMatrix3(mat, _rotateY, mat);

                mat = Cesium.Matrix4.multiplyByMatrix3(mat, _rotateZ, mat);

                return mat;
            }

            let transform = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
                position,
                orientation,
                new Cesium.Cartesian3(1, 1, 1),
                new Cesium.Matrix4()
            ); //得到entity的位置朝向矩阵

            transform = rotatingByMatrix4(transform, options); //根据沿着x,y,z轴旋转之后，得到旋转矩阵

            let orientation_ = new Cesium.Quaternion();

            let m3 = Cesium.Matrix4.getRotation(
                transform,
                new Cesium.Matrix3()
            ); //得到3*3的旋转矩阵

            Cesium.Quaternion.fromRotationMatrix(m3, orientation_); //将旋转矩阵转换成齐次坐标

            instance.orientation.setValue(orientation_); //更新entity的朝向
        },
        rotateEntity(instance) {
            let heading = this.heading;
            let position = instance.position._value;

            this.viewer.clock.onTick.addEventListener(() => {
                // instance.orientation.setValue(pos);
                    heading += 4.0;
                instance.orientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(heading * Math.PI / 180, 0.0, 0.0));
            });
            // function repeatOften() {
            // //     // console.log("heading", heading);
            // //     // console.log("instance", instance);
            //     heading += 4.0;
            //     instance.orientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(heading * Math.PI / 180, 0.0, 0.0));
            // //     // console.log("pos",pos);
            // //     // instance.orientation = pos;
            // //     // Do whatever
            // //     requestAnimationFrame(repeatOften);
            // }
            // // requestAnimationFrame(repeatOften);

            // var int=setInterval(repeatOften,100);
        },

        create_first_RadarByElliposidSectorCylinder() {
            let radius = this.radius; //100000.0,
            let innerRadius = this.innerRadius; //10.0
            let sectorDegree = this.sectorDegree;
            //! 问题： 圆锥不能只显示表面，所以用不了了
            let viewer = this.viewer;
            /* 一个半圆，被挖掉一个圆锥 --- 扇形扫过的区域的轮廓 */
            // 一个半圆, 一个带空心的半圆
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(-80, 35),
                // ellipsoid: {
                //     radii: new Cesium.Cartesian3(
                //         this.radius,
                //         this.radius,
                //         this.radius
                //     ),
                //     maximumCone: Cesium.Math.toRadians(90),
                //     minimumCone: Cesium.Math.toRadians(90 - this.sectorDegree),
                //     material: new Cesium.Color.fromCssColorString("#00dcff82"),
                //     // outline: true,
                //     // outlineColor: new Cesium.Color.fromCssColorString("#00dcff82"),
                //     // outlineWidth: 1,
                //     // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                //     //     0.0,
                //     //     10.5e6
                //     // ),
                // },
                ellipsoid: {
                    radii: new Cesium.Cartesian3(radius, radius, radius), // 扇形半径
                    innerRadii: new Cesium.Cartesian3(
                        innerRadius,
                        innerRadius,
                        innerRadius
                    ), //内半径
                    minimumCone: Cesium.Math.toRadians(90 - sectorDegree),
                    maximumCone: Cesium.Math.PI_OVER_TWO,
                    material: Cesium.Color.RED.withAlpha(0.3),
                    // outline: true,
                },
            });

            // 扇形  wall
            let heading = 0;
            let positionArr = this.calcPoints(
                -80,
                35,
                radius, //此处与圆的半径保持一致
                sectorDegree, //生成的扇形的角度
                heading
            );
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(-80, 35),
                wall: {
                    positions: new Cesium.CallbackProperty(() => {
                        return Cesium.Cartesian3.fromDegreesArrayHeights(
                            positionArr
                        );
                    }, false),
                    material: new Cesium.Color.fromCssColorString("#00dcff82"),
                    // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                    //     0.0,
                    //     10.5e6
                    // ),
                },
            });

            // 一个圆锥 --- 不需要了
            // this.crreateCylinder();

            // 扇形动起来
            viewer.clock.onTick.addEventListener(() => {
                heading += 1.0;
                positionArr = this.calcPoints(
                    -80,
                    35,
                    radius,
                    sectorDegree,
                    heading
                );
            });

            this.viewer.zoomTo(this.viewer.entities);
        },
        create_first_RadarByElliposid() {
            let angleOfHollow = 40.0;
            let angleOfSector = 90.0 - angleOfHollow; // 扇形的角度
            let radius = this.radius; //200000.0; //球体半径/扇形侧边距/雷达扫描半径
            let innerRadius = 80.0;

            // 带 空心 的半球体
            this.viewer.entities.add({
                name: "Dome with top cut out",
                position: Cesium.Cartesian3.fromDegrees(-80, 35),
                ellipsoid: {
                    radii: new Cesium.Cartesian3(radius, radius, radius), // 扇形半径
                    innerRadii: new Cesium.Cartesian3(
                        innerRadius,
                        innerRadius,
                        innerRadius
                    ), //内半径
                    minimumCone: Cesium.Math.toRadians(angleOfSector),
                    maximumCone: Cesium.Math.PI_OVER_TWO,
                    material: Cesium.Color.RED.withAlpha(0.3),
                    // outline: true,
                },
            });

            // 扇形
            let position = Cesium.Cartesian3.fromDegrees(-80, 35);
            this.position = position;
            let sector = this.viewer.entities.add({
                name: "Dome with top cut out",
                position: position,
                orientation: Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(90 * Math.PI / 180, 0.0, 0.0)),
                ellipsoid: {
                    radii: new Cesium.Cartesian3(radius, radius, radius),
                    innerRadii: new Cesium.Cartesian3(
                        innerRadius,
                        innerRadius,
                        innerRadius
                    ),
                    minimumCone: Cesium.Math.toRadians(angleOfSector),
                    maximumCone: Cesium.Math.PI_OVER_TWO,
                    material: Cesium.Color.RED.withAlpha(0.2),
                    minimumClock: Cesium.Math.toRadians(0),
                    maximumClock: Cesium.Math.toRadians(0.1),
                },
            });

            // 让扇形动起来
            this.rotateEntity(sector);

            this.viewer.zoomTo(this.viewer.entities);
        },
    },

    mounted() {
        Cesium.Ion.defaultAccessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo";

        let viewer = new Cesium.Viewer("cesiumContainer", {
            infoBox: false,
            selectionIndicator: false,
        });
        this.viewer = viewer;

        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        this.cesiumHandler = handler;

        antiAliasing(viewer); // 抗锯齿
        // viewer.extend(Cesium.viewerCesiumInspectorMixin); //

        /* 类型一 */
        /* 创建一个立起来的扇形 */
        // let params = {
        //     d1: 0,
        //     d2: 45,
        //     lng: 35,
        //     lat: 35,
        //     zcjl: 80000,
        // };
        // this.drawSector(params);

        // this.create_first_RadarByElliposidSectorCylinder(); //OK：圆锥不能只显示表面，所以用不了了---》 不需要圆锥了。 但是生成的扇形和现有的轮廓不是非常贴合
        this.create_first_RadarByElliposid();

        /* 类型二 */
        /* 由飞机模型所在位置发出，发出4条线，组成的5个面中：左右两侧是平面，上下两侧是曲面，前面是曲面 */
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
