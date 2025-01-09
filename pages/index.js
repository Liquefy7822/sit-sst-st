import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
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
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Sensor Data Dashboard</h1>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <h2>Temperature</h2>
          {tempData ? (
            <>
              <p>
                Current: <strong>{tempData.currentValue.toFixed(1)}°</strong>
              </p>
              <p>
                Average: <strong>{tempData.average.toFixed(1)}°</strong>
              </p>
              <p>Status: {tempData.currentValue > tempData.average ? 'Above' : 'Below'} average</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div>
          <h2>Light</h2>
          {lightData ? (
            <>
              <p>
                Current: <strong>{lightData.currentValue.toFixed(1)}</strong>
              </p>
              <p>
                Average: <strong>{lightData.average.toFixed(1)}</strong>
              </p>
              <p>Status: {lightData.currentValue > lightData.average ? 'Above' : 'Below'} average</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>

      <style jsx>{`
        h1 {
          text-align: center;
        }
        div {
          margin: 10px 0;
        }
        strong {
          color: #0070f3;
        }
      `}</style>
    </div>
  );
};

export default Home;
