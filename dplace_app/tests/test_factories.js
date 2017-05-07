describe('Testing language factories', function() {
    var mockLangFamilyFactory, mockLangFactory, $httpBackend;
    beforeEach(module('dplaceServices'));
    beforeEach(function() {
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            mockLangFamilyFactory = $injector.get('LanguageFamily');
            mockLangFactory = $injector.get('Language');
        });
    });

    it('should get languages', inject(function(LanguageFamily, Language) {
        results = {
            "count": 2,
            "results": [
            {
                "id": 77,
                "scheme": "G",
                "name": "Abkhaz-Adyge",
                "language_count": 2
            },
            {
                "id": 7,
                "scheme": "G",
                "name": "Afro-Asiatic",
                "language_count": 91
            },
            ]
        };
        $httpBackend.whenGET('/api/v1/language_families?page_size=1000')
            .respond(JSON.stringify(results));
        response = mockLangFamilyFactory.query();
        $httpBackend.flush();
        expect(response.length).toEqual(3);
        expect(response[0].name).toEqual("Select All Languages");
        expect(response[1].id).toEqual(77);
        expect(response[2].id).toEqual(7);
        expect(response[1].name).toEqual("Abkhaz-Adyge");
        expect(response[2].name).toEqual("Afro-Asiatic");
        
        results = {
            "count": 2,
            "results": [
            {
                "id": 149,
                "name": "Abkhazian",
                "glotto_code": "abkh1244",
                "iso_code": "abk",
                "family": {
                    "id": 77,
                    "scheme": "G",
                    "name": "Abkhaz-Adyge",
                    "language_count": 2
                },
                "count": 1
            },
            {
                "id": 599,
                "name": "Kabardian",
                "glotto_code": "kaba1278",
                "iso_code": "kbd",
                "family": {
                    "id": 77,
                    "scheme": "G",
                    "name": "Abkhaz-Adyge",
                    "language_count": 2
                },
                "count": 1
            }
            ]  
        };
        
        $httpBackend.whenGET('/api/v1/languages?family=77&page_size=1000')
            .respond(JSON.stringify(results));
        languages = mockLangFactory.query({family: response[1].id});
        $httpBackend.flush()
        expect(languages.length).toEqual(2);
        expect(languages[0].id).toEqual(149);
        expect(languages[1].id).toEqual(599);
    }));
});

describe('Testing geographic region factory', function() {
    var mockGeographicRegionFactory;
    beforeEach(module('dplaceServices'));
    beforeEach(function() {
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            mockGeographicRegionFactory = $injector.get('GeographicRegion');
        });
    });
    
    it('should get regions', inject(function(GeographicRegion) {
        results = {
            "count": 3,
            "results": [
                {
                    "id": 1,
                    "level_2_re": 10.0,
                    "count": 89.0,
                    "region_nam": "Northern Europe",
                    "continent": "EUROPE",
                    "tdwg_code": 10
                },
                {
                    "id": 2,
                    "level_2_re": 11.0,
                    "count": 158.0,
                    "region_nam": "Middle Europe",
                    "continent": "EUROPE",
                    "tdwg_code": 11
                },
                {
                    "id": 3,
                    "level_2_re": 12.0,
                    "count": 62.0,
                    "region_nam": "Southwestern Europe",
                    "continent": "EUROPE",
                    "tdwg_code": 12
                },
            ]
        }
        $httpBackend.whenGET('/api/v1/geographic_regions?page_size=1000').respond(JSON.stringify(results));
        response = mockGeographicRegionFactory.query();
        $httpBackend.flush();
        expect(response.length).toEqual(3);
        for (var i = 0; i < response.length; i++) { 
            expect(response[i].id).toEqual(results.results[i].id);
            expect(response[i].count).toEqual(results.results[i].count);
            expect(response[i].region_nam).toEqual(results.results[i].region_nam);
            expect(response[i].tdwg_code).toEqual(results.results[i].tdwg_code);
        }
    }));
});

describe('Testing source factories', function() {
    var mockSourceFactory, mockDatasetSourceFactory, $httpBackend, results;
    beforeEach(module('dplaceServices'));
    beforeEach(function() {
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            mockSourceFactory = $injector.get('Source');
            mockDatasetSourceFactory = $injector.get('DatasetSources');
        });
    });
    
    it('should get sources', inject(function(Source, DatasetSources) {
        results = {
            "count":2,
            "results": [
                {
                    "id": 1,
                    "author": "Murdock",
                    "year": "1999",
                    "name": "Ethnographic Atlas"
                    
                },
                {
                    "id": 2,
                    "author": "Binford",
                    "year": "2016",
                    "name": "Binford Hunter-Gatherer"
                }
            ]
        }
        
        $httpBackend.whenGET('/api/v1/sources?page_size=1000')
            .respond(JSON.stringify(results));
       $httpBackend.whenGET('/api/v1/get_dataset_sources')
            .respond(results.results);
        $httpBackend.whenGET('/api/v1/sources/2?page_size=1000')
            .respond(JSON.stringify({"count":1,"results":[[results[1]]]}));   
        response = mockSourceFactory.query();
        $httpBackend.flush();
        expect(response.length).toEqual(2);
        response = mockSourceFactory.query({id: response[1].id});
        $httpBackend.flush();
        expect(response.length).toEqual(1);
        response = mockDatasetSourceFactory.query();
        $httpBackend.flush();
        expect(response.length).toEqual(2);
    }));
});

describe('Testing Variable Factories', function() {
    var mockVariableFactory, mockVariableCategoryFactory, mockCodeDescriptionFactory, mockGetCategoriesFactory, mockMinAndMax;
    beforeEach(module('dplaceServices'));
    beforeEach(function() {
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            mockVariableFactory = $injector.get('Variable');
            mockVariableCategoryFactory = $injector.get('VariableCategory');
            mockCodeDescriptionFactory = $injector.get('CodeDescription');
            mockGetCategoriesFactory =  $injector.get('getCategories');
            mockMinAndMax = $injector.get('MinAndMax');
        });
    });
    
    it ('should get categories', inject(function(VariableCategory, getCategories) {
        //filtering for source happens in backend, not frontend
        results = {
            "count": 4,
            "results": [
                {
                    "id": 1,
                    "name": "Anthropometry",
                },
                {
                    "id": 2,
                    "name": "Class",
                },
                {
                    "id": 3,
                    "name": "Community organization",
                },
                {
                    "id": 4,
                    "name": "Demography",
                }
            ]
        };
        $httpBackend.whenGET('/api/v1/categories?page_size=1000').respond(JSON.stringify(results));
        $httpBackend.whenGET('/api/v1/get_categories?query='+encodeURI('{"source":1}')).respond(results.results);
        $httpBackend.whenGET('/api/v1/variables?page_size=1000').respond(200);
        response = mockVariableCategoryFactory.query();
        $httpBackend.flush();
        expect(response.length).toEqual(4);
        expect(response[0].name).toEqual("Anthropometry");
        expect(response[1].id).toEqual(2);
        expect(response[2].id).toEqual(3);
        expect(response[3].name).toEqual("Demography");
        response = mockGetCategoriesFactory.query({ query: { source: 1 } });
        $httpBackend.flush();
        expect(response.length).toEqual(4);
        expect(response[0].name).toEqual(results.results[0].name);
    }));
    
    it('should get variables', inject(function(Variable, CodeDescription) {
        variables = {
            "count": 3,
            "results": [
                {   
                    "id": 95,
                    "label": "T001",
                    "name": "Subsistence economy",
                    "data_type": "Continuous",
                    "source": 1,
                    "index_categories": [
                        2,
                        17
                    ]
                },
                {   
                    "id": 96,
                    "label": "T002",
                    "name": "Population",
                    "data_type": "Continuous",
                    "source": 1,
                    "index_categories": [
                        2
                    ]
                },
                {   
                    "id": 97,
                    "label": "T003",
                    "name": "Slavery",
                    "data_type": "Categorical",
                    "source": 1,
                    "index_categories": [
                        2,
                        17
                    ]
                }
            ]
        }
        
        codes = {
            "count": 5,
            "results": [
                {
                    "id": 757,
                    "code": "NA",
                    "description": "Missing data",
                    "short_description": "Missing data",
                    "variable": 95
                },
                {
                    "id": 758,
                    "code": "NA",
                    "description": "Missing data",
                    "short_description": "Missing data",
                    "variable": 96
                },
                {
                    "id": 759,
                    "code": "NA",
                    "description": "Missing data",
                    "short_description": "Missing data",
                    "variable": 97
                },
                {
                    "id": 761,
                    "code": "1",
                    "description": "Majority of a group's nutritional intake comes from terrestrial animal resources",
                    "short_description": "Hunting",
                    "variable": 98
                },
                {
                    "id": 762,
                    "code": "2",
                    "description": "Majority of a group's nutritional intake comes from terrestrial plant resources",
                    "short_description": "Gathering",
                    "variable": 98
                }
            ]
        }
        $httpBackend.whenGET('/api/v1/variables?page_size=1000').respond(JSON.stringify(variables));
        $httpBackend.whenGET('/api/v1/codes/?variable=98&page_size=1000').respond(JSON.stringify(codes));
        response = mockVariableFactory.query();
        $httpBackend.flush();
        expect(response.length).toEqual(3);
        for (var i = 0; i < response.length; i++) {
            expect(response[i].id).toEqual(variables.results[i].id);
            expect(response[i].name).toEqual(variables.results[i].name);
            expect(response[i].label).toEqual(variables.results[i].label);
        }
        //test with and without results in JSON
        response = mockCodeDescriptionFactory.query({variable: 98});
        $httpBackend.flush();
        expect(response.length).toEqual(5);
        for (var i = 0; i < response.length; i++) {
            expect(response[i].id).toEqual(codes.results[i].id);
            expect(response[i].code).toEqual(codes.results[i].code);
            expect(response[i].description).toEqual(codes.results[i].description);
            expect(response[i].variable).toEqual(codes.results[i].variable);
        }
        $httpBackend.whenGET('/api/v1/codes/?variable=98&page_size=1000').respond(JSON.stringify(results.results));
        response = mockCodeDescriptionFactory.query({variable: 98});
        $httpBackend.flush();
        expect(response.length).toEqual(5);
        for (var i = 0; i < response.length; i++) {
            expect(response[i].id).toEqual(codes.results[i].id);
            expect(response[i].code).toEqual(codes.results[i].code);
            expect(response[i].description).toEqual(codes.results[i].description);
            expect(response[i].variable).toEqual(codes.results[i].variable);
        }
    }));
    
    it('should return min and max', inject(function(MinAndMax) {
        values = {
            'min': 0,
            'max': 100
        }
        $httpBackend.whenGET('/api/v1/min_and_max?query='+encodeURI('{"id":1}')).respond(JSON.stringify(values));
        response = mockMinAndMax.query({query: {id: 1}});
        $httpBackend.flush();
        expect(response['min']).toBeDefined();
        expect(response['max']).toBeDefined();
        expect(response['min']).toEqual(0);
        expect(response['max']).toEqual(100);
    }));
});

describe('Testing Search Factories', function() {
    var mockFindSocieties, mockTreesFromSocieties;
    beforeEach(module('dplaceServices'));
    beforeEach(function() {
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            mockFindSocieties = $injector.get('FindSocieties');
            mockTreesFromSocieties = $injector.get('TreesFromSocieties');
        });
    });
    it ('should return societies', inject(function(FindSocieties) {
        query = {'e': [[1, 'inrange', ['0', '1']]], 'c': [[3, 'categorical', [1, 2, 3, 4]]]};
        results = {
            "sources": [
            {"id": 1,
            "name": "Binford"},
            {"id":2,
            "name": "EA"}
            ],
            "societies": [],
            "environmental_variables": [],
            "variable_descriptions": [],
            "geographic_regions": [],
            "languages": []
        }
        $httpBackend.whenGET(/api\/v1\/find_societies\?.*/).respond(JSON.stringify(results));
        response = mockFindSocieties.find(query);
        $httpBackend.flush();
        expect(response.sources[1]).toBeDefined();
        expect(response.sources[2]).toBeDefined();
        expect(response.sources[1].name).toEqual("Binford");
        expect(response.sources[2].name).toEqual("EA");
        expect(response.societies).toBeDefined();
        expect(response.environmental_variables).toBeDefined();
        expect(response.variable_descriptions).toBeDefined();
        expect(response.languages).toBeDefined();
    }));
    
     it ('should return trees', inject(function(TreesFromSocieties) {
        trees = [
            {
                "id": 12,
                "name": "Guahibo.glotto.trees",
                "taxa": [
                    {
                        "id": 16,
                        "languageTree": 12,
                        "label": "guah1255",
                        "language": 494,
                        "societies": [
                            {
                                "society": {
                                    "id": 1828,
                                    "ext_id": "B39",
                                    "name": "Guahibo"
                                },
                                "labels": "guah1255",
                                "fixed_order": 0
                            },
                            {
                                "society": {
                                    "id": 552,
                                    "ext_id": "Sc4",
                                    "name": "Guahibo"
                                },
                                "labels": "guah1255",
                                "fixed_order": 0
                            }
                        ]
                    },
                    {
                        "id": 16,
                        "languageTree": 12,
                        "label": "guah1255",
                        "language": 494,
                        "societies": [
                            {
                                "society": {
                                    "id": 1828,
                                    "ext_id": "B39",
                                    "name": "Guahibo"
                                },
                                "labels": "guah1255",
                                "fixed_order": 0
                            },
                            {
                                "society": {
                                    "id": 552,
                                    "ext_id": "Sc4",
                                    "name": "Guahibo"
                                },
                                "labels": "guah1255",
                                "fixed_order": 0
                            }
                        ]
                    }
                ],
                "newick_string": "(guah1255:3);"
            },
            {
            "id": 8,
            "name": "Burushaski.trees",
            "taxa": [
                {
                    "id": 12,
                    "languageTree": 8,
                    "label": "buru1296",
                    "language": 26,
                    "societies": [
                        {
                            "society": {
                                "id": 1287,
                                "ext_id": "SCCS64",
                                "name": "Burusho"
                            },
                            "labels": "buru1296",
                            "fixed_order": 0
                        },
                        {
                            "society": {
                                "id": 1286,
                                "ext_id": "Ee2",
                                "name": "Burusho"
                            },
                            "labels": "buru1296",
                            "fixed_order": 0
                        }
                    ]
                },
                {
                    "id": 12,
                    "languageTree": 8,
                    "label": "buru1296",
                    "language": 26,
                    "societies": [
                        {
                            "society": {
                                "id": 1287,
                                "ext_id": "SCCS64",
                                "name": "Burusho"
                            },
                            "labels": "buru1296",
                            "fixed_order": 0
                        },
                        {
                            "society": {
                                "id": 1286,
                                "ext_id": "Ee2",
                                "name": "Burusho"
                            },
                            "labels": "buru1296",
                            "fixed_order": 0
                        }
                    ]
                }
            ],
            "newick_string": "(buru1296:1);"
            }
        ]   
        $httpBackend.whenGET(/api\/v1\/trees_from_societies\?.*/).respond(JSON.stringify(trees));
        response = mockTreesFromSocieties.find({'s': [1, 2, 3, 4]});
        $httpBackend.flush();
        expect(response.length).toEqual(2);
        expect(response[0].id).toEqual(12);
        expect(response[0].name).toEqual('Guahibo.glotto.trees');
        expect(response[1].id).toEqual(8);
        expect(response[1].name).toEqual("Burushaski.trees")
    }));
});
    
