import sys
import cv2
import numpy as np
import json, codecs

outname = sys.argv[2]
img = cv2.imread(sys.argv[1])
img = cv2.resize(img, (28, 28))
x = img.flatten().astype(np.float32)/255.0
json.dump(x.tolist(), codecs.open(outname, 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=2)

