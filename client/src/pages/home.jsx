import { Col, Container, Row, Title } from '@dataesr/react-dsfr';

import OAColorDistribution from '../components/charts/oa-color-distribution';
import OAStatusDistribution from '../components/charts/oa-status-distribution';

export default function Home() {
  return (
    <Container fluid className="fr-my-15w">
      <Title as="h1">
        BSO OpenAlex
      </Title>
      <Row>
        <Col>
          <OAStatusDistribution />
        </Col>
        <Col>
          <iframe
            id="publi.general.voies-ouverture.chart-repartition-taux"
            title="Distribution of the open access rate of publications in France, with a Crossref DOI, per publication year and by OA route (observed in 2022)"
            width="100%"
            height="600"
            src="https://frenchopensciencemonitor.esr.gouv.fr/integration/en/publi.general.voies-ouverture.chart-repartition-taux?displayComment=false&displayFooter=false"></iframe>
        </Col>
      </Row>
      <Row>
        <Col>
          <OAColorDistribution />
        </Col>
      </Row>
    </Container>
  );
}
