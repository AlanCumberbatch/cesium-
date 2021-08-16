# Beginning

```js
var viewer = new Cesium.Viewer('cesiumContainer');
var scene = viewer.scene;

var instance = new Cesium.GeometryInstance({
  geometry: new Cesium.RectangleGeometry({
    rectangle: Cesium.Rectangle.fromDegrees(-100.0, 20.0, -90.0, 30.0),
    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
  })
});

var anotherInstance = new Cesium.GeometryInstance({
  geometry: new Cesium.RectangleGeometry({
    rectangle: Cesium.Rectangle.fromDegrees(-85.0, 20.0, -75.0, 30.0),
    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
  })
});

scene.primitives.add(new Cesium.Primitive({
  geometryInstances: [instance, anotherInstance],
  appearance: new Cesium.EllipsoidSurfaceAppearance({//因为在表面或者在距离地面固定高度的模型，所以用这个
    material: Cesium.Material.fromType('Stripe')
  })
}));
```

# End

成功<font color=red>添加</font> 图元 及相关操作, 并<font color=red>渲染</font>成功
<br>
<br>

# Process from Beginning to End

[for detail](../0_TO_1_about/index_primitives_add.md)