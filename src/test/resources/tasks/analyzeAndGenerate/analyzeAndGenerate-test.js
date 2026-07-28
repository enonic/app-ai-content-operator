var t = require('/lib/xp/testing');

function sampleMessage() {
    return {
        type: 'generate',
        metadata: {
            id: 'gen-1',
            timestamp: 1700000000000
        },
        payload: {
            prompt: 'Write an introduction',
            history: {
                analysis: [],
                generation: []
            },
            meta: {
                language: 'en',
                contentPath: '/site/page'
            },
            fields: {
                '/title': {
                    value: 'Hello',
                    type: 'text',
                    schemaType: 'TextLine',
                    schemaLabel: 'Title'
                },
                '/body/text': {
                    value: 'World',
                    type: 'html',
                    schemaType: 'HtmlArea',
                    schemaLabel: 'Body'
                }
            }
        }
    };
}

exports.testConfigMessageRoundTripsLosslessly = function () {
    var message = sampleMessage();
    var config = {
        socketId: 'socket-1',
        message: JSON.stringify(message)
    };

    var restored = JSON.parse(config.message);

    t.assertJsonEquals(message, restored);
    t.assertEquals(0, restored.payload.history.analysis.length);
    t.assertEquals(0, restored.payload.history.generation.length);
    t.assertNotNull(restored.payload.fields['/title']);
    t.assertNotNull(restored.payload.fields['/body/text']);
};

exports.testRunDelegatesReconstructedMessage = function () {
    var captured = {};
    t.mock('/services/ws/ws', {
        analyzeAndGenerate: function (socketId, message) {
            captured.socketId = socketId;
            captured.message = message;
        }
    });

    var task = require('/tasks/analyzeAndGenerate/analyzeAndGenerate');

    var message = sampleMessage();
    task.run({
        socketId: 'socket-1',
        message: JSON.stringify(message)
    });

    t.assertEquals('socket-1', captured.socketId);
    t.assertJsonEquals(message, captured.message);
};
