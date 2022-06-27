## in Cesium
- [cesium获取坐标及高程](https://blog.csdn.net/weixin_30377461/article/details/99835448) : 都是获取的 Cartographic 实例的 height 属性。
- [cesium坐标系统](https://www.jianshu.com/p/79fd718961f4)
<br/>

Cartographic 在Cesium中的价值：<br/>
cesium官方文档的简介：A position defined by longitude, latitude, and height.<br/>
<br/>
<!-- 找到 C++ 中的 Cartographic 实现即可 ---〉 -->
主要用到如下两种方法获得Cartographic实例：<br/>
- Cesium.Cartographic.fromDegrees(lon,lat);// 需要知道经纬度
- Cesium.Cartographic.fromCartesian(cartesian);// 需要知道 Cartesian3的实例

// 电科院那头有相关的C++代码吧
// 没有的话我再进行整理