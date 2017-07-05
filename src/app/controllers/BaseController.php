<?php

namespace controllers
{

    use models\users;

    /**
     * BaseController
     */
    class BaseController extends \Phalcon\Mvc\Controller
    {
        ///////////////////////////////////////////////////////////////////////////

        protected $currentControllerAction = '';

        ///////////////////////////////////////////////////////////////////////////

        public function beforeExecuteRoute()
        {
            $permission = join(
                '/',
                [
                    $this->dispatcher->getControllerName(),
                    $this->dispatcher->getActionName()
                ]
            );

            if(
                !in_array(
                    $permission,
                    [
                        'page/index',
                        'page/error403',
                        'page/error404',
                        'page/errorCustom',
                        'auth/ajaxLoginCheck',
                        'auth/ajaxLogin',
                    ]
                )
            )
            {
                $users = new users();
                if( !$users->isAuth() )
                {
                    if( $this->request->isAjax() )
                    {
                        $this->response->setStatusCode(401);
                    }
                }
            }
        }

        ///////////////////////////////////////////////////////////////////////////

        /**
         * BaseController::initialize()
         */
        public function initialize()
        {
            $this
                ->assets
                ->collection('css')
                ->addCss('css/bootstrap.min.css', true)
                ->addCss('css/bootstrap-theme-extended.css', true)
            ;

            $this
                ->assets
                ->collection('js')
                ->addJs('js/jquery-1.11.3.js', true)
                ->addJs('js/bootstrap.min.js', true)
                ->addJs('js/jquery.base64.js', true)
                ->addJs('js/i18n.js', true)
                ->addJs('js/messages/' . LANG_ALIAS . '.js', true)
            ;
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * BaseController::_setVars()
         *
         * @param       array       $vars
         * @return      mixed
         */
        protected function _setVars( $vars = [] )
        {
            $_page        = $this->getDI()->get('page');

            $this->view->setVars(
                array_merge(
                    [
                        'page'                  => $_page,
                        'page_title'            => $_page->getTitle(),
                    ],
                    $vars
                )
            );
        }

        ///////////////////////////////////////////////////////////////////////
    }
}