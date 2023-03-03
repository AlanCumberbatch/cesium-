// [reference link](https://zhuanlan.zhihu.com/p/334540571)
let Cesium = require('./Cesium/Cesium.js');

// console.log(Cesium)//OK

let ellipsoid = Cesium.Ellipsoid.WGS84

let lng = 120.0;
let lat = 60.0;
let height = 10000.0;
// Cesium中常用的坐标变换
// 1.经纬度坐标转世界坐标
// 方法1：直接转换
var cartesian3 = Cesium.Cartesian3.fromDegrees(lng, lat, height);//cartesian3_a
// 方法2：借助ellipsoid对象，先转换成弧度再转换
var cartographic = Cesium.Cartographic.fromDegrees(lng, lat, height); //单位：度，度，米
var cartesian3_b = ellipsoid.cartographicToCartesian(cartographic);
/*
  cartesian3  : Cartesian3 { x: -1601052.2934619733, y: 2773103.917850815, z: 5509137.3879764825 }
  cartesian3_b: Cartesian3 { x: -1601052.2934619733, y: 2773103.917850815, z: 5509137.3879764825 }
  结论：计算结果一致。那么计算单位也是可以互用的。
*/
// 2.世界坐标转经纬度
// 2.1.笛卡尔空间直角坐标系---转为-->地理坐标（弧度制）
// 方法1
var cartographic_1 = Cesium.Cartographic.fromCartesian(cartesian3);
// 方法2
var cartographic_2 = ellipsoid.cartesianToCartographic(cartesian3);
/* cartographic_1: Cartographic { longitude: 2.0943951023931957, latitude: 1.0471975511965976, height: 9999.999999999543 } */
/* cartographic_2: Cartographic { longitude: 2.0943951023931957, latitude: 1.0471975511965976, height: 9999.999999999543 } */

// 2.2.地理坐标（弧度制）--转为--> 经纬度坐标
var lat_ = Cesium.Math.toDegrees(cartographic.latitude);
var lng_ = Cesium.Math.toDegrees(cartographic.longitude);
var height_ = cartographic.height;
// console.log('lat_', lat_, 'lng_', lng_,'height_',height_);//lat_ 59.99999999999999 lng_ 119.99999999999999 height_ 10000

// 3.弧度和经纬度互转
// 经纬度转弧度：
let degrees = 30;
let a = Cesium.Math.toRadians(degrees)
// 弧度转经纬度：
let radians = 30 * Math.PI / 180;
let b = Cesium.Math.toDegrees(radians);
// console.log('a', a, 'b', b, a - degrees < 0.0001);

// 4.屏幕坐标和世界坐标互转
// 4.1 二维屏幕坐标转为三维笛卡尔空间直角坐标（世界坐标）
// var cartesian3 = scene.globe.pick(viewer.camera.getPickRay(windowPostion), scene ); //注意这里屏幕坐标一定要在球上，否则生成出的cartesian对象是undefined。
// 4.2 世界坐标转屏幕坐标：
// 三维笛卡尔空间直角坐标（世界坐标）转为二维屏幕坐标
// 结果是Cartesian2对象，取出X,Y即为屏幕坐标。
// var windowPostion = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian3);

/*
另： 坐标变换工具
  !!只有转换到笛卡尔坐标系后!!  才能运用计算机图形学中的仿射变换知识进行空间位置变换如平移旋转缩放。
  Cesium为我们提供了如下几种很有用的变换工具类：
    Cesium.Cartesian3（相当于Point3D）
    Cesium.Matrix3（3x3矩阵，用于描述旋转变换）
    Cesium.Matrix4（4x4矩阵，用于描述旋转加平移变换）
    Cesium.Quaternion（四元数，用于描述围绕某个向量旋转一定角度的变换）
    Cesium.Transforms(包含将位置转换为各种参考系的功能)
*/
