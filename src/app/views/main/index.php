<div id="page-content">
    <div id="calendar-bg">
    </div>
    <div id="calendar">
    </div>
    <div id="panel">
        <div class="row" data-type="nav" style="display: none;">
            <div class="col-xs-12 text-right">
                <div class="btn-group">
                    <button type="button" class="btn btn-default" id="registration-invite" title="<?= $this->core->i18n('btn_title_invite') ?>"><i class="glyphicon glyphicon-plus"></i></button>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-default" id="reset-month" title="<?= $this->core->i18n('btn_title_reset_month') ?>"><i class="glyphicon glyphicon-asterisk"></i></button>
                </div>
                <div class="btn-group">
                    <button type="button" class="btn btn-default" id="prev-month" title="<?= $this->core->i18n('btn_title_prev_month') ?>"><i class="glyphicon glyphicon-arrow-left"></i></button>
                    <button type="button" class="btn btn-default" id="next-month" title="<?= $this->core->i18n('btn_title_next_month') ?>"><i class="glyphicon glyphicon-arrow-right"></i></button>
                </div>
                <div class="btn-group">
                    <?= $email ?>
                    <?= ( $is_admin ? '<i class="glyphicon glyphicon-star"></i>' : '' ) ?>
                </div>
                <div class="btn-group">
                    <a href="/auth/logout" class="btn btn-danger" title="<?= $this->core->i18n('btn_title_logout') ?>"><i class="glyphicon glyphicon-log-out"></i></a>
                </div>
            </div>
        </div>
        <div class="row" data-type="login">
            <div class="col-xs-12 text-right">
                <div class="btn-group">
                    <button type="button" id="login-show" class="btn btn-info" title="<?= $this->core->i18n('btn_title_login') ?>"><i class="glyphicon glyphicon-log-in"></i></button>
                </div>
            </div>
        </div>
    </div>
    <div id="loader-wrapper" style="display: none;">
        <div id="loader">
            <svg width="48" height="48" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1">
                <path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#76f19a">
                    <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 150 150" to="360 150 150" begin="0s" dur=".5s" fill="freeze" repeatCount="indefinite"></animateTransform>
                </path>
            </svg>
        </div>
    </div>
</div>