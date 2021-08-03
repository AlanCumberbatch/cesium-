将对应的例子放到 Glitch<a href="https://glitch.com/edit/#!/daisy-rocky-hip?path=index.html%3A125%3A16" target="_blank">:arrow_upper_right:</a>
去执行即可，也可放到 Cesium 项目中的 ./Apps/Hello World.html 同级目录下<br/>
<br/>

# Getting Start

- [Build a Flight Tracker](demo/BuildAFlightTracker.html)
- [Visualize a Proposed Building in a 3D City](demo/VisualizeProposedBuilding.html) --- [点击即可访问参照的网址](https://cesium.com/learn/cesiumjs-learn/cesiumjs-interactive-building/)

# Build CesiumJS apps

- [CesiumJS API](https://cesium.com/learn/cesiumjs/ref-doc/)
- Create entities
  - things about Primitive API and Entity API:

    CesiumJS has a rich API for spatial data that can be split into two categories:

    &emsp;a low-level **Primitive API** geared towards graphics developers,<br/>
    &emsp;and a high-level **Entity API** for data-driven visualization.

    The low-level Primitive API exposes the minimal amount of abstraction needed to perform the task at hand. It is structured to provide a flexible implementation for graphics developers, not for API consistency.

    The Entity API exposes a set of consistently designed high-level objects that aggregate related visualization and information into a unified data structure, which we call an Entity.

    [For detial](https://cesium.com/learn/cesiumjs-learn/cesiumjs-creating-entities/)

    <font color=orange>看到这里，我觉得我更过的应该关注 Entity中是如何使用 Primitive API 的,最终落在 Primitive API 开发上</font>
  -