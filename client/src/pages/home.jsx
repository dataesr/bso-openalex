import { Container, Title } from '@dataesr/react-dsfr';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from 'react';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
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

  const api = 'https://api.openalex.org/works';
  const country = 'DK';
  const mailto = 'attwinS@gmail.com';

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
      options2.title = { text: 'Distribution of the open access rate of publications in Denmark' };
      setOptions(options2);
    };
    getData();
  }, []);

  return (
    <Container className="fr-my-15w">
      <Title as="h1">
        BSOpenAlex
      </Title>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </Container>
  );
}
