#!/usr/bin/env node

var async = require('async');
var XLSX = require('xlsx');
var s = require('sequelize');
var argv = require('minimist')(process.argv.slice(2));

if(argv._.length < 1) {
    console.error("Usage: ./import.js <name_of_xls[x/m/b]_file>");
    console.error("");
    console.error("  This program understands .xlsx, .xlsm and .xlsb files only");
    console.error("");
    process.exit(1);
}

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


function getCell(sheet, row, col) {
    var addr = XLSX.utils.encode_cell({c: col, r: row});
    return sheet[addr];
}

function importFile(filePath, callback) {

    var workbook = XLSX.readFile(filePath);
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    var sheetRange = XLSX.utils.decode_range(sheet['!ref']);
    var rowRange = {
        start: sheetRange.s.c,
        end: sheetRange.e.r
    };
    var numRows = rowRange.end - rowRange.start + 1;
    var newfile = true; // keep track of state
    
    db.sync().success(function() {
        var row, cell, key, val, cellname, addr, obj;
        async.timesSeries(numRows + 1, function(i, next) {
            if(i >= numRows) {
                return callback();
            }
            row = i + rowRange.start;
            cell = getCell(sheet, row, 0);
            if(!cell) {
                next();
                return;
            }
            key = cell.v.toString().replace('(Meter)', '').replace('(Seconds)', '').toLowerCase().replace(/[^\w\d\s]+/g, '').replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s+/g, '_');
            // new file encountered
            if(key == 'file_name') {
                newfile = true;
                obj = {};
            } else if(key == 'pressure_decibar') {
                newfile = false;
                next();
                return
            }
            if(newfile) {
                cell = getCell(sheet, row, 1);
                if(!cell) {
                    next();
                    return;
                }
                
                val = cell.w || cell.v;
                
                obj[key] = val;
                next();
            } else {
                
                obj.pressure = getCell(sheet, row, 0).v;
                obj.depth = getCell(sheet, row, 1).v;
                obj.temperature = getCell(sheet, row, 2).v;
                obj.conductivity = getCell(sheet, row, 3).v;
                obj.specific_conductance = getCell(sheet, row, 4).v;
                obj.salinity = getCell(sheet, row, 5).v;
                obj.sound_velocity = getCell(sheet, row, 6).v;
                obj.density = getCell(sheet, row, 7).v;
                
                Entry.create(obj).done(function(err, result) {
                    if(err) {
                        console.log("Creating database entry failed: " + err);
                        process.exit(1);
                    }
                    console.log("Importing row " + row + " of " + rowRange.end + " from file " + filePath)
                    next();
                });
            }
        });
        
    });
}



async.eachSeries(argv._, importFile, function(err) {
    if(err) {
        console.error("Error: " + err);
        process.exit(1);
    }
    console.log("Completed");
});
