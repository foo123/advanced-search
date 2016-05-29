/**
*  advanced-search
*  Transform any search box / search term query into an advanced multi-field search with custom search operators (PHP, Node/XPCOM/JS, Python)
*
*  @version 0.2.0
*  https://github.com/foo123/advanced-search
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
    AdvancedSearch
;

AdvancedSearch = function AdvancedSearch( operators, aliases ) {
    var self = this;
    if ( !(self instanceof AdvancedSearch) ) return new AdvancedSearch(operators, aliases);
    self.operators = !operators ? ['>=','<=','<','>','~','='] : operators;
    self.aliases = aliases || [];
    self.q = null;
};
AdvancedSearch.VERSION = '0.2.0';
AdvancedSearch.parse = function parse( query, operators, aliases, delims ) {
    // parse advanced search
    var factors = [],
        or_delim, and_delim, or_delim_len, and_delim_len, op_len,
        l, i, c, j, in_string, terms, term, field, op
    ;
    
    query = trim('' + query);
    if ( !query || !query.length ) return factors;
    
    aliases = aliases || {};
    delims = delims || {};
    or_delim = delims[HAS]('or') ? delims['or'] : ',';
    and_delim = delims[HAS]('and') ? delims['and'] : ' ';
    or_delim_len = or_delim.length;
    and_delim_len = and_delim.length;
    op_len = operators.length;
    
    l = query.length; i = 0; in_string = null;
    terms = []; field = null; op = null; term = '';
    while ( i < l )
    {
        c = query.charAt( i );
        if ( '"' === c || "'" === c )
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
            i++;
            continue;
        }
        else if ( in_string )
        {
            term += c;
            i++;
            continue;
        }
        
        if ( null == op )
        {
            for(j=0; j<op_len; j++)
            {
                if ( operators[j] === query.slice( i,i+operators[j].length ) )
                {
                    op = operators[j];
                    if ( !field && term.length )
                    {
                        field = term;
                        term = '';
                    }
                    if ( field && aliases[HAS](field) ) field = aliases[field];
                    break;
                }
            }
            if ( op )
            {
                i += op.length;
                continue;
            }
        }
        
        if ( or_delim === query.slice( i,i+or_delim_len ) )
        {
            if ( term.length ) terms.push( {field:field, op:op, term:term} );
            if ( terms.length ) factors.push( terms );
            terms = [];
            field = null; op = null; term = '';
            i += or_delim_len;
        }
        else if ( and_delim === query.slice( i,i+and_delim_len ) )
        {
            if ( term.length ) terms.push( {field:field, op:op, term:term} );
            field = null; op = null; term = '';
            i += and_delim_len;
        }
        else
        {
            term += c;
            i++;
        }
    }
    if ( term.length ) terms.push( {field:field, op:op, term:term} );
    if ( terms.length ) factors.push( terms );
    return factors;
};
AdvancedSearch[PROTO] = {
    constructor: AdvancedSearch
    
    ,q: null
    ,factors: null
    ,operators: null
    ,aliases: null
    
    ,dispose: function( ) {
        var self = this;
        self.q = null;
        self.factors = null;
        self.operators = null;
        self.aliases = null;
        return self;
    }
    
    ,query: function( query, delims ) {
        var self = this;
        self.q = query;
        return self.factors = AdvancedSearch.parse( query, self.operators, self.aliases, delims||{} );
    }
};
// export it
return AdvancedSearch;
})