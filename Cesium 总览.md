# **Cesium 自学**

### 写这个文档的初衷
&emsp;将学习 Cesium 的过程做一个记录
### Cesium 从 0 到 1
<!-- ###### 刚才冒出来一个思路：可以依照 cesium 项目从0到1的过程来学习，毕竟这段时间上班确实也就是看文档了。那就全身心的看看。 -->

> 参考：
> - [Cesium开发笔记 - 作者：vtxf, 来源：知乎](https://zhuanlan.zhihu.com/p/80904975)
> - [Cesium系统学习整理 - 作者：鱼吃鱼罐头，来源：博客园](https://www.cnblogs.com/yxd000/p/13743778.html)


  1. Cesium 的概念定义 <br/>
    Cesium是国外一个**基于JavaScript**编写的使用WebGL**的地图引擎**。
    Cesium支持3D,2D,2.5D形式的地图展示，可以自行绘制图形，高亮区域，并提供良好的触摸支持，且支持绝大多数的浏览器和mobile。
    CesiumJS是一个开放源代码JavaScript库，**用于创建**具有最佳性能，精度，视觉质量和易用性的世界一流的**3D地球和地图**。从**航空航天**到**智慧城市**再到**无人机**，各行各业的开发人员都使用CesiumJS创建**用于共享动态地理空间数据的交互式Web应用程序**。
    CesiumJS建立在开放格式上，旨在实现强大的互操作性。从Cesium ion或其他来源获取数据，使用CesiumJS进行可视化，并与台式机或移动设备上的用户共享。
    CesiumJS的下载量超过1,000,000，为数百万用户提供了强大的应用程序，整个定义来自官方网站。
  2. Cesium的安装与配置环境 <br/>
    在 github 上将项目现在到本地，建议下载最新版本，而后进行本地饮用。
    关于配置环境，对于前端来说，nodejs的环境必须要有的。安装好node后，直接在终端中进入到Cesium项目的根文件，而后命令行输入http-server进行http服务的环境搭建的，然后就可以写出Cesium的第一例子了。
  3. Cesium的第一个实例 <br/>
     1. How
        - 安装好 node
        - 下载项目
        - npm i
        - 编译一下：
            * npm run combine 生成 Build/CesiumUnminified，会把所有Source文件夹中所有文件合并到一个Cesium.js中去，并且不会去掉注释。这样可以方便发布版本之前的调
            * npm run generateDocumentation 只生成文档
            * npm run minifyRelease 生成 Build/Cesium，生成的Cesium.js文件中的调试信息会被去除，并且进行了压缩，是可以部署到生成环境中的版本。
            * ⚠️ **npm run release** 则相当于以上三个命令的集合：即combine + minifyRelease + generateDocumentation。
        - 参照 Hello World.html 创建一个 html 文件，路径只要自己能找到就行，但是为了省事儿，我创建在同级目录了。
        - 在 Cesium 1.83 项目根目录下 输入命令行： http-serve
        - 在浏览器中输入对应url，建议谷歌浏览器
     2. html 文件案例：

        ```
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/>
            <title>CesiumTest</title>
            <!-- *A: 引入打包后的 Cesium 文件 -->
            <script src="../Build/Cesium/Cesium.js"></script>
            <style>
              /*  *B: 引入 Cesium.widget 的 css 文件 */
              @import url(../Build/Cesium/Widgets/widgets.css);
              html,
              body,
              #cesium_container {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <!-- *C： 创建容纳 Cesium 的盒子 -->
            <div id="cesium_container"></div>
            <script>
              //*D: new Cesium.Viewer，即可创建一个地球出来
              var viewer = new Cesium.Viewer('cesium_container');
            </script>
          </body>
          </html>
        ```

&emsp;**一切开始于  *var viewer = new Cesium.Viewer('cesium_container');*  。**<br/>
<!-- [Cesium.Viewer](Cesium-Viewer.md) -->

### 之后如何进行
 07.23： 结合当前需求，及时间、任务的安排，决定按照 Cesium 官方中文教程中的案例进行学习。先学习如何应用，然后去阅读源码，并理解为如何生效的。

