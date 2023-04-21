const europe = ['at', 'be', 'bg', 'cy', 'cz', 'de', 'dk', 'ee', 'es', 'fi', 'fr', 'gb', 'gr', 'hr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'si', 'se']

const countriesToApi = (countries) => {
  const apiCountries = countries.split(',').map((item) => item === 'eu' ? europe : item).flat();
  return [...new Set([...apiCountries])].sort().join('|');
}

export { countriesToApi }
