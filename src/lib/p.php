<?php

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

namespace
{
    /**
     * Prints human-readable information about a variable
     */
    if (function_exists('p') === false)
    {
        function p($var, $is_die = false)
        {
            echo('<pre>');
            print_r($var);
            echo('</pre>');

            if ($is_die)
            {
                die();
            }
        }
    }
}