import os
import json
import warnings
import re
import hashlib

part_extensions = r'\.(png|jpe?g|webp)'

#* Generate imports for json files into arrays based on each part
def getAllParts(directory):
    contents = os.listdir(directory)
    str_contents = str(contents)
    parts = []
    failures = 0

    if len(contents) == 0: return

    for entry in contents:
        source_path = os.path.join(directory, entry)
        filename, file_extension = os.path.splitext(entry)

        if os.path.isdir(source_path):
            #* March through dictionary
            _childParts, _childFailures = getAllParts(source_path)
            parts.extend(_childParts)
            failures += _childFailures
        elif re.match(part_extensions, file_extension.lower()):
            #* Quick check to see if there are any stranded image files
            if not os.path.exists(os.path.join(directory, filename) + '.json'):
                warnings.warn(f'Image file {source_path} does not have a matching JSON.')
                failures += 1
        elif entry.lower().endswith('.json'):
            #* Test if image exists before adding
            match = re.search(filename+part_extensions, str_contents)
            if match:
                _img = os.path.join(directory, match[0])  #* Use the first found match
            else:
                warnings.warn(f'JSON file {source_path} does not have a matching image file.')
                failures += 1
                continue

            _type = ''
            with open(source_path) as f:
                try:
                    d = json.load(f)
                    if 'type' in d:
                        _type = d['type']
                    else:
                        warnings.warn(f'Json file {source_path} does not include part tag.')
                except json.decoder.JSONDecodeError:
                    warnings.warn(f'Json file {source_path} is invalid.')

            if _type =='':
                failures += 1
                continue

            _hash = generate_file_hash_name(source_path, entry)

            parts.append({
                "type" : _type,
                "hash" : _hash,
                "img" : _img,
                "json" : source_path, 
            })

    return parts, failures

def generate_file_hash_name(full_path, file_name):
    _file, _ext = os.path.splitext(file_name)
    _file = os.path.basename(_file)
    hashStr = os.path.basename(os.path.dirname(full_path)) + _file

    hash_object = hashlib.md5(hashStr.encode())
    file_hash = hash_object.hexdigest()
    return f"{_file}_{file_hash}"

def generate_dynamic_imports_js(parts, filename, pathKey, importPathPrefix, makeDynamicModule):
    #* Build types
    types = {}
    for part in parts:
        if part['type'] not in types:
            types[part['type']] = []

        _path = part[pathKey].replace("\\","/")
        types[part['type']].append({
            'hash': part['hash'],
            'path': f'{importPathPrefix}{_path}'
        })

    content = ''
    for key in types:
        content += buildContentFunctionBlock(f'parts_{pathKey}', key, types[key], makeDynamicModule)

    #* Write the content to the output file
    with open(filename, 'w') as f:
        f.write(content)

def buildContentFunctionBlock(chunkName, functionName, importObjects, makeDynamicModule):
    content = f'export const {functionName} = ' + "{\n"
    
    #* Add each file to the gameFiles object
    #* Each line adds a dynamic import for webpack to handle. We use webpackChunkName to ensure the files all share the same pack.
    dynAdd = '() => import' if makeDynamicModule else 'require'
    for obj in importObjects:
         content += f"    '{obj['hash']}': {dynAdd}(/* webpackChunkName: \"{chunkName}\" */ '{obj['path']}'),\n"
    
    #* Close the object
    content += "};\n"
    return content;


###* MAIN *###

print("Generating Part Imports")

os.chdir('./src/')
directory_path = './parts'
outDir = './.generated/'
importPathPrefix = '.' #* Add a little dot so we know to go back a directory from the outDir

if not os.path.exists(outDir):
    os.mkdir(outDir)

parts, failures = getAllParts(directory_path)
print(f'Collected {len(parts)} parts.')

generate_dynamic_imports_js(parts, os.path.join(outDir,'partJSON.js'), 'json', importPathPrefix, False)
print('Generated partJSON.js')
generate_dynamic_imports_js(parts, os.path.join(outDir,'partIMG.js'), 'img', importPathPrefix, True)
print('Generated partIMG.js')
print('Part Generation Complete!')

if failures > 0:
    print(f'{failures} parts failed collection.')