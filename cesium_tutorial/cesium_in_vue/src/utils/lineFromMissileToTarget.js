import * as Cesium from 'cesium'
import createCustomMaterialImg from './createCustomMaterialImg.js'

function lineFromMiddileToTarget(viewer,lineOption,materialOption) {
    if (!viewer) { alert('必须传入 viewer'); return; }

    // / let newMaterialName = this.colorfulDynamicLine({});
    let newMaterialName = createCustomMaterialImg({
        img: "./imgs/blackAndWhite.png",
        type: 'PolylineBlackWhiteColor',//type的命名规则： polyline/polygon/图元名称 + 描述(根据具体特性)
        diffuse: 4.0,// 这个值为 1 或者 小于 1 ，成为白色；  大于 1，颜色表面增加一层灰度； 默认 2.0；
        animationSpeed: 0.5,// 动画效果的速率，必须大于0。 大于 1 相当于 加速相应倍数； 大于 0 小于 1 相当于 减慢 相应倍数
    });
    // "./imgs/pureWhite.png";
    // "./imgs/white.png";
    // "./imgs/mixColor.png";
    // "./imgs/blue.png";
    // "./imgs/colors.png";

    let item = viewer.entities.add({
        name: "Red line on terrain",
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]),
            // positions: Cesium.Cartesian3.fromDegreesArray([55, 35, 125, 35]),
            width: 5,
            // material: Cesium.Color.RED,
            // material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.WHITE, 3000, 1),
            material: new Cesium[newMaterialName](Cesium.Color.WHITE.withAlpha(0.6), 3000,1),
            clampToGround: true,
        },
    });

    return item;
}

export default lineFromMiddileToTarget