/**
 * Procedural WebAudio cues for the shop. No audio files, no network, and every
 * entry point is guarded: a browser without WebAudio simply plays nothing.
 */

export type SoundCue = 'paper' | 'glass' | 'chime' | 'room';

type AudioFactory = () => AudioContext;

let muted = false;
let context: AudioContext | null = null;
let roomStarted = false;
let factory: AudioFactory = () => new AudioContext();

function release(): void {
	const current = context;
	context = null;
	roomStarted = false;
	if (!current) return;
	try {
		void current.close().catch(() => {});
	} catch {
		// A context that cannot close is already gone.
	}
}

/** Turn procedural sound on or off. Off also releases the audio context. */
export function setSoundEnabled(enabled: boolean): void {
	muted = !enabled;
	if (muted) release();
}

/** Test seam: replace the browser context factory. */
export function setSoundContextFactory(next: AudioFactory): void {
	factory = next;
}

/** Test seam: forget the context, mute state, and factory override. */
export function resetSound(): void {
	release();
	muted = false;
	factory = () => new AudioContext();
}

function tone(
	ctx: AudioContext,
	type: OscillatorType,
	frequency: number,
	start: number,
	duration: number,
	peak: number
): void {
	const oscillator = ctx.createOscillator();
	const gain = ctx.createGain();

	oscillator.type = type;
	oscillator.frequency.setValueAtTime(frequency, start);
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + 0.02);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

	oscillator.connect(gain);
	gain.connect(ctx.destination);
	oscillator.start(start);
	oscillator.stop(start + duration + 0.02);
}

function paperNoise(ctx: AudioContext, start: number, duration: number, peak: number): void {
	const frames = Math.max(1, Math.floor(ctx.sampleRate * duration));
	const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let index = 0; index < frames; index += 1) {
		const fade = 1 - index / frames;
		data[index] = (Math.random() * 2 - 1) * fade;
	}

	const source = ctx.createBufferSource();
	const gain = ctx.createGain();
	source.buffer = buffer;
	gain.gain.setValueAtTime(peak, start);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
	source.connect(gain);
	gain.connect(ctx.destination);
	source.start(start);
	source.stop(start + duration);
}

/**
 * A low room bed that starts on the first cue and runs until sound is turned
 * off. Two detuned sines at a very low gain read as a warm room, not a drone.
 */
function startRoomBed(ctx: AudioContext): void {
	if (roomStarted) return;
	roomStarted = true;

	for (const frequency of [110, 165]) {
		try {
			const oscillator = ctx.createOscillator();
			const gain = ctx.createGain();
			oscillator.type = 'sine';
			oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
			gain.gain.setValueAtTime(0.006, ctx.currentTime);
			oscillator.connect(gain);
			gain.connect(ctx.destination);
			oscillator.start(ctx.currentTime);
		} catch {
			// One missing voice is quieter, not fatal.
		}
	}
}

function render(ctx: AudioContext, cue: SoundCue): void {
	const now = ctx.currentTime;

	switch (cue) {
		case 'paper':
			paperNoise(ctx, now, 0.16, 0.05);
			tone(ctx, 'triangle', 190, now, 0.12, 0.03);
			break;
		case 'glass':
			tone(ctx, 'sine', 1046, now, 0.14, 0.05);
			tone(ctx, 'sine', 1568, now + 0.05, 0.18, 0.04);
			break;
		case 'chime':
			tone(ctx, 'sine', 659, now, 0.85, 0.06);
			tone(ctx, 'sine', 988, now + 0.06, 0.9, 0.045);
			break;
		case 'room':
			tone(ctx, 'sine', 110, now, 0.9, 0.02);
			tone(ctx, 'sine', 165, now + 0.08, 0.8, 0.014);
			break;
	}
}

/**
 * Play one cue. Returns false when sound is muted, WebAudio is unavailable, or
 * the browser refuses to make a context. It never throws.
 */
export function playSound(cue: SoundCue): boolean {
	if (muted) return false;

	try {
		context ??= factory();
		if (!context) return false;
		if (context.state === 'suspended') void context.resume().catch(() => {});
		startRoomBed(context);
		if (cue !== 'room') render(context, cue);
		return true;
	} catch {
		return false;
	}
}
