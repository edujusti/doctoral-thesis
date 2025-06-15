#!/usr/bin/env python
# coding: utf-8
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import math
from math import(e)
import seaborn as sns
get_ipython().run_line_magic('matplotlib', 'inline')

# ## Sample points
import os
path = 'C:\\Users\\eduju\\OneDrive\\Documentos\\Doutorado\\tese\\scripts\\data'
os.chdir(path)
df = pd.read_csv('bandsIndex.csv', sep=',', decimal='.')
df = df[df['type'] == 'sample'] # para amostras de validação,
                                # trocar por ‘validation’
print(len(df))
print(len(df))
print('veg: ', len(df[df['Class'] == 'veg']))
print('urb: ', len(df[df['Class'] == 'urb']))
print('wat: ', len(df[df['Class'] == 'wat']))
print(df.head(1))

listBioma = ['Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa']
listIndex = ['NDVI', 'RWI', 'MNDWI', 'NDWI']#, 'DIFF']
listIndex_BR = ['NDVI', 'RWIBrasil', 'MNDWI', 'NDWI']
listCat = ['veg', 'urb', 'wat']
print(listCat)
colors = {'veg': '#33FF57', 'urb': '#FF5733', 'wat': '#33C3FF'}
# Pantanal tinha somente seis amostras. Foi agrupado em Cerrado
def reclassifyNonZero(value):
    if value != 0:
        return 'ok'
df['valid'] = df['RWI'].apply(reclassifyNonZero)
df = df.dropna(subset=['valid'])
print(len(df))
print('veg: ', len(df[df['Class'] == 'veg']))
print('urb: ', len(df[df['Class'] == 'urb']))
print('wat: ', len(df[df['Class'] == 'wat']))
def thresholds(dfb, category, index):
    # Filtrar os dados pela categoria
    categoryData = dfb[dfb['Class'] == category][index]
    quartile_1 = np.percentile(categoryData, 25)
    quartile_3 = np.percentile(categoryData, 75)
    iqr = quartile_3 - quartile_1
    inferiorLimit = quartile_1 - 1.5 * iqr
    upperLimit = quartile_3 + 1.5 * iqr
    outliers = categoryData[(categoryData < inferiorLimit) | (categoryData > upperLimit)]
    return quartile_1, quartile_3, iqr, inferiorLimit, upperLimit, outliers
def bigode(index, area, df_b):
    position = []
    fig, ax = plt.subplots(figsize=(2, 3))
    for i, category in enumerate(listCat):
        dataCat = df_b[df_b['Class'] == category][index]
        box = ax.boxplot(dataCat, positions=[i], widths=0.5, patch_artist=True)
        for element in ['boxes', 'whiskers', 'fliers', 'medians', 'caps']:
            plt.setp(box[element], color=colors[category])
        plt.setp(box['boxes'], facecolor=colors[category])
        position.append(i)
    ax.set_xticks(position)
    ax.set_xticklabels(colors.keys())
    ax.set_title(biome+': '+index)
    ax.set_ylabel(index)
    plt.savefig(area+'_Boxplot_'+index+'.jpg', bbox_inches='tight', dpi=600)
df_b = df
biome = 'Brasil'
for index in listIndex_BR:
    print()
    print('estatística para '+index, biome)
    plotBox = bigode(index, biome, df_b)
    print()
    for category in listCat:
        quartile_1, quartile_3, iqr, inferiorLimit, upperLimit, outliers = thresholds(df_b, category, index)
        print(category)
        #print(f"Quartile 1: {quartile_1}")
        #print(f"Quartil3 3: {quartile_3}")
        #print(f"IQR: {iqr}")
        print(f"Inferior limit: {round(inferiorLimit,4)}")
        print(f"Superior limit: {round(upperLimit,4)}")
        #print(f"Outliers: {outliers}")
    print('__________________________________________________________________________')

for biome in listBioma:
    df_b = df[df['Bioma'] == biome]
    for index in listIndex:
        print(biome+' estatistic for '+index)
        plotBox = bigode(index, biome, df_b)
        print()
        for category in listCat:
            quartile_1, quartile_3, iqr, inferiorLimit, upperLimit, outliers = thresholds(df_b, category, index)
            print(category)
            #print(f"Quartile 1: {quartile_1}")
            #print(f"Quartil3 3: {quartile_3}")
            #print(f"IQR: {iqr}")
            print(f"Inferior limit: {round(inferiorLimit,4)}")
            print(f"Superior limit: {round(upperLimit,4)}")
            #print(f"Outliers: {outliers}")
        print('__________________________________________________________________________')
