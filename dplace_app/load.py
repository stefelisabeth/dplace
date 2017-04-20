#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
from time import time

import django
django.setup()

from django.db import transaction

from clldutils.path import Path

from pydplace.api import Repos
from loader.util import configure_logging, load_regions, load_references
from loader.society import society_locations, load_societies, load_society_relations
from loader.phylogenies import load_phylogenies
from loader.variables import load_vars
from loader.values import load_data
from loader.glottocode import load_languages


def load(repos, test=True):
    configure_logging(test=test)
    repos = Repos(repos)

    for func in [
        load_societies,
        load_society_relations,
        load_regions,
        society_locations,
        load_vars,
        load_languages,
        load_references,
        load_data,
        load_phylogenies,
    ]:
        with transaction.atomic():
            if not test:
                print("%s..." % func.__name__)  # pragma: no cover
            start = time()
            res = func(repos)
            if not test:  # pragma: no cover
                print("{0} loaded in {1:.2f} secs".format(res, time() - start))


if __name__ == '__main__':  # pragma: no cover
    load(Path(sys.argv[1]), test=False)
    sys.exit(0)
