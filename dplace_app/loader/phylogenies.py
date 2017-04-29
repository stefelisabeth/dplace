import re

from clldutils.misc import nfilter
from nexus import NexusReader
from ete3 import Tree
from dplace_app.models import (
    Society, LanguageTree, LanguageTreeLabels, LanguageTreeLabelsSequence,
)
from dplace_app.loader.util import as_source


def load_phylogenies(repos):
    sources, sequences = {}, []
    for obj in repos.phylogenies:
        _load(obj, sources, sequences)
    LanguageTreeLabelsSequence.objects.bulk_create(sequences)
    return len(repos.phylogenies)


def _load(obj, sources, sequences):
    # now add languages to the tree
    reader = NexusReader(obj.trees.as_posix())

    tree = LanguageTree.objects.create(name=obj.id)
    source = sources.get((obj.author, obj.year))
    if not source:
        sources[(obj.author, obj.year)] = source = as_source(obj)
        source.save()
    tree.source = source

    # Remove '[&R]' from newick string
    reader.trees.detranslate()
    newick = re.sub(r'\[.*?\]', '', reader.trees.trees[0])
    try:
        newick = newick[newick.index('=') + 1:]
    except ValueError:  # pragma: no cover
        newick = newick

    tree.newick_string = str(newick)
    Tree(tree.newick_string, format=1)

    for item in obj.taxa:
        if not item.xd_ids:
            continue

        label = LanguageTreeLabels.objects.create(languageTree=tree, label=item.taxon)
        tree.taxa.add(label)
        for society in Society.objects.all().filter(xd_id__in=item.xd_ids):
            try:
                f_order = len(item.soc_ids) - item.soc_ids.index(society.ext_id) - 1
            except:
                f_order = 0
            sequences.append(LanguageTreeLabelsSequence(
                society=society, labels=label, fixed_order=f_order))
    tree.save()
