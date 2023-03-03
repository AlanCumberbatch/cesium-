// importSinglePrimitiveModel
import * as Cesium from 'cesium'

/**
 * 原文档链接： https://cesium.com/learn/cesiumjs/ref-doc/Model.html?classFilter=Model ， 搜索 fromGltf
 * Creates a model from a glTF asset.  When the model is ready to render, i.e., when the external binary, image,
 * and shader files are downloaded and the WebGL resources are created, the Model#readyPromise resolved (in example).
 *
 * The model can be a traditional glTF asset with a .gltf extension or a Binary glTF using the .glb extension.
 *
 * Cesium supports glTF assets with the following extensions（ 在官方文档中查看相关跳转链接 ）
 * KHR_binary_glTF (glTF 1.0)
 * KHR_materials_common (glTF 1.0)
 * WEB3D_quantized_attributes (glTF 1.0)
 * AGI_articulations
 * KHR_blend (draft)
 * KHR_draco_mesh_compression
 * KHR_materials_pbrSpecularGlossiness
 * KHR_materials_unlit
 * KHR_techniques_webgl
 * KHR_texture_transform
 * KHR_texture_basisu
 *
 * For high-precision rendering, Cesium supports the {@link https://github.com/KhronosGroup/glTF/blob/master/extensions/1.0/Vendor/CESIUM_RTC/README.md|CESIUM_RTC} extension, which introduces the
 * CESIUM_RTC_MODELVIEW parameter semantic that says the node is in WGS84 coordinates translated
 * relative to a local origin.
 *
 * @param {Object} options Object with the following properties:
 * @param {Resource|String} options.url The url to the .gltf file.
 * @param {Resource|String} [options.basePath] The base path that paths in the glTF JSON are relative to.
 * @param {Boolean} [options.show=true] Determines if the model primitive will be shown.
 * @param {Matrix4} [options.modelMatrix=Matrix4.IDENTITY] The 4x4 transformation matrix that transforms the model from model to world coordinates.
 * @param {Number} [options.scale=1.0] A uniform scale applied to this model.
 * @param {Number} [options.minimumPixelSize=0.0] The approximate minimum pixel size of the model regardless of zoom.//! never smaller than 128 pixels
 * @param {Number} [options.maximumScale] The maximum scale for the model.//! never larger than 20000 * model size (overrides minimumPixelSize)
 * @param {Object} [options.id] A user-defined object to return when the model is picked with {@link Scene#pick}.
 * @param {Boolean} [options.allowPicking=true] When <code>true</code>, each glTF mesh and primitive is pickable with {@link Scene#pick}.
 * @param {Boolean} [options.incrementallyLoadTextures=true] Determine if textures may continue to stream in after the model is loaded.
 * @param {Boolean} [options.asynchronous=true] Determines if model WebGL resource creation will be spread out over several frames or block until completion once all glTF files are loaded.
 * @param {Boolean} [options.clampAnimations=true] Determines if the model's animations should hold a pose over frames where no keyframes are specified.
 * @param {ShadowMode} [options.shadows=ShadowMode.ENABLED] Determines whether the model casts or receives shadows from light sources.
 * @param {Boolean} [options.debugShowBoundingVolume=false] For debugging only. Draws the bounding sphere for each draw command in the model.
 * @param {Boolean} [options.debugWireframe=false] For debugging only. Draws the model in wireframe.
 * @param {HeightReference} [options.heightReference=HeightReference.NONE] Determines how the model is drawn relative to terrain.
 * @param {Scene} [options.scene] Must be passed in for models that use the height reference property.
 * @param {DistanceDisplayCondition} [options.distanceDisplayCondition] The condition specifying at what distance from the camera that this model will be displayed.
 * @param {Color} [options.color=Color.WHITE] A color that blends with the model's rendered color.
 * @param {ColorBlendMode} [options.colorBlendMode=ColorBlendMode.HIGHLIGHT] Defines how the color blends with the model.
 * @param {Number} [options.colorBlendAmount=0.5] Value used to determine the color strength when the <code>colorBlendMode</code> is <code>MIX</code>. A value of 0.0 results in the model's rendered color while a value of 1.0 results in a solid color, with any value in-between resulting in a mix of the two.
 * @param {Color} [options.silhouetteColor=Color.RED] The silhouette color. If more than 256 models have silhouettes enabled, there is a small chance that overlapping models will have minor artifacts.
 * @param {Number} [options.silhouetteSize=0.0] The size of the silhouette in pixels.
 * @param {ClippingPlaneCollection} [options.clippingPlanes] The {@link ClippingPlaneCollection} used to selectively disable rendering the model.
 * @param {Boolean} [options.dequantizeInShader=true] Determines if a {@link https://github.com/google/draco|Draco} encoded model is dequantized on the GPU. This decreases total memory usage for encoded models. Deprecated in CesiumJS 1.94, will be removed in CesiumJS 1.95.
 * @param {Cartesian3} [options.lightColor] The light color when shading the model. When <code>undefined</code> the scene's light color is used instead.
 * @param {ImageBasedLighting} [options.imageBasedLighting] The properties for managing image-based lighting for this tileset.
 * @param {Credit|String} [options.credit] A credit for the model, which is displayed on the canvas.
 * @param {Boolean} [options.showCreditsOnScreen=false] Whether to display the credits of this model on screen.
 * @param {Boolean} [options.backFaceCulling=true] Whether to cull back-facing geometry. When true, back face culling is determined by the material's doubleSided property; when false, back face culling is disabled. Back faces are not culled if {@link Model#color} is translucent or {@link Model#silhouetteSize} is greater than 0.0.
 * @param {Boolean} [options.showOutline=true] Whether to display the outline for models using the {@link https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/CESIUM_primitive_outline|CESIUM_primitive_outline} extension. When true, outlines are displayed. When false, outlines are not displayed.
 * @returns {Model} The newly created model.
 *
 * @example
 * // Example 1. Create a model from a glTF asset
 * const model = scene.primitives.add(Cesium.Model.fromGltf({
 *   url : './duck/duck.gltf'
 * }));
 *
 * @example
 * // Example 2. Create model and provide all properties and events
 * const origin = Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 200000.0);
 * const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
 *
 * const model = scene.primitives.add(Cesium.Model.fromGltf({
 *   url : './duck/duck.gltf',
 *   show : true,                     // default
 *   modelMatrix : modelMatrix,
 *   scale : 2.0,                     // double size
 *   minimumPixelSize : 128,          // never smaller than 128 pixels
 *   maximumScale: 20000,             // never larger than 20000 * model size (overrides minimumPixelSize)
 *   allowPicking : false,            // not pickable
 *   debugShowBoundingVolume : false, // default
 *   debugWireframe : false
 * }));
 *
 * model.readyPromise.then(function(model) {
 *   // Play all animations when the model is ready to render
 *   model.activeAnimations.addAll();
 * });
 */


function importSinglePrimitiveModel(viewer, option) {

  if (!option) { alert('必须传入 参数配置项'); return; }
  if (!viewer) { alert('必须传入 viewer'); return; }
  if (option.minimumPixelSize && option.minimumPixelSize < 128) {
    alert('minimumPixelSize never smaller than 128 pixels, have changed the value to 128.');
    option.minimumPixelSize = 128;
  }
  if (option.maximumScale && option.maximumScale > 20000) {
    alert('maximumScale never larger than 20000 * model size (overrides minimumPixelSize) , have changed the value to 20000.');
    option.maximumScale = 20000;
  }

  option.url = option.url ? option.url : "./models/CesiumAir/Cesium_Air.glb";
  option.position = option.position ? option.position : Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 5000.0);

  const hpRoll = new Cesium.HeadingPitchRoll();
  const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");

  option.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
  option.position,
  hpRoll,
  Cesium.Ellipsoid.WGS84,
  fixedFrameTransform
  );

  /* option demo
  url: modelSrc,
  show : true,                     // default
  modelMatrix: modelMatrix,
  scale : 1.0,                     // default
  minimumPixelSize : 128,          // never smaller than 128 pixels
  maximumScale: 200,             // never larger than 20000 * model size (overrides minimumPixelSize)
  allowPicking : false,            // not pickable
  debugShowBoundingVolume : false, // default
  debugWireframe : false
  */

  const planePrimitive = viewer.scene.primitives.add( Cesium.Model.fromGltf(option) );

  // 关于添加轮廓
  // postProcessStages （利用 Cesium.postProcessStages）
  if (option && option.outline) {
    if (!option.edgeStage) {
      alert('primitive 模型想要创建 outline 必须传入 edgeStage')
    } else {
      option.edgeStage.selected.push(planePrimitive);
    }
  }

  return planePrimitive;
}

export default importSinglePrimitiveModel