var start = '2023-1-1';
var end   = '2023-12-31';

var brazil = ee.FeatureCollection('users/efjustiniano/maps/BR_UF_2021');

var points = ee.FeatureCollection("projects/ee-efjustiniano/assets/doutorado/tese/allPoints_20240924")

var caatinga =   ee.FeatureCollection('projects/ee-efjustiniano/assets/doutorado/BrCaatinga');
var noCaatinga = ee.FeatureCollection('projects/ee-efjustiniano/assets/doutorado/BrWithoutCaatinga');

var urban = points
  .select('Class')
  .filter(ee.Filter.eq("Class", 'urb'));

var veg = points
  .select('Class')
  .filter(ee.Filter.eq("Class", 'veg'));

var water = points
  .select('Class')
  .filter(ee.Filter.eq("Class", 'wat'));

Map.addLayer(points, {}, "pontos", false);

Map.addLayer(urban.draw({color: 'red'}), {}, 'Urban');
Map.addLayer(veg.draw({color: 'Green'}), {}, 'Vegetation');
Map.addLayer(water.draw({color: 'blue'}), {}, 'Water');

function L_NDWI(image) {
  var ndwi = image.normalizedDifference(['SR_B3', 'SR_B5']).rename('NDWI').toDouble();
  return image.addBands(ndwi);
}

function L_MNDWI(image) {
  var mndwi = image.normalizedDifference(['SR_B3', 'SR_B6']).rename('MNDWI').toDouble();
  return image.addBands(mndwi);
}

function L_NDVI(image) {
  var NDVI = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI').toDouble();
  return image.addBands(NDVI);
}

function clipCaatinga(image) {
  var img = image
  return image.clip(caatinga);
}

function clipNoCaatinga(image) {
  var img = image
  return image.clip(noCaatinga);
}

function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

function cloudMask(image) {
    // Os bits 3 e 5 são sombra de nuvem e nuvem, respectivamente.
    var cloudShadowBitMask = 1 << 3;
    var cloudsBitMask = 1 << 5;
  
    var qa = image.select("QA_PIXEL");
  
    // Busca condição clara (0)
    var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
        .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  
    // Retorna a imagem mascarada sem a banda QA
    return image.updateMask(mask)
        .copyProperties(image, ["system:time_start"]);
  }


var L9_40 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterDate(start, end)
  .filterBounds(points)
  .filterMetadata('CLOUD_COVER', 'less_than', 40)
  .map(applyScaleFactors)
  .map(cloudMask)
  .map(clipNoCaatinga)
  .map(L_MNDWI)
  .map(L_NDWI)
  .map(L_NDVI)

var L9_60 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterDate(start, end)
  .filterBounds(points)
  .filterMetadata('CLOUD_COVER', 'less_than', 60)
  .map(applyScaleFactors)
  .map(cloudMask)
  .map(clipCaatinga)
  .map(L_MNDWI)
  .map(L_NDWI)
  .map(L_NDVI)
  ;

var L8_40 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterDate(start, end)
  .filterBounds(points)
  .filterMetadata('CLOUD_COVER', 'less_than', 40)
  .map(applyScaleFactors)
  .map(cloudMask)
  .map(clipNoCaatinga)
  .map(L_MNDWI)
  .map(L_NDWI)
  .map(L_NDVI)

var L8_60 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterDate(start, end)
  .filterBounds(points)
  .filterMetadata('CLOUD_COVER', 'less_than', 60)
  .map(applyScaleFactors)
  .map(cloudMask)
  .map(clipCaatinga)
  .map(L_MNDWI)
  .map(L_NDWI)
  .map(L_NDVI)
  ;
  
var L9 = L9_40.merge(L9_60).merge(L8_40).merge(L8_60)
Map.addLayer(L9.median(), imageVisParam, 'Landsat')

var veg = L9.select('NDVI').max()

var L9_selection = L9
  .select('NDWI', 'MNDWI', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6')
  .median()
  .addBands(veg)


var sample = L9_selection.sampleRegions({
  collection: points,
  geometries: true,
  scale: 10
});

Export.table.toDrive({
  collection: ee.FeatureCollection(sample),
  description: 'Tese_points_2024-12-23_Landsat',
  fileFormat: 'CSV',
  folder: 'tese',
  selectors: ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'NDVI', 'NDWI', 'MNDWI', 'Bioma', 'Class', 'Code', 'Munic', 'UF', 'classNum', 'codMunic', 'faixa', 'img', 'pop', 'type']
});
