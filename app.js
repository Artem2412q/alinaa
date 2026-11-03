(() => {
  'use strict';

  const cfg = window.QUEST_CONFIG || {};
  const recipient = String(cfg.recipient || '').trim();
  const isDemo = new URLSearchParams(location.search).get('demo') === '1';
  const storageKey = isDemo ? 'seven-steps-demo-v2' : 'seven-steps-alina-v2';
  const MAX_UPLOAD = 9 * 1024 * 1024;
  const app = document.getElementById('app');
  const parkMap = 'https://yandex.ru/maps/?text=' + encodeURIComponent('Парк 30-летия Победы, Береговая 146, Краснодар');
  const bridgeMap = 'https://yandex.ru/maps/?ll=38.957989%2C45.025314&z=17&pt=38.957989%2C45.025314%2Cpm2rdm';
  let previewUrl = null;
  let currentFile = null;
  let isPreparingPhoto = false;
  let progress = readProgress();

  const chapters = [
    {
      icon: '🐿️', title: 'Маленькое доброе дело', theme: 'Доброта', time: '15:00–15:30',
      place: 'Парк 30-летия Победы', hint: 'Ул. Береговая, 146 · начни у зелёных аллей', map: parkMap,
      task: `Алина, сегодня тебе предстоит познакомиться с одним очень милым жителем этого парка.\n\nУ него пушистый хвостик, маленькие лапки, и он очень любит орешки. Уже догадалась? 🐿️\n\nНайди белочку и понаблюдай за ней. Если увидишь разрешённую кормушку, можешь оставить немного нежареных несолёных орехов. Не пытайся кормить белку с рук и не подходи слишком близко.\n\nА теперь сфотографируй нашу маленькую героиню!`,
      photo: 'Белочка на дереве или возле кормушки.',
      fallback: 'Если белочек не встретишь, сделай селфи на фоне деревьев. Это тоже считается — живые белочки не обязаны работать по расписанию.',
      letter: `Знаешь, Алина, есть одна вещь, которую я очень люблю в тебе.\n\nЭто твоя доброта.\n\nМне нравится, как ты можешь радоваться маленьким вещам. Как умеешь быть нежной, заботливой и настоящей.\n\nИ я хочу, чтобы в твоей жизни было как можно больше поводов улыбаться.\n\nОсобенно если эти поводы буду создавать я. ❤️\n\nПервое задание выполнено. Горжусь тобой, маленькая!`
    },
    {
      icon: '🍂', title: 'Любовь прячется в мелочах', theme: 'Внимательность', time: '15:30–15:45',
      place: 'Аллеи того же парка', hint: 'Никуда далеко уходить не нужно', map: null,
      task: `Теперь давай проверим, насколько ты внимательная.\n\nГоворят, любовь можно найти где угодно. Даже там, где её совсем не ожидаешь.\n\nПосмотри вокруг себя. Найди несколько красивых опавших листочков и выложи из них сердечко на земле — там, где никому не помешаешь.\n\nБольшое или маленькое — неважно. Главное, чтобы оно было твоим.`,
      photo: 'Сердечко из опавших листьев.',
      fallback: 'Если вокруг нет листьев, сделай сердечко пальцами на фоне парка.',
      letter: `Алина, я часто думаю о том, насколько удивительно всё сложилось.\n\nКогда-то мы были просто двумя людьми, которые даже не знали о существовании друг друга.\n\nА сейчас ты человек, которому мне хочется писать первым, звонить без повода и рассказывать даже самые обычные вещи.\n\nИ знаешь что?\n\nЕсли бы мне снова пришлось выбирать, с кем начать эту историю, я бы опять выбрал тебя.\n\nТы моё любимое совпадение. ❤️`
    },
    {
      icon: '📸', title: 'Моя любимая улыбка', theme: 'Радость', time: '15:45–16:00',
      place: 'Красивая аллея или скамейка', hint: 'Оставайся в парке', map: null,
      task: `У меня к тебе есть одна маленькая просьба.\n\nВспомни наш самый смешной момент: как мы смеялись над какой-нибудь глупостью или как один из нас сказал что-то совершенно неожиданное.\n\nВспомнила?\n\nА теперь сделай селфи с самой счастливой улыбкой!\n\nТолько одно условие: никаких грустных лиц. Сегодня ты должна улыбаться!`,
      photo: 'Самое весёлое селфи этого дня.', fallback: null,
      letter: `Вот она, моя любимая улыбка!\n\nЕсли бы ты только знала, как сильно я люблю моменты, когда ты смеёшься.\n\nМне нравится смотреть на тебя, когда ты счастлива.\n\nИ самое главное, мне хочется быть человеком, который будет делать тебя счастливой не только сегодня.\n\nЯ хочу слышать твой смех и через год, и через пять, и через много-много лет.\n\nОчень люблю твою улыбку. И тебя тоже, если вдруг ты забыла. ❤️`
    },
    {
      icon: '🤍', title: 'Место для тебя', theme: 'Близость', time: '16:00–16:15',
      place: 'Тихая скамейка в парке', hint: 'Найди уютное место, где можно присесть', map: null,
      task: `А теперь найди красивую скамейку и немного отдохни.\n\nПосмотри вокруг. Представь, что прямо сейчас я сижу рядом с тобой.\n\nА теперь положи ладонь на свободное место рядом с собой, будто приглашаешь меня сесть.\n\nСохрани этот маленький момент на фотографии.`,
      photo: 'Твоя ладонь на скамейке и свободное место рядом.', fallback: 'Если свободных скамеек нет — сделай фото двух мест рядом на любой подходящей лавочке.',
      letter: `А знаешь, чего мне иногда хочется больше всего?\n\nПросто сидеть рядом с тобой.\n\nНе обязательно куда-то идти, что-то покупать или придумывать развлечения.\n\nПросто держать тебя за руку, разговаривать обо всём на свете или даже молчать.\n\nРядом с тобой мне хорошо даже тогда, когда мы ничего не делаем.\n\nИ очень скоро это место рядом с тобой перестанет быть пустым. ❤️`
    },
    {
      icon: '🌊', title: 'Желание на двоих', theme: 'Мечты', time: '16:15–16:35',
      place: 'Прогулочная дорожка у воды', hint: 'В парке 30-летия Победы, у Затона', map: null,
      task: `Пришло время загадать одно желание.\n\nНайди безопасную прогулочную дорожку, откуда открывается красивый вид на воду.\n\nОстановись на минутку, закрой глаза и представь нас через несколько лет. Где мы? Чем занимаемся? Как выглядит наша жизнь?\n\nЗагадай одно желание, связанное с нашим будущим. Только никому не говори!\n\nСфотографируй воду. Пусть на снимке останется твоё маленькое желание.`,
      photo: 'Вода, отражение неба или красивый вид на Затон.', fallback: 'Если к воде нельзя безопасно подойти, достаточно вида на неё с обычной дорожки.',
      letter: `Интересно, что ты загадала?\n\nЗнаешь, о чём иногда мечтаю я?\n\nО нашем доме. О вечерах, когда мы будем возвращаться после работы, ужинать вместе и рассказывать, как прошёл день.\n\nО совместных поездках, маленьких традициях и наших смешных фотографиях. И даже об обычных бытовых мелочах.\n\nПотому что дело не в том, где мы будем и что у нас будет.\n\nДля меня важно, чтобы рядом была ты.\n\nНадеюсь, однажды мы расскажем друг другу, какие желания загадали сегодня. ❤️`
    },
    {
      icon: '👣', title: 'Всего один шаг', theme: 'Доверие', time: '16:35–16:50',
      place: 'Аллея в сторону набережной', hint: 'Продолжай прогулку по дорожкам парка', map: null,
      task: `Ты уже почти справилась, маленькая! Осталось совсем немного.\n\nНайди красивую дорожку, которая уходит вдаль.\n\nТеперь сделай необычную фотографию: направь камеру вниз и сфотографируй свои ноги на этой дорожке.\n\nПочему именно такую фотографию? Узнаешь после отправки!`,
      photo: 'Твоя обувь и дорожка впереди.', fallback: null,
      letter: `Знаешь, почему я попросил сделать эту фотографию?\n\nПотому что каждый наш шаг куда-нибудь нас приводит.\n\nКогда-то один случайный момент привёл меня к тебе. Потом были первые встречи, разговоры, первый поцелуй и столько всего хорошего.\n\nА сейчас мы уже строим планы на будущее.\n\nЯ не знаю, сколько дорог нам ещё предстоит пройти. Но очень хочу, чтобы мы шли по ним вместе.\n\nА теперь осталось последнее задание. И поверь, оно будет особенным. ❤️`
    },
    {
      icon: '💌', title: 'Там, где встречаются сердца', theme: 'Любовь', time: '16:50–17:10',
      place: 'Мост поцелуев', hint: 'Начало моста со стороны парка 30-летия Победы', map: bridgeMap,
      task: `Алина, поздравляю! Ты добралась до финала.\n\nОсталась последняя загадка.\n\nЕсть одно место в Краснодаре, название которого связано с тем, что я очень люблю делать, когда ты рядом.\n\nПервое слово — сооружение, соединяющее два берега. Второе — то, что иногда говорит о любви лучше любых слов.\n\nДогадалась? Правильно! Мост поцелуев. ❤️\n\nПодойди к началу моста со стороны парка и сделай своё последнее селфи так, чтобы мост был виден за твоей спиной.\n\nНе переходи его, пока не отправишь фотографию!`,
      photo: 'Селфи у входа на Мост поцелуев.', fallback: 'Если проход временно ограничен, сфотографируйся на безопасном расстоянии, откуда виден мост.',
      letter: `Алина, моя любимая.\n\nВот ты и справилась со всеми семью заданиями.\n\nЯ видел твои фотографии и очень надеюсь, что сегодня ты много улыбалась.\n\nВесь этот квест я придумал ради тебя. Мне хотелось подарить тебе не просто цветы, ресторан или обычное свидание, а воспоминание.\n\nЧтобы у нас появилась ещё одна маленькая история, которую мы когда-нибудь будем вспоминать с улыбкой.\n\nЯ очень счастлив, что ты появилась в моей жизни. Спасибо тебе за нежность, заботу, улыбки и за то, что ты просто есть.\n\nА теперь у меня к тебе последняя просьба.\n\nПосмотри на другую сторону моста, в сторону Кубанской набережной.\n\nТам тебя ждёт человек, который сегодня немного волновался, пока придумывал всё это.\n\nИ ещё он очень сильно тебя любит.\n\nЭтот человек — я. ❤️\n\nИди ко мне, моя хорошая. Я тебя жду.`
    }
  ];

  function emptyProgress() { return {started:false, current:0, phase:'task', done:[], pending:null}; }
  function readProgress() {
    try { const obj = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (obj && Number.isInteger(obj.current) && obj.current >= 0 && obj.current < 7 && Array.isArray(obj.done) && ['task','letter','finished'].includes(obj.phase)) return obj; } catch (_) {}
    return emptyProgress();
  }
  function writeProgress() { try { localStorage.setItem(storageKey, JSON.stringify(progress)); return true; } catch (_) { return false; } }
  function escapeHtml(str) { return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function withParagraphs(str) { return String(str).trim().split(/\n\s*\n/).map(par => `<p>${escapeHtml(par).replace(/\n/g,'<br>')}</p>`).join(''); }
  function progressDots(filled, currentIndex) { return `<div class="progress-petals" aria-label="Выполнено ${filled} из 7 заданий">${chapters.map((_,i)=>`<span class="${i<filled?'filled':i===currentIndex?'current':''}"></span>`).join('')}</div>`; }
  function displayProgress() { const done=progress.done.length; return `<div class="progress-kicker"><span class="progress-label"><span class="little-heart">♡</span> Для Алины, с любовью</span><span>${done} / 7</span></div>${progressDots(done, progress.current)}`; }
  function demoBanner() { return isDemo ? '<div class="demo-banner">РЕЖИМ ПРОСМОТРА · Письма и фотографии не отправляются</div>' : ''; }
  function renderIntro() {
    app.innerHTML = `<div class="quest-content">${demoBanner()}<div class="progress-kicker"><span class="progress-label"><span class="little-heart">♡</span> С любовью, для тебя</span><span>7 глав</span></div>${progressDots(0,0)}<div class="chapter-icon intro-icon" aria-hidden="true">💌</div><div class="intro-caption">Маленькое приключение начинается</div><h2 class="intro-title">Привет,<br><em>моя хорошая.</em></h2><div class="intro-subtitle">Сегодня я подготовил для тебя кое-что необычное. Семь маленьких заданий, семь посланий и один секрет, который откроется только в конце.<br><br>Не пытайся угадать всё заранее. Просто доверься мне и получай удовольствие. ❤️</div><button class="button button-primary button-full" id="startQuest">Начать приключение <span aria-hidden="true">↗</span></button><div class="begin-note">📍 Краснодар · начало в 15:00<br>Понадобится телефон с камерой и немного любопытства.<br>Не спеши — это твой день.</div><p class="privacy-note">Фотографии отправляются лично Артёму через FormSubmit. Продолжая, ты соглашаешься передавать выбранные снимки для этого квеста.</p></div>`;
    document.getElementById('startQuest').addEventListener('click',()=>{progress.started=true;progress.current=0;progress.phase='task';writeProgress();render();});
  }
  function renderTask() {
    const n = progress.current, c=chapters[n];
    const map = c.map ? `<a class="place-link" href="${escapeHtml(c.map)}" target="_blank" rel="noopener noreferrer">Открыть карту ↗</a>` : '';
    const pending=progress.pending && progress.pending.step===n ? '<div class="status status-info">Если ты уже отправляла фотографию, но письмо не открылось, проверь завершение отправки и при необходимости повтори попытку. Задание осталось на месте.</div>' : '';
    const controls = isDemo ? `<button class="button button-primary button-full" id="fakeSubmit">Демо: открыть послание ♡</button><p class="privacy-note">В демо-режиме фото не требуется, ничего никуда не отправляется.</p>` : `<form class="file-form" id="uploadForm" method="POST" enctype="multipart/form-data" target="_blank" action="https://formsubmit.co/${escapeHtml(recipient)}"><input type="hidden" name="_subject" id="mailSubject" value="7 шагов навстречу"><input type="hidden" name="_next" id="returnUrl"><input type="hidden" name="_captcha" value="${cfg.disableCaptcha===false?'true':'false'}"><input type="hidden" name="_template" value="table"><input type="hidden" name="Имя" value="Алина"><input type="hidden" name="Задание" value="${n+1} из 7 — ${escapeHtml(c.title)}"><input type="hidden" name="Место" value="${escapeHtml(c.place)}"><input type="hidden" name="Дата_время" id="sentTime"><input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0"><div class="file-choice"><input class="file-input" id="photoInput" type="file" name="attachment" accept="image/*" required><label class="drop-zone" id="photoZone" for="photoInput"><span class="camera-symbol" aria-hidden="true">📷</span><b>Нажми, чтобы выбрать фотографию</b><small>Можно сделать снимок или взять из галереи</small></label></div><div class="preview" id="preview"><img id="previewImage" alt="Предпросмотр выбранного фото"><div class="preview-details"><b id="previewName"></b><span id="previewSize"></span></div><button type="button" class="preview-remove" id="removePhoto" aria-label="Убрать выбранное фото">Убрать</button></div><div class="submit-actions"><button class="button button-primary button-full" id="submitPhoto" type="submit" disabled>Отправить фото и открыть письмо <span aria-hidden="true">♡</span></button></div><div id="uploadStatus" role="status"></div><div id="uploadRecovery" class="upload-recovery" hidden><p>Если сайт отправки показал ошибку или письмо не открылось, отправь выбранное фото Артёму в обычном сообщении. После этого можно продолжить квест.</p><button type="button" class="button-ghost" id="backupContinue">Я отправила фото Артёму другим способом →</button></div><p class="privacy-note">Фото передаётся через FormSubmit. Для отправки откроется отдельная вкладка; после успешного перехода обратно ты увидишь письмо. Эта вкладка с квестом останется открытой.</p></form>`;
    app.innerHTML = `<div class="quest-content">${demoBanner()}${displayProgress()}<span class="chapter-no">Глава ${String(n+1).padStart(2,'0')} · ${escapeHtml(c.theme)}</span><div class="chapter-icon" aria-hidden="true">${c.icon}</div><h2 class="quest-title">${escapeHtml(c.title)}</h2><div class="chapter-description">Приключение продолжается. У тебя всё получится, маленькая ♡</div><div class="chapter-place"><span class="place-icon" aria-hidden="true">📍</span><div class="place-main"><strong>${escapeHtml(c.place)}</strong><small>${escapeHtml(c.hint)} · <span class="time-chip">${escapeHtml(c.time)}</span></small></div>${map}</div><div class="mini-heading">Твоё задание</div><div class="task-copy">${withParagraphs(c.task)}</div><div class="photo-task"><strong>Какую фотографию сделать</strong>${escapeHtml(c.photo)}</div>${c.fallback?`<div class="fallback-note">✨ ${escapeHtml(c.fallback)}</div>`:''}${pending}${controls}</div>`;
    if(isDemo){ document.getElementById('fakeSubmit').addEventListener('click',()=>{progress.done=Array.from(new Set([...progress.done,n])).sort((a,b)=>a-b);progress.phase='letter';writeProgress();render();}); }
    else setupPhotoForm(n,c);
  }
  function renderLetter() {
    const n=progress.current,c=chapters[n];
    app.innerHTML=`<div class="quest-content">${demoBanner()}${displayProgress()}<span class="chapter-no">Письмо ${String(n+1).padStart(2,'0')} из 7 · Только тебе</span><div class="quest-top-graphic" aria-hidden="true"><div class="round">${n===6?'💗':'💌'}</div></div><h2 class="letter-title">Для тебя,<br>маленькая...</h2><div class="letter-paper"><div class="letter-head"><span>Личное послание</span><span>♡ ${n+1} / 7</span></div><div class="letter-copy">${withParagraphs(c.letter)}</div><div class="letter-sign">С любовью, Артём ♡</div></div>${n===6?'<div class="next-panel"><span class="symbol">🌉</span><div><b>Тебя уже ждут</b><span>Посмотри в сторону Кубанской набережной. Только осторожно, не спеши на мосту.</span></div></div>':'<p class="letter-footer-note">Ещё одно сердечко сохранено. Впереди — следующая глава вашей истории.</p>'}<button type="button" class="button button-primary button-full" id="nextChapter">${n===6?'Закончить историю ❤️':'Открыть следующую главу →'}</button></div>`;
    document.getElementById('nextChapter').addEventListener('click',()=>{
      if(n===6){ progress.phase='finished'; }
      else { progress.current=n+1; progress.phase='task'; }
      writeProgress();render();
    });
  }
  function renderFinished() {
    app.innerHTML=`<div class="quest-content">${demoBanner()}<div class="progress-kicker"><span class="progress-label">♡ Твоя история</span><span>7 / 7</span></div>${progressDots(7,7)}<div class="final-firework" aria-hidden="true"><span class="confetti c1">✦</span><span class="confetti c2">♡</span><span class="confetti c3">✦</span><span class="confetti c4">♡</span><span class="final-heart">♥</span></div><h2 class="final-title">Ты дошла<br>до меня.</h2><p class="final-copy">Семь маленьких заданий — и целая история, которую теперь будем вспоминать вместе.</p><div class="final-quote">«Квест закончился. А наша история только начинается»</div><p class="final-copy">А теперь убери телефон, моя хорошая. Я тебя жду. ❤️</p><div class="micro-decor" aria-hidden="true">♡ ✦ ♡</div><div class="reset-wrap"><button class="button-ghost" id="restart">Пройти историю ещё раз</button></div></div>`;
    document.getElementById('restart').addEventListener('click',()=>{if(confirm('Начать квест с самого начала? Прогресс этой истории будет сброшен.')){ progress=emptyProgress();writeProgress();render();}});
  }

  async function maybeCompressImage(file) {
    if(!file || !file.type.startsWith('image/')) return file;
    if(file.size < 1.9 * 1024 * 1024 && /image\/(jpeg|png|webp)/.test(file.type)) return file;
    try {
      let bitmap;
      if('createImageBitmap' in window) bitmap = await createImageBitmap(file,{imageOrientation:'from-image'});
      else bitmap = await new Promise((resolve,reject)=>{
        const image=new Image(),url=URL.createObjectURL(file);
        image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};
        image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Формат не поддерживается'));};
        image.src=url;
      });
      const maxEdge=1780,scale=Math.min(1,maxEdge/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
      const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
      if(bitmap.close) bitmap.close();
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.82));
      if(!blob) return file;
      const result=new File([blob],`Alina-photo-${Date.now()}.jpg`,{type:'image/jpeg'});
      return result.size < file.size ? result : file;
    } catch(_){return file;}
  }
  function showStatus(message,kind='error') {
    const el=document.getElementById('uploadStatus'); if(!el) return;
    el.innerHTML=`<div class="status status-${kind}">${escapeHtml(message)}</div>`;
  }
  function clearPreview(resetInput=true) {
    const input=document.getElementById('photoInput'); if(input && resetInput) input.value='';
    currentFile=null;
    if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}
    document.getElementById('preview')?.classList.remove('visible');
    document.getElementById('photoZone')?.classList.remove('has-file');
    const btn=document.getElementById('submitPhoto');if(btn)btn.disabled=true;
  }
  function setupPhotoForm(n,c) {
    const form=document.getElementById('uploadForm'),input=document.getElementById('photoInput');
    const btn=document.getElementById('submitPhoto');
    input.addEventListener('change',async()=>{
      const original=input.files&&input.files[0];clearPreview(false);
      if(!original)return;
      if(!original.type.startsWith('image/')){showStatus('Выбери фотографию в формате изображения.');return;}
      isPreparingPhoto=true;btn.textContent='Готовим фотографию…';
      // clearPreview() resets the input; keep the original File in memory.
      let file=await maybeCompressImage(original);
      if(!document.getElementById('photoInput'))return;
      isPreparingPhoto=false;btn.innerHTML='Отправить фото и открыть письмо <span aria-hidden="true">♡</span>';
      if(file.size>MAX_UPLOAD){showStatus('Фото получилось слишком большим. Выбери снимок до 9 МБ или сделай скриншот фотографии.');return;}
      try{
        const list=new DataTransfer();list.items.add(file);input.files=list.files;
      }catch(_){
        // If a browser disallows replacing FileList, fall back to the source photo.
        // На некоторых версиях iOS нельзя программно изменить input.files.
        // Исходный файл всё ещё выбран, поскольку clearPreview(false) его не сбросил.
        file=original;
        if(file.size>MAX_UPLOAD){showStatus('Это фото слишком большое. Выбери снимок поменьше или отправь скриншот.');return;}
      }
      currentFile=file;
      previewUrl=URL.createObjectURL(file);
      const image=document.getElementById('previewImage');image.src=previewUrl;
      image.onerror=()=>{image.removeAttribute('src');image.alt='Фото выбрано, но браузер не может показать предпросмотр';};
      document.getElementById('previewName').textContent=file.name;
      document.getElementById('previewSize').textContent=(file.size/1024/1024).toFixed(2)+' МБ · готово к отправке';
      document.getElementById('photoZone').classList.add('has-file');
      document.getElementById('preview').classList.add('visible');
      btn.disabled=false;
      document.getElementById('uploadStatus').textContent='';
    });
    document.getElementById('removePhoto').addEventListener('click',clearPreview);
    const showRecovery=()=>{
      const panel=document.getElementById('uploadRecovery');
      if(panel)panel.hidden=false;
    };
    document.getElementById('backupContinue').addEventListener('click',()=>{
      if(!currentFile){showStatus('Для продолжения сначала выбери фотографию.');return;}
      if(!confirm('Продолжить без подтверждения FormSubmit? Используй эту кнопку только после того, как отправишь фото Артёму другим способом.'))return;
      progress.done=Array.from(new Set([...progress.done,n])).sort((a,b)=>a-b);
      progress.current=n;progress.phase='letter';progress.started=true;progress.pending=null;
      writeProgress();render();
    });
    form.addEventListener('submit',e=>{
      // Нативная отправка multipart сохраняет вложение и открывается в НОВОЙ
      // вкладке. Важно НЕ вызывать preventDefault() при успешной проверке.
      const reject=(msg)=>{e.preventDefault();showStatus(msg);};
      if(isPreparingPhoto){reject('Подожди, пока фотография подготовится.');return;}
      if(!currentFile || !input.files.length){reject('Для продолжения сначала выбери фото.');return;}
      if(currentFile.size>MAX_UPLOAD){reject('Фотография слишком большая для отправки.');return;}
      if(!recipient || !/^\S+@\S+\.\S+$/.test(recipient)){reject('Ошибка настройки отправки. Сообщи Артёму.');return;}
      const ticket= typeof crypto!=='undefined' && crypto.randomUUID ? crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
      progress.pending={step:n,ticket};
      if(!writeProgress()){progress.pending=null;reject('Браузер не разрешает сохранять прогресс. Открой страницу в обычной вкладке, не в приватном режиме.');return;}
      const next=new URL(location.href);next.search='';next.searchParams.set('received',String(n+1));next.searchParams.set('ticket',ticket);next.hash='';
      document.getElementById('returnUrl').value=next.href;
      document.getElementById('mailSubject').value='Квест Алины — фото '+(n+1)+'/7 — '+c.title;
      document.getElementById('sentTime').value=new Date().toLocaleString('ru-RU',{timeZone:'Europe/Moscow'});
      showStatus('Открываем отправку в новой вкладке. Не закрывай её, пока сервис не закончит обработку фото. Если там появилась ошибка или просьба активировать почту, сообщи Артёму.','info');
      // Если внешняя служба не работает, квест не должен навсегда блокироваться.
      setTimeout(()=>{if(progress.phase==='task'&&progress.pending?.ticket===ticket)showRecovery();},12000);
      // Никакого form.submit() — браузер делает обычный POST после submit event.
    });
  }
  function handleReturn() {
    const params=new URLSearchParams(location.search);
    const received=Number(params.get('received'));
    const ticket=params.get('ticket');
    if(received && ticket) {
      if(progress.pending && progress.pending.step===received-1 && progress.pending.ticket===ticket) {
        progress.done=Array.from(new Set([...progress.done,received-1])).sort((a,b)=>a-b);
        progress.current=received-1;progress.phase='letter';progress.started=true;progress.pending=null;
        writeProgress();
      }
      params.delete('received');params.delete('ticket');
      const cleaned=location.pathname+(params.toString()?'?'+params.toString():'')+location.hash;
      history.replaceState(null,'',cleaned);
    }
  }
  function render() {
    if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}currentFile=null;
    if(!progress.started)renderIntro();
    else if(progress.phase==='letter')renderLetter();
    else if(progress.phase==='finished')renderFinished();
    else renderTask();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function setupHelp() {
    const dialog=document.getElementById('helpDialog');
    document.getElementById('openHelp').addEventListener('click',()=>dialog.showModal());
    document.getElementById('closeHelp').addEventListener('click',()=>dialog.close());
    document.getElementById('gotIt').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  }
  handleReturn();setupHelp();render();
  window.addEventListener('storage', e=>{
    if(e.key!==storageKey || !e.newValue)return;
    const saved=readProgress();
    if(saved.current!==progress.current || saved.phase!==progress.phase || saved.done.length!==progress.done.length){
      progress=saved;render();
    }
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')return;
    const saved=readProgress();
    if(saved.current!==progress.current || saved.phase!==progress.phase || saved.done.length!==progress.done.length){
      progress=saved;render();
    }
  });
})();
