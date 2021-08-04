将对应的例子body标签的内容放到 Glitch <a href="https://glitch.com/edit/#!/daisy-rocky-hip?path=index.html%3A125%3A16" target="_blank">:arrow_upper_right:</a> 去执行即可，也可放到 Cesium 项目中的 ./Apps/Hello World.html 同级目录下<br/>
Put the innerHTML of demo's body in Gitch <a href="https://glitch.com/edit/#!/daisy-rocky-hip?path=index.html%3A125%3A16" target="_blank">:arrow_upper_right:</a>  or put together with ./Apps/Hello World.html , which is in the Cesium project,and then you can execute them .
<br/>

# Getting Start

- [Build a Flight Tracker](demo/BuildAFlightTracker.html) --- [点击即可访问参照的网址 -click to visit referred website](https://cesium.com/learn/cesiumjs-learn/cesiumjs-flight-tracker/)
- [Visualize a Proposed Building in a 3D City](demo/VisualizeProposedBuilding.html) --- [点击即可访问参照的网址 -click to visit referred website](https://cesium.com/learn/cesiumjs-learn/cesiumjs-interactive-building/)

# Build CesiumJS apps

- [CesiumJS API](https://cesium.com/learn/cesiumjs/ref-doc/)
- Create entities
  - Our first entity
    - [demo](demo/entities.html)
    - things about Primitive API and Entity API:

      CesiumJS has a rich API for spatial data that can be split into two categories:

      &emsp;a low-level **Primitive API** geared towards graphics developers,<br/>
      &emsp;and a high-level **Entity API** for data-driven visualization.

      The low-level Primitive API exposes the minimal amount of abstraction needed to perform the task at hand. It is structured to provide a flexible implementation for graphics developers, not for API consistency.

      The Entity API exposes a set of consistently designed high-level objects that aggregate related visualization and information into a unified data structure, which we call an Entity.

      [For detial](https://cesium.com/learn/cesiumjs-learn/cesiumjs-creating-entities/)

      <font color=orange>反思：看到这里，我觉得我更应该关注 Entity中是如何使用 Primitive API 的,最终落在 Primitive API 开发上</font><br/>
      <font color=orange>Reflection: Then, I think I should pay more attention to ***How*** Entity works by Primitive API,and the most important key is How ***to use Primitive to develope***. </font>

  - Materials and outlines
    - [demo (need to execute in Cesium project)](demo/shapes_and_volumes.html)
    - some words about <font color=orange>How Primitive API work automatically in Entity</font> in Image intro:
      - In both the above cases, a **ColorMaterialProperty** or **ImageMaterialProperty** is created for us automatically on assignment.
    - Tips:
      - outline
        - outline relies on the outlineColor and outlineWidth properties.
        - outlineWidth only works on non-Windows systems, such as Android, iOS, Linux, and OS X. **On Windows systems, outlines will always have a width of 1.** This is due to a limitation of how WebGL is implemented on Windows.----> <font color=red>Why on my Mac also can not set a bigger value than 1??</font>
      - Polylines
        - Polylines are a special case, since they have no fill or outline properties.
        - They rely on specialized materials for anything other than color. Because of these special materials, polylines of varying widths and outline widths will **work on all systems**.
      - Heights and extrusions(型材)
        - Surface shapes including corridor, ellipse,polygon, and rectangle can be placed at altitude or extruded into a volume.
        - In both cases, the shape or volume will still conform to the curvature of the WGS84 ellipsoid. ---> <font color=lightblue>JUST CURIOUS: How this is implemented within Cesium </font>
        - new words to learn
          - <font color=orange>corridor</font> /'kɔrɪdɔr/ n. 走廊
          - <font color=orange>ellipse</font> /ɪˈlɪps/ n. 〈数〉椭圆形，椭圆
          - <font color=orange>polygon</font> /'pɑlɪɡɑn/ n. 多边形,多角形 --> adj: polygonal
          - <font color=orange>rectangle</font> /'rɛktæŋɡl/ n.〈数〉长方形, 矩形
          - <font color=orange>altitude</font> /'æltɪtud/ n. 高度, 海拔
          - <font color=orange>extrusions</font> /ɛk'strʊʒən/ n. 挤出,推出,喷出,赶出
          - <font color=orange>extruded</font> /ɛk'strʊd/ v. 使…喷出；使伸出；驱逐（extrude的过去分词）; adj. 压出的；受挤压的
          - <font color=orange>volume</font> /'vɑljum/ n. 1.卷, 册, 书卷.  **2.体积; 容积, 容量.**  3.音量, 响度
          - <font color=orange>conform</font> /kən'fɔrm/ **vi. 符合；遵照；适应环境**   vt. 使一致；使遵守；使顺从   adj. 顺从的；一致的
          - <font color=orange>curvature</font> /'kɝvətʃɚ/ n. 1.弯曲  2.弯曲部分  **3.曲率,曲度**
          - <font color=orange>ellipsoid</font> /ɪ'lɪpsɔɪd/ n. 椭圆体
  - Entity features in the Viewer
    - [demo (need to execute in Cesium project)](demo/Entity_features_in_the_Viewer.html)
    - Selection and description ---> about: The interaction when the mouse selects entity, and the infoBox
      - Clicking on an entity in the Viewer will show the SelectionIndicator widget at the entity’s location and bring up the InfoBox to provide more information.
      - And We can set a name, which determines the title of the InfoBox. We can also provide HTML as the Entity.description property.
      - All HTML shown in the InfoBox is sandboxed. This prevents external data sources from injecting malicious code into a Cesium application. To run JavaScript or browser plugins inside of a description, access the iframe used for sandboxing via the &emsp;[viewer.infoBox.frame](https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html?classFilter=view) property. See this article [:link:](https://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/)&emsp;[:pencil:](related_article/sandboxed-iframes.md)&emsp; for more information on controlling iframe sandboxing.
      - new words to learn
        - <font color=orange>sandboxed</font> [:link:](https://en.wikipedia.org/wiki/Sandbox_(computer_security))
        - <font color=orange>injecting</font> /ɪn'dʒɛkt/ vt. 注射；注入
        - <font color=orange>malicious</font> /mə'lɪʃəs/ adj. 恶意的, 恶毒的 --> adv: maliciously


