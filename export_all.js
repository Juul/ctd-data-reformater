#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var s = require('sequelize');
var argv = require('minimist')(process.argv.slice(2));

var db = new s(null, null, null, {
  dialect: 'sqlite',
  storage: 'db/ctd.sqlite',
  logging: false,
  define: {
    charset: 'utf8',
    timestamps: true
  }
});

var Entry = require('./entry.js')(db);

var outfile = argv._[0];
if(argv._.length != 1) {
    console.error("Usage: ./export_all.js <outfile.csv>");
    console.error("");
    console.error("  This program outputs a .csv file.");
    console.error("");
    process.exit(1);
}

var out = '';

Entry.findAll().success(function(entries) {
    if(entries.length < 1) {
        console.error("No entries found");
        process.exit(1);
    }
    var attributes = entries[0].options.attributes;

    var line = '';
    // loop through all attributes and write their names on the first line
    var i, j;
    for(i=0; i < attributes.length; i++) {
        line += attributes[i];
        if(i < attributes.length-1)  {
            line += ",";
        } else {
            line += "\n";;
        }
    }

    out += line;

    var value;
    // loop through all entries
    for(i=0; i < entries.length; i++) {
        line = '';
        console.log("Exporting entry " + (i+1) + " of " + entries.length);

        // for each entry loop through all attributes
        for(j=0; j < attributes.length; j++) {
            
            value = entries[i].dataValues[attributes[j]];
            // write value of attribute
            value = value || '';
            value = value.toString();
            line += value;

            if(j < attributes.length-1)  {
                // write comma after each attribute unless it's the last attribute
                line += ',';
            } else {
                // write newline after last attribute
                line += "\n";
            }
        }
        out += line;
    }
    fs.writeFileSync(outfile, out);
});
