# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-04-09 03:18
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('dplace_app', '0084_add_field_comment_to_environmentalvalue'),
    ]

    operations = [
        migrations.AddField(
            model_name='environmentalvariable',
            name='var_id',
            field=models.CharField(default='', max_length=50, unique=True),
        ),
    ]
