// addPrimitivePoint
function addPrimitivePoint(viewer,positions) {// positions - <Cartesian3>Array
  var points = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());

  if (Array.isArray(positions)) {
    if (positions[0] instanceof Cesium.Cartesian3) {
      for (let i = 0; i < positions.length; i++){
        points.add({
          position: positions[i],
          color: Cesium.Color.YELLOW,
          size:100,
        });
      }
    } else {
      for (let i = 0; i < positions.length; i++){
        points.add({
          position: new Cesium.Cartesian3.fromDegrees(positions[i][0],positions[i][1],positions[i][2]),
          color: Cesium.Color.YELLOW,
          size:100,
        });
      }
    }
  } else {
    points.add({
      position: positions,
      color: color,
      size:10,
    });
  }
}
export default addPrimitivePoint