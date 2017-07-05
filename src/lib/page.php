<?php

namespace lib
{
    /**
     * page Class
     */
    class page extends \lib\dependencyInjection
    {
        ///////////////////////////////////////////////////////////////////////////

        public      $page_title                     = '';
        public      $page_title_separator           = ' &laquo; ';

        ///////////////////////////////////////////////////////////////////////////

        /**
         * page::getTitle()
         *
         * @return    string
         */
        public function getTitle()
        {
            return $this->page_title;
        }

        ///////////////////////////////////////////////////////////////////////////

        /**
         * page::setTitle()
         *
         * @param       string      $title
         * @param       bool        $append_tail
         * 
         * @return      bool
         */
        public function setTitle( $title, $append_tail = false )
        {
            $system_title = $this->getDi()->get('config')->get('global/title/' . LANG_ALIAS);
            if( strlen($title)>0 )
            {
                if( $append_tail )
                {
                    $this->page_title = trim($title).' | '. $system_title;
                }
                else
                {
                    $this->page_title = trim($title);
                }
            }
            else
            {
                $this->page_title = $system_title;
            }

            return true;
        }

        ///////////////////////////////////////////////////////////////////////////
    }
}