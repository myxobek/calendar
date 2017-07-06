<?php

namespace models
{
    class users extends \Phalcon\Mvc\Model
    {
        /**
         * @param   string  $email
         * @param   string  $password
         *
         * @return  boolean
         */
        public function login($email, $password)
        {
            if ( strlen($email) >= 1 && strlen($password) >= 1 )
            {
                $password = $this->_hashPassword($password);
                $db = $this->getDI()->get('db')->exec([
                    'query' => 'SELECT id, email, options->\'is_admin\' as "is_admin" 
FROM calendar.users 
WHERE email=:email AND password=crypt(:password, password)',
                    'binds'  => [
                        'email'     => $email,
                        'password'  => $password
                    ],
                    'types' => [
                        'email'     => \Phalcon\Db\Column::BIND_PARAM_STR,
                        'password'  => \Phalcon\Db\Column::BIND_PARAM_STR
                    ]
                ]);

                if ( !isset($db['error']) && !empty( $db ) )
                {
                    $user = $db[0];
                    $this->setVars( $user );
                    $this->getDi()->get('session')->set('is_auth', 1);
                    return true;
                }
            }

            return false;
        }

        ///////////////////////////////////////////////////////////////////

        private function _hashPassword( $password )
        {
            $salt1 = 'qnFIF6FtYfjggwXnQx0QQlY5ycJdvhxsWaIU5XhNvQMwDAkO2JFfTFqkN3OAqNrKvk8seFUs0iEgcXsuXXZAO3bXz5zQ0zC4bARnwSFNkZeMG1h7wy79X0eKjCTjVsAY';
            $salt2 = '47dhdQJTr9eEKCgS1r7D72XTvkK9Lv92vzVbProoY4pGS9j7EpX6feT2OSyZkfaulChrlFOFsfkKGS76vwKIOGdHPQEKQHc49tp7G7Wx55zH9aYpNmesGADDbBz2rZFb';

            return hash('sha256', $salt1 . $password . $salt2);
        }

        ///////////////////////////////////////////////////////////////////////

        public function getId()
        {
            if( $this->getDi()->get('session')->has('id') )
            {
                return $this->getDi()->get('session')->get('id');
            }

            return 0;
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * user::isAuth
         *
         * @return          bool
         */
        public function isAuth()
        {
            if( $this->getDi()->get('session')->has('is_auth') && $this->getDi()->get('session')->get('is_auth') )
            {
                return true;
            }

            return false;
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * @return  mixed
         */
        public function isAdmin()
        {
            return $this->getDi()->get('session')->get('is_admin', 0);
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * user::getSessionId
         *
         * @return          integer
         */
        public function getSessionId()
        {
            return $this->getDi()->get('session')->getId();
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * user::setVars
         *
         * @param           array       $data
         * @return          bool
         */
        public function setVars( $data )
        {
            if( empty($data) || !is_array($data) )
            {
                return false;
            }

            foreach( $data as $key => $value )
            {
                $this->getDi()->get('session')->set( $key, $value );
            }

            return true;
        }

        ///////////////////////////////////////////////////////////////////

        public function addRegCode( $email, $reg_code )
        {
            $db = $this->getDI()->get('db')->exec([
                'query' => 'INSERT INTO calendar.users(
email, password, options)
VALUES (:email, :password, :options) RETURNING id',
                'binds'  => [
                    'email'     => $email,
                    'password'  => 'some weird passwd',
                    'options'   => json_encode([
                        'is_admin'  => 0,
                        'reg_code'  => $reg_code
                    ])
                ],
                'types' => [
                    'email'     => \Phalcon\Db\Column::BIND_PARAM_STR,
                    'password'  => \Phalcon\Db\Column::BIND_PARAM_STR,
                    'options'   => \Phalcon\Db\Column::BIND_PARAM_STR
                ]
            ]);

            return ( !isset($db['error']) && !empty( $db ) );
        }

        ///////////////////////////////////////////////////////////////////

        public function activateRegCode( $reg_code, $password )
        {
            $password = $this->_hashPassword($password);
            $db = $this->getDI()->get('db')->exec([
                'query' => 'UPDATE calendar.users
SET
password = crypt(:password, gen_salt(\'bf\',10)),
options  = :options
WHERE
(options->>\'reg_code\')::text = :reg_code
RETURNING id',
                'binds'  => [
                    'password'  => $password,
                    'options'   => json_encode([
                        'is_admin'  => 0
                    ]),
                    'reg_code'  => $reg_code
                ],
                'types' => [
                    'password'  => \Phalcon\Db\Column::BIND_PARAM_STR,
                    'options'   => \Phalcon\Db\Column::BIND_PARAM_STR,
                    'reg_code'  => \Phalcon\Db\Column::BIND_PARAM_STR
                ]
            ]);

            return ( !isset($db['error']) && !empty( $db ) );
        }

        ///////////////////////////////////////////////////////////////////
    }
}