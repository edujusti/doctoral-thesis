#!/usr/bin/env python
# coding: utf-8

import numpy as np
import pandas as pd

from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# ## Sample points

import os
path = 'C:\\Users\\eduju\\OneDrive\\Documentos\\Doutorado\\tese\\scripts\\data'
#os.listdir(path)
os.chdir(path)

df = pd.read_csv('bandsIndex.csv', sep=',', decimal='.')

df = df[df['Class'] != 'dou']
df = df[df['NDVI'] != 0]

def reclassifyUrb(value):
    if value == 'urb':
        return 1
    if value == 'veg':
        return 0
    if value == 'wat':
        return 0

df['ClassNum'] = df['Class'].apply(reclassifyUrb)

listBioma = ['Brasil', 'Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa']

for bioma in listBioma:
    print(bioma)

    if bioma == 'Brasil':
        dfIndex = df[['NDVI', 'RWI', 'ClassNum', 'type', 'Bioma']]
    
    elif bioma != 'Brasil':
        dfIndex = df[['NDVI', 'RWI', 'ClassNum', 'type', 'Bioma']]
        dfIndex = dfIndex[dfIndex['Bioma'] == bioma]
    
    dfSample = dfIndex[dfIndex['type'] == 'sample'].drop('type', axis = 1).drop('Bioma', axis = 1)
    dfValid  = dfIndex[dfIndex['type'] == 'validation'].drop('type', axis = 1).drop('Bioma', axis = 1)
    print('Amostras urbano:'+str(len(dfValid[dfValid['ClassNum'] == 1])))
    print('Amostras não urbano:'+str(len(dfValid[dfValid['ClassNum'] == 0])))
    
    X_train = dfSample[['NDVI', 'RWI']]
    y_train = dfSample['ClassNum']

    X_val = dfValid[['NDVI', 'RWI']]
    y_val = dfValid['ClassNum']
    
    svm_model = SVC(kernel='rbf', C=1, gamma='scale') # Você pode escolher outros kernels, como 'rbf'
    svm_model.fit(X_train, y_train)
    
    y_pred = svm_model.predict(X_val)
    
    accuracy = accuracy_score(y_val, y_pred)
    print(f"Acurácia do modelo: {accuracy:.5f}%")

    print("Matriz de Confusão:")
    print(confusion_matrix(y_val, y_pred))
#    
#    print("\nRelatório de Classificação:")
#    print(classification_report(y_val, y_pred))
#    
#    print("\nAcurácia:")
#    print(f"{accuracy_score(y_val, y_pred):.2f}")
#
    print()
    print('__________________________________')
