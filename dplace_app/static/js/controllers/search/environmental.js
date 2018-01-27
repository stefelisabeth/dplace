function EnvironmentalCtrl($scope, searchModelService) {
    
    $scope.addVariable = function() { 
        searchModelService.getModel().getEnvironmentalData().selectedVariables.push(
            {'vals': ['', ''], 
            'selectedFilter': searchModelService.getModel().getEnvironmentalData().filters[0],
            'categories': searchModelService.getModel().getEnvironmentalData().categories
        });
    };
        
    $scope.doSearch = function() {
        $scope.search();
    };
    
    /* reset functions */
    var linkModel = function() {
        $scope.addVariable();
    };
    
    $scope.$on('searchModelReset', linkModel);
    if (searchModelService.getModel().getEnvironmentalData().selectedVariables.length == 0) linkModel();
}