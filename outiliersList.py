#!/usr/bin/env python
# coding: utf-8

import pandas as pd
pd.set_option('display.max_rows', None) # possibilita exibir cabeçalhos grandes
import os
path = 'C:\\Users\\eduju\\OneDrive\\Documentos\\Doutorado\\tese\\scripts\\data'
os.chdir(path)
df = pd.read_csv('bandsIndex.csv', sep=',', decimal='.')
df = df[df['Class'] != 'dou']
print(len(df))
veg = df[df['Class'] == 'veg']
urb = df[df['Class'] == 'urb']
wat = df[df['Class'] == 'wat']
# ##### Baixos valores de NDVI em vegetação
print(veg[['Code', 'NDVI', 'Munic']].sort_values(by=['NDVI'], ascending=True).head(50))
# ##### Baixos valores de RWI em água
print(wat[['Code', 'RWI', 'Munic']].sort_values(by=['RWI'], ascending=True).head(50))
# ##### Baixos valores de MNDWI em água
print(wat[['Code', 'MNDWI', 'Munic']].sort_values(by=['MNDWI'], ascending=True).head(50))
# ##### Baixos valores de NDWI em água
print(wat[['Code', 'NDWI', 'Munic']].sort_values(by=['NDWI'], ascending=True).head(50))
# ##### Altos valores de NDVI em urbano
print(urb[['Code', 'NDVI', 'Munic']].sort_values(by=['NDVI'], ascending=False).head(50))
# ##### Altos valores de RWI em urbano
print(urb[['Code', 'RWI', 'Munic']].sort_values(by=['RWI'], ascending=False).head(50))
# ##### Altos valores de MNDWI em urbano
print(urb[['Code', 'MNDWI', 'Munic']].sort_values(by=['MNDWI'], ascending=False).head(50))
# ##### Altos valores de NDWI em urbano
print(urb[['Code', 'NDWI', 'Munic']].sort_values(by=['NDWI'], ascending=False).head(50))
# ##### valores altos de NDVI em água
print(wat[['Code', 'NDVI', 'Munic']].sort_values(by=['NDVI'], ascending=False).head(50))
# ##### valores altos em RWI em vegetação
print(veg[['Code', 'RWI', 'Munic']].sort_values(by=['RWI'], ascending=False).head(50))
# Petrópolis: sombra de escarpa
# Rio de Janeiro: borda de mangue
# ##### valores altos em MNDWI em vegetação
print(veg[['Code', 'MNDWI', 'Munic']].sort_values(by=['MNDWI'], ascending=False).head(50))
# ##### valores altos em NDWI em vegetação
print(veg[['Code', 'NDWI', 'Munic']].sort_values(by=['NDWI'], ascending=False).head(50)
