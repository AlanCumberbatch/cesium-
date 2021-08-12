// 在 Cesium 项目中的路径： cesium/Source/DataSources/PolylineGraphics.js

// 方法内部声明所有需要的属性，以及 merge，clone 方法
function PolylineGraphics(options){}

//将声明的属性中 部分 变成和时间相关的属性，并声明成拦截器属性，会在 set 的时候进行一些操作。---》 暂时看上去和 Primitive API 并没有什么关联。。。。。。08.11----》要不要从那个 Cesium 结构图开始入手？手写一些东西？？？这么看真的好想没啥交集啊？？？
// 我现在看的的东西，只是如何生成对应的 Entity 或者 Primitive，暂时并没有发现它们之间有什么联系，它们最终会给谁？是不是在那里会有什么异同 ？
Object.defineProperties(PolylineGraphics.prototype, {....});


// merge 方法 --- 在初始化时，会根据输入的 options 将对应的属性进行赋值
/**
 * Assigns each unassigned property on this object to the value
 * of the same property on the provided source object.
 *
 * @param {PolylineGraphics} source The object to be merged into this object.
 */


//clone ---
/**
 * Duplicates this instance.
 *
 * @param {PolylineGraphics} [result] The object onto which to store the result.
 * @returns {PolylineGraphics} The modified result parameter or a new instance if one was not provided.
 */


 <font color=red  size=20> 08.11 14:48 暂时从当前 Graphics 文件中并未发现和 Primitve API 相关的内容。</font><br/><br/>
 <font color=orange size=20> 08.11 14:48 什么又算是和 Primitve API 相关的内容呢？</font>