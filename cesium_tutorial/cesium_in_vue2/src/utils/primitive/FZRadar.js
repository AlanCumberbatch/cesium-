import * as Cesium from 'cesium'
import BezierBy4Point from "../BezierBy4Point.js";

/*
    当前这个雷达可以实现的雷达样式：
    地面站雷达 -- OK
    飞机雷达 -- ？？当前的点集对应的曲面裁剪出来的面不是规则的，飞机雷达的最前方的曲面应该是规则的圆上裁剪下来的，之后尝试新写一个方法。

    现在这个方法剩下的问题就是把outline画上。
    Cesium里的Polyline？？
    webGL中画一个三维的线？？ --- 从这里入手吧。
*/
// 目前的方法没有用到index ，尝试使用index会让渲染效率提升(具体是因为：使用index减少计算顶点的次数从而降低GPU的压力)
function FZRadar_DRAW_ARRAY(option) {
    /* option:
        {
            viewer，
            position,// Cesium.Cartesian3
        }
    */
    if (!option.position instanceof Cesium.Cartesian3) { alert("FZRadar 的 position 必须是 Cartesian3。"); return; }
    if (!option.viewer) { alert("FZRadar方法中 viewer 必须传入 "); return; }

    let viewer = option.viewer;
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(option.position);

    // let origin = [0, 0, 0];
    let pointsWanted = 40;
    let numOfPoints = pointsWanted - 1; //建议最少每个扇形 40 个点。 因为获取 bezier curve 的算法会忽略原本应该计算在内的终点，所以实际通过算法得到的点比实际需要的少一个点,然后在算法中把最后一个点push进去。
    let radius = 50000.0;

    let numbersOfDivideWanted = 60; // 选60 是因为可以被2，3整除，这样的话后期想取曲面的一部分的时候便于计算
    let numbersOfDivide = numbersOfDivideWanted - 1; // 如果不这样，每次计算当前XY平面上的圆弧上的点的数量就会比想要的多一个，从而导致在计算 indices 的时候不好计算。
    let radiusOfCircle = Math.PI * 2; //从 X轴 正向开始算，沿着Y轴正向转 --- 决定横向显示整个圆(2 PI)或者其他弧度
    // 先得到一个扇形的点，画出来
    // 然后旋转后得到 CurveSurface 的点，画出来
    let getSectorPoints = (p1, p2, p3, p4) => {
        let points = BezierBy4Point(p1, p2, p3, p4, numOfPoints); // 100 means get 100 points on this Bezier Curve
        return points;
    };
    let dealWithCirclePoints = (points) => {
        let arrangedPoints = [];
        for (let i = 1; i < pointsWanted - 1 - 1; i++) {
            arrangedPoints.push(...points[i - 1]);
            arrangedPoints.push(...points[i]);
            arrangedPoints.push(...points[pointsWanted - 1]);
        }
        // 乘上box的长度
        let boxVertex = arrangedPoints.map(function (v) {
          return v * radius * 2;
        });

        return boxVertex;
    };
    let dealWithCirclePointsWhenUseIndices = (points) => {
        let arrangedPoints = [];
        for (let i = 0; i < points.length; i++) {
            arrangedPoints.push(...points[i]);
        }

        // 乘上box的长度
        let boxVertex = arrangedPoints.map(function (v) {
          return v * radius * 2;
        });

        return boxVertex;
    };

    let getIndices = (numOfPoints) => {
        let indicesArray = [];
        for (let i = 1; i < numOfPoints - 1 ; i++) {
            indicesArray.push(i - 1);
            indicesArray.push(i);
            indicesArray.push(numOfPoints - 1);
        }
        return indicesArray;
    }
    // 因为目前也不会添加什么特殊的material，都是纯色的，最多带个透明度 -- 所以可以不用，不过这个方法还没有进行验证
    let getStArray = (numOfPoints) => {
        let indicesArray = [];
        for (let i = 1; i < numOfPoints - 1 ; i++) {
            // indicesArray.push(i - 1);
            // indicesArray.push(i);
            // indicesArray.push(numOfPoints - 1);
            // indicesArray.push(...[0.5,0.5]);
            indicesArray.push(...[(i-1)/numOfPoints,(i-1)/numOfPoints])
        }
        console.log('%c [ indicesArray ]-75', 'font-size:13px; background:pink; color:#bf2c9f;', indicesArray)
        return indicesArray;
    }

    // 关于 纹理坐标，当前模型不需要纹理
    let drawDynamicTriangles = (option) => {
        /*  option:{
            matrix:modelMatrix,
            typedArray,
            stArray,
            normalsArray,
            time,
            color:new Cesium.Color(1.0, 1.0, 1.0, 1.0);
            alpha:1.0,
            indicesArray
        }
        */

        // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
        // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
        const modelMatrix = option.matrix; // Cesium.Matrix4.IDENTITY;

        const vertexShaderText = `
            attribute vec3 position;
            attribute vec3 normal;
            // attribute vec2 st;
            attribute float batchId;

            // varying vec3 v_positionEC;
            // varying vec3 v_normalEC;
            // varying vec2 v_st;

            void main() {
                vec4 p = vec4(position,1.0);

                // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                // v_st = st;

                gl_Position = czm_projection * czm_view * czm_model * p;
                // gl_Position = czm_modelViewProjectionRelativeToEye * p;
            }
        `;

        const fragmentShaderText = `
            uniform vec4 u_color;
            uniform float u_alpha;
            // uniform float u_time;
            // uniform sampler2D image;

            // varying vec3 v_positionEC;
            // varying vec2 v_st;

            void main(){
                czm_materialInput materialInput;
                // materialInput.positionToEyeEC = v_positionEC;
                // materialInput.st = v_st;

                czm_material material = czm_getDefaultMaterial(materialInput);
                // vec2 st = materialInput.st*10.0;
                // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                // material.alpha = colorImage.a * u_alpha;
                // material.diffuse = colorImage.rgb * u_color.rgb;
                material.alpha = u_alpha;
                material.diffuse = u_color.rgb;

                gl_FragColor = vec4(material.diffuse , material.alpha);
            }
        `;

        // 1.5 定义纹理
        let u_color = option.color ? option.color : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
        let u_alpha = option.alpha ? option.alpha : 1.0;

        class DynamicSectorPrimitive {
            /**
            * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
            */
            constructor(option = {}) {
                this._modelMatrix = option.modelMatrix;
                // this.createCommand = null
                this.preExecute = option.preExecute;
                this.positionArray = option.positionArray;
                // this.normalsArray = option.normalsArray;
                // this.stArray = option.stArray;
                this.indicesArray = option.indicesArray;
            }

            createVertexBufferByData(frameState) {
                const positionBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float32Array(this.positionArray),
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

                // 在这里创建纹理坐标Buffer:
                // const stBuffer = Cesium.Buffer.createVertexBuffer({
                //     usage: Cesium.BufferUsage.STATIC_DRAW,
                //     typedArray: new Float32Array(this.stArray),
                //     context: frameState.context,
                // });

                // 在这里创建 normal Buffer:
                // const normalBuffer = Cesium.Buffer.createVertexBuffer({
                //     usage: Cesium.BufferUsage.STATIC_DRAW,
                //     typedArray: new Float32Array(this.normalsArray),
                //     context: frameState.context,
                // });

                let vaAttributes = [
                    {
                        index: 0, // 等于 attributeLocations['position']
                        vertexBuffer: positionBuffer,
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 3,
                        // normalize: attribute.normalize,
                        // offsetInBytes: offsetsInBytes[name],
                        // strideInBytes: strideInBytes,
                    },
                    // {
                    //     index: 1, // 等于 attributeLocations['position']
                    //     vertexBuffer: stBuffer,
                    //     componentsPerAttribute: 2,
                    //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    // },
                    // {
                    //     index: 2,
                    //     vertexBuffer: normalBuffer,
                    //     componentsPerAttribute: 3,
                    //     componentDatatype: Cesium.ComponentDatatype.FLOAT
                    // }
                ];

                const vertexArray = new Cesium.VertexArray({
                    context: frameState.context,
                    attributes: vaAttributes,
                });

                return vertexArray;
            }
            createVertexBufferByDataUseIndicesByVertexArray(frameState) {
                const positionBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float32Array(this.positionArray),
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

                // 在这里创建纹理坐标Buffer:
                // const stBuffer = Cesium.Buffer.createVertexBuffer({
                //     usage: Cesium.BufferUsage.STATIC_DRAW,
                //     typedArray: new Float32Array(this.stArray),
                //     context: frameState.context,
                // });

                // 在这里创建 normal Buffer:
                // const normalBuffer = Cesium.Buffer.createVertexBuffer({
                //     usage: Cesium.BufferUsage.STATIC_DRAW,
                //     typedArray: new Float32Array(this.normalsArray),
                //     context: frameState.context,
                // });

                let indexBuffer = null;
                if ( this.positionArray.length >= Cesium.Math.SIXTY_FOUR_KILOBYTES && frameState.context.elementIndexUint ) {
                    indexBuffer = Cesium.Buffer.createIndexBuffer({
                        context: frameState.context,
                        typedArray: new Uint32Array(this.indicesArray),
                        usage: Cesium.BufferUsage.STATIC_DRAW,
                        indexDatatype: Cesium.IndexDatatype.UNSIGNED_INT,
                    });
                } else {
                    indexBuffer = Cesium.Buffer.createIndexBuffer({
                        context: frameState.context,
                        typedArray: new Uint16Array(this.indicesArray),
                        usage: Cesium.BufferUsage.STATIC_DRAW,
                        indexDatatype: Cesium.IndexDatatype.UNSIGNED_SHORT,
                    });
                }
                // console.log('%c [ indexBuffer ]-299', 'font-size:13px; background:pink; color:#bf2c9f;', indexBuffer)

                let vaAttributes = [
                    {
                        index: 0, // 等于 attributeLocations['position']
                        vertexBuffer: positionBuffer,
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 3,
                        // normalize: attribute.normalize,
                        // offsetInBytes: offsetsInBytes[name],
                        // strideInBytes: strideInBytes,
                    },
                    // {
                    //     index: 1, // 等于 attributeLocations['position']
                    //     vertexBuffer: stBuffer,
                    //     componentsPerAttribute: 2,
                    //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    // },
                    // {
                    //     index: 2,
                    //     vertexBuffer: normalBuffer,
                    //     componentsPerAttribute: 3,
                    //     componentDatatype: Cesium.ComponentDatatype.FLOAT
                    // }
                ];

                const vertexArray = new Cesium.VertexArray({
                    context: frameState.context,
                    attributes: vaAttributes,
                    indexBuffer: indexBuffer,
                });

                return vertexArray;
            }

            createVertexBufferByDataUseIndices(frameState) {
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
                        // textureCoordinates: new Cesium.GeometryAttribute({
                        //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        //     componentsPerAttribute: 2,
                        //     values: this.stArray
                        // })//此种情况 st 是必须有的吗？ 如果只是纯色，没有material动画，不是必须
                    },
                    // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
                    indices: this.indicesArray,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    // boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
                });

                const attributeLocations = {
                    position: 0,
                    // st: 1,
                    // position: 0,
                    // normal: 1,
                    // textureCoordinates: 1,
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
                    // st: 1,
                    // normal: 2,
                    // textureCoordinates: 1,
                };
                const uniformMap = {
                    u_color() {
                    // return Cesium.Color.RED;
                    // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    return u_color;
                    },
                    u_alpha() {
                    return u_alpha;
                    },
                    // u_time() {
                    //     u_time += 0.001;
                    //     if (u_time > 1.0) {
                    //         u_time = 0.0;
                    //     }
                    //     return u_time;
                    // },
                    // image: function() {
                    //     if (Cesium.defined(texture)) {
                    //         return texture;
                    //     } else {
                    //         return frameState.context.defaultTexture;
                    //     }
                    // }
                };

                let vertexArray = null;
                if (this.indicesArray) {
                    // vertexArray = this.createVertexBufferByDataUseIndices(frameState);
                    vertexArray = this.createVertexBufferByDataUseIndicesByVertexArray(frameState);
                } else {
                    vertexArray = this.createVertexBufferByData(frameState);
                }

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

                return new Cesium.DrawCommand({
                    // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
                    modelMatrix: matrix,
                    vertexArray: vertexArray,
                    shaderProgram: program,
                    uniformMap: uniformMap,
                    renderState: renderState,
                    pass: Cesium.Pass.TRANSLUCENT,
                    // pass: Cesium.Pass.OPAQUE,
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

        viewer.scene.globe.depthTestAgainstTerrain = true;
        let primitive = viewer.scene.primitives.add(
            new DynamicSectorPrimitive({
                modelMatrix: modelMatrix,
                positionArray: option.typedArray,
                // stArray: option.stArray,
                indicesArray: option.indicesArray,
                // time: option.time,
                // normalsArray:normalsArray,
            })
        );

        return primitive;
    };



    // 包括 2个 geometry： 雷达模型和雷达扇页
    // 在 clip space 中完成 geometry 的确定和创建

    // 雷达扇页
    // X_positive
    let start_X_pos = [0, 0, 0];
    let end_X_pos = [0.5, 0, 0];
    // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
    let referP1_X_pos = [0.125, 0, 0.25]; //start 和 midOfStartEndOnTop 的 中点
    let referP2_X_pos = [0.375, 0, 0.25]; //end 和 midOfStartEndOnTop 的 中点
    let pointX_pos = getSectorPoints(
        start_X_pos,
        referP1_X_pos,
        referP2_X_pos,
        end_X_pos
    );
    let X_pos_vertices = dealWithCirclePointsWhenUseIndices(pointX_pos);
    let X_pos_indices = getIndices(pointX_pos.length);
    // 改成 indices 的
    // 当前这个方法后续可以用于将截面封上
    drawDynamicTriangles({
        matrix: modelMatrix,
        // typedArray: dealWithCirclePoints(pointX_pos),
        typedArray: X_pos_vertices,
        indicesArray: X_pos_indices,
        // stArray:getStArray(pointX_pos.length),
        // normalsArray,
        // time
    });
    let otherSector = () => {
        // X_negative
        let start_X_neg = [0, 0, 0];
        let end_X_neg = [-0.5, 0, 0];
        // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
        let referP1_X_neg = [-0.125, 0, 0.25]; //start 和 midOfStartEndOnTop 的 中点
        let referP2_X_neg = [-0.375, 0, 0.25]; //end 和 midOfStartEndOnTop 的 中点
        let pointX_neg = getSectorPoints(
            start_X_neg,
            referP1_X_neg,
            referP2_X_neg,
            end_X_neg
        );
        drawDynamicTriangles({
            matrix: modelMatrix,
            typedArray: dealWithCirclePoints(pointX_neg),
            // stArray,
            // normalsArray,
            // time
        });
        // Y_positive
        let start_Y_pos = [0, 0, 0];
        let end_Y_pos = [0, 0.5, 0];
        // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
        let referP1_Y_pos = [0, 0.125, 0.25]; //start 和 midOfStartEndOnTop 的 中点
        let referP2_Y_pos = [0, 0.375, 0.25]; //end 和 midOfStartEndOnTop 的 中点
        let pointY_pos = getSectorPoints(
        start_Y_pos,
        referP1_Y_pos,
        referP2_Y_pos,
        end_Y_pos
        );
        drawDynamicTriangles({
            matrix: modelMatrix,
            typedArray: dealWithCirclePoints(pointY_pos),
            // stArray,
            // normalsArray,
            // time
        });
        // Y_negative
        let start_Y_neg = [0, 0, 0];
        let end_Y_neg = [0, -0.5, 0];
        // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
        let referP1_Y_neg = [0, -0.125, 0.25]; //start 和 midOfStartEndOnTop 的 中点
        let referP2_Y_neg = [0, -0.375, 0.25]; //end 和 midOfStartEndOnTop 的 中点
        let pointY_neg = getSectorPoints(
        start_Y_neg,
        referP1_Y_neg,
        referP2_Y_neg,
        end_Y_neg
        );
        drawDynamicTriangles({
            matrix: modelMatrix,
            typedArray: dealWithCirclePoints(pointY_neg),
            // stArray,
            // normalsArray,
            // time
        });
    };


    let getCurveSurfaceVertices = () => {
        // 雷达体
        // 直接找特定的点吧 --- 也是 Bezier ？ 要得到一个精度足够的圆。----再观察之后发现，雷达体的面的每一个小的平面并不是一个曲面，所以，关键是利用现有的扇形的点，在所在XY平面得到一个对应的圆弧
        let pointsForRadarStructure = [];
        function getPointsOfRadarStructure(start, end, numOfPoints = 10) {
            let p_forCircle = [start[0], end[1], start[2]]; // 当前的 x，y，以及 此时的z，也即此时所在的z平面
            let p_1 = [
                (start[0] + p_forCircle[0]) / 2,
                (start[1] + p_forCircle[1]) / 2,
                start[2], // 因为 z 分量 没变化
            ];
            let p_2 = [
                (end[0] + p_forCircle[0]) / 2,
                (end[1] + p_forCircle[1]) / 2,
                end[2], // 因为 z 分量 没变化
            ];
            // console.log('x_pos', x_pos, 'p_1  ', p_1,'p_2  ', p_2,'y_pos', y_pos)
            let pointss = getPoints(start, p_1, p_2, end, numOfPoints); //现在的问题是画线有问题，不过可以尝试用这些点画三角形，看看是不是能画出来一个平面

            return pointss;
        }
        let getCurXYPointsInClipSpaceByBezier = (p) => {
            let x_pos = pointX_pos[p];
            let x_neg = pointX_neg[p];
            let y_pos = pointY_pos[p];
            let y_neg = pointY_neg[p];

            // 在 XY 平面进行 贝塞尔曲线的求得 : z 分量不变
            // x_pos
            // y_pos
            // let mid_xng = [
            //     (x_pos[0] + y_pos[0]) / 2,
            //     (x_pos[1] + y_pos[1]) / 2,
            //     (x_pos[2] + y_pos[2]) / 2,
            // ];
            // 此时在 clip space中，
            // 每 2 个点 以及另外一个可以构成 一个在当前XY平面内的 等腰三角形，其实是 变长为 radius / R 的正方形的一半，
            let XpYp = getPointsOfRadarStructure(x_pos, y_pos, pointsNum);

            // y_pos
            // x_neg
            // let YpXn = getPointsOfRadarStructure(y_pos, x_neg, 10);
            let YpXn = getPointsOfRadarStructure(x_neg, y_pos, pointsNum);

            // x_neg
            // y_neg
            let XnYn = getPointsOfRadarStructure(x_neg, y_neg, pointsNum);

            // y_neg
            // x_pos
            // let YnXp = getPointsOfRadarStructure(y_neg, x_pos, 10);
            let YnXp = getPointsOfRadarStructure(x_pos, y_neg, pointsNum);

            pointsForRadarStructure.push(...XpYp);
            pointsForRadarStructure.push(...YpXn);
            pointsForRadarStructure.push(...XnYn);
            pointsForRadarStructure.push(...YnXp);

            cur.push(pointsForRadarStructure); // 验证一个问题： 如果传入的4个点都在 XY 平面，是否能够生成对应点集 --- 得到的点的集合要是一段一段的才行
        };

        let getCurXYPointsInClipSpaceByCalRotateRadius = (startPos) => {
            /*  startPos ---这个点是 X 轴 正方向上的点，
            从这个点开始，以 x坐标值 为半径，沿 Y轴正方向旋转 一圈，得到一个可以构成一个圆的点。
            在得到点的过程中，可以设置：
            1. 得到半圆还是 四分之一圆。
            2. 构成当前圆的点的数量，即：当前圆被分割成多少份。（是整个圆，而不是想要显示的那部分圆，这个后期加上）
            */
            let curRadius = startPos[0];

            let pointOnCircle = [];
            for (let i = 0; i <= numbersOfDivide; i++) {
                // let curAngle = i * 360 / numbersOfDivide;
                let curAngle = (i * radiusOfCircle) / numbersOfDivide; //看来还是得用弧度

                let a = Math.cos(curAngle) * curRadius;//TODO：可优化为数组查表
                let b = Math.sin(curAngle) * curRadius;
                let c = startPos[2];

                pointOnCircle.push([a, b, c]);
            }

            return pointOnCircle;
        };

        let pointsNum = numbersOfDivide;//？？？
        let cur = [];
        for (let p = 0; p < pointX_pos.length; p++) {
            cur.push(getCurXYPointsInClipSpaceByCalRotateRadius(pointX_pos[p]));

            // 这种方式生成的圆没那么圆润，看上去不像是一个圆 -- 测试阶段发现了，就没有继续深入。
            // if (p == 0 || p == pointX_pos.length - 1) { continue; }
            // getCurXYPointsInClipSpaceByBezier(p)
        }
        // console.log("cur", cur.length);// [ [ [x,y,z] ], ... ]

        // 先画面，
        // 这些点怎么用:
        //  1. 先处理成 每一个沿 Z轴 切面的圆弧的点 -- 这样浪费内存
        //  2. 然后处理点
        let radarCurveSurfacePoints = [];
        for (let i = 1; i <= pointsNum; i++) {
            for (let p = 1; p < cur.length; p++) {
                // cur 里的每一组数据里取 相同 index, index - 1  的数据
                let a = cur[p - 1][i - 1];
                let b = cur[p - 1][i];
                let c = cur[p][i - 1];
                let d = cur[p][i];

                // a-b-c-b-c-d
                radarCurveSurfacePoints.push(...a);
                radarCurveSurfacePoints.push(...b);
                radarCurveSurfacePoints.push(...c);
                radarCurveSurfacePoints.push(...b);
                radarCurveSurfacePoints.push(...c);
                radarCurveSurfacePoints.push(...d);
            }
        }
        // 乘上box的长度
        let boxVertex = radarCurveSurfacePoints.map(function (v) {
            return v * radius * 2;
        });

        return boxVertex
    };
    let getCurveSurfaceVertices_WhenUseIndices = () => {
        // 雷达体
        // 直接找特定的点吧 --- 也是 Bezier ？ 要得到一个精度足够的圆。----再观察之后发现，雷达体的面的每一个小的平面并不是一个曲面，所以，关键是利用现有的扇形的点，在所在XY平面得到一个对应的圆弧
        let pointsForRadarStructure = [];
        function getPointsOfRadarStructure(start, end, numOfPoints = 10) {
            let p_forCircle = [start[0], end[1], start[2]]; // 当前的 x，y，以及 此时的z，也即此时所在的z平面
            let p_1 = [
                (start[0] + p_forCircle[0]) / 2,
                (start[1] + p_forCircle[1]) / 2,
                start[2], // 因为 z 分量 没变化
            ];
            let p_2 = [
                (end[0] + p_forCircle[0]) / 2,
                (end[1] + p_forCircle[1]) / 2,
                end[2], // 因为 z 分量 没变化
            ];
            // console.log('x_pos', x_pos, 'p_1  ', p_1,'p_2  ', p_2,'y_pos', y_pos)
            let pointss = getPoints(start, p_1, p_2, end, numOfPoints); //现在的问题是画线有问题，不过可以尝试用这些点画三角形，看看是不是能画出来一个平面

            return pointss;
        }
        let getCurXYPointsInClipSpaceByBezier = (p) => {
            let x_pos = pointX_pos[p];
            let x_neg = pointX_neg[p];
            let y_pos = pointY_pos[p];
            let y_neg = pointY_neg[p];

            // 在 XY 平面进行 贝塞尔曲线的求得 : z 分量不变
            // x_pos
            // y_pos
            // let mid_xng = [
            //     (x_pos[0] + y_pos[0]) / 2,
            //     (x_pos[1] + y_pos[1]) / 2,
            //     (x_pos[2] + y_pos[2]) / 2,
            // ];
            // 此时在 clip space中，
            // 每 2 个点 以及另外一个可以构成 一个在当前XY平面内的 等腰三角形，其实是 变长为 radius / R 的正方形的一半，
            let XpYp = getPointsOfRadarStructure(x_pos, y_pos, pointsNum);

            // y_pos
            // x_neg
            // let YpXn = getPointsOfRadarStructure(y_pos, x_neg, 10);
            let YpXn = getPointsOfRadarStructure(x_neg, y_pos, pointsNum);

            // x_neg
            // y_neg
            let XnYn = getPointsOfRadarStructure(x_neg, y_neg, pointsNum);

            // y_neg
            // x_pos
            // let YnXp = getPointsOfRadarStructure(y_neg, x_pos, 10);
            let YnXp = getPointsOfRadarStructure(x_pos, y_neg, pointsNum);

            pointsForRadarStructure.push(...XpYp);
            pointsForRadarStructure.push(...YpXn);
            pointsForRadarStructure.push(...XnYn);
            pointsForRadarStructure.push(...YnXp);

            cur.push(pointsForRadarStructure); // 验证一个问题： 如果传入的4个点都在 XY 平面，是否能够生成对应点集 --- 得到的点的集合要是一段一段的才行
        };

        let getCurXYPointsInClipSpaceByCalRotateRadius = (startPos) => {
            /*  startPos ---这个点是 X 轴 正方向上的点，
            从这个点开始，以 x坐标值 为半径，沿 Y轴正方向旋转 一圈，得到一个可以构成一个圆的点。
            在得到点的过程中，可以设置：
            1. 得到半圆还是 四分之一圆。
            2. 构成当前圆的点的数量，即：当前圆被分割成多少份。（是整个圆，而不是想要显示的那部分圆，这个后期加上）
            */
            let curRadius = startPos[0];

            let pointOnCircle = [];
            for (let i = 0; i <= numbersOfDivide; i++) {
                // let curAngle = i * 360 / numbersOfDivide;
                let curAngle = (i * radiusOfCircle) / numbersOfDivide; //看来还是得用弧度

                let a = Math.cos(curAngle) * curRadius;//TODO：可优化为数组查表
                let b = Math.sin(curAngle) * curRadius;
                let c = startPos[2];

                pointOnCircle.push([a, b, c]);
            }

            return pointOnCircle;
        };

        let pointsNum = numbersOfDivide;//？？？
        let cur = [];
        for (let p = 0; p < pointX_pos.length; p++) {
            cur.push(...getCurXYPointsInClipSpaceByCalRotateRadius(pointX_pos[p]));

            // 这种方式生成的圆没那么圆润，看上去不像是一个圆 -- 测试阶段发现了，就没有继续深入。
            // if (p == 0 || p == pointX_pos.length - 1) { continue; }
            // getCurXYPointsInClipSpaceByBezier(p)
        }
        console.log("cur", cur);// [  [x,y,z] , ... ]
        // console.log("cur/pointX_pos", cur.length/pointX_pos.length);// 60 --- 此时，就是想要的点的数量；符合：将圆分割成多少份，就需要多少个点

        let vertices = [];
        for (let v = 0; v < cur.length; v++){
            let d = cur[v].map(item => { return item * radius * 2 })
            // console.log('%c [ d ]-809', 'font-size:13px; background:pink; color:#bf2c9f;', d)
            vertices.push(...d);
        }
        // console.log('%c [ vertices ]-810', 'font-size:13px; background:pink; color:#bf2c9f;', vertices)//OK


        let indices = [];
        let row = pointsWanted; //X_pos_vertices.length;
        let column = numbersOfDivideWanted ;
        for (let i = 1; i < row; i++) {
            for (let p = 1; p <= column; p++) {

                // let a = sourceArray[p - 1][i - 1];
                // let b = sourceArray[p - 1][i];
                // let c = sourceArray[p][i - 1];
                // let d = sourceArray[p][i];

                let a = (i-1) * column + (p-1);
                let b =     i * column + (p-1);
                let c = (i-1) * column + p    ;
                let d =     i * column + p;

                if (i == row - 1 && p == column ) {
                    // a 2339 b 2399 c 2340 d 2400 // 此时的2400 是不存在的index，其实就是初始curve上的点
                    d = 0;//TODO: 确认一下半圆会不会有问题
                }

                // a-b-c-b-c-d
                indices.push(a);
                indices.push(b);
                indices.push(c);
                indices.push(b);
                indices.push(c);
                indices.push(d);
            }
        }

        return { vertices, indices }

    };
    let getCurveSurfaceIndices = () => { };

    let { vertices, indices } = getCurveSurfaceVertices_WhenUseIndices();
    // console.log('%c [ indices ]-851', 'font-size:13px; background:pink; color:#bf2c9f;', indices)
    drawDynamicTriangles({
        matrix: modelMatrix,
        // typedArray: getCurveSurfaceVertices(),
        typedArray: vertices,
        indicesArray: indices,
        // stArray,
        // normalsArray,
        // time
        color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
        alpha: 0.4,
    });

    // 再画线。
    let drawStaticLine = (option) => {
        /*  option:{
            matrix:
            typedArray,
            stArray,
            normalsArray,
            time
        }
        */

        const modelMatrix = option.matrix ? option.matrix : Cesium.Matrix4.IDENTITY;

        const vertexShaderText = `
            attribute vec3 position;
            // attribute vec3 normal;
            // attribute vec2 st;
            attribute float batchId;

            // varying vec3 v_positionEC;
            // varying vec3 v_normalEC;
            // varying vec2 v_st;

            void main() {
                vec4 p = vec4(position,1.0);

                // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                // v_st = st;

                // v_normal = czm_normal;// * normal;
                // v_normalEC = normal;
                // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

                // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
                gl_Position = czm_projection * czm_view * czm_model * p;
                // gl_Position = czm_modelViewProjectionRelativeToEye * p;
            }
        `;

        const fragmentShaderText = `
            uniform vec4 u_color;
            uniform float u_alpha;
            // uniform sampler2D image;

            // varying vec3 v_positionEC;
            // varying vec2 v_st;

            void main(){
                czm_materialInput materialInput;
                // materialInput.positionToEyeEC = v_positionEC;
                // materialInput.st = v_st;

                czm_material material = czm_getDefaultMaterial(materialInput);
                // vec2 st = materialInput.st;//*10.0;
                // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                // vec4 colorImage = texture2D(image, vec2(st.s, st.t));
                // material.alpha = colorImage.a * u_alpha;
                // material.diffuse = colorImage.rgb * u_color.rgb;
                material.alpha = u_alpha;
                material.diffuse = u_color.rgb;

                gl_FragColor = vec4(material.diffuse , material.alpha);
            }
        `;

        // 1.5 定义纹理
        let u_color = option.color
            ? option.color
            : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
        let u_alpha = option.alpha ? option.alpha : 1.0;

        /* ----- See Here ↓ ------ */
        class LineDCPrimitive {
            /**
            * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
            */
            constructor(option = {}) {
                this._modelMatrix = option.modelMatrix;
                // this.createCommand = null
                this.preExecute = option.preExecute;
                this.positionArray = option.positionArray;
                // this.normalsArray = option.normalsArray;
                // this.stArray = option.stArray;
            }

            createVertexBufferByData(frameState) {
                const positionBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float64Array(this.positionArray),
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

                // 在这里创建纹理坐标Buffer:
                // const stBuffer = Cesium.Buffer.createVertexBuffer({
                //     usage: Cesium.BufferUsage.STATIC_DRAW,
                //     typedArray: new Float32Array(this.stArray),
                //     context: frameState.context,
                // });

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
                        // {
                        //     index: 1, // 等于 attributeLocations['position']
                        //     vertexBuffer: stBuffer,
                        //     componentsPerAttribute: 2,
                        //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        // },
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

            createCommand(frameState, matrix) {
                const attributeLocations = {
                    position: 0,
                    // st: 1,
                    // normal: 2,
                    // textureCoordinates: 1,
                };
                const uniformMap = {
                    u_color() {
                    // return Cesium.Color.RED;
                    // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    return u_color;
                    },
                    u_alpha() {
                    return u_alpha;
                    },
                    // u_time() {
                    //     u_time += 0.001;
                    //     if (u_time > 1.0) {
                    //         u_time = 0.0;
                    //     }
                    //     return u_time;
                    // },
                    // image: function() {
                    //     if (Cesium.defined(texture)) {
                    //         return texture;
                    //     } else {
                    //         return frameState.context.defaultTexture;
                    //     }
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
                return new Cesium.DrawCommand({
                    // primitiveType: Cesium.PrimitiveType.POINTS,//默认就是 PrimitiveType.TRIANGLE
                    // primitiveType: Cesium.PrimitiveType.LINES,//默认就是 PrimitiveType.TRIANGLE
                    primitiveType: Cesium.PrimitiveType.LINE_STRIP, //默认就是 PrimitiveType.TRIANGLE
                    // primitiveType: Cesium.PrimitiveType.LINE_LOOP,//默认就是 PrimitiveType.TRIANGLE
                    modelMatrix: matrix,
                    vertexArray: vertexArray,
                    shaderProgram: program,
                    uniformMap: uniformMap,
                    renderState: renderState,
                    pass: Cesium.Pass.TRANSLUCENT, // 此时的线才能是 solid line ，
                    // pass: Cesium.Pass.OPAQUE,// 此时 line 不管PrimitiveType怎么变，画出来的都是虚线
                });
            }

            /**
            * @param {FrameState} frameState
            */
            update(frameState) {

                if (this.preExecute) { this.preExecute(); }
                const command = this.createCommand(frameState, this._modelMatrix);

                frameState.commandList.push(command);
            }
        }

        viewer.scene.globe.depthTestAgainstTerrain = true;

        let primitive = viewer.scene.primitives.add(
          new LineDCPrimitive({
            modelMatrix: modelMatrix,
            positionArray: option.typedArray,
            stArray: option.stArray,
            // time: option.time,
            // normalsArray:normalsArray,
          })
        );

        return primitive;
    };
    // for Draw line along Radius
    // for (let q = 0; q < pointsForRadarStucture.length; q++){
    //     // pointsForRadarStucture[q];// Array
    //     // 为了 能画出线，每2个点
    // }
    // 和画Curve同样的点，画出来的线就是不对。。。。
    let data = getCurveSurfaceVertices().splice(0, 10);
    console.log('%c [ data ]-1129', 'font-size:13px; background:pink; color:#bf2c9f;', data)
    drawStaticLine({
        matrix: modelMatrix,
        typedArray: data,
        // stArray,
        // normalsArray,
        // time
        color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
        alpha: 0.4,
    });

    // 测试完毕： 使用其中的 byDegrees 方式
    let testPointCanBeACircleOrNot = () => {
        // 思路是： 每2个点和圆心组成一个三角形。
        // 中间结论：通过函数内的方式可以得到对应的点，但是组成的圆不是很规整。原因在于点的计算。
        // 最终结论： 可以通过每次旋转一个角度，然后得到对应的点
        let demoFinalPos = [];
        let byBezier = () => {
            let demoPos = pointsForRadarStructure[10]; //39 , pointsForRadarStructure: <Array>Array, demoPos//27: <lon,lat,alt>Array
            for (let p = 1; p < demoPos.length; p++) {
            demoFinalPos.push(...demoPos[p - 1]);
            demoFinalPos.push(...demoPos[p]);
            // demoFinalPos.push(...demoPos[demoPos.length - 1])
            demoFinalPos.push(...[0.0, 0.0, demoPos[0][2]]);
            }
        };
        let byDegrees = () => {
            let numbersOfDivide = 20;
            let cusPosInClipSpace = pointX_pos[5]; //利用这个 点，以及 半径，每一份所对应的圆心角，计算出每个点的位置

            let pointOnCircle = getCurXYPointsInClipSpace(
            cusPosInClipSpace,
            Math.PI / 2,
            numbersOfDivide
            );
            // above 得到圆上的所有点 --- 得到这些点之后就可以利用这些点画 曲面 了
            // next： 每 2 个点链接圆心画 三角形
            let curCenter = [0.0, 0.0, cusPosInClipSpace[2]];
            for (let i = 1; i < pointOnCircle.length; i++) {
            // pointOnCircle: [ [lon,lat,alt], ... ]
            demoFinalPos.push(...pointOnCircle[i - 1]);
            demoFinalPos.push(...pointOnCircle[i]);
            demoFinalPos.push(...curCenter);
            }
        };
        byDegrees();
        // 乘上box的长度
        let boxVertex = demoFinalPos.map(function (v) {
        return v * radius * 2;
    });

    let testForDrawTriangleByPointX_pos = () => {
    let dataTest = [];
    // pointX_pos
    let index_ = 20;
    let a = pointX_pos[index_];
    let b = pointY_pos[index_];
    let c = pointX_neg[index_];
    let d = pointY_neg[index_];
    let o = [0.0, 0.0, a[2]];

    dataTest.push(
    ...[a[0] * radius * 2, a[1] * radius * 2, a[2] * radius * 2]
    );
    dataTest.push(
    ...[b[0] * radius * 2, b[1] * radius * 2, b[2] * radius * 2]
    );
    dataTest.push(
    ...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]
    );

    dataTest.push(
    ...[b[0] * radius * 2, b[1] * radius * 2, b[2] * radius * 2]
    );
    dataTest.push(
    ...[c[0] * radius * 2, c[1] * radius * 2, c[2] * radius * 2]
    );
    dataTest.push(
    ...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]
    );

    dataTest.push(
    ...[c[0] * radius * 2, c[1] * radius * 2, c[2] * radius * 2]
    );
    dataTest.push(
    ...[d[0] * radius * 2, d[1] * radius * 2, d[2] * radius * 2]
    );
    dataTest.push(
    ...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]
    );

    dataTest.push(
    ...[d[0] * radius * 2, d[1] * radius * 2, d[2] * radius * 2]
    );
    dataTest.push(
    ...[a[0] * radius * 2, a[1] * radius * 2, a[2] * radius * 2]
    );
    dataTest.push(
    ...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]
    );

    return dataTest;
    };
    // boxVertex = testForDrawTriangleByPointX_pos()

    drawDynamicTriangles({
    matrix: modelMatrix,
    typedArray: boxVertex,
    // stArray,
    // normalsArray,
    // time
    });
    };
    // testPointCanBeACircleOrNot();



    let drawDynamicSector_R = (option) => {
    /*  option:{
              matrix:modelMatrix,
              typedArray,
              stArray,
              normalsArray,
              time,
              color:new Cesium.Color(1.0, 1.0, 1.0, 1.0);
          }
      */

    // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
    // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
    const modelMatrix = option.matrix; // Cesium.Matrix4.IDENTITY;

    const vertexShaderText = `
          attribute vec3 position;
          attribute vec3 normal;
          attribute vec2 st;
          attribute float batchId;

          // varying vec3 v_positionEC;
          // varying vec3 v_normalEC;
          // varying vec2 v_st;

          void main() {
              vec4 p = vec4(position,1.0);

              // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
              // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
              // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
              // v_st = st;

              // v_normal = czm_normal;// * normal;
              // v_normalEC = normal;
              // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

              // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
              gl_Position = czm_projection * czm_view * czm_model * p;
              // gl_Position = czm_modelViewProjectionRelativeToEye * p;
          }
      `;

    const fragmentShaderText = `
          uniform vec4 u_color;
          uniform float u_alpha;
          // uniform float u_time;
          // uniform sampler2D image;

          varying vec3 v_positionEC;
          // varying vec2 v_st;

          void main(){
              czm_materialInput materialInput;
              // materialInput.positionToEyeEC = v_positionEC;
              // materialInput.st = v_st;

              czm_material material = czm_getDefaultMaterial(materialInput);
              // vec2 st = materialInput.st*10.0;
              // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
              // material.alpha = colorImage.a * u_alpha;
              // material.diffuse = colorImage.rgb * u_color.rgb;
              material.alpha = u_alpha;
              material.diffuse = u_color.rgb;

              gl_FragColor = vec4(material.diffuse , material.alpha);
          }
      `;

    let that = this;
    // 1.5 定义纹理
    var texture = undefined;
    let u_color = option.color
      ? option.color
      : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
    let u_alpha = option.alpha ? option.alpha : 1.0;

    // var imageUri = this.imageUri;
    // Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
    //     console.log('image loaded!');
    //     var vtxfTexture;
    //     var context = that.viewer.scene.context;
    //     if (Cesium.defined(image.internalFormat)) {
    //         vtxfTexture = new Cesium.Texture({
    //             context: context,
    //             pixelFormat: image.internalFormat,
    //             width: image.width,
    //             height: image.height,
    //             source: {
    //                 arrayBufferView: image.bufferView
    //             }
    //         });
    //     } else {
    //         vtxfTexture = new Cesium.Texture({
    //             context: context,
    //             source: image
    //         });
    //     }

    //     texture = vtxfTexture;
    // });

    class DynamicSectorPrimitive {
      /**
       * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
       */
      constructor(option = {}) {
        this._modelMatrix = option.modelMatrix;
        // this.createCommand = null
        this.preExecute = option.preExecute;
        this.positionArray = option.positionArray;
        // this.normalsArray = option.normalsArray;
        // this.stArray = option.stArray;
      }

      createVertexBufferByData(frameState) {
        const positionBuffer = Cesium.Buffer.createVertexBuffer({
          usage: Cesium.BufferUsage.STATIC_DRAW,
          typedArray: new Float32Array(this.positionArray),
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

        // 在这里创建纹理坐标Buffer:
        // const stBuffer = Cesium.Buffer.createVertexBuffer({
        //     usage: Cesium.BufferUsage.STATIC_DRAW,
        //     typedArray: new Float32Array(this.stArray),
        //     context: frameState.context,
        // });

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
            // {
            //     index: 1, // 等于 attributeLocations['position']
            //     vertexBuffer: stBuffer,
            //     componentsPerAttribute: 2,
            //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
            // },
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
      createVertexBufferByDataNext(frameState) {
        var geometry = new Cesium.Geometry({
          attributes: {
            position: new Cesium.GeometryAttribute({
              // vtxf 使用double类型的position进行计算
              // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
              componentDatatype: Cesium.ComponentDatatype.FLOAT,
              componentsPerAttribute: 3,
              values: this.positionArray,
            }),
            // normal: new Cesium.GeometryAttribute({
            //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
            //     componentsPerAttribute: 3,
            //     values: normals
            // }),
            // textureCoordinates: new Cesium.GeometryAttribute({
            //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
            //     componentsPerAttribute: 2,
            //     values: this.stArray
            // })
          },
          // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
          indices: this.indicesArray,
          primitiveType: Cesium.PrimitiveType.TRIANGLES,
          // boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
        });

        const attributeLocations = {
          position: 0,
          // st: 1,
          // position: 0,
          // normal: 1,
          // textureCoordinates: 1,
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
            // return Cesium.Color.RED;
            // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
            return u_color;
          },
          u_alpha() {
            return u_alpha;
          },
          // u_time() {
          //     u_time += 0.001;
          //     if (u_time > 1.0) {
          //         u_time = 0.0;
          //     }
          //     return u_time;
          // },
          // image: function() {
          //     if (Cesium.defined(texture)) {
          //         return texture;
          //     } else {
          //         return frameState.context.defaultTexture;
          //     }
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
        return new Cesium.DrawCommand({
          // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
          modelMatrix: matrix,
          vertexArray: vertexArray,
          shaderProgram: program,
          uniformMap: uniformMap,
          renderState: renderState,
          pass: Cesium.Pass.TRANSLUCENT,
          // pass: Cesium.Pass.OPAQUE,
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

    viewer.scene.globe.depthTestAgainstTerrain = true;
    let primitive = viewer.scene.primitives.add(
      new DynamicSectorPrimitive({
        modelMatrix: modelMatrix,
        positionArray: option.typedArray,
        stArray: option.stArray,
        // time: option.time,
        // normalsArray:normalsArray,
      })
    );

    return primitive;
    };
    // 旋转 关键点，并保存 --- 关于旋转为什么不生效，明天再看看，实在不行就直接找点
    let rotateInClipSpace = () => {
    // 如何在 clip space 里 绕 Z轴 旋转？？？
    let rotateM = this.rotateAroundXAxis(-90 * (Math.PI / 180)); // (30 * (Math.PI/180))
    rotateM = Cesium.Matrix4.multiply(
      Cesium.Matrix4.IDENTITY,
      rotateM,
      rotateM
    );
    let invRotateM = Cesium.Matrix4.inverse(rotateM, new Cesium.Matrix4());
    console.log(
      "%c [ invRotateM ]-2598",
      "font-size:13px; background:pink; color:#bf2c9f;",
      invRotateM
    );
    let start_R = this.Matrix4MultiplyByPoint(invRotateM, start);
    let end_R = this.Matrix4MultiplyByPoint(invRotateM, end);
    let referP1_R = this.Matrix4MultiplyByPoint(invRotateM, referP1);
    let referP2_R = this.Matrix4MultiplyByPoint(invRotateM, referP2);
    let points_R = BezierBy4Point(
      start_R,
      referP1_R,
      referP2_R,
      end_R,
      numOfPoints
    ); // 100 means get 100 points on this Bezier Curve
    let arrangedPoints_R = [];
    for (let i = 1; i < numOfPoints - 1 - 1; i++) {
      arrangedPoints_R.push(...points_R[i - 1]);
      arrangedPoints_R.push(...points_R[i]);
      arrangedPoints_R.push(...points_R[numOfPoints - 1]);
    }
    // 乘上box的长度
    let boxVertex_R = arrangedPoints.map(function (v) {
      return v * radius;
    });
    drawDynamicSector_R({
      matrix: modelMatrix,
      typedArray: boxVertex_R,
      // stArray,
      // normalsArray,
      // time,
      color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
      alpha: 0.8,
    });
    };
}
function FZRadar_DRAW_ELEMENTS(option) {
    /* option:
        {
            viewer，
            position,// Cesium.Cartesian3
        }
    */
    if (!option.position instanceof Cesium.Cartesian3) { alert("FZRadar 的 position 必须是 Cartesian3。"); return; }
    if (!option.viewer) { alert("FZRadar方法中 viewer 必须传入 "); return; }

    let viewer = option.viewer;
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(option.position);

    // let origin = [0, 0, 0];
    let numOfPoints = 40; //建议最少每个扇形 40 个点
    let radius = 50000.0;

    let numbersOfDivide = 60; // 选60 是因为可以被2，3整除，这样的话后期想取曲面的一部分的时候便于计算
    let radiusOfCircle = Math.PI * 2; //从 X轴 正向开始算，沿着Y轴正向转 --- 决定横向显示整个圆(2 PI)或者其他弧度
    // 先得到一个扇形的点，画出来
    // 然后旋转后得到 CurveSurface 的点，画出来
    let getSectorPoints = (p1, p2, p3, p4) => {
        let points = BezierBy4Point(p1, p2, p3, p4, numOfPoints); // 100 means get 100 points on this Bezier Curve
        return points;
    };
    let dealWithCirclePoints = (points) => {
    let arrangedPoints = [];
    for (let i = 1; i < numOfPoints - 1 - 1; i++) {
        arrangedPoints.push(...points[i - 1]);
        arrangedPoints.push(...points[i]);
        arrangedPoints.push(...points[numOfPoints - 1]);
    }
    // 乘上box的长度
    let boxVertex = arrangedPoints.map(function (v) {
      return v * radius * 2;
    });
    return boxVertex;
    };

    // 关于 纹理坐标，当前模型不需要纹理
    let drawDynamicTriangles = (option) => {
        /*  option:{
            matrix:modelMatrix,
            typedArray,
            stArray,
            normalsArray,
            time,
            color:new Cesium.Color(1.0, 1.0, 1.0, 1.0);
            alpha:1.0
        }
        */

        // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
        // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
        const modelMatrix = option.matrix; // Cesium.Matrix4.IDENTITY;

        const vertexShaderText = `
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 st;
            attribute float batchId;

            // varying vec3 v_positionEC;
            // varying vec3 v_normalEC;
            // varying vec2 v_st;

            void main() {
                vec4 p = vec4(position,1.0);

                // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                // v_st = st;

                // v_normal = czm_normal;// * normal;
                // v_normalEC = normal;
                // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

                // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
                gl_Position = czm_projection * czm_view * czm_model * p;
                // gl_Position = czm_modelViewProjectionRelativeToEye * p;
            }
        `;

        const fragmentShaderText = `
            uniform vec4 u_color;
            uniform float u_alpha;
            // uniform float u_time;
            // uniform sampler2D image;

            varying vec3 v_positionEC;
            // varying vec2 v_st;

            void main(){
                czm_materialInput materialInput;
                // materialInput.positionToEyeEC = v_positionEC;
                // materialInput.st = v_st;

                czm_material material = czm_getDefaultMaterial(materialInput);
                // vec2 st = materialInput.st*10.0;
                // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                // material.alpha = colorImage.a * u_alpha;
                // material.diffuse = colorImage.rgb * u_color.rgb;
                material.alpha = u_alpha;
                material.diffuse = u_color.rgb;

                gl_FragColor = vec4(material.diffuse , material.alpha);
            }
        `;

        let that = this;
        // 1.5 定义纹理
        var texture = undefined;
        let u_color = option.color
            ? option.color
            : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
        let u_alpha = option.alpha ? option.alpha : 1.0;

        // var imageUri = this.imageUri;
        // Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
        //     console.log('image loaded!');
        //     var vtxfTexture;
        //     var context = viewer.scene.context;
        //     if (Cesium.defined(image.internalFormat)) {
        //         vtxfTexture = new Cesium.Texture({
        //             context: context,
        //             pixelFormat: image.internalFormat,
        //             width: image.width,
        //             height: image.height,
        //             source: {
        //                 arrayBufferView: image.bufferView
        //             }
        //         });
        //     } else {
        //         vtxfTexture = new Cesium.Texture({
        //             context: context,
        //             source: image
        //         });
        //     }
        //     texture = vtxfTexture;
        // });

        class DynamicSectorPrimitive {
            /**
            * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
            */
            constructor(option = {}) {
            this._modelMatrix = option.modelMatrix;
            // this.createCommand = null
            this.preExecute = option.preExecute;
            this.positionArray = option.positionArray;
            // this.normalsArray = option.normalsArray;
            // this.stArray = option.stArray;
            }

            createVertexBufferByData(frameState) {
                const positionBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float32Array(this.positionArray),
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

                // 在这里创建纹理坐标Buffer:
                // const stBuffer = Cesium.Buffer.createVertexBuffer({
                //     usage: Cesium.BufferUsage.STATIC_DRAW,
                //     typedArray: new Float32Array(this.stArray),
                //     context: frameState.context,
                // });

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
                        // {
                        //     index: 1, // 等于 attributeLocations['position']
                        //     vertexBuffer: stBuffer,
                        //     componentsPerAttribute: 2,
                        //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        // },
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

            createCommand(frameState, matrix) {
                const attributeLocations = {
                    position: 0,
                    st: 1,
                    // normal: 2,
                    // textureCoordinates: 1,
                };
                const uniformMap = {
                    u_color() {
                    // return Cesium.Color.RED;
                    // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    return u_color;
                    },
                    u_alpha() {
                    return u_alpha;
                    },
                    // u_time() {
                    //     u_time += 0.001;
                    //     if (u_time > 1.0) {
                    //         u_time = 0.0;
                    //     }
                    //     return u_time;
                    // },
                    // image: function() {
                    //     if (Cesium.defined(texture)) {
                    //         return texture;
                    //     } else {
                    //         return frameState.context.defaultTexture;
                    //     }
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

                return new Cesium.DrawCommand({
                    // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
                    modelMatrix: matrix,
                    vertexArray: vertexArray,
                    shaderProgram: program,
                    uniformMap: uniformMap,
                    renderState: renderState,
                    pass: Cesium.Pass.TRANSLUCENT,
                    // pass: Cesium.Pass.OPAQUE,
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

        viewer.scene.globe.depthTestAgainstTerrain = true;
        let primitive = viewer.scene.primitives.add(
            new DynamicSectorPrimitive({
                modelMatrix: modelMatrix,
                positionArray: option.typedArray,
                stArray: option.stArray,
                // time: option.time,
                // normalsArray:normalsArray,
            })
        );

        return primitive;
    };

    // 包括 2个 geometry： 雷达模型和雷达扇页
    // 在 clip space 中完成 geometry 的确定和创建

    // 雷达扇页
    // X_positive
    let start_X_pos = [0, 0, 0];
    let end_X_pos = [0.5, 0, 0];
    // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
    let referP1_X_pos = [0.125, 0, 0.25]; //start 和 midOfStartEndOnTop 的 中点
    let referP2_X_pos = [0.375, 0, 0.25]; //end 和 midOfStartEndOnTop 的 中点
    let pointX_pos = getSectorPoints(
        start_X_pos,
        referP1_X_pos,
        referP2_X_pos,
        end_X_pos
    );
    drawDynamicTriangles({
        matrix: modelMatrix,
        typedArray: dealWithCirclePoints(pointX_pos),
        // stArray,
        // normalsArray,
        // time
    });
    let otherSector = () => {
        // X_negative
        let start_X_neg = [0, 0, 0];
        let end_X_neg = [-0.5, 0, 0];
        // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
        let referP1_X_neg = [-0.125, 0, 0.25]; //start 和 midOfStartEndOnTop 的 中点
        let referP2_X_neg = [-0.375, 0, 0.25]; //end 和 midOfStartEndOnTop 的 中点
        let pointX_neg = getSectorPoints(
            start_X_neg,
            referP1_X_neg,
            referP2_X_neg,
            end_X_neg
        );
        // drawDynamicTriangles({
        //     matrix: modelMatrix,
        //     typedArray: dealWithCirclePoints(pointX_neg),
        //     // stArray,
        //     // normalsArray,
        //     // time
        // });
        // Y_positive
        let start_Y_pos = [0, 0, 0];
        let end_Y_pos = [0, 0.5, 0];
        // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
        let referP1_Y_pos = [0, 0.125, 0.25]; //start 和 midOfStartEndOnTop 的 中点
        let referP2_Y_pos = [0, 0.375, 0.25]; //end 和 midOfStartEndOnTop 的 中点
        let pointY_pos = getSectorPoints(
        start_Y_pos,
        referP1_Y_pos,
        referP2_Y_pos,
        end_Y_pos
        );
        // drawDynamicTriangles({
        //     matrix: modelMatrix,
        //     typedArray: dealWithCirclePoints(pointY_pos),
        //     // stArray,
        //     // normalsArray,
        //     // time
        // });
        // Y_negative
        let start_Y_neg = [0, 0, 0];
        let end_Y_neg = [0, -0.5, 0];
        // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
        let referP1_Y_neg = [0, -0.125, 0.25]; //start 和 midOfStartEndOnTop 的 中点
        let referP2_Y_neg = [0, -0.375, 0.25]; //end 和 midOfStartEndOnTop 的 中点
        let pointY_neg = getSectorPoints(
        start_Y_neg,
        referP1_Y_neg,
        referP2_Y_neg,
        end_Y_neg
        );
        // drawDynamicTriangles({
        //     matrix: modelMatrix,
        //     typedArray: dealWithCirclePoints(pointY_neg),
        //     // stArray,
        //     // normalsArray,
        //     // time
        // });
    };

    // 雷达体
    // 直接找特定的点吧 --- 也是 Bezier ？ 要得到一个精度足够的圆。----再观察之后发现，雷达体的面的每一个小的平面并不是一个曲面，所以，关键是利用现有的扇形的点，在所在XY平面得到一个对应的圆弧
    let pointsForRadarStructure = [];
    function getPointsOfRadarStructure(start, end, numOfPoints = 10) {
        let p_forCircle = [start[0], end[1], start[2]]; // 当前的 x，y，以及 此时的z，也即此时所在的z平面
        let p_1 = [
            (start[0] + p_forCircle[0]) / 2,
            (start[1] + p_forCircle[1]) / 2,
            start[2], // 因为 z 分量 没变化
        ];
        let p_2 = [
            (end[0] + p_forCircle[0]) / 2,
            (end[1] + p_forCircle[1]) / 2,
            end[2], // 因为 z 分量 没变化
        ];
        // console.log('x_pos', x_pos, 'p_1  ', p_1,'p_2  ', p_2,'y_pos', y_pos)
        let pointss = getPoints(start, p_1, p_2, end, numOfPoints); //现在的问题是画线有问题，不过可以尝试用这些点画三角形，看看是不是能画出来一个平面

        return pointss;
    }
    let getCurXYPointsInClipSpaceByBezier = (p) => {
        let x_pos = pointX_pos[p];
        let x_neg = pointX_neg[p];
        let y_pos = pointY_pos[p];
        let y_neg = pointY_neg[p];

        // 在 XY 平面进行 贝塞尔曲线的求得 : z 分量不变
        // x_pos
        // y_pos
        // let mid_xng = [
        //     (x_pos[0] + y_pos[0]) / 2,
        //     (x_pos[1] + y_pos[1]) / 2,
        //     (x_pos[2] + y_pos[2]) / 2,
        // ];
        // 此时在 clip space中，
        // 每 2 个点 以及另外一个可以构成 一个在当前XY平面内的 等腰三角形，其实是 变长为 radius / R 的正方形的一半，
        let XpYp = getPointsOfRadarStructure(x_pos, y_pos, pointsNum);

        // y_pos
        // x_neg
        // let YpXn = getPointsOfRadarStructure(y_pos, x_neg, 10);
        let YpXn = getPointsOfRadarStructure(x_neg, y_pos, pointsNum);

        // x_neg
        // y_neg
        let XnYn = getPointsOfRadarStructure(x_neg, y_neg, pointsNum);

        // y_neg
        // x_pos
        // let YnXp = getPointsOfRadarStructure(y_neg, x_pos, 10);
        let YnXp = getPointsOfRadarStructure(x_pos, y_neg, pointsNum);

        pointsForRadarStructure.push(...XpYp);
        pointsForRadarStructure.push(...YpXn);
        pointsForRadarStructure.push(...XnYn);
        pointsForRadarStructure.push(...YnXp);

        cur.push(pointsForRadarStructure); // 验证一个问题： 如果传入的4个点都在 XY 平面，是否能够生成对应点集 --- 得到的点的集合要是一段一段的才行
    };

    let getCurXYPointsInClipSpaceByCalRotateRadius = (startPos) => {
        /*  startPos ---这个点是 X 轴 正方向上的点，
        从这个点开始，以 x坐标值 为半径，沿 Y轴正方向旋转 一圈，得到一个可以构成一个圆的点。
        在得到点的过程中，可以设置：
        1. 得到半圆还是 四分之一圆。
        2. 构成当前圆的点的数量，即：当前圆被分割成多少份。（是整个圆，而不是想要显示的那部分圆，这个后期加上）
        */
        let curRadius = startPos[0];

        let pointOnCircle = [];
        for (let i = 0; i <= numbersOfDivide; i++) {
            // let curAngle = i * 360 / numbersOfDivide;
            let curAngle = (i * radiusOfCircle) / numbersOfDivide; //看来还是得用弧度

            let a = Math.cos(curAngle) * curRadius;
            let b = Math.sin(curAngle) * curRadius;
            let c = startPos[2];

            pointOnCircle.push([a, b, c]);
        }

        return pointOnCircle;
    };

    let pointsNum = numbersOfDivide;//？？？
    let cur = [];
    for (let p = 0; p < pointX_pos.length; p++) {
        cur.push(getCurXYPointsInClipSpaceByCalRotateRadius(pointX_pos[p]));

        // 这种方式生成的圆没那么圆润，看上去不像是一个圆 -- 测试阶段发现了，就没有继续深入。
        // if (p == 0 || p == pointX_pos.length - 1) { continue; }
        // getCurXYPointsInClipSpaceByBezier(p)
    }
    // console.log("cur", cur.length);// [ [ [x,y,z] ], ... ]

    // 先画面，
    // 这些点怎么用:
    //  1. 先处理成 每一个沿 Z轴 切面的圆弧的点 -- 这样浪费内存
    //  2. 然后处理点
    let radarCurveSurfacePoints = [];
    for (let i = 1; i <= pointsNum; i++) {
        for (let p = 1; p < cur.length; p++) {
            // cur 里的每一组数据里取 相同 index, index - 1  的数据
            let a = cur[p - 1][i - 1];
            let b = cur[p - 1][i];
            let c = cur[p][i - 1];
            let d = cur[p][i];

            // a-b-c-b-c-d
            radarCurveSurfacePoints.push(...a);
            radarCurveSurfacePoints.push(...b);
            radarCurveSurfacePoints.push(...c);
            radarCurveSurfacePoints.push(...b);
            radarCurveSurfacePoints.push(...c);
            radarCurveSurfacePoints.push(...d);
        }
    }
    // 乘上box的长度
    let boxVertex = radarCurveSurfacePoints.map(function (v) {
        return v * radius * 2;
    });
    drawDynamicTriangles({
        matrix: modelMatrix,
        typedArray: boxVertex,
        // stArray,
        // normalsArray,
        // time
        color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
        alpha: 0.4,
    });

    // 再画线。
    let drawStaticLine = (option) => {
        /*  option:{
            matrix:
            typedArray,
            stArray,
            normalsArray,
            time
        }
        */

        const modelMatrix = option.matrix ? option.matrix : Cesium.Matrix4.IDENTITY;

        const vertexShaderText = `
            attribute vec3 position;
            // attribute vec3 normal;
            // attribute vec2 st;
            attribute float batchId;

            // varying vec3 v_positionEC;
            // varying vec3 v_normalEC;
            // varying vec2 v_st;

            void main() {
                vec4 p = vec4(position,1.0);

                // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                // v_st = st;

                // v_normal = czm_normal;// * normal;
                // v_normalEC = normal;
                // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

                // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
                gl_Position = czm_projection * czm_view * czm_model * p;
                // gl_Position = czm_modelViewProjectionRelativeToEye * p;
            }
        `;

        const fragmentShaderText = `
            uniform vec4 u_color;
            uniform float u_alpha;
            // uniform sampler2D image;

            // varying vec3 v_positionEC;
            // varying vec2 v_st;

            void main(){
                czm_materialInput materialInput;
                // materialInput.positionToEyeEC = v_positionEC;
                // materialInput.st = v_st;

                czm_material material = czm_getDefaultMaterial(materialInput);
                // vec2 st = materialInput.st;//*10.0;
                // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                // vec4 colorImage = texture2D(image, vec2(st.s, st.t));
                // material.alpha = colorImage.a * u_alpha;
                // material.diffuse = colorImage.rgb * u_color.rgb;
                material.alpha = u_alpha;
                material.diffuse = u_color.rgb;

                gl_FragColor = vec4(material.diffuse , material.alpha);
            }
        `;

        // 1.5 定义纹理
        let u_color = option.color
            ? option.color
            : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
        let u_alpha = option.alpha ? option.alpha : 1.0;

        /* ----- See Here ↓ ------ */
        class LineDCPrimitive {
            /**
            * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
            */
            constructor(option = {}) {
                this._modelMatrix = option.modelMatrix;
                // this.createCommand = null
                this.preExecute = option.preExecute;
                this.positionArray = option.positionArray;
                // this.normalsArray = option.normalsArray;
                // this.stArray = option.stArray;
            }

            createVertexBufferByData(frameState) {
                const positionBuffer = Cesium.Buffer.createVertexBuffer({
                    usage: Cesium.BufferUsage.STATIC_DRAW,
                    typedArray: new Float64Array(this.positionArray),
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

                // 在这里创建纹理坐标Buffer:
                // const stBuffer = Cesium.Buffer.createVertexBuffer({
                //     usage: Cesium.BufferUsage.STATIC_DRAW,
                //     typedArray: new Float32Array(this.stArray),
                //     context: frameState.context,
                // });

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
                        // {
                        //     index: 1, // 等于 attributeLocations['position']
                        //     vertexBuffer: stBuffer,
                        //     componentsPerAttribute: 2,
                        //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        // },
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

            createCommand(frameState, matrix) {
                const attributeLocations = {
                    position: 0,
                    // st: 1,
                    // normal: 2,
                    // textureCoordinates: 1,
                };
                const uniformMap = {
                    u_color() {
                    // return Cesium.Color.RED;
                    // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    return u_color;
                    },
                    u_alpha() {
                    return u_alpha;
                    },
                    // u_time() {
                    //     u_time += 0.001;
                    //     if (u_time > 1.0) {
                    //         u_time = 0.0;
                    //     }
                    //     return u_time;
                    // },
                    // image: function() {
                    //     if (Cesium.defined(texture)) {
                    //         return texture;
                    //     } else {
                    //         return frameState.context.defaultTexture;
                    //     }
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
                return new Cesium.DrawCommand({
                    // primitiveType: Cesium.PrimitiveType.POINTS,//默认就是 PrimitiveType.TRIANGLE
                    // primitiveType: Cesium.PrimitiveType.LINES,//默认就是 PrimitiveType.TRIANGLE
                    primitiveType: Cesium.PrimitiveType.LINE_STRIP, //默认就是 PrimitiveType.TRIANGLE
                    // primitiveType: Cesium.PrimitiveType.LINE_LOOP,//默认就是 PrimitiveType.TRIANGLE
                    modelMatrix: matrix,
                    vertexArray: vertexArray,
                    shaderProgram: program,
                    uniformMap: uniformMap,
                    renderState: renderState,
                    pass: Cesium.Pass.TRANSLUCENT, // 此时的线才能是 solid line ，
                    // pass: Cesium.Pass.OPAQUE,// 此时 line 不管PrimitiveType怎么变，画出来的都是虚线
                });
            }

            /**
            * @param {FrameState} frameState
            */
            update(frameState) {

                if (this.preExecute) { this.preExecute(); }
                const command = this.createCommand(frameState, this._modelMatrix);

                frameState.commandList.push(command);
            }
        }

        viewer.scene.globe.depthTestAgainstTerrain = true;

        let primitive = viewer.scene.primitives.add(
          new LineDCPrimitive({
            modelMatrix: modelMatrix,
            positionArray: option.typedArray,
            stArray: option.stArray,
            // time: option.time,
            // normalsArray:normalsArray,
          })
        );

        return primitive;
    };
    // for Draw line along Radius
    // for (let q = 0; q < pointsForRadarStucture.length; q++){
    //     // pointsForRadarStucture[q];// Array
    //     // 为了 能画出线，每2个点
    // }
    // 和画Curve同样的点，画出来的线就是不对。。。。
    // drawStaticLine({
    //     matrix: modelMatrix,
    //     typedArray: boxVertex,
    //     // stArray,
    //     // normalsArray,
    //     // time
    //     color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
    //     alpha: 0.4,
    // });

    // 测试完毕： 使用其中的 byDegrees 方式
    let testPointCanBeACircleOrNot = () => {
        // 思路是： 每2个点和圆心组成一个三角形。
        // 中间结论：通过函数内的方式可以得到对应的点，但是组成的圆不是很规整。原因在于点的计算。
        // 最终结论： 可以通过每次旋转一个角度，然后得到对应的点
        let demoFinalPos = [];
        let byBezier = () => {
            let demoPos = pointsForRadarStructure[10]; //39 , pointsForRadarStructure: <Array>Array, demoPos//27: <lon,lat,alt>Array
            for (let p = 1; p < demoPos.length; p++) {
            demoFinalPos.push(...demoPos[p - 1]);
            demoFinalPos.push(...demoPos[p]);
            // demoFinalPos.push(...demoPos[demoPos.length - 1])
            demoFinalPos.push(...[0.0, 0.0, demoPos[0][2]]);
            }
        };
        let byDegrees = () => {
            let numbersOfDivide = 20;
            let cusPosInClipSpace = pointX_pos[5]; //利用这个 点，以及 半径，每一份所对应的圆心角，计算出每个点的位置

            let pointOnCircle = getCurXYPointsInClipSpace(
            cusPosInClipSpace,
            Math.PI / 2,
            numbersOfDivide
            );
            // above 得到圆上的所有点 --- 得到这些点之后就可以利用这些点画 曲面 了
            // next： 每 2 个点链接圆心画 三角形
            let curCenter = [0.0, 0.0, cusPosInClipSpace[2]];
            for (let i = 1; i < pointOnCircle.length; i++) {
            // pointOnCircle: [ [lon,lat,alt], ... ]
            demoFinalPos.push(...pointOnCircle[i - 1]);
            demoFinalPos.push(...pointOnCircle[i]);
            demoFinalPos.push(...curCenter);
            }
        };
        byDegrees();
        // 乘上box的长度
        let boxVertex = demoFinalPos.map(function (v) {
        return v * radius * 2;
    });

    let testForDrawTriangleByPointX_pos = () => {
    let dataTest = [];
    // pointX_pos
    let index_ = 20;
    let a = pointX_pos[index_];
    let b = pointY_pos[index_];
    let c = pointX_neg[index_];
    let d = pointY_neg[index_];
    let o = [0.0, 0.0, a[2]];

    dataTest.push(
    ...[a[0] * radius * 2, a[1] * radius * 2, a[2] * radius * 2]
    );
    dataTest.push(
    ...[b[0] * radius * 2, b[1] * radius * 2, b[2] * radius * 2]
    );
    dataTest.push(
    ...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]
    );

    dataTest.push(
    ...[b[0] * radius * 2, b[1] * radius * 2, b[2] * radius * 2]
    );
    dataTest.push(
    ...[c[0] * radius * 2, c[1] * radius * 2, c[2] * radius * 2]
    );
    dataTest.push(
    ...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]
    );

    dataTest.push(
    ...[c[0] * radius * 2, c[1] * radius * 2, c[2] * radius * 2]
    );
    dataTest.push(
    ...[d[0] * radius * 2, d[1] * radius * 2, d[2] * radius * 2]
    );
    dataTest.push(
    ...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]
    );

    dataTest.push(
    ...[d[0] * radius * 2, d[1] * radius * 2, d[2] * radius * 2]
    );
    dataTest.push(
    ...[a[0] * radius * 2, a[1] * radius * 2, a[2] * radius * 2]
    );
    dataTest.push(
    ...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]
    );

    return dataTest;
    };
    // boxVertex = testForDrawTriangleByPointX_pos()

    drawDynamicTriangles({
    matrix: modelMatrix,
    typedArray: boxVertex,
    // stArray,
    // normalsArray,
    // time
    });
    };
    // testPointCanBeACircleOrNot();



    let drawDynamicSector_R = (option) => {
    /*  option:{
              matrix:modelMatrix,
              typedArray,
              stArray,
              normalsArray,
              time,
              color:new Cesium.Color(1.0, 1.0, 1.0, 1.0);
          }
      */

    // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
    // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
    const modelMatrix = option.matrix; // Cesium.Matrix4.IDENTITY;

    const vertexShaderText = `
          attribute vec3 position;
          attribute vec3 normal;
          attribute vec2 st;
          attribute float batchId;

          // varying vec3 v_positionEC;
          // varying vec3 v_normalEC;
          // varying vec2 v_st;

          void main() {
              vec4 p = vec4(position,1.0);

              // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
              // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
              // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
              // v_st = st;

              // v_normal = czm_normal;// * normal;
              // v_normalEC = normal;
              // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

              // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
              gl_Position = czm_projection * czm_view * czm_model * p;
              // gl_Position = czm_modelViewProjectionRelativeToEye * p;
          }
      `;

    const fragmentShaderText = `
          uniform vec4 u_color;
          uniform float u_alpha;
          // uniform float u_time;
          // uniform sampler2D image;

          varying vec3 v_positionEC;
          // varying vec2 v_st;

          void main(){
              czm_materialInput materialInput;
              // materialInput.positionToEyeEC = v_positionEC;
              // materialInput.st = v_st;

              czm_material material = czm_getDefaultMaterial(materialInput);
              // vec2 st = materialInput.st*10.0;
              // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
              // material.alpha = colorImage.a * u_alpha;
              // material.diffuse = colorImage.rgb * u_color.rgb;
              material.alpha = u_alpha;
              material.diffuse = u_color.rgb;

              gl_FragColor = vec4(material.diffuse , material.alpha);
          }
      `;

    let that = this;
    // 1.5 定义纹理
    var texture = undefined;
    let u_color = option.color
      ? option.color
      : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
    let u_alpha = option.alpha ? option.alpha : 1.0;

    // var imageUri = this.imageUri;
    // Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
    //     console.log('image loaded!');
    //     var vtxfTexture;
    //     var context = that.viewer.scene.context;
    //     if (Cesium.defined(image.internalFormat)) {
    //         vtxfTexture = new Cesium.Texture({
    //             context: context,
    //             pixelFormat: image.internalFormat,
    //             width: image.width,
    //             height: image.height,
    //             source: {
    //                 arrayBufferView: image.bufferView
    //             }
    //         });
    //     } else {
    //         vtxfTexture = new Cesium.Texture({
    //             context: context,
    //             source: image
    //         });
    //     }

    //     texture = vtxfTexture;
    // });

    class DynamicSectorPrimitive {
      /**
       * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
       */
      constructor(option = {}) {
        this._modelMatrix = option.modelMatrix;
        // this.createCommand = null
        this.preExecute = option.preExecute;
        this.positionArray = option.positionArray;
        // this.normalsArray = option.normalsArray;
        // this.stArray = option.stArray;
      }

      createVertexBufferByData(frameState) {
        const positionBuffer = Cesium.Buffer.createVertexBuffer({
          usage: Cesium.BufferUsage.STATIC_DRAW,
          typedArray: new Float32Array(this.positionArray),
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

        // 在这里创建纹理坐标Buffer:
        // const stBuffer = Cesium.Buffer.createVertexBuffer({
        //     usage: Cesium.BufferUsage.STATIC_DRAW,
        //     typedArray: new Float32Array(this.stArray),
        //     context: frameState.context,
        // });

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
            // {
            //     index: 1, // 等于 attributeLocations['position']
            //     vertexBuffer: stBuffer,
            //     componentsPerAttribute: 2,
            //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
            // },
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
      createVertexBufferByDataNext(frameState) {
        var geometry = new Cesium.Geometry({
          attributes: {
            position: new Cesium.GeometryAttribute({
              // vtxf 使用double类型的position进行计算
              // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
              componentDatatype: Cesium.ComponentDatatype.FLOAT,
              componentsPerAttribute: 3,
              values: this.positionArray,
            }),
            // normal: new Cesium.GeometryAttribute({
            //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
            //     componentsPerAttribute: 3,
            //     values: normals
            // }),
            // textureCoordinates: new Cesium.GeometryAttribute({
            //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
            //     componentsPerAttribute: 2,
            //     values: this.stArray
            // })
          },
          // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
          indices: this.indicesArray,
          primitiveType: Cesium.PrimitiveType.TRIANGLES,
          // boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
        });

        const attributeLocations = {
          position: 0,
          // st: 1,
          // position: 0,
          // normal: 1,
          // textureCoordinates: 1,
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
            // return Cesium.Color.RED;
            // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
            return u_color;
          },
          u_alpha() {
            return u_alpha;
          },
          // u_time() {
          //     u_time += 0.001;
          //     if (u_time > 1.0) {
          //         u_time = 0.0;
          //     }
          //     return u_time;
          // },
          // image: function() {
          //     if (Cesium.defined(texture)) {
          //         return texture;
          //     } else {
          //         return frameState.context.defaultTexture;
          //     }
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
        return new Cesium.DrawCommand({
          // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
          modelMatrix: matrix,
          vertexArray: vertexArray,
          shaderProgram: program,
          uniformMap: uniformMap,
          renderState: renderState,
          pass: Cesium.Pass.TRANSLUCENT,
          // pass: Cesium.Pass.OPAQUE,
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

    viewer.scene.globe.depthTestAgainstTerrain = true;
    let primitive = viewer.scene.primitives.add(
      new DynamicSectorPrimitive({
        modelMatrix: modelMatrix,
        positionArray: option.typedArray,
        stArray: option.stArray,
        // time: option.time,
        // normalsArray:normalsArray,
      })
    );

    return primitive;
    };
    // 旋转 关键点，并保存 --- 关于旋转为什么不生效，明天再看看，实在不行就直接找点
    let rotateInClipSpace = () => {
    // 如何在 clip space 里 绕 Z轴 旋转？？？
    let rotateM = this.rotateAroundXAxis(-90 * (Math.PI / 180)); // (30 * (Math.PI/180))
    rotateM = Cesium.Matrix4.multiply(
      Cesium.Matrix4.IDENTITY,
      rotateM,
      rotateM
    );
    let invRotateM = Cesium.Matrix4.inverse(rotateM, new Cesium.Matrix4());
    console.log(
      "%c [ invRotateM ]-2598",
      "font-size:13px; background:pink; color:#bf2c9f;",
      invRotateM
    );
    let start_R = this.Matrix4MultiplyByPoint(invRotateM, start);
    let end_R = this.Matrix4MultiplyByPoint(invRotateM, end);
    let referP1_R = this.Matrix4MultiplyByPoint(invRotateM, referP1);
    let referP2_R = this.Matrix4MultiplyByPoint(invRotateM, referP2);
    let points_R = BezierBy4Point(
      start_R,
      referP1_R,
      referP2_R,
      end_R,
      numOfPoints
    ); // 100 means get 100 points on this Bezier Curve
    let arrangedPoints_R = [];
    for (let i = 1; i < numOfPoints - 1 - 1; i++) {
      arrangedPoints_R.push(...points_R[i - 1]);
      arrangedPoints_R.push(...points_R[i]);
      arrangedPoints_R.push(...points_R[numOfPoints - 1]);
    }
    // 乘上box的长度
    let boxVertex_R = arrangedPoints.map(function (v) {
      return v * radius;
    });
    drawDynamicSector_R({
      matrix: modelMatrix,
      typedArray: boxVertex_R,
      // stArray,
      // normalsArray,
      // time,
      color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
      alpha: 0.8,
    });
    };
}
export default FZRadar_DRAW_ARRAY;
