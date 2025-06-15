var IVE_T = 500;
var roadValue = 318;
 
// Brazilian border
var brazil = ee.FeatureCollection('projects/ee-efjustiniano/assets/doutorado/BR_2021');
var LTBvalue = 1000; //LTB: landuse, transport, building
// LTB area
var LTB_area =  ee.FeatureCollection('users/efjustiniano/IRS2023/LTB/LTB_area')
  .select('b1');
  
var LTB_img = ee.ImageCollection('users/efjustiniano/IRS2023/LTB/LTB').sum()
  
var LTBAreaImg = LTB_area
  .reduceToImage({
    properties: ['b1'], // don't forget this field value 1
    reducer: ee.Reducer.sum()
})
  .rename('b1')
  .multiply(IVE_T)
  .multiply(1.1)
  .unmask();
  
var LTB = LTB_img.add(LTBAreaImg)
Map.addLayer(LTB, {min:0, max:550}, 'LTB Area', false)

// Residential area
var residentialArea =  ee.FeatureCollection('users/efjustiniano/IRS2023/residential/residential_area')
    //.select('b1');
var residential_img = ee.ImageCollection('users/efjustiniano/IRS2023/residential/residential').sum()
var residentialAreaImg = residentialArea
  .reduceToImage({
    properties: ['b1'],
    reducer: ee.Reducer.sum()
})
  .rename('b1')
  .multiply(IVE_T)
  .multiply(1.1)
  .unmask();
var residential = residential_img.add(residentialAreaImg)
Map.addLayer(residential, {min:0, max:550}, 'Residential Area', false)
// streets, avenues and roads kernell
var IRS_maxClass1 = IVE_T * 0.99
function maxvalue(image) {
  var value1 = image.gte(IRS_maxClass1).multiply(IRS_maxClass1)
  var value2 = image.lt(IRS_maxClass1).multiply(image)
  return value1.add(value2)
}
var roadsClass_1 = ee.ImageCollection('users/efjustiniano/IRS2023/roads/class1')
  .map(maxvalue)
  .max()
  .unmask()
  ;
var roadsClass_2 = ee.ImageCollection('users/efjustiniano/IRS2023/roads/class2')
  .map(maxvalue)
  .max()
  .unmask()
//  .multiply(0)
  ;
  
var roadsClass_1_2 = roadsClass_1.add(roadsClass_2)
roadsClass_1_2 = roadsClass_1_2.where(roadsClass_1_2.gt(400), 400)
var roadsClass_3 = ee.ImageCollection('users/efjustiniano/IRS2023/roads/class3')
  .max()
  .unmask()
var roadsClass_4 = ee.ImageCollection('users/efjustiniano/IRS2023/roads/class4')
  .max()
  .unmask()
  .divide(4);
  
var roadsClass_5 = ee.ImageCollection('users/efjustiniano/IRS2023/roads/class5')
  .max()
  .unmask()
  .divide(6);
  
var roads = roadsClass_1_2.add(roadsClass_3).add(roadsClass_4).add(roadsClass_5)//.add(nonUrbanImg)
//Map.addLayer(roads, {min:500, max:800, opacity: 0.5}, "índice de vias", false)
// omissões e comissões
var fbq = ee.FeatureCollection('users/efjustiniano/IRS2023/missFalse/fbq')
var miss = ee.FeatureCollection('users/efjustiniano/IRS2023/missFalse/miss')
var fbqImg = fbq
  .reduceToImage({
    properties: ['b1'], // don't forget this field value 1
    reducer: ee.Reducer.max()
})
  .rename('b1')
  .multiply(-1000)
  .unmask();
  
var missImg = miss
  .reduceToImage({
    properties: ['b1'], // don't forget this field value 1
    reducer: ee.Reducer.max()
})
  .rename('b1')
  .multiply(1000)
  .unmask();
var adjust = fbqImg.add(missImg).clip(brazil)
//var road_1 = roads.gte(0).multiply(roads)
//var road_2 = roads.lt(0).multiply(0)
//var roadSum = road_1.add(road_2)
//Map.addLayer(roadSum, {min:0, max:1200, opacity: 0.5}, "índice de vias 2", false)
//var roadscompare =roadsClass_1.add(roadsClass_2).add(roadsClass_3)
//Map.addLayer(roadscompare, {min:0, max:1200, opacity: 0.5}, "índice de vias - comparação", false)

var joinCollections = ee.ImageCollection([roads, LTB, residential, adjust])
  .sum()
  .clip(brazil)
  .reproject('EPSG:4326', null, 10);
var joined = joinCollections.where(joinCollections.gt(1000), 1000)
joined = joined.where(joined.lt(0), 0)
Map.addLayer(joined, {min: IVE_T, max:700, opacity:0.4}, 'IRS', false)

var areas = ee.FeatureCollection('projects/ee-efjustiniano/assets/doutorado/BR_tesseled');
Map.addLayer(areas, false, 'Áreas')
var hexList = ee.List.sequence(1, 470)
   
hexList.map(function(hex){
  var areaReg = areas.select('area').filter(ee.Filter.eq('area', hex))
  var joinedArea = joined.clip(areaReg)
  Export.image.toAsset(
      {
      image: joinedArea,
      description: 'area_'+hex,
      assetId: 'users/efjustiniano/IRS2023/IRS2023_v1/area_'+hex,
      region: areaReg.geometry(),
      scale: 30,
      maxPixels: 1e13,
      crs: 'EPSG:4326'
    });
  });
  

