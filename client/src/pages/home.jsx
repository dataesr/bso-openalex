/* eslint-disable no-await-in-loop */
import { Container, SearchableSelect, Title } from '@dataesr/react-dsfr';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from 'react';

import Loader from '../components/Loader';

const api = 'https://api.openalex.org/works';
const mailto = 'bso@recherche.gouv.fr';

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCountries = async () => {
  const response = await fetch(`${api}?group_by=institutions.country_code`);
  const data = await response.json();
  const countries = data.group_by.filter((item) => item.key !== 'unknown').map((item) => ({ value: item.key, label: item.key_display_name, count: item.count }));
  return countries;
};

export default function Home() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    chart: {
      type: 'column',
    },
    legend: {
      reversed: true,
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
        },
      },
    },
  });

  useEffect(() => {
    async function getData() {
      const data = await getCountries();
      setCountries(data.map((item) => ({ value: item.value, label: `${item.label} (${item.count.toLocaleString()})` })));
      setCountry(data[0].value);
    }
    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (country && country !== '') {
        await getCountries();
        setIsLoading(true);
        const oaRepository = [];
        const oaPublisher = [];
        const oaRepositoryPublisher = [];
        const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];
        // eslint-disable-next-line no-restricted-syntax
        for (const year of years) {
          const response1 = await fetch(`${api}?filter=institutions.country_code:${country},publication_year:${year}&group_by=best_oa_location.is_oa&mailto=${mailto}`);
          const data1 = await response1.json();
          const oaTotal = data1.group_by.find((item) => item.key === 'true').count;
          const response2 = await fetch(`${api}?filter=institutions.country_code:${country},publication_year:${year},best_oa_location.is_oa:true&group_by=locations.source.type&mailto=${mailto}`);
          const data2 = await response2.json();
          const y = data2.group_by.find((item) => item.key === 'repository').count;
          const z = data2.group_by.find((item) => item.key === 'journal').count;
          oaRepository.push(oaTotal - z);
          oaPublisher.push(oaTotal - y);
          oaRepositoryPublisher.push(z + y - oaTotal);
          await sleep(1000);
        }
        const options2 = JSON.parse(JSON.stringify(options));
        options2.xAxis = { categories: years };
        options2.series = [
          { name: 'Publisher', data: oaPublisher },
          { name: 'Publisher & open repositories', data: oaRepositoryPublisher },
          { name: 'Open repositories', data: oaRepository },
        ];
        options2.colors = ['#ead737', '#91ae4f', '#19905b'];
        const countryLabel = countries.find((item) => item.value === country).label;
        options2.title = { text: `Distribution of the open access rate of publications in ${countryLabel} according to OpenAlex` };
        setOptions(options2);
        setIsLoading(false);
      }
    };
    getData();
  }, [country]);

  return (
    <Container className="fr-my-15w">
      <Title as="h1">
        BSOpenAlex
      </Title>
      <SearchableSelect
        onChange={(e) => setCountry(e)}
        options={countries}
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
    </Container>
  );
}
