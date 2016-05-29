<?php
require(dirname(dirname(__FILE__)).'/src/php/AdvancedSearch.php');

function echo_( $s='' )
{
    if ( is_array($s) || is_object($s) ) print_r($s);
    else echo $s;
    echo PHP_EOL;
}

echo_("AdvancedSearch.VERSION = " . AdvancedSearch::VERSION);

echo_(array('term',AdvancedSearch::_()->query('term')));
echo_(array('~"term term2"',AdvancedSearch::_()->query('~"term term2"')));
echo_(array('field=term',AdvancedSearch::_()->query('field=term')));
echo_(array('field>=term field<=term2',AdvancedSearch::_()->query('field>=term field<=term2')));
echo_(array('field>=term field<=term2, field2~term3',AdvancedSearch::_()->query('field>=term field<=term2, field2~term3')));
echo_(array('field>="term term2" field<=term2, field2~"field2~term3", "field2~term3"',AdvancedSearch::_()->query('field>="term term2" field<=term2, field2~"field2~term3", "field2~term3"')));
