var AdvancedSearch = require('../src/js/AdvancedSearch.js');

function echo( s )
{
    console.log( "object" === typeof s ? JSON.stringify(s, null, 4) : s );
}

echo("AdvancedSearch.VERSION = " + AdvancedSearch.VERSION);

echo(['term',AdvancedSearch().query('term')]);
echo(['~"term term2"',AdvancedSearch().query('~"term term2"')]);
echo(['field=term',AdvancedSearch().query('field=term')]);
echo(['field>=term field<=term2',AdvancedSearch().query('field>=term field<=term2')]);
echo(['field>=term field<=term2, field2~term3',AdvancedSearch().query('field>=term field<=term2, field2~term3')]);
echo(['field>="term term2" field<=term2, field2~"field2~term3", "field2~term3"',AdvancedSearch().query('field>="term term2" field<=term2, field2~"field2~term3", "field2~term3"')]);
