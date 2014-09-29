var s = require('sequelize');

module.exports = function(db) {
    return db.define('Entry', {
        file_name: s.STRING,
        cast_time_utc: s.STRING,
        cast_time_local: s.STRING,
        sample_type: s.STRING,
        location_source: s.STRING,
        default_latitude: s.FLOAT,
        default_altitude: s.FLOAT,
        start_latitude: s.FLOAT,
        start_longitude: s.FLOAT,
        start_altitude: s.FLOAT,
        start_gps_horizontal_error: s.FLOAT, // meters
        start_gps_vertical_error: s.FLOAT, // meters
        start_gps_number_of_satellites: s.INTEGER,
        end_latitude: s.FLOAT,
        end_longitude: s.FLOAT,
        end_altitude: s.FLOAT,
        end_gps_horizontal_error: s.FLOAT, // meters
        end_gps_vertical_error: s.FLOAT, // meters
        end_gps_number_of_satellites: s.INTEGER,
        cast_duration: s.FLOAT, // seconds
        samples_per_second: s.INTEGER,
        electronics_calibration_date: s.STRING,
        conductivity_calibration_date: s.STRING,
        temperature_calibration_date: s.STRING,
        pressure_calibration_date: s.STRING,
        // the measurements
        pressure: s.FLOAT, // decibar
        depth: s.FLOAT, // meters
        temperature: s.FLOAT, // celsius
        conductivity: s.FLOAT, // microsiemens per centimenter
        specific_conductance: s.FLOAT, // microsiemens per centimenter
        salinity: s.FLOAT, // practical salinity scale
        sound_velocity: s.FLOAT, // meters per second
        density: s.FLOAT // kilograms per cubic meter
    });
};
    
