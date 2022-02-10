[reference link](https://www.cnblogs.com/aizai846/p/11846929.html) <br/>
[reference link2](https://codeantenna.com/a/xzebC2PQ88) // 这个链接里的内容更好吸收

<!-- ![content](Cesium-xyz.jpg) -->

# 依据 reference link2
一共三种坐标转换方式：
* 角度和弧度的转换
  在 Cesium 中Math对象中的函数可以用来完成角度和弧度之间的换算
  - 角度转弧度： 弧度值 = Cesium.Math.toRadians(角度值);
  - 弧度转角度： 角度值 = Cesium.Math.toDegrees(弧度值)
* 角度、弧度与 Cartesian3 的转换
  * 角度转换为 Cartesian3
  - Cesium.Cartesian3.fromDegrees
  - Cesium.Cartesian3.fromDegreesArray
  * 弧度转换为 Cartesian3
  - Cesium.Cartesian3.fromRadians
  - Cesium.Cartesian3.fromRadiansArray

![Cesium坐标转换](../images/Cesium坐标转换.png)
