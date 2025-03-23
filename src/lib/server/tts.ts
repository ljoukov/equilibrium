import { RIME_TOKEN } from '$env/static/private';
import { concatAudio } from './ffmpeg';
import { getTempFilePath, readUint8ArrayFromTempFile, writeUint8ArrayToTempFile } from './file';

export type Speaker = 'cove' | 'juan';

async function tts({ text, speaker }: { text: string; speaker: Speaker }): Promise<Uint8Array> {
	const response = await fetch('https://users.rime.ai/v1/rime-tts', {
		method: 'POST',
		headers: {
			Accept: 'audio/mp3',
			Authorization: `Bearer ${RIME_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			speaker,
			text,
			modelId: 'mistv2',
			lang: 'eng',
			samplingRate: 22050,
			speedAlpha: 1.0,
			reduceLatency: false,
			pauseBetweenBrackets: false,
			phonemizeBetweenBrackets: false,
			inlineSpeedAlpha: '0.5, 3'
		})
	});
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return new Uint8Array(await response.arrayBuffer());
}

export async function makeDialog(dialog: { text: string; speaker: Speaker }[]) {
	const timestampStr = new Date()
		.toISOString()
		.replaceAll(':', '')
		.replaceAll('-', '')
		.replaceAll('.', '');
	const filesToJoin: string[] = [];
	try {
		// TTS and transcribe each segment
		for (const [segmentIndex, segment] of dialog.entries()) {
			const encodedAudio = await tts({
				speaker: segment.speaker,
				text: segment.text
			});
			console.log('encodedAudio', encodedAudio.length);
			const speechFileName = `handleTTS-${timestampStr}-speech-${segmentIndex.toString().padStart(5, '0')}-of-${dialog.length.toString().padStart(5, '0')}.mp3`;
			await writeUint8ArrayToTempFile(encodedAudio, speechFileName);
			filesToJoin.push(speechFileName);
		}

		// List of files to join
		const listFileName = `handleTTS-${timestampStr}-list.txt`;
		const fileListContent = filesToJoin.map((n) => `file '${getTempFilePath(n)}'`).join('\n');
		await writeUint8ArrayToTempFile(new TextEncoder().encode(fileListContent), listFileName);

		// Concatenate
		const joinedFileName = `handleTTS-${timestampStr}-joined.mp3`;
		await concatAudio({
			listFileName: getTempFilePath(listFileName),
			outputFileName: getTempFilePath(joinedFileName),
			sampleRate: 22050,
			channels: 1
		});
		const audio = await readUint8ArrayFromTempFile(joinedFileName);
		console.log(getTempFilePath(joinedFileName));

		return {
			audio
		};
	} finally {
	}
}
