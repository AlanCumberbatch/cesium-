# A- **Cesium.Viewer**

<!-- ## 代码追踪
事例中执行的代码是 release/build 之后的代码，真正的源码放在 项目/Source 中。
Viewer 在 Source/Widgets/Viewer/Viewer.js 处 声明 #330 <br/> -->

## 主要作用：
A：通过 Cesium.Widget 创建地球，skyBox等相关内容<br/>
B：在当前盒子中创建用于交互的组件,及操作图元的键盘和鼠标事件。 其中，组件可通过 options 参数进行添加与否的设置
详细信息可参考（此链接推荐使用Edge打开） > [Cesium教程](http://cesium.coinidea.com/guide/%E6%96%B0%E6%89%8B%E5%85%A5%E9%97%A8%E4%B8%AD%E6%96%87%E6%95%99%E7%A8%8B/Cesium%E5%85%A5%E9%97%A84%20-%20%E5%88%9B%E5%BB%BACesium%20Viewer/)


# B- Cesium 内部 图层的组织关系
ImageryLayerCollection --->
ImageryLayer --->
ImageryProvider --->
- ArcGisMapServerImageryProvider
- BingMapsImageryProvider
- GoogleEarthEnterpriseImageryProvider
- GridImageryProvider
- ImageryProvider
- MapboxImageryProvider
- MapboxStyleImageryProvider
- OpenStreetMapImageryProvider
- SingleTileImageryProvider
- TileCoordinatesImageryProvider
- TileMapServiceImageryProvider
- UrlTemplateImageryProvider
- WebMapServiceImageryProvider
- WebMapTileServiceImageryProvider
- IonImageryProvider


# 功用
  更改图层后，地球这个 Primitive 的表面会发生变化


<!-- ![imageryProviderInCesium](imageryProviderInCesium.png) -->

# IonImageryProvider 为例

//*  Cesium 1.83 中的<font color="red">**默认图层**</font> --- in ---> Source/Scene/createWorldImagery.js
```
function createWorldImagery(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var style = defaultValue(options.style, IonWorldImageryStyle.AERIAL_WITH_LABELS);//ROAD);//AERIAL);
  return new IonImageryProvider({
    assetId: style,
  });
}
```

接受一个 options 对象作为参数，
其中，assiId 必传，包括三个被选值：

| key                  |    value    |      功能      |
| :---                 |    :----:   |          ---: |
| AERIAL               |     2       | Aerial imagery - 航拍图像   |
| AERIAL_WITH_LABELS   |     3       | Aerial imagery with a road overlay - 会在 Aerial 的基础上添加 地点名称      |
| ROAD                 |     4       | Roads without additional imagery - 只显示 road      |

显示创建：
```js
//默认BING影像地图
var viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: Cesium.createWorldImagery({
        style: Cesium.IonWorldImageryStyle.AERIAL
    }),
    baseLayerPicker: false
});
```

# How many coordinations are there in Cesium

Cesium uses a variety of coordinate systems to represent 3D and 2D positions on the Earth's surface and in space. Here are some of the coordinate systems that are commonly used in Cesium:

- Geographic coordinates: This is the most common coordinate system used in Cesium, and it uses latitude, longitude, and height above the ellipsoid to represent positions on the Earth's surface.
- Cartesian coordinates: This coordinate system uses x, y, and z coordinates to represent positions in 3D space relative to a Cartesian coordinate system.
- ECEF coordinates: Earth-Centered, Earth-Fixed (ECEF) coordinates are a Cartesian coordinate system that is centered at the center of the Earth and rotates along with the Earth's rotation.
- Quaternion coordinates: Quaternions are a mathematical representation of rotations in 3D space, and they are used in Cesium to represent the orientation of 3D objects.
- Spherical coordinates: Spherical coordinates are used to represent positions in space relative to a sphere. This is commonly used in Cesium for celestial objects such as stars and planets.

Overall, Cesium supports a variety of coordinate systems to enable developers to work with different types of data and to ensure accuracy and consistency across different types of applications.

## Compare Cartesian coordinates with Geographic coordinates in Cesium

Cartesian coordinates and geographic coordinates are two different coordinate systems used to represent positions in Cesium. </br>
Here are some of the key differences between the two:
- Representation of positions: Cartesian coordinates represent positions in 3D space using x, y, and z coordinates relative to a fixed point, while geographic coordinates represent positions on the Earth's surface using latitude, longitude, and height above the ellipsoid.
- Ease of use: Cartesian coordinates are generally easier to work with mathematically since they are based on a simple 3D Cartesian coordinate system. However, working with geographic coordinates can be more intuitive for many applications since they are based on the familiar latitude and longitude system used for mapping.
- Accuracy: Geographic coordinates are more accurate for representing positions on the Earth's surface, particularly over long distances. Cartesian coordinates can suffer from numerical instability at large scales, making them less accurate for large-scale geographic applications.
- Integration with mapping and GIS data: Geographic coordinates are the standard coordinate system used in mapping and GIS applications, making it easier to integrate Cesium with other geographic data sources. Cartesian coordinates are less commonly used in these types of applications.

Overall, the choice between Cartesian and geographic coordinates in Cesium will depend on the specific needs of your application. **If you are working with 3D models or simulations that do not need to be tied to real-world geography, Cartesian coordinates may be more appropriate. If you are working with real-world geographic data or mapping applications, geographic coordinates are likely the better choice.**

##  The representation of Geographic coordinates in Cesium

Cesium uses a geographic coordinate system to represent positions on the Earth's surface. </br>
This coordinate system is based on the World Geodetic System 1984 (WGS84) ellipsoid, which is a model of the Earth's shape that takes into account the <u>equatorial bulge(赤道区鼓起)</u> and <u>the flattening at the poles(两极的扁平化)</u>.</br>
</br>
Geographic coordinates in Cesium are represented using a combination of latitude, longitude, and height above the ellipsoid. </br>
Latitude is the angular distance north or south of the equator, measured **in degrees**. </br>
Longitude is the angular distance east or west of the Prime Meridian (which passes through Greenwich, England), also measured **in degrees**. </br>
Height above the ellipsoid is the vertical distance above the surface of the WGS84 ellipsoid, measured in meters.</br>
</br>
In Cesium, geographic coordinates can be specified using the Cartographic object, which represents a position on the Earth's surface in terms of latitude, longitude, and height above the ellipsoid. The Cartographic object can be converted to other coordinate systems, such as Cartesian coordinates or ECEF coordinates, using various utility functions provided by Cesium.</br>

Cesium also supports a number of geographic data formats, such as KML, GeoJSON, and Shapefiles, which can be used to load and display geographic data in a Cesium application. Overall, the use of geographic coordinates and data is an important feature of Cesium, as it allows developers to create geospatial applications that accurately represent real-world locations and geography.</br>