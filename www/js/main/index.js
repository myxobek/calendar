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
        var html = '<div class="col-xs-custom cell-' + num_rows + '">' +
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
        return new Date(date.getYear(), date.getMonth()+1, 0).getDate();
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
                        'csrftoken' : getCsrfToken(),
                        'email'     : $('#login-email').val(),
                        'password'  : $('#login-password').val()
                    },
                    'timeout'   : 60000,
                    'url'       : '/ajax/auth/login',
                    'success'   : function (data, textStatus, jqXHR)
                    {
                        console.log( data );
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
        SPA.Modals.get('login', i18n('login_modal_title'), modal_body, modal_footer).modal('show');
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
        SPA.Modals.get('errors', i18n('error_modal_title'), text).modal('show');
    },
    'hide': function()
    {

    },
};

SPA.Modals = (function()
{
    var _ids = [];

    var self = {};
    self.get = function( id, title, body, footer )
    {
        title   = title || '';
        body    = body || '';
        footer  = footer || '<div class="row">' +
            '<div class="col-md-12 text-right">' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">' + i18n('modal_close') + '</button>' +
            '</div>' +
        '</div>';

        if ( _ids.indexOf( id ) > -1 )
        {
            var $modal = $('#' + id);
            $modal.find('.modal-title').first().html( title );
            $modal.find('.modal-body').first().html( body );
            $modal.find('.modal-footer').first().html( footer );
            return $modal;
        }

        _ids.push( id );

        return $('<div class="modal" tabindex="-1" role="dialog" id="' + id + '">' +
            '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        '<h4 class="modal-title">' + title +'</h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        body +
                    '</div>' +
                    '<div class="modal-footer">' +
                        footer +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>');
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
