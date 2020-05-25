const express = require('express');
const basicPhrases = require('./assets/basic-phrases');
const commands = require('./assets/commands');

const port = process.env.PORT || 3002;
const app = express();

const helpWords = ['справка', 'помощь', 'что ты умеешь'];
const exitWords = ['нет', 'выйти', 'закрыть', 'завершить', 'хватит', 'достаточно'];

app.use(express.json());

app.post('/soccer-fan', function (req, res) {
    // Код для HTTP-ответа:
    let statusCode = 200;
    // Текущая сессия не закрыта:
    let isEndSession = false;
    // Намерения юзера:
    let userIntent = '';
    let comandResponse = '';
    let ttsResponse = '';

    // Получаем все данные, которые пришли нам из Яндекс.Диалогов
    const { body: { meta, request, session, version } } = req;

    // Получаем фразу пользователя и переводим в нижний регистр 
    const userUtterance = request.original_utterance.toLowerCase();

    // Сообщение юзеру (на всякий случай знак пробела, 
    // чтобы застраховаться от ошибки в Яндекс.Диалоги, если соощение окажется пустой строкой):
    let message = ' ';
    let tts = ' ';

    // Быстрый ответ (чтобы не делать лишние запросы к стороннему API) на проверочный пинг от Яндекса:
    if (userUtterance === 'ping') {
        message = 'ОК';
        isEndSession = true;
        res.json({
            version: req.body.version,
            session: req.body.session,
            response: {
                text: message,
                end_session: isEndSession
            },
        });
        return;
    }

    commands.forEach((el) => {
        if (userUtterance.indexOf(el.command) >= 0) {
            userIntent = 'play';
            comandResponse = el.answer;
            ttsResponse = el.tts;
        }
    });

    helpWords.forEach((word) => {
        if (userUtterance.indexOf(word) >= 0) {
            userIntent = 'help';
        }
    });

    exitWords.forEach((word) => {
        if (userUtterance.indexOf(word) >= 0) {
            userIntent = 'exit';
        }
    });

    // Начинаем диалог с пользователем
    if (!userUtterance) {
        // Приветствие при запуске
        message = basicPhrases.hello;
    } else if (userIntent === 'play') {
        // Отвечаем заранее подготовленным ответом на кричалку
        message = comandResponse;
        tts = ttsResponse;
    } else if (userIntent === 'help') {
        // Если пользователь запросил помощь - озвучиваем подсказку
        message = basicPhrases.hello;
    } else if (userIntent === 'exit') {
        // Если нужно выйти из навыка
        message = basicPhrases.bye;
        isEndSession = true;
    } else {
        message = basicPhrases.unknown;
    }

    res.json({
        version: version,
        session: session,
        response: {
            text: message,
            tts: ttsResponse,
            end_session: isEndSession
        },
    });

});

app.use('*', function (req, res) {
    console.log('dfd');
    res.sendStatus(404);
});

app.listen(port);