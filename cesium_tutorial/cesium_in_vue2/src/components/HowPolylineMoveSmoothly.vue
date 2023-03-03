<template>
    <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from 'cesium';
// import "cesium/Build/Cesium/Widgets/widgets.css";
// import "./css/main.css";

export default {
  name: 'smoothly',
  data() {
    return {
      point2Use: [],
      pointEntities: [],
      viewer: null,
      tailLength: 80 * 3,
      tailPrimitive: null,
      positions:[],
    }
  },

  watch: {
    point2Use: {
      // 单纯的 point 很连续
      // handler(val, oldVal) {
      //   //  val 的最后一个值是新增的值

      //   // 更新 点 数据
      //   // 利用的到的point2Use 画 point
      //   // if (this.pointEntities.length > this.tailLength) {
      //   //   this.viewer.entities.remove(this.pointEntities.shift());
      //   // }
      //   // this.pointEntities.push(this.addPoint_test(val[val.length - 1]));

      //   if (this.positions.length >= this.tailLength) {
      //     this.positions.shift()
      //   }
      //   this.positions.push(val[val.length - 1]);

      //   // // test
      //   // for (let p = 0; p < this.pointEntities.length; p++){
      //   //     this.viewer.entities.remove(this.pointEntities.shift());
      //   // }
      //   // // test

      //   // 更新 DrawCommand 相关数据 --- 创建/更新 DrawCommand
      //     // 而后 处理得到可以当作 vertex 坐标的点
      //     // 计算 st 坐标
      //   this.addTail(this.positions);
      //   // console.log("val.length", val.length, "this.positions.length", this.positions.length);
      // },
      // 创建平移后的点，观察是否能够连续显示。---- 同样可以连续显示，并且不影响性能
      handler(val, oldVal) {
        let translateLengthY = 0;
        let translateLengthX = 50;
        let translateLengthZ = 0;

        //  val 的最后一个值是新增的值
        // 利用的到的point2Use 画 point
        let curDealPos = val[val.length - 1];

        // 画点
        // if (this.pointEntities.length > this.tailLength) {
        //   // this.viewer.entities.remove(this.pointEntities.shift());
        //   this.viewer.entities.remove(this.pointEntities.shift());
        //   this.viewer.entities.remove(this.pointEntities.shift());
        // }
        // // 将得到的点进行平移 --- 点的更新 完毕
        // let curA_ = this.translatePointAlongAxis(curDealPos, {x: translateLengthX, y:translateLengthY,   z: translateLengthZ });
        // let curB_ = this.translatePointAlongAxis(curDealPos, {x: -translateLengthX, y: translateLengthY, z: translateLengthZ });
        // // this.pointEntities.push(this.addPoint_test(curDealPos));
        // this.pointEntities.push(this.addPoint_test(curA_));
        // this.pointEntities.push(this.addPoint_test(curB_));

        if (this.positions.length > this.tailLength) {
          this.positions.shift();
          this.positions.shift();
        }
        // 将得到的点进行平移 --- 点的更新 完毕
        let curA = this.translatePointAlongAxis(curDealPos, {x: translateLengthX, y:translateLengthY,   z: translateLengthZ });
        let curB = this.translatePointAlongAxis(curDealPos, {x: -translateLengthX, y: translateLengthY, z: translateLengthZ });
        this.positions.push(curA);
        this.positions.push(curB);
        // 更新 DrawCommand 相关数据 --- 更新 DrawCommand
          // 而后 处理得到可以当作 vertex 坐标的点
          // 计算 st 坐标
        // console.log("this.positions", this.positions);
        this.addTail(this.positions);
      },
      deep: true// 这里是关键，代表递归监听 items 的变化
    },
  },
  methods: {
    translatePointAlongAxis(pos,distances={x:0,y:500,z:0}) {
        //平移：
        const frompoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(pos); // Matrix4
        // const local_translation = new Cesium.Cartesian3(310, -140, 10); // 向模型中心为原点，正北为y，正东为x，地心朝上为z分别平移 310、-140、10米
        const local_translation = new Cesium.Cartesian3(distances.x, distances.y, distances.z);
        const result = Cesium.Matrix4.multiplyByPoint(frompoint_to_world_matrix, local_translation, new Cesium.Cartesian3(0,0,0)); // 转换矩阵左乘局部平移向量，结果存储在 result 中，结果是世界坐标下的平移终点向量
        const targetpoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(result);

        const world_translation = new Cesium.Cartesian3(
            targetpoint_to_world_matrix[12] - frompoint_to_world_matrix[12],
            targetpoint_to_world_matrix[13] - frompoint_to_world_matrix[13],
            targetpoint_to_world_matrix[14] - frompoint_to_world_matrix[14],
        ); // 向量相减，得到世界坐标下的平移向量

        let transitionMatrix = Cesium.Matrix4.fromTranslation(world_translation); // 构造平移矩阵并赋值

        // 最终的矩阵
        let target_pos = Cesium.Matrix4.multiplyByPoint( transitionMatrix, pos, new Cesium.Cartesian3())

        return target_pos;
    },
    // 真正的 tail 来了  by  drawCommand --- start
    addTail(cartesian3s) {

      if (cartesian3s.length < 2) { return; }

      let translateLengthY = 0;
      let translateLengthX = 50;
      let translateLengthZ = 0;

      let vertexPositions = [];

      // 将 得到的tail路径上的点 处理成 想要的顶点坐标的格式 ---
      // for (let p = 0; p < cartesian3s.length - 1; p++ ){
      //   let curA = this.translatePointAlongAxis(cartesian3s[p],   {x: translateLengthX,  y:translateLengthY,  z: translateLengthZ });
      //   let curB = this.translatePointAlongAxis(cartesian3s[p],   {x: -translateLengthX, y: translateLengthY, z: translateLengthZ });
      //   let nxtA = this.translatePointAlongAxis(cartesian3s[p+1], {x: translateLengthX,  y:translateLengthY,  z: translateLengthZ });
      //   let nxtB = this.translatePointAlongAxis(cartesian3s[p+1], {x: -translateLengthX, y: translateLengthY, z: translateLengthZ });

      //   // // test
      //   // this.pointEntities.push(this.addPoint_test(curA));
      //   // this.pointEntities.push(this.addPoint_test(curB));
      //   // // test

      //   // 1-2-3-3-4-1 ---- curA - curB - nxtB - nxtB - nxtA - curA
      //   vertexPositions.push(curA)
      //   vertexPositions.push(curB)
      //   vertexPositions.push(nxtB)
      //   vertexPositions.push(nxtB)
      //   vertexPositions.push(nxtA)
      //   vertexPositions.push(curA)

      // }
      for (let p = 0; p < cartesian3s.length - 2;  ){
        let curA = cartesian3s[p]
        let curB = cartesian3s[p+1]
        let nxtA = cartesian3s[p+2]
        let nxtB = cartesian3s[p+3]

        // 1-2-3-3-4-1 ---- curA - curB - nxtB - nxtB - nxtA - curA
        vertexPositions.push(curA)
        vertexPositions.push(curB)
        vertexPositions.push(nxtB)
        vertexPositions.push(nxtB)
        vertexPositions.push(nxtA)
        vertexPositions.push(curA)

        p += 2;
      }

      // // test
      // if (this.pointEntities.length > this.tailLength * 2) {
      //   for (let o = 0; o < this.pointEntities.length - this.tailLength; o++){
      //     this.viewer.entities.remove(this.pointEntities.shift());
      //   }
      // }
      // // test
      // // test
      // for (let o = 0; o < vertexPositions.length; o++){
      //   this.pointEntities.push(this.addPoint_test(vertexPositions[o]));
      //   // if (this.pointEntities.length > vertexPositions.length) {
      //   //   for (let p = 0; p < this.pointEntities.length - vertexPositions.length; p++){
      //   //     this.viewer.entities.remove(this.pointEntities.shift());
      //   //   }
      //   // }
      // }
      // // test

      let { arr, stArr } = this.getTailParamters(vertexPositions);
      // console.log("arr", arr, "stArr", stArr);
      // console.log("arr.length",arr.length,"stArr.length",stArr.length)
      // if (arr&&arr.length &&stArr&& stArr.length) {
        if (!this.tailPrimitive) {
          this.tailPrimitive = this.drawDynamicTriangles(arr,stArr);// 法向量目前不用
        } else {
          this.tailPrimitive.positionArray = arr;
          this.tailPrimitive.stArray = stArr;
        }
      // }
      // console.log("this.tailPrimitive.positionArray.length", this.tailPrimitive.positionArray.length,"this.tailPrimitive.stArray.length", this.tailPrimitive.stArray.length);
    },
    getTailParamters(cartesian3s) {
        //! 计算 distance 会让画面变得卡顿
        // let sumDistance = this.getSumDistanceByCartesianDistance(cartesian3s);
        // this.getSumDistanceInMeters(cartesian3s);

        // 获取 position 点集
        let arr = [];
        let len = cartesian3s.length;// 这些数据来的时候就已经被处理好了
        for (let i = 0; i < len;i++) {
            arr.push(cartesian3s[i].x);
            arr.push(cartesian3s[i].y);
            arr.push(cartesian3s[i].z);
        }

        // 获取 st 纹理坐标 --- （以时间为基准）
        let stArr = [];
        // // 1-2-3-3-1-4
        // let st_y = [0, 0, 1, 1, 0, 1];// 6 个一循环，每次loop每个数递增 1
        // let st_x =     [0, 1, 1, 1, 0, 0];
        // 1-2-3-3-4-1
        let st_y = [0, 0, 1, 1, 1, 0];// 6 个一循环，每次loop每个数递增 1
        let st_x = [0, 1, 1, 1, 0, 0];
        let stamp = len / 6;// 有多少组 四边形，就有多少组 2个点，则： 当前tail 点的数量就是 stamp + 1
        for (let j = 0; j < stamp + 1; j++){
            for (let p = 0; p < st_y.length; p++){
                stArr.push(st_x[p]);
                // stArr.push(st_y[p]);
                stArr.push(st_y[p] / stamp );
            }
            for (let p = 0; p < st_y.length; p++){
                st_y[p]++;
            }
        }

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

        // console.log("stArr.length/2", stArr.length/2,"arr.length/3", arr.length/3);
        // console.log("stArr", stArr);/

        return { arr,stArr }
    },
    drawDynamicTriangles(typedArray, stArray, normalsArray) {
        if (typedArray.length == 0 || stArray.length == 0) {
          alert("数据不对");
          return;
        }
        const modelMatrix = Cesium.Matrix4.IDENTITY;

        const vertexShaderText = `
        // precision me float;
        attribute vec3 position;
        // attribute vec3 normal;
        attribute vec2 st;
        // uniform int pointsNum
        attribute float batchId;

        varying vec3 v_positionEC;
        // varying vec3 v_normalEC;
        varying vec2 v_st;

        void main() {
            vec4 p = vec4(position,1.0);

            // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
            v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
            // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
            v_st = st;

            // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
            gl_Position = czm_projection * czm_view * czm_model * p;
            // gl_Position = czm_modelViewProjectionRelativeToEye * p;
        }`;
        const fragmentShaderText = `
        uniform vec4 u_color;
        uniform vec2 u_repeat;
        uniform sampler2D myImage;

        varying vec3 v_positionEC;
        varying vec2 v_st;

        void main(){
            czm_materialInput materialInput;
            materialInput.positionToEyeEC = v_positionEC;
            materialInput.st = v_st;

            czm_material material = czm_getDefaultMaterial(materialInput);

            material.diffuse = texture2D(myImage, fract(u_repeat * materialInput.st)).rgb * u_color.rgb;
            material.alpha = texture2D(myImage, fract(u_repeat * materialInput.st)).a * 1.0;

            gl_FragColor = vec4(material.diffuse , material.alpha);
        }`;

        let that = this;
        // 1.5 定义纹理
        var texture = undefined;

        // var imageUri = './imgs/fromShang/Dirlinetexture02.png';
        // var imageUri = './imgs/fromLW/rectangle.png';//200*200
        // var imageUri = './imgs/fromLW/diamond.png';//200*200
        var imageUri = './imgs/colors.png';//512*32
        Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
            console.log('image loaded!');
            var vtxfTexture;
            var context = that.viewer.scene.context;
            if (Cesium.defined(image.internalFormat)) {
                vtxfTexture = new Cesium.Texture({
                    context: context,
                    pixelFormat: image.internalFormat,
                    width: image.width,
                    height: image.height,
                    source: {
                        arrayBufferView: image.bufferView
                    }
                });
            } else {
                vtxfTexture = new Cesium.Texture({
                    context: context,
                    source: image
                });
            }

            texture = vtxfTexture;
        });

        /* ----- See Here ↓ ------ */
        class StaticTrianglePrimitive {
            /**
             * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
             */
            constructor(option = {}) {
                this._modelMatrix = option.modelMatrix;
                // this.createCommand = null
                this.preExecute = option.preExecute;
                this.positionArray = option.positionArray;
                // this.normalsArray = option.normalsArray;
                this.stArray = option.stArray;
                this.framebuffer = null;
                this.frameState = null;
                this.clearCommand = null;
            }

            createVertexBufferByData(frameState) {
                const positionBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float32Array(this.positionArray),
                    context: frameState.context,
                });

                // 在这里创建纹理坐标Buffer:
                const stBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float32Array(this.stArray),
                    context: frameState.context,
                });

                // 在这里创建 normal Buffer:
                // const normalBuffer = Cesium.Buffer.createVertexBuffer({
                //     usage: Cesium.BufferUsage.STATIC_DRAW,
                //     typedArray: new Float32Array(this.normalsArray),
                //     context: frameState.context,
                // });

                const vertexArray = new Cesium.VertexArray({
                    context: frameState.context,
                    attributes: [
                        {
                            index: 0, // 等于 attributeLocations['position']
                            vertexBuffer: positionBuffer,
                            componentsPerAttribute: 3,
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        },
                        {
                            index: 1,
                            vertexBuffer: stBuffer,
                            componentsPerAttribute: 2,
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        },
                        // {
                        //     index: 2,
                        //     vertexBuffer: normalBuffer,
                        //     componentsPerAttribute: 3,
                        //     componentDatatype: Cesium.ComponentDatatype.FLOAT
                        // }
                    ],
                });
                return vertexArray;
            }
            createVertexBufferByDataNext_notUse(frameState) {
                console.log("this.positionArray", this.positionArray);
                console.log("this.stArray", this.stArray);
                console.log("this.indicesArray", this.indicesArray);
                var geometry = new Cesium.Geometry({
                    attributes: {
                        position: new Cesium.GeometryAttribute({
                            // vtxf 使用double类型的position进行计算
                            // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 3,
                            values: this.positionArray
                        }),
                        // normal: new Cesium.GeometryAttribute({
                        //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        //     componentsPerAttribute: 3,
                        //     values: normals
                        // }),
                        textureCoordinates: new Cesium.GeometryAttribute({
                            componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            componentsPerAttribute: 2,
                            values: this.stArray
                        })
                    },
                    // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
                    indices: this.indicesArray,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    // boundingSphere: Cesium.BoundingSphere.fromVertices(point2Use)
                });

                const attributeLocations = {
                    position: 0,
                    // st: 1,
                    // position: 0,
                    // normal: 1,
                    textureCoordinates: 1,
                };

                var vertexArray = Cesium.VertexArray.fromGeometry({
                    context: frameState.context,
                    geometry: geometry,
                    attributeLocations: attributeLocations,
                    bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
                    // interleave : true
                });

                return vertexArray;
            }

            createCommand(frameState, matrix) {
                const attributeLocations = {
                    position: 0,
                    st: 1,
                    // normal: 2,
                    // textureCoordinates: 1,
                };
                const uniformMap = {
                    u_color() {
                        return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    },
                    u_repeat() {
                        return new Cesium.Cartesian2(1.0, 1.0);
                    },
                    myImage: function() {
                            if (Cesium.defined(texture)) {
                                return texture;
                            } else {
                                return frameState.context.defaultTexture;
                            }
                    },
                    // pointsNum() {
                    //     return this.positionArray.length;
                    // }
                };

                const vertexArray = this.createVertexBufferByData(frameState);

                const program = Cesium.ShaderProgram.fromCache({
                    context: frameState.context,
                    vertexShaderSource: vertexShaderText,
                    fragmentShaderSource: fragmentShaderText,
                    attributeLocations: attributeLocations,
                });
                const renderState = Cesium.RenderState.fromCache({
                    depthTest: {
                        enabled: true,
                    },
                    // blending : {
                    //     enabled : true,
                    //     color : {
                    //         red : 1.0,
                    //         green : 1.0,
                    //         blue : 1.0,
                    //         alpha : 1.0
                    //     },
                    //     equationRgb : Cesium.BlendEquation.ADD,
                    //     equationAlpha : Cesium.BlendEquation.SUBTRACT,
                    //     functionSourceRgb : Cesium.BlendFunction.ONE,
                    //     functionSourceAlpha : Cesium.BlendFunction.ONE,
                    //     functionDestinationRgb : Cesium.BlendFunction.ONE,
                    //     functionDestinationAlpha : Cesium.BlendFunction.ONE
                    // },
                });

                const context = frameState.context;
                const colorTextureOptions = {
                    context: context,
                    width: context.drawingBufferWidth,
                    height: context.drawingBufferHeight,
                    pixelFormat: Cesium.PixelFormat.RGBA,
                    pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
                };
                const depthTextureOptions = {
                    context: context,
                    width: context.drawingBufferWidth,
                    height: context.drawingBufferHeight,
                    pixelFormat: Cesium.PixelFormat.DEPTH_COMPONENT,
                    pixelDatatype: Cesium.PixelDatatype.UNSIGNED_INT
                };

                const colorTexture = this.createTexture(colorTextureOptions);
                const depthTexture = this.createTexture(depthTextureOptions);

                // this.framebuffer = this.createFramebuffer(context, colorTexture, depthTexture)
                // this.clearCommand = new Cesium.ClearCommand({
                //     color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
                //     depth: 1.0,
                //     framebuffer: this.framebuffer,
                //     pass: Cesium.Pass.TRANSLUCENT
                //     // pass: Cesium.Pass.OPAQUE
                // });

                return new Cesium.DrawCommand({
                    // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
                    modelMatrix: matrix,
                    vertexArray: vertexArray,
                    shaderProgram: program,
                    uniformMap: uniformMap,
                    renderState: renderState,
                    // pass: Cesium.Pass.TRANSLUCENT,
                    // framebuffer:this.framebuffer,
                    pass: Cesium.Pass.OPAQUE,
                });
            }

            /**
             * @param {FrameState} frameState
             */
            update(frameState) {
                if (this.preExecute) {
                    this.preExecute();
                }

                // if (Cesium.defined(this.clearCommand)) {
                //     frameState.commandList.push(this.clearCommand);
                // }

                const command = this.createCommand( frameState, this._modelMatrix );
                frameState.commandList.push(command);

                // this.frameState = frameState;
            }

            createTexture(options, typedArray) {
                if (Cesium.defined(typedArray)) {
                    // typed array needs to be passed as source option, this is required by Cesium.Texture
                    var source = {};
                    source.arrayBufferView = typedArray;
                    options.source = source;
                }

                var texture = new Cesium.Texture(options);
                return texture;
            }
            createFramebuffer(context, colorTexture, depthTexture) {
                var framebuffer = new Cesium.Framebuffer({
                    context: context,
                    colorTextures: [colorTexture],
                    depthTexture: depthTexture
                });
                return framebuffer;
            }

            // destroy() {
            //     // console.log("11111111111111");
            //     // // if (this.frameState) {
            //     // if (this.framebuffer) {

            //     //     console.log("this.framebuffer ", this.framebuffer);
            //     //     // this.clearCommand = new Cesium.ClearCommand({

            //     //     const clearCommand = new Cesium.ClearCommand({
            //     //         color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
            //     //         depth: 1.0,
            //     //         framebuffer: this.framebuffer,
            //     //         pass: Cesium.Pass.TRANSLUCENT
            //     //         // pass: Cesium.Pass.OPAQUE
            //     //     });
            //     //     this.frameState.commandList.push(clearCommand);

            //     //     console.log("222222222222222222");
            //     // }
            // }
        }

        this.viewer.scene.globe.depthTestAgainstTerrain = true;
        let primitive = this.viewer.scene.primitives.add(
            new StaticTrianglePrimitive({
                modelMatrix: modelMatrix,
                positionArray: typedArray,
                stArray: stArray,
                // normalsArray:normalsArray,
            })
        );
        return primitive;
    },
    // 真正的 tail 来了  --- end

    addPoint_test(position,color=Cesium.Color.YELLOW) {
      let point = this.viewer.entities.add({
          position: position,
          point: {
              pixelSize: 10,
              color: color,
          },
      });
      return point;
    }
  },
  mounted() {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo';

    let viewer = new Cesium.Viewer("cesiumContainer", {
        shouldAnimate: true, //有动画
        // animation: false, //动画控制不显示
        timeline: false, //时间线不显示
        // fullscreenButton: false, //全屏按钮不显示
        infoBox: false,
        // selectionIndicator: true,
        contextOptions: {
            requestWebgl2: true,
        },
    });
    this.viewer = viewer;

    const canvas = viewer.canvas;
    canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
    canvas.addEventListener("click", function () {
      canvas.focus();
    });
    canvas.focus();

    const scene = viewer.scene;

    // const pathPosition = new Cesium.SampledPositionProperty();
    // const entityPath = viewer.entities.add({
    //   position: pathPosition,
    //   name: "path",
    //   path: {
    //     show: true,
    //     leadTime: 0,
    //     trailTime: 60,
    //     width: 10,
    //     resolution: 1,
    //     material: new Cesium.PolylineGlowMaterialProperty({
    //       glowPower: 0.3,
    //       taperPower: 0.3,
    //       color: Cesium.Color.PALEGOLDENROD,
    //     }),
    //   },
    // });

    const camera = viewer.camera;
    const controller = scene.screenSpaceCameraController;
    let r = 0;
    const center = new Cesium.Cartesian3();

    const hpRoll = new Cesium.HeadingPitchRoll();
    const hpRange = new Cesium.HeadingPitchRange();
    let speed = 300;
    const deltaRadians = Cesium.Math.toRadians(3.0);

    let position = Cesium.Cartesian3.fromDegrees(
      -123.0744619,
      44.0503706,
      5000.0
    );
    let speedVector = new Cesium.Cartesian3();
    const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator(
      "north",
      "west"
    );

    const planePrimitive = scene.primitives.add(
      Cesium.Model.fromGltf({
        // url: "../../SampleData/models/CesiumAir/Cesium_Air.glb",
        url: "./models/CesiumAir/Cesium_Air.glb",
        modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
          position,
          hpRoll,
          Cesium.Ellipsoid.WGS84,
          fixedFrameTransform
        ),
        minimumPixelSize: 128,
      })
    );
    planePrimitive.readyPromise.then(function (model) {
      // Play and loop all animations at half-speed
      model.activeAnimations.addAll({
        multiplier: 0.5,
        loop: Cesium.ModelAnimationLoop.REPEAT,
      });

      // Zoom to model
      r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
      controller.minimumZoomDistance = r * 0.5;
      Cesium.Matrix4.multiplyByPoint(
        model.modelMatrix,
        model.boundingSphere.center,
        center
      );
      const heading = Cesium.Math.toRadians(230.0);
      const pitch = Cesium.Math.toRadians(-20.0);
      hpRange.heading = heading;
      hpRange.pitch = pitch;
      hpRange.range = r * 50.0;
      camera.lookAt(center, hpRange);
    });

    let that_ = this;
    let lastPos = null;
    let num = 0;
    viewer.scene.preUpdate.addEventListener(function (scene, time) {
      let times = Math.floor(num / 500);
      if (times) {
        // speed += 100 * times;
      }
      speedVector = Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.UNIT_X,
        speed / 10,
        speedVector
      );
      position = Cesium.Matrix4.multiplyByPoint(
        planePrimitive.modelMatrix,
        speedVector,
        position
      );

      // pathPosition.addSample(Cesium.JulianDate.now(), position);
      if (that_.point2Use.length >= that_.tailLength) { that_.point2Use.shift(); }
      that_.point2Use.push(position);

      // test
      // if (lastPos) {
      //   let dis = Cesium.Cartesian3.distance(lastPos, position);
      //   let equals = Cesium.Cartesian3.equals(lastPos, position);
      //   // console.log("dis", dis, "equals", equals);
      //   // console.log("lastPos", lastPos);
      //   // console.log("position", position);

      //   lastPos = position.clone();
      // } else {
      //   lastPos = position.clone();
      // }
      // that_.addPoint_test(position);
      num++
      // test


      Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        hpRoll,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransform,
        planePrimitive.modelMatrix
      );

      // if (fromBehind.checked) {
      //   // Zoom to model
      //   Cesium.Matrix4.multiplyByPoint(
      //     planePrimitive.modelMatrix,
      //     planePrimitive.boundingSphere.center,
      //     center
      //   );
      //   hpRange.heading = hpRoll.heading;
      //   hpRange.pitch = hpRoll.pitch;
      //   camera.lookAt(center, hpRange);
      // }
    });
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  div#cesiumContainer {
    height: 100vh;
    width: 100vw;
  }
</style>
