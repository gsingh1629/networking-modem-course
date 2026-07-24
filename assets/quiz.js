/*
 * Lightweight interactive quiz engine for the Networking & Modem course.
 *
 * Authoring format (drop this HTML straight into any module markdown file —
 * Docsify renders inline HTML):
 *
 *   <div class="quiz">
 *   <p class="q">Which layer gets a packet to the right <em>machine</em>?</p>
 *   <ul class="options">
 *   <li data-correct="true">Network layer (L3 / IP)</li>
 *   <li>Transport layer (L4)</li>
 *   <li>Link layer (L2)</li>
 *   </ul>
 *   <div class="explain">IP addresses identify machines. Ports (L4) identify a
 *   program; MAC (L2) only reaches the next hop.</div>
 *   </div>
 *
 * Rules:
 *   - Mark the correct option(s) with data-correct="true".
 *   - Multiple correct options are allowed; the learner must pick a correct one.
 *   - The .explain block is revealed after the first answer.
 *   - Idempotent: safe to call on every Docsify page render.
 */
(function () {
  function initQuizzes() {
    var quizzes = document.querySelectorAll('.quiz');
    quizzes.forEach(function (quiz) {
      if (quiz.dataset.wired === 'true') return; // don't double-wire
      quiz.dataset.wired = 'true';

      var options = quiz.querySelectorAll('.options > li');
      var explain = quiz.querySelector('.explain');
      if (explain) explain.style.display = 'none';

      options.forEach(function (opt) {
        opt.setAttribute('role', 'button');
        opt.setAttribute('tabindex', '0');

        function choose() {
          if (quiz.dataset.answered === 'true') return;
          quiz.dataset.answered = 'true';

          var isCorrect = opt.dataset.correct === 'true';
          opt.classList.add(isCorrect ? 'correct' : 'incorrect');

          // Always reveal which option(s) were correct
          options.forEach(function (o) {
            if (o.dataset.correct === 'true') o.classList.add('correct');
            o.classList.add('locked');
          });

          if (explain) explain.style.display = 'block';

          var verdict = document.createElement('div');
          verdict.className = 'quiz-verdict ' + (isCorrect ? 'good' : 'bad');
          verdict.textContent = isCorrect ? '✓ Correct!' : '✗ Not quite — see the correct answer highlighted below.';
          quiz.insertBefore(verdict, explain || null);
        }

        opt.addEventListener('click', choose);
        opt.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
        });
      });

      // "Try again" reset
      var reset = document.createElement('button');
      reset.className = 'quiz-reset';
      reset.textContent = 'Reset';
      reset.addEventListener('click', function () {
        quiz.dataset.answered = 'false';
        var v = quiz.querySelector('.quiz-verdict');
        if (v) v.remove();
        options.forEach(function (o) {
          o.classList.remove('correct', 'incorrect', 'locked');
        });
        if (explain) explain.style.display = 'none';
      });
      quiz.appendChild(reset);
    });
  }

  // Expose for Docsify's doneEach hook
  window.initQuizzes = initQuizzes;
  // Also run once on plain load (in case used outside Docsify)
  if (document.readyState !== 'loading') { initQuizzes(); }
  else { document.addEventListener('DOMContentLoaded', initQuizzes); }
})();
