<!--
  我这么记的意义在哪里呢？？？？
    我想知道 Entity 的内部具体的逻辑，很具体的那种
    看过一遍之后，发现 raiseEvent 事件对应的 addEventlistener 具体在哪里加的有点儿找不到，所以打算从 Viewer 从新开始看

    但是刚才去接水，发现自己这么写好像是没什么意义呢！！！！！
    所以我觉得我应该先思考一下：
      关于字体颜色：((08.12 暂时先不要颜色了))
        orange - 类的实例
        green - 类 in Cesium
        skyblue - 关键方法
        pink - 关键参数
      这里面有哪些内容需要区分啊？？
        我根本上是想将这条线串起来，期间，涉及到 Cesium 内部的很多类，还有一些参数，然后还有对应的类的内部会使用到的关键方法，

      关于这些细枝末节，无关紧要的事情先不管，把主线先牵出来

 -->

# 结论/conclusion

视图更新关键函数：
  - [fireChangedEvent](#firechangedevent)

最终的关键属性:

  - [this.trackedEntity( mainly )](#viewerprototypetrackedentity)
  - [this.selectedEntity](#viewerprototypeselectedentity)

但是就目前发现的内容，和 Primitive API 没有一毛钱关系啊！！！
# 应用案例： polyline

var viewer = new Cesium.Viewer("cesiumContainer");

var redLine = [viewer](#viewer).[entities](#viewer).[add](#entitycollectionprototypeadd)({<br/>
&emsp;name: "Red line on terrain",<br/>
&emsp;[polyline](#font-colorred在-entityprototype-上定义和时间相关的响应式属性-------动态根据输入的-polyline-属性-成功生成-polyline-模型的关键font): {<br/>
&emsp;&emsp;positions: Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]),<br/>
&emsp;&emsp;width: 5,<br/>
&emsp;&emsp;material: Cesium.Color.RED,<br/>
&emsp;&emsp;clampToGround: true,<br/>
&emsp;},<br/>
});<br/>
<br/>
<br/>
<br/>

# 源码解读： 从 Viewer 内部开始（粗略，具体还需参考实际源码）
# Viewer

```js
/**
 * A base widget for building applications.  It composites(混合成的, 综合成的) all of the standard Cesium widgets into one reusable(可重复使用的) package.
 * The widget can always be extended by using mixins, which add functionality useful for a variety of applications.
 *
 * @alias Viewer
 * @constructor
 *
 * @param {Element|String} container The DOM element or ID that will contain the widget.
 * @param {Viewer.ConstructorOptions} [options] Object describing initialization options
 *
 * @exception {DeveloperError} Element with id "container" does not exist in the document.
 * @exception {DeveloperError} options.selectedImageryProviderViewModel is not available when not using the BaseLayerPicker widget, specify options.imageryProvider instead.
 * @exception {DeveloperError} options.selectedTerrainProviderViewModel is not available when not using the BaseLayerPicker widget, specify options.terrainProvider instead.
 *
 */
function Viewer(container, options) {

  var context = new Context(canvas, contextOptions);
  this._jobScheduler = new JobScheduler();
  // function FrameState(context, creditDisplay, jobScheduler)
  this._frameState = new FrameState(
    context,
    new CreditDisplay(creditContainer, " • ", creditViewport),
    this._jobScheduler
  );

  // dataSourceCollection
  var dataSourceCollection = options.dataSources;
  var destroyDataSourceCollection = false;
  if (!defined(dataSourceCollection)) {
    dataSourceCollection = new DataSourceCollection();
    destroyDataSourceCollection = true;
  }

  // dataSourceDisplay
  var dataSourceDisplay = new DataSourceDisplay({
    scene: scene,
    dataSourceCollection: dataSourceCollection,
  });

  // _dataSourceDisplay
  this._dataSourceDisplay = dataSourceDisplay;

  ...

  this._entityView = undefined;

  // We need to subscribe to the data sources and collections so that we can clear the
  // tracked object when it is removed from the scene.
  // Subscribe to current data sources
  var dataSourceLength = dataSourceCollection.length;
  for (var i = 0; i < dataSourceLength; i++) {
    this._dataSourceAdded(dataSourceCollection, dataSourceCollection.get(i));
  }
  this._dataSourceAdded(undefined, dataSourceDisplay.defaultDataSource);

  // EventHelper.prototype.add = function (event, listener, scope)
  // Hook up events so that we can subscribe to future sources.
  eventHelper.add(
    dataSourceCollection.dataSourceAdded,
    Viewer.prototype._dataSourceAdded,
    this
  );
  eventHelper.add(
    dataSourceCollection.dataSourceRemoved,
    Viewer.prototype._dataSourceRemoved,
    this
  );

  //EventHelper.prototype.add = function (event, listener, scope)
  eventHelper.add(scene.postUpdate, Viewer.prototype.resize, this);//???
  eventHelper.add(scene.postRender, Viewer.prototype._postRender, this);

}

Object.defineProperties(Viewer.prototype, {
/**
   * Gets the collection of entities not tied to a particular data source.
   * This is a shortcut to [dataSourceDisplay.defaultDataSource.entities]{@link Viewer#dataSourceDisplay}.
   * @memberof Viewer.prototype
   * @type {EntityCollection}
   * @readonly
   */
  entities: {
    get: function () {
      return this._dataSourceDisplay.defaultDataSource.entities;
    },
  },

}
```
相关函数查看链接：
  - [DataSourceDisplay](#datasourcedisplay)
  - [EventHelper](#eventhelper)
  - [EventHelper.add](#eventhelperprototypeadd)
  - [Viewer.prototype.dataSourceAdded](#viewerprototypedatasourceadded)
  - [Viewer.prototype.dataSourceRemoved](#viewerprototypedatasourceremoved)

## Viewer.prototype.dataSourceAdded

方法实际是 Viewer.prototype._dataSourceAdded 但是在锚点处写的话，不能正常跳转

只在 Viewer 初始化的时候使用了。

[to Viewer](#viewer)<br/>

```js
/**
 * @private
 */
Viewer.prototype._dataSourceAdded = function ( dataSourceCollection, dataSource ) {
  var entityCollection = dataSource.entities;
  // Event.prototype.addEventListener = function (listener, scope)
  // 添加监听事件是添加到  entityCollection.collectionChanged 上，想要调取/执行的话，需要 entityCollection.collectionChanged.raiseEvent(...)
  entityCollection.collectionChanged.addEventListener(// entityCollection.collectionChanged 是 Event 的实例
    Viewer.prototype._onEntityCollectionChanged,
    this
  );
};
```
## Viewer.prototype.dataSourceRemoved

方法实际是 Viewer.prototype._dataSourceRemoved 但是在锚点处写的话，不能正常跳转

只在 Viewer.prototype.destroy 和 Viewer 初始化的时候 使用了

[to Viewer](#viewer)<br/>

```js
/**
 * @private
 */
Viewer.prototype._dataSourceRemoved = function (
  dataSourceCollection,
  dataSource
) {
  var entityCollection = dataSource.entities;
  entityCollection.collectionChanged.removeEventListener(
    Viewer.prototype._onEntityCollectionChanged,
    this
  );

  if (defined(this.trackedEntity)) {
    if (
      entityCollection.getById(this.trackedEntity.id) === this.trackedEntity
    ) {
      this.trackedEntity = undefined;
    }
  }

  if (defined(this.selectedEntity)) {
    if (
      entityCollection.getById(this.selectedEntity.id) === this.selectedEntity
    ) {
      this.selectedEntity = undefined;
    }
  }
};
```

## Viewer.prototype._onEntityCollectionChanged

```js
/**
 * @private
 */
Viewer.prototype._onEntityCollectionChanged = function ( collection, added, removed ) {
  var length = removed.length;
  for (var i = 0; i < length; i++) {
    var removedObject = removed[i];
    if (this.trackedEntity === removedObject) {
      this.trackedEntity = undefined;
    }
    if (this.selectedEntity === removedObject) {
      this.selectedEntity = undefined;
    }
  }
};
```

this.trackedEntity, this.selectedEntity 这两个属性 通过 knockout 进行了监听，同时本身也是监听器属性，在set时会进行 相关操作

相关函数查看链接：
  - [this.trackedEntity](#viewerprototypetrackedentity)
  - [this.selectedEntity](#viewerprototypeselectedentity)

## Viewer.prototype.trackedEntity

```js
  /**
   * Gets or sets the Entity instance currently being tracked by the camera.
   * @memberof Viewer.prototype
   * @type {Entity | undefined}
   */
  trackedEntity: {
    get: function () {
      return this._trackedEntity;
    },
    set: function (value) {
      if (this._trackedEntity !== value) {
        this._trackedEntity = value;

        //Cancel any pending zoom
        cancelZoom(this);

        var scene = this.scene;
        var sceneMode = scene.mode;

        //Stop tracking
        if (!defined(value) || !defined(value.position)) {
          this._needTrackedEntityUpdate = false;
          if (
            sceneMode === SceneMode.COLUMBUS_VIEW ||
            sceneMode === SceneMode.SCENE2D
          ) {
            // * If true, allows the user to pan around the map.  If false, the camera stays locked at the current position.
            //* This flag only applies in 2D and Columbus view modes.
            scene.screenSpaceCameraController.enableTranslate = true;
          }

          if (
            sceneMode === SceneMode.COLUMBUS_VIEW ||
            sceneMode === SceneMode.SCENE3D
          ) {
            //* If true, allows the user to tilt the camera.  If false, the camera is locked to the current heading.
            //* This flag only applies in 3D and Columbus view.
            scene.screenSpaceCameraController.enableTilt = true;
          }

          // 只有在函数 updateTrackedEntity 中会被赋值，viewer._entityView = new EntityView(...)，
          //     ---》 updateTrackedEntity 只在 Viewer.prototype._postRender 中被调用
          //紧接着跟了一句 viewer._entityView.update ---》 * Should be called each animation frame to update the camera
          this._entityView = undefined;

          // * Sets the camera position and orientation using a target and transformation matrix.
          this.camera.lookAtTransform(Matrix4.IDENTITY);

        } else {
          //We can't start tracking immediately, so we set a flag and start tracking
          //when the bounding sphere is ready (most likely next frame).
          this._needTrackedEntityUpdate = true;
        }

        this._trackedEntityChanged.raiseEvent(value);//?????

        // change this._renderRequested to true ,
        // aiming to set the value of shouldRender in function Scene.prototype.render to true,
        // in another words, in order to requests a new rendered frame
        this.scene.requestRender();
        //! how to execute Scene.prototype.render after this ? 08.16
      }
    },
  },
```
相关函数查看链接：
  - [function in Viewer: updateTrackedEntity](#function-in-viewer-updatetrackedentity)
  - [EventHelper](#eventhelper)

## Viewer.prototype.selectedEntity

```js
  /**
   * Gets or sets the object instance for which to display a selection indicator.
   *
   * If a user interactively picks a Cesium3DTilesFeature instance, then this property
   * will contain a transient Entity instance with a property named "feature" that is
   * the instance that was picked.
   * @memberof Viewer.prototype
   * @type {Entity | undefined}
   */
  selectedEntity: {
    get: function () {
      return this._selectedEntity;
    },
    set: function (value) {
      if (this._selectedEntity !== value) {
        this._selectedEntity = value;
        var selectionIndicatorViewModel = defined(this._selectionIndicator)
          ? this._selectionIndicator.viewModel
          : undefined;
        if (defined(value)) {
          if (defined(selectionIndicatorViewModel)) {
            selectionIndicatorViewModel.animateAppear();
          }
        } else if (defined(selectionIndicatorViewModel)) {
          // Leave the info text in place here, it is needed during the exit animation.
          selectionIndicatorViewModel.animateDepart();
        }
        this._selectedEntityChanged.raiseEvent(value);
      }
    },
  },
```

<!-- ## Viewer.entities

entities: {<br/>
&emsp;get: function () {<br/>
&emsp;&emsp;return this._dataSourceDisplay.[defaultDataSource](#font-colorgreendatasourcedisplayfont).[entities](#font-colorgreencustomdatasourcefont);<br/>
&emsp;},<br/>
},<br/>
<br/>
<br/>

this._dataSourceDisplay = dataSourceDisplay;
<br/>
<br/>

var dataSourceDisplay = new [DataSourceDisplay](#font-colorgreendatasourcedisplayfont)({<br/>
&emsp;scene: scene,<br/>
&emsp;dataSourceCollection: [dataSourceCollection](dataSourceCollection.md),<br/>
});<br/>
<br/>

var dataSourceCollection = options.dataSources;<br/>
if (!defined(dataSourceCollection)) {<br/>
&emsp;dataSourceCollection = new DataSourceCollection();<br/>
}<br/> -->

## function in Viewer: updateTrackedEntity

[to Viewer](#viewer)

```js
function updateTrackedEntity(viewer) {

  var trackedEntity = viewer._trackedEntity;
  var currentTime = viewer.clock.currentTime;

  ...

  var bs = state !== BoundingSphereState.FAILED ? boundingSphereScratch : undefined;

  viewer._entityView = new EntityView(
    trackedEntity,
    scene,
    scene.mapProjection.ellipsoid
  );
  viewer._entityView.update(currentTime, bs);// 这句话
  viewer._needTrackedEntityUpdate = false;

}

```

<!-- [EntityView]() -->

## Viewer.prototype._postRender

```js
/**
 * @private
 */
Viewer.prototype._postRender = function () {
  updateZoomTarget(this);
  updateTrackedEntity(this);// about this.trackedEntity
};
```
# DataSourceDisplay

```js
/**
 * Visualizes a collection of {@link DataSource} instances.
 * @alias DataSourceDisplay
 * @constructor
 *
 * @param {Object} options Object with the following properties:
 * @param {Scene} options.scene The scene in which to display the data.
 * @param {DataSourceCollection} options.dataSourceCollection The data sources to display.
 * @param {DataSourceDisplay.VisualizersCallback} [options.visualizersCallback=DataSourceDisplay.defaultVisualizersCallback]
 *        A function which creates an array of visualizers used for visualization.
 *        If undefined, all standard visualizers are used.
 */
function DataSourceDisplay(options) {

  var defaultDataSource = new CustomDataSource();
  this._defaultDataSource = defaultDataSource;

  ...
}

Object.defineProperties(DataSourceDisplay.prototype, {
  /**
   * Gets the default data source instance which can be used to
   * manually create and visualize entities not tied to
   * a specific data source. This instance is always available
   * and does not appear in the list dataSources collection.
   * @memberof DataSourceDisplay.prototype
   * @type {CustomDataSource}
   */
  defaultDataSource: {
    get: function () {
      return this._defaultDataSource;
    },
  },

  ...

})
```
<br/>

# CustomDataSource

```js
/**
 * A {@link DataSource} implementation which can be used to manually manage a group of entities.
 *
 * @alias CustomDataSource
 * @constructor
 *
 * @param {String} [name] A human-readable name for this instance.
 *
 */
function CustomDataSource(name) {
  this._name = name;
  this._clock = undefined;
  this._changed = new Event();
  this._error = new Event();
  this._isLoading = false;
  this._loading = new Event();
  this._entityCollection = new EntityCollection(this);//
  this._entityCluster = new EntityCluster();
}

Object.defineProperties(CustomDataSource.prototype, {
  /**
   * Gets the collection of {@link Entity} instances.
   * @memberof CustomDataSource.prototype
   * @type {EntityCollection}
   */
  entities: {
    get: function () {
      return this._entityCollection;//
    },
  },

  ...
})
```

<br/>

# EntityCollection

```js
/**
 * Add an entity to the collection.
 *
 * @param {Entity | Entity.ConstructorOptions} entity The entity to be added.
 * @returns {Entity} The entity that was added.
 * @exception {DeveloperError} An entity with <entity.id> already exists in this collection.
 */
  function EntityCollection(owner) {
    this._owner = owner;
    this._entities = new AssociativeArray();//
    this._addedEntities = new AssociativeArray();
    this._removedEntities = new AssociativeArray();
    this._changedEntities = new AssociativeArray();
    this._suspendCount = 0;
    this._collectionChanged = new Event();//!
    this._id = createGuid();
    this._show = true;
    this._firing = false;
    this._refire = false;
  }

  Object.defineProperties(EntityCollection.prototype, {
    /**
     * Gets the event that is fired when entities are added or removed from the collection.
     * The generated event is a {@link EntityCollection.collectionChangedEventCallback}.
     * @memberof EntityCollection.prototype
     * @readonly
     * @type {Event}
     */
    collectionChanged: {
      get: function () {
        return this._collectionChanged;
      },
    },

    ...

  });
```
### EntityCollection.prototype.add

```js
/**
 * Add an entity to the collection.
 *
 * @param {Entity | Entity.ConstructorOptions} entity The entity to be added.
 * @returns {Entity} The entity that was added.
 * @exception {DeveloperError} An entity with <entity.id> already exists in this collection.
 */
EntityCollection.prototype.add = function (entity) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(entity)) {
    throw new DeveloperError("entity is required.");
  }
  //>>includeEnd('debug');

  if (!(entity instanceof Entity)) {
    entity = new Entity(entity);//在这里将传入的 option 转换成 Entity
  }

  var id = entity.id;//如果 id 没传，会自动生成一个 Guid,在  new Entity 那步
  var entities = this._entities;// this._entities = new AssociativeArray(),获取当前实例中的 entity 的集合 位置所在，然后进行添加操作
  if (entities.contains(id)) {
    throw new RuntimeError(
      "An entity with id " + id + " already exists in this collection."
    );
  }

  entity.entityCollection = this;
  entities.set(id, entity);//新增一个 entity，id 为 key

  //如果有 id  一致的，删除后新增，如果没有，单纯的新增（当前函数已经判定 没有）
  if (!this._removedEntities.remove(id)) {//返回值是Boolean，代表 this._removedEntities 中是否存在 对应 id 的 Entity，如果存在，会在函数内部执行删除操作
    this._addedEntities.set(id, entity);
  }

  // 在 entity.definitionChanged 内部调用栈中 push 进一个事件监听
  // entity.definitionChanged = new Event();   ～.addEventListener(listener,scope) ---return removeListener function
  // entity.definitionChanged.raiseEvent was executed in Entity's function below
  entity.definitionChanged.addEventListener(
    EntityCollection.prototype._onEntityDefinitionChanged,
    this
  );

  // 在该函数内部执行更新视图操作
  fireChangedEvent(this);// link is listed below
  return entity;
};
```

相关函数文档内部跳转查看链接：
- [Entity](#entity)
- [AssociativeArray](#associativearray)
- EntityCollection.prototype._onEntityDefinitionChanged(Just Next to here )
- [fireChangedEvent](#firechangedevent)
## EntityCollection.prototype._onEntityDefinitionChanged

```js
EntityCollection.prototype._onEntityDefinitionChanged = function (entity) {
  var id = entity.id;
  if (!this._addedEntities.contains(id)) {
    this._changedEntities.set(id, entity);
  }
  fireChangedEvent(this);
};
```

# fireChangedEvent

```js
function fireChangedEvent(collection) {
  if (collection._firing) { // _firing 变量 直在 此函数 和  EntityCollection 函数中出现了 ，共 4 次，默认： false
    collection._refire = true;// _refire 变量 直在 此函数 和  EntityCollection 函数中出现了 ，共 4 次，默认： false
    return;
  }

  if (collection._suspendCount === 0) {
    var added = collection._addedEntities;
    var removed = collection._removedEntities;
    var changed = collection._changedEntities;
    if (changed.length !== 0 || added.length !== 0 || removed.length !== 0) {
      collection._firing = true;
      do {
        collection._refire = false;
        var addedArray = added.values.slice(0);
        var removedArray = removed.values.slice(0);
        var changedArray = changed.values.slice(0);

        added.removeAll();
        removed.removeAll();
        changed.removeAll();
        collection._collectionChanged.raiseEvent(//在哪里设置的 事件监听呢？？： Viewer.prototype._dataSourceAdded， Viewer.prototype._dataSourceRemoved
          collection,
          addedArray,
          removedArray,
          changedArray
        );
      } while (collection._refire);
      collection._firing = false;
    }
  }
}
```
相关函数文档内部跳转查看链接：
- [Viewer.prototype._dataSourceAdded](#viewerprototypedatasourceadded)
- [Viewer.prototype._dataSourceRemoved](#viewerprototypedatasourceremoved)
- [EntityCollection.prototype.add](#entitycollectionprototypeadd)
- [Viewer.prototype._onEntityCollectionChanged](#viewerprototypeonentitycollectionchanged)

<br/><br/>

# Entity

```js
/**
 * Entity instances aggregate multiple forms of visualization into a single high-level object.
 * They can be created manually and added to {@link Viewer#entities} or be produced by
 * data sources, such as {@link CzmlDataSource} and {@link GeoJsonDataSource}.
 * @alias Entity
 * @constructor
 *
 * @param {Entity.ConstructorOptions} [options] Object describing initialization options
 *
 * @see {@link https://cesium.com/docs/tutorials/creating-entities/|Creating Entities}
 */
function Entity(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  var id = options.id;
  if (!defined(id)) {
    id = createGuid();
  }

  this._availability = undefined;
  this._id = id;
  this._definitionChanged = new Event();// definitionChanged 相关
  this._name = options.name;// 传入的 name
  this._show = defaultValue(options.show, true);
  this._parent = undefined;
  this._propertyNames = [
    "billboard","box","corridor","cylinder","description","ellipse", //
    "ellipsoid","label","model","tileset","orientation","path","plane","point","polygon", //
    "polyline","polylineVolume","position","properties","rectangle","viewFrom","wall",
  ];// 用于 下方 merge 方法中

  this._billboard = undefined;
  ... // and others geometr

  this._children = [];

  /**
   * Gets or sets the entity collection that this entity belongs to.
   * @type {EntityCollection}
   */
  this.entityCollection = undefined;

  this.parent = options.parent;
  this.merge(options);// 通过 merge 方法 对属性进行初始化，内部结合了 传进来的 options
}
```
#### ***<font color=red>在 Entity.prototype 上定义和时间相关的响应式属性 - - - 动态根据输入的 polyline 属性 成功生成 Polyline 模型的关键</font>***

```js
Object.defineProperties(Entity.prototype, {
  /**
   * Gets or sets the polyline.
   * @memberof Entity.prototype
   * @type {PolylineGraphics|undefined}
   */
  polyline: createPropertyTypeDescriptor("polyline", PolylineGraphics),
  /**
   * Gets or sets the polyline volume.
   * @memberof Entity.prototype
   * @type {PolylineVolumeGraphics|undefined}
   */
  properties: createPropertyTypeDescriptor("properties", PropertyBag),
  /**
   * Gets or sets the position.
   * @memberof Entity.prototype
   * @type {PositionProperty|undefined}
   */
  position: createPositionPropertyDescriptor("position"),

  ...

 /**
   * Gets the event that is raised whenever a property or sub-property is changed or modified.
   * @memberof Entity.prototype
   *
   * @type {Event}
   * @readonly
   */
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },

});
```

<br/>

#### [createPropertyTypeDescriptor(just click)](createPropertyTypeDescriptor.md)

## Entity.prototype.merge

在这个方法里完成 当前 Entity 实例的属性的初始化

```js
/**
 * Assigns each unassigned property on this object to the value
 * of the same property on the provided source object.
 *
 * @param {Entity} source The object to be merged into this object.
 */

Entity.prototype.merge = function (source) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(source)) {
    throw new DeveloperError("source is required.");
  }
  //>>includeEnd('debug');

  //Name, show, and availability are not Property objects and are currently handled differently.
  //source.show is intentionally ignored because this.show always has a value.
  this.name = defaultValue(this.name, source.name);
  this.availability = defaultValue(this.availability, source.availability);

  var propertyNames = this._propertyNames;
  var sourcePropertyNames = defined(source._propertyNames) ? source._propertyNames : Object.keys(source);
  var propertyNamesLength = sourcePropertyNames.length;

  for (var i = 0; i < propertyNamesLength; i++) {
    var name = sourcePropertyNames[i];

    //While source is required by the API to be an Entity, we internally call this method from the
    //constructor with an options object to configure initial custom properties.
    //So we need to ignore reserved-non-property.
    if (name === "parent" || name === "name" || name === "availability") {
      continue;
    }

    var targetProperty = this[name];
    var sourceProperty = source[name];

    //Custom properties that are registered on the source entity must also
    //get registered on this entity.
    if (!defined(targetProperty) && propertyNames.indexOf(name) === -1) {
      this.addProperty(name);
    }

    if (defined(sourceProperty)) {
      if (defined(targetProperty)) {
        if (defined(targetProperty.merge)) {
          targetProperty.merge(sourceProperty);
        }
      } else if (defined(sourceProperty.merge) && defined(sourceProperty.clone)) {
        this[name] = sourceProperty.clone();
      } else {
        this[name] = sourceProperty;
      }
    }
  }
};
```
<br/>

# AssociativeArray

```js
/**
 * A collection of key-value pairs that is stored as a hash for easy
 * lookup but also provides an array for fast iteration.
 * @alias AssociativeArray
 * @constructor
 */
function AssociativeArray() {
  this._array = [];
  this._hash = {};
}

AssociativeArray.prototype.contains = function (key){}
AssociativeArray.prototype.get = function (key){}
AssociativeArray.prototype.set = function (key){}
AssociativeArray.prototype.remove = function (key){}
AssociativeArray.prototype.removeAll = function (key){}
```
### AssociativeArray.prototype.**set**

```js
/**
 * Associates the provided key with the provided value.  If the key already
 * exists, it is overwritten with the new value.
 *
 * @param {String|Number} key A unique identifier.
 * @param {*} value The value to associate with the provided key.
 */
AssociativeArray.prototype.set = function (key, value) {
  //>>includeStart('debug', pragmas.debug);
  if (typeof key !== "string" && typeof key !== "number") {
    throw new DeveloperError("key is required to be a string or number.");
  }
  //>>includeEnd('debug');

  var oldValue = this._hash[key];
  if (value !== oldValue) {
    this.remove(key);
    this._hash[key] = value;
    this._array.push(value);
  }
};
```

# Event

```js
/**
 * A generic utility class for managing subscribers for a particular event.
 * This class is usually instantiated inside of a container class and
 * exposed as a property for others to subscribe to.
 *
 * @alias Event
 * @constructor
 * @example
 * MyObject.prototype.myListener = function(arg1, arg2) {
 *     this.myArg1Copy = arg1;
 *     this.myArg2Copy = arg2;
 * }
 *
 * var myObjectInstance = new MyObject();
 * var evt = new Cesium.Event();
 * evt.addEventListener(MyObject.prototype.myListener, myObjectInstance);
 * evt.raiseEvent('1', '2');
 * evt.removeEventListener(MyObject.prototype.myListener);
 */
function Event() {
  this._listeners = [];
  this._scopes = [];
  this._toRemove = [];
  this._insideRaiseEvent = false;
}
```

### Event.prototype.addEventListener

```js
/**
 * Registers a callback function to be executed whenever the event is raised.
 * An optional scope can be provided to serve as the <code>this</code> pointer
 * in which the function will execute.
 *
 * @param {Function} listener The function to be executed when the event is raised.
 * @param {Object} [scope] An optional object scope to serve as the <code>this</code>
 *        pointer in which the listener function will execute.
 * @returns {Event.RemoveCallback} A function that will remove this event listener when invoked.
 *
 * @see Event#raiseEvent
 * @see Event#removeEventListener
 */
Event.prototype.addEventListener = function (listener, scope) {
  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.func("listener", listener);
  //>>includeEnd('debug');

  this._listeners.push(listener);
  this._scopes.push(scope);

  var event = this;
  return function () {
    event.removeEventListener(listener, scope);
  };
};
```

### Event.prototype.raiseEvent

```js
/**
 * Raises the event by calling each registered listener with all supplied arguments.
 *
 * @param {...Object} arguments This method takes any number of parameters and passes them through to the listener functions.
 *
 * @see Event#addEventListener
 * @see Event#removeEventListener
 */
Event.prototype.raiseEvent = function () {
  this._insideRaiseEvent = true;

  var i;
  var listeners = this._listeners;
  var scopes = this._scopes;
  var length = listeners.length;

  //TODO 我感觉咋都调用了呢？？就塞到里面的函数都执行了，按说就只执行一个啊应该
  for (i = 0; i < length; i++) {
    var listener = listeners[i];
    if (defined(listener)) {
      listeners[i].apply(scopes[i], arguments);
    }
  }

  //Actually remove items removed in removeEventListener.
  var toRemove = this._toRemove;
  length = toRemove.length;
  if (length > 0) {
    toRemove.sort(compareNumber);
    for (i = 0; i < length; i++) {
      var index = toRemove[i];
      listeners.splice(index, 1);
      scopes.splice(index, 1);
    }
    toRemove.length = 0;
  }

  this._insideRaiseEvent = false;
};
```
### Event.prototype.removeEventListener

```js
/**
 * Unregisters a previously registered callback.
 *
 * @param {Function} listener The function to be unregistered.
 * @param {Object} [scope] The scope that was originally passed to addEventListener.
 * @returns {Boolean} <code>true</code> if the listener was removed; <code>false</code> if the listener and scope are not registered with the event.
 *
 * @see Event#addEventListener
 * @see Event#raiseEvent
 */

Event.prototype.removeEventListener = function (listener, scope) {
  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.func("listener", listener);
  //>>includeEnd('debug');

  var listeners = this._listeners;
  var scopes = this._scopes;

  var index = -1;
  for (var i = 0; i < listeners.length; i++) {
    if (listeners[i] === listener && scopes[i] === scope) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    if (this._insideRaiseEvent) {
      //In order to allow removing an event subscription from within
      //a callback, we don't actually remove the items here.  Instead
      //remember the index they are at and undefined their value.
      this._toRemove.push(index);
      listeners[index] = undefined;
      scopes[index] = undefined;
    } else {
      listeners.splice(index, 1);
      scopes.splice(index, 1);
    }
    return true;
  }

  return false;
};
```


# EventHelper

```js
/**
 * A convenience object that simplifies the common pattern of attaching event listeners
 * to several events, then removing all those listeners at once later, for example, in
 * a destroy method.
 *
 * @alias EventHelper
 * @constructor
 *
 *
 * @example
 * var helper = new Cesium.EventHelper();
 *
 * helper.add(someObject.event, listener1, this);
 * helper.add(otherObject.event, listener2, this);
 *
 * // later...
 * helper.removeAll();
 *
 * @see Event
 */
function EventHelper() {
  this._removalFunctions = [];
}
```
### EventHelper.prototype.add

```js
/**
 * Adds a listener to an event, and records the registration to be cleaned up later.
 *
 * @param {Event} event The event to attach to.
 * @param {Function} listener The function to be executed when the event is raised.
 * @param {Object} [scope] An optional object scope to serve as the <code>this</code>
 *        pointer in which the listener function will execute.
 * @returns {EventHelper.RemoveCallback} A function that will remove this event listener when invoked.
 *
 * @see Event#addEventListener
 */
EventHelper.prototype.add = function (event, listener, scope) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(event)) {
    throw new DeveloperError("event is required");
  }
  //>>includeEnd('debug');

  var removalFunction = event.addEventListener(listener, scope);
  this._removalFunctions.push(removalFunction);

  var that = this;
  return function () {
    removalFunction();
    var removalFunctions = that._removalFunctions;
    removalFunctions.splice(removalFunctions.indexOf(removalFunction), 1);
  };
};
```

# EntityView

```js
/**
 * A utility object for tracking an entity with the camera.
 * @alias EntityView
 * @constructor
 *
 * @param {Entity} entity The entity to track with the camera.
 * @param {Scene} scene The scene to use.
 * @param {Ellipsoid} [ellipsoid=Ellipsoid.WGS84] The ellipsoid to use for orienting the camera.
 */
function EntityView(entity, scene, ellipsoid) {
  /**
   * The entity to track with the camera.
   * @type {Entity}
   */
  this.entity = entity;

  /**
   * The scene in which to track the object.
   * @type {Scene}
   */
  this.scene = scene;

  /**
   * The ellipsoid to use for orienting the camera.
   * @type {Ellipsoid}
   */
  this.ellipsoid = defaultValue(ellipsoid, Ellipsoid.WGS84);

  /**
   * The bounding sphere of the object.
   * @type {BoundingSphere}
   */
  this.boundingSphere = undefined;

  // Shadow copies of the objects so we can detect changes.
  this._lastEntity = undefined;
  this._mode = undefined;

  this._lastCartesian = new Cartesian3();
  this._defaultOffset3D = undefined;

  this._offset3D = new Cartesian3();
}
```

###  EntityView.prototype.update


<!-- !!!!! 下次接着这里看 -->

```js
/**
 * Should be called each animation frame to update the camera
 * to the latest settings.
 * @param {JulianDate} time The current animation time.
 * @param {BoundingSphere} [boundingSphere] bounding sphere of the object.
 */
EntityView.prototype.update = function (time, boundingSphere) {

  var scene = this.scene;
  var ellipsoid = this.ellipsoid;
  var sceneMode = scene.mode;
  if (sceneMode === SceneMode.MORPHING) {
    return;
  }

  var entity = this.entity;
  var positionProperty = entity.position;
  if (!defined(positionProperty)) {
    return;
  }
  var objectChanged = entity !== this._lastEntity;
  var sceneModeChanged = sceneMode !== this._mode;

  var camera = scene.camera;

  var updateLookAt = objectChanged || sceneModeChanged;
  var saveCamera = true;

  if (objectChanged) {
    var viewFromProperty = entity.viewFrom;
    var hasViewFrom = defined(viewFromProperty);

    if (!hasViewFrom && defined(boundingSphere)) {
      // The default HPR is not ideal for high altitude objects so
      // we scale the pitch as we get further from the earth for a more
      // downward view.
      scratchHeadingPitchRange.pitch = -CesiumMath.PI_OVER_FOUR;
      scratchHeadingPitchRange.range = 0;
      var position = positionProperty.getValue(time, scratchCartesian);
      if (defined(position)) {
        var factor =
          2 -
          1 /
            Math.max(
              1,
              Cartesian3.magnitude(position) / ellipsoid.maximumRadius
            );
        scratchHeadingPitchRange.pitch *= factor;
      }

      camera.viewBoundingSphere(boundingSphere, scratchHeadingPitchRange);
      this.boundingSphere = boundingSphere;
      updateLookAt = false;
      saveCamera = false;
    } else if (
      !hasViewFrom ||
      !defined(viewFromProperty.getValue(time, this._offset3D))
    ) {
      Cartesian3.clone(EntityView._defaultOffset3D, this._offset3D);
    }
  } else if (!sceneModeChanged && this._mode !== SceneMode.SCENE2D) {
    Cartesian3.clone(camera.position, this._offset3D);
  }

  this._lastEntity = entity;
  this._mode = sceneMode;

  updateTransform(
    this,
    camera,
    updateLookAt,
    saveCamera,
    positionProperty,
    time,
    ellipsoid
  );
};
```

# DataSourceCollection

```js
/**
 * A collection of {@link DataSource} instances.
 * @alias DataSourceCollection
 * @constructor
 */
function DataSourceCollection() {
  this._dataSources = [];
  this._dataSourceAdded = new Event();
  this._dataSourceRemoved = new Event();
  this._dataSourceMoved = new Event();
}

Object.defineProperties(DataSourceCollection.prototype, {
  /**
   * An event that is raised when a data source is added to the collection.
   * Event handlers are passed the data source that was added.
   * @memberof DataSourceCollection.prototype
   * @type {Event}
   * @readonly
   */
  dataSourceAdded: {
    get: function () {
      return this._dataSourceAdded;
    },
  },

  /**
   * An event that is raised when a data source is removed from the collection.
   * Event handlers are passed the data source that was removed.
   * @memberof DataSourceCollection.prototype
   * @type {Event}
   * @readonly
   */
  dataSourceRemoved: {
    get: function () {
      return this._dataSourceRemoved;
    },
  },
})
```
