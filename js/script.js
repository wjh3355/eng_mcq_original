var optionButtons;
var nextQnButton;

document.addEventListener("DOMContentLoaded", function (event) {
	optionButtons = document.querySelectorAll(".option");
	nextQnButton = document.querySelector("#next-qn-button");

	initQn();
});

// ========== QUESTION UTILITIES ==========

function initQn() {
	resetOptions();
	$ajaxUtils.sendGetRequest("data/source.json", function(responseArray) {
		var randQnObj = fetchRandQn(responseArray);

		displayQn(randQnObj);

		enableOptions();
	});

	nextQnButton.disabled = true;
	nextQnButton.addEventListener("click", initQn);
}

function fetchRandQn(responseArray) {
	if (!responseArray) {
		console.error("Error: Failed to fetch or parse question data.");
		return;
	} else {
		var randQnIdx = Math.floor(Math.random() * responseArray.length);
		return responseArray[randQnIdx];
	}
}

function displayQn (qnObj) {
	var { qnNum, sentence, wordToTest, options, correctAns } = qnObj;

	document.querySelector("#qn-number").textContent = `#${qnNum}`;

	var wordToTestIdx = sentence.indexOf(wordToTest);

	// Display formatted sentence
	document.querySelector("#sentence").innerHTML =
		`<p>${sentence.substring(0, wordToTestIdx)}<strong>${wordToTest}</strong>
        ${sentence.substring(wordToTestIdx + wordToTest.length)}</p>`;

	assignOptionsRandomly(options, correctAns);
};

function shuffle(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

// ========== ANSWER HANDLERS ==========

function correctAnsHandler() {
	this.classList.add("greenBorder");


	// displayExplanation();
	disableOptions();
	nextQnButton.disabled = false;
};

function wrongAnsHandler() {
	this.classList.add("redBorder");

	document.querySelector(".correctAns").classList.add("greenBorder");

	// displayExplanation();
	disableOptions();
	nextQnButton.disabled = false;
};

// function displayExplanation() {
// 	// to add later
// };

// ========== OPTION UTILITIES ==========

function assignOptionsRandomly(options, correctAns) {
	shuffle(options);

	optionButtons.forEach((button, idx) => {
		var option = options[idx];
		button.textContent = option;

		if (option === correctAns) {
			// Correct option
			button.classList.add("correctAns");
			button.addEventListener("click", correctAnsHandler);
		} else {
			// Wrong option
			button.classList.add("wrongAns");
			button.addEventListener("click", wrongAnsHandler);
		}
	});
}

function enableOptions() {
	optionButtons.forEach(button => {
		button.disabled = false;
		button.classList.add("option-enabled");
	});
};

function disableOptions() {
	optionButtons.forEach(button => {
		button.disabled = true;
		button.classList.remove("option-enabled");
	});
};

function resetOptions() {
	optionButtons.forEach((button) => {
		button.classList = 'option';
		button.removeEventListener("click", correctAnsHandler);
		button.removeEventListener("click", wrongAnsHandler);
	});
}