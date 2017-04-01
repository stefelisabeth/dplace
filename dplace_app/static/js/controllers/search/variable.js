function VariableSearchCtrl($scope, searchModelService, getCategories, DatasetSources, Variable, MinAndMax, CodeDescription) {
    var linkModel = function() {
        $scope.filters = searchModelService.getModel().getEnvironmentalData().filters;
        if ($scope.model.searchParams.selectedButton.value == 'cultural') {
            $scope.variables = [searchModelService.getModel().getCulturalTraits()];
            $scope.count = 0;
        } else {
            $scope.variables = searchModelService.getModel().getEnvironmentalData().selectedVariables;
            if ($scope.variables.length == 0) {
                $scope.variables.push({'vals': ['', ''], 'selectedFilter': $scope.filters[0], 'variables': [], 'categories': []});
                $scope.variables[0].categories = searchModelService.getModel().getEnvironmentalData().categories;
            }
        }
    };
    $scope.$on('searchModelReset', linkModel);
    linkModel();
    
    $scope.addVariable = function() {
        $scope.variables.push(
            {'vals': ['', ''], 
            'selectedFilter': $scope.filters[0],
            'variables': [],
            'categories': searchModelService.getModel().getEnvironmentalData().categories
        });
    };
    
    $scope.sourceChanged = function(variable) {
        variable.categories = [];
        variable.categories = getCategories.query({ query: { source: variable.selectedSource.id }});
    };
    
    $scope.categoryChanged = function(variable) {
        if ($scope.model.searchParams.selectedButton.value == 'cultural')
            variable.indexVariables = Variable.query({ index_categories: variable.selectedCategory.id, source: variable.selectedSource.id });
        else
            variable.indexVariables = Variable.query({ index_categories: [variable.selectedCategory.id] });
    };
    
    $scope.variableChanged = function(variable) {
        if (variable.selectedVariable != null) {
            if (variable.selectedVariable.data_type == 'Continuous') {
                $scope.values = MinAndMax.query({query: {id: variable.selectedVariable.id}});
                variable.selectedVariable.selectedFilter = $scope.filters[0];
                variable.VariableForm.$setPristine();
                if ($scope.model.searchParams.selectedButton.value == 'cultural') {
                    if (variable.selectedVariables.map(function(v) { return v.id; }).indexOf(variable.selectedVariable.id) == -1) {
                        variable.selectedVariables.push(variable.selectedVariable);
                    }
                } else {
                    searchModelService.getModel().getEnvironmentalData().badgeValue = $scope.variables.map(function(v) { return v.selectedVariable; }).length;
                }
                $scope.filterChanged(variable);
            } else {
                variable.selectedVariable.codes = [];
                variable.selectedVariable.codes = CodeDescription.query({variable: variable.selectedVariable.id});
                
                selectedVariables = ($scope.model.searchParams.selectedButton.value == 'cultural') ? variable.selectedVariables : $scope.variables;
                 
                if (selectedVariables.indexOf(variable.selectedVariable) != -1) {
                    variable.selectedVariable.codes.$promise.then(function(result) {
                        result.forEach(function(c) { 
                            if (variable.selectedVariable.selected.map(function(m) { return m.id; }).indexOf(c.id) != -1) c.isSelected = true;
                        });
                    });
                
                } else {
                    variable.selectedVariable.selected = [];
                    if ($scope.model.searchParams.selectedButton.value == 'cultural') {
                        variable.selectedVariables.push(variable.selectedVariable);
                    }                    
                    variable.selectedVariable.codes.$promise.then(function(result) {
                        result.forEach(function(c) {
                            c.isSelected = true;
                            codeSelected(variable.selectedVariable, c);
                        });
                    });
                
                }
            }
        }
        if ($scope.model.searchParams.selectedButton.value == 'cultural') $scope.numVars();
    };
    
    function codeSelected(variable, code) {
        if (code.isSelected) {
            if (variable.selected.map(function(v) { return v.id; }).indexOf(code.id) == -1) {
                variable.selected.push(code);
                if (variable.type == 'cultural') $scope.searchModel.getCulturalTraits().badgeValue++;
            }
        } else {
            $scope.removeFromSearch(code, variable.type);        
        }
        if (variable.selected.length == variable.codes.length) variable.allSelected = true;
        else variable.allSelected = false;
        if ($scope.model.searchParams.selectedButton.value == 'cultural') $scope.numVars();
    };
    
    $scope.filterChanged = function(variable) {
        if (variable.VariableForm.$dirty && variable.selectedVariable.selectedFilter.operator != 'all') return; 
        if ($scope.model.searchParams.selectedButton.value == 'cultural') {
            selected_variable = variable.selectedVariables.filter(function(v) { 
                return v.id == variable.selectedVariable.id;
            });
        } else {
            selected_variable = $scope.variables.filter(function(v) { 
                return v.selectedVariable.id == variable.selectedVariable.id;
            }).map(function(v) { return v.selectedVariable; });
        }
        if (selected_variable.length == 1) {
            $scope.values.$promise.then(function(result) {
                selected_variable[0].vals = [result.min, result.max]
            });
        }
    };
    
    $scope.codeSelected = function(variable, code) {
        codeSelected(variable, code);
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



}