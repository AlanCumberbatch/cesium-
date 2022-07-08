 ### reference link
 - [Cesium 高性能扩展之DrawCommand（一）：入门](https://blog.csdn.net/esoft_weixiuyong/article/details/122338351?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-122338351-blog-106941041.pc_relevant_paycolumn_v3&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-122338351-blog-106941041.pc_relevant_paycolumn_v3)
 - 关键内容：
   - DrawCommand 是 Cesium 渲染器的核心类，常用的接口 Entity、Primitive、Cesium3DTileSet，以及地形和影像的渲染等等，底层都是一个个 DrawCommand 完成的。
   - 需要开发人员对 DrawCommand 熟练掌握后，可进行：
     - 扩展开发、
     - **视觉特效提升**、
     - **性能优化**、
     - **渲染到纹理（RTT）**，
     - 甚至基于 Cesium 封装自己的开发框架，定义独家数据格式等等
   - 入门；
     - [ ] 显隐控制；
     - [ ] 支持 pick
     - [ ] 阴影（shadows）
     - [ ] 实例化（instance）
     - [ ] 支持 Entity 的贴地属性
     - [ ] 解决抖动问题（RTC）
     - [ ] 支持BatchTable


### Demo
- [start](./start.js)