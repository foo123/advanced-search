# Python 3+, a very basic http server that serves files from current dir
# http://docs.python.org/3/library/http.server.html
import os, sys, json

def import_module(name, path):
    import imp
    try:
        mod_fp, mod_path, mod_desc  = imp.find_module(name, [path])
        mod = getattr( imp.load_module(name, mod_fp, mod_path, mod_desc), name )
    except ImportError as exc:
        mod = None
        sys.stderr.write("Error: failed to import module ({})".format(exc))
    finally:
        if mod_fp: mod_fp.close()
    return mod


AdvancedSearch = import_module('AdvancedSearch', os.path.join(os.path.dirname(__file__), '../src/python/'))
if not AdvancedSearch:
    print ('Could not load the AdvancedSearch Module')
    sys.exit(1)
else:    
    print ('AdvancedSearch Module loaded succesfully')

def echo( s ):
    print( json.dumps(s) if not isinstance(s,str) else s )

echo("AdvancedSearch.VERSION = " + AdvancedSearch.VERSION)

echo(['term',AdvancedSearch().query('term')])
echo(['~"term term2"',AdvancedSearch().query('~"term term2"')])
echo(['field=term',AdvancedSearch().query('field=term')])
echo(['field>=term field<=term2',AdvancedSearch().query('field>=term field<=term2')])
echo(['field>=term field<=term2, field2~term3',AdvancedSearch().query('field>=term field<=term2, field2~term3')])
echo(['field>="term term2" field<=term2, field2~"field2~term3", "field2~term3"',AdvancedSearch().query('field>="term term2" field<=term2, field2~"field2~term3", "field2~term3"')])
