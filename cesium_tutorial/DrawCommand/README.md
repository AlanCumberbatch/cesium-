## [reference link](https://mp.weixin.qq.com/s?__biz=Mzg2MzY4NTMxNw==&mid=2247485570&idx=1&sn=f29485c9f13255a64310653a2446e236&chksm=ce759728f9021e3e6ca78a85765ac9569c5248ee47440d1a0098b93beeb99315eee144015c15&cur_album_id=2064203226035355654&scene=190#rd)
## [具体内容/Content](#)
- [Cesium 高性能扩展之DrawCommand（一）：入门](./01.html)
- [Cesium 高性能扩展之DrawCommand（二）：OSGB倾斜模型展示应用](02.html) // 暂时没看
- [Cesium 高性能扩展之DrawCommand（三）：显隐和点选](03.html)
- [Cesium 高性能扩展之 DrawCommand（四）：阴影和实例化](04.html)

## [Custom DrawCommand in Cesium](CustomDrawCommand.js)

## 引出的问题
- 01
  - 几种常见的站心坐标系，ENU坐标系：Cesium.Transforms.eastNorthUpToFixedFrame( Cartesian3 ) --》 几种？ Cesium中涉及到几种？ --- 源码里有
- 02
  - 关于添加 轮廓描边 ---当前博客内有相关文档
  - 这里简单介绍基于 batchId 的显隐控制实现思路：(后期尝试多多阅读相关源码)
    - 为每一个要素创建batchId，从0开始编号；
    - 为要素几何体创建batchId顶点属性，并将batchId值逐个写入顶点属性数组；
    - 合并所有要素几何体；
    - 创建一个二维数组类型的纹理贴图，宽度等于要素数量，高度为1，用0和1表示要素隐藏或者显示，写入纹理数据；
    - 在shader中根据batchId并计算uv，从显隐纹理获取要素的显隐标记，如果小于1则discard；
    - 当某个要素显隐发生变化时，更新显隐纹理。
    - 目前我们先不要想那么复杂，等掌握了更多技能，需要设计这么复杂的自定义Primitve的时候，自然能理解并参考Cesium的代码来实现这一显隐控制方法。