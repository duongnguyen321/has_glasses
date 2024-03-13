import * as faceapi from 'face-api.js';
import { InputTypes } from '../App';

export type labelTypes = faceapi.LabeledFaceDescriptors[];
export default async function load() {
	await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
	await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
	await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
	const labeledFaceDescriptors = await loadLabeledImages();
	return labeledFaceDescriptors;
}

export async function start(
	type: InputTypes,
	labeledFaceDescriptors: labelTypes
): Promise<number> {
	const container = document.querySelector('div.container') as HTMLDivElement;
	const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.9);
	let canvas: HTMLCanvasElement;
	let interval = 0;
	if (type === 'image') {
		const imageUpload = document.querySelector(
			'input#imageUpload'
		) as HTMLInputElement;
		let image: HTMLImageElement;
		imageUpload.addEventListener('change', async () => {
			if (image) image?.remove?.();
			if (canvas) canvas?.remove?.();
			if (!imageUpload.files || imageUpload.files.length === 0) return;
			image = await faceapi.bufferToImage(imageUpload?.files[0]);
			container.append(image);
			canvas = faceapi.createCanvasFromMedia(image);
			container.append(canvas);
			const displaySize = { width: 400, height: 400 };
			faceapi.matchDimensions(canvas, displaySize);
			const detections = await faceapi
				.detectAllFaces(image)
				.withFaceLandmarks()
				.withFaceDescriptors();
			const resizedDetections = faceapi.resizeResults(detections, displaySize);
			const results = resizedDetections.map((d) =>
				faceMatcher.findBestMatch(d.descriptor)
			);
			results.forEach((result, i) => {
				const box = resizedDetections[i].detection.box;
				const drawBox = new faceapi.draw.DrawBox(box, {
					label: result.toString(),
				});
				drawBox.draw(canvas);
			});
		});
	}
	if (type === 'video') {
		let video = document.querySelector('video#videoScreen') as HTMLVideoElement;
		video.addEventListener('play', () => {
			if (canvas) canvas?.remove?.();
			canvas = faceapi.createCanvasFromMedia(video);
			container.append(canvas);
			const displaySize = { width: 400, height: 400 };
			faceapi.matchDimensions(canvas, displaySize);
			interval = setInterval(async () => {
				const detections = await faceapi
					.detectAllFaces(video)
					.withFaceLandmarks()
					.withFaceDescriptors();
				const resizedDetections = faceapi.resizeResults(
					detections,
					displaySize
				);
				if (canvas) {
					canvas.getContext('2d')?.clearRect(0, 0, 400, 400);
				}
				const results = resizedDetections.map((d) =>
					faceMatcher.findBestMatch(d.descriptor)
				);

				results.forEach((result, i) => {
					const box = resizedDetections[i].detection.box;
					const drawBox = new faceapi.draw.DrawBox(box, {
						label: result.toString(),
					});
					drawBox.draw(canvas);
				});
			}, 200);
		});
	}
	return interval;
}

export function loadLabeledImages() {
	const labels = ['glasses', 'un_glasses'];
	let time = 5;
	const max = 11;
	return Promise.all(
		labels.map(async (label) => {
			const descriptions = [];
			for (let i = 1; i <= max; i++) {
				const img = await faceapi.fetchImage(
					`/labeled_images/${label}/${i}.jpg`
				);
				const detections = await faceapi
					.detectSingleFace(img)
					.withFaceLandmarks()
					.withFaceDescriptor();
				if (detections) descriptions.push(detections.descriptor);
				if (i === max) {
					time--;
					i = 1;
				}
				if (time <= 0) break;
			}

			return new faceapi.LabeledFaceDescriptors(label, descriptions);
		})
	);
}
