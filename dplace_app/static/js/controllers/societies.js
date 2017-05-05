function SocietiesCtrl($scope, $location, $timeout, $http, searchModelService, TreesFromSocieties, FindSocieties) {

    $scope.appendQueryString();
    
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (    cookie.substring(0, 10) === ('csrftoken=')) {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
             }
        }
    }
    $scope.cookieValue = cookieValue;
    $scope.searchModel = searchModelService.getModel();
    $scope.csvDownloadButton = {text: 'CSV', disabled: false};
    $scope.globalTree = false;
    $scope.variables = [];
   
    $scope.treeButtons = [
        {value: 'phylogeny', name:'Phylogenies', description:"Trees derived from discrete data using phylogenetic methods (branch lengths informative)"},
        {value:'glottolog', name:'Glottolog Trees', description:"Trees derived from Glottolog language family taxonomies (branch lengths uninformative)"},
        {value:'global',name:"Global Tree", description:"A global language supertree composed from language family taxonomies in Glottolog (branch lengths uninformative)"}
    ];


    $scope.setActive('societies');
    $scope.columnSort = { sortColumn: 'society.name', reverse: false };
    
    $scope.tabs = [
        { title: "Table", content: "table", active: true},
        { title: "Map", content: "map", active: false},
        { title: "Tree", content: "tree", active: false},
        { title: "Download", content: "download", active: false},
    ];
    
    var assignGradient = function() {
        if($scope.results.variable_descriptions) {
            $scope.results.variable_descriptions.forEach(function(v) { 
                if (v.variable.data_type.toLowerCase() == 'continuous') {
                        v.fill = "/"+window.location.href.split('/').pop()+"#grad1";
                }
            });
        }
        if($scope.results.environmental_variables) {
            $scope.results.environmental_variables.forEach(function(v) {
                if (v.variable.name.indexOf("precipitation") != -1) v.fill = "/"+window.location.href.split('/').pop()+"#blue";
                    else if (v.variable.name.indexOf("Net primary production") != -1 || v.variable. name.indexOf("NPP") != -1) v.fill = "/"+window.location.href.split('/').pop()+"#earthy";
                    else v.fill = "/"+window.location.href.split('/').pop()+"#temp";
            });
        }
    }
    
    var concatenateVariables = function() {
        if ($scope.results.variable_descriptions) $scope.variables = $scope.variables.concat($scope.results.variable_descriptions);
        if ($scope.results.environmental_variables) $scope.variables = $scope.variables.concat($scope.results.environmental_variables);
        $scope.results.chosenVariable = $scope.variables[0];
    }
    
    var searchCompletedCallback = function() {
        searchModelService.searchCompletedCallback();
        $scope.results = $scope.searchModel.results;
        $scope.query = searchModelService.getModel().getQuery();
        assignGradient();
        concatenateVariables();
    };

    if (!$scope.searchModel.results.searched && !$scope.searchModel.results.searchedByName) {
        var queryObject = $location.search();
        var by_name = false;
        for (var key in queryObject) {
            if (key == 'name') {
                 by_name = true;
            } else {
                queryObject[key] = JSON.parse(queryObject[key]);
            }
        }
        if (!by_name) {
            searchModelService.updateSearchQuery(queryObject);
            $scope.searchModel.results = FindSocieties.find(queryObject, searchCompletedCallback);
        } else {
            $scope.results = FindSocieties.find(queryObject);
            $scope.searchModel.results.searchedByName = true;
        }
    } else {
        $scope.results = searchModelService.getModel().getResults();
        $scope.query = searchModelService.getModel().getQuery();
        assignGradient();
        concatenateVariables();
    }
    
    var sortTrees = function() {
        $scope.results.language_trees.phylogeny = [];
        $scope.results.language_trees.glottolog = [];
        $scope.results.language_trees.forEach(function(tree) {
            if (tree.name.indexOf("global") != -1) $scope.results.language_trees.global = tree;
            else if (tree.name.indexOf("glotto") != -1) {
                $scope.results.language_trees.glottolog.push(tree);
            }
            else {
                $scope.results.language_trees.phylogeny.push(tree);
            }
        });
    }
    
    $scope.addTrees = function() {
        if ($scope.results.language_trees && $scope.results.language_trees.length > 0) return;
        if ($scope.tabs[2].active) {
            list = $scope.results.societies.map(function(s) { return s.society.id});
            society_ids = {'s': list};
            $scope.results.language_trees = TreesFromSocieties.find(society_ids, sortTrees);
        }
    }

    var num_lines = 0;              
    $scope.wrapText = function(text, string) {
        text.each(function() {
            var text = d3.select(this),
            words = string.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 0.1,
            x = text.attr("x"),
            y = 0,
            dy = 1,
            tspan = text.text(null)
                .append("svg:tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > 800) {
                    y += 20;
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("svg:tspan")
                        .attr("x", "20")
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
                    num_lines += 1;
                }
            }
        });
        
    };
    
    $scope.constructMapDownload = function() {
        d3.select(".legend-for-download").html('');
        num_lines = 0;
        var gradients_svg = d3.select("#gradients-div").node().innerHTML;
        map_svg = d3.select(".jvectormap-container").select("svg")
                        .attr("version", 1.1)
                        .attr("xmlns", "http://www.w3.org/2000/svg")
                        .attr("height", function() {
                            if ($scope.results.chosenVariable && $scope.results.chosenVariable.variable.data_type.toLowerCase() == 'continuous') return "500";
                            else if ($scope.results.chosenVariable) return "2000"
                            else {
                                if ($scope.results.classifications)
                                    return $scope.results.classifications.length*35;
                                else {
                                    return $scope.results.geographic_regions.length*35;
                                }
                            }
                        })
                        .node().parentNode.innerHTML;
        map_svg = map_svg.substring(0, map_svg.indexOf("<div")); //remove zoom in/out buttons from map
        
        //construct legend for download
        var legend = d3.select(".legend-for-download").append("svg:svg");
        var legend_svg = "";
        
        //cultural and environmental variables
        if ($scope.results.chosenVariable) {
            if ($scope.results.chosenVariable.variable.data_type.toLowerCase() == 'continuous') {
                legend_svg = "<g transform='translate(20,350)'>"+d3.select(".cont-gradient-td").node().innerHTML+"</g>";
            } else {
                for (var c = 0; c < $scope.results.chosenVariable.codes.length; c++) {
                    g = legend.append("svg:g")
                        .attr("transform", function() {
                                return 'translate(20,'+((num_lines)*25)+')';
                        });
                         g.append("svg:circle")
                        .attr("cx", "10")
                        .attr("cy", "10")
                        .attr("r", "4.5")
                        .attr("stroke", "#000")
                        .attr("stroke-width", "0.5")
                        .attr("fill", function() {
                            return $scope.results.chosenVariable.codes.codes[$scope.results.chosenVariable.codes[c].code];
                        });
                    g.append("svg:text")
                        .attr("x", "20")
                        .attr("y", "15")
                        .attr("style", "font-size: 14px;")
                        .call($scope.wrapText, $scope.results.chosenVariable.codes[c].description);
                    num_lines += 1;
                    }
                    legend_svg = "<g transform='translate(20,350)'>"+legend.node().innerHTML+"</g>";
            }
            var map_svg = map_svg.substring(0, map_svg.indexOf("</svg>"));
            // concat legend and remove all relative d-place links from svg's defs urls
            map_svg = map_svg.concat(legend_svg.replace(/url\(.*?#/, 'url(#').replace('ng-attr-fill', 'fill'));
            map_svg = map_svg.concat(gradients_svg +"</svg>");
            map_svg = map_svg.replace(/&(?!amp;)/g, '&amp;');
            var filename = $scope.results.chosenVariable.variable.name.replace(/[\W]+/g, "-").toLowerCase()+"-map.svg";
        }
        
        else if ($scope.results.classifications) {
            count = 0;
            
            for (var i = 0; i < $scope.results.classifications.length; i++) {
                g = legend.append("svg:g")
                    .attr("transform", function() {
                        return 'translate(0,' + count*25 + ')';
                    });
                g.append("svg:circle")
                    .attr("cx", "10")
                    .attr("cy", "10")
                    .attr("r", "4.5")
                    .attr("stroke", "#000")
                    .attr("stroke-width", "0.5")
                    .attr("fill", function() {
                       return $scope.results.classifications.codes[$scope.results.classifications[i].id];
                    });
                g.append("svg:text")
                    .attr("x", "20")
                    .attr("y", "15")
                    .text($scope.results.classifications[i].name);
                count++;
                
            }
            var legend_svg = "<g transform='translate(0,350)'>"+legend.node().innerHTML+"</g>";
            var map_svg = map_svg.substring(0, map_svg.indexOf("</svg>"));
            map_svg = map_svg.concat(legend_svg+"</svg>");
            map_svg = map_svg.replace(/&(?!amp;)/g, '&amp;');
            var filename = "language-classifications-map.svg";

        }
        
        else if ($scope.results.geographic_regions.length > 0) {
            count = 0;
            for (var i = 0; i < $scope.results.geographic_regions.length; i++) {
                g = legend.append("svg:g")
                    .attr("transform", function() {
                        return 'translate(0,'+ count*25 + ')';
                    });
                g.append("svg:circle")
                    .attr("cx", "10")
                    .attr("cy", "10")
                    .attr("r", "4.5")
                    .attr("stroke", "#000")
                    .attr("stroke-width", "0.5")
                    .attr("fill", function() {
                       return $scope.results.geographic_regions.codes[$scope.results.geographic_regions[i].tdwg_code];
                    });
                g.append("svg:text")
                    .attr("x", "20")
                    .attr("y", "15")
                    .text($scope.results.geographic_regions[i].region_nam);
                count++;
            }
            var legend_svg = "<g transform='translate(0,350)'>"+legend.node().innerHTML+"</g>";
            var map_svg = map_svg.substring(0, map_svg.indexOf("</svg>"));
            map_svg = map_svg.concat(legend_svg+"</svg>");
            map_svg = map_svg.replace(/&(?!amp;)/g, '&amp;');
            var filename = "geographic-regions-map.svg";
        }
        
        map_file = new Blob([map_svg], {type: 'image/svg+xml'});
        saveAs(map_file, filename);
    }
    
    $scope.buttonChanged = function(buttonVal) {
        d3.select('language-phylogeny').html('');
        $scope.results.selectedTree = null;
        if (buttonVal.indexOf("global") != -1) {
            $scope.globalTree = true;
            $scope.results.selectedTree = $scope.results.language_trees.global;
            $scope.results.chosenTVariable = $scope.variables[0];
            $scope.treeSelected();
        } else {
            $scope.globalTree = false;
        }
    };
    
    $scope.treeDownload = function() {
        try {
            var tree_svg = d3.select(".phylogeny")
                .attr("version", 1.1)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .node().parentNode.innerHTML;
            }
        catch(e){
            return;
        }
        var all_legends = {};
        legends_list = [];
        var gradients_svg = d3.select("#gradients-div").node().innerHTML;
        
        d3.selectAll(".legends").each( function(){
            leg = d3.select(this);
            if (leg.attr("var-id") && leg.attr("class").indexOf("hide") == -1) {
                all_legends[leg.attr("var-id")] = leg;
            }   
        });
        
        if ($scope.results.variable_descriptions.length + $scope.results.environmental_variables.length > 0) {
                    
            for (var i = 0; i < $scope.results.variable_descriptions.length; i++) {
                id = $scope.results.variable_descriptions[i].variable.id;
                name = ''
                if (!all_legends[id]) continue;
                legend_id = all_legends[id];
                if ($scope.results.variable_descriptions[i].CID) name += $scope.results.variable_descriptions[i].CID + '-';
                name += $scope.results.variable_descriptions[i].variable.name;
                svg_string = legend_id.node().innerHTML.replace(/url\(.*?#/, 'url(#').replace(/&(?!amp;)/g, '&amp;');
                svg_string = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform="translate(10, 10)">' + svg_string + gradients_svg + '</svg>';
                legends_list.push({'name': name.replace(/[\W]+/g, "-")+'-legend.svg', 'svg': svg_string});    
            }
                    
            for (var i = 0; i < $scope.results.environmental_variables.length; i++) {
                id = $scope.results.environmental_variables[i].variable.id;
                name = ''
                if (!all_legends[id]) continue;
                legend_id = all_legends[id];
                if ($scope.results.environmental_variables[i].CID) name += $scope.results.environmental_variables[i].CID + '-';
                name += $scope.results.environmental_variables[i].variable.name;
                svg_string = legend_id.node().innerHTML.replace(/url\(.*?#/, 'url(#').replace(/&(?!amp;)/g, '&amp;');
                svg_string = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform="translate(10, 10)">'+svg_string + gradients_svg + '</svg>';
                legends_list.push({'name': name.replace(/[\W]+/g, "-")+'-legend.svg', 'svg': svg_string});
            }
        } else if ($scope.results.classifications) {
            svg_string = d3.select(".classif-legends").node().innerHTML.replace(/&(?!amp;)/g, '&amp;');
            svg_string = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform="translate(10, 10)" height="'+$scope.results.classifications.length*35+'">'+svg_string  + '</svg>';
            legends_list.push({'name': 'lang-classifications-legend.svg', 'svg': svg_string});
        } else if ($scope.results.geographic_regions) {
            svg_string = d3.select(".region-legends").node().innerHTML.replace(/&(?!amp;)/g, '&amp;');
            svg_string = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" transform="translate(10, 10)" height="'+$scope.results.geographic_regions.length*35+'">'+svg_string  + '</svg>';
            legends_list.push({'name': 'geographic-regions-legend.svg', 'svg': svg_string});
        }


        $scope.toSendquery = {'l': legends_list, 't': [tree_svg], 'n': [$scope.results.selectedTree.name+'.svg']};
        $scope.toSendquery = JSON.stringify($scope.toSendquery);
        
    };
    
    
    $scope.treeSelected = function() {
        $scope.$broadcast('treeSelected', {tree: $scope.results.selectedTree});
        if ($scope.results.selectedTree.name.indexOf("global") == -1) {
            $scope.globalTree = false;
        } else {
            $scope.globalTree = true;
        }
        
        $scope.treeDownload();
    };
    
    $scope.nexusDownload = function() {
        var filename = $scope.results.selectedTree.name+"-d-place.NEXUS";
        string = "#NEXUS\nBEGIN TREES;\nTREE " + $scope.results.selectedTree.name+" = " + $scope.results.selectedTree.newick_string+"\nEND;"
        
        nexus_file = new Blob([string], {type: 'text/nexus'});
        saveAs(nexus_file, filename);
    }
    
    // For CSV download
    $scope.disableCSVButton = function () {
        $scope.csvDownloadButton.disabled = true;
        $scope.csvDownloadButton.text = 'Downloading...';
    };

    $scope.enableCSVButton = function () {
        $scope.csvDownloadButton.disabled = false;
        $scope.csvDownloadButton.text = 'CSV';
    };
    
    var file;
    $scope.download = function() {
        var date = new Date();
        var filename = "dplace-societies-"+date.toJSON().replace(/T.*$/,'')+".csv"
        if (!file) {
            $scope.disableCSVButton();
            // queryObject is the in-memory JS object representing the chosen search options
            var queryObject = searchModelService.getModel().getQuery();
            // the CSV download endpoint is a GET URL, so we must send the query object as a string.
            var queryString = encodeURIComponent(JSON.stringify(queryObject));
            // format (csv/svg/etc) should be an argument, and change the endpoint to /api/v1/download
            var csvDownloadLink = "/api/v1/csv_download?query=" + queryString;
            $http.get(csvDownloadLink).then(function(data) {
               file = new Blob([data.data], {type: 'text/csv'});
                saveAs(file, filename);
                $scope.enableCSVButton(); 
            });
        } else {
            var filename = "dplace-societies-"+date.toJSON().replace(/T.*$/,'')+".csv"
            saveAs(file, filename);
        }    
    };

}
