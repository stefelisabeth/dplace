/* Tests for search.js controller
Contains functions:
disableSearchButton - done
enableSearchButton - done
showCriteria - done
removeFromSearch - done
searchSocieties
searchBySociety
search
resetSearch

Private functions (can't really be tested here):
errorCallBack
searchCompletedCallback
searchBySocietyCallback

*/

describe('Testing search controller', function() {
    var compile, appScope, mockAppCtrl, searchScope, mockSearchCtrl, mockSearchModelService, mockColorMapService, mockFindSocieties, searchBySocietyCallback;
    
    //for loading JSON data
    var regions, languages, environmentals, culturals, societies;
    
    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function($compile, $rootScope, $controller, searchModelService, colorMapService, FindSocieties, $httpBackend) {
        compile = $compile;
        
        appScope = $rootScope.$new();
        
        regions = window.__fixtures__['regions'];
		environmentals = window.__fixtures__['environmentals'];
		languages = window.__fixtures__['languages'];
		culturals = window.__fixtures__['culturals'];

        mockSearchModelService = searchModelService;
        mockAppCtrl = $controller('AppCtrl', {$scope: appScope, searchModelService: mockSearchModelService});
        spyOn(appScope, 'setActive');

        mockColorMapService = colorMapService;
        mockFindSocieties = FindSocieties;
        searchScope = appScope.$new();

        mockSearchCtrl = $controller('SearchCtrl', {
            $scope: searchScope,
            colorMapService: mockColorMapService,
            searchModelService: mockSearchModelService,
            FindSocieties: mockFindSocieties
        });
        
        $httpBackend.whenGET('/api/v1/categories?page_size=1000')
            .respond(200);
        $httpBackend.whenGET('/api/v1/get_dataset_sources')
            .respond(200);
        $httpBackend.whenGET('/api/v1/geographic_regions?page_size=1000')
            .respond(200);
        $httpBackend.whenGET('/api/v1/categories?page_size=1000&type=environmental')
            .respond(200);
        $httpBackend.whenGET('/api/v1/language_families?page_size=1000')
            .respond(200);
        $httpBackend.whenGET('/api/v1/languages?page_size=1000')
            .respond(200);
        $httpBackend.whenPOST('/api/v1/find_societies')
            .respond(200);
        $httpBackend.whenGET('/api/v1/find_societies?name=austronesian')
            .respond(200);
            
        spyOn(searchScope, 'disableSearchButton').and.callThrough();
        //spyOn(searchScope, 'searchBySociety').and.callThrough();

    }));
    
    it('should check starting values', function() {
        expect(searchScope.selectedButton).not.toBeDefined();
        expect(searchScope.searchButton.disabled).toBeFalsy();
        expect(searchScope.searchButton.text).toBe('Search');
        expect(searchScope.searchBySocietyButton.disabled).toBeFalsy();
        expect(searchScope.searchBySocietyButton.text).toBe('Search');
        expect(searchScope.searchCriteria).toBe('View selected search criteria');
    });
    
    it('should disable search button', function() {
        searchScope.disableSearchButton();
        searchScope.$digest();
        expect(searchScope.searchButton.disabled).toBeTruthy();
        expect(searchScope.searchButton.text).toBe('Working...');
        expect(searchScope.searchBySocietyButton.disabled).toBeTruthy();
        expect(searchScope.searchBySocietyButton.text).toBe('Working...');
    });
    
    it('should enable search button', function() {
        searchScope.searchButton = {disabled: true, text: 'Working...'};
        expect(searchScope.searchButton.disabled).toBeTruthy(); // first check button is disabled
        searchScope.enableSearchButton();
        expect(searchScope.searchButton.disabled).toBeFalsy();
        expect(searchScope.searchButton.text).toBe('Search');
        expect(searchScope.searchBySocietyButton.disabled).toBeFalsy();
        expect(searchScope.searchBySocietyButton.text).toBe('Search');
    });
    
    it('should check criteria pane', function() { //check toggle for search criteria pane
        //begins as hidden
        var elem = angular.element('<div id="selected-criteria" class="hidden">');
        angular.element(document.body).append(elem);
        elem = compile(elem)(appScope);
        appScope.$digest();
        searchScope.showCriteria();
        expect(elem.hasClass('hidden')).toBeFalsy();
        expect(searchScope.searchCriteria).toBe('Hide selected search criteria');
        searchScope.showCriteria();
        expect(elem.hasClass('hidden')).toBeTruthy();
        expect(searchScope.searchCriteria).toBe('View selected search criteria');
    });
    
    
   // tests for removeFromSearch function
    it('should remove from geographic regions', function() {
        mockSearchModelService.getModel().getGeographicRegions().selectedRegions = [regions.Asia, regions.easternEurope];
        mockSearchModelService.getModel().getGeographicRegions().badgeValue = 2;
        //test removal of region that hasn't been selected - shouldn't do anything
        searchScope.removeFromSearch(regions.westernEurope, 'geographic')
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getGeographicRegions().badgeValue).toEqual(2);
        expect(mockSearchModelService.getModel().getGeographicRegions().selectedRegions.length).toEqual(2);
        //test removal of region that has been selected
        searchScope.removeFromSearch(mockSearchModelService.getModel().getGeographicRegions().selectedRegions[0], 'geographic');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getGeographicRegions().badgeValue).toEqual(1);
        expect(mockSearchModelService.getModel().getGeographicRegions().selectedRegions.length).toEqual(1);
    });
    
    it('should remove language family', function() {
        language1 = languages.language1;
        language2 = languages.language2;
        language3 = languages.language3;
        
        language1.isSelected = true;
        language2.isSelected = true;
        language3.isSelected = true;

        mockSearchModelService.getModel().getLanguageClassifications().selected = {
            'Austronesian': [language2, language3],
            'Family 1': [language1]
        };
        mockSearchModelService.getModel().getLanguageClassifications().badgeValue = 5;
        //test removal of family that hasn't been selected
        searchScope.removeFromSearch('Family 2', 'family');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(5);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Austronesian']).toEqual([language2, language3]);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Family 1']).toEqual([language1]);
        searchScope.removeFromSearch('Austronesian', 'family');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(2);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Austronesian']).not.toBeDefined();
        expect(language2.isSelected).toBeFalsy();
        expect(language3.isSelected).toBeFalsy();
        expect(language1.isSelected).toBeTruthy();
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Family 1']).toBeDefined();
    });
    
    it('should remove language', function() {
        language1 = languages.language1;
        language2 = languages.language2;
        language3 = languages.language3;
        
        language1.isSelected = true;
        language2.isSelected = true;
        language3.isSelected = true;
        
        mockSearchModelService.getModel().getLanguageClassifications().selected = {
            'Austronesian': [language2, language3],
            'Family 1': [language1]
        };
        mockSearchModelService.getModel().getLanguageClassifications().badgeValue = 5;
        mockSearchModelService.getModel().getLanguageClassifications().allClasses.selectedFamily = language2.family;
        mockSearchModelService.getModel().getLanguageClassifications().allClasses.languages = {'allSelected': true};
        //test removing language that hasn't been selected -  nothing should change
        searchScope.removeFromSearch(
            {'family': { 'id': 58, 'name': 'Austronesian', 'scheme': 'G'}, 
            'id': 1121, 'name': 'Maori', 'societies': [5, 6, 7], 'isSelected':false}, 
        'language');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(5);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected).toEqual({
            'Austronesian': [language2, language3],
            'Family 1': [language1]
        });

        searchScope.removeFromSearch(language1, 'language');
        searchScope.$digest();
        expect(language1.isSelected).toBeFalsy();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(3);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Family 1'].length).toEqual(0);
        //shouldn't change this, because the selected family is not the one removed from search
        expect(mockSearchModelService.getModel().getLanguageClassifications().allClasses.languages.allSelected).toBeTruthy();
        
        //test setting allSelected false
        searchScope.removeFromSearch(language2, 'language');
        searchScope.$digest();
        expect(language2.isSelected).toBeFalsy();
        expect(language3.isSelected).toBeTruthy();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(2);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Austronesian']).toEqual([language3]);
        expect(mockSearchModelService.getModel().getLanguageClassifications().allClasses.languages.allSelected).toBeFalsy();
    });
        
    it('should remove environmental variable', function() {
        var to_remove = environmentals.variables.continuousEnvVar;

        mockSearchModelService.getModel().getEnvironmentalData().selectedVariables = [to_remove, environmentals.variables.categoricalEnvVar];

        mockSearchModelService.getModel().getEnvironmentalData().badgeValue = 2;
        searchScope.removeFromSearch(to_remove, 'environmental');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.length).toEqual(1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.indexOf(to_remove)).toEqual(-1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().badgeValue).toEqual(1);
        //test removal of variable that doesn't exist
        searchScope.removeFromSearch(to_remove, 'environmental');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.length).toEqual(1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.indexOf(to_remove)).toEqual(-1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().badgeValue).toEqual(1);
    });
    
    it('should remove code from environmental search', function() {
        //the variables in environmentals.json are formatted for results not for search, so we must get the variable and codes separately
        env_variable = environmentals.variables.categoricalEnvVar.variable;
        env_variable.allSelected = true;
        env_variable.codes = environmentals.variables.categoricalEnvVar.codes;
        env_variable.codes.forEach(function(c) {
            c.isSelected = true;
        });

        mockSearchModelService.getModel().getEnvironmentalData().selectedVariables = [
            {'selectedVariable': env_variable}
        ]
        searchScope.removeFromSearch(env_variable.codes[2], 'code');
        searchScope.$digest();
        expect(env_variable.codes[2].isSelected).toBeFalsy();
        expect(env_variable.allSelected).toBeFalsy();
    });
    
    it('should remove code from cultural search', function() {
        variable_description = culturals.variables.categoricalCulturalVar.variable;
        variable_description.allSelected = true;
        variable_description.codes = culturals.variables.categoricalCulturalVar.codes;
        variable_description.codes.forEach(function(c){
            c.isSelected = true;
            c.type = "c";
            c.variable = variable_description.id;
        });
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables = [variable_description]
        mockSearchModelService.getModel().getCulturalTraits().badgeValue = 5;
        searchScope.removeFromSearch(variable_description.codes[1], 'code');
        searchScope.$digest();
        expect(variable_description.codes[1].isSelected).toBeFalsy();
        expect(variable_description.allSelected).toBeFalsy();
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(4);
    });
    
    it('should remove variable', function() {
        variable_description = culturals.variables.categoricalCulturalVar.variable;
        variable_description.allSelected = true;
        variable_description.codes = culturals.variables.categoricalCulturalVar.codes;
        variable_description.codes.forEach(function(c){
            c.isSelected = true;
            c.type = "c";
            c.variable = variable_description.id;
        });
        continuous_variable = culturals.variables.continuousCulturalVar.variable;
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables = [continuous_variable, variable_description];
        mockSearchModelService.getModel().getCulturalTraits().badgeValue = 6;
        searchScope.removeFromSearch(variable_description, 'variable');
        searchScope.$digest();
        for (var c = 0; c < variable_description.codes.length; c++) {
            expect(variable_description.codes[c].isSelected).toBeFalsy();
        }
        expect(variable_description.allSelected).toBeFalsy();
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(1);
        searchScope.removeFromSearch(variable_description, 'variable');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(1);
        searchScope.removeFromSearch(continuous_variable, 'variable');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(0);
        expect(mockSearchModelService.getModel().getCulturalTraits().selectedVariables.indexOf(continuous_variable)).toEqual(-1);
    });

})
