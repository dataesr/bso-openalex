import { useEffect, useState } from 'react';

import ChartWrapper from './chart-wrapper';
import config from './config.json';

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OAStatusDistribution = ({ countryCodes, countryLabels }) => {
  const { api, defaultChartOptions, sleepDuration } = config;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});

  useEffect(() => {
    const getData = async () => {
      try {
        if (countryCodes && countryCodes !== '') {
          setIsLoading(true);
          const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];
          const oaRepository = [];
          const oaPublisher = [];
          const oaRepositoryPublisher = [];
          for (const year of years) {
            const response1 = await fetch(`${api}?filter=institutions.country_code:${countryCodes},publication_year:${year},has_doi:true&group_by=best_oa_location.is_oa&mailto=${mailto}`);
            const data1 = await response1.json();
            const oaTotal = data1.group_by.find((item) => item.key === 'true').count;
            const total = data1.group_by.find((item) => item.key === 'true').count + data1.group_by.find((item) => item.key === 'unknown').count;
            const response2 = await fetch(`${api}?filter=institutions.country_code:${countryCodes},publication_year:${year},has_doi:true,best_oa_location.is_oa:true&group_by=locations.source.type&mailto=${VITE_OPENALEX_MAILTO}`);
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
          const optionsCopy = JSON.parse(JSON.stringify(defaultChartOptions));
          optionsCopy.xAxis.categories = years;
          optionsCopy.series = [
            { name: 'Publisher', data: oaPublisher },
            { name: 'Publisher & open repositories', data: oaRepositoryPublisher },
            { name: 'Open repositories', data: oaRepository },
          ];
          optionsCopy.colors = ['#ead737', '#91ae4f', '#19905b'];
          optionsCopy.legend.title = { text: 'Hosting type' };
          optionsCopy.title = { text: `Distribution of the open access status of publications with DOI in ${countryLabels} according to OpenAlex` };
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
      } catch (error) {
        setIsError(true);
      }
    };
    getData();
  }, [countryCodes, countryLabels]);

  return (
    <ChartWrapper
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
}

export default OAStatusDistribution;
