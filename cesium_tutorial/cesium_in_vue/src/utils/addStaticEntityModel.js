import * as Cesium from 'cesium'
import Cesium3DTile from 'cesium/Source/Scene/Cesium3DTile';
import CartesianRaduis2Degree from "./CartesianRaduis2Degree.js"
import RadarReconnaossance from "./RadarReconnaossance.js";

// 此方法每次只能添加一个Label
class addStaticEntityModel {
    constructor(viewer, option = {}) {

        if (!viewer) { alert('必须传入 viewer'); return; }
        if (!option.position) { alert('必须传入 position'); return; }

        this.viewer = viewer;
        this.option = option;
        this.position = option.position;
        this.beforePosition = null;
        this.property = null;
        this.entity = null;
        this.lastTime = null;
        this.tailPosition = new Cesium.SampledPositionProperty();
        this.interval = null;// 用于存放 tail 的position 从 this.property 的何处开始截取
        this.updateTimeStap = 0;
        this.tail = null;
        this.transitionLength = null;
        this.pos_for_tail = null;
        this.modelDemo = null;// for test
        this.customBox = null;// for test
        this.boxPos = new Cesium.SampledPositionProperty();// for test
        this.transitionOfPointOfTail = 0;//需要初始化

        this.silhouetteColor = null; //Cesium.Color.WHITE;
        this.silhouetteSize = null; //10;

        this.init();
    }


    init() {
        this.addEntity(this.position);
    }

    addEntity(position) {

        let option = this.option;
        // this.entity = this.viewer.entities.add(entityOption);
        let modelSrc = option.src ? option.src : "./models/CesiumAir/Cesium_Air.glb";
        let name = option.name ? option.name : Symbol(modelSrc);
        let minimumPixelSize = option.size ? option.size : 128;
        let maximumScale = option.size ? option.size : 20000;
        let that_ = this;

        this.entity = this.viewer.entities.add({
            name: name,
            position: this.position,
            orientation: new Cesium.VelocityOrientationProperty( this.property ),
            model: {
                uri: modelSrc,
                scale:20,// 设定模型放大倍数                                                A numeric Property specifying a uniform linear scale.
                // minimumPixelSize: minimumPixelSize, // 模型的最小 in pixel                                   A numeric Property specifying the approximate minimum pixel size of the model regardless of zoom.
                // maximumScale: maximumScale, // 模型被放大的最大值                                       The maximum scale size of a model. An upper limit for minimumPixelSize.
                heightReference: Cesium.HeightReference.NONE, // 设置model 的 height 属性的参考 A Property specifying what the height is relative to.
                silhouetteColor: new Cesium.CallbackProperty(function (time, result) {
                    return that_.silhouetteColor;
                },false), // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                silhouetteSize: new Cesium.CallbackProperty(function (time, result) {
                    return that_.silhouetteSize;
                },false), // 设置model的轮廓的宽度 in pixel
                // silhouetteColor: this.silhouetteColor, // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                // silhouetteSize: this.silhouetteSize, // 设置model的轮廓的宽度 in pixel
                // silhouetteColor: this.getColor("white", 0.8), // 设置model的轮廓的颜色            A Property specifying the Color of the silhouette(轮廓).
                // silhouetteSize: 4.6, // 设置model的轮廓的宽度 in pixel                          A numeric Property specifying the size of the silhouette in pixels.
                color: this.getColor("white", 1.0), // 设置模型blend颜色                            A Property specifying the Color that blends with the model's rendered color.
                colorBlendMode: this.getColorBlendMode("highlight"), //设置 color 生效(混合)的方式   An enum Property specifying how the color blends with the model.
                // colorBlendAmount: parseFloat(viewModel.colorBlendAmount),
                colorBlendAmount: 0.6, //  {useful when colorBlendMode is MIX} A numeric Property specifying the color strength when the colorBlendMode is MIX. A value of 0.0 results in the model's rendered color while a value of 1.0 results in a solid color, with any value in-between resulting in a mix of the two.
                distanceDisplayCondition: null, //new Cesium.DistanceDisplayCondition(near, far),// A Property specifying at what distance from the camera that this model will be displayed.

                nodeTransformations: null, // [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                articulations: null, //  [not usual]  https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html#.ConstructorOptions  for detail
                clippingPlanes: null, // [not usual] new Cesium.ClippingPlaneCollection(options) // 	A property specifying the ClippingPlaneCollection used to selectively disable rendering the model.
                lightColor: null, // Cesium.Color.RED // [not usual] A property specifying the light color when shading the model. When undefined the scene's light color is used instead.
                imageBasedLightingFactor: new Cesium.Cartesian2( 1.0, 1.0 ), // [not usual] A property specifying the contribution from diffuse and specular image-based lighting.
                clampAnimations: true, // [not usual] A boolean Property specifying if glTF animations should hold the last pose for time durations with no keyframes.
                shadows: Cesium.ShadowMode.ENABLED, //  [not usual] An enum Property specifying whether the model casts or receives shadows from light sources.
                incrementallyLoadTextures: true, //   [not usual] Determine if textures may continue to stream in after the model is loaded.
            },
        });

        // this.addRadar();

    }

    getColorBlendMode(colorBlendMode) {
        return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
    }

    getColor(colorName, alpha) {
        const color = Cesium.Color[colorName.toUpperCase()];
        return Cesium.Color.fromAlpha(color, parseFloat(alpha));
    }

    rotatePoint(pos) {
        // 旋转
        const backto_matrix = Cesium.Matrix4.fromTranslation(pos);
        const moveto_vec = Cesium.Cartesian3.multiplyByScalar(pos, -1, new Cesium.Cartesian3());
        const moveto_matrix = Cesium.Matrix4.fromTranslation(moveto_vec);

        /* 绕x（即东方轴）转90度 */
        const cos_rotateX = Math.cos(Math.PI/2);
        const sin_rotateX = Math.sin(Math.PI/2);
        const arrX = [
            1, 0, 0, 0,
            0, cos_rotateX, sin_rotateX, 0,
            0, -sin_rotateX, cos_rotateX, 0,
            0, 0, 0, 1
        ];
        const arrZ = [
            cos_rotateX, -sin_rotateX, 0, 0,
            sin_rotateX, cos_rotateX, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 1
        ];
        const arrY = [
            cos_rotateX,   0, sin_rotateX,   0,
                 0,   1,      0,   0,
           -sin_rotateX,   0, cos_rotateX,   0,
                 0,   0,      0,   1
        ];
        const rotateX_matrix = Cesium.Matrix4.fromArray(arrZ);

        /* 计算最终矩阵 */
        const temp = Cesium.Matrix4.multiply(rotateX_matrix, moveto_matrix, new Cesium.Matrix4());
        const r = Cesium.Matrix4.multiply(backto_matrix, temp, new Cesium.Matrix4());

        let target_pos = Cesium.Matrix4.multiplyByPoint( r, pos, new Cesium.Cartesian3())

        return target_pos;
    }
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
    }

    addRadar() {
        let { positionForRadar } = RadarReconnaossance(this.viewer, {
            position: this.property,
            radius: 100000,
            beamWidth:90,//波束宽度
        });
    }

}

export default addStaticEntityModel