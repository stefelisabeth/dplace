import re
import logging
from os.path import basename
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.core.files import File
from nexus import NexusReader
from dplace_app.models import LanguageTree, Language, ISOCode

def get_language(taxon_name):
    # taxon name may be an iso code, language name, or glotto code
    language = None
    try:
        language = [Language.objects.get(iso_code__iso_code=taxon_name)]
        
    except MultipleObjectsReturned:
        language = Language.objects.filter(iso_code__iso_code=taxon_name)
    
    except ObjectDoesNotExist:
        # Not found by ISO Code, try by glotto code
        try:
            language = [Language.objects.get(glotto_code__glotto_code=taxon_name)]
            
        except ObjectDoesNotExist:
            # Not found by Glotto Code either, try by name
            try:
                language = [Language.objects.get(name=taxon_name)]
            except ObjectDoesNotExist:
                #No language found at all
                raise ValueError("Warning: Language %s not found" % (taxon_name))
            except MultipleObjectsReturned:
                raise ValueError("Error: multiple languages returned for %s" % (taxon_name))
        except MultipleObjectsReturned:
            raise ValueError("Error: multiple languages returned for %s" % (taxon_name))
    except MultipleObjectsReturned:
        raise ValueError("Error: multiple languages returned for %s" % (taxon_name))
    return language

def load_tree(file_name, verbose=False):
    # make a tree if not exists. Use the name of the tree
    tree_name = basename(file_name)
    with open(file_name,'r') as f:
        tree, created = LanguageTree.objects.get_or_create(name=tree_name)
        if created:
            tree.file = File(f)
            tree.save()
    # now add languages to the tree
    reader = NexusReader(file_name)
    #Remove '[&R]' from newick string
    newick = re.sub(r'\[.*?\]', '', reader.trees.trees[0])
    try:
        newick = newick[newick.index('=')+1:]
    except ValueError:
        newick = newick
        
    if verbose:
        logging.info("Formatting newick string %s" % (newick))
        
    tree.newick_string = str(newick)
    for taxon_name in reader.trees.taxa:
        if taxon_name is '1':
            continue
        language = None
        try:
            language = get_language(taxon_name)
        except ValueError:
            logging.warn("load_tree: Error with taxon - `%s` %s" % (taxon_name, file_name))
            
        if language:
            if len(language) > 1:
                for l in language:
                    tree.languages.add(l)
            else:
                tree.languages.add(language[0])
    tree.save()

load_glotto_tree = load_tree
