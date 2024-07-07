var optionButtons, nextQnButton, correctAnsButton, dispExplButton, sentenceElement, explCollapseElement, accuScoreElement, qnObj;
var tickIcon = '<i class="fa-solid fa-circle-check fa-lg green-tick"></i>';
var crossIcon = '<i class="fa-solid fa-circle-xmark fa-lg red-cross"></i>';

var qnsObjArray = [];
var qnsObjArrayPtr = 0;

var numQnsAttempted = 0;
var accuScore = 0;
var wasLastQnCorrect = null;

var jsonSource = "data/source.json";

document.addEventListener("DOMContentLoaded", function (event) {
	optionButtons = document.querySelectorAll(".option");
	nextQnButton = document.querySelector("#next-qn-button");
	dispExplButton = document.querySelector("#disp-expl-button");
	sentenceElement = document.querySelector("#sentence-holder");
	explCollapseElement = document.querySelector("#explanation");
	accuScoreElement = document.querySelector("#accumulative-score");

	nextQnButton.addEventListener("click", initialiseQuestion);
	dispExplButton.addEventListener("click", explButtonClickedHandler);

	accuScoreElement.innerHTML = "0";

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
			alert("Failed to load questions. Please try again later.");
		}

	}, function (error) {
		console.error("Failed to fetch question data:", error);
		alert("Failed to fetch questions. Please check your internet connection.");
	})
});

// ========== QUESTION UTILITIES ==========

// initialises loop
function initialiseQuestion() {
	displayLoading();

	if (qnsObjArrayPtr === qnsObjArray.length) {
		qnsObjArrayPtr = 0;
		console.log("(End of questions, looping back to first)");
	};

	console.log("Initialising qn / Next button clicked...");

	nextQnButton.disabled = true;
	dispExplButton.disabled = true;

	qnObj = qnsObjArray[qnsObjArrayPtr];

	resetAll();
	updateScore();
	displayQnSentence();
	assignOptionsRandomly();
	enableOptions();

	console.log("Waiting for option button input...");

	qnsObjArrayPtr++;
};

// displays sentence
function displayQnSentence() {
	var { sentence, wordToTest } = qnObj;

	console.log("Next question:");
	console.table(qnObj);

	var startIdx = sentence.toLowerCase().indexOf(wordToTest);
	var endIdx = startIdx + wordToTest.length;

	while (endIdx < sentence.length && /[^\w\s]/.test(sentence.charAt(endIdx))) {
		endIdx++;
	}

	sentenceElement.innerHTML =
		`
		<p class="m-0">
    		<strong>Q${numQnsAttempted+1}. </strong>
    		${startIdx > 0 ? sentence.substring(0, startIdx) : ''} 
    		<strong>${sentence.substring(startIdx, endIdx)}</strong>
    		${sentence.substring(endIdx)}
     	</p>
		`;

	console.log("Sentence displayed");
};

// inserts explanation
function insertExplanation() {
	var { expl: { rootWord, type, def } } = qnObj;

	explCollapseElement.innerHTML = 
		`
		<div class="card card-body">
			<h5><strong>${rootWord}</strong></h5>
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

// refreshes accumulative score
function updateScore() {
	if (wasLastQnCorrect === null) {
		return;
	}

	if (wasLastQnCorrect) {
		accuScore = (1/numQnsAttempted)*((numQnsAttempted-1)*accuScore+100);
	} else {
		accuScore = (1/numQnsAttempted)*((numQnsAttempted-1)*accuScore);
	}

	accuScoreElement.textContent = (Math.round(accuScore)).toString();
	console.log(`Score updated: ${numQnsAttempted} attempted, ${accuScore}% correct`);
};

// displays "loading" text in sentence and options
function displayLoading() {
	sentenceElement.innerHTML = "<p class='m-0'>Loading...</p>";
	optionButtons.forEach(button => {
		button.innerHTML = "<p class='m-0'>Loading...</p>";
	});
}

// ========== OPTION UTILITIES ==========

// assign options randomly to buttons, mark correct and wrong
function assignOptionsRandomly() {
	var { options, correctAns } = qnObj;

	shuffleArray(options);

	optionButtons.forEach((button, idx) => {
		var option = options[idx];
		button.innerHTML = `<p class="m-0">${option}</p>`;

		if (option === correctAns) {
			// Correct option
			correctAnsButton = button;
			button.addEventListener("click", correctAnsHandler);
			console.log(`Correct answer is button ${idx+1} (${option})`);
		} else {
			// Wrong option
			button.addEventListener("click", wrongAnsHandler);
		}
	});

	console.log("Options randomly assigned and displayed");
};

// enable options for user interaction (darker border when hovering + clickable)
function enableOptions() {
	optionButtons.forEach(button => {
		button.disabled = false;
		button.classList.add("option-enabled-border");
	});

	console.log("Options enabled");
};

// disable options once answered
function disableOptions() {
	optionButtons.forEach(button => {
		button.disabled = true;
		button.classList.remove("option-enabled-border");
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
	explCollapseElement.classList.remove("show");

	dispExplButton.textContent = "Show Explanation";

	correctAnsButton = null;
	console.log("Options and explanation reset");
};

// ========== HANDLERS ==========

// handles correct answer
function correctAnsHandler() {
	console.log(`Correct ans clicked (${this.textContent})`);

	numQnsAttempted++;
	wasLastQnCorrect = true;

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
	console.log(`Wrong ans clicked (${this.textContent})`);

	numQnsAttempted++;
	wasLastQnCorrect = false;

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

// toggles text of explanation button between 'show' and 'hide'
function explButtonClickedHandler() {
	if (this.getAttribute("aria-expanded") === "true") {
		this.textContent = "Hide Explanation";
	} else {
		this.textContent = "Show Explanation";
	};
};
