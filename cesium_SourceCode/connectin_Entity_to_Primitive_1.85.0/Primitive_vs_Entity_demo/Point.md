```js
const dataPoint = { longitude: -122.38985, latitude: 37.61864, height: -27.32 };
// Mark this location with a red point.

//entity方式
const pointEntity = viewer.entities.add({
  description: `First data point at (${dataPoint.longitude}, ${dataPoint.latitude})`,
  position: Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
  point: { pixelSize: 10, color: Cesium.Color.RED }
});

// Fly the camera to this point.
viewer.flyTo(item);


//primitive方式
var points = primitives.add(new Cesium.PointPrimitiveCollection());
var item = points.add({
  position: Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
  color: Cesium.Color.RED
});

// Fly the camera to this point.
viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height+70),//此时，如果height 为负数，相机相会进入地球内部，小于50时不能看见红点（这一点可以进行设置）
});
```