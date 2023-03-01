// let a = [
//     0,1,2,3,4,5,6,7,
//     0,1,2,3,4,5,6,7,
// ]
// let row = 2;
// let column = 8;


// let b = [];
// for (let i = 0; i < row; i++) {
//     for (let p = 0; p < column; p++) {
//         let cur = a[i * column + p];
//         console.log('%c [ cur ]-12', 'font-size:13px; background:pink; color:#bf2c9f;', cur)
//         b.push(cur);
//         // cur 里的每一组数据里取 相同 index, index - 1  的数据
//     }
// }
// console.log('%c [ b ]-848', 'font-size:13px; background:pink; color:#bf2c9f;', b);

// var arr = [
//   1, 2, 3, 4, 5,
//   6, 7, 8, 9, 10
// ];
// var map = [2, 5]; //define a "map" that specifies the size of each row:
// var row = 1;
// var col = 3;
// // var index = map[row] + col; // index = 8
// var index = row*5 + col; // index = 8
// var value = arr[index]; // value = 9
// console.log( "%c [ value ]-848", "font-size:13px; background:pink; color:#bf2c9f;", value );

// function one2TwoDimensionalArray(sourceArray,row,column){
//   let b = [];
//   for (let i = 0; i < row; i++) {
//       for (let p = 0; p < column; p++) {
//           let cur = sourceArray[i * column + p];
//           b.push(cur);
//       }
//   }
//   return b;
// }

let IndexDatatype = 90;// assume 3 * 30;
let a = []
for (let i = 0; i < IndexDatatype; i++){
  a.push(i);
  a.push(i);
  a.push(i);
}
console.log('%c [ a ]-49', 'font-size:13px; background:pink; color:#bf2c9f;', a.length)
let indices = [];
let row = 3;
let column = 30;
// let sourceArray = cur;
for (let i = 1; i < row; i++) {
    for (let p = 1; p <= column; p++) {
        // let curV = sourceArray[i * column + p];

        // let a = sourceArray[p - 1][i - 1];
        // let b = sourceArray[p - 1][i];
        // let c = sourceArray[p][i - 1];
        // let d = sourceArray[p][i];
        // let a = sourceArray[(i-1) * column + (p-1)];
        // let b = sourceArray[    i * column + (p-1)];
        // let c = sourceArray[(i-1) * column + p    ];
        // let d = sourceArray[    i * column + p    ];
        let a = (i-1) * column + (p-1);
        let b =     i * column + (p-1);
        let c = (i-1) * column + p    ;
        let d =     i * column + p    ;

      console.log('a', a,'b', b,'c', c,'d', d);
        // a-b-c-b-c-d
        // indices.push(a);
        // indices.push(b);
        // indices.push(c);
        // indices.push(b);
        // indices.push(c);
        // indices.push(d);
    }
}