# -*- coding: utf-8 -*-
import logging

from django.db import connection

from dplace_app.models import Society, Source, Value, Variable, CodeDescription
from dplace_app.loader.util import get_source


def load_data(repos):
    references, values, pk = [], [], 0
    societies = {s.ext_id: s for s in Society.objects.all()}
    sources = {s.key: s for s in Source.objects.all()}
    descriptions = {
        (vcd.variable_id, vcd.code): vcd for vcd in CodeDescription.objects.all()}
    variables = {var.label: var for var in Variable.objects.all()}

    for ds in repos.datasets:
        source = get_source(ds)
        for item in ds.data:
            society = societies.get(item.soc_id)
            if not society:  # pragma: no cover
                logging.warn('value for unknown society {0}'.format(item.soc_id))
                continue
            variable = variables.get(item.var_id)
            if not variable:   # pragma: no cover
                logging.warn('value for unknown variable {0}'.format(item.var_id))
                continue
            pk += 1
            values.append(Value(
                variable=variable,
                comment=item.comment,
                society=society,
                source=source,
                coded_value=item.code,
                coded_value_float=float(item.code)
                if variable.data_type == 'Continuous' and item.code and item.code != 'NA'
                else None,
                code=descriptions.get((variable.id, item.code)),
                focal_year=item.year,
                subcase=item.sub_case))
            references.extend((pk, sources[r.key].id, r.pages)
                              for r in item.references if r.key in sources)

    Value.objects.bulk_create(values, batch_size=1000)
    with connection.cursor() as c:
        c.executemany(
            """\
INSERT INTO dplace_app_reference (value_id, source_id, pages) VALUES (%s, %s, %s)""",
            references)
    return Value.objects.count()
