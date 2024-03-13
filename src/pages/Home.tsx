import { Link } from 'react-router-dom';

export default function Home({ loading }: { loading: boolean }) {
	return (
		<>
			{!loading && (
				<>
					<Link to='/video'>Video</Link>
					<br />
					<Link to='/image'>Image</Link>
				</>
			)}
		</>
	);
}
