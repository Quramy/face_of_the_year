// import { restoreAndCreateInfer } from "./inference";
// import { Array1D } from "deeplearn";
// 
// async function getData() {
//   const res = await fetch("sample_data.json");
//   const data = await res.json();
//   const image1 = data.images[0] as number[];
//   const ret = [] as number[];
//   image1.forEach(x => {
//     ret.push(x);
//     ret.push(x);
//     ret.push(x);
//   });
//   return ret;;
// }
// 
// async function readJsonImageData(url: string) {
//   const res = await fetch(url);
//   const data = await res.json() as number[];
//   return Array1D.new(data).as4D(1, 28, 28, 3);
// }
// 
// async function main() {
//   const infer = await restoreAndCreateInfer("model");
//   const x = await readJsonImageData("dog.0.json");
//   const logits = infer(x);
//   console.log(logits.get(0, 0), logits.get(0, 1));
// }
// 
// main();
