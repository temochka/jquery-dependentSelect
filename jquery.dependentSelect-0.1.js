/**
 * @license
 * © 2009-2010 Artem Chistyakov (chistyakov.artem@gmail.com)
 * http://github.com/temochka/jquery-dependentSelect
 * Distributed under MIT license.
 * All rights reserved.
 *
 * jQuery dependentSelect v0.1
 *
 * TODO:
 * - 
 *
 *
 * OPTIONS:
 *     isMultiple               
 *         - (default false) Row height in pixels.
 *     size                     
 *         - (default 5 for multiple row and 1 for single row select) 
 *              HTML size property of select element 
 *     selects                  
 *         - (default false) Array of selects descriptions
 *     dataSource               
 *         - (default {}) dataSource. Can be data object, function or url
 *
 * NOTES:
 *
 *
 *
 *
 */
(function($) {
    ////////////////////////////////////////////////////////////////////////////
    // dependentSelect implementation
    /** @constructor */        
    $.fn.dependentSelect = function(options) {
        var self = this;
        var _options = 
        {
            isMultiple: $(self).attr('multiple'),
            size: $(self).attr('multiple') ? 5 : 1,
            selects: [],
            dataSource: {},
            addEmpty: '—'
        };
        
        /** private methods */        
        // Initializes object’s behaviour
        function init() {            
            self.wrap($('<span></span>').addClass('dependent-select'));
            
            $.each(_options.selects, function(i, attributes) {
                var isLast = i == _options.selects.length - 1;
                var $widget = isLast && !_options.isMultiple ? self : $('<select></select>');
                
                $.each(attributes, function(name, value) {$widget.attr(name, value)});
                
                if (!i) {
                    $widget.addClass('dependent-select-first');
                }
                
                if (isLast) {
                    $widget.addClass('dependent-select-last');
                }
                
                if ($widget != self)  {
                    $widget.addClass('dependent-select-loader').insertBefore(self);
                }
                
                $widget.attr('size', _options.size);
            });
            
            self.attr('size', _options.size);
            if (self.attr('multiple') != _options.isMultiple) {
                self.attr('multiple', _options.isMultiple);
            }
            
            self.find('option').not(':selected').remove();
            
            if (_options.isMultiple) {
                self.addClass('dependent-select-selected');                
            }
            
            self.parent().find('select.dependent-select-loader').change(function(event) {
                if (!$(this).hasClass('dependent-select-last')) {
                    getData($(this).next(), $(this));
                } else if (_options.isMultiple) {
                    var $option = $(this).find('option[value='+$(this).val()+']');
                    var $selected = $(this).parent().find('.dependent-select-selected');
                    $selected.append($option).
                        find('option').attr('selected', 'selected');
                }
            });
            
            self.parent().find('.dependent-select-selected').change(
                function(event) {            
                    deleteWidgetOption($(this).find('option[value='+$(this).val()+']'));
                }
            ).mousedown(
                function(event) {
                    if (1 == $(this).find('option').length) {
                        deleteWidgetOption($(this).find('option').first());
                    }
                }
            );
                
            getData(self.parent().find('.dependent-select-first'));

            return self;
        }        
        
        // Deletes option from dependent select
        function deleteWidgetOption($option) {
            var $related = $option.parent().parent().find('.dependent-select-last');
            
            if ($related.hasClass('dependent-select-first')) {
                loadFirstWidget($related);
            } else {
                $related.prev().change();
            }
            $option.parent().find('option').attr('selected', 'selected');
            $option.detach();
        }
        
        // Returns an empty option
        function getEmptyOption($select) {
            var model = $select.attr('model');
            var selectOptions = getWidgetOptions($select);
            
            var emptyOption = '<option value="-">' + (selectOptions.emptyOptionCaption ? selectOptions.emptyOptionCaption : _options.addEmpty) +'</option>';
            return emptyOption;
        }
        
        // Returns options for given select
        function getWidgetOptions($select) {
            var selectOptions = false;
            $.each(_options.selects, function(i, options) {
                if (options.model == $select.attr('model')) {
                    selectOptions = options;
                    return false;
                }
            });
            return selectOptions;
        }
        
        // Sets options on dependent select
        function setWidgetOptions($obj, data) {            
            var exclude = [];
            if ($obj.hasClass('dependent-select-last')) {
                $obj.next().find('option').each(function(i, option) {
                    exclude[exclude.length] = parseInt($(option).val());
                });
            }
            unsetWidgetOptions($obj);
            $.each(data, function(i, settings) {
                if ($.inArray(parseInt(settings.value), exclude) == -1) {
                    $obj.append(
                        $('<option></option>').val(settings.value).html(settings.text)
                    );
                }
            });
        }
        
        // Unsets options on dependent select
        function unsetWidgetOptions($obj) {
            $obj.html(_options.isMultiple || !_options.addEmpty  ? '' : getEmptyOption($obj));
        }
        
        // Gets data from array, function or remote
        function getData($acceptor, $requestor) {
            var load_mode = undefined == $requestor ? 'self' : 'related';
            
            $acceptor.next('.dependent-select-loader').each(function(i, obj) {
                unsetWidgetOptions($(obj));
            });
            
            if ('related' == load_mode && '-' == $requestor.val()) {
                unsetWidgetOptions($acceptor);
                return;
            }
            
            // Loading data from function
            if ($.isFunction(_options.dataSource)) {
                setWidgetOptions($acceptor, _options.dataSource($requestor));
            // ... from URL
            } else if (_options.dataSource.constructor == String) {
                $widget = 'self' == load_mode ? $acceptor : $requestor;                
                var data = $.extend(getWidgetOptions($widget), {
                    value : $widget.val(),
                    loadMode : load_mode
                });
                $.get(_options.dataSource, data, function(data) {
                    setWidgetOptions($acceptor, data);
                });
            // ... from data object
            } else if (load_mode == 'related') {
                var model = $requestor.attr('model');
                var id = $requestor.val();
                var data = [];
                $.each(_options.dataSource[_options.dataSource[model].relatedTo].values, function(i, relatedModel) {                    
                    if ($.inArray(relatedModel.value, _options.dataSource[model].relations)) {
                        data[data.length] = relatedModel;
                    }
                });
                setWidgetOptions($acceptor, data);
            } else {
                loadFirstWidget($acceptor);
            }
        }
        
        // Sets options for the first column
        function loadFirstWidget($obj) {
            var model = $obj.attr('model');
            setWidgetOptions($obj, _options.dataSource[model].values);
        }
        
        /** code */
        // Extending defaults
        _options = $.extend(_options, options);
        
        // Initializing object
        return init();
    };
})(jQuery);
