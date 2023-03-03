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


## 功用
  更改图层后，地球这个 Primitive 的表面会发生变化


<!-- ![imageryProviderInCesium](imageryProviderInCesium.png) -->

## IonImageryProvider 为例

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