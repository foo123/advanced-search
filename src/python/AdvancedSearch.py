# -*- coding: UTF-8 -*-
##
#  advanced-search
#  Transform any search box / search term query into an advanced multi-field search with custom search operators (PHP, Node/XPCOM/JS, Python)
#
#  @version 0.2.0
#  https://github.com/foo123/advanced-search
##

class AdvancedSearch:
    """
    Transform any search box / search term query into an advanced multi-field search with custom search operators (PHP, Node/XPCOM/JS, Python)
    https://github.com/foo123/advanced-search
    """

    VERSION = '0.2.0'
    
    def parse( query, operators, aliases=None, delims=None ):
        # parse advanced search
        factors = []
        
        query = ('' + query).strip()
        if not query or not len(query): return factors
        
        if not aliases: aliases = {}
        if not delims: delims = {}
        or_delim = delims['or'] if 'or' in delims else ','
        and_delim = delims['and'] if 'and' in delims else ' '
        or_delim_len = len(or_delim)
        and_delim_len = len(and_delim)
        op_len = len(operators)
        
        l = len(query)
        i = 0
        in_string = None
        terms = []
        field = None
        op = None
        term = ''
        while i < l:
            c = query[ i ]
            if '"' == c or "'" == c:
                if in_string == c:
                    in_string = None
                elif in_string:
                    term += c
                else:
                    in_string = c
                i += 1
                continue
            elif in_string:
                term += c
                i += 1
                continue
            
            if not op:
                for oper in operators:
                    if oper == query[ i:i+len(oper) ]:
                        op = oper
                        if not field and len(term):
                            field = term
                            term = ''
                        if field and (field in aliases): field = aliases[field]
                        break
                if op:
                    i += len(op)
                    continue
            
            if or_delim == query[ i:i+or_delim_len ]:
                if len(term): terms.append( {'field':field, 'op':op, 'term':term} )
                if len(terms): factors.append( terms )
                terms = []
                field = None
                op = None
                term = ''
                i += or_delim_len
            elif and_delim == query[ i:i+and_delim_len ]:
                if len(term): terms.append( {'field':field, 'op':op, 'term':term} )
                field = None
                op = None
                term = ''
                i += and_delim_len
            else:
                term += c
                i += 1
        
        if len(term): terms.append( {'field':field, 'op':op, 'term':term} )
        if len(terms): factors.append( terms )
        return factors
    
    def __init__( self, operators=None, aliases=None ):
        self.operators = ['>=','<=','<','>','~','='] if not operators else operators
        self.aliases = {} if not aliases else aliases
        self.q = None
        self.factors = None
    
    def dispose( self ):
        self.q = None
        self.factors = None
        self.operators = None
        self.aliases = None
        return self
    
    def query( self, query, delims=None ):
        self.q = query
        self.factors = AdvancedSearch.parse( query, self.operators, self.aliases, delims )
        return self.factors



# if used with 'import *'
__all__ = ['AdvancedSearch']
        