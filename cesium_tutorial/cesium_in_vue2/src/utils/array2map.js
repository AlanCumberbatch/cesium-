function array2map(array) {
 return array.reduce(function (map, object) {
     map[object.name] = object;
     return map;
 }, {});
}
export default array2map