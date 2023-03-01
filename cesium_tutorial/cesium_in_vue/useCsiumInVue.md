# cesium-on-vue

A demo app to use a Cesium Viewer within a Vue component

## Introduction

In my day job, we use Cesium to display 3D models. This is a proof of concept to demonstrate the minimum
necessary to integrate Cesium within a Vue component.

## Usage

* `git checkout https://github.com/bluehaoran/cesium-on-vue.git`
* `npm install`
* `npm run serve`
* Visit the URL provided to see Cesium in action!

## Reproducing this Project

1. First, I used the Vue CLI to create a new Vue project.
1. Second, I spent some time with Cesium's official [Webpack example](https://github.com/AnalyticalGraphicsInc/cesium-webpack-example).
1. I then integrated these build steps into `vue.config.js` so that vue could continue to drive the webpack build.
1. I followed recommendations from one of the raised [issues](https://github.com/AnalyticalGraphicsInc/cesium-webpack-example/issues/6) to squash Webpack warnings.
1. I created a Vue component with the stock Cesium viewer.

## Notes

* Before this code sample goes into production, you would want to integrate [`webpack.release.config.js`](https://github.com/AnalyticalGraphicsInc/cesium-webpack-example/blob/master/webpack.release.config.js) into `vue.config.js`.
* If your code is more than an SPA, you'll want to tweak the value of `CESIUM_BASE_URL` in `vue.config.js` to something like `/`.
* Alternatively, you may want to file the Cesium assets under their own directory, in which case, replace the code-block in `vue.config.js` with:

```
          new CopyWebpackPlugin([{ from: 'node_modules/cesium/Build/Cesium/Workers', to: 'cesium/Workers' }]),
          new CopyWebpackPlugin([{ from: 'node_modules/cesium/Build/Cesium/ThirdParty', to: 'cesium/ThirdParty' }]),
          new CopyWebpackPlugin([{ from: 'node_modules/cesium/Build/Cesium/Assets', to: 'cesium/Assets' }]),
          new CopyWebpackPlugin([{ from: 'node_modules/cesium/Build/Cesium/Widgets', to: 'cesium/Widgets' }]),
          new webpack.DefinePlugin({
	          // Define relative base path in cesium for loading assets
	          CESIUM_BASE_URL: JSON.stringify('cesium')
          }),
```

* You will notice two lines that remove the "Critical Dependency" error. *Theoretically* these will be deprecated, and the more correct way of resolving this issue uses the [ContextReplacementPlugin](https://webpack.js.org/plugins/context-replacement-plugin/) from Webpack. However solving this this way was problematic. If anyone knows the correct fix, please let me know!
