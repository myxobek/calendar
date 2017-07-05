<?php

namespace lib
{
    /**
     * core
     */
    class core extends \lib\dependencyInjection
    {
        ///////////////////////////////////////////////////////////////////////

        private      $i18n_obj               = false;
        private      $url_obj                = false;
        private      $config_obj             = false;

        ///////////////////////////////////////////////////////////////////////

        /**
         * core::__construct()
         */
        public function __construct()
        {
            $this->i18n_obj     = \Phalcon\Di::getDefault()->get('i18n');
            $this->config_obj   = \Phalcon\Di::getDefault()->get('config');
            $this->url_obj      = \Phalcon\Di::getDefault()->get('url');
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * core::i18n()
         *
         * @param           string          $i18n_rule
         * @param           array           $params
         * @return          string
         */
        public function i18n( $i18n_rule, $params = [] )
        {
            return $this->i18n_obj->_( $i18n_rule, $params );
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * core::route()
         *
         * @param           array           $route
         * @return          string
         */
        public function route( $route  )
        {
            return $this->url_obj->get( $route );
        }

        ///////////////////////////////////////////////////////////////////////
    }
}