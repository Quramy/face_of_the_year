import { CheckpointLoader, NDArray, NDArrayMath, NDArrayMathGPU, Array1D, Array2D, Array4D } from "deeplearn";

function createInfer(math: NDArrayMath,  vars: { [varName: string]: NDArray }) {
  // セッションのチェックポイント時点における変数を復元
  const W_conv1 = vars["conv1/weights"] as Array4D;
  const b_conv1 = vars["conv1/biases"] as Array1D;
  const W_conv2 = vars["conv2/weights"] as Array4D;
  const b_conv2 = vars["conv2/biases"] as Array1D;
  const W_fc1 = vars["fc1/weights"] as Array2D;
  const b_fc1 = vars["fc1/biases"] as Array1D;
  const W_fc2 = vars["fc2/weights"] as Array2D;
  const b_fc2 = vars["fc2/biases"] as Array1D;

  console.log(W_fc2.shape);

  return (x: Array4D) => {
    //
    // メモ stridesやカーネルサイズは幅と高さの分だけでよい
    //
    // ```py
    //    return tf.nn.conv2d(x, W, strides=[1, 1, 1, 1], padding='SAME')
    // ```
    //
    // のstridesは、[バッチ、幅、高さ、チャネル数] だけど、jsでは真ん中2個だけしか使わないということっぽい
    // maxPoolでもおなじ。
    //
    const conv2d = (input: Array4D, weight: Array4D) => math.conv2d(input, weight, null, [1, 1], "same");
    const max_pool_2x2 = (x: NDArray) => math.maxPool(x, [2, 2], [2, 2], "same");

    // 畳み込み層1の作成
    const h_conv1 = math.relu(math.add(conv2d(x, W_conv1), b_conv1));

    // プーリング層1の作成
    const h_pool1 = max_pool_2x2(h_conv1) as Array4D;

    // 畳み込み層2の作成
    const h_conv2 = math.relu(math.add(conv2d(h_pool1, W_conv2), b_conv2));

    // プーリング層2の作成
    const h_pool2 = max_pool_2x2(h_conv2) as Array4D;

    // 全結合層1の作成
    const h_pool2Mat = h_pool2.as2D(1, 7 * 7 * 64);
    const h_fc1 = math.relu(math.add(math.matMul(h_pool2Mat, W_fc1), b_fc1)) as Array2D;

    // 全結合層2, softmax
    const y_conv = math.softmax(math.add(math.matMul(h_fc1, W_fc2), b_fc2));

    return y_conv as Array2D;
  };
}

export async function restoreAndCreateInfer(checkpointManifestUrl: string) {
  const variableLoader = new CheckpointLoader(checkpointManifestUrl);
  const math = new NDArrayMathGPU();
  const vars = await variableLoader.getAllVariables();
  return createInfer(math, vars);
}
