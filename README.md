# face of the year '17

## デモ
[ここから](https://quramy.github.io/face_of_the_year/)確認できます。

## なにこれ
画像をドラッグ&ドロップすると、下記に分類する（だけの）Webアプリケーションです。

- ブルゾンちえみ
- 高橋一生
- カズオ イシグロ
- 吉岡里帆
- 藤井聡太

Webブラウザのみで完結して動作するのが特徴です。

詳細は https://qiita.com/Quramy/items/d94178a830ff5e75e571 を読んでください。

## 実行方法

必要なもの:

- Python: 3+
- OpenCV (Python bindings): 3+
- Node.js: 8+
- Docker

必要であれば、virtualenv等で環境を切ってください。Python 3.6で動作させています
Dockerではなく、emsdkを直接使うことも可能ですが、Python, Node, clangが汚染されるため `source emsdk_env.sh` をしたシェルで.jsや.pyは実行しない方が良いです。

### TensorFlow 訓練

```sh
pip install -r requirements.txt
cd tf_model
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
