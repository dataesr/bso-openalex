export const API = 'https://api.openalex.org/works';
export const DEFAULT_CHART_OPTIONS = {
  "chart": { "type": "column" },
  "legend": { "align": "left", "reversed": true, "verticalAlign": "top" },
  "plotOptions": { "column": { "stacking": "normal" }},
  "xAxis": { "title": { "text": "Publication year" }},
  "yAxis": { "labels": { "format": "{text}%" }, "title": { "text": "Open access rate" }},
  "credits": { "enabled": false }
};
export const EUROPE = ['at', 'be', 'bg', 'cy', 'cz', 'de', 'dk', 'ee', 'es', 'fi', 'fr', 'gb', 'gr', 'hr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'si', 'se']
export const MAILTO = 'bso@recherche.gouv.fr';
export const SLEEP_DURATION = 1000;
export const YEARS = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];