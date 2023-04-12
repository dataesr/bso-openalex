import { Button, Col, Container, Highlight, Row, SearchableSelect, Tag, TagGroup } from '@dataesr/react-dsfr';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import OAColorDistribution from '../components/charts/oa-color-distribution';
import OAStatusDistribution from '../components/charts/oa-status-distribution';

const { VITE_OPENALEX_MAILTO } = import.meta.env;

const api = 'https://api.openalex.org/works';

export default function Home() {
  const navigate = useNavigate();
  let { countryCodes } = useParams();

  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(countryCodes.split(',').map((item) => item.trim()));

  const loadAllCountries = async () => {
    const response = await fetch(`${api}?group_by=institutions.country_code&mailto=${VITE_OPENALEX_MAILTO}`);
    const data = await response.json();
    const countries = data.group_by.filter((item) => item.key !== 'unknown').map((item) => ({ value: item.key.toLowerCase(), label: item.key_display_name, count: item.count }));
    return countries;
  };

  const redirect = () => {
    if (selectedCountries && selectedCountries.length > 0) {
      navigate(`/${selectedCountries.join(',')}`);
    }
  }

  const addSelectedCountry = (selectedCountry) => {
    if (selectedCountry && selectedCountry.length > 0) {
      setSelectedCountries([...new Set([...selectedCountries, selectedCountry])].sort())
    }
  }

  const removeSelectedCountry = (selectedCountry) => {
    setSelectedCountries(selectedCountries.filter((item) => item !== selectedCountry))
  }

  useEffect(() => {
    async function getData() {
      const data = await loadAllCountries();
      setCountries(data);
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
            onChange={(selectedCountry) => addSelectedCountry(selectedCountry)}
            options={countries.map((item) => ({ value: item.value, label: `${item.label} (${item.count.toLocaleString()})` }))}
            selected={countries[0]}
          />
          <TagGroup>
            {selectedCountries.map((selectedCountry) => (
              <Tag key={selectedCountry}>
                {selectedCountry}
                <Button
                  onClick={() => removeSelectedCountry(selectedCountry)}
                  icon="ri-close-line"
                  tertiary
                  hasBorder={false}
                  size="sm"
                />
              </Tag>
            ))}
          </TagGroup>
          <Button onClick={redirect}>
            Search
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <OAStatusDistribution countryCodes={countryCodes.replaceAll(',', '|')} countryLabels={countryCodes.replaceAll(',', ', ')} />
        </Col>
        {selectedCountries && selectedCountries.includes('fr') && (
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
          <OAColorDistribution countryCodes={countryCodes.replaceAll(',', '|')} countryLabels={countryCodes.replaceAll(',', ', ')} />
        </Col>
      </Row>
    </Container>
  );
}
