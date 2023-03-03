### 关于 heading，pitch，roll

![heading_pitch_roll](../images/heading_pitch_roll.png)<br/>
注释：
 - center of mass --- 质点
 - 图示为笛卡尔坐标
 - [reference link](https://sites.cs.ucsb.edu/~lingqi/teaching/resources/GAMES101_Lecture_04.pdf)//在第9页<br/>

其中：
  - pitch 是围绕X轴旋转，也叫俯仰角<br/>
  ![pitch](../images/pitch.gif)
  - yaw 是围绕 Y 轴旋转，也叫偏航角<br/>
  ![yaw](../images/yaw.gif)
  - roll 是围绕 Z 轴旋转，也叫翻滚角<br/>
  ![roll](../images/roll.gif)

### 示例代码：[reference link](https://www.pianshen.com/article/59611147769/)
![示例代码](../images/heading_pitch_roll_demo.png)

由此我们可以看到，在Cesium中，HeadingPitchRoll确定了物体的方向。<br/>
通过以上代码，我们看到，使用Cartesian3确定了坐标，HeadingPitchRoll确定方向，这样我们就能可以在精确的镜头视角下看到该实体的空间情况。


### 相关源代码
![HeadingPitchRoll_fromDegrees](./../images/HeadingPitchRoll_FromDegress.png)<br/>
关于为什么都转换成弧度：Cesium目前支持两种坐标系WGS84和WebMercator，但是在Cesium中没有实际的对象来描述WGS84坐标，都是以弧度的方式来进行运用的也就是Cartographic类。[link](https://www.cnblogs.com/matanzhang/p/11846929.html)