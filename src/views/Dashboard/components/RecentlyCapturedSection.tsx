import { useState, ChangeEvent } from 'react';
import { Card, CardBody, CardHeader, Button } from 'react-bootstrap';
import { TbScissors } from 'react-icons/tb';

type WebClipFilter = 'all' | 'today' | 'week' | 'month';

function RecentlyCapturedSection() {
  const [webClipFilter, setWebClipFilter] = useState<WebClipFilter>('all');

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setWebClipFilter(event.target.value as WebClipFilter);
  };

  return (
    <Card>
      <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0">Recently captured</h5>
          <div>
            <select
              className="form-select form-select-sm"
              style={{ minWidth: '120px' }}
              value={webClipFilter}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <Card className="border h-100">
              <CardBody className="d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                <p className="text-muted mb-0">No web clips yet</p>
              </CardBody>
            </Card>
          </div>

          <div className="col-md-4">
            <div className="text-center">
              <div
                className="avatar-lg bg-light bg-opacity-50 text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '80px', height: '80px' }}
              >
                <TbScissors className="fs-xl" />
              </div>
              <h6 className="mb-2">Save useful information from the web.</h6>
              <Button variant="light" className="text-dark">
                Clip web content
              </Button>
            </div>
          </div>

          <div className="col-md-4"></div>
        </div>
      </CardBody>
    </Card>
  );
}

export default RecentlyCapturedSection;
