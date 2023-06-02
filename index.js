const proxyLink = 'https://weather-app-proxy.onrender.com';

const WEATHER_PROP = {
    CLOUD: 'CLOUD',
    HUMIDITY: 'HUMIDITY',
    PRESSURE: 'PRESSURE',
    VISIBILITY: 'VISIBILITY',
    UV_INDEX: 'UV_INDEX',
    WIND: 'WIND',
};

const ATMOSPHERE = {
    SUNNY: 'SUNNY',
    OVERCAST: 'OVERCAST',
    PARTLY_CLOUDY: 'PARTLY CLOUDY',
    CLEAR: 'CLEAR',
    FOG: 'FOG',
};

const SEARCH_STATE = {
    ACTIVE: 'active',
};

let state = {
    city: null,
    temperature: 0,
    observationTime: '00:00 AM',
    weatherDescriptions: [],
    isDay: 'yes',
    properties: {
        [WEATHER_PROP.CLOUD]: {
            icon: 'cloud.png',
            title: 'CLOUD COVER',
            value: null,
        },
        [WEATHER_PROP.HUMIDITY]: {
            icon: 'humidity.png',
            title: 'HUMIDITY',
            value: null,
        },
        [WEATHER_PROP.PRESSURE]: {
            icon: 'gauge.png',
            title: 'PRESSURE',
            value: null,
        },
        [WEATHER_PROP.VISIBILITY]: {
            icon: 'visibility.png',
            title: 'VISIBILITY',
            value: null,
        },
        [WEATHER_PROP.UV_INDEX]: {
            icon: 'uv-index.png',
            title: 'UV INDEX',
            value: null,
        },
        [WEATHER_PROP.WIND]: {
            icon: 'wind.png',
            title: 'WIND SPEED',
            value: null,
        },
    },
};

const setState = ({
    temperature,
    observation_time: observationTime,
    weather_descriptions: weatherDescriptions,
    is_day,
    pressure,
    cloudcover,
    humidity,
    visibility,
    uv_index: uvIndex,
    wind_speed: windSpeed,
    location: city,
}) => {
    state = {
        ...state,
        city,
        temperature,
        observationTime,
        weatherDescriptions,
        isDay: is_day === 'yes',
        properties: {
            [WEATHER_PROP.CLOUD]: {
                ...state.properties[WEATHER_PROP.CLOUD],
                value: `${cloudcover}%`,
            },
            [WEATHER_PROP.HUMIDITY]: {
                ...state.properties[WEATHER_PROP.HUMIDITY],
                value: `${humidity}%`,
            },
            [WEATHER_PROP.PRESSURE]: {
                ...state.properties[WEATHER_PROP.PRESSURE],
                value: `${pressure} mb`,
            },
            [WEATHER_PROP.VISIBILITY]: {
                ...state.properties[WEATHER_PROP.PRESSURE],
                value: `${visibility} km`,
            },
            [WEATHER_PROP.UV_INDEX]: {
                ...state.properties[WEATHER_PROP.UV_INDEX],
                value: `${uvIndex} of 10`,
            },
            [WEATHER_PROP.WIND]: {
                ...state.properties[WEATHER_PROP.WIND],
                value: `${windSpeed} km/h`,
            },
        },
    };
};

const fetchData = async (city = 'Kiev') => {
    const response = await fetch(`${proxyLink}?query=${city}`);

    if (response.status === 400) {
        console.log(response.statusText);
        return false;
    }

    const data = await response.json();
    return data;
};

const getWeatherImage = currentDescription => {
    const value = currentDescription.toUpperCase();
    switch (value) {
        case ATMOSPHERE.SUNNY:
            return 'sunny.png';
        case ATMOSPHERE.OVERCAST:
            return 'cloud.png';
        case ATMOSPHERE.PARTLY_CLOUDY:
            return 'partly.png';
        case ATMOSPHERE.CLEAR:
            return 'clear.png';
        case ATMOSPHERE.FOG:
            return 'fog.png';
        default:
            return 'the.png';
    }
};

const gerWeatherPropertiesMarkup = properties =>
    Object.values(properties)
        .map(
            ({ icon, value, title }) => `
        <div class="property">
          <div class="property-icon">
            <img src="./img/icons/${icon}" alt="">
          </div>
          <div class="property-info">
            <div class="property-info__value">${value}</div>
            <div class="property-info__description">${title}</div>
          </div>
        </div>
  `
        )
        .join('');

const getMarkup = () => {
    const { city, isDay, properties, temperature, observationTime, weatherDescriptions } = state;

    const containerClass = isDay ? 'is-day' : '';
    const description = weatherDescriptions[0];

    return `<div class="container ${containerClass}">
          <div class="top">
            <div class="city">
              <div class="city-subtitle">Weather Today in</div>
              <div class="city-title" id="city">
                <span>${city}</span>
              </div>
            </div>
            <div class="city-info">
              <div class="top-left">
                <img class="icon" src="./img/${getWeatherImage(description)}" alt="" />
                <div class="description">${description}</div>
              </div>
            
              <div class="top-right">
                <div class="city-info__subtitle">as of ${observationTime}</div>
                <div class="city-info__title">${temperature}°</div>
              </div>
            </div>
          </div>
          <div id="properties">${gerWeatherPropertiesMarkup(properties)}</div>
        </div>`;
};

const renderApp = () => {
    const root = document.getElementById('root');
    root.innerHTML = getMarkup();

    const cityLabel = document.getElementById('city');
    cityLabel && cityLabel.addEventListener('click', toggleFormState);
};

function addEventListeners() {
    const input = document.getElementById('text-input');
    const closeButton = document.getElementById('close');
    const searchForm = document.getElementById('form');

    input && input.addEventListener('input', inputText);
    closeButton && closeButton.addEventListener('click', toggleFormState);
    searchForm && searchForm.addEventListener('submit', submitForm);
}

function removeEventListeners() {
    const input = document.getElementById('text-input');
    const closeButton = document.getElementById('close');
    const searchForm = document.getElementById('form');

    input && input.removeEventListener('input', inputText);
    closeButton && closeButton.removeEventListener('click', toggleFormState);
    searchForm && searchForm.removeEventListener('submit', submitForm);
}

const toggleFormState = () => {
    const popup = document.getElementById('popup');
    const isSearchFormOpen = popup.classList.value.includes('active');

    if (isSearchFormOpen) {
        removeEventListeners();
    } else {
        addEventListeners();
    }

    popup && popup.classList.toggle(SEARCH_STATE.ACTIVE);
};

function inputText({ target: { name, value } }) {
    state = {
        ...state,
        [name]: value,
    };
}

async function submitForm(e) {
    e.preventDefault();

    const currentCity = state.city;

    const data = await fetchData(currentCity);
    if (data) {
        localStorage.setItem('city', currentCity);
        setState(data);
        renderApp();
    }

    toggleFormState();
    e.target.reset();
}

const weatherApp = async () => {
    const city = localStorage.getItem('city');
    const data = await fetchData(city);
    setState(data);
    renderApp();
};

weatherApp();
