# **Cesium.Viewer**

<!-- ## 代码追踪
事例中执行的代码是 release/build 之后的代码，真正的源码放在 项目/Source 中。
Viewer 在 Source/Widgets/Viewer/Viewer.js 处 声明 #330 <br/> -->

## 主要作用：
A：通过 Cesium.Widget 创建地球，skyBox等相关内容<br/>
B：在当前盒子中创建用于交互的组件,及操作图元的键盘和鼠标事件。 其中，组件可通过 options 参数进行添加与否的设置
详细信息可参考（此链接推荐使用Edge打开） > [Cesium教程](http://cesium.coinidea.com/guide/%E6%96%B0%E6%89%8B%E5%85%A5%E9%97%A8%E4%B8%AD%E6%96%87%E6%95%99%E7%A8%8B/Cesium%E5%85%A5%E9%97%A84%20-%20%E5%88%9B%E5%BB%BACesium%20Viewer/)
