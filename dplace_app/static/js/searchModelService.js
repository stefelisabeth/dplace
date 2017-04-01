/*
 * This service wraps a singleton object that keeps track of user's
 * search UI state across controllers
 * @constructor
 */
function SearchModelService(VariableCategory, GeographicRegion, LanguageFamily, DatasetSources, Language, FindSocieties, colorMapService) {
    this.model = new SearchModel(VariableCategory, GeographicRegion, LanguageFamily, DatasetSources, Language);
    this.getModel = function() {
        return this.model;
    }
    
    this.updateSearchQuery = function(searchQuery) {
        this.getModel().query = {};
        for (var propertyName in searchQuery) {
            this.getModel().query[propertyName] = searchQuery[propertyName];
        }
    }
    
    var sortClassifications = function(results) { // do this for language search!
        results.classifications = [];
        results.societies.forEach(function(res) {
            if (res.society.language) {
                family = res.society.language.family;
                if (results.classifications.map(function(c) { return c.id; }).indexOf(family.id) == -1) results.classifications.push(family);
            }
        });
        results.classifications.sort(function(a,b) {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });
    }
    
    this.getCodeIDs = function(results, query) {
        /*results.code_ids = {};
        if (query.l && !query.c && !query.e) {
            results.classifications = [];
            added = [];
            for (var i = 0; i < results.societies.length; i++) {
                if (results.societies[i].society.language) {
                    language_family = results.societies[i].society.language.family;
                    if (added.indexOf(language_family.id) == -1) {
                        results.classifications.push(language_family);
                        added.push(language_family.id);
                    }
                }
            }
            
            results.classifications.sort(function(a,b) {
                if (a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return 0;
            });
        }

        for (var i = 0; i < results.variable_descriptions.length; i++) {
            if (results.variable_descriptions[i].variable.data_type.toUpperCase() == 'CONTINUOUS') {
                codes = query.c.filter(function(code) { 
                    try {
                        return parseInt(code.split('-')[0]) == results.variable_descriptions[i].variable.id; 
                    } catch(err) { 
                        return code == results.variable_descriptions[i].variable.id; 
                    }
                });
                var min;
                var max = 0;
                codes.forEach(function(c_var) {
                    if ((''+c_var).split('-').length == 1) return;
                    
                    if (!min) min = parseFloat(c_var.split('-')[1]);
                    else {
                        if (parseFloat(c_var.split('-')[1]) < min) min = parseFloat(c_var.split('-')[1]);
                    }
                    if (parseFloat(c_var.split('-')[2]) > max) max = parseFloat(c_var.split('-')[2]);
                });
                results.variable_descriptions[i].variable['min'] = min.toFixed(2);
                results.variable_descriptions[i].variable['max'] = max.toFixed(2);
                results.variable_descriptions[i].codes = codes;
            }
        }
        
        if (query.e) {
            codes = {}
            for (var i = 0; i < query.e.length; i++) {
                if (query.e[i][1].toUpperCase() == 'CATEGORICAL') {
                    codes[query.e[i][0]] = query.e[i][2];
                }
            }
            
            for (var i = 0; i < results.environmental_variables.length; i++ ){
                if (results.environmental_variables[i].id in codes) {
                    results.environmental_variables[i].codes = codes[results.environmental_variables[i].id]
                }
            }
        }
        return results;*/
        console.log(results);
        console.log(query);
    };
    
    var calculateRange = function(results) {
        if (results.societies.length == 0) return results;

        societies = results.societies;         
        for (var i = 0; i < results.environmental_variables.length; i++) {
            if (results.environmental_variables[i].data_type != 'Continuous') continue;
            extractedValues = societies.map(function(society) { 
                for (var j = 0; j < society.environmental_values.length; j++) {
                    if (society.environmental_values[j].variable == results.environmental_variables[i].id) {
                        if (society.environmental_values[j].coded_value_float) return society.environmental_values[j].coded_value_float;
                    }
                }
            });
            
            results.environmental_variables[i]['min'] = Math.min.apply(null, extractedValues);
            results.environmental_variables[i]['max'] = Math.max.apply(null, extractedValues);
        }
        
        for (var i = 0; i < results.variable_descriptions.length; i++) {
            if (results.variable_descriptions[i].variable.data_type != 'Continuous') continue;
            extractedValues = societies.map(function(society) { 
                for (var j = 0; j < society.variable_coded_values.length; j++) {
                    if (society.variable_coded_values[j].variable == results.variable_descriptions[i].variable.id) {
                        if (society.variable_coded_values[j].coded_value_float) return society.variable_coded_values[j].coded_value_float;
                    }
                }
            });
            
            results.variable_descriptions[i]['min'] = Math.min.apply(null, extractedValues);
            results.variable_descriptions[i]['max'] = Math.max.apply(null, extractedValues);
        }
        console.log(results);
        return results;
    }
    
    this.assignColors = function(results) {
        query = this.getModel().query;
        if (query.l && !query.c && !query.e) sortClassifications(results);
        if (results.geographic_regions.length > 0) {
            results.geographic_regions.sort(function(a,b) {
                if (a.region_nam.toLowerCase() < b.region_nam.toLowerCase()) return -1;
                else if (a.region_nam.toLowerCase() > b.region_nam.toLowerCase()) return 1;
                else return 0;
            })
        }   
        results = calculateRange(results);
        var colorMap = colorMapService.generateColorMap(results);
        results.societies.forEach(function(container) {
            container.society.style = {'background-color': colorMap[container.society.id] };
        });
        
    }
}
        
        