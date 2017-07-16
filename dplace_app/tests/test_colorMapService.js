/* Tests ColorMapService, which has functions:
    tempColor(index, min, max, name)
    mapColor(index, count)
    mapColorMonochrome(min, max, value, color)
    generateColorMap(results)
    
*/

describe('Color Map Service Testing', function() {
    var mockColorService, mockResults, society, society2, society3;
    
    beforeEach(function() {
        module('dplaceServices');
    });
    
    beforeEach(inject(function(colorMapService) {
        mockColorService = colorMapService;
        mockResults = {
            'societies': [],
            'environmental_variables': [],
            'geographic_regions': [],
            'languages': [],
            'variable_descriptions': []
        }; //used to store the mock results for the test
        
        society = {
            'society': { 'id': 11264 }, 
            'environmental_values': [],
            'geographic_regions': [],
            'variable_coded_values': []
        };
        
        society2 = {
            'society': { 'id': 16 }, 
            'environmental_values': [],
            'geographic_regions': [],
            'variable_coded_values': []
        };
        
        society3 = {
            'society': { 'id': 46 }, 
            'environmental_values': [],
            'geographic_regions': [],
            'variable_coded_values': []
        };
        
    }));
    
    it('geographic region color map', function() {
        
        var geographic_region = {
            'continent': "AFRICA",
            'count': 71,
            'id': 7398,
            'level_2_re': 24,
            'region_nam': "Northeastern Africa",
            'tdwg_code': 24
        };

        society.society.region = geographic_region;
        mockResults.geographic_regions.push(geographic_region);
        mockResults.societies.push(society);
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.geographic_regions.codes).toBeDefined();
        expect(results.geographic_regions.codes[geographic_region.tdwg_code]).toBe('rgb(255,0,0)');
    });
    
    it('environmental color map', function() {
        var environmental_variable = {
            'min': -17,
            'max': 29,
            'variable': {
                'id': 317,
                'name': "Temperature",
                'data_type': 'Continuous',
                'type': 'environmental'
            },
            'codes': []
        };
        
        var environmental_value = {
            'coded_value_float': 18.25,
            'variable': 317,
        };
        
        var categorical_env_variable = {
            'codes': [
                {'code': 'NA', 'description': 'Missing data'},
                {'code': '1', 'description': 'Biome 1'},
                {'code': '2', 'description': 'Biome 2'},
                {'code': '3', 'description': "Biome 3"},
                {'code': '4', 'description': "Biome 4"},
            ],
            'variable': {
                'id': 318,
                'data_type': 'Categorical', 
                'type': 'environmental',
                'name': 'Biome'
            }
            
        }
        mockResults.environmental_variables.push(environmental_variable);
        mockResults.environmental_variables.push(categorical_env_variable);
        society.environmental_values.push(environmental_value);
        mockResults.societies.push(society);
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.societies[0].environmental_values[0].color).toBe('rgb(255,238,0)');
        expect(results.environmental_variables[1].codes.codes).toBeDefined();
        expect(results.environmental_variables[1].codes.codes['NA']).toBe('rgb(255,255,255)');
        expect(results.environmental_variables[1].codes.codes[1]).toBe('rgb(0,204,255)');
        expect(results.environmental_variables[1].codes.codes[2]).toBe('rgb(0,255,102)');
        expect(results.environmental_variables[1].codes.codes[3]).toBe('rgb(102,255,0)');
        expect(results.environmental_variables[1].codes.codes[4]).toBe('rgb(255,204,0)');
    });
    
    it('cultural variable map', function() {
        var variable_description = {
            'codes': [
                {'code': 'NA', 'description': 'Missing data'},
                {'code': '1', 'description': 'Absence of slavery'},
                {'code': '2', 'description': 'Incipient or nonhereditary slavery, i.e., where slave status is temporary and not transmitted to the children of slaves'},
                {'code': '3', 'description': "Slavery reported but not identified as hereditary or nonhereditary"},
                {'code': '4', 'description': "Hereditary slavery present and of at least modest social significance"},
            ],
            'variable': {
                'id': 1628,
                'data_type': 'Categorical',
                'type': 'cultural',
                'name': 'Slavery'
            }
        };
        
        var variable_description_2 = {
            'codes': [
                {'code': 'NA', 'description': 'Missing data'},
                {'code': '21', 'description': 'Absence of slavery'},
                {'code': '22', 'description': 'Incipient or nonhereditary slavery, i.e., where slave status is temporary and not transmitted to the children of slaves'},
                {'code': '23', 'description': "Slavery reported but not identified as hereditary or nonhereditary"},
                {'code': '24', 'description': "Hereditary slavery present and of at least modest social significance"},
            ],
            'variable': {
                'id': 1628,
                'data_type': 'Categorical',
                'type': 'cultural',
                'name': 'Slavery'
            }
        };
        
        var coded_value = {
            'coded_value': '1',
            'variable': 1628,
            'code_description': variable_description.codes[1]
        };
        
        var coded_value_na = { //check missing data
            'coded_value': 'NA',
            'variable': 1628,
            'code_description': variable_description.codes[0]
        };
        
        var continuous_variable = {
            'min': 0,
            'max': 1000,
            'variable': {
                'id': 66,
                'name': "Population",
                'data_type': 'Continuous',
                'type': 'cultural'
            },
            'codes': []
        };
        var coded_float = {
            'coded_value_float': 250,
            'coded_value': 250,
            'variable': 66
        };
        
        var coded_float_2 = {
            'coded_value_float': 11,
            'coded_value': 11,
            'variable': 66
        };
        
        mockResults.variable_descriptions.push(variable_description);
        mockResults.variable_descriptions.push(continuous_variable);
        mockResults.variable_descriptions.push(variable_description_2);
        society.variable_coded_values.push(coded_value);
        society2.variable_coded_values.push(coded_value_na);
        society2.variable_coded_values.push(coded_float);
        society.variable_coded_values.push(coded_float_2);
        mockResults.societies.push(society);
        mockResults.societies.push(society2);
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.variable_descriptions[0].codes.codes).toBeDefined();
        expect(results.variable_descriptions[1].codes.codes).not.toBeDefined();
        expect(results.variable_descriptions[2].codes.codes).toBeDefined()
        expect(results.variable_descriptions[0].codes.codes[1]).toEqual('rgb(228,26,28)');
        expect(results.variable_descriptions[0].codes.codes['NA']).toEqual('rgb(255,255,255)'); 
        expect(results.variable_descriptions[0].codes.codes[2]).toEqual('rgb(69,117,180)');
        expect(results.variable_descriptions[0].codes.codes[3]).toEqual('rgb(77,146,33)');
        expect(results.variable_descriptions[0].codes.codes[4]).toEqual('rgb(152,78,163)');
        expect(results.variable_descriptions[2].codes.codes[21]).toEqual('rgb(69,117,180)');
        expect(results.variable_descriptions[2].codes.codes[24]).toEqual('rgb(255,127,0)');
    });
    
    
    it('should use monochromatic scale for ordinal variables', function() {
        var variable_description = {
            'codes': [
                {'code': 'NA', 'description': '0-25%'},
                {'code': '1', 'description': '26-50%'},
                {'code': '2', 'description': '51-75%'},
                {'code': '3', 'description': '76-100%'}
            ],
            'variable': {
                'id': 1934,
                'data_type': 'Ordinal',
                'type': 'cultural'
            }
        };
        
        var coded_value = {
            'coded_value': '1',
            'variable': 1934,
            'code_description': variable_description.codes[1]
        };
        
        mockResults.variable_descriptions.push(variable_description);
        society.variable_coded_values.push(coded_value);
        mockResults.societies.push(society);
        var results = mockColorService.generateColorMap(mockResults);
        //check to make sure it isn't assigning the color from colorMap
        expect(results.variable_descriptions[0].codes.codes).toBeDefined();
        expect(results.variable_descriptions[0].codes.codes[1]).not.toEqual('rgb(228,26,28)');
        expect(results.variable_descriptions[0].codes.codes[1]).toEqual('rgb(97,222,97)');
    
    });
    
    it('language family map', function() {
        var language1 = {
            'family': {
                'id': 11,
                'language_count': 11,
                'name': 'Family 1',
                'scheme': 'G'
            },
            'glotto_code': "abcd1234",
            'id': 1100,
            'iso_code': "abc",
            'name': "ABCD"
         
        };
        var language2 = {
            'family': {
                'id': 58,
                'name': 'Austronesian',
                'scheme': 'G'
            },
            'glotto_code': "efgh1234",
            'id': 1110,
            'iso_code': "efg",
            'name': "SFGH"
         
        };
        
        var language3 = {
            'family': {
                'id': 58,
                'name': 'Austronesian',
                'scheme': 'G'
            },
            'glotto_code': "lmno1234",
            'id': 1110,
            'iso_code': "lmn",
            'name': "LMNO"
         
        };

        society.society.language = language1;
        society2.society.language = language2;
        society3.society.language = language3;
        mockResults.societies.push(society);
        
        //societies 2 and 3 have the same language family
        mockResults.societies.push(society2);
        mockResults.societies.push(society3);
        mockResults.languages = mockResults.languages.concat([language1, language2, language3]);
        mockResults.classifications = [
            {
                'id': 11,
                'name': 'Family 1',
                'scheme': 'G'
            },
            {
                'id': 58,
                'name': "Austronesian",
                'scheme': 'G'
            }
        ];
        
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.classifications.codes).toBeDefined();
        expect(results.classifications.codes[society.society.language.family.id]).toBe("rgb(255,0,0)");
        expect(results.classifications.codes[society2.society.language.family.id]).toBe('rgb(0,255,0)');
        expect(results.classifications.codes[society2.society.language.family.id]).toEqual(results.classifications.codes[society3.society.language.family.id]);
    });
    
    it('geographic regions and languages color map', function() {
        //when searching by geographic region and language family, should get colors for both but display only language family in directives.js
        var geographic_region = {
            'continent': "AFRICA",
            'count': 71,
            'id': 7398,
            'level_2_re': 24,
            'region_nam': "Northeastern Africa",
            'tdwg_code': 24
        };
        var language1 = {
            'family': {
                'id': 11,
                'language_count': 11,
                'name': 'Family 1',
                'scheme': 'G'
            },
            'glotto_code': "abcd1234",
            'id': 1100,
            'iso_code': "abc",
            'name': "ABCD"
         
        };
       society.geographic_regions.push(geographic_region);
       mockResults.geographic_regions.push(geographic_region);
       society.society.language = language1;
       mockResults.languages.push(language1);
       mockResults.classifications = [
            {
                'id': 11,
                'name': 'Family 1',
                'scheme': 'G'
            },
             {
                'id': 58,
                'name': "Austronesian",
                'scheme': 'G'
            }
        ];
     mockResults.societies.push(society);
    var results = mockColorService.generateColorMap(mockResults);
    expect(results.classifications.codes).toBeDefined();
    expect(results.geographic_regions.codes).toBeDefined();
    expect(results.classifications.codes[society.society.language.family.id]).toBe('rgb(255,0,0)');
    expect(results.geographic_regions.codes[geographic_region.tdwg_code]).toBe('rgb(255,0,0)');
    });

});
