var biomaEstado = ee.FeatureCollection('projects/ee-efjustiniano/assets/doutorado/tese/MunicBioma')

var indexes = ee.ImageCollection('projects/ee-efjustiniano/assets/doutorado/
tese/BRbiomeTesseled/IRS_indexes').max()

var amazonia = {
  bioma:    'Amazônia',
  NDVI_T:   0.640058479532164,
  RWI_T:   -0.284999645748623,
  UF:      ['Acre', 'Amapá', 'Amazonas', 'Maranhão', 'Mato Grosso', 'Pará', 
            'Rondônia', 'Roraima', 'Tocantins'],
}

var caatinga = {
  bioma:    'Caatinga',
  NDVI_T:   0.657483722354633,
  RWI_T:   -0.241659326102412,
  UF:      ['Alagoas', 'Bahia', 'Ceará', 'Minas Gerais', 'Piauí',
            'Rio Grande do Norte', 'Sergipe', 'Paraíba', 'Pernambuco'],
}

var cerrado = {
  bioma:    'Cerrado',
  NDVI_T:   0.580394041326286,
  RWI_T:   -0.236792357604956,
  UF:      ['Bahia', 'Distrito Federal', 'Goiás', 'Maranhão', 'Mato Grosso', 
            'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraná', 'Piauí', 
            'Rondônia', 'São Paulo', 'Tocantins'],
}

var mataAtlantica = {
  bioma:    'Mata Atlântica',
  NDVI_T:   0.634084675828271,
  RWI_T:   -0.256099325715535,
  UF:      ['Alagoas', 'Bahia', 'Espírito Santo', 'Goiás', 'Mato Grosso do Sul', 
            'Minas Gerais', 'Paraíba', 'Paraná', 'Pernambuco', 'Rio de Janeiro', 
            'Rio Grande do Norte', 'Rio Grande do Sul', 'Santa Catarina',
            'São Paulo', 'Sergipe'],
}

var pampa = {
  bioma:    'Pampa',
  NDVI_T:   0.623519759923141,
  RWI_T:   -0.244878122651833,
  UF:      ['Rio Grande do Sul'],
}

var areas = ['amazonia', 'caatinga', 'cerrado', 'mataAtlantica', 'pampa']

function selectDictionary(dictName) {
  var dictionaries = {
    amazonia:      amazonia,
    caatinga:      caatinga,
    cerrado:       cerrado,
    mataAtlantica: mataAtlantica,
    pampa:         pampa
  };
  return dictionaries[dictName];
}


function getDictionaryValue(dictionary, key) {
  return dictionary[key];
}

areas.map(function(area){
  var dict = selectDictionary(area)
  
  var NDVI_T  = getDictionaryValue(dict, 'NDVI_T')
  var RWI_T   = getDictionaryValue(dict, 'RWI_T')
  var bioma   = getDictionaryValue(dict, 'bioma')
  var UF      = getDictionaryValue(dict, 'UF')

  var biomaSel = biomaEstado
    .filter(ee.Filter.eq("Bioma", bioma))
  Map.addLayer(biomaSel, false, bioma, false)
   
  UF.map(function(estado){
    
    var biomaEst = biomaSel
      .filter(ee.Filter.eq("NM_UF", estado))
    //print(biomaEst)
    
    var RWI  = indexes.select('RWI').lte(RWI_T).clip(biomaEst)
    var NDVI = indexes.select('NDVI').lte(NDVI_T).clip(biomaEst)
    
    var thresholded = RWI.multiply(NDVI)
    var veu = thresholded.updateMask(thresholded)
    var veu2 = ee.Image.pixelArea().updateMask(veu.mask())

    var pixelMunic = veu2.reduceRegions({
      collection: biomaEst,
      reducer: ee.Reducer.sum(),
      scale: 30,
    });
    
    pixelMunic = pixelMunic.map(function(feature) {
      var areaKm2 = ee.Number(feature.get('sum')).divide(1e6); // De m² para km²
      return feature.set('area_km2', areaKm2); // Adiciona como propriedade
    });
    
    function normalizeName(name) {
      var noSpaces = name.replace(/\s+/g, ''); // remove estaços em branco
      var normalized = noSpaces // remove caracteres acentuados e cê-cedilha
        .replace(/[áàâãä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòôõö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[ñ]/g, 'n');
      
      return normalized;
    }

    var biomaEstadoDescription = normalizeName(bioma+'_'+estado)
 
    Export.table.toDrive({
      collection: pixelMunic,
      description: biomaEstadoDescription,
      selectors: ['Bioma', 'CD_MUN', 'NM_MUN', 'NM_UF', 'area_km2', 'municBioma'],
      folder: 'AreaMunic',
      fileFormat: 'CSV'
    });
  })
})
