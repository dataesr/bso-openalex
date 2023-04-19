/* eslint-disable no-await-in-loop */
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from 'react';

import Loader from '../loader';
import config from './config.json'

const { VITE_OPENALEX_MAILTO } = import.meta.env;

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OAColorDistribution = ({ countryCodes, countryLabels }) => {
  const { api, defaultChartOptions, sleepDuration } = config;
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});

  useEffect(() => {
    const getData = async () => {
      if (countryCodes && countryCodes !== '') {
        setIsLoading(true);
        const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];
        const closed = [];
        const green = [];
        const gold = [];
        const bronze = [];
        const hybrid = [];
        const unknown = [];
        for (const year of years) {
          const response = await fetch(`${api}?filter=institutions.country_code:${countryCodes},publication_year:${year},has_doi:true&group_by=open_access.oa_status&mailto=${VITE_OPENALEX_MAILTO}`);
          const data = await response.json();
          const total = data.group_by.reduce((acc, curr) => acc + curr.count, 0);
          const yAbsClosed = data.group_by.find((item) => item.key === 'closed')?.count || 0;
          closed.push({
            y: yAbsClosed / total * 100,
            y_abs: yAbsClosed,
            y_tot: total,
            year,
          });
          const yAbsGreen = data.group_by.find((item) => item.key === 'green')?.count || 0;
          green.push({
            y: yAbsGreen / total * 100,
            y_abs: yAbsGreen,
            y_tot: total,
            year,
          });
          const yAbsGold = data.group_by.find((item) => item.key === 'gold')?.count || 0;
          gold.push({
            y: yAbsGold / total * 100,
            y_abs: yAbsGold,
            y_tot: total,
            year,
          });
          const yAbsBronze = data.group_by.find((item) => item.key === 'bronze')?.count || 0;
          bronze.push({
            y: yAbsBronze / total * 100,
            y_abs: yAbsBronze,
            y_tot: total,
            year,
          });
          const yAbsHybrid = data.group_by.find((item) => item.key === 'hybrid')?.count || 0;
          hybrid.push({
            y: yAbsHybrid / total * 100,
            y_abs: yAbsHybrid,
            y_tot: total,
            year,
          });
          const yAbsUnknown = data.group_by.find((item) => item.key === 'unknown')?.count || 0;
          unknown.push({
            y: yAbsUnknown / total * 100,
            y_abs: yAbsUnknown,
            y_tot: total,
            year,
          });
          await sleep(sleepDuration);
        }
        console.log(defaultChartOptions);
        console.log(JSON.stringify(defaultChartOptions));
        console.log(JSON.parse(JSON.stringify(defaultChartOptions)));
        const optionsCopy = JSON.parse(JSON.stringify(defaultChartOptions));
        optionsCopy.xAxis.categories = years;
        optionsCopy.series = [
          { name: 'Closed', data: closed },
          { name: 'Green', data: green },
          { name: 'Gold', data: gold },
          { name: 'Bronze', data: bronze },
          { name: 'Hybrid', data: hybrid },
          { name: 'Unknown', data: unknown },
        ];
        optionsCopy.colors = ['black', 'green', 'yellow', 'orange', 'pink', 'grey'];
        optionsCopy.legend.title = { text: 'Color' };
        optionsCopy.title = { text: `Distribution of the open access colors of publications with DOI in ${countryLabels} according to OpenAlex` };
        optionsCopy.plotOptions.column.dataLabels = {
          enabled: true, formatter() {
            return Number(this.y).toFixed(0).concat(' %');
          }
        };
        optionsCopy.yAxis.stackLabels = {
          enabled: true, formatter() {
            return Number(this.total).toFixed(0).concat(' %');
          }
        };
        optionsCopy.tooltip = {
          headerFormat: '',
          pointFormat: '<b>Publication year {point.year}</b><br>• Access rate<br>with hosting {point.series.name}:<br>{point.y:.2f}% ({point.y_abs} / {point.y_tot})'
        };
        setOptions(optionsCopy);
        setIsLoading(false);
      };
    };
    getData();
  }, [countryCodes, countryLabels]);

  return (
    <>
      {isLoading && (
        <div
          className="graph-container text-center"
          style={{ height: '400px' }}
        >
          <Loader />
        </div>
      )}
      {!isLoading && (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      )}
    </>
  );
}

export default OAColorDistribution;
