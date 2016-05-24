/**
* advanced-search
*
* Transform any search box / search term query into an advanced multi-field search with custom search operators (PHP, Node/XPCOM/JS, Python)
*
* https://github.com/foo123/advanced-search
* @version 0.1.0
**/
!function( root, name, factory ) {
"use strict";
var m;
if ( ('undefined'!==typeof Components)&&('object'===typeof Components.classes)&&('object'===typeof Components.classesByID)&&Components.utils&&('function'===typeof Components.utils['import']) ) /* XPCOM */
    (root.EXPORTED_SYMBOLS = [ name ]) && (root[ name ] = factory.call( root ));
else if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    module.exports = factory.call( root );
else if ( ('function'===typeof(define))&&define.amd&&('function'===typeof(require))&&('function'===typeof(require.specified))&&require.specified(name) ) /* AMD */
    define(name,['require','exports','module'],function( ){return factory.call( root );});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[ name ] = (m=factory.call( root )))&&('function'===typeof(define))&&define.amd&&define(function( ){return m;} );
}(  /* current root */          this, 
    /* module name */           "AdvancedSearch",
    /* module factory */        function( exports, undef ) {
"use strict";

var PROTO = 'prototype', HAS = 'hasOwnProperty', 
    toString = Object[PROTO].toString,
    trim_re = /^\s+|\s+$/g,
    trim = String[PROTO].trim
        ? function( s ){ return s.trim(); }
        : function( s ){ return s.replace(trim_re, ''); },
    escaped_re = /([.*+?^${}()|[\]\/\\\-])/g,
    AdvancedSearch
;

function esc_re( s )
{
    return s.replace(escaped_re, '\\$1');
}

AdvancedSearch = function AdvancedSearch( operators, aliases ) {
    var self = this;
    if ( !(self instanceof AdvancedSearch) ) return new AdvancedSearch(operators, aliases);
    self.operators = !operators ? ['>=','<=','<','>','~','='] : operators;
    self.aliases = aliases || [];
    self.q = null;
};
AdvancedSearch.VERSION = '0.1.0';
AdvancedSearch.parse = function parse( query, operators, aliases, delims ) {
    // parse advanced search
    var fields = {}, factors = [],
        or_delim, and_delim, field_delim,
        l, i, c, j, k, in_string, terms, term, field, op, term_re, m
    ;
    
    query = trim('' + query);
    if ( !query || !query.length ) return [[], []];
    
    aliases = aliases || {};
    delims = delims || {};
    or_delim = delims[HAS]('or') ? delims['or'] : ',';
    and_delim = delims[HAS]('and') ? delims['and'] : ' ';
    field_delim = esc_re(delims[HAS]('field') ? delims['field'] : '::');
    
    l = query.length; i = 0; in_string = null;
    terms = []; term = '';
    while ( i < l )
    {
        c = query.charAt( i++ );
        if ( or_delim === c )
        {
            if ( in_string )
            {
                term += c;
            }
            else
            {
                if ( term.length )
                {
                    terms.push( term );
                    term = '';
                }
                if ( terms.length ) factors.push( terms );
                terms = [];
                term = '';
            }
        }
        else if ( '"' === c || "'" === c )
        {
            if ( in_string === c )
            {
                in_string = null;
            }
            else if ( in_string )
            {
                term += c;
            }
            else
            {
                in_string = c;
            }
        }
        else if ( and_delim === c )
        {
            if ( in_string )
            {
                term += c;
            }
            else if ( term.length )
            {
                terms.push( term );
                term = '';
            }
        }
        else
        {
            term += c;
        }
    }
    if ( term.length )
    {
        terms.push( term );
        term = '';
    }
    if ( terms.length )
    {
        factors.push( terms );
    }
    
    term_re = new RegExp("^(([a-z0-9_\\-]+)"+field_delim+"("+operators.map(esc_re).join('|')+")?)?(.+?)$","i");
    for(i=0,l=factors.length; i<l; i++)
    {
        terms = factors[i];
        if ( !terms || !terms.length ) continue;
        for(j=0,k=terms.length; j<k; j++)
        {
            term = terms[j];
            if ( !term || !term.length ) continue;
            m = term.match( term_re );
            term = trim(m[4]);
            field = m[2] ? m[2] : null;
            op = m[3] ? m[3] : null;
            if ( op && (0 > operators.indexOf(op)) )
            {
                term += op;
                op = null;
            }
            if ( !!field )
            {
                if ( aliases[HAS](field) ) field = aliases[field];
                if ( !fields[HAS](field) ) fields[field] = 1;
            }
            factors[i][j] = {'term':term,'field':field,'op':op};
        }
    }
    return [factors, Object.keys(fields)];
};
AdvancedSearch[PROTO] = {
    constructor: AdvancedSearch
    
    ,q: null
    ,fields: null
    ,factors: null
    ,operators: null
    ,aliases: null
    
    ,dispose: function( ) {
        var self = this;
        self.q = null;
        self.fields = null;
        self.factors = null;
        self.operators = null;
        self.aliases = null;
        return self;
    }
    
    ,query: function( query, delims ) {
        var self = this, r;
        self.q = query;
        r = AdvancedSearch.parse( query, self.operators, self.aliases, delims||{} );
        self.factors = r[0];
        self.fields = r[1];
        return self.factors;
    }
};
// export it
return AdvancedSearch;
})