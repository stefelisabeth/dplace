# coding: utf8
from __future__ import unicode_literals
import logging

from clldutils.misc import slug
from dplace_app.models import GeographicRegion, Source

_SOURCE_CACHE = {}


def as_source(obj):
    return Source.objects.create(
        key=slug(obj.name), **{k: getattr(obj, k) for k in 'name reference'.split()})


def get_source(ds):
    dsid = getattr(ds, 'id', ds)
    if dsid not in _SOURCE_CACHE:
        try:
            o = Source.objects.get(name=ds.name)
        except Source.DoesNotExist:
            o = as_source(ds)
            o.save()
        _SOURCE_CACHE[ds.id] = o
    return _SOURCE_CACHE[dsid]


def load_references(repos):
    for src in repos.sources.iterentries():
        Source.objects.bulk_create([
            Source(key=src.key, name=src.fields['key'], reference=src.text())])
    return 1


def configure_logging(test=False):
    logger = logging.getLogger()
    logger.setLevel(logging.CRITICAL if test else logging.INFO)
    # file load.log gets everything
    fh = logging.FileHandler('load.log')
    fh.setLevel(logging.CRITICAL if test else logging.INFO)
    # create console handler with a higher log level
    ch = logging.StreamHandler()
    ch.setLevel(logging.CRITICAL if test else logging.WARN)
    # create formatter and add it to the handlers
    formatter = logging.Formatter('%(levelname)s:%(message)s')
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)
    # add the handlers to the logger
    logger.addHandler(fh)
    logger.addHandler(ch)


def load_regions(repos):
    regions = [r['properties'] for r in repos.read_json('geo', 'level2.json')['features']]
    GeographicRegion.objects.bulk_create([
        GeographicRegion(**{k.lower(): v for k, v in r.items()}) for r in regions])
    return len(regions)
