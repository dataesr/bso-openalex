import { API, DEFAULT_CHART_OPTIONS, EUROPE, MAILTO, SLEEP_DURATION, YEARS } from '../../config';

const countriesToApi = (countries) => {
  const apiCountries = countries.split(',').map((item) => item === 'eu' ? EUROPE : item).flat();
  return [...new Set([...apiCountries])].sort().join('|');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getDataForOaColorsDistribution = async (countryCodes) => {
  const countries = countriesToApi(countryCodes);
  const closed = [];
  const green = [];
  const gold = [];
  const bronze = [];
  const hybrid = [];
  const unknown = [];
  for (const year of YEARS) {
    const response = await fetch(`${API}?filter=institutions.country_code:${countries},publication_year:${year},has_doi:true,is_paratext:false&group_by=oa_status&mailto=${MAILTO}`);
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
    await sleep(SLEEP_DURATION);
  }
  const options = JSON.parse(JSON.stringify(DEFAULT_CHART_OPTIONS));
  options.xAxis.categories = YEARS;
  options.series = [
    { name: 'Closed', data: closed },
    { name: 'Green', data: green },
    { name: 'Gold', data: gold },
    { name: 'Bronze', data: bronze },
    { name: 'Hybrid', data: hybrid },
    { name: 'Unknown', data: unknown },
  ];
  options.colors = ['black', 'green', 'yellow', 'orange', 'pink', 'grey'];
  options.legend.title = { text: 'Color' };
  options.title = { text: `Distribution of the open access colors of publications with DOI in ${countryCodes} according to OpenAlex` };
  options.plotOptions.column.dataLabels = {
    enabled: true, formatter() {
      return Number(this.y).toFixed(0).concat(' %');
    }
  };
  options.yAxis.stackLabels = {
    enabled: true, formatter() {
      return Number(this.total).toFixed(0).concat(' %');
    }
  };
  options.tooltip = {
    headerFormat: '',
    pointFormat: '<b>Publication year {point.year}</b><br>• Access rate<br>with hosting {point.series.name}:<br>{point.y:.2f}% ({point.y_abs} / {point.y_tot})'
  };
  return options;
}

const getDataForOaStatusDistribution = async (countryCodes) => {
  const countries = countriesToApi(countryCodes);
  const oaRepository = [];
  const oaPublisher = [];
  const oaRepositoryPublisher = [];
  for (const year of YEARS) {
    const response1 = await fetch(`${API}?filter=institutions.country_code:${countries},publication_year:${year},has_doi:true,is_paratext:false&group_by=open_access.oa_status&mailto=${MAILTO}`);
    const data1 = await response1.json();
    const count = data1.group_by.find((item) => item.key === 'closed').count
      + data1.group_by.find((item) => item.key === 'green').count
      + data1.group_by.find((item) => item.key === 'bronze').count
      + data1.group_by.find((item) => item.key === 'gold').count
      + data1.group_by.find((item) => item.key === 'hybrid').count;
    const oaCount = data1.group_by.find((item) => item.key === 'green').count
      + data1.group_by.find((item) => item.key === 'bronze').count
      + data1.group_by.find((item) => item.key === 'gold').count
      + data1.group_by.find((item) => item.key === 'hybrid').count;
    const oaRepositoryCount = data1.group_by.find((item) => item.key === 'green').count;
    const response2 = await fetch(`${API}?filter=institutions.country_code:${countries},publication_year:${year},has_doi:true,is_paratext:false,open_access.is_oa:true,open_access.oa_status:!green&group_by=open_access.any_repository_has_fulltext&mailto=${MAILTO}`);
    const data2 = await response2.json();
    oaRepository.push({
      y: oaRepositoryCount / count * 100,
      y_abs: oaRepositoryCount,
      y_oa: oaCount,
      y_tot: count,
      year,
    });
    const oaRepositoryPublisherCount = data2.group_by.find((item) => item.key === 'true').count;
    oaRepositoryPublisher.push({
      y: oaRepositoryPublisherCount / count * 100,
      y_abs: oaRepositoryPublisherCount,
      y_oa: oaCount,
      y_tot: count,
      year,
    });getDataForOaStatusDistribution
    const oaPublisherCount = data2.group_by.find((item) => item.key === 'false').count;
    oaPublisher.push({
      y: oaPublisherCount / count * 100,
      y_abs: oaPublisherCount,
      y_oa: oaCount,
      y_tot: count,
      year,
    });
    await sleep(SLEEP_DURATION);
  }
  const options = JSON.parse(JSON.stringify(DEFAULT_CHART_OPTIONS));
  options.xAxis.categories = YEARS;
  options.series = [
    { name: 'Publisher', data: oaPublisher },
    { name: 'Publisher & open repositories', data: oaRepositoryPublisher },
    { name: 'Open repositories', data: oaRepository },
  ];
  options.colors = ['#ead737', '#91ae4f', '#19905b'];
  options.legend.title = { text: 'Hosting type' };
  options.title = { text: `Distribution of the open access status of publications with DOI in ${countryCodes} according to OpenAlex` };
  options.plotOptions.column.dataLabels = {
    enabled: true,
    formatter() {
      return Number(this.y).toFixed(0).concat('%');
    }
  };
  options.yAxis.stackLabels = {
    enabled: true,
    formatter() {
      return Number(this.total).toFixed(0).concat('%');
    }
  };
  options.tooltip = {
    headerFormat: '',
    pointFormat: '<b>Publication year {point.year}</b><br>• Open access rate<br>with hosting {point.series.name}:<br>{point.y:.2f}% ({point.y_abs} / {point.y_tot})<br>• Total open access rate:<br>{point.stackTotal:.2f}% ({point.y_oa} / {point.y_tot})'
  };
  return options;
}

export { getDataForOaColorsDistribution, getDataForOaStatusDistribution };
