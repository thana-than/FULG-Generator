import pandas as pd
import requests
import json
import os
from pathlib import Path
from io import StringIO

SHEET_ID = '1CSLWxx2G-DMfz86OeVg5sdQ9WHRaZHk6DobeGzLtrXk'
NAME_GID = "315129900"
NAME_PATH = "./src/.generated/nameData.json"
SLOGAN_GID = "0"
SLOGAN_PATH = "./src/.generated/sloganData.json"

def download_sheet(ID, GID, path):
    url = f"https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}"    
    print(f"Downloading sheet data: {url}")
    response = requests.get(url)
    
    if response.status_code != 200:
        raise Exception(f"Failed to fetch sheet: HTTP {response.status_code}")
    
    Path(os.path.dirname(path)).mkdir(parents=True, exist_ok=True)
    
    data = {}
    csv = pd.read_csv(StringIO(response.text))
    for column in csv.columns:
        if column.startswith('Unnamed'):
            continue
        items = csv[column].dropna().tolist()
        data[column] = items

    with open(path, "w") as f:
        json.dump(data, f, indent=4)
    print(f"Successfully saved sheet data to {path}")

download_sheet(SHEET_ID, NAME_GID, NAME_PATH)
download_sheet(SHEET_ID, SLOGAN_GID, SLOGAN_PATH)