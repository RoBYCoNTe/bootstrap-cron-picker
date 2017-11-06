# CronPicker

[![Code Climate](https://codeclimate.com/github/koss-lebedev/bootstrap-cron-picker/badges/gpa.svg)](https://codeclimate.com/github/koss-lebedev/bootstrap-cron-picker)
[![npm version](https://badge.fury.io/js/bootstrap-duration-picker.svg)](https://badge.fury.io/js/bootstrap-cron-picker)
[![Bower version](https://badge.fury.io/bo/bootstrap-duration-picker.svg)](https://badge.fury.io/bo/bootstrap-cron-picker)

CronPicker is a javascript library that provides easy to use 
interface for generating CRON expressions.

## Fork improvements
I've forked this great project to add few improvements necessary to me: 

1. Added support for: every minutes, hours, days. 
2. Changed UI for my requirements.
3. Just for dev: new gulp task to watch and edit file at runtime. 

You can use http-server and gulp watch to work on it and add your changes.

## Features

1. Supports multiple CRON formats: crontab (StandardCronFormatter) 
and extended format used in Quartz Scheduler (QuartzCronFormatter)
2. Can be initialized with an existing CRON expression

## Installation

    npm install bootstrap-cron-picker

Using Bower:

    bower install bootstrap-cron-picker

## Usage

To attach CronPicker to an input field with id `#cron-picker`:

```javascript
$('#cron-picker').cronPicker();
```

You can also initialize CronPicker with existing cron expression. 
To do that, simply set value of the HTML input before attaching CronPicker.

For advanced usage, you can pass any of the following options:

```javascript
$('#cron-picker').cronPicker({
        // time format, either 12 hours or 24 hours (default)
        format: '24',
        
        // available formatters:
        //   - StandardCronFormatter (crontab specification)
        //   - QuartzCronFormatter (quartz.net specification)
        cronFormatter: StandardCronFormatter,
    
        // callback function called each time cron expression is updated
        onCronChanged: function (cron) {
            console.log(cron);
        }
    });
```
