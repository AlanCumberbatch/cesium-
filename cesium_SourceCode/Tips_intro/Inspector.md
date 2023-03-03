Cesium的 Inspector 面板可以显示 Primitive 的坐标轴、边界球等信息，还可以显示网格坐标系信息等：

```js:
  // 使用方法：
  viewer.extend(Cesium.viewerCesiumInspectorMixin);

```

主要功能:
- Show Frustums
- Performance Display
- Globe Depth & Pick Depth
- **Primitive**
  - **show bounding sphere** // 显示 包围球
  - **show reference frame** // 显示模型所在坐标系的三个轴
  - show only selected  // 只显示选中的 模型