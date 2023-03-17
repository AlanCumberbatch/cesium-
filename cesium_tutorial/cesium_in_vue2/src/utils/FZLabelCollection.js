import DivLabel from "./DivLabel";

/*
  想怎么用呢？
  把这个当作是 DivLabel 的 Collection， 然后进行相关的操作
*/

class FZLabelCollection{
  constructor(viewer) {
    if (!viewer) { throw('viewer is needed when initialize FZLabelCollection.'); }
    this.viewer = viewer;
    this.collection = [];
  }

  add(labelOpt) {
    /*
      {
        position: [lng, lat], // 传入的是经纬度
        height: 0.0,// 这个是距离地表的高度
        title: ' ',
        id: ' ',
      }
    */
    let label =  new DivLabel({
      viewer: this.viewer,
      position: labelOpt.position, // [-82.97763582628434, 33.53847169305344],//此时传入的是经纬度
      height: labelOpt.height, // 10,
      title: labelOpt.title, // 'CL标签3333',
      id: labelOpt.id, // '210201025'
    })

    this.collection.push(label);

    return label;
  }

  get(labelId) {
    for (let i = 0; i < this.collection.length; i++){
      if (this.collection[i].id == labelId) {
        return this.collection[i];
      }
    }
    return false;
  }

  /*
    在这里里面的方法都决定全部的状态，如果想操作单独的，那就 获取某个单独的，然后进行操作
  */

  destroy() {
    for (let i = 0; i < this.collection.length; i++){
      this.collection[i].destroy();
    }
  }
  display() {
    for (let i = 0; i < this.collection.length; i++){
      this.collection[i].display();
    }
  }

  update() {

  }

  // 关于选中
  // 把 label 的Cartesian3 ===》 Cartesian2(屏幕坐标)， 同时获取这个 label 的width， height，然后进行判断，
  // 这种计算方式？ 如果有很多个 label 堆叠在一起怎么办？ 那就需要算出来 选中的那个点所对应的那条 ray 上，那个 label 在最上面。
  // 具体：
  //  1. 确定有哪些可能点击到的 label ---》
  //  2. 确定这些 label 哪一个应该是被选中的 ---
    /*
      鼠标单击的时候，相关的点有2个。
      Cartesian2 --- 屏幕坐标
      Cartesian3 --- 三维世界中的坐标

      label 本身，传入的 经纬度， position 是 三维世界中的坐标

      所以？屏幕坐标进行比较？ Cartesian3 中进行比较？

      Cartesian3 中如何比较？
        在确定当前的 点击position的 Ray 经过 label 所在的平面之后，能够确定可能选中的 label 有哪些。
        然后通过 Ray 与 label 所在平面的交点 ？这个交点能算吗？然后计算出长度，长度最小的那个就是被选中的那个。
      Cartesian2 中如何比较？
        把 每一个 label 的position 都 转到 Cartesian2，然后直接进行比较。
        最终选择哪个呢？

      感觉： 在 Cartesian3 中确定可能被选中的label，然后多个的话，再变成 Cartesian2 中进行判断选择哪个  ？？ --- 感觉不对。。。。
      那就是在 Cartesian2 中判断 可能被选中的 label 们，然后在 Cartesian3 中进行判断最终选择哪个

      那就在 DivLabel 内部写一个方法进行判断，是否在 Cartesian2 中能否被选中，
      判断可以之后，如果是多个，再 利用 label 的Cartesian3 中的 position 进行判断

      2023.03.14
      目前确定的方案是：在 Cartesian2 中判断能否被选中，然后如果存在重叠，那就是根据label的创建顺序，（也是因为在页面渲染的时候，后创建的label会放在前面）
    */
  getSelected(clickPosition) {// clickPosition <Cartesian2>

    let accessibleLabels = [];

    // let accessibleLabels = labels.map(item => {
    //   if (item.accessibleOrNot(click.position)) {
    //     return item;
    //   }
    // })// [DivLabel, DivLabel, undefined]

    for (let i = 0; i < this.collection.length; i++){

      let label = this.collection[i];

      if (label.accessibleOrNot(clickPosition)) {//TODO: 方法里面获取的width，height存在偏差，具体偏差哪里来需要确认并整理
        accessibleLabels.push(label);
      }
    }
    // 在测试的时候发现，和label创建的顺序强相关。。。。
    // 那 labels.selectedOrNot 就暂时不用了，直接取 labels 里的最后一个
    if (accessibleLabels.length > 0) {
      return accessibleLabels[accessibleLabels.length - 1];
    }

    return false;
  }
}

export default FZLabelCollection;