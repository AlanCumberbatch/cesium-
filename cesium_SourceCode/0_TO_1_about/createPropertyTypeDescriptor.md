# [<font color=red>back to entities.add</font>](index_entities_add.md#font-colorskybluecreatepropertytypedescriptorfontjust-click)

```js
function createPropertyTypeDescriptor(name, Type) {
  return createPropertyDescriptor(name, undefined, function (value) {
    if (value instanceof Type) {
      return value;
    }
    return new Type(value);
  });
}
```

```js
/**
 * Used to consistently define all DataSources graphics objects.
 * This is broken into two functions because the Chrome profiler does a better
 * job of optimizing lookups if it notices that the string is constant throughout the function.
 * @private
 */
function createPropertyDescriptor(name, configurable, createPropertyCallback) {
  //Safari 8.0.3 has a JavaScript bug that causes it to confuse two variables and treat them as the same.
  //The two extra toString calls work around the issue.
  return createProperty(
    name,
    "_" + name.toString(),
    "_" + name.toString() + "Subscription",
    defaultValue(configurable, false),
    defaultValue(createPropertyCallback, createConstantProperty)
  );
}
```


```js
function createConstantProperty(value) {
  return new ConstantProperty(value);
}
```

```js
function createProperty(
  name,
  privateName,
  subscriptionName,
  configurable,
  createPropertyCallback
) {
  return {
    configurable: configurable,
    get: function () {
      return this[privateName];
    },
    set: function (value) {
      var oldValue = this[privateName];
      var subscription = this[subscriptionName];
      if (defined(subscription)) {
        subscription();
        this[subscriptionName] = undefined;
      }

      var hasValue = value !== undefined;
      if (
        hasValue &&
        (!defined(value) || !defined(value.getValue)) &&
        defined(createPropertyCallback)
      ) {
        value = createPropertyCallback(value);// 默认是createConstantProperty， 但是涉及到 box，polyline 等模型的时候，会传进来 相应的 ***Graphics
        //  link about Graphics in Cesium.document : https://cesium.com/learn/cesiumjs/ref-doc/PolylineGraphics.html?classFilter=Graphics
        //  choose PolylineGraphics as example,link is listed below.
      }

      if (oldValue !== value) {
        this[privateName] = value;
        this._definitionChanged.raiseEvent(this, name, value, oldValue);
      }

      if (defined(value) && defined(value.definitionChanged)) {
        this[subscriptionName] = value.definitionChanged.addEventListener(
          function () {
            this._definitionChanged.raiseEvent(this, name, value, value);
          },
          this
        );
      }
    },
  };
}
```

[PolylineGraphics](../about_sourceCode/PolylineGraphic.md)