import { LAUNCH_DARKLY } from '$env/static/private';
import * as LaunchDarkly from '@launchdarkly/node-server-sdk';

const client = LaunchDarkly.init(LAUNCH_DARKLY);

client.once('ready', function () {
	console.log('LaunchDarkly SDK successfully initialized!');
});

const context = {
	kind: 'user',
	key: 'user-key-123abc',
	name: 'Sandy'
};

let model: string;

client.on('ready', () => {
	client.variation('model', context, false, function (err, value) {
		console.log({ value });
		model = value;
	});
});

export function getModel(): string {
	return model;
}
