# -*- coding: utf-8 -*-
import csv
import sys
from load.isocode import *
from load.environmental import *
from load.language import *
from load.society_ea import *
from load.society_binford import *

LOAD_BY_ROW=('iso', 'env_vals',
             'langs', 'iso_lat_long',
             'ea_soc', 'ea_vars', 'ea_vals',
             'bf_soc', 'bf_vars', 'bf_vals')

def run(file_name=None, mode=None):
    # read the csv file
    with open(file_name, 'rb') as csvfile:
        if mode in LOAD_BY_ROW:
            csv_reader = csv.DictReader(csvfile)
            for dict_row in csv_reader:
                if mode == 'iso':
                    load_isocode(dict_row)
                elif mode == 'iso_lat_long':
                    load_iso_lat_long(dict_row)
                elif mode == 'ea_soc':
                    load_ea_society(dict_row)
                elif mode == 'env_vals':
                    load_environmental(dict_row)
                elif mode == 'ea_vars':
                    load_ea_var(dict_row)
                elif mode == 'ea_vals':
                    load_ea_val(dict_row)
                elif mode == 'langs':
                    load_lang(dict_row)
                elif mode == 'bf_soc':
                    load_bf_society(dict_row)
                elif mode =='bf_vars':
                    load_bf_var(dict_row)
        elif mode == 'ea_codes':
            load_ea_codes(csvfile)
        elif mode == 'bf_codes':
            load_bf_codes(csvfile)
    if len(MISSING_CODES) > 0:
        print "Missing ISO Codes:"
        print '\n'.join(MISSING_CODES)
    if mode == 'ea_vals':
        # after loading values, populate society-level data from variable values
        postprocess_ea_societies()
    elif mode == 'env_vars':
        create_environmental_variables()

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print "\nUsage: %s csv_file mode" % sys.argv[0]
        print "You should run load_all_datasets.sh instead of this script directly."
        print
    else:
        run(sys.argv[1], sys.argv[2])
