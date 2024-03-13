import { useEffect } from 'react';
import { labelTypes, start } from '../api';
import { Link } from 'react-router-dom';

export default function Image({
	loading,
	label,
}: {
	loading: boolean;
	label: labelTypes;
}) {
	useEffect(() => {
		if (!loading) {
			start('image', label);
		}
	}, [loading]);
	return (
		<>
			{!loading && <Link to='/video'>Video</Link>}
			<br />
			<input type='file' id='imageUpload' disabled={loading} />
			<div className='container'></div>
		</>
	);
}
