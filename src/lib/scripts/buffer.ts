class Buffer {
	buffer: Array<Array<string>>;
	width: number;
	height: number;

	constructor(width: number, height: number, background: string) {
		this.buffer = Array(height)
			.fill(0)
			.map(() => Array(width).fill(background));
		this.width = width;
		this.height = height;
	}

	setChar(x: number, y: number, val: string, className: string) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			this.buffer[y][x] =
				(className ? `<span class="${className}">` : '') + val + (className ? '</span>' : '');
		}
	}

	getChar(x: number, y: number) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			return this.buffer[y][x];
		}
		return undefined;
	}

	composite(x: number, y: number, layer: Buffer) {
		for (let i = 0; i < layer.height; i++) {
			for (let j = 0; j < layer.width; j++) {
				if ((layer.getChar(j, i)?.length ?? 0) > 0) {
					this.setChar(j + x, i + y, layer.getChar(j, i) ?? '', '');
				}
			}
		}
	}

	render() {
		return this.buffer.map((e) => e.join('')).join('\n');
	}
}

export default Buffer;
