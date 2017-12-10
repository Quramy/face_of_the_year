#!/usr/bin/env python

import sys
import numpy as np
import tensorflow as tf
import cv2
import model

test_image = []
for i in range(1, len(sys.argv)):
    img = cv2.imread(sys.argv[i])
    img = cv2.resize(img, (model.IMAGE_SIZE, model.IMAGE_SIZE))
    test_image.append(img.flatten().astype(np.float32) / 255.0)
test_image = np.asarray(test_image)

images_placeholder = tf.placeholder("float", shape=(None, model.IMAGE_PIXELS))
labels_placeholder = tf.placeholder("float", shape=(None, model.NUM_CLASSES))
keep_prob = tf.placeholder("float")

sess = tf.InteractiveSession()
logits = model.inference(images_placeholder, keep_prob)

saver = tf.train.Saver()
sess.run(tf.global_variables_initializer())
saver.restore(sess, "logs/model.ckpt")

for i in range(len(test_image)):
    prob = logits.eval(feed_dict={images_placeholder: [test_image[i]], keep_prob: 1.0 })[0]
    pred = np.argmax(prob)
    print(pred, prob)
