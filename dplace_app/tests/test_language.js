//tests for language.js, containing the following functions to test:
// selectionChanged - TO DO
// selectAllChanged - TO DO
// addToSelection
// classificationSelectionChanged
// doSearch

describe('Testing language controller', function() {
    var $httpBackend, appScope, mockAppCtrl, searchScope, langScope, mockSearchCtrl, mockLangCtrl, mockSearchModelService, mockFindSocieties, mockColorMapService;
    var language1, language2, language3; 
    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function($injector, $rootScope, $controller, searchModelService, colorMapService, FindSocieties) {
        appScope = $rootScope.$new();
        $httpBackend = $injector.get('$httpBackend');
        mockSearchModelService = searchModelService;
        mockAppCtrl = $controller('AppCtrl', {$scope: appScope, searchModelService: mockSearchModelService});
        spyOn(appScope, 'setActive');

        mockColorMapService = colorMapService;
        
        searchScope = appScope.$new();
        mockSearchCtrl = $controller('SearchCtrl', {
            $scope: searchScope,
            colorMapService: mockColorMapService,
            searchModelService: mockSearchModelService,
            FindSocieties: mockFindSocieties
        });

        langScope = searchScope.$new();
        mockLangCtrl = $controller('LanguageCtrl', {
            $scope: langScope,
            searchModelService: mockSearchModelService
        });
        
        //SPIES
        spyOn(mockSearchModelService, 'updateSearchQuery');
        spyOn(searchScope, 'searchSocieties');
        spyOn(searchScope, 'removeFromSearch').and.callThrough();
        spyOn(searchScope, 'search').and.callThrough();
        spyOn(langScope, 'classificationSelectionChanged').and.callThrough();
                            
        language1 = {
            'family': {
                'id': 11,
                'language_count': 11,
                'name': 'Family 1',
                'scheme': 'G'
            },
            'glotto_code': "abcd1234",
            'id': 1100,
            'iso_code': "abc",
            'name': "ABCD",
            'societies': [1, 2]
         
        };
        language2 = {
            'family': {
                'id': 58,
                'name': 'Austronesian',
                'scheme': 'G'
            },
            'glotto_code': "efgh1234",
            'id': 1110,
            'iso_code': "efg",
            'name': "SFGH",
            'societies': [1]
         
        };
        
        language3 = {
            'family': {
                'id': 58,
                'name': 'Austronesian',
                'scheme': 'G'
            },
            'glotto_code': "lmno1234",
            'id': 1111,
            'iso_code': "lmn",
            'name': "LMNO",
            'societies': [1, 2]
            
         
        };
        mockSearchModelService.getModel().getLanguageClassifications().allClasses = [language1.family, language2.family];
        mockSearchModelService.getModel().getLanguageClassifications.allLanguages = [language1, language2, language3];
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

    }));
    
    it('should add to selection', function() {
        language1.isSelected = true;
        langScope.addToSelection(language1);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Family 1']).toBeDefined();
        expect(langScope.languageClassifications.selected['Family 1'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Family 1'][0]).toBe(language1);
        expect(langScope.languageClassifications.badgeValue).toEqual(2);
        
        language2.isSelected = true;
        language3.isSelected = true;
        langScope.addToSelection(language2);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Austronesian'][0]).toBe(language2);
        expect(langScope.languageClassifications.badgeValue).toEqual(3);
        langScope.addToSelection(language3);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(2);
        expect(langScope.languageClassifications.selected['Austronesian'][1]).toBe(language3);
        expect(langScope.languageClassifications.badgeValue).toEqual(5);
        
    });
    
    it('should add from classificationSelectionChanged', function() {
        language1.isSelected = true;
        langScope.families[0].selectedFamily = language1.family;
        langScope.families[0].languages = [language1];
        langScope.classificationSelectionChanged(language1, langScope.families[0]);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Family 1']).toBeDefined();
        expect(langScope.languageClassifications.selected['Family 1'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Family 1'][0]).toBe(language1);
        expect(langScope.languageClassifications.badgeValue).toEqual(2);
        expect(langScope.families[0].languages.allSelected).toBeTruthy();
        
        language2.isSelected = true;
        language3.isSelected = false;
        langScope.families[0].selectedFamily = language2.family;
        langScope.families[0].languages = [language1, language2];
        langScope.classificationSelectionChanged(language2, langScope.families[0]);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Austronesian'][0]).toBe(language2);
        expect(langScope.languageClassifications.badgeValue).toEqual(3);
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
        
        //test adding already-added language
        langScope.classificationSelectionChanged(language2, langScope.families[0]);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Austronesian'][0]).toBe(language2);
        expect(langScope.languageClassifications.badgeValue).toEqual(3);
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
    });
    
    it('should remove from classificationSelectionChanged', function() {
        //remove one language, one family
        langScope.families[0].selectedFamily = language1.family;
        langScope.families[0].languages = [language1];
        langScope.languageClassifications.selected['Family 1'] = [language1];
        langScope.languageClassifications.badgeValue = 9;
        
        language1.isSelected = false;
        langScope.classificationSelectionChanged(language1, langScope.families[0]);
        langScope.$digest();
        expect(searchScope.removeFromSearch).toHaveBeenCalled();
        expect(langScope.languageClassifications.selected['Family 1']).toBeDefined();
        expect(langScope.languageClassifications.selected['Family 1'].length).toEqual(0);
        expect(langScope.languageClassifications.badgeValue).toEqual(7);
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
        
        //remove one language, more than one in the family
        langScope.families[0].selectedFamily = language2.family;
        langScope.families[0].languages = [language2, language3];
        langScope.languageClassifications.selected['Austronesian'] = [language2, language3];
        langScope.languageClassifications.badgeValue = 11;
        
        language2.isSelected = false;
        langScope.classificationSelectionChanged(language2, langScope.families[0]);
        langScope.$digest();
        expect(searchScope.removeFromSearch).toHaveBeenCalled();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(1);
        expect(langScope.languageClassifications.badgeValue).toEqual(10);
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
        
        //empty selection - shouldn't do anything
        langScope.languageClassifications.selected = {};
        langScope.classificationSelectionChanged(language2, langScope.families[0]);
        langScope.$digest();
        expect(searchScope.removeFromSearch.calls.count()).toEqual(2);

    });

    it('should select/deselect all languages', function() {
       langScope.families[0].selectedFamily = language2.family; 
       language2.isSelected = false;
       language3.isSelected = false;
       langScope.families[0].languages = [language2, language3];
       langScope.families[0].languages.allSelected = true;
       langScope.selectAllChanged(langScope.families[0]);
       langScope.$digest();
       expect(language2.isSelected).toBeTruthy();
       expect(language3.isSelected).toBeTruthy();
       expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
       expect(langScope.languageClassifications.selected['Austronesian']).toEqual([language2, language3]);
       langScope.families[0].languages.allSelected = false;
       langScope.selectAllChanged(langScope.families[0]);
       langScope.$digest();
       expect(langScope.languageClassifications.selected['Austronesian'].length).toBe(0);
    
    });
    
    it('should do search', function() {
        language1.isSelected = true;
        language2.isSelected = true;
        language3.isSelected = true;
        langScope.languageClassifications.selected = {
            'Family 1': [language1],
            'Austronesian': [language2, language3]
        }
        langScope.$digest();
        langScope.doSearch();
        langScope.$digest();
        expect(searchScope.search).toHaveBeenCalled();
        searchScope.$digest();
        expected_searchquery = {
            'l': [language1.id, language2.id, language3.id]
        };
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalledWith(expected_searchquery);
        expect(searchScope.searchSocieties).toHaveBeenCalled();
        
    });
});
