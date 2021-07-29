## Cesium 内部 图层的组织关系
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

### IonImageryProvider 为例

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
  ```
  //默认BING影像地图
  var viewer = new Cesium.Viewer('cesiumContainer', {
      imageryProvider: Cesium.createWorldImagery({
          style: Cesium.IonWorldImageryStyle.AERIAL
      }),
      baseLayerPicker: false
  });
  ```