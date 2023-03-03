import _ from 'lodash'
import * as Cesium from 'cesium/Cesium.js'
import * as turf from '@turf/turf'
export function addWorkAddrs(obj, viewer, powerCollection) {
  var lngLatAlt = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [obj.longitude, obj.latitude]
    },
    properties: {}
  }

  const res = turf.buffer(lngLatAlt, obj.radiusNum / 1000, {
    units: 'kilometers'
  })
  var geojson = null
  if (typeof (res) === 'string') {
    geojson = JSON.parse(res)
  } else {
    geojson = res
  }
  const promise = Cesium.GeoJsonDataSource.load(geojson, {
    clampToGround: true
  })
  promise.then(function (dataSource) {
    const entities = dataSource.entities.values
    for (let i = 0; i < entities.length; i++) {
      var entity = entities[i]
      entity.info = obj
      entity.polygon.fill = false
      entity.polygon.outline = true
      // 面状不显示边界线，需要添加线段
      var positions = entity.polygon.hierarchy._value.positions
      entity.polyline = {
        positions: positions,
        width: 4,
        material: Cesium.Color.GREEN.withAlpha(1),
        clampToGround: true
      }
      var entity2 = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(obj.longitude, obj.latitude),
        billboard: { // 图标
          image: require('@/assets/map/textPnl.png'),
          width: 150,
          height: 60,
          pixelOffset: new Cesium.Cartesian2(0, 0), // 偏移量
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000)
        },
        label: {
          font: 'normal 30px  Microsoft YaHei', // 字体样式
          // fillColor: Cesium.Color.WHITE, //字体颜色
          backgroundColor: new Cesium.Color(0, 0, 0, 0.5), // 背景颜色
          scale: 0.5,
          showBackground: true,
          pixelOffset: new Cesium.Cartesian2(0, -30), // 偏移
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000)
        }
      })
      // 异步要素贴地（等待倾斜摄影加载完毕）
      var startPosition = _.cloneDeep(entity2.position._value)
      viewer.scene.clampToHeightMostDetailed([entity2.position._value]).then(function (clampCartesians) {
        if (clampCartesians[0]) {
          var cartographic = Cesium.Cartographic.fromCartesian(clampCartesians[0]) // 结果对象中的值将以弧度表示。
          var height = Number(cartographic.height)
          if (height < (-1500)) {
            entity2.position = startPosition
          } else {
            var lnglatAlts = []
            var minimumHeights = []
            res.geometry.coordinates[0].forEach(item => {
              lnglatAlts.push(item[0], item[1], height + 20)
              minimumHeights.push(height - 50)
            })
            // 增加闪烁围栏效果
            addTwinkleWall(lnglatAlts, minimumHeights, viewer, powerCollection)
          }
        } else {
          entity2.position = startPosition
        }
      })
      // 面
      if (obj.weightStsCd == 2 || obj.dischargeStsCd == 2) {
        entity2.label.text = obj.title + '[停止]'
      } else {
        entity2.label.text = obj.title + '[正常]'
      }

      viewer.entities.add(entity)
      powerCollection.push(entity)
      powerCollection.push(entity2)
    }
  }).otherwise(function (error) {
    console.log(error)
  })
}
var alp = 1
var num = 0
var material_Wall2 = new Cesium.ImageMaterialProperty({
  image: require('@/assets/map/test-color2.png'),
  transparent: true,
  color: new Cesium.CallbackProperty(function () {
    return (
      num % 2 === 0 ? (alp -= 0.005) : (alp += 0.005),
      (alp <= 0.3 || alp >= 1) && num++,
      Cesium.Color.WHITE.withAlpha(alp)
    )
  }, false)
})
// 动态闪烁墙
function addTwinkleWall(lnglatAlts, minimumHeights, viewer, powerCollection) {
  var aWall = viewer.entities.add({
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(lnglatAlts),
      minimumHeights: minimumHeights,
      material: material_Wall2
    }
  })
  powerCollection.push(aWall)
}

// 添加采区，为方便贴地，使用polyline添加
export function polygonRegn(item, viewer, powerCollection) {
  var positions = []
  var arrSplit = item.regnCode.split(';')
  arrSplit.forEach(item => {
    var lnglat = item.split(',')
    positions.push(Cesium.Cartesian3.fromDegrees(parseFloat(lnglat[0]), parseFloat(lnglat[1]), 0))
  })
  // 为使线闭合,末尾增加第一个点
  var lnglat = arrSplit[0].split(',')
  positions.push(Cesium.Cartesian3.fromDegrees(parseFloat(lnglat[0]), parseFloat(lnglat[1]), 0))

  var entityPolyline = viewer.entities.add({
    polyline: {
      positions: positions,
      width: 4,
      material: Cesium.Color.GREEN.withAlpha(1),
      clampToGround: true
    }
  })

  var entity2 = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude),
    billboard: { // 图标
      image: require('@/assets/map/div1.png'),
      width: 150,
      height: 100,
      pixelOffset: new Cesium.Cartesian2(0, 0), // 偏移量
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000)
    },
    label: {
      text: item.title,
      font: '500 30px Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif', // 字体样式
      fillColor: Cesium.Color.WHITE, // 字体颜色
      backgroundColor: new Cesium.Color(26 / 255, 196 / 255, 228 / 255, 1.0), // 背景颜色
      scale: 0.5,
      showBackground: true,
      style: Cesium.LabelStyle.FILL,
      pixelOffset: new Cesium.Cartesian2(80, -78), // 偏移
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000)
    }

  })

  // 异步要素贴地（等待倾斜摄影加载完毕）

  var startPosition = _.cloneDeep(entity2.position._value)
  viewer.scene.clampToHeightMostDetailed([entity2.position._value]).then(function (clampCartesians) {
    if (clampCartesians[0]) {
      var cartographic = Cesium.Cartographic.fromCartesian(clampCartesians[0]) // 结果对象中的值将以弧度表示。
      var height = Number(cartographic.height)
      if (height < (-1500)) {
        entity2.position = startPosition
      } else {
        var lnglatAlts = []
        var minimumHeights = []
        arrSplit.forEach(item => {
          var lnglat = item.split(',')
          lnglatAlts.push(lnglat[0], lnglat[1], height + 15)
          minimumHeights.push(height - 50)
        })
        // 增加闪烁围栏效果
        addTwinkleWall(lnglatAlts, minimumHeights)
      }
    } else {
      entity2.position = startPosition
    }
  })
  powerCollection.push(entityPolyline)
  powerCollection.push(entity2)
}

// 要素贴地
export function clamp3DTiles(entity, lng, lat, entityCollection, viewer) {
  var position = Cesium.Cartesian3.fromDegrees(lng, lat, 0)
  // 异步要素贴地（等待倾斜摄影加载完毕）

  var startPosition = _.cloneDeep(position)
  viewer.scene.clampToHeightMostDetailed([position], entityCollection).then(function (clampCartesians) {
    if (clampCartesians[0]) {
      var cartographic = Cesium.Cartographic.fromCartesian(clampCartesians[0]) // 结果对象中的值将以弧度表示。
      var height = Number(cartographic.height)
      if (height < (-1500)) {
        entity.position = startPosition
      } else {
        entity.position = clampCartesians[0]
      }
    } else {
      entity.position = startPosition
    }
  })
}

// 航向角计算
export function calculateHeading(entity, longitude, latitude) {
  var cartesian = new Cesium.Cartesian3(entity.position._value.x, entity.position._value.y, entity.position._value.z)
  var cartographic = Cesium.Cartographic.fromCartesian(cartesian)
  const pitch = null
  const roll = null
  const heading = courseAngle(
    Cesium.Math.toDegrees(cartographic.longitude),
    Cesium.Math.toDegrees(cartographic.latitude),
    longitude,
    latitude
  )

  const headingoRadians = Cesium.Math.toRadians(heading || 0)
  const pitchoRadians = Cesium.Math.toRadians(pitch || 0)
  const rollRadians = Cesium.Math.toRadians(roll || 0)
  const hpr = new Cesium.HeadingPitchRoll(-headingoRadians, pitchoRadians, rollRadians)
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.fromDegrees(longitude, latitude, 0), hpr)
  entity.orientation = orientation
}

// 前一坐标lnga, lata，后一坐标lngb, latb
function courseAngle(lnga, lata, lngb, latb) {
  // 以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
  var localToWorldMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    new Cesium.Cartesian3.fromDegrees(lnga, lata)
  )
  // 求世界坐标到局部坐标的变换矩阵
  var worldToLocalMatrix = Cesium.Matrix4.inverse(
    localToWorldMatrix,
    new Cesium.Matrix4()
  )
  // a点在局部坐标的位置，其实就是局部坐标原点
  var localPositionA = Cesium.Matrix4.multiplyByPoint(
    worldToLocalMatrix,
    new Cesium.Cartesian3.fromDegrees(lnga, lata),
    new Cesium.Cartesian3()
  )
  // B点在以A点为原点的局部的坐标位置
  var localPositionB = Cesium.Matrix4.multiplyByPoint(
    worldToLocalMatrix,
    new Cesium.Cartesian3.fromDegrees(lngb, latb),
    new Cesium.Cartesian3()
  )
  // 弧度
  var angle = Math.atan2(
    localPositionB.y - localPositionA.y,
    localPositionB.x - localPositionA.x
  )
  // 角度
  var theta = angle * (180 / Math.PI)
  if (theta < 0) {
    theta = theta + 360
  }
  return theta
}
