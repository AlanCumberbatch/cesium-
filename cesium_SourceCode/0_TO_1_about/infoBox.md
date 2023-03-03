在 Viewer 中创建了 infoBox 容器

1. 什么时候被激活/显示呢？
    点击当前 entity 的时候被激活/显示。
    在 Viewer.prototype._onTick 方法中

2. 显示的时候需要获取当前对象的哪个属性呢
    确实获取的是 description

//为什么还是不好使呢？？？？