function QuartzCronFormatter() { }

QuartzCronFormatter.parse = function (cron) {
    const state = {};
    const parts = cron.split(' ');
    if (parts.length !== 7) {
        console.warn('Invalid cron expression. Skip parsing...');
    } else {
        state.hours = parts[2];
        state.minutes = parts[1];
        if (parts[2] === '*' && parts[3] === '1/1' && parts[4] == '*') {
            
            // minutes
            state.type = 'Minutes';
            state.minutes = parts[1].split('/')[1];

        } else if (parts[0] === '0' && parts[1] === '0' && parts[3] === '1/1' && parts[4] === '*' && parts[5] === '?') {
            
            // hourly
            state.type = 'Hourly';
            state.hours = parts[2].split('/')[1];

        } else if (parts[4] === '*' && parts[5] === '?' && parts[6] === '*') {
            
            // daily
            state.type = 'Daily';
            state.days = parts[3].split('/')[1];

        } else if (parts[4] == '*' && parts[5] !== '?') {

            // weekly
            state.type = 'Weekly';
            state.daysOfWeek = parts[5] === '' ? [] : parts[5].split(',');

        } else if (parts[4] !== '*') {

            // monthly
            state.type = 'Monthly';
            state.monthRepeater = parts[4].split('/')[1];

            if (parts[5] === '?') {
                state.dayFilter = 'day';
                state.dayNumber = parts[3];
            } else {
                state.dayFilter = 'weekday';
                state.dayOfWeek = parts[5].substr(0, 3);
                state.ordCondition = parts[5].substr(3);
            }

        }
    }
    console.warn('state:' , state);
    return state;
};

QuartzCronFormatter.build = function (state) {
    switch (state.type) {
        case "Minutes":
            return `0 0/${state.minutes} * 1/1 * ? *`
        case "Hourly":
            return `0 0 0/${state.hours} 1/1 * ? *`
        case "Daily":
            return `0 ${state.minutes} ${state.hours} 1/${state.days} * ? *`;
        case "Weekly":
            const dow = state.daysOfWeek.sort().join(',');
            return `0 ${state.minutes} ${state.hours} ? * ${dow} *`;
        case "Monthly":
            if (state.dayFilter === 'day') {
                return `0 ${state.minutes} ${state.hours} ${state.dayNumber} 1/${state.monthRepeater} ? *`;
            } else if (state.dayFilter == 'weekday') {
                return `0 ${state.minutes} ${state.hours} ? 1/${state.monthRepeater} ${state.dayOfWeek}${state.ordCondition} *`;
            }
    }
};