(function ($) {

    class CronPicker {

        constructor(wrapper, hostControl, settings) {
            this.wrapper = wrapper;
            this.hostControl = hostControl;
            this.settings = settings;
            this.state = {
                type: 'Daily',
                hours: 0,
                minutes: 0,
                dayNumber: 1,
                monthRepeater: 1,
                ordCondition: '#1',
                daysOfWeek: [],
                dayFilter: 'day',
                dayOfWeek: 'MON'
            };

            this._buildControl();
            this.setCronExpression(this.hostControl.val());
        }

        setCronExpression(cronExpression) {
            if (cronExpression.length > 0) {
                this._parseCronExpression(cronExpression);
            }
            this._updateUI();
        }

        _buildControl() {
            const container = $('<div>', {
                class: 'cron-picker-container',
                html: [
                    this._buildRecurrenceTypes(),
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
                html: [dayButton, weekDayButton]
            });

            const dayFilterContainer = $('<div>', {
                class: 'cron-picker-day-type-filter',
                html: [
                    daySelect, 'day&nbsp;'
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
                class: 'cron-picker-day-filter',
                html: [
                    buttonContainer, dayFilterContainer, weekdayFilterContainer,
                    'of every', monthRepeaterSelect, 'month(s)'
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

                ['Sunday', 'SUN'], ['Monday', 'MON'], ['Tuesday', 'TUE'],
                ['Wednesday', 'WED'], ['Friday', 'FRI'], ['Saturday', 'SAT']

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
            const self = this;

            const hours = $('<select>', {
                html: CronPicker._buildOptions(24),
                class: 'form-control cron-picker-hours'
            }).on('change', function() {
                self.state.hours = this.value;
                self._buildCronExpression();
            });

            const minutes = $('<select>', {
                html: CronPicker._buildOptions(60),
                class: 'form-control cron-picker-minutes'
            }).on('change', function() {
                self.state.minutes = this.value;
                self._buildCronExpression();
            });

            return $('<div>', {
                class: 'cron-picker-time',
                html: [ 'Run at:', hours, '-', minutes ]
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
                html: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(item => {
                    return this._buildDayOfWeekButton(item);
                })
            })
        }

        _buildDayOfWeekButton(text) {
            const self = this;
            return $('<button>', { type: 'button', class: 'btn btn-default', text: text })
                .on('click', function () {
                    const index = self.state.daysOfWeek.indexOf(this.innerText);
                    if (index === -1) {
                        self.state.daysOfWeek.push(this.innerText);
                    } else {
                        self.state.daysOfWeek.splice(index, 1);
                    }
                    self._buildCronExpression();
                    self._updateUI();
                });
        }

        _parseCronExpression(cron) {
            const parts = cron.split(' ');
            if (parts.length !== 7) {
                console.warn('Invalid cron expression. Skip parsing...');
            } else {
                this.state.hours = parts[2];
                this.state.minutes = parts[1];

                if (parts[4] === '*' && parts[5] === '?' && parts[6] === '*') {

                    // daily
                    this.state.type = 'Daily';

                } else if (parts[4] == '*' && parts[5] !== '?') {

                    // weekly
                    this.state.type = 'Weekly';
                    this.state.daysOfWeek = parts[5] === '' ? [] : parts[5].split(',');

                } else if (parts[4] !== '*') {

                    // monthly
                    this.state.type = 'Monthly';
                    this.state.monthRepeater = parts[4].split('/')[1];

                    if (parts[5] === '?') {
                        this.state.dayFilter = 'day';
                        this.state.dayNumber = parts[3];
                    } else {
                        this.state.dayFilter = 'weekday';
                        this.state.dayOfWeek = parts[5].substr(0, 3);
                        this.state.ordCondition = parts[5].substr(3);
                    }

                }
            }
        }

        _updateUI() {

            console.log(this.state);
            // Set controls value based on current state

            this.wrapper.find('li').removeClass('active');
            this.wrapper.find(`[data-type=${this.state.type}]`).addClass('active');

            this.wrapper.find('[data-day-filter]').removeClass('active');
            this.wrapper.find(`[data-day-filter=${this.state.dayFilter}]`).addClass('active');

            this.wrapper.find('.cron-picker-dow > button.active').removeClass('active');
            this.state.daysOfWeek.forEach(dow => {
                this.wrapper.find(`.cron-picker-dow > button:contains('${dow}')`).addClass('active');
            });

            this.wrapper.find('.cron-picker-minutes').val(this.state.minutes);
            this.wrapper.find('.cron-picker-hours').val(this.state.hours);
            this.wrapper.find('.cron-picker-dow-select').val(this.state.dayOfWeek);
            this.wrapper.find('.cron-picker-month-repeater').val(this.state.monthRepeater);
            this.wrapper.find('.cron-picker-ord-select').val(this.state.ordCondition);
            this.wrapper.find('.cron-picker-day-number').val(this.state.dayNumber);

            // Set controls visibility

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
            let cronExpression = "";
            switch (this.state.type) {
                case "Daily":
                    cronExpression = `0 ${this.state.minutes} ${this.state.hours} 1/1 * ? *`;
                    break;
                case "Weekly":
                    const dow = this.state.daysOfWeek.join(',');
                    cronExpression = `0 ${this.state.minutes} ${this.state.hours} ? * ${dow} *`;
                    break;
                case "Monthly":
                    if (this.state.dayFilter === 'day') {
                        cronExpression = `0 ${this.state.minutes} ${this.state.hours} ${this.state.dayNumber} 1/${this.state.monthRepeater} ? *`;
                    } else if (this.state.dayFilter == 'weekday') {
                        cronExpression = `0 ${this.state.minutes} ${this.state.hours} ? 1/${this.state.monthRepeater} ${this.state.dayOfWeek}${this.state.ordCondition} *`;
                    }
                    break;
            }
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