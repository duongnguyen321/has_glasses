import { useLayoutEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import load, { labelTypes } from './api';
import Video from './pages/Video';
import Image from './pages/Image';
import './App.css';
import Home from './pages/Home';
export type InputTypes = 'video' | 'image';
export default function App() {
	const [loading, setLoading] = useState(true);
	const labelRef = useRef<labelTypes>();
	useLayoutEffect(() => {
		load()
			.then((label) => {
				labelRef.current = label;
			})
			.finally(() => setLoading(false));
	}, [loading]);

	return (
		<>
			<h1>{loading ? 'Waiting for loading model...' : 'Welcome!'}</h1>

			{labelRef.current && (
				<Routes>
					<Route path='/' element={<Home loading={loading} />} />
					<Route
						path='/video'
						element={<Video loading={loading} label={labelRef.current} />}
					/>
					<Route
						path='/image'
						element={<Image loading={loading} label={labelRef.current} />}
					/>
				</Routes>
			)}
		</>
	);
}
