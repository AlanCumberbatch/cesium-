/**
 *
 * demo:
 * let primitive = viewer.scene.primitive.add(
 *    new CustomDrawCommand(viewer,{
 *      modelMatrix:modelMatrix,      //must
 *      positionArray:positionArray   //must
 *      vs:vs,                        //must
 *      fs:fs,                        //must
 *      indexArray:indexArray,
 *      normalArray:normalArray,
 *      stArray:stArray,
 *      image:image,
 *      preExecute:preExecute,
 *    })
 * )
 * */
let rectLength = 100000.0;
let curPosition = new Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * rectLength); // center of rectangle
let curModelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(curPosition);

// create a rect in clip space
// in XY Plane
let v0 = [ 0.5,  0.5, 0];
let v1 = [ 0.5, -0.5, 0];
let v2 = [-0.5, -0.5, 0];
let v3 = [-0.5, 0.5,  0];
var rawVertex = [
  // 下
  ...v0, ...v1, ...v2, ...v3,
  // 上
  ...v3, ...v2, ...v1, ...v0,
];
var rectVertex = rawVertex.map(v => v * rectLength);
var positions = new Float32Array(rectVertex);//这是 构成当前 rectangle/平面 的点

// 定义法向量 - n -- negative  p -- positive
var npx = [1, 0, 0];
var nnx = [-1, 0, 0];
var npy = [0, 1, 0];
var nny = [0, -1, 0];
var npz = [0, 0, 1];
var nnz = [0, 0, -1];
var rawNormals = [
  // towards -z
  ...nnz, ...nnz, ...nnz, ...nnz,
  // towards +z
  ...npz, ...npz, ...npz, ...npz,
]
var normals = new Float32Array(rawNormals);

// 定义纹理数组
var rawSts = [
  0,0, 1,0, 1,1, 0,1,
  0,0, 1,0, 1,1, 0,1,
]
var sts = new Float32Array(rawSts);

// 定义索引数组
var rawIndices = [
  0, 1, 2,  0, 2, 3,  4, 5, 6,  4, 6, 7
];// 3个一组，因为要画的是 Triangle
var indices = new Uint16Array(rawIndices);

// 用于当作纹理的image，图片的大小最是正方形，且边长是2的倍数。如果不是，在使用时利用纹理坐标裁剪也行，或者不管也行。
// let imagePath = '一个图片'


function CustomCesiumPrimitive(options = {}) {
  let viewer = options.viewer;//如果想在函数内部直接将生成的primitive添加到scene中，就传入。

  let modelMatrix = options.modelMatrix;//must
  let positions = options.positions;//must, saves vertices.
  let normals = options.normals;//optional, saves normals of per vertex. -- 如果不传入，注释掉相关代码（ normal ）

  let sts = options.sts;//optional, saves coordinates of texture. -- 如果不传入，注释掉相关代码（ sts ）
  let imagePath = options.image;//must, 如果不传入，注释掉相关代码（appearance） -- 对应的值是 image 的路径


  let primitive = new CesiumRenderPass.primitive({
    geometryInstance: new CesiumRenderPass.GeometryInstance({
      geometry: new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            componentDataType: Cesium.ComponentDataType.DOUBLE,
            componentsPerAttribute: 3,
            values: positions,
          }),
          normal: new Cesium.GeometryAttribute({
            componentDataType: Cesium.ComponentDataType.FLOAT,
            componentsPerAttribute: 3,
            values: normals,
          }),
          st: new Cesium.GeometryAttribute({
            componentDataType: Cesium.ComponentDataType.FLOAT,
            componentsPerAttribute: 2,
            values: sts,
          }),
        },
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
      }),
      // attributes: {
      //   color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0,1.0,0.0,1.0))
      // },//??? 为什么 ？？？ 是否好使，暂时不确定。。。
    }),
    appearance: new Cesium.MaterialAppearance({
      material: Cesium.Material.fromType('Image', {
        image:imagePath,
      }),
      // faceForward:true,//当绘制的三角面片法向量不能朝向视点时，自动翻转法向量，从而避免法向量计算发黑等问题
      closed:true,//是否为封闭体，实际上执行的是：是否进行背面裁剪
    }),
    modelMatrix: modelMatrix,
    asynchronous:false,// ??? 待查看
  })

  // 关于如何自定义新的Material：

  return primitive;
}
export default CustomCesiumPrimitive;