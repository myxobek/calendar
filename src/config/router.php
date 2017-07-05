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

// homepage ///////////////////////////////////////////////////////////////////

$router
    ->add('/',
        [
            'controller'    => 'main',
            'action'        => 'index'
        ])
    ->setName( 'homepage' );

return $router;