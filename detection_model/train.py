import os
import sys
import cv2
import numpy as np
import tensorflow as tf
import tensorflow.python.platform
import model

flags = tf.app.flags
FLAGS = flags.FLAGS
flags.DEFINE_string('train', 'data/train.txt', 'File name of train data')
flags.DEFINE_string('test', 'data/test.txt', 'File name of train data')
flags.DEFINE_string('train_dir', 'logs', 'Directory to put the training data.')

flags.DEFINE_integer('max_steps', 30, 'Number of steps to run trainer.')
flags.DEFINE_integer('batch_size', 10, 'Batch size'
                     'Must divide evenly into the dataset sizes.')
flags.DEFINE_float('learning_rate', 1e-4, 'Initial learning rate.')

def training(loss, learning_rate):
    """ 訓練のOpを定義する関数

    引数:
      loss: 損失のtensor, loss()の結果
      learning_rate: 学習係数

    返り値:
      train_step: 訓練のOp

    """

    train_step = tf.train.AdamOptimizer(learning_rate).minimize(loss)
    return train_step

def accuracy(logits, labels):
    """ 正解率(accuracy)を計算する関数

    引数: 
      logits: inference()の結果
      labels: ラベルのtensor, int32 - [batch_size, NUM_CLASSES]

    返り値:
      accuracy: 正解率(float)

    """
    correct_prediction = tf.equal(tf.argmax(logits, 1), tf.argmax(labels, 1))
    accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))
    tf.summary.scalar("accuracy", accuracy)
    return accuracy

if __name__ == '__main__':
    # ファイルを開く
    f = open(FLAGS.train, 'r')
    # データを入れる配列
    train_image = []
    train_label = []
    for line in f:
        # 改行を除いてスペース区切りにする
        line = line.rstrip()
        l = line.split()
        # データを読み込んで28x28に縮小
        img = cv2.imread(l[0])
        img = cv2.resize(img, (model.IMAGE_SIZE, model.IMAGE_SIZE))
        # 一列にした後、0-1のfloat値にする
        train_image.append(img.flatten().astype(np.float32)/255.0)
        # ラベルを1-of-k方式で用意する
        tmp = np.zeros(model.NUM_CLASSES)
        tmp[int(l[1])] = 1
        train_label.append(tmp)
    # numpy形式に変換
    train_image = np.asarray(train_image)
    train_label = np.asarray(train_label)
    f.close()

    f = open(FLAGS.test, 'r')
    test_image = []
    test_label = []
    for line in f:
        line = line.rstrip()
        l = line.split()
        img = cv2.imread(l[0])
        img = cv2.resize(img, (model.IMAGE_SIZE, model.IMAGE_SIZE))
        test_image.append(img.flatten().astype(np.float32)/255.0)
        tmp = np.zeros(model.NUM_CLASSES)
        tmp[int(l[1])] = 1
        test_label.append(tmp)
    test_image = np.asarray(test_image)
    test_label = np.asarray(test_label)
    f.close()
    
    with tf.Graph().as_default():
        # 画像を入れる仮のTensor
        images_placeholder = tf.placeholder("float", shape=(None, model.IMAGE_PIXELS))
        # ラベルを入れる仮のTensor
        labels_placeholder = tf.placeholder("float", shape=(None, model.NUM_CLASSES))
        # dropout率を入れる仮のTensor
        keep_prob = tf.placeholder("float")

        # inference()を呼び出してモデルを作る
        logits = model.inference(images_placeholder, keep_prob)
        # loss()を呼び出して損失を計算
        loss_value = model.loss(logits, labels_placeholder)
        # training()を呼び出して訓練
        train_op = training(loss_value, FLAGS.learning_rate)
        # 精度の計算
        acc = accuracy(logits, labels_placeholder)

        # 保存の準備
        saver = tf.train.Saver()
        # Sessionの作成
        sess = tf.Session()
        # 変数の初期化
        sess.run(tf.initialize_all_variables())
        # TensorBoardで表示する値の設定
        summary_op = tf.summary.merge_all()
        summary_writer = tf.summary.FileWriter(FLAGS.train_dir, sess.graph_def)
        
        # 訓練の実行
        for step in range(FLAGS.max_steps):
            for i in range(int(len(train_image)/FLAGS.batch_size)):
                # batch_size分の画像に対して訓練の実行
                batch = FLAGS.batch_size*i
                # feed_dictでplaceholderに入れるデータを指定する
                sess.run(train_op, feed_dict={
                  images_placeholder: train_image[batch:batch+FLAGS.batch_size],
                  labels_placeholder: train_label[batch:batch+FLAGS.batch_size],
                  keep_prob: 0.5})

            # 1 step終わるたびに精度を計算する
            train_accuracy = sess.run(acc, feed_dict={
                images_placeholder: train_image,
                labels_placeholder: train_label,
                keep_prob: 1.0})
            print("step %d, training accuracy %g"%(step, train_accuracy))

            # 1 step終わるたびにTensorBoardに表示する値を追加する
            summary_str = sess.run(summary_op, feed_dict={
                images_placeholder: train_image,
                labels_placeholder: train_label,
                keep_prob: 1.0})
            summary_writer.add_summary(summary_str, step)

    # 訓練が終了したらテストデータに対する精度を表示
    print("test accuracy %g"%sess.run(acc, feed_dict={
        images_placeholder: test_image,
        labels_placeholder: test_label,
        keep_prob: 1.0}))

    # 最終的なモデルを保存
    checkpoint_file = os.path.join(FLAGS.train_dir, 'model.ckpt')
    save_path = saver.save(sess, checkpoint_file)
