#!/usr/bin/env python
# coding: utf-8

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

import seaborn as sns
get_ipython().run_line_magic('matplotlib', 'inline')

listIndex = ['NDVI', 'RWI', 'MNDWI', 'NDWI']
listBioma =  ['Brasil', 'Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa']

# ## Sample points

import os
path = 'C:\\Users\\eduju\\OneDrive\\Documentos\\Doutorado\\tese\\scripts\\data'
os.chdir(path)

df = pd.read_csv('bandsIndex.csv', sep=',', decimal='.')
df = df[df['type'] == 'sample']

print('total: ', len(df))
print('urb: ', len(df[df['Class'] == 'urb']))
print('veg: ', len(df[df['Class'] == 'veg']))
print('wat: ', len(df[df['Class'] == 'wat']))

def reclassifyUrb(value):
    if value == 'urb':
        return 1
    if value == 'veg':
        return 2
    if value == 'wat':
        return 3

df['classNum'] = df['Class'].apply(reclassifyUrb)
df = df.dropna(subset=['classNum'])

print(len(df))

def histograma(dfb, index, bioma):
    
    urb = dfb[dfb['classNum'] == 1]
    urb_index = urb[index]
    
    veg = dfb[dfb['classNum'] == 2]
    veg_index = veg[index]
    
    wat = dfb[dfb['classNum'] == 3]
    wat_index = wat[index]
    
    plt.figure(figsize=(12,2))
    
    sns.kdeplot(urb_index, label = index+' - Urb', color='red', bw_adjust=0.25, cut=0)
    sns.kdeplot(veg_index, label = index+' - Veg', color='green', bw_adjust=0.25, cut=0)
    sns.kdeplot(wat_index, label = index+' - Wat', color='blue', bw_adjust=0.25, cut=0)
    
    plt.title(index+' - '+bioma)#+') - Estimativa de Densidade Kernel')
    plt.xlabel('Valor')
    plt.ylabel('Densidade')
    
    plt.xlim([-1.1, 1.1])
    plt.ylim([0, 13])
    plt.legend()
    plt.savefig(bioma+' - '+index+'kde.jpg', bbox_inches='tight', dpi=600)
    plt.show()

for bioma in listBioma:
    print(f"\033[1m{bioma}\033[0m")
    if bioma == 'Brasil':
        dfb = df
    elif bioma != 'Brasil':
        dfb = df[df['Bioma'] == bioma]
    
    for index in listIndex:
        #dfb = dfb['index', 'classNum']
        histograma(dfb, index, bioma)
