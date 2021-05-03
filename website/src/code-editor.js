import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import ConfusionMatrix from '@fullexpression/confusion-matrix-stats';

(function () {
    // create div to avoid needing a HtmlWebpackPlugin template
    const div = document.createElement('div');
    div.id = 'root';
    div.style = 'width:800px; height:600px; border:1px solid #ccc;';

    document.body.appendChild(div);
})();





export default class CodeEditor {
    constructor() {
        monaco.editor.create(document.getElementById('code-editor'), {
            value: `const confusionMatrix = new ConfusionMatrix({
    labels: ["Happiness", "Sadness", "Disgust"],
    matrix: [
        [50, 2, 3],
        [8, 50, 5],
        [2, 5, 50]
    ]
});

// Calculates the accuracy value for the all matrix.
const accuracy = confusionMatrix.accuracy();
console.log(\`The accuracy value is: \${accuracy}\`);

// Calculates the f1Score, only for "sadness" class, using the Macro average method.
const f1score = confusionMatrix.f1Score({
    label: "Sadness",
    average: AverageMethod.Macro
});
console.log(\`The f1Score for 'Sadness' is: \${f1score}\`);

document.getElementById('accuracy').innerHTML = accuracy;
document.getElementById('f1score').innerHTML = f1score;
`,
            language: 'javascript',
            theme: 'vs-dark',
        });
    }

    execute() {
        console.log(monaco.editor);
    }
}