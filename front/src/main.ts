import { restoreAndCreateInfer } from "./inference";
import { Array1D } from "deeplearn";

function showSpinner(msg: string) {
  document.querySelector(".spin-wrap").classList.remove("hide");
  document.querySelector(".spin-message").innerHTML = msg || "loading...";
}

function hideSpinner() {
  document.querySelector(".spin-wrap").classList.add("hide");
  document.querySelector("body").classList.remove("loading");
}

function showSpinnerBtn() {
  document.querySelector("#btn").classList.add("loading");
}

function hideSpinnerBtn() {
  document.querySelector("#btn").classList.remove("loading");
}

function handleDragover(e: DragEvent) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
}

function handleDropFile(canvasId: string, e: DragEvent) {
  e.stopPropagation();
  e.preventDefault();
  var files = e.dataTransfer.files; // FileList object.
  var file = files[0];
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function(){
    loadImage(reader.result, canvasId);
  }
}

function showImage({ channels, data, width, height }: Image, canvasId: string){
  const canvas = document.querySelector("#" + canvasId) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = width;
  canvas.height = height;
  const imgData = ctx.createImageData(width, height);
  for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
    imgData.data[j] = data[i];
    imgData.data[j + 1] = data[i + 1 % channels];
    imgData.data[j + 2] = data[i + 2 % channels];
    imgData.data[j + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
}

function getInput(canvasId: string) {
  var canvas = document.querySelector("#" + canvasId) as HTMLCanvasElement;
  var ctx = canvas.getContext("2d");
  var { width, height, data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { width, height, data };
}

function loadImage(path: string, canvasId: string) {
  const img = new Image();
  return new Promise(resolve => {
    img.onload = () => {
      const canvas = document.querySelector("#" + canvasId) as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.src = path
  });
}

type Image = {
  channels: number;
  width: number;
  height: number;
  data: Uint8Array;
};

function startCalc(worker: Worker) {
  const img = getInput("img");
  showSpinnerBtn();
  worker.postMessage({ type: "req_match", img }, [img.data.buffer]);
}

function toFloatList(data: Uint8Array) {
  const out = new Array(data.length);
  for (let i = 0; i < data.length; ++i) {
    out[i] = data[i] / 255.0;
  }
  return Array1D.new(out).as4D(1, 28, 28, 3);
}


async function main() {
  const infer = await restoreAndCreateInfer("model");
  const worker = new Worker("worker.js");
  worker.addEventListener("message", (ev) => {
    const meta = ev.data;
    switch (meta.type) {
      case "init":
        hideSpinner();
        break;
      case "res_match":
        hideSpinnerBtn();
        const img = ev.data.out as Image;
        const input = toFloatList(img.data);
        showImage(ev.data.out, "output");
        const logits = infer(input);
        console.log(logits.get(0, 0), logits.get(0, 1));
        break;
      default:
    }
  });

  loadImage("assets/sample.jpg", "img");

  document.querySelector("#btn").addEventListener("click", () => startCalc(worker));
}

main();