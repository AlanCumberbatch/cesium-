### in Cesium

    - [插值 （离散数学名词)](https://baike.baidu.com/item/%E6%8F%92%E5%80%BC/1196063)
    - [样条函数](https://baike.baidu.com/item/%E6%A0%B7%E6%9D%A1%E5%87%BD%E6%95%B0)
    - 计算机图形学中使用样条插值居多。 -----》 [Cesium 中使用 JulianDate时间 的差值 来实现 内插算法](https://blog.csdn.net/qq_36213352/article/details/122566687)<br/>
    - LinearApproximation [插值](https://zh.wikipedia.org/wiki/%E6%8F%92%E5%80%BC)
    - [拟合](https://zh.wikipedia.org/wiki/%E6%9B%B2%E7%B7%9A%E6%93%AC%E5%90%88): 内部引出相当多的数学概念！！！并没有深入阅读

    <br/>
    小结：
    - 轨迹数据视化原理则是将时刻与坐标点相对应，按照时间顺序通过某种插值方法将轨迹点连成条光滑的轨迹曲线。为了更加通真显示轨迹动态效果，通常每条轨迹会有一个实物模型，如车辆、飞机或人物用于真实刻画不同情景下的轨迹特点。
    - 粗略的理解为给定几个点之后，每秒在相邻两点之间插入一些点，在Cesium中单次插入3个点(Cartesian3.packedLength == 3)/1个pack(来自[cesium-CZML描述动态场景](https://blog.csdn.net/qq_36213352/article/details/122566687)),频繁根据相应的算法进行点的插入后，这些点就会都在能够表达相应算法的曲线上。据我目前的理解，曲线只可类比两点之间，不可延伸至整个Path/Polyline图元。<br/>
    <br/>
    [cesium-CZML描述动态场景](https://blog.csdn.net/qq_36213352/article/details/122566687)中的表格中的参数Cesium中都有用到，但是主要是下面这两个：
    | 名称         | JSON类型     | 说明        |
    | ----------- | ----------- | ----------- |
    | InterpolationAlgorithm |    string    | 用于插值的算法，有LAGTANGE，HERMITE和GEODESIC方法等，默认是LAGRANGE(当前算法默认是线性插值)。如果位置不在该采样区间，那么这个属性值会被忽略 |
    | interpolationDegree    |    number    | 定义了用来插值所所使用的多项式次数，1表示线性差值，2表示二次插值法，默认为1。如果使用GEODESIC插值算法，那么这个属性将被忽略。 拉格朗日5次多项式插值方法,形成光滑连续的变化过程 |

    总体思路：将**时刻**与**坐标点**相对应，按照时间顺序通过某种插值方法将轨迹点连成条光滑的轨迹曲线。（轨迹数据视化原理）
    具体步骤(Cesium)：(分初始化和计算过程两个过程去理解)
      - 初始化了什么？
      1. new SampledPositionProperty 用于存放采样点---也即坐标点
      2. 通过 SampledPositionProperty.addSample 方法将**时刻**与**坐标点**相对应(把 时间放到 this.times, position 放到 this.values 里面)
      3. render--> ~ --> DataSourceDisplay.update --> Model**Visualizer**.update -> Entity.computeModelMatrix --> Entity.compteModelMatrix --> Property.getValueOrUndefined --> SampledPositionProperty.getValue --> ~ -> SampledProperty.getValue(在这里将 this.times 和 this.values 进行转换，转换成 Cartesian3）--> 而后再经过别的**方法**（Entity.prototype.computeModelMatrix）结合时间转换成 Matrix4. 其中的时间是：Scene.render的入参，即 The simulation time at which to render.每秒都会传入一次<br/>
      <br/>
      案例代码：
        ```js
          // A-  区别于其他普通模型，主要区别在于 postion， 变得和时间有关系,这个 position 需要给到一个具体的模型作为载体以表现出实际效果
          function computeCirclularFlight(lon, lat, radius) {
            var property = new Cesium.SampledPositionProperty();
            for (var i = 0; i <= 360; i += 45) {// 当前函数定义了8个点， 然后据此利用 样条插值 进行插值计算。
              var radians = Cesium.Math.toRadians(i);
              // Cesium.JulianDate.addSeconds --- Adds the provided number of seconds to the provided date instance.
              // 就是把 i 的值当成秒添加到 start 这个时间的值上
              var time = Cesium.JulianDate.addSeconds( start, i, new Cesium.JulianDate() );
              var position = Cesium.Cartesian3.fromDegrees(
                lon + radius * 1.5 * Math.cos(radians),
                lat + radius * Math.sin(radians),
                Cesium.Math.nextRandomNumber() * 500 + 1750
              );

              property.addSample(time, position); // 把 时间放到 this.times, 把this.times，this.position的处理结果 放到 this.values 里面

              //Also create a point for each sample we generate.
              viewer.entities.add({
                position: position,
                point: { pixelSize: 8, color: Cesium.Color.TRANSPARENT, outlineColor: Cesium.Color.YELLOW, outlineWidth: 3,},
              });
            }
            return property;
          }

          //Compute the entity position property.
          var position = computeCirclularFlight(-112.110693, 36.0994841, 0.03);

          //Actually create the entity
          var entity = viewer.entities.add({
            //Set the entity availability to the same interval as the simulation time. ---作用：与此对象关联的可用性（如果有）。如果未定义可用性，则假定此对象的其他属性将在任何提供的时间内返回有效数据。 如果存在可用性，则只有在给定的时间间隔内查询时，其他属性的对象才会提供有效数据。
            availability: new Cesium.TimeIntervalCollection([
              new Cesium.TimeInterval({
                start: start,
                stop: stop,
              }),
            ]),

            //Use our computed positions
            position: position,// Path 和 model 都是用的这个postion

            //Automatically compute orientation based on position movement.
            orientation: new Cesium.VelocityOrientationProperty(position),// A Property which evaluates to a Quaternion rotation based on the velocity of the provided PositionProperty.

            // C- 一个模型作为载体
            //Load the Cesium plane model to represent the entity
            model: {
              uri: "../../SampleData/models/CesiumAir/Cesium_Air.glb",
              minimumPixelSize: 64,
            },

            // B- 搭配一个 path 模型
            //    需要注意的是： resolution 属性(指定在对位置进行采样时要单步执行的最大秒数) 的值设置为 1 ；
            //    具体的原因：初始化的结果会导致插值成功后是一个圆，即飞机的飞行轨迹是一个圆。这样的话，飞机的飞行方向一直在变化，即？？的导数是一直在变化的，也即是说旋转矩阵需要飞机每移动一个弧度更新一次(如果插值插得很细的话，但是这样的话人眼也不一定能辨别得出来)---》 即当前函数内部的orientation
            //Show the path as a pink line sampled in 1 second increments.
            path: {
              resolution: 1,// Gets or sets the Property specifying the maximum number of seconds to step when sampling the position.
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: Cesium.Color.YELLOW,
              }),
              width: 10,
            },
          });
        ```
      怎么计算的？
      在当前案例中，模型和 path 使用相同的 positions，默认情况下，生成一个正八边形，我想接着说这相当于线性插值，但是又觉得哪里不对。。。。
      为什么 resolution 设置成60 会造成那种现象？(这个现象可以在Cesium.sandcastle的网站中的[Interpolation](https://sandcastle.cesium.com/?src=Interpolation.html&label=All)案例中把resolution的值设置成60之后就可以看到)<br/>
      因为使用的 样条插值，所以 只会有一段发生变化。 path 所使用的 position 没有 那么多点，也不能这么说， 那为什么 飞机模型可以按照圆圈飞？？？那就说明 position 已经完成了插值（在初始化的时候，addSample这个函数)<br/>
      .<br/>
      . 插值算法只在 getValue 的时候使用了---》 addSample 全部执行完然后 getValue？
      .<br/>
      // 下面这个方法能够生效是因为 JS 的本身可以设置响应式属性<br/>
      SampledPositionProperty.setInterpolationOptions 用于 根据传入的参数分别更改两个参数，然后 this._definitionChanged.raiseEvent(this);<br/>---》 哪里添加的 addEventListener 呢？ -----> （目前并未找到何处添加的事件监听）是通过 ModelVisualizer.update -> Entity.computeModelMatrix --> 而后通过 getValue 方法进行状态变更
      .<br/>

  #### 测试代码

| 插值方式      | C++ demo | JS demo |
| -----------  | ----------- | ----------- |
| 线性  | [linear_C++](./linear.cpp) | [linear_JS](linear.js) |
| 拉格朗日 | [lagrange_C++](lagrangepolynomi.cpp) | [lagrange_JS](lagrangepolynomi.js) |
| 埃尔米特 | [Hermitpoly_C++](Hermitpolynomiala.cpp) | [Hermitpoly_JS](Hermitpolynomiala.js) |
| 如何执行案例  | g++ -std=c++11 filename | node filename |

说明：
- Cesium 中相关算法内部只执行了 interpolateOrderZero 方法，插多少次都是

#### 引出来的问题
  1. Transforms.computeIcrfToFixedMatrix， Transforms.computeTemeToPseudoFixedMatrix 中涉及的概念----先放一放。。。


