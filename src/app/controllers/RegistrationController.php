<?php

namespace controllers
{

    use models\users;

    /**
     * Registration
     */
    class RegistrationController extends \controllers\BaseController
    {
        const FROM_EMAIL = 'robot@calendar.example.org';

        ///////////////////////////////////////////////////////////////////

        public function ajaxIndexAction()
        {
            if ( !$this->request->isAjax() )
            {
                die('[]');
            }

            $reg_code = $this->request->getPost('reg_code', 'string', '');
            $password = $this->request->getPost('password', 'string', '');

            if ( strlen( $reg_code ) === 0 || strlen( $password ) === 0 )
            {
                die(json_encode([
                    'error'     => 1,
                    'message'   => $this->core->i18n('registration_index_error_empty')
                ]));
            }

            $users = new users();
            if ( $users->activateRegCode( $reg_code, $password ) )
            {
                die(json_encode([
                    'ok'    => 1

                ]));
            }
            else
            {
                die(json_encode([
                    'error'     => 1,
                    'message'   => $this->core->i18n('registration_index_error_code')
                ]));
            }
        }

        ///////////////////////////////////////////////////////////////////

        public function ajaxInviteAction()
        {
            if ( !$this->request->isAjax() )
            {
                die('[]');
            }

            $users = new users();
            if ( !$users->isAdmin() )
            {
                die(json_encode([
                    'error'     => 1,
                    'message'   => $this->core->i18n('registration_invite_error_not_admin')
                ]));
            }

            $email = $this->request->getPost('email', 'email', '');
            if ( strlen( $email ) === 0 )
            {
                die(json_encode([
                    'error' => 1
                ]));
            }

            $reg_code = $this->_createRegCode();
            if ( !$users->addRegCode( $email, $reg_code ) )
            {
                die(json_encode([
                    'error' => 1,
                ]));
            }
            die(json_encode([
                'ok'    => 1,
            ]));
            $this->_sendInvitationalEmail( $email, $reg_code );

            die(json_encode([
                'ok'    => 1,
            ]));
        }

        ///////////////////////////////////////////////////////////////////

        public function _createRegCode()
        {
            return md5(md5(md5(openssl_random_pseudo_bytes( 64 ))));
        }

        ///////////////////////////////////////////////////////////////////

        public function _sendInvitationalEmail( $email, $reg_code )
        {
            $mail_subject = 'Invitation';

            $mail_body = 'Here is your registration code: <b>' . $reg_code . '</b><br/>'.
                'Follow <a href="' . $this->url->get(['for'  => 'auth_login']) . '">to register</a>';

            $mail_headers =
                'From: '.self::FROM_EMAIL."\n".
                'Reply-To: '.self::FROM_EMAIL."\n".
                'Return-Path: '.self::FROM_EMAIL."\n".
                'MIME-Version: 1.0'."\n".
                'Content-type: text/html; charset=UTF-8'."\n".
                'Content-Transfer-Encoding: 8bit'."\n".
                'X-Mailer: PHP/'.phpversion();

            return mail(
                $email,
                $mail_subject,
                $mail_body,
                $mail_headers,
                '-f '.self::FROM_EMAIL
            );
        }

        ///////////////////////////////////////////////////////////////////
    }
}
