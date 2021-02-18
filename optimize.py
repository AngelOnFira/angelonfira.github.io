from PIL import Image
from os import listdir
from os.path import isfile, join, splitext

path = "img"
output = "img/opt"
files = [f for f in listdir(path) if isfile(join(path, f))]

# print(files)

MAX_WIDTH = 400

for file in files:
    image = Image.open(join(path, file))

    if image.size[0] > MAX_WIDTH:
        image = image.resize(
            (
                int(image.size[0] / (image.size[0] / MAX_WIDTH)),
                int(image.size[1] / (image.size[0] / MAX_WIDTH)),
            ),
            Image.ANTIALIAS,
        )

    image = image.convert('RGB')

    print(join(output, splitext(file)[0].replace("-", "_") + ".jpg"))
    image.save(join(output, splitext(file)[0].replace("-", "_") + ".jpg"), optimize=True, quality=80)
