// ==UserScript==
// @name         Blum [SmartBot]
// @namespace    https://smartbot.black/
// @version      1.1.0
// @description  Bot for playing Blum in telegram
// @author       Smartbot Team
// @match        https://telegram.blum.codes/*
// @icon         https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65ba99c1616e21b24009b86c_blum-256.png
// @grant        none
// ==/UserScript==

(async () => {
	const RANGE = [100, 200];

	const fakeUserAgent =
		"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";

	const fakeUserAgentData = {
		brands: [
			{ brand: "Apple", version: "14" },
			{ brand: "Safari", version: "604.1" },
		],
		mobile: true,
		platform: "iOS",
	};

	Object.defineProperty(navigator, "userAgent", {
		get: () => fakeUserAgent,
	});

	Object.defineProperty(navigator, "userAgentData", {
		get: () => fakeUserAgentData,
	});

	Object.defineProperty(navigator, "platform", {
		get: () => "iPhone",
	});

	const getRandomInt = (min, max) =>
		Math.floor(Math.random() * (max - min + 1)) + min;

	// *
	const originalFetch = window.fetch;
	window.fetch = (input, init) => {
		console.log("window.fetch", input);
		if (typeof input === "string" && input.includes("/api/v1/game/claim")) {
			if (init && init.method === "POST") {
				try {
					const body = JSON.parse(init.body);
					body.points = getRandomInt(RANGE[0], RANGE[1]);
					init.body = JSON.stringify(body);
				} catch (e) {
					console.error("Error modifying request body:", e);
				}
			}
		}
		return originalFetch(input, init);
	};

	const originalOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function (
		method,
		url,
		async,
		user,
		password,
	) {
		this._url = url;
		// biome-ignore lint/style/noArguments: <explanation>
		return originalOpen.apply(this, arguments);
	};

	const originalSend = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function (body) {
		if (
			this._url.includes("/api/v1/game/claim") &&
			this._url.includes("https://game-domain.blum.codes/")
		) {
			try {
				// Изменение данных в запросе
				const parsedBody = JSON.parse(body);
				console.log("parsedBody", parsedBody);
				parsedBody.points = getRandomInt(RANGE[0], RANGE[1]);
				body = JSON.stringify(parsedBody);
			} catch (e) {
				console.error("Error modifying request body:", e);
			}
		}
		return originalSend.call(this, body);
	};
	// *
	const emulateRandomMouseClickOnCanvas = async (canvas) => {
		const rect = canvas.getBoundingClientRect();

		const x = Math.floor(Math.random() * rect.width) + rect.left;
		const y = Math.floor(Math.random() * rect.height) + rect.top;

		const mousedownEvent = new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y,
		});

		const mouseupEvent = new MouseEvent("mouseup", {
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y,
		});

		const clickEvent = new MouseEvent("click", {
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y,
		});

		canvas.dispatchEvent(mousedownEvent);
		await new Promise((res) => setTimeout(res, getRandomInt(10, 50)));
		canvas.dispatchEvent(mouseupEvent);
		canvas.dispatchEvent(clickEvent);
	};

	const game = async (step = 0) => {
		const canvas = document.querySelector(".canvas-wrapper canvas");

		if (!canvas) {
			await new Promise((res) => setTimeout(res, 100));
			if (step < 100) return game(step + 1);
		}

		for (let i = 0; i <= 10000; ++i) {
			await emulateRandomMouseClickOnCanvas(canvas);
			await new Promise((res) => setTimeout(res, getRandomInt(10, 50)));
			const btnContinue = [...document.querySelectorAll("button")].find(
				(button) => button?.innerText?.includes("Continue"),
			);
			if (btnContinue) {
				btnContinue.click();
				return;
			}
			const btnPlay = [...document.querySelectorAll("button")].find((button) =>
				button?.innerText?.includes("Play"),
			);
			if (btnPlay) {
				await new Promise((res) => setTimeout(res, getRandomInt(10, 20) * 1e3));
				btnPlay.click();
				return game();
			}
		}
	};

	while (true) {
		try {
			await new Promise((res) => setTimeout(res, 1e4));
			console.log("start cycle");

			try {
				const btnContinue = [...document.querySelectorAll("button")].find(
					(button) => button?.innerText?.includes("Continue"),
				);

				if (btnContinue) {
					btnContinue?.click();
					await new Promise((res) =>
						setTimeout(res, getRandomInt(10, 20) * 1e3),
					);
				}
			} catch (err) {
				console.error(err);
			}

			try {
				const btnClaim = [...document.querySelectorAll("button")].find(
					(button) => button?.innerText?.includes("Claim"),
				);

				if (btnClaim) {
					btnClaim?.click();
					await new Promise((res) =>
						setTimeout(res, getRandomInt(10, 20) * 1e3),
					);
				}
			} catch (err) {
				console.error(err);
			}

			try {
				const btnStart = [...document.querySelectorAll("button")].find(
					(button) => button?.innerText?.includes("Start farming"),
				);

				if (btnStart) {
					btnStart?.click();

					await new Promise((res) =>
						setTimeout(res, getRandomInt(10, 20) * 1e3),
					);
				}
			} catch (err) {
				console.error(err);
			}

			const currentPass = Number.parseInt(
				document
					.querySelector(".pass")
					?.innerText?.replace(",", "")
					.replace(".", "") ?? "0",
			);

			console.log("currentPass", currentPass);

			if (currentPass > 0) {
				document.querySelector('a[href="/game"]').click();
				try {
					await game();
				} catch (err) {
					console.error("game", err);
				} finally {
					await new Promise((res) =>
						setTimeout(res, getRandomInt(10, 20) * 1e3),
					);
					window.location.replace("/");
				}
			} else {
				await new Promise((res) =>
					setTimeout(res, getRandomInt(1, 10) * 60 * 1e3),
				);
			}
		} catch (error) {
			console.error(error);
			await new Promise((res) => setTimeout(res, 1e4));
		}
	}
})();
