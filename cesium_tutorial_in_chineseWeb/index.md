
 <!-- 07.23： 结合当前需求，及时间、任务的安排，决定按照 Cesium 官方中文教程中的案例进行学习。先学习如何应用，然后去阅读源码，并理解为如何生效。 -->
> 参考：
> [Cesium中文网教程](http://cesium.coinidea.com/guide/)

1. Cesium介绍
2. Cesium环境搭建
3. Cesium目录框架结构
4. [创建 Cesium Viewer](./Cesium_start.md)
5. [Cesium ion](http://cesium.coinidea.com/guide/%E6%96%B0%E6%89%8B%E5%85%A5%E9%97%A8%E4%B8%AD%E6%96%87%E6%95%99%E7%A8%8B/Cesium%E5%85%A5%E9%97%A85%20-%20Cesium%20ion/)
6. Adding Imagery - 添加涂层<br/>
  Cesium应用程序另一个关键元素是Imagery(图层) <br/>
  瓦片图集合根据不同的投影方式映射到虚拟的三维数字地球表面。 <br/>
  依赖于相机指向地表的方向和距离，Cesium会去请求和渲染不同层级的图层详细信息。 <br/>
  多种图层能够被添加、移除、排序和适应到Cesium中。 <br/>
  Cesium提供了一系列方法用于处理图层，比如颜色自适应，图层叠加融合。一些样例代码如下：(文档内的链接都无法访问，自己尝试写了一个很基本的) <br/>

    - [Adding basic imagery添加基本图层](Cesium_byHand/Cesium_ImageryProvider.md) <br/>
    - Adjusting imagery colors自适应图层颜色 <br/>
    - Manipulating and ordering imagery layers控制调整图层顺序 <br/>
    - Splitting imagery layers切割图层 <br/>

    Cesium提供了各种接口支持各样的图层数据源。

    **支持的图层格式**

    - wms
    - TMS
    - WMTS (with time dynamic imagery)
    - ArcGIS
    - Bing Maps
    - Google Earth
    - Mapbox
    - OpenStreetMap

    ***注意：不同的数据源需要不同的认证 - 需要确保自己能够有权限访问到这些数据源，自然地需要注册特定的认证才可以***

    **<font color=red>例子</font>**(使用Cesium ion中的Sentinel-2图层)

     - 去[Cesium ion](https://cesium.com/ion/assetdepot/3954)页面，将Sentinel-2图层加入到自己的assets中。 Sentinel-2将在你个人用户中的asset列表（My Assets）中出现，此时将在个人的app中图层数据源变得可用。
     - 代码级别：：我们创建一个IonImageryProvider，将assetId传给对应的Sentinel-2图层。然后我们将ImageryProvider添加到viewer.imageryLayers。


      ```js
      // Remove default base layer
      viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

      // Add Sentinel-2 imagery
      viewer.imageryLayers.addImageryProvider(new Cesium.IonImageryProvider({ assetId : 3954 }));
      ```

7. Adding Terrian - 添加地形<br/>
  Cesium 支持流式的、可视化的全球高程投影地形地势、水形数据，包括海洋、湖泊、河流、山峰、峡谷和其他能够被三维展示出来的且效果比二维好的地形数据。<br/>
  就像图层数据一样，Cesium引擎会从一个服务器上请求流式地形数据，仅请求哪些基于当前相机能看到的需要绘制的图层上的数据。

    Cesium官方提供了一些地形数据集的例子，以及如何配置这些参数：
      - ArcticDEM : 高投影的arctic terrain
      - PAMAP Terrain : 高投影的Pennsylvania terrain
      - Terrain display options : 一些地形数据配置和格式
      - Terrain exaggeration : 是地形间的高度差异更加的优雅艺术

    **支持的地形数据格式**

    - [Quantized-mesh](https://github.com/CesiumGS/quantized-mesh), Cesium团队自己开源的一种格式
    - Heightmap
    - Google Earth Enterprise

    为了添加地形数据，我们需要创建一个 CesiumTerrainProvider ，提供一个url和一些配置项，然后将这个 provider 赋值给 viewer.terrainProvider。

    此处，我们使用[Cesium WorldTerrian](https://cesium.com/blog/2018/03/01/introducing-cesium-world-terrain/)图层，该图层由Cesium ion提供，在“My Assets”中是默认提供的。我们可以用 **createWorldTerrain**helper 函数创建一个由Cesium ion提供服务的[Cesium WorldTerrian](https://cesium.com/blog/2018/03/01/introducing-cesium-world-terrain/)。

    ```
    // Load Cesium World Terrain
    viewer.terrainProvider = Cesium.createWorldTerrain({
        requestWaterMask : true, // required for water effects
        requestVertexNormals : true // required for terrain lighting
    });
    ```

8. Cesium入门8 - Configuring the Scene - 配置视窗 <br/>
  接下来将添加一些更多的正确的时间和空间设置到Viewer中。涉及到与**viewer.scene**进行交互，该类**控制了viewer中的所有图形元素**。Fenced code blocks should have a language specified
     1. 首先，我们配置一下我们的scene，用以下代码激活基于太阳位置的光照：
        ```
        // Enable lighting based on sun/moon positions
        viewer.scene.globe.enableLighting = true;
        ```

        按照以上配置，我们scene(场景)中的光照将会随着每天时间的变化而变化。如果你zoom out，你就会看到一部分数字地球位于黑暗之中，因为模拟真实的地球，太阳只能照射到地球的一部分。

     2. 在我们开始初始化启动view之前，我们先简略的过一下一些基础的Cesium类型： <br/>
       - Cartesian3 : 一个三维笛卡尔坐标——当它被用作相对于地球中心的位置时，使用地球固定框架（ECEF）。 <br/>
       - Cartographic : 由经度、纬度（弧度）和WGS84椭球面高度确定的位置。 <br/>
       - HeadingPitchRoll : 在东北向上的框架中关于局部轴的旋转（弧度）。航向是围绕负Z轴的旋转。俯仰是围绕负Y轴的旋转。滚动是关于正X轴的旋转。<br/>
       - Quaternion :以4D坐标表示的3D旋转。 <br/>

        这些是在场景中定位和定位Cesium objects所必需的基本类型，并且有许多有用的转换方法。请参阅每种类型的文档以了解更多信息。

    ### **Camera Control**

      相机是viewer.scene中的属性，用来控制当前可见的域。
      Camera 被设计成指定相机的位置和方向随时间的变化。
      控制 Camera 的几种方式：
        - 控制 camera 的位置和方向
        - 通过使用Cesium提供的API

      一些最常用的方法如下：

      - Camera.setView(options): 在特定位置和方向立即设置相机。
      - Camera.zoomIn(amount): 沿着视角矢量移动摄像机。
      - Camera.zoomOut(amount): 沿视角矢量向后移动摄像机。
      - Camera.flyTo(options): 创建从当前相机位置到新位置的动画相机飞行。
      - Camera.lookAt(target, offset) : 定位并定位摄像机以给定偏移量瞄准目标点。
      - Camera.move(direction, amount) : 朝任何方向移动摄像机。
      - Camera.rotate(axis, angle) : 绕任意轴旋转相机。

    ### **Clock Control**

      可通过配置 viewer 的 Clock 和 Timline 来控制 scene 的时间进度。

      当使用特定的时间时，Cesium使用JulandDATE类型，它存储了1月1日中午依赖的天数-4712(公元前4713年)。为了提高精度，该类将日期和秒的全部部分存储在单独的组件中。为了计算安全和代表跳跃秒，日期总是存储在国际原子时间标准中。

9. Cesium入门9 - Loading and Styling Entities - 加载和样式化实体




