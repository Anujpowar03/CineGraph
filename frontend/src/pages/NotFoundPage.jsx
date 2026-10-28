import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <div className="container-page py-24">
      <EmptyState
        icon={Compass}
        title="This page is not in the graph"
        description="The link may be broken or the page may have moved."
        action={<Link to="/" className="btn-primary">Back to CineGraph</Link>}
      />
    </div>
  );
}
