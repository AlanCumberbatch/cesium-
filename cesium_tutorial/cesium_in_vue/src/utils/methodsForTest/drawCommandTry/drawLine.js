import * as Cesium from "cesium";

function drawLine(
  viewer,
  modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
) {
  // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);

  const vertexShaderText = `
  attribute vec3 position;

  void main() {
      gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
  }`;
  const fragmentShaderText = `
  uniform vec3 u_color;

  void main(){
      gl_FragColor = vec4(u_color, 0.3);
  }`;

  /* ----- See Here ↓ ------ */
  class StaticTrianglePrimitive {
    /**
     * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
     */
    constructor(option = {}) {
      this._modelMatrix = option.modelMatrix;
      // this.createCommand = null
      this.preExecute = option.preExecute;
    }

    createVertexBufferByData(frameState) {
      const positionBuffer = Cesium.Buffer.createVertexBuffer({
        usage: Cesium.BufferUsage.STATIC_DRAW,
        typedArray: new Float32Array([
          10000, 50000, 5000, -20000, -10000, 5000, 50000, -30000, 5000, 50000,
          -30000, 5000, 10000, 50000, 5000, 70000, 30000, 5000,
        ]),
        context: frameState.context,
      });
      const prePositionBuffer = Cesium.Buffer.createVertexBuffer({
        usage: Cesium.BufferUsage.STATIC_DRAW,
        typedArray: new Float32Array([
          100000, 500000, 50000, -200000, -100000, 50000, 500000, -300000,
          50000, 500000, -300000, 50000, 100000, 500000, 50000, 700000, 300000,
          50000,
        ]),
        context: frameState.context,
      });

      // 2 定义法向数组  n-normal  n-negative/p-positive  x/y/z
      // var npx = [1, 0, 0];
      // var nnx = [-1, 0, 0];
      // var npy = [0, 1, 0];
      // var nny = [0, -1, 0];
      // var npz = [0, 0, 1];
      // var nnz = [0, 0, -1];
      // const normalBuffer = Cesium.Buffer.createVertexBuffer({
      //     context: frameState.context,
      //     // sizeInBytes: 12,
      //     usage: Cesium.BufferUsage.STATIC_DRAW,
      //     typedArray: new Float32Array([
      //         ...npz, ...npz, ...npz,
      //         ...nnz, ...nnz, ...nnz,
      //         ...npz, ...npz, ...npz,
      //         ...nnz, ...nnz, ...nnz,
      //     ]),
      // })

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
            index: 1, // 等于 attributeLocations['position']
            vertexBuffer: prePositionBuffer,
            componentsPerAttribute: 3,
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
          },
          // {
          //     index: 1,
          //     vertexBuffer: normalBuffer,
          //     componentsPerAttribute: 3,
          //     componentDatatype: Cesium.ComponentDatatype.FLOAT
          // }
        ],
      });
      return vertexArray;
    }

    createCommand(frameState, matrix) {
      const attributeLocations = {
        position: 0,
        prePositionBuffer: 1,
      };
      const uniformMap = {
        u_color() {
          // return Cesium.Color.HONEYDEW
          return Cesium.Color.RED;
        },
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
      });
      return new Cesium.DrawCommand({
        // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
        // primitiveType: Cesium.PrimitiveType.LINES,//默认就是 PrimitiveType.TRIANGLE
        primitiveType: Cesium.PrimitiveType.LINE_LOOP,//默认就是 PrimitiveType.TRIANGLE
        modelMatrix: matrix,
        vertexArray: vertexArray,
        shaderProgram: program,
        uniformMap: uniformMap,
        renderState: renderState,
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

      const command = this.createCommand(frameState, this._modelMatrix);
      frameState.commandList.push(command);
    }
  }

  // try!
  // const viewer = new Cesium.Viewer('cesiumContainer', {
  //   contextOptions: {
  //     requestWebgl2: true
  //   }
  // })
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.primitives.add(
    new StaticTrianglePrimitive({ modelMatrix: modelMatrix })
  );
}
export default drawLine;
