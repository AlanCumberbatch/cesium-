```js
  /*
   * @typedef {Object} RectangleGraphics.ConstructorOptions
   *
   * Initialization options for the RectangleGraphics constructor
   *
   * @property {Property | Rectangle} [coordinates] The Property specifying the {@link Rectangle}. //? 接收一个 RectangleGeometry的实例
   * @property {Property | number} [granularity=Cesium.Math.RADIANS_PER_DEGREE] A numeric Property specifying the angular distance between points on the rectangle.


   * @property {Property | boolean} [show=true] A boolean Property specifying the visibility of the rectangle.
   * @property {Property | number} [height=0] A numeric Property specifying the altitude of the rectangle relative to the ellipsoid surface.
   * @property {Property | HeightReference} [heightReference=HeightReference.NONE] A Property specifying what the height is relative to.
   * @property {Property | number} [extrudedHeight] A numeric Property specifying the altitude of the rectangle's extruded face relative to the ellipsoid surface.
   * @property {Property | HeightReference} [extrudedHeightReference=HeightReference.NONE] A Property specifying what the extrudedHeight is relative to.
   * @property {Property | number} [rotation=0.0] A numeric property specifying the rotation of the rectangle clockwise from north.
   * @property {Property | number} [stRotation=0.0] A numeric property specifying the rotation of the rectangle texture counter-clockwise from north.
   * @property {Property | boolean} [fill=true] A boolean Property specifying whether the rectangle is filled with the provided material.
   * @property {MaterialProperty | Color} [material=Color.WHITE] A Property specifying the material used to fill the rectangle.
   * @property {Property | boolean} [outline=false] A boolean Property specifying whether the rectangle is outlined.
   * @property {Property | Color} [outlineColor=Color.BLACK] A Property specifying the {@link Color} of the outline.
   * @property {Property | number} [outlineWidth=1.0] A numeric Property specifying the width of the outline.
   * @property {Property | ShadowMode} [shadows=ShadowMode.DISABLED] An enum Property specifying whether the rectangle casts or receives shadows from light sources.
   * @property {Property | DistanceDisplayCondition} [distanceDisplayCondition] A Property specifying at what distance from the camera that this rectangle will be displayed.
   * @property {Property | ClassificationType} [classificationType=ClassificationType.BOTH] An enum Property specifying whether this rectangle will classify terrain, 3D Tiles, or both when on the ground.
   * @property {Property | number} [zIndex=0] A Property specifying the zIndex used for ordering ground geometry.  Only has an effect if the rectangle is constant and neither height or extrudedHeight are specified.
  */

```