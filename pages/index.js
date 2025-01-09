import { useEffect, useState } from 'react';

// ThingSpeak API URLs
const TEMP_API_URL = 'https://api.thingspeak.com/channels/2804070/fields/1.json?results=60';
const LIGHT_API_URL = 'https://api.thingspeak.com/channels/2804070/fields/2.json?results=60';

const fetchSensorData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data || !data.feeds || data.feeds.length === 0) {
      throw new Error('No data available');
    }

    const fieldName = url.includes('fields/1') ? 'field1' : 'field2';
    const values = data.feeds
      .map(feed => Number(feed[fieldName]))
      .filter(val => val && !isNaN(val) && val > 0);

    if (values.length === 0) {
      throw new Error('No valid readings found');
    }

    const average = values.reduce((a, b) => a + b) / values.length;
    const currentValue = values[values.length - 1];

    return { currentValue, average };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

const Home = () => {
  const [tempData, setTempData] = useState(null);
  const [lightData, setLightData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const getData = async () => {
      try {
        const tempResult = await fetchSensorData(TEMP_API_URL);
        const lightResult = await fetchSensorData(LIGHT_API_URL);

        if (tempResult.error || lightResult.error) {
          setError('Error fetching sensor data');
        } else {
          setTempData(tempResult);
          setLightData(lightResult);
        }
      } catch (err) {
        setError('Error fetching data');
      }
    };

    getData();
  }, []);

  if (error) {
    return <div style={{ textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }

  const getStatusColor = (current, average) => {
    if (current > average) return 'green';
    if (current < average) return 'red';
    return 'gray'; // Neutral color if equal
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Sensor Data Dashboard</h1>
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', marginTop: '30px' }}>
        <div
          style={{
            backgroundColor: '#f0f8ff',
            borderRadius: '8px',
            padding: '20px',
            width: '250px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ textAlign: 'center', color: '#333' }}>Temperature</h2>
          {tempData ? (
            <>
              <p>
                <strong>Current: </strong>
                <span style={{ color: getStatusColor(tempData.currentValue, tempData.average) }}>
                  {tempData.currentValue.toFixed(1)}°
                </span>
              </p>
              <p>
                <strong>Average: </strong>
                <span>{tempData.average.toFixed(1)}°</span>
              </p>
              <p>Status: {tempData.currentValue > tempData.average ? 'Above' : 'Below'} average</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div
          style={{
            backgroundColor: '#fffacd',
            borderRadius: '8px',
            padding: '20px',
            width: '250px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ textAlign: 'center', color: '#333' }}>Light</h2>
          {lightData ? (
            <>
              <p>
                <strong>Current: </strong>
                <span style={{ color: getStatusColor(lightData.currentValue, lightData.average) }}>
                  {lightData.currentValue.toFixed(1)}
                </span>
              </p>
              <p>
                <strong>Average: </strong>
                <span>{lightData.average.toFixed(1)}</span>
              </p>
              <p>Status: {lightData.currentValue > lightData.average ? 'Above' : 'Below'} average</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>

      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Home;

};

export default Home;
