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
    ->via( [ 'POST' ] );

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

// homepage ///////////////////////////////////////////////////////////////////

$router
    ->add('/',
        [
            'controller'    => 'main',
            'action'        => 'index'
        ])
    ->setName( 'homepage' );

return $router;