# Confusion Matrix Statistics Calculations

As the name suggests, this library aims to facilitate the calculations of several different **metrics** using a **multi-dimensional confusion matrix**.

*This library was inspired on [scikit-learn confusion-matrix](https://scikit-learn.org/stable/auto_examples/model_selection/plot_confusion_matrix.html) written for python. Our goal is to create the same concept for the javascript world.*



## 🛠️ How to install

Run the following command:

`npm install confusion-matrix-stats`

## 👩‍💻 How to use it

You just need to create a new `Confusion Matrix` instance:

``` typescript
const confusionMatrix = new ConfusionMatrix({
    labels: ["Happiness", "Sadness"], 
    matrix: [[50, 2],
             [8, 50]]
});
```

And then, call the function to obtain the desired metric:

``` typescript
// Calculates the accuracy value for the all matrix.
const accuracy = confusionMatrix.accuracy();
```

For each metric calculation, is possible to define a different configurations in order to fine tune the calculation formula:

``` typescript
// Calculates the f1Score, only for "sadness" class, using the Macro average method.
const labelAccuracy = confusionMatrix.f1Score({ label: "Sadness", average: AverageMethod: Macro});
```

## 📚 Documentation

You can the library documentation [here](https://confusion-matrix-stats-doc.web.app/classes/confusionmatrix.html).

## 🤓 Give us your feedback

Please, give us your feedback [here](https://github.com/FullExpression/confusion-matrix-stats/issues)! Also, participate in this project using ricardo1992rocha@gmail.com email contact.

Thank you!