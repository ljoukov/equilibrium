import { LAUNCH_DARKLY } from '$env/static/private';
import { init, type LDContext } from '@launchdarkly/node-server-sdk';
import { initAi, type LDAIClient } from '@launchdarkly/server-sdk-ai';

const ldClient = init(LAUNCH_DARKLY);

try {
	await ldClient.waitForInitialization({ timeout: 10 });
	// initialization complete
} catch (error) {
	// timeout or SDK failed to initialize
}

const aiClient: LDAIClient = initAi(ldClient);

const context: LDContext = {
	kind: 'user',
	key: 'example-user-key',
	name: 'Sandy'
};

const variables = { username: 'john' };

const defaultValue = {
	enabled: false
};

const result = aiClient.config(LAUNCH_DARKLY, context, defaultValue, variables);
console.log({ result });
