import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import Loader from '../loader';

const ChartWrapper = ({ isError, isLoading, options }) => {
  if (isLoading) {
    return (
      <div
        className="graph-container text-center"
        style={{ height: '400px' }}
      >
        <Loader />
      </div>
    );
  }
  if (isError) {
    return <>Error</>;
  }
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
    />
  )
}

export default ChartWrapper;
