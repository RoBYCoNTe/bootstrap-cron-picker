(function ($) {

    class CronPicker {

        constructor(wrapper, hostControl, options) {
            this.wrapper = wrapper;
            this.hostControl = hostControl;
            const defaults = {
                format: '24',
                cronFormatter: StandardCronFormatter,
            };
            this.settings = $.extend({}, defaults, options);

            this.state = {
                type: 'Daily',
                hours: 0,
                minutes: 0,
                dayNumber: 1,
                monthRepeater: 1,
                ordCondition: '#1',
                daysOfWeek: [],
                dayFilter: 'day',
                dayOfWeek: 1
            };

            this._buildControl();
            this.setCronExpression(this.hostControl.val());
        }

        setCronExpression(cronExpression) {
            if (cronExpression.length > 0) {
                this._parseCronExpression(cronExpression);
            } else {
                this._buildCronExpression();
            }
            this._updateUI();
        }

        _buildControl() {
            const container = $('<div>', {
                class: 'cron-picker-container',
                html: [
                    this._buildRecurrenceTypes(),
                    this._buildEveryMinutesPicker(),
                    this._buildEveryHoursPicker(),
                    this._buildEveryDaysPicker(),
                    this._buildDaysOfWeeks(),
                    this._buildMonthlyFilter(),
                    this._buildTimePicker()
                ]
            });

            this.wrapper.append(container);
        }

        _buildMonthlyFilter() {
            const self = this;
            const dayButton = this._buildFilterButton('day');
            const weekDayButton = this._buildFilterButton('weekday');

            const daySelect = $('<select>', {
                html: CronPicker._buildOptions(31, 1),
                class: 'form-control cron-picker-day-number'
            }).on('change', function() {
                self.state.dayNumber = this.value;
                self._buildCronExpression();
            });

            const monthRepeaterSelect = $('<select>', {
                html: CronPicker._buildOptions(12, 1),
                class: 'form-control cron-picker-month-repeater'
            }).on('change', function() {
                self.state.monthRepeater = this.value;
                self._buildCronExpression();
            });

            const buttonContainer = $('<div>', {
                class: 'btn-group',
                html: [] // TODO: [dayButton, weekDayButton]
            });

            const dayFilterContainer = $('<div>', {
                class: 'cron-picker-day-type-filter',
                html: [
                    this._label('Every'), 
                    daySelect, 
                    ' day '
                ]
            });

            const ordinalitySelect = $('<select>', {
                class: 'form-control cron-picker-ord-select',
                html: this._buildOrdinalityOptions()
            }).on('change', function() {
                self.state.ordCondition = this.value;
                self._buildCronExpression();
            });

            const dayOfWeekSelect = $('<select>', {
                class: 'form-control cron-picker-dow-select',
                html: this._buildDaysOfWeekOptions()
            }).on('change', function() {
                self.state.dayOfWeek = this.value;
                self._buildCronExpression();
            });

            const weekdayFilterContainer = $('<div>', {
                class: 'cron-picker-weekday-type-filter',
                html: [
                    ordinalitySelect, dayOfWeekSelect
                ]
            });

            return $('<div>', {
                class: 'cron-picker-day-filter cron-picker-section',
                html: [
                    buttonContainer, dayFilterContainer, weekdayFilterContainer,
                    ' of every ', monthRepeaterSelect, ' month(s) '
                ]
            });
        }

        _buildOrdinalityOptions() {
            return [
                ['First', '#1'], ['Second', '#2'], ['Third', '#3'], ['Last', 'L'],
            ].map( pair => $('<option>', { value: pair[1], text: pair[0] }) );
        }

        _buildDaysOfWeekOptions() {
            return [
                ['Monday', 1], ['Tuesday', 2], ['Wednesday', 3], ['Thurdsay', 4],
                ['Friday', 5], ['Saturday', 6], ['Sunday', 7]

            ].map(pair => {
                return $('<option>', { value: pair[1], text: pair[0] })
            });
        }

        _buildFilterButton(type) {
            const self = this;
            return $('<button>', {
                type: 'button',
                class: 'btn btn-default',
                text: type.toUpperCase(),
                'data-day-filter': type
            }).on('click', function () {
                self.state.dayFilter = this.getAttribute('data-day-filter');
                self._buildCronExpression();
                self._updateUI();
            });
        }

        _buildTimePicker() {
            return $('<div>', {
                class: 'cron-picker-time cron-picker-section',
                html: [
                    this._label('Start at:'),
                    this._buildHourPicker(),
                    ' - ',
                    this._buildMinutesPicker(),
                    this._buildAMPMPicker()
                ]
            });
        }

        _label(text) {
            return $('<label>', {
                text: text
            });
        }

        _buildEveryMinutesPicker() {
            return $('<div>', {
                class: 'cron-picker-every-minutes-picker cron-picker-section',
                html: [
                    this._label('Every: '),
                    this._buildMinutesPicker('cron-picker-every-minutes'),
                    ' Minutes'
                ]
            });
        }

        _buildEveryHoursPicker() {
            return $('<div>', {
                class: 'cron-picker-every-hours-picker cron-picker-section',
                html: [
                    this._label('Every: '),
                    this._buildHourPicker('cron-picker-every-hours'),
                    ' Hours'
                ]
            });
        }

        _buildEveryDaysPicker() {
            return $('<div>', {
                class: 'cron-picker-every-days-picker cron-picker-section   ',
                html: [
                    this._label('Every: '),
                    this._buildDaysPicker(),
                    ' Days'
                ]
            })
        }

        _buildHourPicker(className = 'cron-picker-hours') {
            const self = this;
            if (self.settings.format === '24') {
                return $('<select>', {
                    html: CronPicker._buildOptions(24),
                    class: 'form-control cron-picker-select ' + className
                }).on('change', function() {
                    self._setHours();
                    self._buildCronExpression();
                });
            } else {
                return $('<select>', {
                    html: CronPicker._buildOptions(12, 1),
                    class: 'form-control cron-picker-select ' + className
                }).on('change', function() {
                    self._setHours();
                    self._buildCronExpression();
                });
            }
        }

        _buildDaysPicker() {
            const self = this;
            return $('<select>', {
                html: CronPicker._buildOptions(31, 1),
                class: 'form-control cron-picker-select cron-picker-every-days'
            }).on('change', function() {
                self.state.days = this.value;
                self._buildCronExpression();
            })
        }

        _setHours() {
            let hours = parseInt(this.wrapper.find('.cron-picker-hours').val());
            if (this.settings.format == '12') {
                const ampm = this.wrapper.find('.cron-picker-ampm').val();
                if(ampm == "PM" && hours < 12) hours = hours + 12;
                if(ampm == "AM" && hours == 12) hours = hours - 12;
            }
            this.state.hours = hours;
        }

        _buildAMPMPicker() {
            const self = this;
            if (self.settings.format === '12') {
                return $('<select>', {
                    html: [
                        "<option value='AM'>AM</option>",
                        "<option value='PM'>PM</option>"
                    ],
                    class: 'form-control cron-picker-ampm'
                }).on('change', function () {
                    self._setHours();
                    self._buildCronExpression();
                });
            }
        }

        _buildMinutesPicker(className = 'cron-picker-minutes') {
            const self = this;

            return $('<select>', {
                html: CronPicker._buildOptions(60),
                class: 'form-control cron-picker-select ' + className
            }).on('change', function() {
                self.state.minutes = parseInt(this.value, 10);
                self._buildCronExpression();
            });
        }

        static _buildOptions(max, offset) {
            offset = offset || 0;
            return [...Array(max).keys()].map((v) =>
                `<option value="${v + offset}">${("0"+(v+offset)).slice(-2)}</option>`
            ).join();
        }

        _buildRecurrenceTypes() {
            return $('<ul>', {
                class: 'nav nav-pills cron-picker-recurrence-types',
                html: [
                    this._buildRecurrenceType('Minutes'),
                    this._buildRecurrenceType('Hourly'),
                    this._buildRecurrenceType('Daily'),
                    this._buildRecurrenceType('Weekly'),
                    this._buildRecurrenceType('Monthly')
                ]
            });
        }

        _buildRecurrenceType(type) {
            const self = this;
            return $('<li>', {
                'data-type': type,
                html: $('<a>', { text: type }).on('click', function() {
                    self.state.type = this.parentNode.getAttribute('data-type');
                    self._buildCronExpression();
                    self._updateUI();
                })
            });
        }

        _buildDaysOfWeeks() {
            return $('<div>', {
                class: 'cron-picker-dow',
                html: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((item, index) => {
                    return this._buildDayOfWeekButton(item, index + 1);
                })
            })
        }

        _buildDayOfWeekButton(text, value) {
            const self = this;
            return $('<button>', { type: 'button', class: 'btn btn-default', text: text, 'data-dow': value })
                .on('click', function () {
                    const value = this.getAttribute('data-dow');
                    const index = self.state.daysOfWeek.indexOf(value);
                    if (index === -1) {
                        self.state.daysOfWeek.push(value);
                    } else {
                        self.state.daysOfWeek.splice(index, 1);
                    }
                    self._buildCronExpression();
                    self._updateUI();
                });
        }

        _formatHours(hours) {
            if (this.settings.format == '24') {
                return [
                    hours, null
                ];
            } else {
                return [
                    hours % 12 || 12,
                    hours < 12 ? "AM" : "PM"
                ];
            }
        }

        _parseCronExpression(cron) {
            const newState = this.settings.cronFormatter.parse(cron);
            $.extend(this.state, newState);
        }

        _updateUI() {
            // Set controls value based on current state

            this.wrapper.find('li').removeClass('active');
            this.wrapper.find(`[data-type=${this.state.type}]`).addClass('active');

            this.wrapper.find('[data-day-filter]').removeClass('active');
            this.wrapper.find(`[data-day-filter=${this.state.dayFilter}]`).addClass('active');

            this.wrapper.find('.cron-picker-dow > button.active').removeClass('active');
            this.state.daysOfWeek.forEach(dow => {
                this.wrapper.find(`.cron-picker-dow > button[data-dow=${dow}]`).addClass('active');
            });

            this.wrapper.find('.cron-picker-minutes').val(this.state.minutes);
            this.wrapper.find('.cron-picker-every-minutes').val(this.state.minutes)

            const formatted = this._formatHours(this.state.hours);
            this.wrapper.find('.cron-picker-hours').val(formatted[0]);
            this.wrapper.find('.cron-picker-ampm').val(formatted[1]);
            this.wrapper.find('.cron-picker-every-hours').val(formatted[0]);
            this.wrapper.find('.cron-picker-every-days').val(this.state.days);

            this.wrapper.find('.cron-picker-dow-select').val(this.state.dayOfWeek);
            this.wrapper.find('.cron-picker-month-repeater').val(this.state.monthRepeater);
            this.wrapper.find('.cron-picker-ord-select').val(this.state.ordCondition);
            this.wrapper.find('.cron-picker-day-number').val(this.state.dayNumber);

            // Set controls visibility

            if (this.state.type == 'Minutes') {
                this.wrapper.find('.cron-picker-every-minutes-picker').removeClass('hidden');
            }
            else {
                this.wrapper.find('.cron-picker-every-minutes-picker').addClass('hidden');
            }
            if (this.state.type == 'Hourly') {
                this.wrapper.find('.cron-picker-every-hours-picker').removeClass('hidden');
            }
            else {
                this.wrapper.find('.cron-picker-every-hours-picker').addClass('hidden');
            }

            if (this.state.type == 'Minutes' || this.state.type == 'Hourly') {
                this.wrapper.find('.cron-picker-time').addClass('hidden');
            }
            else {
                this.wrapper.find('.cron-picker-time').removeClass('hidden');
            }
            if (this.state.type == 'Daily') {
                this.wrapper.find('.cron-picker-every-days-picker').removeClass('hidden');
            }
            else {
                this.wrapper.find('.cron-picker-every-days-picker').addClass('hidden');
            }

            if (this.state.type == 'Weekly') {
                this.wrapper.find('.cron-picker-dow').removeClass('hidden');
            } else {
                this.wrapper.find('.cron-picker-dow').addClass('hidden');
            }

            if (this.state.type == 'Monthly') {
                this.wrapper.find('.cron-picker-day-filter').removeClass('hidden');
            } else {
                this.wrapper.find('.cron-picker-day-filter').addClass('hidden');
            }

            if (this.state.dayFilter == 'day') {
                this.wrapper.find('.cron-picker-day-type-filter').removeClass('hidden');
                this.wrapper.find('.cron-picker-weekday-type-filter').addClass('hidden');
            } else {
                this.wrapper.find('.cron-picker-day-type-filter').addClass('hidden');
                this.wrapper.find('.cron-picker-weekday-type-filter').removeClass('hidden');
            }
        }

        _buildCronExpression() {
            let cronExpression = this.settings.cronFormatter.build(this.state);
            this.hostControl.val(cronExpression);
            if (typeof this.settings.onCronChanged === "function") {
                this.settings.onCronChanged(cronExpression);
            }
        }

    }

    $.fn.cronPicker = function (options) {
        const defaults = {
            onCronChanged: null
        };
        const settings = $.extend({}, defaults, options);

        this.each((i, hostControl) => {
            hostControl = $(hostControl);

            if (hostControl.data('cron-picker') === '1')
                return;

            const wrapper = $(`
                <div class="cron-picker">
                </div>`
            );

            hostControl.after(wrapper).hide().data('cron-picker', '1');
            return  new CronPicker(wrapper, hostControl, settings);
        });
    };

}(jQuery));