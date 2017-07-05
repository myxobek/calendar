<?php

namespace lib
{
    /**
     * dependencyInjection
     */
    class dependencyInjection implements \Phalcon\DI\InjectionAwareInterface
    {
        ///////////////////////////////////////////////////////////////////////

        protected           $_di        = false;

        ///////////////////////////////////////////////////////////////////////

        /**
         * dependencyInjection::setDi()
         *
         * @param       \Phalcon\DiInterface        $dependencyInjector
         */
        public function setDi( \Phalcon\DiInterface $dependencyInjector )
        {
            $this->_di      = $dependencyInjector;
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * dependencyInjection::getDi()
         *
         * @return      \Phalcon\DiInterface
         */
        public function getDi()
        {
            return $this->_di;
        }

        ///////////////////////////////////////////////////////////////////////
    }
}