import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from 'react';

import { getDataForOaColorsDistribution, getDataForOaStatusDistribution } from './get-data';
import Loader from '../loader';

const ChartWrapper = ({ id, countryCodes }) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});

  useEffect(() => {
    const getData = async () => {
      try {
        if (countryCodes && countryCodes !== '') {
          setIsLoading(true);
          let chartOptions = {};
          if (id === 'oa-status-distribution') {
            chartOptions = await getDataForOaStatusDistribution(countryCodes);
          } else if (id === 'oa-colors-distribution') {
            chartOptions = await getDataForOaColorsDistribution(countryCodes);
          }
          setOptions(chartOptions);
        }
      } catch (error) {
        console.error(error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [countryCodes]);

  if (isLoading) {
    return (
      <div
        className="graph-container text-center"
        style={{ height: '400px' }}
      >
        <Loader />
      </div>
    );
  }
  if (isError) {
    return <>Error</>;
  }
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
    />
  )
}

export default ChartWrapper;
