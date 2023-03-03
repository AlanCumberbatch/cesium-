<!--
  why i want to write this?
  cause i want to know clearly how Primitive API works,and then comparing with Primitive API, and finally trying to do something .
 -->
# 结论/conclusion

参照 Cesium 1.85 <br/>
将 primitive 添加到 Scene 后 会自动更新视图。

需要注意的是：

- Appearance 和 GeometryInstance 的匹配
  - [Appearance（a webpage link of Cesium.document）](https://cesium.com/learn/cesiumjs/ref-doc/Appearance.html?classFilter=Appearance)：
    - PerInstanceColorAppearance: An appearance for GeometryInstance instances with color attributes. This allows several geometry instances, each with a different color, to be drawn with the same Primitive as shown in the second example below.
    - MaterialAppearance：An appearance for arbitrary geometry (as opposed to EllipsoidSurfaceAppearance, for example) that supports shading with materials.
    - EllipsoidSurfacceAppearance：An appearance for geometry on the surface of the ellipsoid like PolygonGeometry and RectangleGeometry, which supports all materials like MaterialAppearance with MaterialAppearance.MaterialSupport.ALL. However, this appearance requires fewer vertex attributes since the fragment shader can procedurally compute normal, tangent, and bitangent.
    - Another three: DebugAppearance, PolylineColorAppearance, PolylineMaterialAppearance
# 应用案例： Rectangle

var viewer = new Cesium.Viewer('cesiumContainer');<br/>
var scene = viewer.scene;<br/>
<br/>
var instance = new Cesium.GeometryInstance({<br/>
&emsp;geometry: new Cesium.RectangleGeometry({<br/>
&emsp;&emsp;rectangle: Cesium.Rectangle.fromDegrees(-100.0, 20.0, -90.0, 30.0),<br/>
&emsp;&emsp;vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT<br/>
&emsp;})<br/>
});<br/>
<br/>
var anotherInstance = new Cesium.GeometryInstance({<br/>
&emsp;&emsp;geometry: new Cesium.RectangleGeometry({<br/>
&emsp;&emsp;rectangle: Cesium.Rectangle.fromDegrees(-85.0, 20.0, -75.0, 30.0),<br/>
&emsp;&emsp;vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT<br/>
&emsp;})<br/>
});<br/>
<br/>
[scene](#scene).[primitives](#sceneprimitives).[add](#primitivecollectionadd)new Cesium.[Primitive](#primitive)({<br/>
&emsp;geometryInstances: [instance, anotherInstance],<br/>
&emsp;appearance: new Cesium.EllipsoidSurfaceAppearance({//因为在表面或者在距离地面固定高度的模型，所以用这个<br/>
&emsp;&emsp;material: Cesium.Material.fromType('Stripe')<br/>
&emsp;})<br/>
}));<br/>
<br/>

# Scene

```js
function Scene(options) {
  this._primitives = new PrimitiveCollection();

  // Keeps track of the state of a frame. FrameState is the state across
  // the primitives of the scene. This state is for internally keeping track
  // of celestial(天空的) and environment effects that need to be updated/rendered in
  // a certain order as well as updating/tracking framebuffer usage.
  //跟踪帧的状态。 FrameState 是跨越 scene 中的所有的图元 的状态。
  //此状态用于在内部跟踪需要按特定顺序更新/渲染的天体和环境效果以及更新/跟踪帧缓冲区的使用情况。
  this._environmentState = {

    // in Chinese： 渲染半透明深度选择。结合 存在 Pick 操作，应该是在 执行 Pick 操作的时候才会进行渲染的阀，即判断条件
    renderTranslucentDepthForPick: false,//在 Scene 内部 出现且仅出现在方法 updateEnvironment，executeCommands，executeWebVRCommands，executeCommandsInViewport 中

    ...

  };

  ...

}
```
[PrimitiveCollection](#primitivecollection)

## scene.primitives

```js
Object.defineProperties(Scene.prototype, {
  /**
   * Gets the collection of primitives.
   * @memberof Scene.prototype
   *
   * @type {PrimitiveCollection}
   * @readonly
   */
  primitives: {
    get: function () {
      return this._primitives;
    },
  },
}
```



# PrimitiveCollection

```js
/**
 * A collection of primitives.  This is most often used with {@link Scene#primitives},
 * but <code>PrimitiveCollection</code> is also a primitive itself so collections can
 * be added to collections forming a hierarchy.
 *
 * @param {Object} [options] Object with the following properties:
 * @param {Boolean} [options.show=true] Determines if the primitives in the collection will be shown.
 * @param {Boolean} [options.destroyPrimitives=true] Determines if primitives in the collection are destroyed when they are removed.
 *
 * @example
 * var billboards = new Cesium.BillboardCollection();
 * var labels = new Cesium.LabelCollection();
 *
 * var collection = new Cesium.PrimitiveCollection();
 * collection.add(billboards);
 *
 * scene.primitives.add(collection);  // Add collection
 * scene.primitives.add(labels);      // Add regular primitive
 */
function PrimitiveCollection(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  this._primitives = [];
  this._guid = createGuid();

  // Used by the OrderedGroundPrimitiveCollection
  this._zIndex = undefined;

  /**
   * Determines if primitives in this collection will be shown.
   *
   * @type {Boolean}
   * @default true
   */
  this.show = defaultValue(options.show, true);

  /**
   * Determines if primitives in the collection are destroyed when they are removed by
   * {@link PrimitiveCollection#destroy} or  {@link PrimitiveCollection#remove} or implicitly
   * by {@link PrimitiveCollection#removeAll}.
   */
  this.destroyPrimitives = defaultValue(options.destroyPrimitives, true);
}
```

## PrimitiveCollection.add

```js
/**
 * Adds a primitive to the collection.
 *
 * @param {Object} primitive The primitive to add.
 * @param {Number} [index] The index to add the layer at.  If omitted, the primitive will be added at the bottom of all existing primitives.
 * @returns {Object} The primitive added to the collection.
 *
 * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
 *
 * @example
 * var billboards = scene.primitives.add(new Cesium.BillboardCollection());
 */
PrimitiveCollection.prototype.add = function (primitive, index) {
  var hasIndex = defined(index);

  ...

  if (!hasIndex) {
    this._primitives.push(primitive);
  } else {
    this._primitives.splice(index, 0, primitive);
  }

  return primitive;
};
```

## PrimitiveCollection.prototype.update
```js
/**
 * @private
 */
PrimitiveCollection.prototype.update = function (frameState) {
  if (!this.show) {
    return;
  }

  var primitives = this._primitives;
  // Using primitives.length in the loop is a temporary workaround
  // to allow quadtree updates to add and remove primitives in
  // update().  This will be changed to manage added and removed lists.
  for (var i = 0; i < primitives.length; ++i) {
    primitives[i].update(frameState);//具体 primitive.update 的内部实现 在下方
  }
};
```

# Primitive

```js
function Primitive(options) {

  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  this.geometryInstances = options.geometryInstances;

  this.appearance = options.appearance;
  this._appearance = undefined;
  this._material = undefined;

  ...

}
```

## Primitive.prototype.update

```js
/**
 * Called when {@link Viewer} or {@link CesiumWidget} render the scene to
 * get the draw commands needed to render this primitive.
 * <p>
 * Do not call this function directly.  This is documented just to
 * list the exceptions that may be propagated when the scene is rendered:
 * </p>
 */
Primitive.prototype.update = function (frameState) {

  ...

  var context = frameState.context;
  if (!defined(this._batchTable)) {
    createBatchTable(this, context);
  }
  if (this._batchTable.attributes.length > 0) {
    if (ContextLimits.maximumVertexTextureImageUnits === 0) {
      throw new RuntimeError(
        "Vertex texture fetch support is required to render primitives with per-instance attributes. The maximum number of vertex texture image units must be greater than zero."
      );
    }
    this._batchTable.update(frameState);
  }

  if (
    this._state !== PrimitiveState.COMPLETE &&
    this._state !== PrimitiveState.COMBINED
  ) {
    if (this.asynchronous) {
      loadAsynchronous(this, frameState);
    } else {
      loadSynchronous(this, frameState);
    }
  }

  if (this._state === PrimitiveState.COMBINED) {
    updateBatchTableBoundingSpheres(this, frameState);
    updateBatchTableOffsets(this, frameState);
    createVertexArray(this, frameState);
  }

  if (!this.show || this._state !== PrimitiveState.COMPLETE) {
    return;
  }

  if (!this._batchTableOffsetsUpdated) {
    updateBatchTableOffsets(this, frameState);
  }
  if (this._recomputeBoundingSpheres) {
    recomputeBoundingSpheres(this, frameState);
  }

  // Create or recreate render state and shader program if appearance/material changed
  var appearance = this.appearance;
  var material = appearance.material;
  var createRS = false;
  var createSP = false;

  if (this._appearance !== appearance) {
    this._appearance = appearance;
    this._material = material;
    createRS = true;
    createSP = true;
  } else if (this._material !== material) {
    this._material = material;
    createSP = true;
  }

  var depthFailAppearance = this.depthFailAppearance;
  var depthFailMaterial = defined(depthFailAppearance)
    ? depthFailAppearance.material
    : undefined;

  if (this._depthFailAppearance !== depthFailAppearance) {
    this._depthFailAppearance = depthFailAppearance;
    this._depthFailMaterial = depthFailMaterial;
    createRS = true;
    createSP = true;
  } else if (this._depthFailMaterial !== depthFailMaterial) {
    this._depthFailMaterial = depthFailMaterial;
    createSP = true;
  }

  var translucent = this._appearance.isTranslucent();
  if (this._translucent !== translucent) {
    this._translucent = translucent;
    createRS = true;
  }

  if (defined(this._material)) {
    this._material.update(context);
  }

  var twoPasses = appearance.closed && translucent;

  if (createRS) {
    var rsFunc = defaultValue(
      this._createRenderStatesFunction,
      createRenderStates
    );
    rsFunc(this, context, appearance, twoPasses);
  }

  if (createSP) {
    var spFunc = defaultValue(
      this._createShaderProgramFunction,
      createShaderProgram
    );
    spFunc(this, frameState, appearance);
  }

  if (createRS || createSP) {
    var commandFunc = defaultValue(
      this._createCommandsFunction,
      createCommands
    );
    commandFunc(
      this,
      appearance,
      material,
      translucent,
      twoPasses,
      this._colorCommands,
      this._pickCommands,
      frameState
    );
  }

  var updateAndQueueCommandsFunc = defaultValue(
    this._updateAndQueueCommandsFunction,
    updateAndQueueCommands
  );
  updateAndQueueCommandsFunc(
    this,
    frameState,
    this._colorCommands,
    this._pickCommands,
    this.modelMatrix,
    this.cull,
    this.debugShowBoundingVolume,
    twoPasses
  );
};
```


# <font color=red>成功添加之后，如何成功渲染?</font>

在函数 Scene.updateAndRenderPrimitives 内部，此函数会 在且仅在 Scene内部的两个函数内部执行： executeWebVRCommands(VR相关的内容暂时不研究08.11)， [executeCommandsInViewport(主要看这个)](#sceneprototypeexecutecommandsinviewport),<br/>
从而执行 [scene._primitives.update](#primitivecollectionprototypeupdateto-成功添加之后如何成功渲染) 方法。


```js
function updateAndRenderPrimitives(scene) {
  var frameState = scene._frameState;

  scene._groundPrimitives.update(frameState);
  scene._primitives.update(frameState);// 在这里执行 每个 Primitive 的 update 方法

  updateDebugFrustumPlanes(scene);
  updateShadowMaps(scene);

  if (scene._globe) {
    scene._globe.render(frameState);
  }
}
```

# Scene.prototype.executeCommandsInViewport

函数 executeCommandsInViewport 在 Scene 内部的 execute2DViewportCommands, Scene.prototype.updateAndExecuteCommands 这两个方法中 执行，且 execute2DViewportCommands 方法只在 Scene.prototype.updateAndExecuteCommands 中根据判断条件进行执行。

```js
function executeCommandsInViewport( firstViewport, scene, passState, backgroundColor) {
  var environmentState = scene._environmentState;
  var view = scene._view;
  var renderTranslucentDepthForPick = environmentState.renderTranslucentDepthForPick;// 这个变量在 Scene 初始化的时候 设置为 false

  if (!firstViewport && !renderTranslucentDepthForPick) {
    scene.frameState.commandList.length = 0;
  }

  if (!renderTranslucentDepthForPick) {
    updateAndRenderPrimitives(scene);// 在这里执行了 包含 primitives.update 的方法  updateAndRenderPrimitives
  }

  view.createPotentiallyVisibleSet(scene);

  if (firstViewport) {
    if (defined(backgroundColor)) {
      updateAndClearFramebuffers(scene, passState, backgroundColor);
    }
    if (!renderTranslucentDepthForPick) {
      executeComputeCommands(scene);
      executeShadowMapCastCommands(scene);
    }
  }

  executeCommands(scene, passState);
}
```

# Scene.prototype.updateAndExecuteCommands

函数 updateAndExecuteCommands 在且只在 [render函数](#sceneprototyperender) 中执行

```js
/**
 * @private
 */

Scene.prototype.updateAndExecuteCommands = function ( passState, backgroundColor ) {
  var frameState = this._frameState;
  var mode = frameState.mode;
  var useWebVR = this._environmentState.useWebVR;

  if (useWebVR) {
    executeWebVRCommands(this, passState, backgroundColor);
  } else if (
    mode !== SceneMode.SCENE2D ||
    this._mapMode2D === MapMode2D.ROTATE
  ) {
    executeCommandsInViewport(true, this, passState, backgroundColor);//在这里！
  } else {
    updateAndClearFramebuffers(this, passState, backgroundColor);
    execute2DViewportCommands(this, passState);
  }
};

```

# render in Scene.js

只在 [Scene.prototype.render](#sceneprototyperender) 中执行。

```js
function render(scene) {
  var frameState = scene._frameState;

  var context = scene.context;
  var us = context.uniformState;

  var view = scene._defaultView;
  scene._view = view;

  scene.updateFrameState();
  frameState.passes.render = true;
  frameState.passes.postProcess = scene.postProcessStages.hasSelected;
  frameState.tilesetPassState = renderTilesetPassState;

  var backgroundColor = defaultValue(scene.backgroundColor, Color.BLACK);
  if (scene._hdr) {
    backgroundColor = Color.clone(backgroundColor, scratchBackgroundColor);
    backgroundColor.red = Math.pow(backgroundColor.red, scene.gamma);
    backgroundColor.green = Math.pow(backgroundColor.green, scene.gamma);
    backgroundColor.blue = Math.pow(backgroundColor.blue, scene.gamma);
  }
  frameState.backgroundColor = backgroundColor;

  scene.fog.update(frameState);

  us.update(frameState);

  var shadowMap = scene.shadowMap;
  if (defined(shadowMap) && shadowMap.enabled) {
    if (!defined(scene.light) || scene.light instanceof SunLight) {
      // Negate the sun direction so that it is from the Sun, not to the Sun
      Cartesian3.negate(us.sunDirectionWC, scene._shadowMapCamera.direction);
    } else {
      Cartesian3.clone(scene.light.direction, scene._shadowMapCamera.direction);
    }
    frameState.shadowMaps.push(shadowMap);
  }

  scene._computeCommandList.length = 0;
  scene._overlayCommandList.length = 0;

  var viewport = view.viewport;
  viewport.x = 0;
  viewport.y = 0;
  viewport.width = context.drawingBufferWidth;
  viewport.height = context.drawingBufferHeight;

  var passState = view.passState;
  passState.framebuffer = undefined;
  passState.blendingEnabled = undefined;
  passState.scissorTest = undefined;
  passState.viewport = BoundingRectangle.clone(viewport, passState.viewport);

  if (defined(scene.globe)) {
    scene.globe.beginFrame(frameState);
  }

  scene.updateEnvironment();
  scene.updateAndExecuteCommands(passState, backgroundColor);//在这里执行的 updateAndExecuteCommands 方法
  scene.resolveFramebuffers(passState);

  passState.framebuffer = undefined;
  executeOverlayCommands(scene, passState);

  if (defined(scene.globe)) {
    scene.globe.endFrame(frameState);

    if (!scene.globe.tilesLoaded) {
      scene._renderRequested = true;
    }
  }

  context.endFrame();
}
```

# Scene.prototype.render

```js
//为了方便阅读
function tryAndCatchError(scene, functionToExecute) {
  try {
    functionToExecute(scene);
  } catch (error) {
    scene._renderError.raiseEvent(scene, error);

    if (scene.rethrowRenderErrors) {
      throw error;
    }
  }
}

/**
 * Update and render the scene. It is usually not necessary to call this function
 * directly because {@link CesiumWidget} or {@link Viewer} do it automatically.
 * @param {JulianDate} [time] The simulation time at which to render.
 */
Scene.prototype.render = function (time) {
  /**
   *
   * Pre passes update. Execute any pass invariant code that should run before the passes here.
   *
   */
  this._preUpdate.raiseEvent(this, time);

  var frameState = this._frameState;
  frameState.newFrame = false;

  if (!defined(time)) {
    time = JulianDate.now();
  }

  // Determine if shouldRender
  var cameraChanged = this._view.checkForCameraUpdates(this);
  var shouldRender =
    !this.requestRenderMode ||
    this._renderRequested ||
    cameraChanged ||
    this._logDepthBufferDirty ||
    this._hdrDirty ||
    this.mode === SceneMode.MORPHING;
  if (
    !shouldRender &&
    defined(this.maximumRenderTimeChange) &&
    defined(this._lastRenderTime)
  ) {
    var difference = Math.abs(
      JulianDate.secondsDifference(this._lastRenderTime, time)
    );
    shouldRender = shouldRender || difference > this.maximumRenderTimeChange;
  }

  ...

  if (shouldRender) {
    this._preRender.raiseEvent(this, time);
    frameState.creditDisplay.beginFrame();
    tryAndCatchError(this, render);// 在这里执行 render 函数
  }

  ...

};
```