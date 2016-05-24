# advanced-search

Transform any search box / search term query into an advanced multi-field search with custom search operators (PHP, Node/XPCOM/JS, Python)


**What it does**

This enables out-of-the-box search boxes (actualy the search term query) to **textualy** encode complex (customizable) search queries, including `AND`/`OR` operators, `greater-than`, `less-than`, `like`, reference multiple different `search fields` and so on.. Similar to advanced search queries in search engines. **Note**, this **does not include a GUI for that** (although, one, can indeed use a GUI to build the complex search query), only the functionality to interpret the search term as complex query and get the parsed parts to be used then to do the actual query. The advantage is that one can use this to leverage **ANY** search form/search term to be able to encode a complex query without additional GUI or anything else extraneous and extravagant.


**Example** (see `test/` folder)

```javascript
var AdvancedSearch = require('../src/js/AdvancedSearch.js');

function echo( s )
{
    console.log( "object" === typeof s ? JSON.stringify(s, null, 4) : s );
}

echo("AdvancedSearch.VERSION = " + AdvancedSearch.VERSION);

echo(['term',AdvancedSearch().query('term')]);
echo(['field::term',AdvancedSearch().query('field::term')]);
echo(['field::>=term field::<=term2',AdvancedSearch().query('field::>=term field::<=term2')]);
echo(['field::>=term field::<=term2, field2::~term3',AdvancedSearch().query('field::>=term field::<=term2, field2::~term3')]);
```

**output**

```text
AdvancedSearch.VERSION = 0.1.0
[
    "term",
    [
        [
            {
                "term": "term",
                "field": null,
                "op": null
            }
        ]
    ]
]
[
    "field::term",
    [
        [
            {
                "term": "term",
                "field": "field",
                "op": null
            }
        ]
    ]
]
[
    "field::>=term field::<=term2",
    [
        [
            {
                "term": "term",
                "field": "field",
                "op": ">="
            },
            {
                "term": "term2",
                "field": "field",
                "op": "<="
            }
        ]
    ]
]
[
    "field::>=term field::<=term2, field2::~term3",
    [
        [
            {
                "term": "term",
                "field": "field",
                "op": ">="
            },
            {
                "term": "term2",
                "field": "field",
                "op": "<="
            }
        ],
        [
            {
                "term": "term3",
                "field": "field2",
                "op": "~"
            }
        ]
    ]
]
```

The output consists of a tree representing the complex query, where the first level
reepresents `OR` clauses and the second level `AND` clauses (inside each `OR` clause) including operators (default `null` interpret as you like) and specific search `field` references (see above example to get an idea).

One could then contruct an actual query out of this (note how the original GUI of the application did not change at all, it was simply leveraged in functionality) like the following:

```javascript
var sql = "SELECT field1,field2,field3 FROM table";
var query = AdvancedSearch().query(GET['search']);
var OR = [];
for(var i=0; i<query.length; i++)
{
    var AND = [], factor = query[i];
    for(var j=0; j<factor.length; j++)
    {
        var term = factor[j];
        if ( null == term.field )
        {
            // default search field
            term.field = 'field1';
        }
        if ( null == term.op )
        {
            // default search operator
            term.op = '=';
        }
        if ( '~' == term.op )
        {
            term.op = 'LIKE';
        }
        AND.push(term.field+' '+term.op+' '+db.esc(term.term));
    }
    OR.push('(' + AND.join(') AND (') + ')');
}
sql += ' WHERE ' + OR.join(' OR ');
db.exec(sql, function(results){
    // get search results here
});
```