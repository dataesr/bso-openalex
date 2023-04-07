import { SearchableSelect } from '@dataesr/react-dsfr';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from 'react';

import Loader from '../loader';

const { VITE_OPENALEX_MAILTO } = import.meta.env;

const api = 'https://api.openalex.org/works';
const sleepDuration = 1000;

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OAStatusDistribution = ({ countryCode, countryLabel }) => {
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
        format: '{text}%',
      },
      title: {
        text: 'Open access rate',
      },
    },
    credits: {
      enabled: false,
    },
  });

  useEffect(() => {
    const getData = async () => {
      if (countryCode && countryCode !== '') {
        setIsLoading(true);
        const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];
        const oaRepository = [];
        const oaPublisher = [];
        const oaRepositoryPublisher = [];
        for (const year of years) {
          const response1 = await fetch(`${api}?filter=institutions.country_code:${countryCode},publication_year:${year},has_doi:true&group_by=best_oa_location.is_oa&mailto=${VITE_OPENALEX_MAILTO}`);
          const data1 = await response1.json();
          const oaTotal = data1.group_by.find((item) => item.key === 'true').count;
          const total = data1.group_by.find((item) => item.key === 'true').count + data1.group_by.find((item) => item.key === 'unknown').count;
          const response2 = await fetch(`${api}?filter=institutions.country_code:${countryCode},publication_year:${year},has_doi:true,best_oa_location.is_oa:true&group_by=locations.source.type&mailto=${VITE_OPENALEX_MAILTO}`);
          const data2 = await response2.json();
          const y = data2.group_by.find((item) => item.key === 'repository').count;
          const z = data2.group_by.find((item) => item.key === 'journal').count;
          oaRepository.push({
            y: (oaTotal - z) / total * 100,
            y_abs: oaTotal - z,
            y_oa: oaTotal,
            y_tot: total,
            year,
          });
          oaPublisher.push({
            y: (oaTotal - y) / total * 100,
            y_abs: oaTotal - y,
            y_oa: oaTotal,
            y_tot: total,
            year,
          });
          oaRepositoryPublisher.push({
            y: (z + y - oaTotal) / total * 100,
            y_abs: oaTotal - y,
            y_oa: oaTotal,
            y_tot: total,
            year,
          });
          await sleep(sleepDuration);
        }
        const optionsCopy = JSON.parse(JSON.stringify(options));
        optionsCopy.xAxis.categories = years;
        optionsCopy.series = [
          { name: 'Publisher', data: oaPublisher },
          { name: 'Publisher & open repositories', data: oaRepositoryPublisher },
          { name: 'Open repositories', data: oaRepository },
        ];
        optionsCopy.colors = ['#ead737', '#91ae4f', '#19905b'];
        optionsCopy.title = { text: `Distribution of the open access status of publications with DOI in ${countryLabel} according to OpenAlex` };
        optionsCopy.plotOptions.column.dataLabels = {
          enabled: true,
          formatter() {
            return Number(this.y).toFixed(0).concat('%');
          }
        };
        optionsCopy.yAxis.stackLabels = {
          enabled: true,
          formatter() {
            return Number(this.total).toFixed(0).concat('%');
          }
        };
        optionsCopy.tooltip = {
          headerFormat: '',
          pointFormat: '<b>Publication year {point.year}</b><br>• Open access rate<br>with hosting {point.series.name}:<br>{point.y:.2f}% ({point.y_abs} / {point.y_tot})<br>• Total open access rate:<br>{point.stackTotal:.2f}% ({point.y_oa} / {point.y_tot})'
        };
        setOptions(optionsCopy);
        setIsLoading(false);
      }
    };
    getData();
  }, [countryCode, countryLabel]);

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

export default OAStatusDistribution;
