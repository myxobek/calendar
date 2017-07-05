<?php

namespace models
{
    class events extends \Phalcon\Mvc\Model
    {
        ///////////////////////////////////////////////////////////////////

        public function getList( $date_from, $date_till )
        {
            $query = '
SELECT 
  *,
  (
      SELECT
        row_to_json(z)
      FROM
      (
        SELECT
          id,
          email
        FROM
          calendar.users
        WHERE
          id = e.author_id
        LIMIT
          1
      ) as z
  ) as "author",
  date_part(\'day\', age(date_till::timestamp, date_from::timestamp) )::integer + 1 as "days_between"
FROM 
  calendar.events as e
WHERE 
  ( date_from BETWEEN :date_from AND :date_till ) OR
  ( date_till BETWEEN :date_from AND :date_till )';

            $binds = [
                'date_from' => $date_from,
                'date_till' => $date_till,
            ];

            $db = $this->getDI()->get('db')->exec([
                'query' => $query,
                'binds' => $binds,
                'types' => [
                    'date_from'     => \Phalcon\Db\Column::TYPE_DATETIME,
                    'date_till'     => \Phalcon\Db\Column::TYPE_DATETIME,
                    'author_id'     => \Phalcon\Db\Column::BIND_PARAM_INT,
                ]
            ]);

            if ( !isset( $db['error'] ) )
            {
                $db = array_map(function($v)
                {
                    $v['date_from'] = date('Y-m-d H:i', strtotime( $v['date_from'] ) );
                    $v['date_till'] = date('Y-m-d H:i', strtotime( $v['date_till'] ) );
                    $v['author'] = json_decode( $v['author'], true );
                    return $v;
                }, $db);
                return $db;
            }
            return [];
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