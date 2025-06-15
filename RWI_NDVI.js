var start = '2023-1-1';
var end   = '2023-12-31';
 
var biomaEstado = ee.FeatureCollection('projects/ee-efjustiniano/assets/
doutorado/tese/MunicBioma')
var IRS = ee.ImageCollection('projects/ee-efjustiniano/assets/IRS/IRS2023/
IRS2023_v2').median()
var IRS_mask = IRS.gt(500)

var e = Math.exp(1);
//print(e)
var pot = ee.Number(1 / e);
//print(pot)

var amazon = {
  biome:   'Amazon',
  divider: 4.859647,
  hexagon: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,   31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 
41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 
62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 
83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 
103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 
119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 
135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 
151, 152, 153, 154, 155, 156, 157, 158]
}

var caatinga = {
  biome:   'Caatinga',
  divider:  4.374323,
  hexagon: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
21, 22, 23, 24, 25, 26, 27, 28, 29, 30,   31, 32, 33, 34, 35, 36, 37, 38, 39]
}

var cerrado = {
  biome:  'Cerrado',
  divider: 4.816870,
  hexagon: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 
42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 
63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 
84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96]
}

var atlanticForest = {
  biome:  'AtlanticForest',
  divider: 5.103811,
  hexagon: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
21, 22, 23, 24, 25, 26, 27, 28, 29, 30,  31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 
41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 
62, 63, 64, 65, 66, 67, 68]
}

var pampa = {
  biome:    'Pampa',
  divider: 5.2449,
  hexagon: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
}

var areas = ['amazon', 'caatinga', 'cerrado', 'atlanticForest', 'pampa']

function L_NDVI(image) {
  var NDVI = image.normalizedDifference(['SR_B5', 'SR_B4']).
rename('NDVI').toDouble();
  return image.addBands(NDVI);
}

function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

function cloudMask(image) {
    var cloudShadowBitMask = 1 << 3;
    var cloudsBitMask = 1 << 5;
  
    var qa = image.select("QA_PIXEL");

    var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
        .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  
    // Retorna a imagem mascarada sem a banda QA
    return image.updateMask(mask)
        .copyProperties(image, ["system:time_start"]);
  }

function selectDictionary(dictName) {
  var dictionaries = {
    amazon:         amazon,
    caatinga:       caatinga,
    cerrado:        cerrado,
    atlanticForest: atlanticForest,
    pampa:          pampa
  };
  return dictionaries[dictName];
}

function getDictionaryValue(dictionary, key) {
  return dictionary[key];
}

areas.map(function(area){
  print(area)
  var dict = selectDictionary(area)
  print(dict)
  
  var divider = getDictionaryValue(dict, 'divider')
  var biome   = getDictionaryValue(dict, 'biome')
  var poligon = getDictionaryValue(dict, 'hexagon')
  print(poligon)

  var biomaSel = ee.FeatureCollection("projects/ee-efjustiniano/assets/doutorado/tese/BRbiomeTesseled/"+biome)
  //Map.addLayer(biomaSel)

  var nuvem = ee.Algorithms.If(
    ee.String(biome).equals('Caatinga'),60,
    40
    )

  poligon.map(function(tessel){
    //print(tessel)
    
    var biomaEst = biomaSel
      .filter(ee.Filter.eq("FID_tessel", tessel))
    
    function corta(image) {
      return image.clip(biomaEst);
    }
    
    var L9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
      .filterDate(start, end)
      .filterBounds(biomaEst)
      .filterMetadata('CLOUD_COVER', 'less_than', nuvem)
      .map(applyScaleFactors)
      .map(cloudMask)
      .map(corta)
      .map(L_NDVI)

    var L8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
      .filterDate(start, end)
      .filterBounds(biomaEst)
      .filterMetadata('CLOUD_COVER', 'less_than', nuvem)
      .map(applyScaleFactors)
      .map(cloudMask)
      .map(corta)
      .map(L_NDVI)
      
    var Landsat = L9.merge(L8)

    var NDVI = Landsat
      .select('NDVI')
      .max()
    //Map.addLayer(NDVI, false, 'NDVI')
    
    var b3pot = Landsat.median().select('SR_B3').pow(pot).divide(divider)
    var swir  = Landsat.select('SR_B5').median()
    
    var RWI = (b3pot.subtract(swir)).divide(b3pot.add(swir)).rename('RWI')
      
    var indexes = NDVI.addBands(RWI).updateMask(IRS_mask)//.clip(geometry)

    Export.image.toAsset(
        {
        image: indexes,
        description: biome+'_'+tessel,
        assetId: 'projects/ee-efjustiniano/assets/doutorado/tese/BRbiomeTesseled/
IRS_indexes/'+biome+'_'+tessel,region: biomaEst.geometry(),
        scale: 30,
        maxPixels: 1e13,
        crs: 'EPSG:4326'
    });
  })
})

