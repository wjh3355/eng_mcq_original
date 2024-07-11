import pandas as pd
import numpy as np

df = pd.read_json('data/debug.json')

pd.set_option('display.max_columns', 500)

print(df)

df.to_excel('Book1.xlsx')