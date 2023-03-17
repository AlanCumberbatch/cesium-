// import * as Cesium from "cesium";

class ForTest  {
  constructor(viewer) {
    this.viewer = viewer;
  }

  createPoint(pos,size=10,color=Cesium.Color.RED) {
    let point = this.viewer.entities.add({
      position: pos,
      point: {
          pixelSize: size,
          color: color,
      },
    });
    return point;
  }

  createPolyline(pos=Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]), color=Cesium.Color.YELLOW,width=5){
    const polyline = this.viewer.entities.add({
        polyline: {
            positions: pos,
            width: width,
            arcType: Cesium.ArcType.RHUMB,
            material: color,
        },
    });
    return polyline;
  }
}
export default ForTest