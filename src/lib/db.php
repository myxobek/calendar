<?php

namespace lib
{

    use Phalcon\Db\Column;

    /**
     * db
     */
    class db extends \lib\dependencyInjection
    {
        /**
         * db::getConnection()
         *
         * @param   array   $config
         * @param   bool    [$is_debug = false]
         *
         * @return    \Phalcon\Db\Adapter\Pdo\Postgresql
         */
        public function getConnection( $config = [], $is_debug = false )
        {
            $default_config = $this->getDi()->get('config')->get('global/database');

            if ( $is_debug )
            {
                p([
                    'host'      => ( $this->_arrayKeySuits('host', $config )     ? $config['host']       : $default_config['host'] ),
                    'port'      => ( $this->_arrayKeySuits('port', $config )     ? $config['port']       : $default_config['port'] ),
                    'username'  => ( $this->_arrayKeySuits('username', $config ) ? $config['username']   : $default_config['username'] ),
                    'password'  => ( $this->_arrayKeySuits('password', $config ) ? $config['password']   : $default_config['password'] ),
                    'dbname'    => ( $this->_arrayKeySuits('database', $config ) ? $config['database']   : $default_config['database'] ),
                ]);
            }

            $connection = new \Phalcon\Db\Adapter\Pdo\Postgresql(
                [
                    'host'      => ( $this->_arrayKeySuits('host', $config )     ? $config['host']       : $default_config['host'] ),
                    'port'      => ( $this->_arrayKeySuits('port', $config )     ? $config['port']       : $default_config['port'] ),
                    'username'  => ( $this->_arrayKeySuits('username', $config ) ? $config['username']   : $default_config['username'] ),
                    'password'  => ( $this->_arrayKeySuits('password', $config ) ? $config['password']   : $default_config['password'] ),
                    'dbname'    => ( $this->_arrayKeySuits('database', $config ) ? $config['database']   : $default_config['database'] ),
                ]
            );

            return $connection;
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * @param   string  $key
         * @param   array   $array
         *
         * @return  bool
         */
        private function _arrayKeySuits( $key, $array )
        {
            return ( ( array_key_exists($key, $array ) ) && ( strlen( $array[$key] ) > 0 ) );
        }

        ///////////////////////////////////////////////////////////////////////

        /**
         * db::exec()
         *
         * @param     string    $data
         *
         * @return    array|bool
         */
        public function exec( $data, $is_debug = false )
        {
            $query  = isset( $data['query'] )   ?   $data['query']  : '';
            $binds  = isset( $data['binds'] )   ?   $data['binds']  : [];
            $types  = isset( $data['types'] )   ?   $data['types']  : [];
            $config = isset( $data['config'] )  ?   $data['config'] : [];

            ///////////////////////////////////////////////////////////////////////

            $connection = $this->getConnection( $config, $is_debug );

            $stmt = $connection->prepare( $query );

            $stmt->setFetchMode(\Phalcon\Db::FETCH_ASSOC);

            $result = $connection->executePrepared(
                $stmt,
                $binds,
                $types
            );

            ///////////////////////////////////////////////////////////////////////

            return $stmt->fetchAll();
        }
    }
}
