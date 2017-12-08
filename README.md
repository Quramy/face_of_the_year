# face of the year '17

## デモ
[ここから](https://quramy.github.io/face_of_the_year/)確認できます。

## なにこれ
をドラッグ&ドロップすると、下記に分類する（だけの）Webアプリケーションです。

- ブルゾンちえみ
- 高橋一生

Webブラウザのみで完結して動作するのが特徴です。

## 実行方法

必要なもの:

- Python: 3+
- Node.js: 8+
- OpenCV: 3+
- Docker

### TensorFlow 訓練

```sh
cd detection_model
wget https://s3-us-west-2.amazonaws.com/face-of-the-year/data.tgz
tar xvfz data.tgz
./train.py
```

### OpenCV wasmビルド

```sh
git submodule init
git submodule update
cd opencvjs
docker-compose build
docker-compose run --rm emcc
mkdir -p front/built
cp build/* ../front/built
```

### フロント

```sh
cd front
yarn install
yarn manifest
yarn run webpack
yarn start
open http://localhost:8000
```
