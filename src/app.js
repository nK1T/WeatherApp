const express = require('express');
require('dotenv').config();
const hbs = require('hbs');
const path = require('path');
const app = express();
const PORT = process.env.PORT;
const API = process.env.API;
const requests = require('requests');

// Paths
const partialpath = path.join(__dirname, '../templates/partials');
const fpath = path.join(__dirname, '../templates/views');
const staticPath = path.join(__dirname, '../public');

// Define static files e.g css, images
app.use(express.static(staticPath));

// Register partials
hbs.registerPartials(partialpath);

// Set up view engine
app.set('view engine', 'hbs');

// Change default path from 'views' to '../templates/views' by providing path as the second argument
app.set('views', fpath);

// Function to fetch weather data
const fetchWeatherData = (cityName) => {
    return new Promise((resolve, reject) => {
        requests(`http://api.weatherapi.com/v1/current.json?key=${API}&q=${cityName}&aqi=no`)
            .on('data', (chunk) => {
                const objchnk = JSON.parse(chunk); // JSON to object
                resolve(objchnk);
            })
            .on('end', (err) => {
                if (err) reject(err);
            });
    });
};

// Routes
app.get('/',(req,res)=>{
    res.render('index')
})
app.get('/weather', async (req, res) => {
    try {
        const cityName = req.query.city; // Get the city name from the query parameter
        const weatherData = await fetchWeatherData(cityName);
        const temp_c = weatherData.current.temp_c;
        const temp_f = weatherData.current.temp_f;
        const location = weatherData.location.name;
        const country = weatherData.location.country;
        const icon = weatherData.current.condition.icon;
        const time = weatherData.location.localtime;
        
        res.render('index', {
            temp_c,
            temp_f,
            City: location,
            Country: country,
            Icon:icon,
            time,
        }); 
    } catch (error) {
        console.error(error);
        res.end('Error fetching weather data');
    }
});


// Starting server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
