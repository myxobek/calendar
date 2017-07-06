<?php

$router = new \Phalcon\Mvc\Router( false );

$router->setDefaults(
    [
        'controller'    => 'page',
        'action'        => 'index'
    ]);

$router->notFound(
    [
        'controller'    => 'page',
        'action'        => 'error404'
    ]);

$router->removeExtraSlashes(true);

$router->setUriSource(\Phalcon\Mvc\Router::URI_SOURCE_GET_URL);

// auth ///////////////////////////////////////////////////////////////////////

$router
    ->add('/ajax/auth/login/check',
        [
            'controller'    => 'auth',
            'action'        => 'ajaxLoginCheck'
        ])
    ->via(['POST']);

$router
    ->add('/ajax/auth/login',
        [
            'controller'    => 'auth',
            'action'        => 'ajaxLogin'
        ])
    ->via( [ 'POST' ] )
    ->setName('auth_login');

$router
    ->add('/auth/logout',
        [
            'controller'    => 'auth',
            'action'        => 'logout'
        ])
    ->via(['GET']);

// events /////////////////////////////////////////////////////////////////////

$router
    ->add('/ajax/events/get',
        [
            'controller'    => 'events',
            'action'        => 'ajaxGet'
        ])
    ->via(['POST']);

$router
    ->add('/ajax/events/upsert',
        [
            'controller'    => 'events',
            'action'        => 'ajaxUpsert'
        ])
    ->via(['POST']);

$router
    ->add('/ajax/events/delete',
        [
            'controller'    => 'events',
            'action'        => 'ajaxDelete'
        ])
    ->via(['POST']);

// registration ///////////////////////////////////////////////////////////////

$router
    ->add('/ajax/registration/invite',
        [
            'controller'    => 'registration',
            'action'        => 'ajaxInvite'
        ])
    ->via(['POST']);

$router
    ->add('/ajax/registration',
        [
            'controller'    => 'registration',
            'action'        => 'ajaxIndex'
        ])
    ->via(['POST']);

// homepage ///////////////////////////////////////////////////////////////////

$router
    ->add('/',
        [
            'controller'    => 'main',
            'action'        => 'index'
        ])
    ->setName( 'homepage' );

return $router;