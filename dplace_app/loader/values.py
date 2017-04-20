# -*- coding: utf-8 -*-
import logging
import re

from django.db import connection

from dplace_app.models import Society, Source, Value, Variable, CodeDescription
from dplace_app.loader.util import get_source


BINFORD_REF_PATTERN = re.compile('(?P<author>[^0-9]+)(?P<year>[0-9]{4}a-z?):')


def load_data(repos):
    refs = []
    societies = {s.ext_id: s for s in Society.objects.all()}
    kw = dict(
        sources={s.key: s for s in Source.objects.all()},
        descriptions={(vcd.variable_id, vcd.code): vcd
                      for vcd in CodeDescription.objects.all()})

    #
    # To speed up the data load, we first delete all relevant objects, and then recreate
    # them using bulk_create.
    # Note that since we must rebuild the association table between values and sources
    # as well, we must keep control over the inserted primary keys for values. To do so,
    # we reset the id sequence as well.
    #
    #CulturalValue.objects.all().delete()
    #with connection.cursor() as c:
    #    for table in ['culturalvalue_references', 'culturalvalue']:
    #        c.execute("ALTER SEQUENCE dplace_app_%s_id_seq RESTART WITH 1" % table)

    variables = {var.label: var for var in Variable.objects.all()}
    objs = []
    pk = 0
    for ds in repos.datasets:
        for item in ds.data:
            if item.soc_id not in societies:  # pragma: no cover
                logging.warn('value for unknown society {0}'.format(item.soc_id))
                continue
            if item.var_id not in variables:   # pragma: no cover
                logging.warn('value for unknown variable {0}'.format(item.var_id))
                continue
            v, _refs = _load_data(
                ds, item, get_source(ds), societies[item.soc_id], variables[item.var_id], **kw)
            if v:
                pk += 1
                objs.append(Value(**v))
                refs.extend([(pk, sid, pages) for sid, pages in _refs or []])

    Value.objects.bulk_create(objs, batch_size=1000)

    with connection.cursor() as c:
        c.executemany(
            """\
INSERT INTO dplace_app_reference (value_id, source_id, pages) VALUES (%s, %s, %s)""", refs)
    return Value.objects.count()


def _load_data(ds, val, source, society, variable, sources=None, descriptions=None):
    v = dict(
        variable=variable,
        comment=val.comment,
        society=society,
        source=source,
        coded_value=val.code,
        coded_value_float=float(val.code)
        if variable.data_type == 'Continuous' and val.code and val.code != 'NA' else None,
        code=descriptions.get((variable.id, val.code)),
        focal_year=val.year,
        subcase=val.sub_case)
    return v, set((sources[r.key].id, r.pages) for r in val.references if r.key in sources)
