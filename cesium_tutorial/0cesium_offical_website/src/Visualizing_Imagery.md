  - CesiumJS supports drawing and layering high-resolution imagery (maps) from many services, including Cesium ion. Use Cesium ion to stream curated high resolution imagery or tile your own imagery layers from raster data to CesiumJS apps. Layers can be ordered and blended together. Each layer’s brightness, contrast, gamma, hue, and saturation can be dynamically changed. This tutorial introduces imagery layer concepts and the related CesiumJS APIs .

  - imagery is divided into smaller images, called tiles, that can be streamed to a client as needed based on the view.
  - Cesium supports several standards for requesting tiles using imagery providers. Most imagery providers use a REST interface over HTTP to request tiles.
  - Imagery providers differ based on how requests are formatted and how tiles are organized.
  - when getting imagery tiles ,sth about Crosee-origin and proxy
    - Unfortunately, not all imagery services support CORS. And Cesium encourage enabling CORS as described [here](https://enable-cors.org/) instead of using a proxy.
    - if( CORS ) --- The server indicates the images do not contain confidential information, and it is therefore safe for other sites to read their pixels, by including Cross-Origin Resource Sharing (CORS) headers in the HTTP response.
    - else --- a proxy server at the same origin as the website hosting your app must be used.
  - Imagery providers vs. layers
    -  An imagery provider makes requests for tiles using a particular service,
    -  while a layer represents displayed tiles from an imagery provider.
    -  We usually construct an ***imagery provider*** just to create a ***layer***, ***then we manipulate the layer to change its visual appearance using its properties*** such as show, alpha, brightness, and contrast. See [ImageryLayer](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayer.html). Decoupling imagery providers and layers makes it easier to write new imagery providers.
    - An imagery layer collection, like layers in the above examples, determines the order in which layers are drawn. ***Layers are drawn bottom-to-top based on the order they are added.*** Imagery layer collections are manipulated like any other collection in Cesium using functions such as add, remove, and get. ***In addition, layers can be reordered using raise, raiseToTop, lower, and lowerToBottom.*** See [ImageryLayerCollection](https://cesium.com/learn/cesiumjs/ref-doc/mageryLayerCollection.html).
  - Resources
    - **<font color=orange>demos</font>** in Cesium official website about this capture
      - [Imagery Layers](https://sandcastle.cesium.com/?src=Imagery%20Layers.html) - Code example from this tutorial.
      - [Imagery Layers Manipulation](https://sandcastle.cesium.com/?src=Imagery%20Layers%20Manipulation.html) - Layer imagery from multiple sources, and adjust the alpha of each independently.
      - [Imagery Adjustment](https://sandcastle.cesium.com/?src=Imagery%20Adjustment.html) - Adjust brightness, contrast, gamma, hue, and saturation of an imagery layer.
    - In addition, check out the reference documentation:
      - [All imagery providers](https://cesium.com/learn/cesiumjs/ref-doc/?classFilter=ImageryProvider)
      - [ImageryLayer](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayer.html)
      - [ImageryLayerCollection](https://cesium.com/learn/cesiumjs/ref-doc/mageryLayerCollection.html)


