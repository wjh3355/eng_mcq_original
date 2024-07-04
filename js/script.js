var optionButtons, nextQnButton, correctAnsButton, dispExplButton, sentenceElement, explCollapseElement, qnObj;
var qnsAttempted = 0;
var tickIcon = '<i class="fa-solid fa-circle-check fa-lg green-tick"></i>';
var crossIcon = '<i class="fa-solid fa-circle-xmark fa-lg red-cross"></i>';
var qnsObjArray = [];
var qnPointer = 0;
var jsonSource = "data/source-test1.json";

document.addEventListener("DOMContentLoaded", function (event) {
	optionButtons = document.querySelectorAll(".option");
	nextQnButton = document.querySelector("#next-qn-button");
	dispExplButton = document.querySelector("#disp-expl-button");
	sentenceElement = document.querySelector("#sentence-holder");
	explCollapseElement = document.querySelector("#explanation");

	nextQnButton.addEventListener("click", initialiseQuestion);

	$ajaxUtils.sendGetRequest(jsonSource, function (responseArray) {
		console.log("Fetching question array...");

		try {

			if (!Array.isArray(responseArray) || responseArray.length === 0) {
				throw new Error("Invalid or empty response from server.");
			}

			qnsObjArray = responseArray;
			shuffleArray(qnsObjArray);
			var orderOfQns = qnsObjArray.map(qnObj => qnObj.qnNum);
			console.log(`Shuffled order of questions: \n${orderOfQns}`);

			initialiseQuestion();

		} catch (error) {
			console.error(error.message);
		}

	}, function (error) {
		console.error("Failed to fetch question data:", error);
	})
});

// ========== QUESTION UTILITIES ==========

// initialises loop
function initialiseQuestion() {
	if (qnPointer === qnsObjArray.length) {
		qnPointer = 0;
		console.log("(End of questions, looping back to first)");
	};

	console.log("Initialising qn / Next button clicked...");

	nextQnButton.disabled = true;
	dispExplButton.disabled = true;

	qnObj = qnsObjArray[qnPointer];

	resetAll();
	displayQn();
	assignOptionsRandomly();
	enableOptions();

	console.log("Waiting for option button input...");

	qnPointer++;
};

// displays sentence
function displayQn() {
	var { sentence, wordToTest } = qnObj;

	console.log("Next question:");
	console.table(qnObj);

	var startIdx = sentence.toLowerCase().indexOf(wordToTest);
	var endIdx = startIdx + wordToTest.length;

	while (endIdx < sentence.length && /[^\w\s]/.test(sentence.charAt(endIdx))) {
		endIdx++;
	}

	qnsAttempted++;

	sentenceElement.innerHTML =
		`
		<p>
    		<strong>Q${qnsAttempted}. </strong>
    		${startIdx > 0 ? sentence.substring(0, startIdx) : ''} 
    		<strong>${sentence.substring(startIdx, endIdx)}</strong>
    		${sentence.substring(endIdx)}
     	</p>
		`;

	console.log("Sentence displayed");
};

// inserts explanation
function insertExplanation() {
	var { wordToTest, expl: { type, def } } = qnObj;

	explCollapseElement.innerHTML = 
		`
		<div class="card card-body" id="explanation-holder">
			<h5><strong>${wordToTest.toLowerCase()}</strong></h5>
			<p class="fst-italic mb-2"><small>${type}</small></p>
			<p class="mb-0">${def}.</p>
		</div>
		`;

	console.log("Explanation inserted");
};

// shuffles an array
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

// ========== OPTION UTILITIES ==========

// assign options randomly to buttons, mark correct and wrong
function assignOptionsRandomly() {
	var { options, correctAns } = qnObj;

	shuffleArray(options);

	optionButtons.forEach((button, idx) => {
		var option = options[idx];
		button.innerHTML = `<p>${option}</p>`;

		if (option === correctAns) {
			// Correct option
			correctAnsButton = button;
			button.classList.add("correctAns");
			button.addEventListener("click", correctAnsHandler);
		} else {
			// Wrong option
			button.classList.add("wrongAns");
			button.addEventListener("click", wrongAnsHandler);
		}
	});

	console.log("Options randomly assigned and displayed");
};

// enable options for user interaction (darker border when hovering + clickable)
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

// reset everything for a new question
function resetAll() {
	optionButtons.forEach(button => {
		button.classList = "option";
		button.textContent = "";
		button.innerHTML = "";
		button.removeEventListener("click", correctAnsHandler);
		button.removeEventListener("click", wrongAnsHandler);
	});

	explCollapseElement.textContent = "";
	explCollapseElement.innerHTML = "";
	explCollapseElement.classList.remove('show');

	correctAnsButton = null;
	console.log("Options and explanation reset");
};

// ========== ANSWER HANDLERS ==========

// handles correct answer
function correctAnsHandler() {
	console.log(`Correct ans clicked: ${this.textContent}`);

	this.classList.add("greenBorder");
	this.insertAdjacentHTML("beforeend", tickIcon);

	insertExplanation();
	disableOptions();
	nextQnButton.disabled = false;
	dispExplButton.disabled = false;
	console.log("Waiting for next question button input...");
};

// handles wrong answer
function wrongAnsHandler() {
	console.log(`Wrong ans clicked: ${this.textContent}`);

	this.classList.add("redBorder");
	this.insertAdjacentHTML("beforeend", crossIcon);

	correctAnsButton.classList.add("greenBorder");
	correctAnsButton.insertAdjacentHTML("beforeend", tickIcon);

	insertExplanation();
	disableOptions();
	nextQnButton.disabled = false;
	dispExplButton.disabled = false;
	console.log("Waiting for next question button input...");
};
