/* eslint-disable no-await-in-loop */
import { SearchableSelect } from '@dataesr/react-dsfr';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from 'react';

import Loader from '../loader';

const api = 'https://api.openalex.org/works';
const defaultCountry = 'fr';
const mailto = 'bso@recherche.gouv.fr';
const sleepDuration = 1000;

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function OAColorDistribution() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    chart: {
      type: 'column',
    },
    legend: {
      verticalAlign: 'top',
      align: 'left',
      reversed: true,
    },
    plotOptions: {
      column: {
        stacking: 'normal',
      },
    },
    xAxis: {
      title: {
        text: 'Publication year',
      },
    },
    yAxis: {
      labels: {
        format: '{text} %',
      },
      title: {
        text: 'Open access rate',
      },
    },
    credits: {
      enabled: false,
    },
  });

  const getCountries = async () => {
    const response = await fetch(`${api}?group_by=institutions.country_code`);
    const data = await response.json();
    const countries = data.group_by.filter((item) => item.key !== 'unknown').map((item) => ({ value: item.key.toLowerCase(), label: item.key_display_name, count: item.count }));
    return countries;
  };

  useEffect(() => {
    async function getData() {
      const data = await getCountries();
      setCountries(data);
      setCountry(data.find((item) => item.value === defaultCountry).value);
    }
    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (country && country !== '') {
        setIsLoading(true);
        const countryLabel = countries.find((item) => item.value === country).label;
        const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];
        const closed = [];
        const green = [];
        const gold = [];
        const bronze = [];
        const hybrid = [];
        const unknown = [];
        for (const year of years) {
          const response = await fetch(`${api}?filter=institutions.country_code:${country},publication_year:${year},has_doi:true&group_by=open_access.oa_status&mailto=${mailto}`);
          const data = await response.json();
          const total = data.group_by.reduce((acc, curr) => acc + curr.count, 0);
          closed.push((data.group_by.find((item) => item.key === 'closed').count / total) * 100);
          green.push((data.group_by.find((item) => item.key === 'green').count / total) * 100);
          gold.push((data.group_by.find((item) => item.key === 'gold').count / total) * 100);
          bronze.push((data.group_by.find((item) => item.key === 'bronze').count / total) * 100);
          hybrid.push((data.group_by.find((item) => item.key === 'hybrid').count / total) * 100);
          unknown.push((data.group_by.find((item) => item.key === 'unknown').count / total) * 100);
          await sleep(sleepDuration);
        }
        const optionsCopy = JSON.parse(JSON.stringify(options));
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
        optionsCopy.title = { text: `Distribution of the open access colors of publications with doi in ${countryLabel} according to OpenAlex` };
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
        setOptions(optionsCopy);
        setIsLoading(false);
      };
    };
    getData();
  }, [country]);

  return (
    <>
      <SearchableSelect
        onChange={(e) => setCountry(e)}
        options={countries.map((item) => ({ value: item.value, label: `${item.label} (${item.count.toLocaleString()})` }))}
        selected={country}
      />
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
