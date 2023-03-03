- By default, the globe is a WGS84 ellipsoid. Specify a different terrain provider by passing the terrainProvider option to the Viewer. Let’s use Cesium World Terrain:
- Terrain and imagery are treated separately, and any imagery provider can be used with any terrain provider.

- Terrain providers
  - Most terrain providers use a REST interface over HTTP to request terrain tiles.
  - includes:
    - CesiumTerrainProvider
    - GoogleEarthEnterpriseTerrainProvider
    - VRTheWorldTerrainProvider
    - EllipsoidTerrainProvider
  - when getting imagery tiles ,sth about Crosee-origin and proxy ([the same as Imagery](Visualizing_Imagery.md))

- Resources
    - **<font color=orange>demos</font>** in Cesium official website about this capture
      - [the terrain example in Sandcastle](https://sandcastle.cesium.com/?src=Terrain.html)
    - reference
      - [all terrain providers](https://cesium.com/learn/cesiumjs/ref-doc/?classFilter=TerrainProvider)