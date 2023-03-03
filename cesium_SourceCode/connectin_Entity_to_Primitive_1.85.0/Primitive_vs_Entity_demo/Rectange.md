```js
//entity方式
viewer.entities.add({
  rectangle: {
   coordinates: Cesium.Rectangle.fromDegrees(110.20, 34.55, 111.20, 35.55),
    material: new Cesium.StripeMaterialProperty({
       evenColor: Cesium.Color.WHITE,
       oddColor: Cesium.Color.BLUE,
       repeat:5
    })
  }
});

//primitive方式
/*
  将 primitive/图元 塞入 scene.primitives
*/
var instance = new Cesium.GeometryInstance({
  geometry: new Cesium.RectangleGeometry({
    rectangle: Cesium.Rectangle.fromDegrees(105.20, 30.55, 106.20, 31.55),
    vertexFormat:Cesium.EllipsoidSurfaceAppearance.VERTEXT_FORMAT
  })
});

// viewer.scene.primitives is a instance of PrimitiveCollection
viewer.scene.primitives.add(new Cesium.Primitive({
  // 几何形状
  geometryInstances: instance,
  // 外观
  appearance: new Cesium.EllipsoidSurfaceAppearance({
     material:Cesium.Material.fromType('Stripe')
  })
}));

```