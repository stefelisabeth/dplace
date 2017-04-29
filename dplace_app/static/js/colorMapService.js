function ColorMapService() {
    //an array of colors for coded values
    this.colorMap = [
        'NaN',
        'rgb(228,26,28)',
        'rgb(69,117,180)',
        'rgb(77,146,33)',
        'rgb(152,78,163)',
        'rgb(255,127,0)',
        'rgb(255,255,51)',
        'rgb(166,86,40)',
        'rgb(247,129,191)',
        'rgb(153,153,153)',
        'rgb(0,68,27)',
        'rgb(171,217,233)',
        'rgb(73,0,106)',
        'rgb(174,1,126)',
        'rgb(179,222,105)',
        'rgb(8,48,107)',
        'rgb(255,255,153)',
        'rgb(82,82,82)',
        'rgb(0,0,0)',
        'rgb(103,1,13)'
    ];
    // converts hsl to rgb
    function hslToRgb(h, s, l) {
        if (h < 0) h += 360;
        if (h >= 360) h = h % 360;
        var r, g, b;
        var r1, g1, b1;
        chroma = (1 - Math.abs(2*l - 1)) * s;
        
        _h = h / 60;
        
        x = chroma*(1 - Math.abs(_h % 2 - 1));
        
        if (_h >= 0 && _h < 1) {
            r1 = chroma;
            g1 = x;
            b1 = 0;
        } else if (_h >= 1 && _h < 2) {
            r1 = x;
            g1 = chroma;
            b1 = 0;
        } else if (_h >= 2 && _h < 3) {
            r1 = 0;
            g1 = chroma;
            b1 = x;
        } else if (_h >= 3 && _h < 4) {
            r1 = 0;
            g1 = x;
            b1 = chroma;
        } else if (_h >= 4 && _h < 5) {
            r1 = x;
            g1 = 0;
            b1 = chroma;
        } else if (_h >= 5 && _h < 6) {
            r1 = chroma;
            g1 = 0;
            b1 = x;
        } else if (!h) {
            r1 = 0; g1 = 0; b1 = 0;
        } 
        m = l - (0.5 * chroma);
        rgb = [Math.round((r1 + m)*255), Math.round((g1 + m)*255), Math.round((b1 + m)*255)];
        return rgb;
    }

    //blue to red gradient for environmental variables
    this.tempColor = function(index, min, max, name) {
        if (name.indexOf("Net primary production") != -1 || name.indexOf("NPP") != -1) {
            hue = 30 + (((index - min) / (max - min)) * 88);
        } else if (name.indexOf("precipitation") != -1) {
            color = this.mapColorMonochrome(min, max, index, 252);
            return color;
        }
        else {
            hue = 240 - (((index - min) / (max - min))*240);
        }
        rgb = hslToRgb(hue, 1, 0.5);
        return 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
    }

    //normal gradient
    this.mapColor = function(index, count) {  
        hue = (index / count)*240;
        rgb = hslToRgb(hue, 1, 0.5);
        return 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
    }
    
    this.mapColorMonochrome = function(min, max, value, color) {
        var lum = (((value-min)/(max-min))) * 78; lum = 100 - lum; 
        rgb = hslToRgb(color, 0.65, lum/100);
        return 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
    }
    
    this.generateRandomHue = function(value, codes, index, count) {
        hue = (index / count) * 300;
        lum = 85 - ((value / codes) * 90)
        rgb = hslToRgb(hue, 0.65, lum/100);
        return 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
    }

    this.generateColorMap = function(results) {
        
        // assigns a color to each code for categorical/ordinal variables. Stores in .codes as code: {name, color}
        var new_codes = {}
        for (var i = 0; i < results.geographic_regions.length; i++) {
            new_codes[results.geographic_regions[i].tdwg_code] = this.mapColor(i, results.geographic_regions.length);
        }
        results.geographic_regions.codes = new_codes;
        
        if (results.classifications) {
            new_codes = {}
            for (var i = 0; i < results.classifications.length; i++) {
                new_codes[results.classifications[i].id] = this.mapColor(i, results.classifications.length);
            }
            results.classifications.codes = new_codes;
        }
        
        continuous_vars = {}
        for (var j = 0; j < results.variable_descriptions.length; j++) {
            if (results.variable_descriptions[j].variable.data_type.toLowerCase() == 'continuous') {
                continuous_vars[results.variable_descriptions[j].variable.id] = results.variable_descriptions[j];
                continue;
            }
            
            new_codes = {}
            for (var i = 0; i < results.variable_descriptions[j].codes.length; i++) {
                new_codes[results.variable_descriptions[j].codes[i].code] = results.variable_descriptions[j].codes[i];
                if (results.variable_descriptions[j].codes[i].code == 'NA')
                    new_codes[results.variable_descriptions[j].codes[i].code]= 'rgb(255,255,255)';
                else {
                    if (results.variable_descriptions[j].variable.data_type.toLowerCase() == 'ordinal') {
                        new_codes[results.variable_descriptions[j].codes[i].code] = this.generateRandomHue(parseInt(results.variable_descriptions[j].codes[i].code),results.variable_descriptions[j].codes.length, results.variable_descriptions[j].variable.id, 5);  
                    } else if (results.variable_descriptions[j].variable.data_type.toLowerCase() == 'categorical') {
                        new_codes[results.variable_descriptions[j].codes[i].code] = this.colorMap[parseInt(results.variable_descriptions[j].codes[i].code)%this.colorMap.length];
                    }
                }
            }
            results.variable_descriptions[j].codes.codes = new_codes;
        }
        
        for (var j = 0; j < results.environmental_variables.length; j++) {
            if (results.environmental_variables[j].variable.data_type.toLowerCase() == 'continuous') {
                continuous_vars[results.environmental_variables[j].variable.id] = results.environmental_variables[j];
                continue;
            }
            
            new_codes = {}
            for (var i = 0; i < results.environmental_variables[j].codes.length; i++) {
                if (results.environmental_variables[j].codes[i].code == 'NA') new_codes[results.environmental_variables[j].codes[i].code] = 'rgb(255,255,255)';
                else {
                    new_codes[results.environmental_variables[j].codes[i].code] = this.tempColor(i, 0, results.environmental_variables[j].codes.length, results.environmental_variables[j].variable.name);
                }
            }
            results.environmental_variables[j].codes.codes = new_codes;
        }
        
        // for continuous variables, get color and save it with the value
        for (var j = 0; j < results.societies.length ; j++) {
            for (var i = 0; i < results.societies[j].variable_coded_values.length; i++) {
                if (results.societies[j].variable_coded_values[i].variable in continuous_vars) {
                    if (results.societies[j].variable_coded_values[i].coded_value.toUpperCase() == 'NA') results.societies[j].variable_coded_values[i]['color'] = 'rgb(255, 255, 255)'
                    else
                        results.societies[j].variable_coded_values[i]['color'] = this.mapColorMonochrome(continuous_vars[results.societies[j].variable_coded_values[i].variable].min, continuous_vars[results.societies[j].variable_coded_values[i].variable].max, results.societies[j].variable_coded_values[i].coded_value_float, 0);
                }
            }
            
            for (var i = 0; i < results.societies[j].environmental_values.length; i++) {
                if (results.societies[j].environmental_values[i].variable in continuous_vars) {
                    results.societies[j].environmental_values[i]['color'] = this.tempColor(results.societies[j].environmental_values[i].coded_value_float, continuous_vars[results.societies[j].environmental_values[i].variable].min, continuous_vars[results.societies[j].environmental_values[i].variable].max, continuous_vars[results.societies[j].environmental_values[i].variable].variable.name); 
            
                }
            }
        }
        return results;
    };
}
