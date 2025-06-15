#!/usr/bin/env python
# coding: utf-8
import numpy as np
import pandas as pd
import math
from math import(e)
# ## Sample points
import os
path = 'C:\\Users\\eduju\\OneDrive\\Documentos\\Doutorado\\tese\\scripts\\data'
os.chdir(path)
df = pd.read_csv('Points_2024-12-23_Landsat.csv', sep=',', decimal='.')
print(df.head(1))
print(len(df))
df = df[df['Class'] != 'doubt']
df = df[df['NDVI'] != 0]
print(len(df))
print('veg: ', len(df[df['Class'] == 'veg']))
print('urb: ', len(df[df['Class'] == 'urb']))
print('wat: ', len(df[df['Class'] == 'wat']))
def powe(number):
    return number ** (1 / e)
df['SR_B3Pow'] = df['SR_B3'].apply(powe)
print(df.head(1))
listBioma = ['Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa']
### Pantanal tinha somente seis amostras. Foi agrupado em Cerrado
print(df['SR_B3'].median())
print(df['SR_B3Pow'].median())
df['brDivider'] = df['SR_B3Pow'].median() / df['SR_B3'].median()
df['brPowDiv'] = df['SR_B3Pow'] / df['brDivider']
df['RWIBrasil'] = (df['brPowDiv'] - df['SR_B6']) / (df['brPowDiv'] + df['SR_B6'])
df['MNDWI'] = (df['SR_B3'] - df['SR_B6']) / (df['SR_B3'] + df['SR_B6'])
df['NDWI'] = (df['SR_B3'] - df['SR_B5']) / (df['SR_B3'] + df['SR_B5'])
biomaValue = {}
for bioma in listBioma:
    biomaValue[bioma] = (df[df['Bioma'] == bioma]['SR_B3Pow'].median()) / (df[df['Bioma'] == bioma]['SR_B3'].median())
df['divider'] = df['Bioma'].map(biomaValue)
df['SR_B3powDiv']  = df['SR_B3Pow'] / df['divider']
df['RWI'] = (df['SR_B3powDiv'] - df['SR_B6']) / (df['SR_B3powDiv'] + df['SR_B6'])
print('____________________')
unique_cities = df['divider'].unique()
print(df.head(1))
df.dropna(subset=['NDWI', 'RWI', 'MNDWI', 'NDWI'])
df.to_csv('bandsIndex.csv')
