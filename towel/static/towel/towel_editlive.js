;(function($) {
    var updateLive = function(data) {
        $.each(data, function(key, value) {
            if (key == '!redirect') {
                window.location.href = value;
                return false;
            } else if (key == '!reload') {
                window.location.reload();
                return false;
            } else if (key[0] == '!') {
                // unknown command, skip.
                return;
            }

            var elem = $('#' + key),
                update = elem.data('update') || 'replace';

            switch(update) {
                case 'append':
                    elem.append(value);
                    break;
                case 'prepend':
                    elem.prepend(value);
                    break;
                default:
                    elem.html(value);
            }

            elem.trigger('updateLive', [elem]);
        });

        initializeForms();
    };
    if (!window.updateLive) window.updateLive = updateLive;

    var editLive = function(action, attribute, value, callback) {
        var data = {};
        data[attribute] = value;

        $.post(action, data, function(data) {
            if (typeof(data) == 'string') {
                alert(data);
            } else {
                updateLive(data);
            }

            if (callback) {
                callback();
            }
        });
    }

    var formFieldHandler = function(event) {
        var $this = $(this),
            action = $(this).data('action'),
            original = $this.data('original'),
            attribute = $this.data('attribute');

        if (!action || this.value == original)
            return;

        editLive(action, $this.data('attribute'), this.value, function() {
            $this.trigger('editLive', [$this]);
        });
    }

    $(document.body).on('focusout',
        'input.editlive, textarea.editlive',
        formFieldHandler);
    $(document.body).on('change',
        'input[type=hidden].editlive',
        formFieldHandler);

    $(document.body).on('click',
            'input[type=checkbox].editlive', function(event) {
        var $this = $(this),
            action = $(this).data('action'),
            attribute = $this.data('attribute');

        if (!action)
            return;

        editLive(action, $this.data('attribute'),
            $this.prop('checked') ? true : false,
            function() {
                $this.trigger('editLive', [$this]);
            });
    });

    $(document.body).on('click', 'a.editlive, li.editlive', function(event) {
        event.stopPropagation();
        event.preventDefault();

        var $this = $(this),
            action = $(this).data('action'),
            value = $this.data('value'),
            original = $this.data('original');

        if (!action || value == original)
            return;

        editLive(action, $this.data('attribute'), value);
    });

    var initializeForms = function() {
        $('form.editlive').not('.initialized').each(function() {
            var $form = $(this),
                prefix = $form.data('form-prefix') || '',
                action = $form.attr('action');

            $form.on('submit', false);
            $form.addClass('initialized');
            $form.on('change', 'input[type=text], textarea, select',
                function(event) {
                    var source = $(this),
                        name = this.name;
                    if (prefix)
                        name = name.replace(prefix, '');
                    editLive(action, name, this.value, function() {
                        source.trigger('editLive', [source]);
                    });
                });

            $form.on('change', 'input[type=checkbox]', function(event) {
                var source = $(this),
                    name = this.name;
                if (prefix)
                    name = name.replace(prefix, '');
                editLive(action, name, this.checked, function() {
                    source.trigger('editLive', [source]);
                });
            });
        });
    };
    initializeForms();
})(jQuery);
