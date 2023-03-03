#### How Path Move Smoothly in Cesium

```js
  // create a path can move smoothly
  const pathPosition = new Cesium.SampledPositionProperty();
  const entityPath = viewer.entities.add({
    position: pathPosition,
    name: "path",
    path: {
      show: true,
      leadTime: 0,
      trailTime: 60,
      width: 10,
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        taperPower: 0.3,
        color: Cesium.Color.PALEGOLDENROD,
      }),
    },
  });
  viewer.scene.preUpdate.addEventListener(function (scene, time) {
    // position = Cesium.Matrix4.multiplyByPoint( planePrimitive.modelMatrix, speedVector, position );
    pathPosition.addSample(Cesium.JulianDate.now(), position);//! 这里
    // Cesium.Transforms.headingPitchRollToFixedFrame( position, hpRoll, Cesium.Ellipsoid.WGS84, fixedFrameTransform, planePrimitive.modelMatrix );
  });
```

### 关键在于 Cesium 在渲染时： 每一帧(每渲染一次)如何在Cesium.SampledPositionProperty的实例 中得到对应的数据，使得 Path 如此顺滑的前行

相关函数：
* A
- this._dataSourceDisplay.defaultDataSource.entities= new EntityCollection();
- DataSourceDisplay.prototype.update(Entity transferTo Primitive 的关键函数)
- function updateTrackedEntity [in Veiwer]
- Viewer.prototype._postRender//instanceof Event, called by ~.raiseEvent()
- function render [in Sccene]

* B
- fireChangedEvent // in EntityCollection
- startRenderLoop // Widget
- CesiumWidget.prototype.render
- Scene.prototype.render
- function render [in Sccene]

```js
// in Scene #3713
function render(scene) {
  const frameState = scene._frameState;//? 所有的当前帧要渲染的状态都在 frameState 里面 --- frameState 哪里更新的状态？

  const context = scene.context;
  const us = context.uniformState;//？

  const view = scene._defaultView;
  scene._view = view;//？ view 的初始化

  scene.updateFrameState();
  frameState.passes.render = true;
  frameState.passes.postProcess = scene.postProcessStages.hasSelected;
  frameState.tilesetPassState = renderTilesetPassState;

  let backgroundColor = defaultValue(scene.backgroundColor, Color.BLACK);
  if (scene._hdr) {
    backgroundColor = Color.clone(backgroundColor, scratchBackgroundColor);
    backgroundColor.red = Math.pow(backgroundColor.red, scene.gamma);
    backgroundColor.green = Math.pow(backgroundColor.green, scene.gamma);
    backgroundColor.blue = Math.pow(backgroundColor.blue, scene.gamma);
  }
  frameState.backgroundColor = backgroundColor;

  scene.fog.update(frameState);

  us.update(frameState);

  const shadowMap = scene.shadowMap;
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

  const viewport = view.viewport;
  viewport.x = 0;
  viewport.y = 0;
  viewport.width = context.drawingBufferWidth;
  viewport.height = context.drawingBufferHeight;

  const passState = view.passState;
  passState.framebuffer = undefined;
  passState.blendingEnabled = undefined;
  passState.scissorTest = undefined;
  passState.viewport = BoundingRectangle.clone(viewport, passState.viewport);

  if (defined(scene.globe)) {
    scene.globe.beginFrame(frameState);
  }

  scene.updateEnvironment();
  scene.updateAndExecuteCommands(passState, backgroundColor);
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