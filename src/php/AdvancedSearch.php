<?php
/**
*  advanced-search
*  Transform any search box / search term query into an advanced multi-field search with custom search operators (PHP, Node/XPCOM/JS, Python)
*
*  @version 0.2.0
*  https://github.com/foo123/advanced-search
**/
if ( !class_exists('AdvancedSearch') )
{
class AdvancedSearch
{
    const VERSION = '0.2.0';
    
    public static function parse( $query, $operators, $aliases=array(), $delims=array() )
    {
        // parse advanced search
        $factors = array();
        
        $query = trim('' . $query);
        if ( !$query || !strlen($query) ) return $factors;
        
        $or_delim = isset($delims['or']) ? $delims['or'] : ',';
        $and_delim = isset($delims['and']) ? $delims['and'] : ' ';
        $or_delim_len = strlen($or_delim);
        $and_delim_len = strlen($and_delim);
        $op_len = count($operators);
        
        $l = strlen($query); $i = 0; $in_string = null;
        $terms = array(); $field = null; $op = null; $term = '';
        while ( $i < $l )
        {
            $c = $query[ $i ];
            if ( '"' === $c || "'" === $c )
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
                $i++;
                continue;
            }
            elseif ( $in_string )
            {
                $term .= $c;
                $i++;
                continue;
            }
            
            if ( null == $op )
            {
                for($j=0; $j<$op_len; $j++)
                {
                    if ( $operators[$j] === substr($query, $i, strlen($operators[$j]) ) )
                    {
                        $op = $operators[$j];
                        if ( !$field && strlen($term) )
                        {
                            $field = $term;
                            $term = '';
                        }
                        if ( $field && isset($aliases[$field]) ) $field = $aliases[$field];
                        break;
                    }
                }
                if ( $op )
                {
                    $i += strlen($op);
                    continue;
                }
            }
            
            if ( $or_delim === substr($query, $i, $or_delim_len ) )
            {
                if ( strlen($term) ) $terms[] = array('field'=>$field, 'op'=>$op, 'term'=>$term);
                if ( !empty($terms) ) $factors[] = $terms;
                $terms = array();
                $field = null; $op = null; $term = '';
                $i += $or_delim_len;
            }
            elseif ( $and_delim === substr($query, $i, $and_delim_len ) )
            {
                if ( strlen($term) ) $terms[] = array('field'=>$field, 'op'=>$op, 'term'=>$term);
                $field = null; $op = null; $term = '';
                $i += $and_delim_len;
            }
            else
            {
                $term .= $c;
                $i++;
            }
        }
        if ( strlen($term) ) $terms[] = array('field'=>$field, 'op'=>$op, 'term'=>$term);
        if ( !empty($terms) ) $factors[] = $terms;
        return $factors;
    }
    
    public $q = null;
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
        $this->factors = null;
        $this->operators = null;
        $this->aliases = null;
        return $this;
    }
    
    public function query( $query, $delims=array() )
    {
        $this->q = $query;
        return $this->factors = self::parse( $query, $this->operators, $this->aliases, $delims );
    }
}
}
