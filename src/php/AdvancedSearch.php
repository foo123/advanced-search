<?php
/**
* advanced-search
*
* Transform any search box / search term query into an advanced multi-field search with custom search operators (PHP, Node/XPCOM/JS, Python)
*
* https://github.com/foo123/advanced-search
* @version 0.1.0
**/
if ( !class_exists('AdvancedSearch') )
{
class AdvancedSearch
{
    const VERSION = '0.1.0';
    
    public static function parse( $query, $operators, $aliases=array(), $delims=array() )
    {
        // parse advanced search
        $fields = array( );
        $factors = array( );
        
        $query = trim('' . $query);
        if ( empty($query) ) return array($factors, $fields);
        
        $or_delim = isset($delims['or']) ? $delims['or'] : ',';
        $and_delim = isset($delims['and']) ? $delims['and'] : ' ';
        $field_delim = preg_quote(isset($delims['field']) ? $delims['field'] : '::');
        
        $l = strlen($query); $i = 0; $in_string = null;
        $terms = array(); $term = '';
        while ( $i < $l )
        {
            $c = $query[ $i++ ];
            if ( $or_delim === $c )
            {
                if ( $in_string )
                {
                    $term .= $c;
                }
                else
                {
                    if ( strlen($term) )
                    {
                        $terms[] = $term;
                        $term = '';
                    }
                    if ( !empty($terms) ) $factors[] = $terms;
                    $terms = array();
                    $term = '';
                }
            }
            elseif ( '"' === $c || "'" === $c )
            {
                if ( $in_string === $c )
                {
                    $in_string = null;
                }
                elseif ( $in_string )
                {
                    $term .= $c;
                }
                else
                {
                    $in_string = $c;
                }
            }
            elseif ( $and_delim === $c )
            {
                if ( $in_string )
                {
                    $term .= $c;
                }
                elseif ( strlen($term) )
                {
                    $terms[] = $term;
                    $term = '';
                }
            }
            else
            {
                $term .= $c;
            }
        }
        if ( strlen($term) )
        {
            $terms[] = $term;
            $term = '';
        }
        if ( !empty($terms) )
        {
            $factors[] = $terms;
        }
        
        $term_re = "/^(([a-z0-9_\-]+){$field_delim}(".implode('|',array_map('preg_quote',$operators)).")?)?(.+?)$/i";
        foreach($factors as $i=>$terms)
        {
            if ( empty($terms) ) continue;
            foreach($terms as $j=>$term)
            {
                if ( empty($term) ) continue;
                preg_match($term_re, $term, $m);
                $term = trim($m[4]);
                $field = empty($m[2]) ? null : $m[2];
                $op = empty($m[3]) ? null : $m[3];
                if ( $op && !in_array($op, $operators) )
                {
                    $term .= $op;
                    $op = null;
                }
                if ( !empty($field) )
                {
                    if ( isset($aliases[$field]) ) $field = $aliases[$field];
                    if ( !isset($fields[$field]) ) $fields[$field] = 1;
                }
                $factors[$i][$j] = array('term'=>$term,'field'=>$field,'op'=>$op);
            }
        }
        return array($factors, array_keys($fields));
    }
    
    public $q = null;
    public $fields = null;
    public $factors = null;
    public $operators = null;
    public $aliases = null;
    
    public static function _( $operators=array(), $aliases=array() )
    {
        return new self( $operators, $aliases );
    }
    
    public function __construct( $operators=array(), $aliases=array() )
    {
        $this->operators = empty($operators) ? array('>=','<=','<','>','~','=') : (array)$operators;
        $this->aliases = (array)$aliases;
        $this->q = null;
    }
    
    public function __destruct( )
    {
        $this->dispose( );
    }
    
    public function dispose( )
    {
        $this->q = null;
        $this->fields = null;
        $this->factors = null;
        $this->operators = null;
        $this->aliases = null;
        return $this;
    }
    
    public function query( $query, $delims=array() )
    {
        $this->q = $query;
        $r = self::parse( $query, $this->operators, $this->aliases, $delims );
        $this->factors = $r[0];
        $this->fields = $r[1];
        return $this->factors;
    }
}
}
