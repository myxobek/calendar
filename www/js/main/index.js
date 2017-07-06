var SPA =
{
    setUser: function( data )
    {
        SPA.User = (function(id, is_admin)
        {
            var self = {};

            self.isAdmin = function()
            {
                return !!+is_admin;
            };

            self.getId = function()
            {
                return +id;
            };

            return self;
        })( data['id'] || 0, data['is_admin'] || false );
    }
};

SPA.Calendar =
{
    cur_year        : null,
    cur_month       : null,
    cur_day         : null,
    is_btn_enabled  : true,
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
                if ( self.isBtnEnabled() )
                {
                    var days_in_this_month  = SPA.DateHelper.getDaysInMonth( new Date( self.cur_year, self.cur_month, 1 ) );
                    var prev_date           = SPA.DateHelper.getDateInNextDays( new Date( self.cur_year, self.cur_month, self.cur_day ), -days_in_this_month );
                    self.fillCellsWithDates( prev_date );
                    self.updateDateVars( prev_date );
                    SPA.Events.refreshData();
                }
            }
        );

        $('#next-month').on(
            'click',
            function()
            {
                if ( self.isBtnEnabled() )
                {
                    var days_in_this_month  = SPA.DateHelper.getDaysInMonth( new Date( self.cur_year, self.cur_month, 1 ) );
                    var next_date           = SPA.DateHelper.getDateInNextDays( new Date( self.cur_year, self.cur_month, self.cur_day ), days_in_this_month );
                    self.fillCellsWithDates( next_date );
                    self.updateDateVars( next_date );
                    SPA.Events.refreshData();
                }
            }
        );

        $('#reset-month').on(
            'click',
            function()
            {
                if ( self.isBtnEnabled() )
                {
                    self.updateDateVars( new Date() );
                    self.fillCellsWithDates( new Date( self.cur_year, self.cur_month, self.cur_day ) );
                    SPA.Events.refreshData();
                }
            }
        );
    },
    isBtnEnabled: function()
    {
        return SPA.Calendar.is_btn_enabled;
    },
    disableButtons: function()
    {
        $('#reset-month').attr('disabled', 'disabled');
        $('#prev-month').attr('disabled', 'disabled');
        $('#next-month').attr('disabled', 'disabled');
        SPA.Calendar.is_btn_enabled = false;
    },
    enableButtons: function()
    {
        $('#reset-month').attr('disabled', false);
        $('#prev-month').attr('disabled', false);
        $('#next-month').attr('disabled', false);
        SPA.Calendar.is_btn_enabled = true;
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
            $('#calendar-bg').append( self._renderCellBg(
                SPA.DateHelper.getDateInNextDays( first_month_date, cells[i] ),
                parseInt(cells.length / 7) )
            );
            $('#calendar').append( self._renderCell([], parseInt(cells.length / 7)) );
        }
    },
    _renderCellBg: function( date, num_rows )
    {
        var date_day = date.getDate();
        date_day += ( +date_day === 1 ? ' ' + i18n('months', date.getMonth()) : '' );

        return '<div class="col-xs-custom cell cell-' + num_rows + '" data-date="' + SPA.DateHelper.formatDate(date) + '">' +
            '<span class="cell-row cell-date">' + date_day + '</span>' +
        '</div>';
    },
    _renderCell: function( data, num_rows )
    {
        var html = '<div class="col-xs-custom cell cell-' + num_rows + '">' +
            '<span class="cell-row cell-date">&nbsp;</span>';
        data.forEach(function( item )
        {
            html += '<span class="cell-row cell' + (( item === false ) ? '-no' : '') + '-event" data-id="' + ( item !== false ? item['id'] : 0 ) + '" ' +
                'style="background-color: ' + ( item !== false ? item['color'] : '' ) + '; ">' +
                    ( item !== false ? item['title'] : '&nbsp;' )  +
                '</span>';
        });

        html += '</div>';
        return html;
    },
    renderEvents: function( data )
    {
        data = $.extend(true, [], data);
        var bg_cells    = $('#calendar-bg').find('.cell');
        var cells       = $('#calendar').find('.cell');
        var levels      = {};
        $('#calendar').empty();
        for( var i = 0, n = cells.length; i < n; ++i )
        {
            var cur_date    = $(bg_cells[i]).data('date');
            var events_here = data.filter(function (value) {
                return SPA.DateHelper.isDateBetween(
                    cur_date,
                    value['date_from'],
                    value['date_till']
                )
            });
            var items = [false, false, false, false, false];
            for( var j = 0, m = events_here.length; j < m; ++j )
            {
                if ( levels.hasOwnProperty( events_here[j]['id'] ) )
                {
                    items[ levels[ events_here[j]['id'] ] ] = events_here[j];
                    events_here[j]['to_remove'] = true;
                }
            }
            events_here = events_here.filter(function(value){
                return !value['to_remove'];
            });
            events_here.sort(function(a,b){
                return b['days_between']-a['days_between'];
            });
            var additional_events = [];
            for( var j = 0, m = events_here.length; j < m; ++j ) {
                var found_pos = false;
                for( var pos = 0; pos < 5; ++pos )
                {
                    if ( items[pos] === false )
                    {
                        items[pos] = events_here[j];
                        levels[events_here[j]['id']] = pos;
                        found_pos = true;
                        break;
                    }
                }
                if ( !found_pos )
                {
                    additional_events.push( events_here[j] );
                }
            }

            $('#calendar').append( SPA.Calendar._renderCell(items, parseInt(cells.length / 7)) );
        }
    },
    getFirstDate: function()
    {
        return  $('#calendar-bg').find('.cell').first().data('date');
    },
    getLastDate: function()
    {
        return $('#calendar-bg').find('.cell').last().data('date');
    }
};

SPA.Events = (function()
{
    var cache = {};
    var self = {};
    self.init = function()
    {
        $('#calendar').on(
            'click',
            '.cell',
            function()
            {
                var dates = $('#calendar-bg').children('.cell').toArray().map(function(v)
                {
                    return $(v).data('date');
                });
                var date = dates[ $('#calendar .cell').index(this) ];

                self._showModal( i18n('event_add_title'), {
                    'date_from': date,
                    'date_till': date
                } );
            }
        );

        $('#calendar').on(
            'click',
            '.cell-event',
            function(e)
            {
                e.stopPropagation();
                self._showModal(
                    i18n('event_change_title'),
                    self.getEventById( $(this).data('id') ),
                    false,
                    SPA.User.isAdmin() || ( SPA.User.getId() === +event['author_id'] )
                );
            }
        );

        self.refreshData();
    };

    self.getEventById = function( id )
    {
        var date_from = SPA.Calendar.getFirstDate();
        return cache[date_from].find(function(v)
        {
            return +v['id'] === +id;
        });
    };

    self.refreshData = function()
    {
        var date_from = SPA.Calendar.getFirstDate();
        var date_till = SPA.Calendar.getLastDate();

        if ( !cache.hasOwnProperty( date_from ) )
        {
            SPA.Loader.show();
            SPA.Calendar.disableButtons();
            $.ajax({
                'dataType'  : 'json',
                'method'    : 'post',
                'data'      : {
                    'date_from' : date_from,
                    'date_till' : date_till
                },
                'timeout'   : 60000,
                'url'       : '/ajax/events/get',
                'success'   : function (data, textStatus, jqXHR)
                {
                    cache[date_from] = data;
                    SPA.Loader.hide();
                    SPA.Calendar.enableButtons();
                    SPA.Calendar.renderEvents( cache[date_from] );
                },
                'error'     : function (jqXHR, textStatus, errorThrown)
                {
                    SPA.Error.show( i18n('main_index_event_error') );
                }
            });
        }
        else
        {
            SPA.Calendar.renderEvents( cache[date_from] );
        }
    };

    self._showModal = function( title, data, is_add, can_change )
    {
        can_change  = typeof can_change === 'undefined' ? true : can_change;
        is_add      = typeof is_add     === 'undefined' ? true : is_add;
        var modal_body, modal_footer;
        if ( can_change )
        {
            modal_body = '<input type="hidden" id="event-id" value="' + ( data['id'] || '' ) + '">' +
            '<div>' +
                '<div class="form-group">' +
                    '<label for="event-title">' + i18n('event_modal_title') + '</label>' +
                    '<input type="text" class="form-control" id="event-title" placeholder="' + i18n('event_modal_title') + '" value="' + ( data['title'] || '' ) + '"/>' +
                '</div>' +
                '<div class="form-group col-xs-6 col-no-padding-left">' +
                    '<label for="event-title">' + i18n('event_modal_date_from') + '</label>' +
                    '<input type="text" class="form-control" id="event-date_from" value="' + ( data['date_from'] || SPA.DateHelper.formatDate(new Date()) ) + '"/>' +
                '</div>' +
                '<div class="form-group col-xs-6 col-no-padding-right">' +
                    '<label for="event-title">' + i18n('event_modal_date_till') + '</label>' +
                    '<input type="text" class="form-control" id="event-date_till" value="' + ( data['date_till'] || SPA.DateHelper.formatDate(new Date()) ) + '"/>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label for="event-title">' + i18n('event_modal_description') + '</label>' +
                    '<textarea class="form-control" id="event-description">' + ( data['description'] || '' ) + '</textarea>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label for="event-title">' + i18n('event_modal_status') + '</label>' +
                    '<select class="form-control" id="event-status">' +
                        '<option value="1" ' + ( data['status'] && +data['status'] === 1 ? 'selected' : '' ) + '>' + i18n('event_status', 1) + '</option>' +
                        '<option value="2" ' + ( data['status'] && +data['status'] === 2 ? 'selected' : '' ) + '>' + i18n('event_status', 2) + '</option>' +
                        '<option value="3" ' + ( data['status'] && +data['status'] === 3 ? 'selected' : '' ) + '>' + i18n('event_status', 3) + '</option>' +
                    '</select>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label for="event-title">' + i18n('event_modal_color') + '</label>' +
                    '<input type="color" class="form-control" id="event-color" value="' + ( data['color'] || '#ff0000' ) + '">' +
                '</div>' +
            '</div>';
            modal_footer = '<div class="row">' +
                '<div class="col-xs-6 text-left">' +
                    (
                        is_add
                            ? '<button type="button" class="btn btn-cancel" data-dismiss="modal" aria-label="Close">' + i18n('event_modal_cancel') + '</button>'
                            : '<button type="button" class="btn btn-danger" id="event-delete"">' + i18n('event_modal_delete') + '</button>'
                    ) +
                '</div>' +
                '<div class="col-xs-6 text-right">' +
                    '<button type="button" class="btn btn-primary" id="event-save">' + i18n('event_modal_save') + '</button>' +
                '</div>' +
            '</div>';
        }
        else
        {
            modal_body = '<div>' +
                '<div class="form-group">' +
                    '<label>' + i18n('event_modal_title') + '</label>' +
                    '<span class="form-control">' + ( data['title'] || '' ) + '</span>' +
                '</div>' +
                '<div class="form-group col-md-6 col-no-padding-left">' +
                    '<label>' + i18n('event_modal_date_from') + '</label>' +
                    '<span class="form-control">' + ( data['date_from'] || SPA.DateHelper.formatDate(new Date()) ) + '</span>' +
                '</div>' +
                '<div class="form-group col-md-6 col-no-padding-right">' +
                    '<label>' + i18n('event_modal_date_till') + '</label>' +
                    '<span class="form-control">' + ( data['date_till'] || SPA.DateHelper.formatDate(new Date()) ) + '</span>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>' + i18n('event_modal_description') + '</label>' +
                    '<p class="form-control">' + ( data['description'] || '' ) + '</p>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>' + i18n('event_modal_status') + '</label>' +
                    '<span class="form-control">' + i18n('event_status', +data['status'] || 1 ) + '</span>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label>' + i18n('event_modal_color') + '</label>' +
                    '<input class="form-control" type="color" disabled value="' + ( data['color'] || '#ff0000' ) + '">' +
                '</div>' +
            '</div>';
            modal_footer = '';
        }
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
                        var event = {
                            'id'            : $('#event-id').val(),
                            'title'         : $('#event-title').val(),
                            'date_from'     : $('#event-date_from').val(),
                            'date_till'     : $('#event-date_till').val(),
                            'description'   : $('#event-description').val(),
                            'status'        : $('#event-status').val(),
                            'color'         : $('#event-color').val()
                        };

                        $.ajax({
                            'dataType'  : 'json',
                            'method'    : 'post',
                            'data'      : event,
                            'timeout'   : 60000,
                            'url'       : '/ajax/events/upsert',
                            'success'   : function (response, textStatus, jqXHR)
                            {
                                if ( response.hasOwnProperty('error') )
                                {
                                    SPA.Error.show(
                                        response['message'] ||
                                        i18n('main_index_event_error')
                                    );
                                }
                                else
                                {
                                    for( var date_from in cache )
                                    {
                                        if ( cache.hasOwnProperty( date_from ) )
                                        {
                                            var old_event = cache[date_from].find(function(v)
                                            {
                                                return +v['id'] === +response['id'];
                                            });
                                            $.extend(true, event, {'id': response['id']});
                                            if ( typeof old_event !== 'undefined' )
                                            {
                                                $.extend(true, old_event, event);
                                            }
                                            else
                                            {
                                                event['author_id'] = SPA.User.getId();
                                                cache[date_from].push( event );
                                            }
                                        }
                                    }
                                    self.refreshData();
                                    self._hideModal();
                                }
                            },
                            'error'     : function (jqXHR, textStatus, errorThrown)
                            {
                                SPA.Error.show( i18n('main_index_event_error') );
                            },
                        });
                    }
                );

                $('#event-delete').on(
                    'click',
                    function()
                    {
                        var id = $('#event-id').val();

                        $.ajax({
                            'dataType'  : 'json',
                            'method'    : 'post',
                            'data'      : {
                                'id'    : id
                            },
                            'timeout'   : 60000,
                            'url'       : '/ajax/events/delete',
                            'success'   : function (response, textStatus, jqXHR)
                            {
                                if ( response.hasOwnProperty('error') )
                                {
                                    SPA.Error.show(
                                        response['message'] ||
                                        i18n('main_index_event_error')
                                    );
                                }
                                else
                                {
                                    for( var date_from in cache )
                                    {
                                        if ( cache.hasOwnProperty( date_from ) )
                                        {
                                            var cache_index  = cache[date_from].findIndex(function(v)
                                            {
                                                return +v['id'] === +id;
                                            });
                                            if ( cache_index > -1 )
                                            {
                                                cache[date_from].splice(cache_index,1);
                                            }
                                        }
                                    }
                                    self.refreshData();
                                    self._hideModal();
                                }
                            },
                            'error'     : function (jqXHR, textStatus, errorThrown)
                            {
                                SPA.Error.show( i18n('main_index_event_error') );
                            },
                        });
                    }
                )
            }
        ).modal('show');
    };

    self._hideModal = function()
    {
        $('#event').modal('hide');
    };

    return self;
})();

SPA.Registration =
{
    init: function()
    {
        if ( !SPA.User.isAdmin() )
        {
            $('#registration-invite').remove();
        }
        else
        {
            $('#registration-invite').on(
                'click',
                function()
                {
                    SPA.Registration._showInviteModal();
                }
            );
        }
    },
    _showInviteModal: function()
    {
        var modal_body = '<div>' +
            '<div class="form-group">' +
                '<label for="invite-email">' + i18n('invite_modal_email') + '</label>' +
                '<input type="text" class="form-control" id="invite-email" placeholder="' + i18n('invite_modal_email') + '" value=""/>' +
            '</div>' +
        '</div>';
        var modal_footer = '<div class="row">' +
            '<div class="col-xs-12 text-right">' +
                '<button type="button" class="btn btn-primary" id="invite-send">' + i18n('invite_modal_send') + '</button>' +
            '</div>' +
        '</div>';
        SPA.Modals.get(
            'invite',
            {
                'title' : i18n('invite_modal_title'),
                'body'  : modal_body,
                'footer': modal_footer
            },
            function( $modal )
            {
                $('#invite-send').on(
                    'click',
                    function()
                    {
                        $.ajax({
                            'dataType'  : 'json',
                            'method'    : 'post',
                            'data'      : {
                                'email' : $('#invite-email').val()
                            },
                            'timeout'   : 60000,
                            'url'       : '/ajax/registration/invite',
                            'success'   : function (response, textStatus, jqXHR)
                            {
                                if ( response.hasOwnProperty('error') )
                                {
                                    SPA.Error.show(
                                        response['message'] ||
                                        i18n('main_index_event_error')
                                    );
                                }
                                else
                                {
                                    $('#invite').modal('hide');
                                    SPA.Modals.get(
                                        'invite-success',
                                        {
                                            'title': 'Success',
                                            'body' : i18n('invite_modal_success')
                                        }
                                    ).modal('show');
                                }
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
    _showModal: function()
    {
        var modal_body = '<div>' +
            '<div class="form-group">' +
                '<label for="registration-reg_code">' + i18n('registration_modal_reg_code') + '</label>' +
                '<input type="text" class="form-control" id="registration-reg_code" placeholder="' + i18n('registration_modal_reg_code') + '"/>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="registration-password">' + i18n('registration_modal_password') + '</label>' +
                '<input type="password" class="form-control" id="registration-password" placeholder="' + i18n('registration_modal_password') + '"/>' +
            '</div>' +
        '</div>';
        var modal_footer = '<div class="row">' +
            '<div class="col-xs-12 text-right">' +
                '<button type="button" class="btn btn-primary" id="registration-submit">' + i18n('registration_modal_submit') + '</button>' +
            '</div>' +
        '</div>';
        SPA.Modals.get(
            'registration',
            {
                'title' : i18n('registration_modal_title'),
                'body'  : modal_body,
                'footer': modal_footer
            },
            function( $modal )
            {
                $('#registration').on(
                    'hidden.bs.modal',
                    function()
                    {
                        SPA.Login.show();
                    }
                );

                $('#registration-submit').on(
                    'click',
                    function()
                    {
                        $.ajax({
                            'dataType'  : 'json',
                            'method'    : 'post',
                            'data'      : {
                                'reg_code'  : $('#registration-reg_code').val(),
                                'password'  : $('#registration-password').val(),
                            },
                            'timeout'   : 60000,
                            'url'       : '/ajax/registration',
                            'success'   : function (response, textStatus, jqXHR)
                            {
                                if ( response.hasOwnProperty('error') )
                                {
                                    SPA.Error.show(
                                        response['message'] ||
                                        i18n('main_index_event_error')
                                    );
                                }
                                else
                                {
                                    $('#registration').modal('hide');
                                    $modal = SPA.Modals.get(
                                        'registration-success',
                                        {
                                            'title': 'Success',
                                            'body' : i18n('registration_modal_success')
                                        },
                                        function( $modal )
                                        {
                                            $modal.on(
                                                'hidden.bs.modal',
                                                function()
                                                {
                                                    SPA.Login.show();
                                                }
                                            );
                                        }
                                    ).modal('show');
                                }
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
        return  self.formatDateTillDay( date )+ ' ' +
            self._pad( date.getHours() ) + ':' +
            self._pad( date.getMinutes() );
    },
    'formatDateTillDay': function( date )
    {
        var self = SPA.DateHelper;
        return date.getFullYear() + '-' +
            self._pad( date.getMonth()+1 ) + '-' +
            self._pad( date.getDate() );
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
    },
    isDateBetween: function( date, date_from, date_till )
    {
        date = Date.parse( SPA.DateHelper.formatDateTillDay( new Date( Date.parse(date) ) ) );
        date_from = Date.parse( SPA.DateHelper.formatDateTillDay( new Date( Date.parse(date_from) ) ) );
        date_till = Date.parse( SPA.DateHelper.formatDateTillDay( new Date( Date.parse(date_till) ) ) );

        return date_from <= date &&
            date <= date_till;
    },
};

SPA.User = null;

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
                        onAuth( data );
                    }
                    else
                    {
                        onLogin( data );
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
                '<label for="invite-email">' + i18n('login_modal_email') + '</label>' +
                '<input type="text" class="form-control" id="login-email" placeholder="' + i18n('login_modal_email') + '"/>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="invite-email">' + i18n('login_modal_password') + '</label>' +
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
            },
            function () {
                $('#register').on(
                    'click',
                    function()
                    {
                        SPA.Registration._showModal();
                        SPA.Login.hide();
                    }
                );

                $('#login-submit').on(
                    'click',
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
                                if ( data.hasOwnProperty('error') )
                                {
                                    SPA.Error.show(
                                        data['message'] ||
                                        i18n('main_index_login_not_found')
                                    );
                                }
                                else
                                {
                                    SPA.setUser( data );
                                    SPA.Login.hide();
                                    SPA.Calendar.init();
                                    SPA.Loader.hide();
                                    SPA.Events.init();
                                    SPA.Registration.init();
                                }
                            },
                            'error'     : function (jqXHR, textStatus, errorThrown)
                            {
                                SPA.Error.show( i18n('main_index_login_not_found') );
                            }
                        });
                    }
                );
            }
        ).modal('show');
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
        var open_modals = $('.modal.in');
        $('.modal').each(function()
        {
            $(this).modal('hide');
        });
        var $modal = SPA.Modals.get(
            'errors',
            {
                'title': i18n('error_modal_title'),
                'body' : text
            }
        );
        $modal.modal('show');

        $modal.on(
            'hidden.bs.modal',
            function()
            {
                open_modals.each(function()
                {
                    $(this).modal('show');
                })
            }
        );
    },
    'hide': function()
    {

    }
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
                        '<button type="button" class="btn btn-default" data-dismiss="modal" id="modal-close">' + i18n('modal_close') + '</button>' +
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
            afterCreate( $modal );
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
        function( data )
        {
            SPA.setUser( data );
            SPA.Calendar.init();
            SPA.Loader.hide();
            SPA.Events.init();
            SPA.Registration.init();
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
}
