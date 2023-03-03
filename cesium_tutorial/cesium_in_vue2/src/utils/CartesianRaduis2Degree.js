// import * as Cesium from 'cesium'
import { Math as CesiumMath } from 'cesium'

// 此方法每次只能添加一个Label
function CartesianRaduis2Degree(viewer, Cartesian3) {

    if (!viewer) { alert('必须传入 viewer'); return; }
    if (!Cartesian3) { alert('必须传入 Cartesian3'); return; }

    // Cartesian3 --> degree
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartographic = ellipsoid.cartesianToCartographic(Cartesian3);
    var lon = CesiumMath.toDegrees(cartographic.longitude);
    var lat = CesiumMath.toDegrees(cartographic.latitude);
    var alt = cartographic.height;//这个存在偏差： 100000 --变成了--》99999.99999993405，并没有做处理

    return { lon, lat, alt };
}

export default CartesianRaduis2Degree