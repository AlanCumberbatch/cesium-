<!-- [demo (need to execute in Cesium project)](../../cesium_tutorial/cesium_offical_website/demo/Custom_Geometry_and_Appearances.html) -->

[about Entity add](../0_TO_1_about/index_entities_add.md)//这里的结论不对，但是看源码的思路在里面。


<!--
  决定看这个 问题的初衷是因为  LSEarth 现在只实现了 Primitive API（暂定完全实现），但是 Entity API 用起来真的是很舒服，
  我希望自己是否可以尝试一下发现其中个规律，然后在现有的 Primitive API 上实现 LSEarth 的 Entity

  写完这句话，我的直觉告诉我，就一直根据 Entity 的路子一路挖下去，一定会发现一些内容的。 好的 08.12
  那就开始看 Entity， 死扣到底。
  我最终要知道什么？
  想要知道 Entity 如何利用 Primitive API 实现 模型生成。
  想了一下，那就不应只看 Entity 内部，而是结合 Viewer 等其他文件一起看了。OK 开始实施。
-->

[ How Entity API works](How_Entity_API_works.md)//看的源码的记录

[ How Primitive API works](How_Primitive_API_works.md)//看的源码的记录

<br/>
<br/>
<br/>
Other blogs from website<br/>

[ first link ](https://blog.csdn.net/XLSMN/article/details/76229390)

GET:

提示：Cesium中提供两类API：

（1）面向图形开发人员的底层API，通常称为“Primitive API”。该API暴露最小限度的抽象，使用图形学术语，具有很大的灵活性，需要具有图形学编程的知识；

（2）高级别的数据驱动的API，称为“Entity API”。该API使用一致性设计的、高级别的对象来管理一组相关性的可视化对象，其<font color=red>底层使用Primitive API</font>；(this is what i want to know)

其他篇幅都在说 Entity 如何使用，只说了一些用法


[ second link ](https://blog.csdn.net/5hongbing/article/details/79329562?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_title~default-6.baidujsUnder6&spm=1001.2101.3001.4242)

GET:

- 可以通过Primitive API来操控几何图形及其外观，或者绘制各种特殊的形状。需要先得到Scene对象，然后在其上添加Primitive对象：

- Primitive由两个部分组成：

  &emsp;几何形状（Geometry）：定义了Primitive的结构，例如三角形、线条、点等

  &emsp;外观（Appearance）：定义Primitive的着色（Sharding），包括GLSL（OpenGL着色语言，OpenGL Shading Language）顶点着色器和片段着色器（ vertex and fragment shaders），以及渲染状态（render state）

- 使用Geometry和Appearance具有以下优势：

  （1）性能：绘制大量Primitive时，可以将其合并为单个Geometry以减轻CPU负担、更好的使用GPU。合并Primitive由web worker线程执行，UI保持响应性

  （2）灵活性：Geometry与Appearance解耦，两者可以分别进行修改

  （3）低级别访问：易于编写GLSL顶点、片段着色器、使用自定义的渲染状态

- 同时，具有以下劣势：

  （1）需要编写更多地代码

  （2）需要对图形编程有更多的理解，特别是OpenGL的知识