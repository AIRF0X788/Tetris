(function () {
	"use strict";
	const canvas = document.getElementById("tetris");
	const context = canvas.getContext("2d");
	context.scale(20, 20);
	let makeMatrix = function (w, h) {
		const matrix = [];
		while (h--) {
			matrix.push(new Array(w).fill(0));
		}
		return matrix;
	};

	let audio = new Audio('./musique.mp3');

	let makePiece = function (type) {
		if (type === "t") {
			return [
				[0, 0, 0],
				[5, 5, 5],
				[0, 5, 0]
			];
		}
		else if (type === "o") {
			return [
				[7, 7],
				[7, 7]
			];
		}
		else if (type === "l") {
			return [
				[0, 4, 0],
				[0, 4, 0],
				[0, 4, 4]
			];
		}
		else if (type === "j") {
			return [
				[0, 1, 0],
				[0, 1, 0],
				[1, 1, 0]
			];
		}
		else if (type === "i") {
			return [
				[0, 2, 0, 0],
				[0, 2, 0, 0],
				[0, 2, 0, 0],
				[0, 2, 0, 0]
			];
		}
		else if (type === "s") {
			return [
				[0, 3, 3],
				[3, 3, 0],
				[0, 0, 0]
			];
		}
		else if (type === "z") {
			return [
				[6, 6, 0],
				[0, 6, 6],
				[0, 0, 0]
			];
		}
	};
	let points = function () {
		let rowCount = 1;
		outer: for (let y = area.length - 1; y > 0; --y) {
			for (let x = 0; x < area[y].length; ++x) {
				if (area[y][x] === 0) {
					continue outer;
				}
			}
			const row = area.splice(y, 1)[0].fill(0);
			area.unshift(row);
			++y;
			player.score += rowCount * 100;
			rowCount *= 2;
		}
	}
	let collide = function (area, player) {
		const [m, o] = [player.matrix, player.pos];
		for (let y = 0; y < m.length; ++y) {
			for (let x = 0; x < m[y].length; ++x) {
				if (m[y][x] !== 0 && (area[y + o.y] && area[y + o.y][x + o.x]) !== 0) {
					return true;
				}
			}
		}
		return false;
	};
	let drawMatrix = function (matrix, offset) {
		matrix.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					let imgTag = document.createElement("IMG");
					imgTag.src = colors[value];
					context.drawImage(imgTag, x + offset.x, y + offset.y, 1, 1);
				}
			});
		});
	};
	let merge = function (area, player) {
		player.matrix.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value !== 0) {
					area[y + player.pos.y][x + player.pos.x] = value;
				}
			});
		});
	};
	let rotate = function (matrix, dir) {
		for (let y = 0; y < matrix.length; ++y) {
			for (let x = 0; x < y; ++x) {
				[
					matrix[x][y],
					matrix[y][x]
				] = [
						matrix[y][x],
						matrix[x][y],
					]
			}
		}
		if (dir > 0) {
			matrix.forEach(row => row.reverse());
		}
		else {
			matrix.reverse();
		}
	};
	let playerReset = function () {
		const pieces = "ijlostz";
		player.matrix = makePiece(pieces[Math.floor(Math.random() * pieces.length)]);
		player.pos.y = 0;
		player.pos.x = (Math.floor(area[0].length / 2)) - (Math.floor(player.matrix[0].length / 2));
		if (collide(area, player)) {
			area.forEach(row => row.fill(0));
			player.score = 0;
			gameRun = false;
		}
	};
	let playerDrop = function () {
		player.pos.y++;
		if (collide(area, player)) {
			player.pos.y--;
			merge(area, player);
			points();
			playerReset();
			updateScore();
		}
	};
	let playerMove = function (dir) {
		player.pos.x += dir;
		if (collide(area, player)) {
			player.pos.x -= dir;
		}
	};
	let playerRotate = function (dir) {
		const pos = player.pos.x;
		let offset = 1;
		rotate(player.matrix, dir);
		while (collide(area, player)) {
			player.pos.x += offset;
			offset = -(offset + (offset > 0 ? 1 : -1));
			if (offset > player.matrix[0].length) {
				rotate(player.matrix, -dir);
				player.pos.x = pos;
				return;
			}
		}
	};
	let draw = function () {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "#000000";
		context.fillRect(0, 0, canvas.width, canvas.height);
		updateScore();
		drawMatrix(area, { x: 0, y: 0 });
		drawMatrix(player.matrix, player.pos);
	};
	let dropInter = 100;
	let time = 0;
	let update = function () {
		time++;
		if (time >= dropInter) {
			playerDrop();
			time = 0;
		}
		draw();
	};
	let updateScore = function () {
		context.font = "bold 1px Comic Sans MS";
		context.fillStyle = "#ffffff";
		context.textAlign = "left";
		context.textBaseline = "top";
		context.fillText("Score:" + player.score, 0.2, 0);
	};
	
	let gameOver = function () {
		clearInterval(gameLoop);
		context.font = "2px Comic Sans MS";
		context.fillStyle = "#ffffff";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText("TetraPop", (canvas.width / 20) / 2, (canvas.width / 20) / 2);
		context.fillText("Game Over", (canvas.width / 20) / 2, (canvas.width / 15) / 1.75);
		document.getElementById("debut").disabled = false;
	};
	const colors = [
		null,
		"./cube1.png",
		"./cube2.png",
		"./cube3.png",
		"./cube4.png",
		"./cube5.png",
		"./cube6.png",
		"./cube7.png"
	];
	const area = makeMatrix(12, 20);
	const player = {
		pos: {
			x: 0,
			y: 0
		},
		matrix: null,
		score: 0
	};
	const move = 1;
	let gameLoop;
	let gameRun = false;
	playerReset();
	draw();
	gameOver();
	document.addEventListener('keydown', function (e) {
		if (e.keyCode === 37) {
			playerMove(-move);
		}
		else if (e.keyCode === 39) {
			playerMove(+move);
		}
		else if (e.keyCode === 40) {
			console.log(player.pos);
			if (gameRun) {
				playerDrop();
			}
		}
		else if (e.keyCode === 38) {
			playerRotate(-move);
		}
	});
	document.getElementById("debut").onclick = function () {
		gameRun = true;
		playerReset();
		audio.play();
		console.log(player.pos);
		gameLoop = setInterval(function () {
			if (gameRun) {
				update();
			}
			else {
				gameOver();
			}
		}, 10);
		this.disabled = true;
	};
})();