import { Col, Container, Highlight, Row, SearchableSelect } from '@dataesr/react-dsfr';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import OAColorDistribution from '../components/charts/oa-color-distribution';
import OAStatusDistribution from '../components/charts/oa-status-distribution';

const api = 'https://api.openalex.org/works';
const mailto = 'bso@recherche.gouv.fr';

export default function Home() {
  const navigate = useNavigate();
  const { countryCode } = useParams();
  let countryLabel = '';

  const [countries, setCountries] = useState([]);

  const getCountries = async () => {
    const response = await fetch(`${api}?group_by=institutions.country_code&mailto=${mailto}`);
    const data = await response.json();
    const countries = data.group_by.filter((item) => item.key !== 'unknown').map((item) => ({ value: item.key.toLowerCase(), label: item.key_display_name, count: item.count }));
    return countries;
  };

  const changeSelectedCountry = (selectedCountryCode) => {
    if (selectedCountryCode && selectedCountryCode.length > 0) {
      navigate(`/${selectedCountryCode}`);
    }
  }

  useEffect(() => {
    async function getData() {
      const data = await getCountries();
      setCountries(data);
      countryLabel = data.find((item) => item.value === countryCode).label;
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
