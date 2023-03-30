import { Container, Title, Select } from '@dataesr/react-dsfr';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from 'react';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const api = 'https://api.openalex.org/works';
  const countries = [
    { value: 'fr', label: 'France' },
    { value: 'dk', label: 'Denmark' },
    { value: 'de', label: 'Germany' },
    { value: 'pt', label: 'Portugal' },
  ];
  const mailto = 'bso@recherche.gouv.fr';

  const [country, setCountry] = useState(countries[0].value);
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
    const getData = async () => {
      const oaRepository = [];
      const oaPublisher = [];
      const oaRepositoryPublisher = [];
      const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const year of years) {
        // eslint-disable-next-line no-await-in-loop
        const response1 = await fetch(`${api}?filter=institutions.country_code:${country},publication_year:${year}&group_by=best_oa_location.is_oa&mailto=${mailto}`);
        // eslint-disable-next-line no-await-in-loop
        const data1 = await response1.json();
        const oaTotal = data1.group_by.find((item) => item.key === 'true').count;
        // eslint-disable-next-line no-await-in-loop
        const response2 = await fetch(`${api}?filter=institutions.country_code:${country},publication_year:${year},best_oa_location.is_oa:true&group_by=locations.source.type&mailto=${mailto}`);
        // eslint-disable-next-line no-await-in-loop
        const data2 = await response2.json();
        const y = data2.group_by.find((item) => item.key === 'repository').count;
        const z = data2.group_by.find((item) => item.key === 'journal').count;
        oaRepository.push(oaTotal - z);
        oaPublisher.push(oaTotal - y);
        oaRepositoryPublisher.push(z + y - oaTotal);
        // eslint-disable-next-line no-await-in-loop
        await sleep(100);
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
    };
    getData();
  }, [country]);

  return (
    <Container className="fr-my-15w">
      <Title as="h1">
        BSOpenAlex
      </Title>
      <Select
        onChange={(e) => setCountry(e.target.value)}
        options={countries}
        selected={country}
      />
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </Container>
  );
}
