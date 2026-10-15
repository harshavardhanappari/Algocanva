import { Link } from 'react-router-dom';
import { EmptyState } from '../components/UI.jsx';

export default function NotFound() {
  return (
    <EmptyState title="404 — page not found" action={<Link to="/" className="btn-primary">Back to home</Link>}>
      The page you are looking for doesn't exist.
    </EmptyState>
  );
}
