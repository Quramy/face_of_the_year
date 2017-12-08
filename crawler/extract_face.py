#!/usr/bin/env python

import cv2
import sys
import glob

cascade_path = '../opencvjs/test/data/haarcascade_frontalface_default.xml'
classifier = cv2.CascadeClassifier(cascade_path)

files = [f for f in glob.glob('data/raw_images/*') if f.endswith("jpeg") or f.endswith("png") or f.endswith("jpg")]
for f in files:
    img = cv2.imread(f)
    faces = classifier.detectMultiScale(img, scaleFactor=1.1, minNeighbors=1, minSize=(1, 1))
    if len(faces) == 1:
        print(f)
        rect = faces[0]
        roi = img[rect[1]:rect[1] + rect[3], rect[0]:rect[0] + rect[2]]
        cv2.imwrite(f.replace('raw_images', 'cropped').replace('_raw', '').replace('.png', '.jpeg'), roi)
    #else:
    #    cv2.imwrite(f.replace('raw_images', 'cropped').replace('_raw', '_xxx').replace('.png', '.jpeg'), img)
