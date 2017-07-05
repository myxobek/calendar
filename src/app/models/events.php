<?php

namespace models
{
    class events extends \Phalcon\Mvc\Model
    {
        ///////////////////////////////////////////////////////////////////

        public function getPerMonth( $month, $user_id, $is_admin )
        {

        }

        ///////////////////////////////////////////////////////////////////

        public function add( $data )
        {
            unset( $data['id'] );
            $db = $this->getDI()->get('db')->exec([
                'query' => 'INSERT INTO calendar.events(
title, date_from, date_till, description, author_id, status, color)
VALUES (:title, :date_from, :date_till, :description, :author_id, :status, :color) RETURNING id',
                'binds'  => $data,
                'types' => [
                    'title'         => \Phalcon\Db\Column::BIND_PARAM_STR,
                    'date_from'     => \Phalcon\Db\Column::TYPE_DATETIME,
                    'date_till'     => \Phalcon\Db\Column::TYPE_DATETIME,
                    'description'   => \Phalcon\Db\Column::TYPE_VARCHAR,
                    'status'        => \Phalcon\Db\Column::BIND_PARAM_INT,
                    'author_id'     => \Phalcon\Db\Column::BIND_PARAM_INT,
                    'color'         => \Phalcon\Db\Column::BIND_PARAM_STR
                ]
            ]);
            if ( !isset( $db['error'] ) )
            {
                $id = $db[0]['id'];
                return [
                    'id'    => $id
                ];
            }
            else
            {
                return false;
            }
        }

        ///////////////////////////////////////////////////////////////////

        public function change( $data )
        {
            $db = $this->getDI()->get('db')->exec([
                'query' => 'UPDATE calendar.events
SET 
title = :title,
date_from = :date_from, 
date_till = :date_till, 
description = :description, 
author_id = :author_id, 
status = :status, 
color = :color
WHERE id = :id',
                'binds'  => $data,
                'types' => [
                    'title'         => \Phalcon\Db\Column::BIND_PARAM_STR,
                    'date_from'     => \Phalcon\Db\Column::TYPE_DATETIME,
                    'date_till'     => \Phalcon\Db\Column::TYPE_DATETIME,
                    'description'   => \Phalcon\Db\Column::TYPE_VARCHAR,
                    'status'        => \Phalcon\Db\Column::BIND_PARAM_INT,
                    'author_id'     => \Phalcon\Db\Column::BIND_PARAM_INT,
                    'color'         => \Phalcon\Db\Column::BIND_PARAM_STR,
                    'id'            => \Phalcon\Db\Column::BIND_PARAM_INT
                ]
            ]);
            if ( !isset( $db['error'] ) )
            {
                return [
                    'id'    => $data['id']
                ];
            }
            else
            {
                return false;
            }
        }

        ///////////////////////////////////////////////////////////////////

        public function canChange( $event_id, $user_id )
        {
            p(1,1);
        }

        ///////////////////////////////////////////////////////////////////
    }
}