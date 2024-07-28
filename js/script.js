var mainContentContainer, optionButtons, nextQnButton, correctAnsButton, dispExplButton, sentenceElement, collapsibleExplElement, scoreElement, wrongQnsInsertAnchor, showReviewLink, qnObj;

var tickIcon = '<i class="fa-solid fa-circle-check fa-lg green-tick"></i>';
var crossIcon = '<i class="fa-solid fa-circle-xmark fa-lg red-cross"></i>';

var qnsObjArray = [], qnsObjArrayPtr = 0;

var numQnsAttempted = 0, numCorrectAns = 0;

var loadingHtml, mainHtml;

var jsonSource = "https://gist.githubusercontent.com/wjh3355/0044ee12436ff44915daf15e45622ef2/raw/2057d5784372a208a2fe953e597869f38fa97c4a/source_441-540.json";

document.addEventListener('DOMContentLoaded', function (event) {
	mainContentContainer	= document.querySelector('#main-content-here');
	fetch('components/loading.html')
		.then(res => res.text())
		.then(txt => {
			loadingHtml = txt;
			mainContentContainer.innerHTML = loadingHtml;
			return fetch(jsonSource);
		})
		.then(res => res.json())
		.then(resArray => {
			qnsObjArray = resArray;
			shuffleArray(qnsObjArray);
			var orderOfQns = qnsObjArray.map(qnObj => qnObj.qnNum);
			console.log(`Shuffled order of questions: \n${orderOfQns}`);

			return fetch('components/main-content.html');
		})
		.then(res => res.text())
		.then(txt => {
			mainHtml = txt;
			mainContentContainer.innerHTML = mainHtml;

			optionButtons 				= document.querySelectorAll('.option');
			nextQnButton 				= document.querySelector('#next-qn-button');
			dispExplButton 			= document.querySelector('#disp-expl-button');
			sentenceElement 			= document.querySelector('#sentence-holder');
			collapsibleExplElement 	= document.querySelector('#explanation');
			scoreElement 				= document.querySelector('#score');
			wrongQnsInsertAnchor		= document.querySelector('#insert-anchor');
			showReviewLink				= document.querySelector('#show-review-link');

			nextQnButton.addEventListener('click', initialiseQuestion);
			dispExplButton.addEventListener('click', explButtonClickedHandler);
		
			scoreElement.textContent = '0 / 0 (0%)';
			
			initialiseQuestion();
		})
		.catch(error => {
			console.error('An error has occured:', error);
			fetch('components/error.html')
				.then(res => res.text())
				.then(txt => {
					mainContentContainer.innerHTML = txt;
				})
		})
		

});

// initialises loop
function initialiseQuestion() {
	if (qnsObjArrayPtr === qnsObjArray.length) {
		qnsObjArrayPtr = 0;
		// console.log('(End of questions, looping back to first)');
	};
	// console.log('%cInitialising qn / Next button clicked...', 'font-weight: bold;');
	nextQnButton.disabled = true;
	dispExplButton.disabled = true;
	qnObj = qnsObjArray[qnsObjArrayPtr];

	resetAll();
	updateScore();
	displayQnSentence();
	assignOptionsRandomly();
	enableOptions();
	// console.log('Waiting for option button input...');
	qnsObjArrayPtr++;
};

// displays sentence
function displayQnSentence() {
	var { sentence, wordToTest } = qnObj;
	// console.log('Next question:');
	// console.table(qnObj);
	sentence = sentence.replace(wordToTest, `<strong>${wordToTest}</strong>`);
	sentenceElement.innerHTML = `<p class="my-2">${sentence}</p>`;
	// console.log('Sentence displayed');
};

// inserts explanation
function insertExplanation() {
	var { rootWord, type, def } = qnObj;
	collapsibleExplElement.innerHTML = 
		`
		<div class="card card-body">
			<p>
				<strong class="fs-5 me-1">
					${rootWord}
				</strong>
				<span class="fst-italic">
					(${type})
				</span>
			</p>
			<p class="mb-0">${def}.</p>
		</div>
		`;
	// console.log('Explanation inserted');
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
	if (numQnsAttempted === 0) {return}
	var percentCorrect = (numCorrectAns/numQnsAttempted)*100;
	scoreElement.textContent = `${numCorrectAns} / ${numQnsAttempted} (${Math.round(percentCorrect)}%)`;
	// console.log('Updated score');
};

// assign options randomly to buttons, mark correct and wrong
function assignOptionsRandomly() {
	var { options, correctAns } = qnObj;
	shuffleArray(options);
	optionButtons.forEach((button, idx) => {
		var thisOption = options[idx];
		button.innerHTML = `<p class="m-0">${thisOption}</p>`;
		if (thisOption === correctAns) {
			// CORRECT OPTION
			correctAnsButton = button;
			button.addEventListener('click', correctAnsHandler);
			// console.log(`Correct answer is button ${idx+1} (${option})`);
		} else {
			// WRONG OPTION
			button.addEventListener('click', wrongAnsHandler);
		}
	});

	// console.log('All options randomly assigned and displayed');
};

// enable options for user interaction (darker border when hovering + clickable)
function enableOptions() {
	optionButtons.forEach(button => {
		button.disabled = false;
		button.classList.add('option-enabled-border');
	});
	// console.log('Options enabled');
};

// disable options once answered
function disableOptions() {
	optionButtons.forEach(button => {
		button.disabled = true;
		button.classList.remove('option-enabled-border');
	});
	// console.log('Options disabled');
};

// reset everything for a new question
function resetAll() {
	optionButtons.forEach(button => {
		button.classList = 'option';
		button.innerHTML = '';
		button.removeEventListener('click', correctAnsHandler);
		button.removeEventListener('click', wrongAnsHandler);
	});
	collapsibleExplElement.innerHTML = '';
	collapsibleExplElement.classList.remove('show');
	dispExplButton.textContent = 'Show Explanation';
	correctAnsButton = null;
	// console.log('Options and explanation reset');
};

// update wrong qn report
function updateReport(qnObj) {
	var { sentence, wordToTest, def } = qnObj;
	sentence = sentence.replace(wordToTest, `<strong class="text-danger">${wordToTest}</strong>`);
	wrongQnsInsertAnchor.insertAdjacentHTML('afterend', 
		`<div class="card card-body my-2 user-select-none">
			<p>${sentence}</p>
			<div class="text-center">
				<p class="m-0 fst-italic py-2 px-4 rounded-5 border-bottom border-2 wrong-qns-explanation-word-definition">
					<strong>${wordToTest}</strong>: ${def}.
				</p>
			</div> 
		</div>`
	);
	// console.log('Incorrect answer added to report');
	if (showReviewLink.classList.contains('disabled')) {
		showReviewLink.classList.remove('disabled');
		// console.log('Report enabled');
	}

}

// handles correct answer
function correctAnsHandler() {
	// console.log(`%cCorrect ans clicked (${this.textContent})`, 'color: green; font-weight: bold;');
	numQnsAttempted++;
	numCorrectAns++;
	this.classList.add('greenBorder');
	this.insertAdjacentHTML('beforeend', tickIcon);
	insertExplanation();
	disableOptions();
	nextQnButton.disabled = false;
	dispExplButton.disabled = false;
	// console.log('Waiting for next question button input...');
};

// handles wrong answer
function wrongAnsHandler() {
	// console.log(`%cWrong ans clicked (${this.textContent})`, 'color: red; font-weight: bold;');
	numQnsAttempted++;
	this.classList.add('redBorder');
	this.insertAdjacentHTML('beforeend', crossIcon);
	correctAnsButton.classList.add('greenBorder');
	correctAnsButton.insertAdjacentHTML('beforeend', tickIcon);
	insertExplanation();
	disableOptions();
	updateReport(qnObj);
	nextQnButton.disabled = false;
	dispExplButton.disabled = false;
	// console.log('Waiting for next question button input...');
};

// toggles text of explanation button between 'show' and 'hide'
function explButtonClickedHandler() {
	if (this.getAttribute('aria-expanded') === 'true') {
		this.textContent = 'Hide Explanation';
	} else {
		this.textContent = 'Show Explanation';
	};
};
