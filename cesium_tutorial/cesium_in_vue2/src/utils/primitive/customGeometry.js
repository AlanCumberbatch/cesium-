import * as Cesium from 'cesium'


// 将经纬度高度 转换未世界坐标
function transformCartesian3Pos(__positions) {
  let realPos = []
  for (let i = 0, ii = __positions.length; i < ii; i += 3) {
      let position = Cesium.Cartesian3.fromDegrees(
          __positions[i],
          __positions[i + 1],
          __positions[i + 2]
      )
      realPos.push(position.x, position.y, position.z)
  }
  return realPos
}

function generateGeometry( realPos, __colors, __indices) {
  /* 构造 几何体的 内部属性 */

  var attributes = new Cesium.GeometryAttributes({
    position: new Cesium.GeometryAttribute({
      componentDatatype: Cesium.ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: new Float64Array(realPos),
    }),
    color: new Cesium.GeometryAttribute({
      componentDatatype: Cesium.ComponentDatatype.FLOAT,
      componentsPerAttribute: 4,
      values: new Float32Array(__colors),
    }),
  })
  // console.log('%c [ attributes ]-25', 'font-size:13px; background:pink; color:#bf2c9f;', attributes)

  //包围球
  var boundingSphere = Cesium.BoundingSphere.fromVertices(
      realPos,
      new Cesium.Cartesian3(0.0, 0.0, 0.0),
      3
  )
  // console.log(boundingSphere)

  // 计算顶点法向量
  var geometry = new Cesium.Geometry({
      attributes: attributes,
      // indices: __indices,
      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      boundingSphere: boundingSphere,
  })
  console.log('%c [ geometry ]-51', 'font-size:13px; background:pink; color:#bf2c9f;', geometry)
  return geometry
}
// 添加geometry 进场景
function addPrimitive(viewer, realPos, __colors, __indices, wire) {
  /*
    wire 为true时，不给三角面填充颜色，如上图效果一致。否则填色。--> wire为false时，还需要Appearance里面flat 更改为false ，才可正常填色。不用再问我。
    如果需要表现出一种阴影(高低起伏)效果，需要在返回的geometry前包装一个如 Cesium.GeometryPipeline.computeNormal(geometry)，计算每个点的法向量，在外观appearance里的flat设置为false，即可。
  */
  if (wire) {
      //四面体的实例
      var instance = new Cesium.GeometryInstance({
          geometry: Cesium.GeometryPipeline.toWireframe(
              generateGeometry(realPos, __colors, __indices)
          ),
      })
  } else {
      var instance = new Cesium.GeometryInstance({
          geometry: generateGeometry(
              realPos,
              __colors,
              __indices
          ),
      })
  }

  //加入场景
  viewer.scene.primitives.add(
      new Cesium.Primitive({
          geometryInstances: instance,
          appearance: new Cesium.PerInstanceColorAppearance({
              flat: true,
              translucent: false,
          }),
          asynchronous: false,
      })
  )
}


export default addPrimitive