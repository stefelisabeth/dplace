# -*- coding: utf-8 -*-
# __author__ = 'dan'
from django.contrib.gis.geos import Point
from django.core.exceptions import ObjectDoesNotExist
from dplace_app.models import *
from sources import get_source

ENVIRONMENTAL_MAP = {
    'AnnualMeanTemperature': {
        'name': 'Annual Mean Temperature',
        'category': 'Climate',
        'description': 'Mean value of monthly precipitation or temperature across the year',
        'units': '°C',
    },
    'AnnualTemperatureVariance': {
        'name': 'Annual Temperature Variance',
        'category': 'Climate',
        'description': 'Variance in temperature means (averaged across years)', 
        'units': '°C',
    },
    'TemperatureConstancy': {
        'name': 'Temperature Constancy',
        'category': 'Climate',
        'units': '',
        'description': 'Colwell’s (1974) information theoretic index. Indicates the extent to which a climate patterns are predictable because conditions are constant.',
    },
    'TemperatureContingency': {
        'name': 'Temperature Contingency',
        'category': 'Climate',
        'units': '',
        'description': 'Colwell’s (1974) information theoretic index. Indicates the extent to which a climate patterns are predictable because conditions oscillate in a very predictable manner.',
    },
    'TemperaturePredictability': {
        'name': 'Temperature Predictability',
        'category': 'Climate',
        'units': '',
        'description': 'Colwell’s (1974) information theoretic index. Indicates the extent to which a climate patterns are predictable due to either constancy or contingency.',
    },
    'AnnualMeanPrecipitation': {
        'name': 'Annual Mean Precipitation',
        'category': 'Climate',
        'units': 'mm',
        'description': 'Mean value of monthly precipitation.',
    },
    'AnnualPrecipitationVariance': {
        'name': 'Annual Precipitation Variance',
        'category': 'Climate',
        'units': '',
        'description': 'Variance in monthly precipitation means (averaged across years)',
    },
    'PrecipitationConstancy': {
        'name': 'Precipitation Constancy',
        'category': 'Climate',
        'units': '',
        'description': 'Colwell’s (1974) information theoretic index. Indicates the extent to which a climate patterns are predictable because conditions are constant.',
    },
    'PrecipitationContingency': {
        'name': 'Precipitation Contingency',
        'category': 'Climate',
        'units': '',
        'description': 'Colwell’s (1974) information theoretic index. Indicates the extent to which a climate patterns are predictable because conditions oscillate in a very predictable manner.',
    },
    'PrecipitationPredictability': {
        'name': 'Precipitation Predictability',
        'category': 'Climate',
        'units': '',
        'description': 'Colwell’s (1974) information theoretic index. Indicates the extent to which a climate patterns are predictable due to either constancy or contingency.'
    },
    'BirdRichness': {
        'name': 'Bird Richness',
        'category': 'Ecology',
        'units': '',
        'description': 'Number of coexisting species in a given taxonomic group.',
    },
    'MammalRichness': {
        'name': 'Mammal Richness',
        'category': 'Ecology',
        'units': '',
        'description': 'Number of coexisting species in a given taxonomic group.',
    },
    'AmphibianRichness': {
        'name': 'Amphibian Richness',
        'category': 'Ecology',
        'units': '',
        'description': 'Number of coexisting species in a given taxonomic group.',
    },
    'VascularPlantsRichness': {
        'name': 'Vascular Plants Richness',
        'category': 'Ecology',
        'units': '',
        'description': '',
    },
    # TODO: EcoRegion! (text)
    'Elevation': {
        'name': 'Elevation',
        'category': 'Physical landscape',
        'units': '',
        'description': 'Meters above sea level',
    },
    'Slope': {
        'name': 'Slope',
        'category': 'Physical landscape',
        'units': '',
        'description': 'Mean incline (in degrees) in the terrain (unit of sample 0.5 by 0.5 degree cell)',
    },
    # TODO: Coastal (Bool)
    'NetPrimaryProduction': {
        'name': 'Net Primary Production',
        'category': 'Ecology',
        'units': '',
        'description': 'grams of carbon taken in by plants per square meter of land per day',
    },
    'DurationOfGrowingSeason': {
        'name': 'Duration of Growing Season',
        'category': 'Climate',
        'units': 'mo',
        'description': 'Mean number of months in the year that net primary production is positive',
    },
    'MeanGrowingSeason.NPP': {
        'name': 'Mean Growing Season NPP',
        'category': 'Ecology',
        'units': '',
        'description': 'Mean net primary production during growing season',
    },
    'InterYearVariance.GrowingSeason.NPP': {
        'name': 'Inter-Year Variance Growing Season NPP',
        'category': 'Ecology',
        'units': '',
        'description': 'Variance among years in NPP for the growing season',
    },
}

def iso_from_code(code):
    if code == 'NA' or len(code) == 0:
        return None
    try:
        return ISOCode.objects.get(iso_code=code)
    except ObjectDoesNotExist:
        return None

def create_environmental_variables():
    for k in ENVIRONMENTAL_MAP:
        var_dict = ENVIRONMENTAL_MAP[k]
        if 'category' in var_dict:
            env_category, created = EnvironmentalCategory.objects.get_or_create(name=var_dict['category'])
            obj, created = EnvironmentalVariable.objects.get_or_create(name=var_dict['name'],units=var_dict['units'])
            obj.category = env_category
            obj.codebook_info = var_dict['description']
            obj.save()
        else:
            EnvironmentalVariable.objects.get_or_create(name=var_dict['name'],units=var_dict['units']) 
    
def load_environmental(env_dict):
    ext_id = env_dict['ID']
    source = get_source(env_dict['Source'])

    # hack for B109 vs. 109
    if source.author == 'Binford' and ext_id.find('B') == -1:
        ext_id = 'B' + ext_id
    
    try:
        society = Society.objects.get(ext_id=ext_id, source=source)
    except ObjectDoesNotExist:
        print "Unable to find a Society object with ext_id %s and source %s, skipping..." % (ext_id, source)
        return
    # This limits the environmental data to one record per society record
    found_environmentals = Environmental.objects.filter(society=society)
    if len(found_environmentals) == 0:
        reported_latlon =  Point(float(env_dict['Orig.longitude']),float(env_dict['Orig.latitude']))
        actual_latlon = Point(float(env_dict['longitude']), float(env_dict['latitude']))
        iso_code = iso_from_code(env_dict['iso'])
        
        # Create the base Environmental
        environmental = Environmental(society=society,
                                      reported_location=reported_latlon,
                                      actual_location=actual_latlon,
                                      source=source,
                                      iso_code=iso_code)
        environmental.save()
        for k in ENVIRONMENTAL_MAP: # keys are the columns in the CSV file
            var_dict = ENVIRONMENTAL_MAP[k]
            try:
                # Get the variable
                variable = EnvironmentalVariable.objects.get(name=var_dict['name'])
            except ObjectDoesNotExist:
                print "Warning: Did not find an EnvironmentalVariable with name %s" % var_dict['name']
                continue
            if env_dict[k] and env_dict[k] != 'NA':
                value = float(env_dict[k])
                EnvironmentalValue.objects.get_or_create(variable=variable,value=value,
                    environmental=environmental, source=source
                )
