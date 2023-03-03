
import {pixel2Cartesian3} from "@/utils/util";

var vs = `
  attribute vec3 position;
  void main(){
      gl_Position = czm_modelViewProjection * vec4(position , 1. );
  }
`;
var fs = `
  uniform vec4 color;
  uniform vec4 czm_pickColor;
  void main(){
      gl_FragColor = vec4(color);
  }
`;

let scratchRotateMatrix = new Cesium.Matrix4();
let scratchScaleMatrix = new Cesium.Matrix4();

class RegularPointSymbol {
  constructor(options) {
    if (!Cesium.defined(options.position)) {
      throw new Cesium.DeveloperError('必须指定军标的所在位置！');
    }
    if (!Cesium.defined(options.data)) {
      throw new Cesium.DeveloperError('必须指定创建军标的数据对象！');
    }
    this.position = options.position;
    this._data = options.data;
    this._id = options.id;

    this.show = Cesium.defaultValue(options.show, true);
    this.outerShow = Cesium.defaultValue(options.outerShow, false);
    this.innerShow = Cesium.defaultValue(options.innerShow, false);
    this.faceShow = Cesium.defaultValue(options.faceShow, true);

    let scale = Cesium.defaultValue(options.scale, 1.0);
    this._scale = new Cesium.Cartesian3(scale, scale, 1.0);
    // this.style = options.style;
    this.minimumPixelSize = Cesium.defaultValue(options.minimumPixelSize, 40);

    this._color = Cesium.defaultValue(Cesium.Color.fromCssColorString(options.style.strokeColor), Cesium.Color.RED);
    this._innerColor = Cesium.defaultValue(Cesium.Color.fromCssColorString(options.style.serifsColor), Cesium.Color.LIME);
    this._outerColor = Cesium.defaultValue(Cesium.Color.fromCssColorString(options.style.serifsColor), Cesium.Color.LIME);
    this._faceColor = Cesium.defaultValue(Cesium.Color.fromCssColorString(options.style.fillColor), Cesium.Color.YELLOW.withAlpha(0.2));

    this._width = Cesium.defaultValue(options.style.strokeWidth, 1);
    this._innerWidth = Cesium.defaultValue(options.style.serifsWidth, 0.5);
    this._outerWidth = Cesium.defaultValue(options.style.serifsWidth, 0.5);

    this._thickness = Cesium.defaultValue(options.thickness, 10);

    this.showBoundingBox = options.showBoundingBox || false;

    this.stretchType = options.stretchType || "stretch-vertical1";

    this._parallelPointsList = [];
    this._parallelOuterPointsList = [];
    this._parallelInnerPointsList = [];
    this._facePointsList = [];

    this._initialRadius = undefined;

    this._initialScale = Cesium.defaultValue(options.initialScale, undefined);

    this._commands = []; // 主体
    this._outerCommands = []; // 外衬
    this._innerCommands = []; // 内衬
    this._faceCommands = []; // 面

    this._dirty = true;
    this._modelMatrix = new Cesium.Matrix4();
    this._verticesList = [];

    parseSymbolData(this, this._data);
  }

  get id() {
    return this._id;
  }

  get scale() {
    return this._scale.x;
  }

  set scale(value) {
    this._scale = new Cesium.Cartesian3(value, value, 1);
    window._scale = value;
  }

  get color() {
    return this._color;
  }

  set color(value) {
    this._color = value;
    this._dirty = true;
  }

  get innerColor() {
    return this._innerColor;
  }

  set innerColor(value) {
    this._innerColor = value;
    this._dirty = true;
  }

  get outerColor() {
    return this._outerColor;
  }

  set outerColor(value) {
    this._outerColor = value;
    this._dirty = true;
  }

  get faceColor() {
    return this._faceColor;
  }

  set faceColor(value) {
    this._faceColor = value;
    this._dirty = true;
  }


  get width() {
    return this._width;
  }

  set width(value) {
    this._width = value;
    parseSymbolData(this, this._data);
    this._dirty = true;
  }

  get innerWidth() {
    return this._innerWidth;
  }

  set innerWidth(value) {
    this._innerWidth = value;
    parseSymbolData(this, this._data);
    this._dirty = true;
  }

  get outerWidth() {
    return this._outerWidth;
  }

  set outerWidth(value) {
    this._outerWidth = value;
    parseSymbolData(this, this._data);
    this._dirty = true;
  }

  get thickness() {
    return this._thickness;
  }

  set thickness(value) {
    this._thickness = Number(value);
    this._dirty = true;
  }

  get modelMatrix() {
    return this._modelMatrix;
  }

  get data() {
    return this._data
  }

  set data(value) {
    this._data = value
    this._dirty = true
  }

  get boundingSphere() {
    let points = [];
    this._verticesList.forEach(element => {
      for (let i = 0; i < element.length; i += 3) {
        let p = new Cesium.Cartesian3(element[i], element[i + 1], element[i + 2]);
        points.push(p);
      }
    });
    return Cesium.BoundingSphere.fromPoints(points);
  }

  get wcBoundinngSphere() {
    let points = [];
    this._verticesList.forEach(element => {
      for (let i = 0; i < element.length; i += 3) {
        let p = new Cesium.Cartesian3(element[i], element[i + 1], element[i + 2]);
        points.push(Cesium.Matrix4.multiplyByPoint(this._modelMatrix, p, new Cesium.Cartesian3()));
      }
    });
    return Cesium.BoundingSphere.fromPoints(points);
  }

  /**
   * 创建军标的包围盒。
   * @private
   */
  _createBoundingBox() {
    let points = [];
    this._verticesList.forEach(element => {
      for (let i = 0; i < element.length; i += 3) {
        let p = new Cesium.Cartesian3(element[i], element[i + 1], element[i + 2]);
        points.push(p);
      }
    });
    let bx = Cesium.AxisAlignedBoundingBox.fromPoints(points);
    bx.minimum = zoomCartesian3(bx.minimum);
    bx.maximum = zoomCartesian3(bx.maximum);
    this._boundingBoxPrimitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: Cesium.BoxOutlineGeometry.fromAxisAlignedBoundingBox(bx),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE)
        }
      }),
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true
      }),
      modelMatrix: this._modelMatrix
    });
  }

  _createCorridor() {
    var that = this
    this._corridor = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.CorridorGeometry({
          positions: that._data,
          width: 200000.0,
          height: 300000.0,
          extrudedHeight: 200000.0,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          cornerType: Cesium.CornerType.MITERED
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            new Cesium.Color(1.0, 0.0, 0.0, 1)
          ),
        },
      }),
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true
      }),
    });
  }

  _createCommand(context, points, color, isFace = false, isSerif = false) {
    var pickId = this.pickId;
    if (!pickId) {
      pickId = context.createPickId({
        primitive: this,
        description: '军标'
      });
      this.pickId = pickId;
    }
    var czm_pickColor = pickId.color;

    var geometry = null;
    if (isFace) {
      geometry = createFillGeometry(this, points, isSerif, this._thickness);
    } else {
      geometry = createGeometry(this, points, isSerif, this._thickness);
    }

    var attributeLocations = Cesium.GeometryPipeline.createAttributeLocations(geometry);

    var va = Cesium.VertexArray.fromGeometry({
      context: context,
      geometry: geometry,
      attributeLocations: attributeLocations
    });

    var shaderProgram = Cesium.ShaderProgram.fromCache({
      context: context,
      vertexShaderSource: vs,
      fragmentShaderSource: fs,
      attributeLocations: attributeLocations
    });

    var uniformMap = {
      color() {
        return color;
      },
      czm_pickColor() {
        return czm_pickColor;
      }
    };

    var renderState = Cesium.RenderState.fromCache({
      // polygonOffset : {
      //   enabled : true,
      //   factor : 0.1,
      //   units : 0.1
      // },
      // lineWidth: 0.5,
      // cull: {
      //   enabled: true,
      //   face: Cesium.CullFace.FRONT
      // },
      depthTest: {
        enabled: true
      }
    });

    var geoPoint = geometry.attributes.position.values
    var geoPoint2 = []
    for (let i = 0; i < geoPoint.length; i += 3) {
      let p = new Cesium.Cartesian3(geoPoint[i], geoPoint[i + 1], geoPoint[i + 2]);
      geoPoint2.push(p);
    }

    let bx = Cesium.BoundingSphere.fromPoints(geoPoint2);
    bx.center = this.position;

    var drawCommand = new Cesium.DrawCommand({
      boundingVolume: bx, // 当pass 为透明时候pick时候必须有
      modelMatrix: this._modelMatrix,
      vertexArray: va,
      // primitiveType: primitiveType,
      shaderProgram: shaderProgram,
      uniformMap: uniformMap,
      renderState: renderState,
      pass: color.alpha === 1.0 ? Cesium.Pass.OPAQUE : Cesium.Pass.TRANSLUCENT,
      pickId: 'czm_pickColor'
    });
    return drawCommand
  }

  /**
   * 更新（系统调用，外部不需要调用）
   * @param {FrameState} frameState
   */
  update(frameState) {
    if (!this.show) {
      return;
    }

    // 放大矩阵
    if (this._initialScale) {
      Cesium.Matrix4.fromScale(Cesium.Cartesian3.multiplyByScalar(this._scale, this._initialScale, new Cesium.Cartesian3()), scratchScaleMatrix);
    } else {
      Cesium.Matrix4.fromScale(this._scale, scratchScaleMatrix);
    }

    let hpr = null;
    if (this.stretchType === "stretch-vertical1") {
      // 根据相机的方向相关参数调整军标姿态，使其朝向相机
      let camera = frameState.camera;

      var cartesian = Cesium.Cartesian3.clone(this.position)
      var cameraP = camera.position
      var z = Cesium.Cartesian3.subtract(cartesian, cameraP, new Cesium.Cartesian3())
      Cesium.Cartesian3.normalize(z, z);

      var y = camera.up

      var x = Cesium.Cartesian3.cross(y, z, new Cesium.Cartesian3())

      var testModel = new Cesium.Matrix4()
      testModel[0] = x.x
      testModel[1] = x.y
      testModel[2] = x.z
      testModel[3] = 0

      testModel[4] = y.x
      testModel[5] = y.y
      testModel[6] = y.z
      testModel[7] = 0

      testModel[8] = z.x
      testModel[9] = z.y
      testModel[10] = z.z
      testModel[11] = 0

      testModel[12] = this.position.x
      testModel[13] = this.position.y
      testModel[14] = this.position.z
      testModel[15] = 1

      //延X轴旋转90度，其它轴同理
      const angel = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(180))
      const rotation = Cesium.Matrix4.fromRotationTranslation(angel)
      Cesium.Matrix4.multiply(testModel, rotation, testModel)


      Cesium.Matrix4.multiply(testModel, scratchScaleMatrix, this._modelMatrix);
    } else {
      hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(-180), 0, 0);
      Cesium.Transforms.headingPitchRollToFixedFrame(
        this.position,
        hpr,
        Cesium.Ellipsoid.WGS84,
        Cesium.Transforms.eastNorthUpToFixedFrame,
        scratchRotateMatrix
      );
      Cesium.Matrix4.multiply(scratchRotateMatrix, scratchScaleMatrix, this._modelMatrix);
    }

    if (this._dirty) {
      this._createCorridor();
    } else {
      this._corridor.update(frameState);
    }

    // 包围盒显隐控制
    // if (this.showBoundingBox) {
    //   if (!this._boundingBoxPrimitive) {
    //     this._createBoundingBox();
    //   }
    //   this._boundingBoxPrimitive.modelMatrix = this._modelMatrix;
    //   this._boundingBoxPrimitive.update(frameState);
    // }

    if (!this._initialScale) {
      this._initialScale = getScale(this, frameState);
      window._initialScale = this._initialScale;
    }

    this._dirty = false;
  }

  destroy() {
    return Cesium.destroyObject(this);
  }
}


var scratchPosition = new Cesium.Cartesian3();

function getScale(that, frameState) {
  var scale = that.scale;

  if (that.minimumPixelSize !== 0.0) {
    // Compute size of bounding sphere in pixels
    var context = frameState.context;
    var maxPixelSize = Math.max(context.drawingBufferWidth, context.drawingBufferHeight);
    var m = that.modelMatrix;
    scratchPosition.x = m[12];
    scratchPosition.y = m[13];
    scratchPosition.z = m[14];
    var radius = that.boundingSphere.radius;
    if (!that._initialRadius) {
      that._initialRadius = radius;
    }
    var metersPerPixel = scaleInPixels(scratchPosition, radius, frameState);

    // metersPerPixel is always > 0.0
    var pixelsPerMeter = 1.0 / metersPerPixel;
    var diameterInPixels = Math.min(pixelsPerMeter * (2.0 * radius), maxPixelSize);

    // Maintain model's minimum pixel size
    if (diameterInPixels < that.minimumPixelSize) {
      scale = (that.minimumPixelSize * metersPerPixel) / (2.0 * that._initialRadius);
    }
  }
  return scale;
}

var scratchBoundingSphere = new Cesium.BoundingSphere();

function scaleInPixels(positionWC, radius, frameState) {
  scratchBoundingSphere.center = positionWC;
  scratchBoundingSphere.radius = radius;
  return frameState.camera.getPixelSize(scratchBoundingSphere, frameState.context.drawingBufferWidth, frameState.context.drawingBufferHeight);
}

/**
 * 求两点间距离
 * @param {*} coord1
 * @param {*} coord2
 * @returns
 */
function dist2d(coord1, coord2) {
  let dx = coord1[0] - coord2[0];
  let dy = coord1[1] - coord2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 判断两点是否相等
 * @param {点1} coord1
 * @param {点2} coord2
 */
function equals(coord1, coord2) {
  let equals = true;
  for (let i = coord1.length - 1; i >= 0; --i) {
    if (coord1[i] !== coord2[i]) {
      equals = false;
      break;
    }
  }
  return equals;
}

// 内缓冲  有个正负值   ---比值相似三角形
function offsetCoords(coords, offset) {
  if (equals(coords[coords.length - 1], coords[coords.length - 2])) {
    coords.pop();
  }

  if (equals(coords[coords.length - 1], coords[coords.length - 2])) {
    coords.pop();
  }

  var path = []; // 偏离点集合
  var N = coords.length - 1;
  var max = N;
  var mi, mi1, li, li1, ri, ri1, si, si1, Xi1, Yi1;
  var p0, p1, p2;
  var isClosed = equals(coords[0], coords[N]);
  if (!isClosed) {
    p0 = coords[0];
    p1 = coords[1];
    var distence = dist2d(p0, p1)
    p2 = [
      p0[0] + (p1[1] - p0[1]) / distence * offset, // 这里精髓
      p0[1] - (p1[0] - p0[0]) / distence * offset  // 这里精髓
    ];
    path.push(p2);
    coords.push(coords[N]);
    N++;
    max--;
  }
  // 添加中间点
  for (var i = 0; i < max; i++) {
    p0 = coords[i];
    p1 = coords[(i + 1) % N];
    p2 = coords[(i + 2) % N];
    mi = (p1[1] - p0[1]) / (p1[0] - p0[0]);
    mi1 = (p2[1] - p1[1]) / (p2[0] - p1[0]);
    // Prevent alignements
    if (Math.abs(mi - mi1) > 1e-10) {
      // 两点间距离
      li = dist2d(p1, p0);
      li1 = dist2d(p2, p1);

      ri = p0[0] + offset * (p1[1] - p0[1]) / li;
      ri1 = p1[0] + offset * (p2[1] - p1[1]) / li1;
      si = p0[1] - offset * (p1[0] - p0[0]) / li;
      si1 = p1[1] - offset * (p2[0] - p1[0]) / li1;

      Xi1 = (mi1 * ri1 - mi * ri + si - si1) / (mi1 - mi);
      Yi1 = (mi * mi1 * (ri1 - ri) + mi1 * si - mi * si1) / (mi1 - mi);
      // Correction for vertical lines 垂直直线的修正
      if (p1[0] - p0[0] === 0) {
        Xi1 = p1[0] + offset * (p1[1] - p0[1]) / Math.abs(p1[1] - p0[1]);
        Yi1 = mi1 * Xi1 - mi1 * ri1 + si1;
      }
      if (p2[0] - p1[0] === 0) {
        Xi1 = p2[0] + offset * (p2[1] - p1[1]) / Math.abs(p2[1] - p1[1]);
        Yi1 = mi * Xi1 - mi * ri + si;
      }
      path.push([Xi1, Yi1]);
    }
  }
  if (isClosed) {
    path.push(path[0]);
  } else {
    coords.pop();
    p0 = coords[coords.length - 1];
    p1 = coords[coords.length - 2];
    p2 = [
      p0[0] - (p1[1] - p0[1]) / dist2d(p0, p1) * offset,
      p0[1] + (p1[0] - p0[0]) / dist2d(p0, p1) * offset
    ];
    path.push(p2);
  }
  return path;
}

// 处理军标原始数据
function parseSymbolData(that, data) {
  return
  that._parallelPointsList = [];

  data.geometries.forEach(element => {
    var {coordinates} = element
    //   [796.6896777252952, 456.9567769611352],
    // [807.2769458427339, 459.8959912378826],
    // [804.1013497171894, 456.9676205633719],
    // [807.2769458427339, 454.1040087621174],
    // [796.6896777252952, 456.9567769611352]

    coordinates.forEach((xy) => {
      var cartesian3 = pixel2Cartesian3(xy)
      that._parallelPointsList.push(cartesian3)
    })

  });
}

function zoomCartesian3(position, scalar = 2) {
  var x, y, z;
  if (position.x < 0) {
    x = position.x - scalar;
  } else {
    x = position.x + scalar;
  }
  if (position.y < 0) {
    y = position.y - scalar;
  } else {
    y = position.y + scalar;
  }
  if (position.z < 0) {
    z = position.z - scalar;
  } else {
    z = position.z + scalar;
  }
  return new Cesium.Cartesian3(x, y, z);
}

export default RegularPointSymbol;
