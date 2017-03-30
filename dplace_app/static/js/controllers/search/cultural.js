//remove variable from search if all codes unselected
//move remove code into search.js

function CulturalCtrl($scope, searchModelService, Variable, CodeDescription, ContinuousVariable, DatasetSources, getCategories, MinAndMax) {
   var linkModel = function() {
        // Model/state lives in searchModelService
        $scope.traits = [searchModelService.getModel().getCulturalTraits()];
        $scope.errors = "";
        $scope.filters = searchModelService.getModel().getEnvironmentalData().filters;
        numVars();
    };
    
    
    $scope.$on('searchModelReset', linkModel); // When model is reset, update our model
    linkModel();
        
    //triggered by the view when a source is changed
    $scope.sourceChanged = function(trait) {
        trait.source_categories = [];
        trait.source_categories = getCategories.query({query: {source: trait.selectedSource.id}});
    };

    // triggered by the view when a category is changed
    $scope.categoryChanged = function(trait) {
        trait.indexVariables = Variable.query({index_categories: trait.selectedCategory.id, source: trait.selectedSource.id});
		trait.codes = [];
    };
    
    function numVars() {
        $scope.count = 0;
        $scope.traits.forEach(function(trait) {
            trait.badgeValue = 0;
            for (var variable in trait.selected) {
                if (trait.selected[variable].length > 0) $scope.count++;
                trait.badgeValue += trait.selected[variable].length;
            }
        });
        if ($scope.count < 5) $scope.errors = "";
    };
    
    $scope.$on('variableCheck', numVars);
    
    function codeSelected(variable, code) {
        if(code.isSelected) {
            if (variable.selected.map(function(v) { return v.id; }).indexOf(code.id) == -1) variable.selected.push(code);
        } else {
            index = variable.selected.map(function(m) { return m.id; }).indexOf(code.id);
            variable.selected.splice(index, 1);
        }
        if (variable.selected.length == variable.codes.length) variable.allSelected = true;
        else variable.allSelected = false;
    };
    
    // triggered by the view when a trait is changed in the picker
    $scope.traitChanged = function(trait) {
        if (trait.selectedVariable.data_type.toUpperCase() == 'CONTINUOUS') {
                        trait.selectedVariables.push(trait.selectedVariable);

            trait.selectedVariable.selectedFilter = $scope.filters[0];
            trait.CulturalForm.$setPristine();
            $scope.values = MinAndMax.query({query: {environmental_id: trait.selectedVariable.id}});
            console.log($scope.values);
            $scope.filterChanged(trait);
            return;
        } else
            trait.selectedVariable.codes = CodeDescription.query({variable: trait.selectedVariable.id });
        
        if (trait.selectedVariables.indexOf(trait.selectedVariable) == -1){ 
            trait.selectedVariable.selected = [];
        }

        //make select all the default if variable hasn't been chosen already
        if (trait.selectedVariables.indexOf(trait.selectedVariable) != -1) {
            trait.selectedVariable.codes.$promise.then(function(result) {
                result.forEach(function(c) {
                    if (trait.selectedVariable.selected.map(function(m) { return m.id; }).indexOf(c.id) != -1) {
                        c.isSelected = true;
                    }
                });
            });
            
        
        } else {
            trait.selectedVariables.push(trait.selectedVariable);
            $scope.count += 1;
            trait.selectedVariable.codes.$promise.then(function(result) {
                result.forEach(function(c) {
                    c.isSelected = true;
                    codeSelected(trait.selectedVariable, c);
                    
                });
            });
            
        }       
    };
    
    $scope.selectAll = function(variable) {
        if (variable.allSelected) {
            variable.codes.forEach(function(c) {
                c.isSelected = true;
                codeSelected(variable, c);
            });
        } else {
            variable.codes.forEach(function(c) {
                c.isSelected = false;
                codeSelected(variable, c);
            });
        }
    };
    
    $scope.traitCodeSelectionChanged = function(variable, code) {     
        codeSelected(variable, code);
    };
    
    $scope.filterChanged = function(variable) {
        if (variable.CulturalForm.$dirty && variable.selectedFilter.operator != 'all') return;
        selected_variable = variable.selectedVariables.filter(function(env_var) {
            return env_var.id == variable.selectedVariable.id;
        });
        if (selected_variable.length == 1) {
            console.log(selected_variable);
            $scope.values.$promise.then(function(result) {
                selected_variable[0].vals = [result.min, result.max];
            });
        }
        
    };

    // wired to the search button. Gets the code ids, adds cultural to the query, and invokes the search
    $scope.doSearch = function() {
        console.log($scope.traits);
        if ($scope.count > 4) {
            $scope.errors = "Error, search is limited to 4 variables";
            return;
        }
        $scope.search();
    };
}
