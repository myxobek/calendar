<?php

namespace lib
{
    /**
     * config Class
     */
    class config
    {
        ///////////////////////////////////////////////////////////////////////

        protected           $config                 = [];

        ///////////////////////////////////////////////////////////////////////

        /**
         * config::__construct()
         *
         */
        public function __construct()
        {
            $this->config   = require( ROOT.'config/global.php' );
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * config::get()
         *
         * @param           string          $conf_string
         * @param           string|bool     $default
         * @return          string
         */
        public function get( $conf_string, $default = false )
        {
            if( !empty($this->config) )
            {
                return $this->_getValueByKey( $this->config, $conf_string );
            }

            return $default;
        }

        /**
         * config::_getValueByKey()
         *
         * @param $array
         * @param $key
         *
         * @return string
         */
        private function _getValueByKey( $array, $key )
        {
            $parts = explode('/', $key );

            if ( count( $parts ) == 1 )
            {
                return ( array_key_exists( $key, $array ) ? $array[ $key ] : 'Not found in config' );
            }
            else
            {
                if ( array_key_exists( $parts[0], $array ) )
                {
                    $array_key = $parts[0];
                    unset( $parts[0] );

                    return $this->_getValueByKey( $array[ $array_key ], implode( '/', $parts ) );
                }
                else
                {
                    return 'Not found in config';
                }
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////

}