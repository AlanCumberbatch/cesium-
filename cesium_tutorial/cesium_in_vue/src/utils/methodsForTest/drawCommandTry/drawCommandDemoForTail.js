import * as Cesium from 'cesium'
import addEntityPoint from '../../entity/addEntityPoint.js'
import showAxis from '../../showAxis.js'
import drawStaticTriangles from './drawStaticTriangles.js'

import { getCartesian3sForTailInDemoJS } from './getCartesian3sForTailInDemoJS.js'
import { getPointsForTailInDemoJS } from './getPointsForTailInDemoJS.js'

function drawCommandDemoForTail(viewer) {
  let cartesian3s = getCartesian3sForTailInDemoJS();
  let points = getPointsForTailInDemoJS();

  for (let i = 0; i < cartesian3s.length; i++) {
      let pos = Cesium.Cartesian3.fromElements(
          cartesian3s[i].x,
          cartesian3s[i].y,
          cartesian3s[i].z
      );
      addEntityPoint(viewer,pos);
  }
  // for (let i = 0; i < points.length; i++) {
  //     let centerPos = Cesium.Cartesian3.fromElements(
  //         points[i].x,
  //         points[i].y,
  //         points[i].z
  //     );
  //     addEntityPoint(viewer,centerPos);
  // }

  let midPoint = Cesium.Cartesian3.fromElements(points[0].x, points[0].y, points[0].z);
  let point = addEntityPoint(viewer,midPoint,Cesium.Color.RED);
  let M = point.computeModelMatrix(Cesium.JulianDate.now());
  showAxis(
      { modelMatrix: M },
      viewer.scene,
      6000000
  );

  // let sumDistance = this.getSumDistanceByCartesianDistance(cartesian3s);

  // 获取 position 点集
  let arr = [];
  let len = cartesian3s.length;// 这些数据来的时候就已经被处理好了
  for (let i = 0; i < len;i++) {
      arr.push(cartesian3s[i].x);
      arr.push(cartesian3s[i].y);
      arr.push(cartesian3s[i].z);
  }

  // 获取 st 纹理坐标
  let stArr = [];
  let stLen = len / 6 + 1;// 得到的是 所画的 平面的数量 ---》 现在当前整个轨迹上单个方向上所包含的点的数量

  // let curSumPoints = stLen;

  // let pos = 6;// 1~6 // 6就是没颜色
  let imgHeight = 200;
  let pos = 0;//
  let touPos = 100;//
  let weiPos = 100;//
  // let sub = 1 / 100;//20 个点变一个颜色
  // let sub = imgHeight / stLen;//20 个点变一个颜色
  // let sub = stLen/imgHeight;// 这个数值的意思是 每个单位 平面会切换颜色 ---》 //! 想要的是 每一组的4个点内就会存在颜色渐变，这样才会更好。
  let sub = imgHeight/stLen;// 这个数值的意思是 st 被当前的 点平均后每一份的长度 ---
  // let transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
  let transparent_pos = null;

  // let k = (stLen + 1) / imgHeight;// 把 st 中的每一个 pixel 分成几份
  for (let i = 0; i < stLen; i++) {//
      // 每个平面需要4 个点，然后组成两个三角形。 找到 当前的 4个点
      /*
          0,0
          1,0
          0,i/stLen
          1,i/stLen
      */

      // i 代表的是 draw 的某一个 平面，即2个三角形。
      // 那如何定义 st 坐标呢？---》
      //   整个 贴图 可以被分成是多少个平面，----》如何确定这个事情？ ：
      //       --- 应该是想要被分成多少个平面-- -》 由什么决定呢？ ：
      // let a = [0, (i/stLen) / imgHeight];
      // let b = [1, (i/stLen) / imgHeight];
      // let c = [1, ((i+1)/stLen) / imgHeight];// pos+1 这里不可以 +1，这样的颜色变化太明显
      // let d = [0, ((i+1)/stLen)/ imgHeight];

      let a = [0, pos / imgHeight];
      let b = [1, pos / imgHeight];
      let c = [1, (pos + sub) / imgHeight];// pos+1 这里不可以 +1，这样的颜色变化太明显
      let d = [0, (pos + sub) / imgHeight];
      console.log("pos+ sub / imgHeight", (pos + sub)/ imgHeight);


      transparent_pos = [ ...a, ...b, ...c, ...c, ...d, ...a, ];
      // transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
      // transparent_pos = [
      //     0, pos / imgHeight,
      //     1, pos / imgHeight,
      //     1, pos / imgHeight,
      //     1, pos / imgHeight,
      //     0, pos / imgHeight,
      //     0, pos / imgHeight
      // ];

      stArr.push(...transparent_pos)

      pos += sub;
  }
  // for (let i = 0; i < stLen; i++) {//
  //     /*
  //         首尾是需要透明的 ---》 那就规定多少点显示透明的texture，即首尾的点的数量。其他的都显示纯白色。
  //         注意：选择的点数需要将颜色从无过渡到纯白//是否不必那么严苛？

  //         那么：首尾各选多少点呢？---》 只需要考虑尾部就可以了，现在是 tail。---》 暂定 120 个
  //         我在想要不要动态的变化？暂时还是先不要了，那样的话数学计算还是挺多。。。。
  //     */

  //     // 每个平面需要4 个点，然后组成两个三角形。 找到 当前的 4个点
  //     /*
  //         0,0
  //         1,0
  //         0,i/stLen
  //         1,i/stLen
  //     */

  //     // i 代表的是 draw 的某一个 平面，即2个三角形。
  //     // 那如何定义 st 坐标呢？---》
  //     //   整个 贴图 可以被分成是多少个平面，----》如何确定这个事情？ ：
  //     //       --- 应该是想要被分成多少个平面-- -》 由什么决定呢？ ：
  //     let a = [0, k / imgHeight];
  //     let b = [1, k / imgHeight];
  //     let c = [1, 2k / imgHeight];// pos+1 这里不可以 +1，这样的颜色变化太明显
  //     let d = [0, 2k/ imgHeight];

  //     // if (i != 0) { pos += sub };
  //     // pos += sub;

  //     // if (i != 0) {
  //     //     // 单侧透明
  //     //     // if (pos < 100) {
  //     //     //     // pos += sub
  //     //     //     pos = i + 10;
  //     //     // } else {
  //     //     //     pos = 100;
  //     //     // }
  //     //     // 双侧透明
  //     //     if (i < stLen / 2) {
  //     //         // pos = i;
  //     //         // pos = 0;
  //     //         // pos = 100;
  //     //         pos = touPos--;

  //     //         // transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
  //     //     } else if (i - stLen / 2 < 2) {
  //     //         // pos = 100;
  //     //         pos = 0;
  //     //     } else {

  //     //         // pos = 200 - pos;
  //     //         // console.log("(200 - pos)", (200 - pos));
  //     //         // transparent_pos = [0, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 0, (200 - pos) / imgHeight, 0, (200 - pos) / imgHeight];
  //     //         // pos--;
  //     //         // pos = 0;
  //     //         // pos = 10;
  //     //         pos = weiPos--;
  //     //     }

  //     //     // if (pos > 0) {
  //     //     //     pos--;
  //     //     // }
  //     //     // console.log("pos", pos);
  //     //     transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
  //     //     console.log("pos", pos);
  //     // };
  //     // pos = 20;

  //     // transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
  //     // transparent_pos = [
  //     //     0, pos / imgHeight,
  //     //     1, pos / imgHeight,
  //     //     1, pos / imgHeight,
  //     //     1, pos / imgHeight,
  //     //     0, pos / imgHeight,
  //     //     0, pos / imgHeight
  //     // ];


  //     // let transparent_pos = [
  //     //     0, pos / 200,
  //     //     1, pos / 200,
  //     //     1, pos + sub / 200,
  //     //     1, pos + sub / 200,
  //     //     0, pos + sub / 200,
  //     //     0, pos / 200,
  //     // ];
  //     // let transparent_pos = [
  //     //     pos / 200,0,
  //     //     pos / 200,1,
  //     //     pos + sub / 200,1,
  //     //     pos + sub / 200,1,
  //     //     pos + sub / 200,0,
  //     //     pos / 200,0,
  //     // ];

  //     stArr.push(...transparent_pos)

  // }

  if (0) {// 获取 normals --- 定义法向数组
      // 获取 normals --- 定义法向数组
      var npx = [1, 0, 0];
      var nnx = [-1, 0, 0];
      var npy = [0, 1, 0];
      var nny = [0, -1, 0];
      var npz = [0, 0, 1];
      var nnz = [0, 0, -1];
      let normalsArr = [];
      let normalsArr_n = [];
      let normalsArr_p = [];
      // 使用demo
      // let normals = new Float32Array([
      //     // 下 -z
      //     ...nnz, ...nnz, ...nnz, ...nnz,
      //     // // 前 -y
      //     // ...nny, ...nny, ...nny, ...nny,
      //     // // 后 +y
      //     // ...npy, ...npy, ...npy, ...npy,
      //     // // 左 -x
      //     // ...nnx, ...nnx, ...nnx, ...nnx,
      //     // // 右 +x
      //     // ...npx, ...npx, ...npx, ...npx,
      //     // 上 +z
      //     ...npz, ...npz, ...npz, ...npz,
      // ]);
      // 获取 每个点对应的normals
      // for (let i = 0; i < oriPoints + 1 ;i++) {
      //     /*
      //         计算出当前点的 法向量？？？
      //     */

      //     normalsArr_p.push(...npz);// 上 +z
      //     normalsArr_n.push(...nnz);// 下 -z
      // }

      // normalsArr = [
      //     ...normalsArr_n,
      //     ...normalsArr_p
      // ];
  }

  // this.imageUri = '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
  // this.imageUri = './models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
  // this.imageUri = './imgs/fromShang/Dirlinetexture07.png';//128*128
  // this.imageUri = './imgs/fromShang/Dirlinetexture05.png';//128*128
  // this.imageUri = './imgs/fromShang/Dirlinetexture04.png';//128*128
  // this.imageUri = './imgs/fromShang/Dirlinetexture03.png';//128*128
  // this.imageUri = './imgs/fromShang/Dirlinetexture02.png';//128*128
  // this.imageUri = './imgs/fromShang/Dirlinetexture01.png';//128*128
  // this.imageUri = './imgs/fromShang/Dirlinetexture00.png';//128*128
  // this.imageUri = './imgs/fromShang/esrth.svg.png';
  // this.imageUri = './imgs/colors.png';//512*32
  // this.imageUri = './imgs/blue.png';//412*65
  // this.imageUri = './imgs/blackAndWhite.png';//70*18
  // this.imageUri = './imgs/fromLW/rectangle.png';//50*200
  let imageUri = './imgs/fromLW/diamond.png';//50*200

  // function drawStaticTriangles(viewer, typedArray, stArray, normalsArray, imageUri)
  let primitive = drawStaticTriangles(viewer,arr, stArr,null,imageUri);// 法向量目前不用

}
export default drawCommandDemoForTail