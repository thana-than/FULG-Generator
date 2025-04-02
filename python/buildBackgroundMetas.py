import os
import warnings
import re

FOLDER_PATH = "./src/parts/background"
PART_EXTENSIONS = re.compile(r'\.(png|jpe?g|webp)$')
DEFAULT_JSON = '{ "type": "background" }'

def fillMeta(dir, defaultContentsJSON):
    if not os.path.exists(dir):
        warnings.warn(f"Directory path does not exist: {dir}")
        return
    
    print(f"Completing metas for directory: {dir}")
    additions = 0

    contents = os.listdir(dir)
    for entry in contents:
        filename, file_extension = os.path.splitext(entry)
        if not re.match(PART_EXTENSIONS, file_extension):
            continue

        file_path = os.path.join(dir, entry)
        json_path = file_path.rsplit(os.extsep,1)[0] + '.json'

        if os.path.exists(json_path): #* Meta already exists, ignore this file
            continue

        additions += 1

        with open(json_path, 'w') as f:
            print(f"Writing default meta for {json_path}")
            f.write(defaultContentsJSON)

        print(f"Created {additions} additional meta files.")

fillMeta(FOLDER_PATH, DEFAULT_JSON)
print(f"Finished filling metas.")