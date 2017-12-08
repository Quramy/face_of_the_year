importScripts('wasm-util.js', 'module.js', '../built/cv-wasm.js');

function mat2Image(mat) {
  const width = mat.cols, height = mat.rows, channels = mat.channels(), data = new Uint8Array(mat.data());
  return {
    width,
    height,
    channels,
    data,
  };
}

function detectFace(input, roi) {
    const classfier = new cv.CascadeClassifier();
    classfier.load('../../test/data/haarcascade_frontalface_default.xml');
    const img = cv.matFromArray(input, 24);
    const imgColor = new cv.Mat();
    cv.cvtColor(img, imgColor, cv.ColorConversionCodes.COLOR_RGBA2BGR.value, 0);
    const faces = new cv.RectVector();
    const s1 = [0, 0];
    const s2 = [0, 0];
    classfier.detectMultiScale(imgColor, faces, 1.1, 3, 0, s1, s2);
    console.log(faces);

    let x;
    if (!faces.size()) {
      x = imgColor;
    } else {
      const rect = faces.get(0);
      console.log(rect.x, rect.y, rect.width, rect.height);
      x = imgColor.getROI_Rect(rect);
    }
    const resized = new cv.Mat();
    cv.resize(x, resized, [28, 28], 0, 0, 0);
    const out = mat2Image(resized);
    img.delete();
    imgColor.delete();
    faces.delete();
    classfier.delete();
    return out;
}

addEventListener("message", ev => {
  const meta = ev.data;
  switch (meta.type) {
    case "req_match":
      const { img } = ev.data;
      const out = detectFace(img);
      postMessage({ type: 'res_match', out }, [out.data.buffer]);
      break;
    default:
  }
});

Module.onInit(cv => postMessage({ type: "init" }));
