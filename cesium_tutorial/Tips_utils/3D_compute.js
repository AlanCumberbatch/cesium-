const radiansPerDegree = Math.PI / 180.0 // 角度转化为弧度(rad)
const degreesPerRadian = 180.0 / Math.PI // 弧度转化为角度
// 两点计算heading角，参数传入Cartesian3（用于）
function calculationHeading(startPoint, endPoint) {
  // 建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(startPoint)
  // 向量AB
  const positionvector = Cesium.Cartesian3.subtract(endPoint, startPoint, new Cesium.Cartesian3())
  // 逆矩阵
  const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3())
  // 归一化
  const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3())
  // heading
  const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO
  return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading)
}
// 笛卡尔坐标系转WGS84坐标系
function Cartesian3_to_WGS84(point) {
  var cartesian33 = new Cesium.Cartesian3(point.x, point.y, point.z)
  var cartographic = Cesium.Cartographic.fromCartesian(cartesian33)
  var lat = Cesium.Math.toDegrees(cartographic.latitude)
  var lng = Cesium.Math.toDegrees(cartographic.longitude)
  var alt = cartographic.height
  // const res = coordSwitchFuc(lng, lat)
  const res = [lng, lat]
  return {
    lnglat: [parseFloat(res[0].toFixed(4)), parseFloat(res[1].toFixed(4))],
    lnglathei: {
      lon: parseFloat(res[0].toFixed(4)),
      lat: parseFloat(res[1].toFixed(4)),
      hei: parseFloat(alt.toFixed(4))
    }
  }
}
// WGS84坐标系转笛卡尔坐标系
function WGS84_to_Cartesian3(point) {
  var car33 = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, point.alt)
  var x = car33.x
  var y = car33.y
  var z = car33.z
  return {
    x: x,
    y: y,
    z: z
  }
}
// 计算空间多点之间的连接总长度 ，单位米
function getSpaceDistance(positions) {
  var distance = 0
  for (var i = 0; i < positions.length - 1; i++) {
    var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i])
    var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1])
    /** 根据经纬度计算出距离**/
    var geodesic = new Cesium.EllipsoidGeodesic()
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    var s = geodesic.surfaceDistance
    // console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
    // 返回两点之间的距离
    s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
    distance = distance + s
  }
  // if (distance > 1000) {
  //   textDisance = (distance / 1000.0).toFixed(2) + 'km'
  // }
  return distance
}

// 计算多边形面积
function getArea(points, positions) {
  var res = 0
  // 拆分三角曲面

  for (var i = 0; i < points.length - 2; i++) {
    var j = (i + 1) % points.length
    var k = (i + 2) % points.length
    var totalAngle = Angle(points[i], points[j], points[k])

    var dis_temp1 = getSpaceDistance([positions[i], positions[j]])
    var dis_temp2 = getSpaceDistance([positions[j], positions[k]])
    res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
    console.log(res)
  }

  return res.toFixed(2)
}

/* 角度 */
function Angle(p1, p2, p3) {
  var bearing21 = Bearing(p2, p1)
  var bearing23 = Bearing(p2, p3)
  var angle = bearing21 - bearing23
  if (angle < 0) {
    angle += 360
  }
  return angle
}
/* 方向 */
function Bearing(from, to) {
  var lat1 = from.lat * radiansPerDegree
  var lon1 = from.lon * radiansPerDegree
  var lat2 = to.lat * radiansPerDegree
  var lon2 = to.lon * radiansPerDegree
  var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2))
  if (angle < 0) {
    angle += Math.PI * 2.0
  }
  angle = angle * degreesPerRadian // 角度
  return angle
}
/*
 *@Description: 点转geojson
 *@paramter:[117.42,41.38]
 *@return:
 */
function pointToGeoJson(points) {
  var geojsonobj = {
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': points
    },
    'properties': {}
  }
  return geojsonobj
}
/*
 *@Description: 线转geojson
 *@paramter:[[117.42,42.38],[116.54,32.15]]
 *@return:
 */
function lineToGeoJson(points) {
  var geojsonobj = {
    'type': 'Feature',
    'geometry': {
      'type': 'LineString',
      'coordinates': points
    },
    'properties': {}
  }
  return geojsonobj
}
/*
 *@Description: 面转geojson,points为多个点对象数组
 *@paramter:[[117.42,42.13],[117.42,42.13]]
 *@return:
 */
function polygonToGeojson(points) {
  var geojsonobj = {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [points]
    },
    'properties': {}
  }
  return geojsonobj
}


// 获取坐标
// 不贴地使用
function getcartesian(position, viewer) {
  var pickedObject = viewer.scene.pick(position)
  // 场景坐标
  if (pickedObject && Cesium.defined(pickedObject.primitive) && Cesium.defined(pickedObject.content)) {
    const cartesian = viewer.scene.pickPosition(position)
    return cartesian
  } else {
    // 地表坐标
    const ray = viewer.camera.getPickRay(position)
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    return cartesian
  }
  // viewer.camera.pickEllipsoid在加载地形场景上有误差
  // viewer.scene.pickPosition 需要开启深度测试来解决在没有3dTile模型下的笛卡尔座标不准问题（未开启深度测试时只能在3DTile上准确获取空间坐标）scene理解主要就是获取场景坐标
  // cartesian = viewer.scene.pickPosition(movement.endPosition);
  // var cartesian = viewer.scene.pickPosition(position)
  // viewer.camera.getPickRay,viewer.scene.globe.pick(通过camera中的getPickRay获取ray（射线），然后通过globe中的pick方法，获取世界坐标) 常用方法
}

// 贴地测量有bug，使用getcartesian2
function getcartesian2(position, viewer) {
  var pickedObject = viewer.scene.pick(position)

  // 场景坐标
  if (pickedObject && Cesium.defined(pickedObject.primitive)) {
    const cartesian = viewer.scene.pickPosition(position)
    return cartesian
  } else {
    // 地表坐标
    const ray = viewer.camera.getPickRay(position)
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    return cartesian
  }
}
