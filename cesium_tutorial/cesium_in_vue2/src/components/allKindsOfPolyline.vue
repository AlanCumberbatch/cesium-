<template>
    <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import antiAliasing from "../utils/antiAliasing.js";
import createGroundRader from "../utils/createGroundRader.js";
import preventCameraIntoUnderground from "../utils/preventCameraIntoUnderground.js";
import createCustomMaterialImg from "../utils/createCustomMaterialImg.js";
import lineFromMissileToTarget from "../utils/lineFromMissileToTarget.js";

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
            position: null,
        };
    },
    methods: {
        // xt3d 他们可以实现的功能确实可以，很值得学习
        colorfulDynamicLine(options) {
            // let imgUrl = options && options.img ? options.img : "./imgs/pureWhite.png";
            let imgUrl = options && options.img ? options.img : "./imgs/colors.png";
            let type = options && options.type ? options.type : 'PolylineTrailLink';
            let imgName = `${type}Image`;// PolylineTrailLinkImage
            let shaderSource = `${type}Source`;// PolylineTrailLinkSource
            let materialTypeKey = `${type}Type`;// PolylineTrailLinkType
            let MaterialProperty = `${type}MaterialProperty`;// PolylineTrailLinkType


            function PolylineTrailLinkMaterialProperty(color, duration,d) {
                this._definitionChanged = new Cesium.Event();
                this._color = undefined;
                this._colorSubscription = undefined;
                this.color = color;
                this.duration = duration || 3000;
                this._time = (new Date()).getTime();
                this._d=d;
                this.isTranslucent = function () {
                    return true;
                }
            }
            Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
                isConstant: {
                    get: function () {
                        return false;
                    }
                },
                definitionChanged: {
                    get: function () {
                        return this._definitionChanged;
                    }
                },
                color: Cesium.createPropertyDescriptor('color')
            });
            PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
                return type; //'PolylineTrailLink';
            }
            PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
                if (!Cesium.defined(result)) {
                    result = {};
                }
                result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
                result.image = Cesium.Material[imgName];
                result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration*this._d;
                return result;
            }
            PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
                return this === other || (other instanceof PolylineTrailLinkMaterialProperty && Property.equals(this._color, other._color))
            }


            // Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
            Cesium[MaterialProperty] = PolylineTrailLinkMaterialProperty;

            Cesium.Material[materialTypeKey] = type; //'PolylineTrailLink';
            Cesium.Material[imgName] = imgUrl;

            // Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
            // Cesium.Material.PolylineTrailLinkType = type; //'PolylineTrailLink';
            // Cesium.Material.PolylineTrailLinkImage = imgUrl; //"./imgs/pureWhite.png";
            // Cesium.Material.PolylineTrailLinkImage = "./imgs/white.png";
            // Cesium.Material.PolylineTrailLinkImage = "./imgs/mixColor.png";
            // Cesium.Material.PolylineTrailLinkImage = "./imgs/blue.png";
            // Cesium.Material.PolylineTrailLinkImage = "./imgs/colors.png";
            Cesium.Material[shaderSource] = " czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                                    {\n\
                                                                        czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                                        vec2 st = materialInput.st;\n\
                                                                        vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t ));\n\
                                                                        material.alpha = colorImage.a * color.a;\n\
                                                                        material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                                        return material;\n\
                                                                    }";

            Cesium.Material._materialCache.addMaterial(Cesium.Material[materialTypeKey], {
                fabric: {
                    type: Cesium.Material[materialTypeKey],
                    uniforms: {
                        color: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
                        image: Cesium.Material[imgName],
                        time: -20
                    },
                    source: Cesium.Material[shaderSource],
                },
                translucent: function (material) {
                    return true;
                }
            });

            return MaterialProperty;
            // Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
            //     fabric: {
            //         type: Cesium.Material.PolylineTrailLinkType,
            //         uniforms: {
            //             color: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
            //             image: Cesium.Material.PolylineTrailLinkImage,
            //             time: -20
            //         },
            //         source: Cesium.Material.PolylineTrailLinkSource
            //     },
            //     translucent: function (material) {
            //         return true;
            //     }
            // });


        },
        createDashLine(viewer) {
            let newMaterialName = createCustomMaterialImg({
                img: "./imgs/blackAndWhite.png",
                type: 'PolylineBlackWhiteColor',//type的命名规则： polyline/polygon/图元名称 + 描述(根据具体特性)
                diffuse: 4.0,// 这个值为 1 或者 小于 1 ，成为白色；  大于 1，颜色表面增加一层灰度； 默认 2.0；
                animationSpeed:0.5,// 动画效果的速率，必须大于0。 大于 1 相当于 加速相应倍数； 大于 0 小于 1 相当于 减慢 相应倍数
            });

            let item = viewer.entities.add({
                name: 'PolylineTrail',
                polygon: {
                    // hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
                    //     50, 30, 250000,
                    //     60 , 30, 250000,
                    //     60 , 32, 250000,
                    //     50, 32, 250000,
                    // ]),
                    hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
                        -50, 30, 250000,
                        -60 , 30, 250000,
                        -60 , 32, 250000,
                        -50, 32, 250000,
                    ]),
                    width: 15,
                    // material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.WHITE, 3000,1)
                    material: new Cesium[newMaterialName](Cesium.Color.WHITE, 3000,1)
                }
            });

            // const redLine = viewer.entities.add({
            //     name: "Red line on terrain",
            //     polyline: {
            //         positions: Cesium.Cartesian3.fromDegreesArrayHeights([-75, 35, 100000, -125, 35, 100000]),
            //         // positions: Cesium.Cartesian3.fromDegreesArray([55, 35, 125, 35]),
            //         width: 50,
            //         // material: Cesium.Color.RED,
            //         // material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.WHITE, 3000, 1),
            //         material: new Cesium[newMaterialName](Cesium.Color.WHITE, 3000,1),
            //         // clampToGround: true,
            //     },
            // });
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
        preventCameraIntoUnderground(viewer); //让相机不能进入地球内部---不然飞机模型的扫描区域的地下部分可以被很明显的看见
        // viewer.extend(Cesium.viewerCesiumInspectorMixin); //

        // 添加图片（注意图片里每个 pixel 的颜色） + 会动
        this.createDashLine(viewer);

        // 这个方法目前的实现和C端比还有一定差距：关键在于 shader 的书写。
        // lineFromMissileToTarget(viewer);// 已经可以显示出一个动态的 poyline

        // this.viewer.camera.flyTo({
        //     destination: Cesium.Cartesian3.fromDegrees(50, 30,450000),
        // })
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
