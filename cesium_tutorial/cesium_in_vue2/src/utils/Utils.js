// 实现自定义Label，有三种方式：
//      一种使用Popup，
//      一种使用Billboard，
//      还有一种使用Graphics，像Mars3D做的一样，实现一个DivGraphics，和 BillBoardGraphic 一样使用
//      一种是将HTML直接贴上 --- DivLabel
import DivLabel from "./DivLabel";
import cesiumMeasure from "./cesium_measure";
let utils = {
  DivLabel,
  cesiumMeasure,// 这个方法需要在需要执行的页面中直接 import，然后就已经在当时的Cesium实例中创建完成了。
}
export default utils;