
import * as Cesium from 'cesium'

function antiAliasing(viewer) {
if (!viewer) { alert('必须传入 viewer'); return; }
// 抗锯齿
// 法一：（不如法二好用）
    // // 关闭抗锯齿
    // viewer.scene.fxaa = false;
    // viewer.scene.postProcessStages.fxaa.enabled = false;
    // // 添加如下代码到项目中，自动调整分辨率
    // var supportsImageRenderingPixelated = viewer.cesiumWidget._supportsImageRenderingPixelated;
    // if (supportsImageRenderingPixelated) {
    //     var vtxf_dpr = window.devicePixelRatio;
    //     while (vtxf_dpr >= 2.0) {
    //         vtxf_dpr /= 2.0;
    //     }
    //     viewer.resolutionScale = vtxf_dpr;
    // }
// 法二： 真的好用
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        //判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio;
    }
    //是否开启抗锯齿
    viewer.scene.fxaa = true;
    viewer.scene.postProcessStages.fxaa.enabled = true;
}

export default antiAliasing