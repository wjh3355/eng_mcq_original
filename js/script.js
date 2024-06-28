var optionButtons;
var nextQnButton;
var sentenceElement;
var qnsAttempted = 0;
var tickIcon = '<i class="fa-solid fa-circle-check fa-lg green-tick"></i>';
var crossIcon = '<i class="fa-solid fa-circle-xmark fa-lg red-cross"></i>';

document.addEventListener("DOMContentLoaded", function (event) {
	optionButtons = document.querySelectorAll(".option");
	nextQnButton = document.querySelector("#next-qn-button");
	sentenceElement = document.querySelector("#sentence");

	initQn();
});

// ========== QUESTION UTILITIES ==========

function initQn() {
	console.log("=== Initialising question ===");

	resetOptions();

	$ajaxUtils.sendGetRequest("data/source.json", function(responseArray) {
		var randQnObj = fetchRandQn(responseArray);

		displayQn(randQnObj);

		assignOptionsRandomly(randQnObj);

		enableOptions();

		console.log("Waiting for input...");
	});

	nextQnButton.disabled = true;
	nextQnButton.addEventListener("click", initQn);
}

// fetch random question from response array
function fetchRandQn(responseArray) {
	if (!responseArray) {
		throw new Error("Error: Failed to fetch or parse question data.");
	}
	var randQnIdx = Math.floor(Math.random() * responseArray.length);
	// var randQnIdx = 71;
	var randQnObj = responseArray[randQnIdx];
	console.log(`Fetched random question: #${randQnObj.qnNum}`);
	return randQnObj;
}

// displays sentence
function displayQn (qnObj) {
	var { sentence, wordToTest } = qnObj;

	var startIdx = sentence.toLowerCase().indexOf(wordToTest);
	var endIdx = startIdx + wordToTest.length;

	while (endIdx < sentence.length && /[^\w\s]/.test(sentence.charAt(endIdx))) {
		endIdx++;
   }

	qnsAttempted++;

	// Display formatted sentence
	sentenceElement.innerHTML =
		`<p>
    	<strong>Q${qnsAttempted}. </strong>
    	${startIdx > 0 ? sentence.substring(0, startIdx) : ''} 
    	<strong>${sentence.substring(startIdx, endIdx)}</strong>
    	${sentence.substring(endIdx)}
     	</p>`;

	console.log("Sentence displayed");
};

// shuffles an array
function shuffle(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

// ========== ANSWER HANDLERS ==========

// handles correct answer
function correctAnsHandler() {
	console.log(`CORRECT ANS CLICKED!: ${this.textContent}`);

	this.classList.add("greenBorder");
	this.insertAdjacentHTML("beforeend", tickIcon);

	// displayExplanation();
	disableOptions();
	nextQnButton.disabled = false;
	console.log("Waiting for input...");
};

// handles wrong answer
function wrongAnsHandler() {
	console.log(`WRONG ANS CLICKED!: ${this.textContent}`);

	this.classList.add("redBorder");
	this.insertAdjacentHTML("beforeend", crossIcon);

	document.querySelector(".correctAns").classList.add("greenBorder");
	document.querySelector(".correctAns").insertAdjacentHTML("beforeend", tickIcon);

	// displayExplanation();
	disableOptions();
	nextQnButton.disabled = false;
	console.log("Waiting for input...");
};

// function displayExplanation() {
// 	// to add later
// };

// function randQnOrder() {
// 	// arrange all available qns in random order
// }

// ========== OPTION UTILITIES ==========

// assign options randomly to buttons, mark correct and wrong
function assignOptionsRandomly(qnObj) {
	var { options, correctAns } = qnObj;

	shuffle(options);

	optionButtons.forEach((button, idx) => {
		var option = options[idx];
		button.innerHTML = `<p>${option}</p>`;

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

	console.log(`Options (${options}) randomly assigned and displayed`);
}

// enable options for user interaction
function enableOptions() {
	optionButtons.forEach(button => {
		button.disabled = false;
		button.classList.add("option-enabled");
	});

	console.log("Options enabled");
};

// disable options once answered
function disableOptions() {
	optionButtons.forEach(button => {
		button.disabled = true;
		button.classList.remove("option-enabled");
	});

	console.log("Options disabled");
};

// reset options for a new question
function resetOptions() {
	optionButtons.forEach((button) => {
		button.classList = "option";
		button.textContent = "";
		button.innerHTML = "";
		button.removeEventListener("click", correctAnsHandler);
		button.removeEventListener("click", wrongAnsHandler);
	});

	console.log("Options reset");
}