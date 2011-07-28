# jquery.dependentSelect plugin
jquery.dependentSelect plugin transforms your difficult select element with huge amount of options into widget with cascade select boxes. It might be city or student select, for example.

## Features
* Use local data, URL or function as data source
* Access all defined widget options on server side
* Use multiple and single widget without restrictions

## Todo
* Calculate all selects states in single widget with selected value

## Use

You don’t need to change your HTML. Widget should work with your markup without changes. If the number of options is really huge you can load only selected.

### Single widget with local data

Local data format is strict and currently can’t be changed.

        $(document).ready(function() {
          $('select#single-local-data').dependentSelect({
            isMultiple: false,
            selects: [
              { model: "Continent" },
              { model: "Country" },
              { model: "City" }
            ],
            dataSource: 
            {
                 'Continent': {
                     values: [
                         { value: 1, text: "Asia" },
                         { value: 2, text: "Europe" }
                     ],
                     relatedTo: 'Country',
                     relations: {
                         1: [1,2,3],
                         2: [4,5]
                     }
                 },
                 'Country': {
                     values: [
                         { value: 1, text: 'Japan'  },
                         { value: 2, text: 'China'  },
                         { value: 3, text: 'Spain'  },
                         { value: 4, text: 'India' },
                         { value: 5, text: 'Czech Republic' },
                     ],
                     relatedTo: 'City',
                     relations: {
                         1: [1],
                         2: [2],
                         3: [3,4],
                         4: [5],
                         5: [6]
                     }
                 },
                 'City': {
                     values: [
                         { value: 1, text: 'Tokio' },
                         { value: 2, text: "Pekin" },
                         { value: 3, text: "Madrid" },
                         { value: 4, text: "Barcelona" },
                         { value: 5, text: "New Delhi" },
                         { value: 6, text: "Prague" },
                     ]
                 }
             }
        });

### Multiple widget with remote data

All options you set in ‘selects’ array will be accessible on server.

        $('select#single').dependentSelect({
          isMultiple: false,
          addEmpty: false,
          selects: [
            { model: "School", init: "findAll", key: "relatedGroups", targetModel: "Group" },
            { model: "Group", key: "relatedStudents", targetModel: "Student" },
            { model: "Student" }
          ],
          dataSource: 'index.php?module=get_data'
        });

### Single widget with remote data and custom empty options

        $('select#single-add-empty').dependentSelect({
          isMultiple: false,
          addEmpty: '—',
          seklects: [
            { model: "School", init: "findAll", key: "relatedGroups", targetModel: "Group", emptyOptionCaption: "Select school..." },
            { model: "Group", key: "relatedStudents", targetModel: "Student", emptyOptionCaption: "Select group..." },
            { model: "Student", emptyOptionCaption: "Select student..." }
          ],
          dataSource: 'index.php?module=get_data'
        });

