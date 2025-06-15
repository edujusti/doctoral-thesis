#!/usr/bin/env python
# coding: utf-8

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.metrics import auc, roc_curve, roc_auc_score

listIndex = ['RWI', 'MNDWI', 'NDWI']
listBiome =  ['Brazil', 'Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa']


import os
path = 'C:\\Users\\eduju\\OneDrive\\Documentos\\Doutorado\\tese\\scripts\\data'
os.chdir(path)

df = pd.read_csv('bandsIndex.csv', sep=',', decimal='.')
dfValidation = df[df['type'] == 'validation']

df = df[df['type'] == 'sample']


print('total: ', len(df))
print('urb: ', len(df[df['Class'] == 'urb']))
print('veg: ', len(df[df['Class'] == 'veg']))
print('wat: ', len(df[df['Class'] == 'wat']))

def reclassifyVeg(value):
    if value == 'urb':
        return 0
    if value == 'veg':
        return 1
    if value == 'wat':
        return 0

df['veg'] = df['Class'].apply(reclassifyVeg)
df = df.dropna(subset=['veg'])

def reclassifyWat(value):
    if value == 'urb':
        return 0
    if value == 'veg':
        return 0
    if value == 'wat':
        return 1

df['wat'] = df['Class'].apply(reclassifyWat)
df = df.dropna(subset=['wat'])
print(len(df))

def reclassifyNonZero(value):
    if value != 0:
        return 'ok'

df['valid'] = df['RWI'].apply(reclassifyNonZero)
df = df.dropna(subset=['valid'])

def classRoc(dfb, col1, col2, biome, index='NDVI'):
    y_true = dfb[col1]
    y_prob = dfb[col2]
    
    fpr, tpr, thresholds = roc_curve(y_true, y_prob)
    auc = roc_auc_score(y_true, y_prob)

    diff = np.abs(tpr - (1 - fpr))
    
    indices = np.argsort(diff)[:1]
    selected_thresholds = thresholds[indices]
    
    selected_fpr = fpr[indices]
    selected_tpr = tpr[indices]
    print()
    print(index)
    print(f'AUC: {auc}')

    plt.figure(figsize=(3, 3))
    plt.plot(fpr, tpr, color='blue', lw=1)#, label='Curva ROC')

    x_position = 0.5  # Posição X do texto
    y_position = 0.1  # Posição Y do texto
    plt.text(x_position, y_position, f'AUC = {auc:.5f}', fontsize=9, color='black', 
         bbox=dict(facecolor='white', edgecolor='black', boxstyle='round,pad=0.5'))
    
    
    plt.scatter(selected_fpr, selected_tpr, color='red')#, label='Limiar(es) Selecionado(s)')
    plt.plot([0, 1], [0, 1], color='gray', linestyle='--', label='Aleatório')
    
    plt.xlabel('Taxa de Falsos Positivos (TFP)')
    plt.ylabel('Taxa de Verdadeiros Positivos (TVP)')
    
    plt.title(biome+' - '+index.replace('Brasil', ''))
    
    plt.xlim(0, 1)
    plt.ylim(0, 1)
    
    #plt.savefig(biome+' - '+index+'_RocCurve.jpg', bbox_inches='tight', dpi=600)
    plt.show()
    
    return(selected_thresholds[0], selected_fpr[0], selected_tpr[0])


def limiarVeg(dfb, col1, col2, biome, index='NDVI'):

    print('Pontos totais: '+str(len(dfb)))
    waterLen = len(dfb[dfb['Class'] == 'wat'])
    print('Pontos da classe água: '+str(waterLen))

    
    limiarNDVI, FPR, TPR = classRoc(dfb, col1, col2, biome, index)
    print('NDVI: ',round(limiarNDVI, 4))
    print('TPR: ', round(TPR, 5))
    print('TNR: ', round(1-FPR, 5))
    #print('Differ: ', round(TPR-(1-FPR), 5))

    dfc = dfb[dfb['NDVI'] < limiarNDVI]
    print('Pontos da classe urb eliminados pelo NDVI: '+str(len(dfb[dfb['Class'] == 'urb']) - len(dfc[dfc['Class'] == 'urb'])))
    print('Pontos da classe wat mantidos pelo NDVI: '  +str(len(dfc[dfc['Class'] == 'wat'])))
    print('Pontos da classe veg eliminados pelo NDVI: '  +str(len(dfc[dfc['Class'] == 'veg'])))
    print()
    return(limiarNDVI)

def limiarWat(dfb, dfc, col1, col2, biome, index):
    
    limiarWat, FPR, TPR = classRoc(dfb, col1, col2, biome, index)
    print(index,': ',round(limiarWat, 4))
    print('TPR: ', round(TPR, 5))
    print('TNR: ', round(1-FPR, 5))

    dfd = dfc[dfc[index] < limiarWat]
    
    print('Pontos adicionais da classe urb eliminados pelo '+index.replace('Brasil', '')+': ' + 
          str(len(dfc[dfc['Class'] == 'urb']) - len(dfd[dfd['Class'] == 'urb'])))
    
    print('Pontos remanescente da classe veg eliminados pelo '+index.replace('Brasil', '')+': ' + 
          str(len(dfc[dfc['Class'] == 'veg']) - len(dfd[dfd['Class'] == 'veg'])))
    
    print('Pontos remanescente da classe wat eliminados pelo '+index.replace('Brasil', '')+': ' + 
          str(len(dfc[dfc['Class'] == 'wat']) - len(dfd[dfd['Class'] == 'wat'])))
    
    return(limiarWat)

def accuracy(biome, index, limiarNDVI, limiarIndex):

    if biome == 'Brazil':
        dfacc = dfValidation
    elif biome != 'Brazil':
        dfacc = dfValidation[dfValidation['Bioma'] == biome]

    urban    = dfacc[dfacc['Class'] == 'urb']
    urbanLen = len(urban)
    print('UrbanLen', urbanLen)

    urban = urban[(urban['NDVI'] <= limiarNDVI) & (urban[index] <= limiarIndex)]
    
    sensibility = len(urban) / urbanLen

    nonUrban = dfacc[dfacc['Class'] != 'urb']
    nonUrbanLen = len(nonUrban)

    nonUrban = nonUrban[(nonUrban['NDVI'] > limiarNDVI) | (nonUrban[index] > limiarIndex)]
    
    specificity = len(nonUrban) / nonUrbanLen

    
    print('Sensibility: ', round(sensibility, 4))
    print('Specificity: ', round(specificity, 4))
    print('Differ: '     , round(sensibility-specificity, 4))
    print('Accuracy: '   , round((len(nonUrban)+len(urban))/len(dfacc),4))


for biome in listBiome:
    print(f"\033[1m{biome}\033[0m")
    if biome == 'Brazil':
        dfb = df
        dfc = df
        col1 = 'veg'
        col2 = 'NDVI'
        index = 'NDVI'

        limiarNDVI = limiarVeg(dfb, col1, col2, biome, index)
        
        for index in listIndex:

            col1 = 'wat'
            col2 = index

            limiarIndex = limiarWat(dfb, dfc, col1, col2, biome, index)
            
            #sensibility = accuracy(biome, index, limiarNDVI, limiarIndex)
            accuracy(biome, index, limiarNDVI, limiarIndex)
            print('______________________________________________')

    elif biome != 'Brazil':
        dfb = df[df['Bioma'] == biome]
        dfc = dfb
        col1 = 'veg'
        col2 = 'NDVI'
        index = 'NDVI'

        limiarIndex = limiarVeg(dfb, col1, col2, biome, index)

        for index in listIndex:

            col1 = 'wat'
            col2 = index

            limiarIndex = limiarWat(dfb, dfc, col1, col2, biome, index)
            dfval = dfValidation[dfValidation['Bioma'] == biome]
            sensibility = accuracy(biome, index, limiarNDVI, limiarIndex)
            print('______________________________________________')

    print('______________________________________________')
    print('______________________________________________')
    print()


