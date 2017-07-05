<?php

namespace controllers
{
    /**
     * MainController
     */
    class MainController extends \controllers\BaseController
    {

        ///////////////////////////////////////////////////////////////////////////

        /**
         * MainController::indexAction()
         */
        public function indexAction()
        {
            $this
                ->assets
                ->collection('css')
                ->addCss('css/jquery-ui.css', true)
                ->addCss('css/jquery-ui-timepicker-addon.min.css', true)
                ->addCss('css/main/index.css', true)
            ;

            $this
                ->assets
                ->collection('js')
                ->addJs('js/jquery-ui.js', true)
                ->addJs('js/jquery-ui-timepicker-addon.min.js', true)
                ->addJs('js/main/index.js', true)
            ;

            // set title
            $this->page->setTitle($this->core->i18n('title_main_index'), true);

            // set vars
            $this->_setVars();
        }

        ///////////////////////////////////////////////////////////////////////////
    }
}
