import { useEffect, useState } from 'react';

import ChartWrapper from './chart-wrapper';
import { countriesToApi } from '../../utils/countries';
import { years } from '../../config.json';

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OAStatusDistribution = ({ api, countryCodes, defaultChartOptions, mailto, sleepDuration }) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});

  useEffect(() => {
    const getData = async () => {
      try {
        if (countryCodes && countryCodes !== '') {
          setIsLoading(true);
          const countries = countriesToApi(countryCodes);
          const oaRepository = [];
          const oaPublisher = [];
          const oaRepositoryPublisher = [];
          for (const year of years) {
            const response1 = await fetch(`${api}?filter=institutions.country_code:${countries},publication_year:${year},has_doi:true,is_paratext:false&group_by=oa_status&mailto=${mailto}`);
            const data1 = await response1.json();
            const total = data1.group_by.find((item) => item.key === 'closed').count
              + data1.group_by.find((item) => item.key === 'green').count
              + data1.group_by.find((item) => item.key === 'bronze').count
              + data1.group_by.find((item) => item.key === 'gold').count
              + data1.group_by.find((item) => item.key === 'hybrid').count;
            const oaTotal = data1.group_by.find((item) => item.key === 'green').count
              + data1.group_by.find((item) => item.key === 'bronze').count
              + data1.group_by.find((item) => item.key === 'gold').count
              + data1.group_by.find((item) => item.key === 'hybrid').count;
            const response2 = await fetch(`${api}?filter=institutions.country_code:${countries},publication_year:${year},has_doi:true,is_paratext:false,locations.source.type:repository&group_by=oa_status&mailto=${mailto}`);
            const data2 = await response2.json();
            const oar = data1.group_by.find((item) => item.key === 'green').count;
            oaRepository.push({
              y: oar / total * 100,
              y_abs: oar,
              y_oa: oaTotal,
              y_tot: total,
              year,
            });
            const oarp = data2.group_by.find((item) => item.key === 'bronze').count
              + data2.group_by.find((item) => item.key === 'gold').count
              + data2.group_by.find((item) => item.key === 'hybrid').count;
            oaRepositoryPublisher.push({
              y: oarp / total * 100,
              y_abs: oarp,
              y_oa: oaTotal,
              y_tot: total,
              year,
            });
            const oap = oaTotal - oar - oarp;
            oaPublisher.push({
              y: oap / total * 100,
              y_abs: oap,
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
          optionsCopy.title = { text: `Distribution of the open access status of publications with DOI in ${countryCodes} according to OpenAlex` };
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

  return (
    <ChartWrapper
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
}

export default OAStatusDistribution;
