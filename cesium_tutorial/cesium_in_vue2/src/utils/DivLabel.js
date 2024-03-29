
// [reference link](https://blog.csdn.net/weixin_46730573/article/details/119061305?spm=1001.2101.3001.6650.1&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-119061305-blog-120160101.pc_relevant_3mothn_strategy_recovery&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-119061305-blog-120160101.pc_relevant_3mothn_strategy_recovery&utm_relevant_index=2)

function customLabel(viewer, data) {
  /*
      data{ position:[106,125]，title:"标题"，id:"0" }
          position：经纬度
          title：文本标题，
          id：唯一标识

  */
  let div = document.createElement("div");
  div.id = data.id;
  div.style.position = "absolute";
  div.style.width = "100px";
  div.style.height = "30px";
  let HTMLTable = `
  <div style="background:rgba(255,122,0,0.4)">${data.title}</div>
  `;
  div.innerHTML = HTMLTable;
  viewer.cesiumWidget.container.appendChild(div);

  /*
      虽然我们将div添加到了cesium容器中，但是并不能显示到我们想要的位置，
      具体原因是因为我们并未有给添加的标签设置top和left值，
      接下来我们需要根据传入的坐标转换成屏幕xy值，
      我们可以利用cesium中提供的 Cesium.SceneTransforms.wgs84ToWindowCoordinates() 方法进行转化
  */
  let gisPosition = Cesium.Cartesian3.fromDegrees(
      data.position[0],
      data.position[1],
      0
  );
  // const canvasHeight = viewer.scene.canvas.height;
  // const windowPosition = new Cesium.Cartesian2();
  // Cesium.SceneTransforms.wgs84ToWindowCoordinates(
  //     viewer.scene,
  //     gisPosition,
  //     windowPosition
  // );
  // div.style.bottom = canvasHeight - windowPosition.y + "px";
  // const elWidth = div.offsetWidth;
  // div.style.left = windowPosition.x - elWidth / 2 + "px";

  /*
      现在咱们自定义的标记已经显示到我们想要的位置了，
      但是我们还出现了一个问题我们在移动地球的时候，标签不会跟着动，总不能不能让用户操作呀，在那摆着当个花瓶看。
      那不可能，我们可以在看cesium给咱们提供的文档中有一个 viewer.scene.postRender 方法实时更新位置
  */
  //实时更新位置
  viewer.scene.postRender.addEventListener(() => {
    const canvasHeight = viewer.scene.canvas.height;
    const windowPosition = new Cesium.Cartesian2();
    Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        gisPosition,
        windowPosition
    );
    div.style.bottom = canvasHeight - windowPosition.y + "px";
    const elWidth = div.offsetWidth;
    div.style.left = windowPosition.x - elWidth / 2 + "px";

      //解决滚动不隐藏问题
  const camerPosition = viewer.camera.position;
      let height = viewer.scene.globe.ellipsoid.cartesianToCartographic(camerPosition).height;
      height += viewer.scene.globe.ellipsoid.maximumRadius;
      // console.log(camerPosition,val.position )
      if((!(Cesium.Cartesian3.distance(camerPosition,gisPosition ) > height))&&viewer.camera.positionCartographic.height<50000000){
          div.style.display = "block"
      }else{
          div.style.display = "none"
      }
  }, this);

}
// addDynamicLabel({ position:[106,125], title:"标题", id:"0" })
// export default customLabel

// customComponents
/**
 * @descripion:
 * @param {Viewer} viewer
 * @param {Cartesian2} position
 * @param {String} title
 * @param {String} id
 * @return {*}
 */

import Vue from 'vue';
// 不同的Label在 setColor 方法中需要进行相应的更改
// import Label from '../customComponents/label0.vue';// 边框有效果的 label
import Label from '../customComponents/label1.vue';// 只是有边框的 label
// import Label2 from '../customComponents/label1.vue';// 一个点，有边缘扩散效果--- 点时隐时现
// import Label3 from '../customComponents/label1.vue';// 一个点，有边缘扩散效果--- 点一直存在
// import Label from '../customComponents/label.vue';
let WindowVm = Vue.extend(Label);// ???--- VUE官网中可以用Vue.extend + $mount，构造器来创建子类。

function addClickListener(viewer,options) {
  if (viewer && options) {
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  }


}

export default class DivLabel{
  #handler

  constructor(val) {
    // this.show = true;
    this.viewer = val.viewer;
    this.height = val.height;
    this.rawPos = val.position;
    this.position = Cesium.Cartesian3.fromDegrees(
      val.position[0],
      val.position[1],
      val.height
    );
    this.posRangeInCanvas = { x: [], y: [] };// 用于判断当前label在Canvas坐标系中的位置范围


    let title = val.title;
    let id = val.id
    this.vmInstance = new WindowVm({
      propsData: {
        title,
        id
      }
    }).$mount(); //根据模板创建一个面板
    let labelDom = val.viewer.cesiumWidget.container.appendChild(this.vmInstance.$el); //将字符串模板生成的内容添加到DOM上
    // labelDom.addEventListener('click', this.vmInstance.labelClick)
    // labelDom.addEventListener('dblclick', this.vmInstance.labelDblclick)
    // labelDom.addEventListener('click', this.vmInstance.labelDblclick)

    this.addPostRender();
    // this.updatePosInCanvasCoord();


    // for test
    this.num = 11111;

    this.init();
  }


  init() {

    // 注册 Cesium中的鼠标事件，并达到用一次删一次，然后重新添加的作用
    // this.#handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // addClickListener();
  }
  // create(){}
  update(){}
  destroy() {
    // this.show = false;
    this.viewer.cesiumWidget.container.removeChild(this.vmInstance.$el)
  }
  display() {
    this.viewer.cesiumWidget.container.appendChild(this.vmInstance.$el)
  }

  //添加场景事件
  addPostRender() {
    this.viewer.scene.postRender.addEventListener(this.postRender, this);
  }
  //场景渲染事件 实时更新窗口的位置 使其与笛卡尔坐标一致
  postRender() {

    if (!this.vmInstance.$el || !this.vmInstance.$el.style) return;

    const canvasWidth = this.viewer.scene.canvas.width;
    const canvasHeight = this.viewer.scene.canvas.height;
    const windowPosition = new Cesium.Cartesian2();
    Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      this.viewer.scene,
      this.position,
      windowPosition
    );
    // x,y 不一样，此时是 world Coordination Position
    // console.log('%c [ windowPosition ]-143', 'font-size:13px; background:pink; color:#bf2c9f;', windowPosition)


    // 这个计算方式只适合于Canvas是全屏的时候？？？
    // 这个dom设置了position：absolute，应该是默认就是参照 body 标签来进行位置确定的。
    this.vmInstance.$el.style.bottom = canvasHeight - windowPosition.y + this.height + "px";
    const elWidth = this.vmInstance.$el.offsetWidth;
    this.vmInstance.$el.style.left = windowPosition.x - elWidth / 2 + "px";

    // 我想知道当前label的显示范围，用于判断是否能够选中这个Label
    let canvasX = windowPosition.x - (window.innerWidth - canvasWidth);
    let canvasY = windowPosition.y - (window.innerHeight - canvasHeight);

    this.posRangeInCanvas.x[0] = canvasX;
    this.posRangeInCanvas.x[1] = canvasX+Number(this.vmInstance.$el.style.width);
    // console.log('%c [ this.vmInstance.$el.style ]-161', 'font-size:13px; background:pink; color:#bf2c9f;', this.vmInstance)
    // this.vmInstance.getDomWidthAndHeight()
    // console.log('%c [ this.vmInstance.$el.style ]-161', 'font-size:13px; background:pink; color:#bf2c9f;', this.vmInstance.$el.style)
    this.posRangeInCanvas.y[0] = canvasY;
    this.posRangeInCanvas.y[1] = canvasY+Number(this.vmInstance.$el.style.height);

    // this.posRangeInCanvas.x[0] = windowPosition.x;
    // this.posRangeInCanvas.x[1] = windowPosition.x - elWidth / 2;
    // this.posRangeInCanvas.y[0] = canvasHeight - windowPosition.y;
    // this.posRangeInCanvas.y[1] = canvasHeight - windowPosition.y + this.height;


    const camerPosition = this.viewer.camera.position;
    let height = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(camerPosition).height;
    height += this.viewer.scene.globe.ellipsoid.maximumRadius;

    if((!(Cesium.Cartesian3.distance(camerPosition,this.position) > height))&&this.viewer.camera.positionCartographic.height<50000000){
      this.vmInstance.$el.style.display = "block";
    }else{
      this.vmInstance.$el.style.display = "none";
    }
  }


  setColor() {
    // console.log('%c [ this.vmInstance.$el ]-149', 'font-size:13px; background:pink; color:#bf2c9f;', this.vmInstance.$el.children[0])//这里设置style.color
    // console.log('%c [ this.vmInstance.$el ]-149', 'font-size:13px; background:pink; color:#bf2c9f;', this.vmInstance.$el.children[0].children[0])//这里设置style.background: rgba(0, 173, 181, 0.32);
    this.vmInstance.$el.children[0].style.borderColor = 'rgba(0, 0, 181, 1.0)'
    this.vmInstance.$el.children[0].children[0].style.background = 'rgba(0, 0, 181, 0.15)'
  }

  updatePosInCanvasCoord() {

    console.log('%c [ this.vmInstance.$el ]-179', 'font-size:13px; background:pink; color:#bf2c9f;', this.vmInstance.$el)
    console.log('%c [ this.vmInstance.$el ]-180', 'font-size:13px; background:pink; color:#bf2c9f;', this.vmInstance.$el.click())//可以通过这种方式执行 点击事件

    // this.position//这个position也是Canvas 里的？？？ 不是，是经纬度
    // this.posRangeInCanvas = {x:[],y:[]};// 用于判断当前label在Canvas坐标系中的位置范围

    // 想要进行对比，就需要获取 Canvas 坐标系内的坐标才能进行对比
  }

  // 关于 选中
  // To judge whether cur label could be selected in this click event.  用来判断当前label在此次click事件中是否是可能被选中的一个
  accessibleOrNot(clickWindowPos) {// clickWindowPos --- Canvas 坐标系里的坐标
    // 通过判断 clickWindowPos 是否在 当前 label 的 屏幕坐标 的宽高 的范围内， 来判断是否可以被选择
    const labelWindowPosition = new Cesium.Cartesian2();
    Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      this.viewer.scene,
      this.position,
      labelWindowPosition
    );// label 的屏幕坐标
    // console.log('%c [ labelWindowPosition ]-211', 'font-size:13px; background:pink; color:#bf2c9f;', labelWindowPosition)

    let [width, height] = this.vmInstance.getDomWidthAndHeight();// 这个 width，height 需要时时机显示样式的区域的面积，最好可以确定
    // 此种方式创建的 label，this.position 是在label的左上角

    // 在 canvas 坐标系中 进行比较，确定 当前 click 的 position 是否在 label 所在的平面中
    /*
      判断 点 是否在当前 label 所在的 Cartesian2 平面中
      |—— —— —— ——> x+
      |  —— —— —— ——
      |  |         ｜  .
      |  |    .    ｜
      |  —— —— —— ——
      v
      y+
    */
    if (
      (clickWindowPos.x - labelWindowPosition.x >= 0 && clickWindowPos.y - labelWindowPosition.y >= 0)
      && (labelWindowPosition.x + width - clickWindowPos.x >= 0 && labelWindowPosition.y + height - clickWindowPos.y >= 0)
    ) {
      return true;
    }
    return false;

  }
  // 在Cartesian3坐标系中进行判断可以被选中的label中哪个才应该是被选中的
  selectedOrNot() {
    // 在测试的时候发现，和label创建的顺序强相关。。。。
    // 那这个方法就暂时不用了，直接取 labels 里的第一个
  }
  // 选中之后：
  // 单击
  click() {
    this.vmInstance.$el.children[0].children[0].innerHTML = this.num;
    // this.num += 11111;// for test
    this.num = Number(this.num) + 11111;// for test
  }
  // 双击
  dblClick() {
    // 目前C段的需求是 双击替换 label 里的文字
    // this.vmInstance.$el.innerHTML
    // console.log('%c [ this.vmInstance.$el.innerHTML ]-249', 'font-size:13px; background:pink; color:#bf2c9f;', this.vmInstance.$el.innerHTML)
    // console.log('%c [ this.vmInstance.$el.children ]-249', 'font-size:13px; background:pink; color:#bf2c9f;', this.vmInstance.$el.children[0].children[0].innerHTML)
    this.vmInstance.$el.children[0].children[0].innerHTML = this.num;
    this.num += '11111';
    // this.vmInstance.$el.children[0].children[0].innerHTML = 'changed';
  }
  // 拖拽
  drag() {

  }




  // 关于选中
  // 选中之后

  // 这两个问题，可以试试在通过Billboard的方式添加的label上进行实现 --- billboard 不能添加 轮廓
}



