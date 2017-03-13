# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-13 08:09
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
from django.contrib.postgres.operations import UnaccentExtension


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        UnaccentExtension(),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=30, unique=True)),
                ('type', models.CharField(max_length=13)),
            ],
            options={
                'ordering': ('type', 'name'),
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='CulturalCodeDescription',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(db_index=True, default='.', max_length=20)),
                ('code_number', models.IntegerField(db_index=True, null=True)),
                ('description', models.CharField(default='Unknown', max_length=500)),
                ('short_description', models.CharField(default='', max_length=500)),
                ('n', models.IntegerField(default=0, null=True)),
            ],
            options={
                'ordering': ('variable', 'code_number', 'code'),
                'verbose_name': 'Code',
            },
        ),
        migrations.CreateModel(
            name='CulturalValue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('coded_value', models.CharField(db_index=True, default='.', max_length=100)),
                ('coded_value_float', models.FloatField(null=True)),
                ('comment', models.TextField(default='')),
                ('subcase', models.TextField(default='')),
                ('focal_year', models.CharField(default='', max_length=10)),
                ('code', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.CulturalCodeDescription')),
            ],
            options={
                'ordering': ('variable', 'coded_value'),
                'verbose_name': 'Value',
            },
        ),
        migrations.CreateModel(
            name='CulturalVariable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(db_index=True, max_length=25)),
                ('name', models.CharField(db_index=True, default='Unknown', max_length=200)),
                ('codebook_info', models.TextField(default='None')),
                ('data_type', models.CharField(max_length=200, null=True)),
                ('units', models.CharField(default='', max_length=100)),
                ('index_categories', models.ManyToManyField(related_name='index_variables', to='dplace_app.Category')),
                ('niche_categories', models.ManyToManyField(related_name='niche_variables', to='dplace_app.Category')),
            ],
            options={
                'ordering': ['label'],
                'verbose_name': 'Variable',
            },
        ),
        migrations.CreateModel(
            name='EnvironmentalValue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.FloatField(db_index=True)),
                ('comment', models.TextField(default='')),
            ],
            options={
                'ordering': ['variable'],
            },
        ),
        migrations.CreateModel(
            name='EnvironmentalVariable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('var_id', models.CharField(max_length=50, unique=True)),
                ('name', models.CharField(max_length=200, unique=True)),
                ('units', models.CharField(choices=[('mm', 'mm'), ('\u2103', '\u2103'), ('mo', 'mo'), ('', ''), ('gC m-2 day-1', 'gC m-2 day-1')], max_length=100)),
                ('codebook_info', models.CharField(default='None', max_length=500)),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Category')),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='GeographicRegion',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level_2_re', models.FloatField()),
                ('count', models.FloatField()),
                ('region_nam', models.CharField(max_length=254)),
                ('continent', models.CharField(max_length=254)),
                ('tdwg_code', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='ISOCode',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('iso_code', models.CharField(db_index=True, max_length=3, unique=True, verbose_name='ISO Code')),
            ],
            options={
                'verbose_name': 'ISO Code',
            },
        ),
        migrations.CreateModel(
            name='Language',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=200)),
                ('glotto_code', models.CharField(max_length=8, unique=True)),
            ],
            options={
                'verbose_name': 'Language',
            },
        ),
        migrations.CreateModel(
            name='LanguageFamily',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scheme', models.CharField(choices=[('E', 'Ethnologue17'), ('R', 'Ethnologue17-Revised'), ('G', 'Glottolog')], default='G', max_length=1)),
                ('name', models.CharField(db_index=True, max_length=50)),
                ('language_count', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='LanguageTree',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(db_index=True, max_length=50)),
                ('file', models.FileField(null=True, upload_to='language_trees')),
                ('newick_string', models.TextField(default='')),
            ],
        ),
        migrations.CreateModel(
            name='LanguageTreeLabels',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(db_index=True, max_length=255)),
                ('language', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Language')),
                ('languageTree', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dplace_app.LanguageTree')),
            ],
            options={
                'ordering': ('-languagetreelabelssequence__fixed_order',),
            },
        ),
        migrations.CreateModel(
            name='LanguageTreeLabelsSequence',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fixed_order', models.PositiveSmallIntegerField(db_index=True)),
                ('labels', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dplace_app.LanguageTreeLabels')),
            ],
            options={
                'ordering': ('-fixed_order',),
            },
        ),
        migrations.CreateModel(
            name='Society',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ext_id', models.CharField(db_index=True, max_length=20, unique=True, verbose_name='External ID')),
                ('xd_id', models.CharField(db_index=True, default=None, max_length=10, null=True, verbose_name='Cross ID')),
                ('name', models.CharField(db_index=True, max_length=200, verbose_name='Name')),
                ('latitude', models.FloatField(null=True, verbose_name='Latitude')),
                ('longitude', models.FloatField(null=True, verbose_name='Longitude')),
                ('focal_year', models.CharField(blank=True, max_length=100, null=True, verbose_name='Focal Year')),
                ('alternate_names', models.TextField(default='')),
                ('original_name', models.CharField(default=None, max_length=200, null=True, verbose_name='ORIG_name')),
                ('original_latitude', models.FloatField(null=True, verbose_name='ORIG_latitude')),
                ('original_longitude', models.FloatField(null=True, verbose_name='ORIG_longitude')),
                ('hraf_link', models.CharField(default=None, max_length=200, null=True, verbose_name='HRAF')),
                ('chirila_link', models.CharField(default=None, max_length=200, null=True, verbose_name='CHIRILA')),
                ('language', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='societies', to='dplace_app.Language')),
                ('region', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.GeographicRegion')),
            ],
            options={
                'verbose_name_plural': 'Societies',
            },
        ),
        migrations.CreateModel(
            name='Source',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.CharField(db_index=True, max_length=30)),
                ('author', models.CharField(db_index=True, max_length=50)),
                ('reference', models.CharField(max_length=500)),
                ('name', models.CharField(db_index=True, default='', max_length=100)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='source',
            unique_together=set([('year', 'author')]),
        ),
        migrations.AddField(
            model_name='society',
            name='source',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Source'),
        ),
        migrations.AddField(
            model_name='languagetreelabelssequence',
            name='society',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Society'),
        ),
        migrations.AddField(
            model_name='languagetreelabels',
            name='societies',
            field=models.ManyToManyField(through='dplace_app.LanguageTreeLabelsSequence', to='dplace_app.Society'),
        ),
        migrations.AddField(
            model_name='languagetree',
            name='source',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Source'),
        ),
        migrations.AddField(
            model_name='languagetree',
            name='taxa',
            field=models.ManyToManyField(to='dplace_app.LanguageTreeLabels'),
        ),
        migrations.AddField(
            model_name='language',
            name='family',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.LanguageFamily'),
        ),
        migrations.AddField(
            model_name='language',
            name='iso_code',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.ISOCode'),
        ),
        migrations.AddField(
            model_name='environmentalvalue',
            name='society',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Society'),
        ),
        migrations.AddField(
            model_name='environmentalvalue',
            name='source',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Source'),
        ),
        migrations.AddField(
            model_name='environmentalvalue',
            name='variable',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='values', to='dplace_app.EnvironmentalVariable'),
        ),
        migrations.AddField(
            model_name='culturalvariable',
            name='source',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Source'),
        ),
        migrations.AddField(
            model_name='culturalvalue',
            name='references',
            field=models.ManyToManyField(related_name='references', to='dplace_app.Source'),
        ),
        migrations.AddField(
            model_name='culturalvalue',
            name='society',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Society'),
        ),
        migrations.AddField(
            model_name='culturalvalue',
            name='source',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='dplace_app.Source'),
        ),
        migrations.AddField(
            model_name='culturalvalue',
            name='variable',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='values', to='dplace_app.CulturalVariable'),
        ),
        migrations.AddField(
            model_name='culturalcodedescription',
            name='variable',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='codes', to='dplace_app.CulturalVariable'),
        ),
        migrations.AlterUniqueTogether(
            name='language',
            unique_together=set([('iso_code', 'glotto_code')]),
        ),
        migrations.AlterUniqueTogether(
            name='environmentalvalue',
            unique_together=set([('variable', 'society')]),
        ),
        migrations.AlterIndexTogether(
            name='environmentalvalue',
            index_together=set([('variable', 'value')]),
        ),
        migrations.AlterUniqueTogether(
            name='culturalvalue',
            unique_together=set([('variable', 'society', 'coded_value', 'comment', 'subcase', 'focal_year')]),
        ),
        migrations.AlterIndexTogether(
            name='culturalvalue',
            index_together=set([('variable', 'coded_value', 'focal_year', 'subcase'), ('society', 'code', 'focal_year'), ('variable', 'society', 'focal_year'), ('variable', 'code', 'focal_year'), ('society', 'coded_value', 'focal_year', 'subcase')]),
        ),
    ]
