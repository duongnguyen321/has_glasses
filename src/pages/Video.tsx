import { useEffect, useRef } from 'react';
import { labelTypes, start } from '../api';
import { Link } from 'react-router-dom';

export default function Video({
	loading,
	label,
}: {
	loading: boolean;
	label: labelTypes;
}) {
	const videoRef = useRef<HTMLVideoElement>(null);
	useEffect(() => {
		let id = 0;
		if (!loading) {
			start('video', label).then((data) => {
				id = data;
				if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
					navigator.mediaDevices
						.getUserMedia({ video: true })
						.then((stream) => {
							if (videoRef.current) videoRef.current.srcObject = stream;
						})
						.catch((err) => {
							console.error(err);
						});
				}
			});
		}
		return () => {
			clearInterval(id);
		};
	}, [loading]);
	return (
		<>
			{!loading && <Link to='/image'>Image</Link>}
			<br />
			<div className='container'>
				<video id='videoScreen' ref={videoRef} autoPlay playsInline />
			</div>
		</>
	);
}
