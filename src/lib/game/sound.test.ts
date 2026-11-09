import { beforeEach, describe, expect, it } from 'vitest';
import { playSound, resetSound, setSoundContextFactory, setSoundEnabled } from './sound';

interface FakeCalls {
	oscillators: number;
	gains: number;
	buffers: number;
	sources: number;
	resumed: number;
	closed: number;
}

function fakeAudio(state: AudioContext['state'] = 'running') {
	const calls: FakeCalls = {
		oscillators: 0,
		gains: 0,
		buffers: 0,
		sources: 0,
		resumed: 0,
		closed: 0
	};
	const connectable = () => {
		const node = {
			connect: () => node,
			disconnect: () => {},
			start: () => {},
			stop: () => {}
		};
		return node;
	};
	const context = {
		currentTime: 0,
		state,
		sampleRate: 44_100,
		destination: {},
		createOscillator: () => {
			calls.oscillators += 1;
			return {
				...connectable(),
				type: 'sine',
				frequency: {
					value: 0,
					setValueAtTime: () => {},
					exponentialRampToValueAtTime: () => {}
				}
			};
		},
		createGain: () => {
			calls.gains += 1;
			return {
				...connectable(),
				gain: {
					value: 0,
					setValueAtTime: () => {},
					linearRampToValueAtTime: () => {},
					exponentialRampToValueAtTime: () => {}
				}
			};
		},
		createBuffer: (_channels: number, length: number, sampleRate: number) => {
			calls.buffers += 1;
			return { getChannelData: () => new Float32Array(length), sampleRate };
		},
		createBufferSource: () => {
			calls.sources += 1;
			return { ...connectable(), buffer: null };
		},
		resume: async () => {
			calls.resumed += 1;
		},
		close: async () => {
			calls.closed += 1;
		}
	} as unknown as AudioContext;

	return { context, calls };
}

beforeEach(() => {
	resetSound();
});

describe('procedural sound', () => {
	it('does not construct an audio context when sound is off', () => {
		let built = 0;
		setSoundContextFactory(() => {
			built += 1;
			return fakeAudio().context;
		});
		setSoundEnabled(false);

		expect(playSound('paper')).toBe(false);
		expect(playSound('chime')).toBe(false);
		expect(built).toBe(0);
	});

	it('creates one context and plays every cue through it', () => {
		const { context, calls } = fakeAudio();
		let built = 0;
		setSoundContextFactory(() => {
			built += 1;
			return context;
		});
		setSoundEnabled(true);

		expect(playSound('paper')).toBe(true);
		expect(playSound('glass')).toBe(true);
		expect(playSound('chime')).toBe(true);
		expect(playSound('room')).toBe(true);

		expect(built).toBe(1);
		expect(calls.oscillators).toBeGreaterThan(0);
		expect(calls.gains).toBeGreaterThan(0);
		expect(calls.sources).toBeGreaterThan(0);
	});

	it('resumes a suspended context before playing', () => {
		const { context, calls } = fakeAudio('suspended');
		setSoundContextFactory(() => context);
		setSoundEnabled(true);

		expect(playSound('glass')).toBe(true);
		expect(calls.resumed).toBe(1);
	});

	it('never throws when the browser cannot create a context', () => {
		setSoundContextFactory(() => {
			throw new Error('no audio device');
		});
		setSoundEnabled(true);

		expect(() => playSound('chime')).not.toThrow();
		expect(playSound('chime')).toBe(false);
	});

	it('closes the context when sound is turned off', async () => {
		const { context, calls } = fakeAudio();
		setSoundContextFactory(() => context);
		setSoundEnabled(true);
		playSound('paper');

		setSoundEnabled(false);

		expect(calls.closed).toBe(1);
	});
});
