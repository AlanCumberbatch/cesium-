// import * as Cesium from 'cesium'
import { Cartesian3 } from 'cesium'
function BezierBy4Point(p1, p2, p3, p4, len = 100) {
  let t = 0;
  let points = [];
  if (p1 instanceof Cartesian3) {
    for (let i = 0; i < len; i++){
      t = i / len;

      let x = p1.x + t * (-3 * p1.x + 3 * p2.x + t * (3 * p1.x - 6 * p2.x + 3 * p3.x + t * (-p1.x + 3 * p2.x - 3 * p3.x + p4.x)));
      let y = p1.y + t * (-3 * p1.y + 3 * p2.y + t * (3 * p1.y - 6 * p2.y + 3 * p3.y + t * (-p1.y + 3 * p2.y - 3 * p3.y + p4.y)));
      let z = p1.z + t * (-3 * p1.z + 3 * p2.z + t * (3 * p1.z - 6 * p2.z + 3 * p3.z + t * (-p1.z + 3 * p2.z - 3 * p3.z + p4.z)));

      let point = new Cartesian3.fromElements(x, y, z);

      points.push(point);
    }
  } else {
    for (let i = 0; i < len; i++){
      t = i / len;

      let x = p1[0] + t * (-3 * p1[0] + 3 * p2[0] + t * (3 * p1[0] - 6 * p2[0] + 3 * p3[0] + t * (-p1[0] + 3 * p2[0] - 3 * p3[0] + p4[0])));
      let y = p1[1] + t * (-3 * p1[1] + 3 * p2[1] + t * (3 * p1[1] - 6 * p2[1] + 3 * p3[1] + t * (-p1[1] + 3 * p2[1] - 3 * p3[1] + p4[1])));
      let z = p1[2] + t * (-3 * p1[2] + 3 * p2[2] + t * (3 * p1[2] - 6 * p2[2] + 3 * p3[2] + t * (-p1[2] + 3 * p2[2] - 3 * p3[2] + p4[2])));

      let point = [x,y,z];

      points.push(point);
    }
    points.push(p4);//在测试时，画三角形的时候需要，之后真正需需要点的时候有待验证 --- 需要，当前算法会保存 开始点，但是不会保存 结束点
  }

  return points;
}

function CurveByBezierDemo() {
  // 三个控制点的： reference link: https://www.cnblogs.com/s313139232/p/12804809.html
  // 四个控制点的： 来自C端杰哥
  // 用哪个：四个控制点做出来的图形更准一些。用4个控制点的。

  let that_ = this;
  // 贝塞尔曲线二维转三维  返回一个三维点数组
  // 参数： x1,y1,x2,y2,h 两点经纬度坐标和飞线高度
  function getBSRPoints(x1, y1, x2, y2, h) {
    let t = 0.5;
    let point1 = [y1, 0]
    let point2 = [y2*(1-t)+y1*t, h]// 这个是为了找到当前贝塞尔曲线的曲线外的参考点，从而形成想要的贝塞尔曲线
    let point3 = [y2, 0]
    let arr = getBSR(point1, point2, point3)
    let arr3d = []
    for (let i in arr) {
      let x = (x2-x1)*(arr[i][0]-y1)/(y2-y1) + x1
      arr3d.push([x, arr[i][0], arr[i][1]])
    }
    return arr3d
  }
  // 生成贝塞尔曲线 （此时是二维的，所处的平面位于 World坐标系中的 YZ平面
  function getBSR (point1, point2, point3) {
    var ps = [{ x: point1[0], y: point1[1] }, { x: point2[0], y: point2[1] }, { x: point3[0], y: point3[1] }]
    let BezierInYZ = CreateBezierPoints(ps, 100);
    return BezierInYZ
  }
  // 贝赛尔曲线算法
  // 参数：
  // anchorpoints: [{ x: 116.30, y: 39.60 }, { x: 37.50, y: 40.25 }, { x: 39.51, y: 36.25 }]
  function CreateBezierPoints(anchorpoints, pointsAmount) {
    var points = [];
    for (var i = 0; i < pointsAmount; i++) {
      var point = MultiPointBezier(anchorpoints, i / pointsAmount)
      points.push([point.x, point.y]);
    }
    return points;
  }
  function MultiPointBezier(points, t) {
    var len = points.length;
    var x = 0, y = 0;
    var erxiangshi = function (start, end) {
      var cs = 1, bcs = 1;
      while (end > 0) {
        cs *= start;
        bcs *= end;
        start--;
        end--;
      }
      return (cs / bcs);
    };
    for (var i = 0; i < len; i++) {
      var point = points[i];
      x += point.x * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
      y += point.y * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
    }
    return { x: x, y: y };
  }
  function getBSRxyz (x1,y1,x2,y2,h) {
    let arr3d = getBSRPoints(x1, y1, x2, y2, h);

    that_.addPoint_test(arr3d);
    let arrAll = []
    for (let i in arr3d) {
      arrAll.push(arr3d[i][0])
      arrAll.push(arr3d[i][1])
      arrAll.push(arr3d[i][2])
    }
    return arrAll
  }
  // (0,0) (0.6,0.2) // in  clip space
  // getBSRxyz(0, 0, 0.6, 0.2, 0.3)
  // 精度和纬度  台湾：(120.0，22.0)  北京( 116.40, 39.90 )
  // getBSRxyz(120.0, 22.0, 120.0, 39.90, 500000);//定义好的曲线

  // 找到曲线上的合适的点
  let p1 = new Cesium.Cartesian3.fromDegrees(120.0, 22.0);
  let p2 = new Cesium.Cartesian3.fromDegrees(120.0, 24.95,500000); // 这个中间的点不在 曲线上，但是确实影响了曲线的走向
  let p4 = new Cesium.Cartesian3.fromDegrees(120.0, 28.95,800000); // 这个中间的点不在 曲线上，但是确实影响了曲线的走向
  let p3 = new Cesium.Cartesian3.fromDegrees(120.0, 39.90);
  that_.addSinglePoint_test(p1,Cesium.Color.RED);
  that_.addSinglePoint_test(p2,Cesium.Color.RED);
  that_.addSinglePoint_test(p3,Cesium.Color.RED);
  that_.addSinglePoint_test(p4,Cesium.Color.RED);

  // By p = t * p1 + (1-t) * p2;// 下面这个方法不好用 -- 3个控制点的话，还是用上面的方法吧
  let Bezier3Fn = (p1, p2, p3) => {
    let t = 0;
    let len = 100;
    let points = [];
    // 需要在 clip space 里面处理好然后平移过来
    // let M1 = Cesium.Transforms.eastNorthUpToFixedFrame(p1);// 此时 p1 为准
    // let p1_n = Cesium.Cartesian3.normalize(p1, new Cesium.Cartesian3());
    // p1_n = Cesium.Matrix4.multiplyByPoint(M1,p1_n,new Cesium.Cartesian3());
    // let p2_n = Cesium.Cartesian3.normalize(p2, new Cesium.Cartesian3());
    // p2_n = Cesium.Matrix4.multiplyByPoint(M1, p2_n, new Cesium.Cartesian3());
    // let p3_n = Cesium.Cartesian3.normalize(p3, new Cesium.Cartesian3());
    // p3_n = Cesium.Matrix4.multiplyByPoint(M1, p3_n, new Cesium.Cartesian3());

    for (let i = 0; i < len; i++){
      t = i / len;

      // p1 = Cesium.Cartesian3.multiplyByScalar(p1_n,t,new Cesium.Cartesian3());
      // p2 = Cesium.Cartesian3.multiplyByScalar(p2_n, 1- t,new Cesium.Cartesian3());

      // P = (1−t)2P1 + 2(1−t)tP2 + t2P3 -- 完全依照公式--不好使
      // let x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * p2.x + t * t * p3.x;
      // let y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * p2.y + t * t * p3.y;
      // let z = (1 - t) * (1 - t) * p1.z + 2 * (1 - t) * p2.z + t * t * p3.z;
      // 根据 C 端 4个控制点的公司推写一个 -- 不好使，但是改哪里也不清楚，主要是不知道咋来的
      let x = p1.x + t * ( -2 * p1.x + 2 * p2.x + t * ( 2 * p1.x  - 4 * p2.x + 2 * p3.x )) ;
      let y = p1.y + t * ( -2 * p1.y + 2 * p2.y + t * ( 2 * p1.y  - 4 * p2.y + 2 * p3.y )) ;
      let z = p1.z + t * ( -2 * p1.z + 2 * p2.z + t * ( 2 * p1.z  - 4 * p2.z + 2 * p3.z )) ;


      // P = (1-t)P1 + tP2
      // let x = (1 - t) * p1.x + t * p3.x;
      // let y = (1 - t) * p1.y + t * p3.y;
      // let z = (1 - t) * p1.z + t * p3.z;

      let point = new Cesium.Cartesian3.fromElements(x, y, z);

      points.push(point);
    }

    that_.addPoint_test(points);
  }
  // Bezier3Fn(p1,p2,p3)

  // 尝试 4个控制点的 贝塞尔曲线，from C端 --- OK
  let Bezier4Fn = (p1, p2, p3, p4, len = 100) => {
    let t = 0;
    let points = [];

    for (let i = 0; i < len; i++){
      t = i / len;

      let x = p1.x + t * (-3 * p1.x + 3 * p2.x + t * (3 * p1.x - 6 * p2.x + 3 * p3.x + t * (-p1.x + 3 * p2.x - 3 * p3.x + p4.x)));
      let y = p1.y + t * (-3 * p1.y + 3 * p2.y + t * (3 * p1.y - 6 * p2.y + 3 * p3.y + t * (-p1.y + 3 * p2.y - 3 * p3.y + p4.y)));
      let z = p1.z + t * (-3 * p1.z + 3 * p2.z + t * (3 * p1.z - 6 * p2.z + 3 * p3.z + t * (-p1.z + 3 * p2.z - 3 * p3.z + p4.z)));

      let point = new Cesium.Cartesian3.fromElements(x, y, z);

      points.push(point);
    }

    this.addPoint_test(points);
  }
  Bezier4Fn(p1, p2, p4,p3)

}

export default BezierBy4Point