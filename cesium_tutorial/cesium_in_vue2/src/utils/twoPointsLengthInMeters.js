
// import * as Cesium from 'cesium'
import {Cartesian3,Cartographic,EllipsoidGeodesic} from 'cesium'

// function twoPointsLengthInMeters(startPoint,endPoint) {
//     if (!startPoint || !endPoint) { alert(' startPoint 和 endPoint 都必须传入'); return; }
//     if (startPoint instanceof Cesium.Cartesian3) { startPoint = Cesium.Cartographic.fromCartesian(startPoint); }
//     if (endPoint instanceof Cesium.Cartesian3) { endPoint = Cesium.Cartographic.fromCartesian(endPoint); }
//     // new Cesium.Cartographic();
//     const geodesic = new Cesium.EllipsoidGeodesic();
//     geodesic.setEndPoints(startPoint, endPoint);// 传入的必须是 Cartographic

//     const lengthInMeters = Math.round(geodesic.surfaceDistance);

//     return lengthInMeters;
// }
function twoPointsLengthInMeters(startPoint,endPoint) {
    if (!startPoint || !endPoint) { alert(' startPoint 和 endPoint 都必须传入'); return; }
    if (startPoint instanceof Cartesian3) { startPoint = Cartographic.fromCartesian(startPoint); }
    if (endPoint instanceof Cartesian3) { endPoint = Cartographic.fromCartesian(endPoint); }
    console.log("startPoint",startPoint, "endPoint",endPoint)
    // new Cesium.Cartographic();
    const geodesic = new EllipsoidGeodesic();
    geodesic.setEndPoints(startPoint, endPoint);// 传入的必须是 Cartographic

    const lengthInMeters = Math.round(geodesic.surfaceDistance);

    return lengthInMeters;
}

export default twoPointsLengthInMeters