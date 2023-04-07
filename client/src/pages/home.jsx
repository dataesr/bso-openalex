import { Col, Container, Highlight, Row, SearchableSelect } from '@dataesr/react-dsfr';
import { useEffect, useState } from 'react';

import OAColorDistribution from '../components/charts/oa-color-distribution';
import OAStatusDistribution from '../components/charts/oa-status-distribution';

const api = 'https://api.openalex.org/works';
const defaultCountryCode = 'fr';
const mailto = 'bso@recherche.gouv.fr';

export default function Home() {
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState();
  const [countryLabel, setCountryLabel] = useState();

  const getCountries = async () => {
    const response = await fetch(`${api}?group_by=institutions.country_code&mailto=${mailto}`);
    const data = await response.json();
    const countries = data.group_by.filter((item) => item.key !== 'unknown').map((item) => ({ value: item.key.toLowerCase(), label: item.key_display_name, count: item.count }));
    return countries;
  };

  const changeSelectedCountry = (e) => {
    if (e && e.length > 0) {
      setCountryCode(e);
      setCountryLabel(countries.find((item) => item.value === e).label);
    }
  }

  useEffect(() => {
    async function getData() {
      const data = await getCountries();
      setCountries(data);
      setCountryCode(data.find((item) => item.value === defaultCountryCode).value);
      setCountryLabel(data.find((item) => item.value === defaultCountryCode).label);
    }
    getData();
  }, []);

  return (
    <Container fluid className="fr-my-15w">
      <Highlight colorFamily="yellow-tournesol" size="sm" className="fr-ml-0 fr-my-1w">
        <i>
          The institution parsing in OpenAlex is also still in development, which results in lots af raw affiliation not matched to any country/institution, or even mismatched to a wrong country/institution.
        </i>
      </Highlight>
      <Row>
        <Col>
          <SearchableSelect
            onChange={(e) => changeSelectedCountry(e)}
            options={countries.map((item) => ({ value: item.value, label: `${item.label} (${item.count.toLocaleString()})` }))}
            selected={countryCode}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <OAStatusDistribution countryCode={countryCode} countryLabel={countryLabel} />
        </Col>
        {countryCode && (countryCode === 'fr') && (
          <Col>
            <iframe
              id="publi.general.voies-ouverture.chart-repartition-taux"
              title="Distribution of the open access rate of publications in France, with a Crossref DOI, per publication year and by OA route (observed in 2022)"
              width="100%"
              height="600"
              src="https://frenchopensciencemonitor.esr.gouv.fr/integration/en/publi.general.voies-ouverture.chart-repartition-taux?displayComment=false&displayFooter=false"></iframe>
          </Col>
        )}
      </Row>
      <Row>
        <Col>
          <OAColorDistribution countryCode={countryCode} countryLabel={countryLabel} />
        </Col>
      </Row>
    </Container>
  );
}
