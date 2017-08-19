/* Tests SearchmodelService, which has functions:
    updateSearchQuery
    sortClassifications
    calculateRange
    assignColors
    searchCompletedCallback
    
*/

describe('Search Model Service Testing', function() {
    var mockSearchModelService, mockQuery, mockResults, mockVariableCategory, mockGeographicRegion, mockLanguageFamily, mockDatasetSources, mockLanguage, mockColorMapService, society, society2, society3;
        
    beforeEach(function() {
        module('dplaceServices');
    });
    
    beforeEach(inject(function(searchModelService) {
        mockSearchModelService = searchModelService;
        mockQuery = {
            'c': [[1, 'gt', [0, 10]], [2, 'categorical', [2, 3, 4, 5]]],
            'e': [[6, 'lt', [10, 20]]],
            'g': [1, 2, 3, 4, 5],
            'l': []
        };
        spyOn(mockSearchModelService, 'assignColors').and.callThrough();
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
    
    it('checking model + functions exist', function() {
        expect(mockSearchModelService.model).toBeDefined();
        expect(mockSearchModelService.getModel).toBeDefined();
        expect(mockSearchModelService.updateSearchQuery).toBeDefined();
        expect(mockSearchModelService.assignColors).toBeDefined();
        expect(mockSearchModelService.searchCompletedCallback).toBeDefined();
    });
    
    it('should update search query', function() {
        mockSearchModelService.updateSearchQuery(mockQuery);
        expect(mockSearchModelService.model.query).toBeDefined();
        expect(mockSearchModelService.model.query).toEqual(mockQuery);
    });
    
    it('should execute searchCompletedCallback', function() {
        mockSearchModelService.model.results = mockResults;
        mockSearchModelService.searchCompletedCallback();
        expect(mockSearchModelService.assignColors).toHaveBeenCalledWith(mockResults);
        expect(mockSearchModelService.model.results.searched).toBeTruthy();
    });
    
    it('should assign colors - geographic region', function() {
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
        mockSearchModelService.assignColors(mockResults);
        expect(mockResults.geographic_regions.codes).toBeDefined();
        expect(mockResults.geographic_regions.codes[geographic_region.tdwg_code]).toBe('rgb(255,0,0)');
        expect(mockResults.societies[0].society.style).toBeDefined();
        expect(mockResults.societies[0].society.style['background-color']).toEqual(mockResults.geographic_regions.codes[geographic_region.tdwg_code]);
    });
    
    it('should assign colors - environmental variable', function() {
        var environmental_variable = {
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
        society2.environmental_values.push({'coded_value_float': -17, 'variable': 317});
        society3.environmental_values.push({'coded_value_float': 29, 'variable': 317});
        mockResults.societies.push(society);
        mockResults.societies.push(society2);
        mockResults.societies.push(society3);
        mockSearchModelService.assignColors(mockResults);
        //should calculate range
        expect(mockResults.environmental_variables[0].min).toBeDefined();
        expect(mockResults.environmental_variables[0].min).toEqual(-17);
        expect(mockResults.environmental_variables[0].max).toBeDefined();
        expect(mockResults.environmental_variables[0].max).toEqual(29);
        
        //check colors are correct, and that container.society.style background-color is set
        expect(mockResults.societies[0].environmental_values[0].color).toBe('rgb(255,238,0)');
        expect(mockResults.environmental_variables[1].codes.codes).toBeDefined();
        expect(mockResults.societies[0].society.style).toBeDefined();
        expect(mockResults.societies[0].society.style['background-color']).toBe('rgb(255,238,0)');
        mockResults.societies[2].environmental_values = [{'coded_value': 2, 'variable': 318}];
        mockSearchModelService.assignColors(mockResults);
        expect(mockResults.societies[2].society.style).toBeDefined();
        expect(mockResults.societies[2].society.style['background-color']).toBe('rgb(0,255,102)');
    });

    it('should assign colors - cultural variable', function() {
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
            'coded_value_float': 0,
            'coded_value': 0,
            'variable': 66
        };
        
        mockResults.variable_descriptions.push(variable_description);
        mockResults.variable_descriptions.push(continuous_variable);
        mockResults.variable_descriptions.push(variable_description_2);
        society.variable_coded_values.push(coded_value);
        society2.variable_coded_values.push(coded_value_na);
        society2.variable_coded_values.push(coded_float);
        society.variable_coded_values.push(coded_float_2);
        society3.variable_coded_values.push({'coded_value_float': 1000, 'coded_value': 1000, 'variable': 66});
        mockResults.societies.push(society);
        mockResults.societies.push(society2);
        mockResults.societies.push(society3);
        mockSearchModelService.assignColors(mockResults);
        
        //check that stuff is defined
        expect(mockResults.variable_descriptions[0].codes.codes).toBeDefined();
        expect(mockResults.variable_descriptions[1].codes.codes).not.toBeDefined();
        expect(mockResults.variable_descriptions[2].codes.codes).toBeDefined()
        expect(mockResults.variable_descriptions[1].min).toBeDefined();
        expect(mockResults.variable_descriptions[1].max).toBeDefined();
        expect(mockResults.societies[0].variable_coded_values[1].color).toBeDefined();

        //check values for stuff
        expect(mockResults.variable_descriptions[1].min).toEqual(0);
        expect(mockResults.variable_descriptions[1].max).toEqual(1000);
        
        expect(mockResults.societies[0].society.style).toBeDefined();
        expect(mockResults.societies[1].society.style).toBeDefined();
        
        expect(mockResults.societies[0].society.style['background-color']).toBe('rgb(228,26,28)');
        expect(mockResults.societies[1].society.style['background-color']).toBe('rgb(255,255,255)');
        expect(mockResults.societies[2].society.style['background-color']).toEqual(mockResults.societies[2].variable_coded_values[0].color);

    });
    
    it('should assign colors - languages', function() {
        mockQuery = {'l': [1, 2, 3, 4, 5]};
        mockSearchModelService.updateSearchQuery(mockQuery);
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
        mockResults.societies.push(society);
        
        //societies 2 and 3 have the same language family
        mockResults.societies.push(society2);
        mockResults.societies.push(society3);
        mockResults.languages = mockResults.languages.concat([language1, language2, language3]);
        
        mockSearchModelService.assignColors(mockResults);
        expect(mockResults.classifications).toBeDefined();
        //in alphabetical order
        expect(mockResults.classifications[0]).toEqual(language2.family);
        expect(mockResults.classifications[1]).toEqual(language1.family);
        //check things are defined
        expect(mockResults.classifications.codes).toBeDefined();
        expect(mockResults.societies[0].society.style).toBeDefined();
        expect(mockResults.societies[1].society.style).toBeDefined();
        expect(mockResults.societies[2].society.style).not.toBeDefined(); //no language associated w this society
        
        expect(mockResults.societies[0].society.style['background-color']).toEqual(mockResults.classifications.codes[language1.family.id]);
        expect(mockResults.societies[1].society.style['background-color']).toEqual(mockResults.classifications.codes[language2.family.id]);

    });
    
    
   /* it('should use monochromatic scale for ordinal variables', function() {
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
    });*/

});
