<?php

namespace controllers
{
    use models\users;

    /**
     * AuthController
     */
    class AuthController extends \controllers\BaseController
    {
        /**
         * AuthController::ajaxLoginAction
         */
        public function ajaxLoginAction()
        {
            ///////////////////////////////////////////////////////////////////

            if ( !$this->request->isAjax() )
            {
                die('[]');
            }

            ///////////////////////////////////////////////////////////////////

            $email      = trim($this->request->getPost('email', 'email', ''));
            $password   = trim($this->request->getPost('password', 'string', ''));

            if ( empty( $email ) || empty( $password ) )
            {
                die(json_encode([
                    'error'     => 1,
                    'message'   => $this->core->i18n('auth_login_error_empty')
                ]));
            }

            $users = new users();
            if ( $users->login($email, $password) === true )
            {
                die(json_encode([
                    'ok'    => 1,
                    'id'    => $users->getId(),
                ]));
            }
            else
            {
                die(json_encode([
                    'error'     => 1
                ]));
            }
        }

        ///////////////////////////////////////////////////////////////////

        /**
         * Check auth
         */
        public function ajaxLoginCheckAction()
        {
            if ( !$this->request->isAjax() )
            {
                die('[]');
            }

            $users = new users();
            die(json_encode([
                'ok'        => 1,
                'is_auth'   => $users->isAuth(),
                'id'        => $users->getId()
            ]));
        }

        ///////////////////////////////////////////////////////////////////

        /**
         * Logout
         */
        public function logoutAction()
        {
            $this->session->destroy(true);

            $this->response->redirect(
                $this->url->get([
                    'for'   => 'homepage'
                ]),
                302
            );

            return false;
        }

        ///////////////////////////////////////////////////////////////////
    }
}
