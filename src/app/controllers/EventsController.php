<?php

namespace controllers
{

    use models\event;
    use models\users;
    use models\events;

    /**
     * EventsController
     */
    class EventsController extends \controllers\BaseController
    {
        /**
         * EventsController::ajaxGet
         */
        public function ajaxGetAction()
        {
            ///////////////////////////////////////////////////////////////////

            if ( !$this->request->isAjax() )
            {
                die('[]');
            }

            ///////////////////////////////////////////////////////////////////

            $date_from = trim($this->request->getPost('date_from', 'ext/date', ''));
            $date_till = trim($this->request->getPost('date_till', 'ext/date', ''));

            $events = new events();
            $list = $events->getList( $date_from, $date_till );
            die(json_encode($list));
        }

        ///////////////////////////////////////////////////////////////////

        /**
         * EventsController::ajaxAdd
         */
        public function ajaxUpsertAction()
        {
            ///////////////////////////////////////////////////////////////////

            if ( !$this->request->isAjax() )
            {
                die('[]');
            }

            ///////////////////////////////////////////////////////////////////

            $id             = trim( $this->request->getPost('id', 'int', '') );
            $title          = trim($this->request->getPost('title', 'string', null));
            $date_from      = trim($this->request->getPost('date_from', 'ext/date', null));
            $date_till      = trim($this->request->getPost('date_till', 'ext/date', null));
            $description    = trim($this->request->getPost('description', 'string', null));
            $status         = trim($this->request->getPost('status', 'int', null));
            $color          = trim($this->request->getPost('color', 'ext/color', null));

            if ( strlen( $title ) === 0 ||
                empty( $date_from ) || empty( $date_till ) ||
                strtotime( $date_from ) > strtotime( $date_till ) ||
                empty( $status ) ||
                empty( $color )
            )
            {
                die(json_encode([
                    'error'     => 1,
                    'message'   => $this->core->i18n('events_upsert_error_empty')
                ]));
            }

            $events = new events();
            $users = new users();
            $data = [
                'id'            => $id,
                'title'         => $title,
                'date_from'     => $date_from,
                'date_till'     => $date_till,
                'description'   => $description,
                'status'        => $status,
                'color'         => $color,
                'author_id'     => $users->getId()
            ];

            if ( empty( $data['id'] ) )
            {
                $result = $events->add($data);
            }
            else
            {
                if ( !$users->isAdmin() )
                {
                    $can_change = $events->canChange( $id, $users->getId() );
                    p($can_change,1);
                }
                $result = $events->change($data);
            }

            if ( $result !== false )
            {
                die(json_encode([
                    'ok'    => 1,
                    'id'    => $result['id'],
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
    }
}
