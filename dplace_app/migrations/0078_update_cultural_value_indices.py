# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-05 00:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dplace_app', '0077_merge'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='culturalvalue',
            unique_together=set([('variable', 'society', 'coded_value', 'comment', 'subcase', 'focal_year')]),
        ),
        migrations.AlterIndexTogether(
            name='culturalvalue',
            index_together=set([('variable', 'coded_value', 'focal_year', 'subcase'), ('society', 'code', 'focal_year'), ('variable', 'society', 'focal_year'), ('variable', 'code', 'focal_year'), ('society', 'coded_value', 'focal_year', 'subcase')]),
        ),
    ]
