class Vector2 {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	get magnitude() {
		return (this.x ** 2 + this.y ** 2) ** 0.5;
	}

	get angle() {
		return Math.atan2(this.y, this.x);
	}

	add(v: Vector2) {
		this.x += v.x;
		this.y += v.y;
	}

	sub(v: Vector2) {
		this.x -= v.x;
		this.y -= v.y;
	}

	dot(v: Vector2) {
		return this.x * v.x + this.y * v.y;
	}

	static compare(v1: Vector2, v2: Vector2) {
		return v1.x === v2.x && v1.y === v2.y;
	}
}

export default Vector2;
