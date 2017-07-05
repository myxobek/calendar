<?php

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

define( 'START_TIME',           microtime(true) );
define( 'ROOT',            realpath(__DIR__. '/../src' ).'/' );

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

defined( 'LANG_ALIAS' )         || define( 'LANG_ALIAS',            ( getenv('LANG_ALIAS')                                  ? getenv('LANG_ALIAS')          : 'en' ) );

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

try
{
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if( !extension_loaded('phalcon') )
    {
        throw new \Exception('Error #001');
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error_reporting(-1);
    ini_set('display_errors', 1);

    // P-functions
    require_once( ROOT.'lib/p.php' );

    // mega debug!
    function stopatanyerror_error_handler($errno, $errstr, $errfile, $errline)
    {
        switch ($errno)
        {
            case E_USER_WARNING:
                $errortext = 'WARNING';
                break;
            case E_USER_NOTICE:
                $errortext = 'NOTICE';
                break;
            default:
                $errortext = 'ERROR';
                break;
        }

        die( '<div>['.$errortext.'] '.$errstr.' in <code>'.$errfile.':'.$errline.'</code></div>' );
    }

    set_error_handler('stopatanyerror_error_handler');

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $loader = new \Phalcon\Loader();

    $loader->registerDirs(
        [
            ROOT.'app/controllers/',
            ROOT.'app/models/',
            ROOT.'lib/',
        ]
    )->register();

    $loader->registerNamespaces(
        [
            'controllers'    => ROOT.'app/controllers/',
            'models'         => ROOT.'app/models/',
            'lib'            => ROOT.'lib/',
        ]
    )->register();

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $di = new \Phalcon\DI();

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // DI: Phalcon Core

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // models
    $di->set('modelsManager', function() {
        return new \Phalcon\Mvc\Model\Manager();
    }, true );

    // request
    $di->set( 'request', function()
    {
        return new \Phalcon\Http\Request();
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // response
    $di->set( 'response', function()
    {
        return new \Phalcon\Http\Response();
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // router
    $di->set( 'router', function()
    {
        return require( ROOT.'config/router.php' );
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // assets
    $di->set( 'assets', function()
    {
        return new \Phalcon\Assets\Manager();
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // escaper
    $di->set( 'escaper', function()
    {
        return new \Phalcon\Escaper();
    } );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // dispatcher
    $di->set( 'dispatcher', function()
    {
        // Create/Get an EventManager
        $eventsManager = new \Phalcon\Events\Manager();

        // Attach a listener
        $eventsManager->attach( 'dispatch', function( $event, $dispatcher, $exception )
        {
            // The controller exists but the action not
            if( $event->getType() == 'beforeNotFoundAction' )
            {
                $dispatcher->forward(
                    [
                        'controller'    => 'page',
                        'action'        => 'error404'
                    ]
                );

                return false;
            }

            // Alternative way, controller or action doesn't exist
            if( $event->getType() == 'beforeException')
            {
                switch ($exception->getCode())
                {
                    case \Phalcon\Dispatcher::EXCEPTION_HANDLER_NOT_FOUND:
                    case \Phalcon\Dispatcher::EXCEPTION_ACTION_NOT_FOUND:
                        $dispatcher->forward([
                            'controller'    => 'page',
                            'action'        => 'error404'
                        ]);

                        return false;
                }
            }
        });

        $dispatcher = new \Phalcon\Mvc\Dispatcher();

        $dispatcher->setDefaultNamespace( 'controllers' );

        // Bind the EventsManager to the dispatcher
        $dispatcher->setEventsManager($eventsManager);

        return $dispatcher;

    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // view
    $di->set( 'view', function()
    {
        $view = new \Phalcon\Mvc\View();

        $view->setViewsDir( ROOT.'app/views/' );

        $view->registerEngines(
            [
                '.php' => '\Phalcon\Mvc\View\Engine\Php'
            ]
        );

        return $view;
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // i18n
    $di->set( 'i18n', function()
    {
        return new \Phalcon\Translate\Adapter\NativeArray([
            'content' => require( ROOT.'app/messages/'.LANG_ALIAS.'.php' )
        ]);
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // url
    $di->set( 'url', function()
    {
        $url = new \Phalcon\Mvc\Url();
        $url->setBaseUri('/');

        return $url;
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // flash
    $di->set( 'flash', function()
    {
        return new \Phalcon\Flash\Session(
            [
                'error'     => 'alert alert-danger',
                'success'   => 'alert alert-success',
                'notice'    => 'alert alert-warning',
            ]);
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // session
    $di->set( 'session', function()
    {
        $session = new \Phalcon\Session\Adapter\Files();

        $session->start();

        return $session;
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // escaper
    $di->set( 'escaper', function()
    {
        return new \Phalcon\Escaper();
    } );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // DI: Website Core

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // filter
    $di->set( 'filter', function()
    {
        $filter = new \Phalcon\Filter();

        $filter->add(
            'ext/date',
            function ($value) {
                if ( strlen( $value ) > 0 && preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $value ) )
                {
                    return $value;
                }
                return null;
            }
        );

        $filter->add(
            'ext/color',
            function ($value) {
                if ( strlen( $value ) > 0 && preg_match('/^#([0-9a-fA-F]{3}|[0-9A-Fa-f]{6})$/', $value ) )
                {
                    return $value;
                }
                return null;
            }
        );

        return $filter;
    }, true );

    // database
    $di->set( 'db', function()
    {
        return new \lib\db();
    }, true );
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // DI: \lib

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // config
    $di->set( 'config', function()
    {
        return new \lib\config();
    }, true );

    // core
    $di->set( 'core', function()
    {
        return new \lib\core();
    }, true );

    // page
    $di->set( 'page', function()
    {
        return new \lib\page();
    }, true );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $application = new \Phalcon\Mvc\Application();
    $application->setDI($di);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $content 	= $application->handle()->getContent();

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    die(
        preg_replace(
            [ '#\s{2,}#ims', '#(\n|\r)#ims' ],
            [ ' ', '' ],
            $content
        )
    );

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}
catch( \Phalcon\Exception $e )
{
    echo( ob_get_flush() );

    die( '[Phalcon\Exception] '.$e->getMessage() );
}
catch( \PDOException $e )
{
    echo( ob_get_flush() );

    die( '[PDOException] '.$e->getMessage() );
}
catch( \Exception $e )
{
    echo( ob_get_flush() );

    die( '[Exception] '.$e->getMessage() );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

