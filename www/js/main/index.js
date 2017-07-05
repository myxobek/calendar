var SPA =
{

};

SPA.Calendar =
{
    cur_year    : null,
    cur_month   : null,
    cur_day     : null,
    init: function()
    {
        var self = SPA.Calendar;
        $('#panel [data-type="login"]').hide();
        $('#panel [data-type="nav"]').show();
        self.updateDateVars( new Date() );
        self.fillCellsWithDates( new Date( self.cur_year, self.cur_month, self.cur_day ) );

        $('#prev-month').on(
            'click',
            function()
            {
                var days_in_this_month  = SPA.DateHelper.getDaysInMonth( new Date( self.cur_year, self.cur_month, 1 ) );
                var prev_date           = SPA.DateHelper.getDateInNextDays( new Date( self.cur_year, self.cur_month, self.cur_day ), -days_in_this_month );
                self.fillCellsWithDates( prev_date );
                self.updateDateVars( prev_date );
            }
        );

        $('#next-month').on(
            'click',
            function()
            {
                var days_in_this_month  = SPA.DateHelper.getDaysInMonth( new Date( self.cur_year, self.cur_month, 1 ) );
                var next_date           = SPA.DateHelper.getDateInNextDays( new Date( self.cur_year, self.cur_month, self.cur_day ), days_in_this_month );
                self.fillCellsWithDates( next_date );
                self.updateDateVars( next_date );
            }
        );

        $('#reset-month').on(
            'click',
            function()
            {
                self.updateDateVars( new Date() );
                self.fillCellsWithDates( new Date( self.cur_year, self.cur_month, self.cur_day ) );
            }
        );

        $('#calendar').on(
            'click',
            '.cell',
            function()
            {
                self._showModal( i18n('event_add_title'), {} );
            }
        );
    },
    '_showModal': function( title, data )
    {
        var modal_body = '<input type="hidden" id="event-id" value="">' +
        '<div>' +
            '<div class="form-group">' +
                '<input type="text" class="form-control" id="event-title" placeholder="' + i18n('event_modal_title') + '"/>' +
            '</div>' +
            '<div class="form-group col-md-6">' +
                '<input type="text" class="form-control" id="event-date_from" value="' + SPA.DateHelper.formatDate(new Date()) + '"/>' +
            '</div>' +
            '<div class="form-group col-md-6">' +
                '<input type="text" class="form-control" id="event-date_till" value="' + SPA.DateHelper.formatDate(new Date()) + '"/>' +
            '</div>' +
            '<div class="form-group">' +
                '<textarea class="form-control" id="event-description"></textarea>' +
            '</div>' +
            '<div class="form-group">' +
                '<select class="form-control" id="event-status">' +
                    '<option value="1">To Do</option>' +
                    '<option value="2">In Progress</option>' +
                    '<option value="3">Done</option>' +
                '</select>' +
            '</div>' +
            '<div class="form-group">' +
                '<input type="color" id="event-color" value="#ff0000">' +
            '</div>'
        '</div>';
        var modal_footer = '<div class="row">' +
            '<div class="col-xs-6 text-left">' +
                '<button type="button" class="btn btn-cancel" data-dismiss="modal" aria-label="Close">' + i18n('event_modal_cancel') + '</button>' +
            '</div>' +
            '<div class="col-xs-6 text-right">' +
                '<button type="button" class="btn btn-primary" id="event-save">' + i18n('event_modal_save') + '</button>' +
            '</div>' +
        '</div>';
        SPA.Modals.get(
            'event',
            {
                'title' : title,
                'body'  : modal_body,
                'footer': modal_footer
            },
            function( $modal )
            {
                $.datepicker.setDefaults(
                    $.extend(
                        {
                            dateFormat : 'yy-mm-dd'
                        },
                        $.datepicker.regional['ru']
                    )
                );
                $.timepicker.setDefaults(
                    $.extend(
                        {
                            timeFormat : 'HH:mm'
                        },
                        $.timepicker.regional['ru']
                    )
                );

                $('#event-date_from, #event-date_till').datetimepicker({
                    dateFormat : 'yy-mm-dd',
                    timeFormat : 'HH:mm'
                }).trigger('change');

                $('#event-save').on(
                    'click',
                    function()
                    {
                        $.ajax({
                            'dataType'  : 'json',
                            'method'    : 'post',
                            'data'      : {
                                'id'            : $('#event-id').val(),
                                'title'         : $('#event-title').val(),
                                'date_from'     : $('#event-date_from').val(),
                                'date_till'     : $('#event-date_till').val(),
                                'description'   : $('#event-description').val(),
                                'status'        : $('#event-status').val(),
                                'color'         : $('#event-color').val()
                            },
                            'timeout'   : 60000,
                            'url'       : '/ajax/events/upsert',
                            'success'   : function (data, textStatus, jqXHR)
                            {
                                console.log( data );
                            },
                            'error'     : function (jqXHR, textStatus, errorThrown)
                            {
                                SPA.Error.show( i18n('main_index_event_error') );
                            },
                        });
                    }
                );
            }
        ).modal('show');
    },
    updateDateVars: function( date )
    {
        var self = SPA.Calendar;
        self.cur_day = date.getDate();
        self.cur_month = date.getMonth();
        self.cur_year = date.getFullYear();
    },
    fillCellsWithDates: function( date )
    {
        var self = SPA.Calendar;
        $('#calendar-bg').empty();
        $('#calendar').empty();
        var cells           = [];
        var i, n;
        var first_month_date    = SPA.DateHelper.getFirstDateOfMonth(date);
        var first_month_day     = ( first_month_date.getDay()+6 ) % 7;
        for( i = first_month_day; i > 0; --i )
            cells.push(-i);
        var days_in_month = SPA.DateHelper.getDaysInMonth(date);
        for( i = 0; i < days_in_month; ++i )
            cells.push(i);
        while( cells.length % 7 > 0 )
            cells.push( days_in_month++ );
        for( i = 0, n = cells.length; i < n; ++i )
        {
            var new_date = SPA.DateHelper.getDateInNextDays( first_month_date, cells[i] );
            var date_day = new_date.getDate();
            $('#calendar-bg').append( self._renderCellBg(
                date_day + ( +date_day === 1 ? ' ' + i18n('months', new_date.getMonth()) : '' ),
                parseInt(cells.length / 7) )
            );
            $('#calendar').append( self._renderCell([], parseInt(cells.length / 7)) );
        }
    },
    _renderCellBg: function( date, num_rows )
    {
        return '<div class="col-xs-custom cell cell-' + num_rows + '">' +
            '<span class="cell-row cell-date">' + date + '</span>' +
        '</div>';
    },
    _renderCell: function( data, num_rows )
    {
        var html = '<div class="col-xs-custom cell cell-' + num_rows + '">' +
            '<span class="cell-row cell-date">&nbsp;</span>';
        data.forEach(function( item )
        {
            html += '<span class="cell-row cell-event">' + item['title'] + '</span>';
        });

        html += '</div>';
        return html;
    }
};

SPA.DateHelper =
{
    getFirstDateOfMonth: function( date )
    {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    getDateInNextDays: function( date, days )
    {
        var new_date = new Date( date.getTime() );
        new_date.setDate( date.getDate() + days );
        return new_date;
    },
    getDaysInMonth: function( date )
    {
        return new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    },
    'formatDate': function( date )
    {
        var self = SPA.DateHelper;
        return date.getFullYear() + '-' +
            self._pad( date.getMonth() ) + '-' +
            self._pad( date.getDate() ) + ' ' +
            self._pad( date.getHours() ) + ':' +
            self._pad( date.getMinutes() );
    },
    '_pad': function( string, length, pad )
    {
        string = string.toString();
        length = length || 2;
        pad = pad || '0';

        var res = '';
        if ( string.length < length ) {
            for( var i = 0, n = length-string.length; i < n; ++i )
                res += pad;
        }
        return res + string;
    }
};

SPA.Login =
{
    init: function()
    {
        $('#login-show').on(
            'click',
            function()
            {
                SPA.Login.show();
            }
        );

        $('body').on(
            'click',
            '#login-submit',
            function()
            {
                $.ajax({
                    'dataType'  : 'json',
                    'method'    : 'post',
                    'data'      : {
                        'email'     : $('#login-email').val(),
                        'password'  : $('#login-password').val()
                    },
                    'timeout'   : 60000,
                    'url'       : '/ajax/auth/login',
                    'success'   : function (data, textStatus, jqXHR)
                    {
                        SPA.Login.hide();
                        SPA.Calendar.init();
                        SPA.Loader.hide();
                    },
                    'error'     : function (jqXHR, textStatus, errorThrown)
                    {
                        SPA.Error.show( i18n('main_index_login_not_found') );
                    },
                });
            }
        );
    },
    isAuth: function( onAuth, onLogin, onError )
    {
        $.ajax({
            'dataType'  : 'json',
            'method'    : 'post',
            'data'      : {},
            'timeout'   : 60000,
            'url'       : '/ajax/auth/login/check',
            'success'   : function (data, textStatus, jqXHR)
            {
                if ( data.hasOwnProperty('ok') )
                {
                    if ( data.hasOwnProperty('is_auth') && data['is_auth'] )
                    {
                        onAuth();
                    }
                    else
                    {
                        onLogin();
                    }
                }
                else
                {
                    onError( data['error'] || i18n('main_index_ajax_error') );
                }
            },
            'error'     : function (jqXHR, textStatus, errorThrown)
            {
                onError( i18n('main_index_ajax_error') );
            }
        });
    },
    'show': function()
    {
        var self = SPA.Login;
        self._showModal();
    },
    'hide': function()
    {
        var self = SPA.Login;
        SPA.Modals.get('login').modal('hide');
    },
    '_showModal': function()
    {
        var modal_body = '<div>' +
            '<div class="form-group">' +
                '<input type="text" class="form-control" id="login-email" placeholder="' + i18n('login_modal_email') + '"/>' +
            '</div>' +
            '<div class="form-group">' +
                '<input type="password" class="form-control" id="login-password" placeholder="' + i18n('login_modal_password') + '"/>' +
            '</div>' +
        '</div>';
        var modal_footer = '<div class="row">' +
            '<div class="col-xs-6 text-left">' +
                '<button type="button" class="btn btn-success" id="register">' + i18n('login_modal_register') + '</button>' +
            '</div>' +
            '<div class="col-xs-6 text-right">' +
                '<button type="button" class="btn btn-success" id="login-submit">' + i18n('login_modal_login') + '</button>' +
            '</div>' +
        '</div>';
        SPA.Modals.get(
            'login',
            {
                'title' : i18n('login_modal_title'),
                'body'  : modal_body,
                'footer': modal_footer
            }).modal('show');
    }
};

SPA.Loader =
{
    'wrapper_id': 'loader-wrapper',
    'loader_id' : 'loader',
    'init'      : function()
    {

    },
    'show': function()
    {
        var self = SPA.Loader;
        $('#' + self.wrapper_id).show();
    },
    'hide': function()
    {
        var self = SPA.Loader;
        $('#' + self.wrapper_id).hide();
    }
};

SPA.Error =
{
    'show': function( text )
    {
        SPA.Modals.get(
            'errors',
            {
                'title': i18n('error_modal_title'),
                'body' : text
            }).modal('show');
    },
    'hide': function()
    {

    },
};

SPA.Modals = (function()
{
    var _ids = [];

    var self = {};
    self.get = function( id, parts, afterCreate )
    {
        parts = $.extend(
            true,
            {},
            {
                'title'     : '',
                'body'      : '',
                'footer'    : '<div class="row">' +
                    '<div class="col-md-12 text-right">' +
                        '<button type="button" class="btn btn-default" data-dismiss="modal">' + i18n('modal_close') + '</button>' +
                    '</div>' +
                '</div>'
            },
            parts
        );

        if ( typeof afterCreate !== 'function' )
        {
            afterCreate = function(){};
        }

        var $modal = null;

        if ( _ids.indexOf( id ) > -1 )
        {
            $modal = $('#' + id);
            $modal.find('.modal-title').first().html( parts['title'] );
            $modal.find('.modal-body').first().html( parts['body'] );
            $modal.find('.modal-footer').first().html( parts['footer'] );
            return $modal;
        }

        _ids.push( id );

        $modal = $('<div class="modal" tabindex="-1" role="dialog" id="' + id + '">' +
            '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        '<h4 class="modal-title">' + parts['title'] +'</h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        parts['body'] +
                    '</div>' +
                    '<div class="modal-footer">' +
                        parts['footer'] +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>');

        $modal.appendTo( $('body') );
        afterCreate( $modal );
        return $modal;
    };

    return self;
})();

$(document).ready(function()
{
    SPA.Login.init();
    SPA.Loader.show();
    SPA.Login.isAuth(
        function()
        {
            SPA.Calendar.init();
            SPA.Loader.hide();
        },
        function()
        {
            SPA.Login.show();
        },
        SPA.Error.show
    );
});

function p(data)
{
  console.log(data);
};
