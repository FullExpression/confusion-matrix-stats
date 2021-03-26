!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var i=e();for(var s in i)("object"==typeof exports?exports:t)[s]=i[s]}}(self,(function(){return(()=>{"use strict";var t={975:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.AverageMethod=e.ConfusionMatrix=void 0;class i{constructor(t,e){this._labels=new Array,this._matrix=new Array,this.normalizations=new Array,this.history=new Array,this.historyPointer=-1,this.lastHistoryEvent=null,t&&(this._labels=this.deepCopy(t.labels),this._matrix=this.deepCopy(t.matrix),this.addToHistory()),e||this.validate()}set labels(t){this._labels=t,this.addToHistory()}get labels(){return this._labels}set matrix(t){this.addToHistory(),this._matrix=t}get matrix(){return this._matrix}setConfusionMatrix(t,e=!0){return t&&(this._labels=this.deepCopy(t._labels),this._matrix=this.deepCopy(t._matrix),e&&this.addToHistory()),this.validate(),this}normalize(t=0,e=1,s){if(t>=e)throw new Error("Min value cannot be equal or greater than max value.");this.validate();const r=this.getMinAndMax();if(r){this.addToHistory(),this.normalizations.push(new i(this));const a=r.min,l=r.max;for(let i=0;i<this._matrix.length;i++)for(let r=0;r<this._matrix[i].length;r++){const o=this._matrix[i][r];this._matrix[i][r]=(o-a)/(l-a)*(e-t)+t,null!=s&&(this._matrix[i][r]=+this._matrix[i][r].toFixed(s))}}return this}accuracy(t={average:s.Weighted}){return this.validate(),t.label&&t.label.length>0?this.labelAccuracy(t.label):this.matrixAccuracy(t.average)}labelAccuracy(t){this.validate();const{truePositive:e,trueNegative:i,falsePositive:s,falseNegative:r}=this.getConfusionMatrixClasses(t);return(e+i)/(e+i+s+r)||0}matrixAccuracy(t=s.Weighted){switch(this.validate(),t){case s.Micro:return this.microAccuracy();case s.Macro:return this.macroAccuracy();case s.Weighted:return this.weightedAccuracy()}}microAccuracy(){const{truePositive:t,trueNegative:e,falsePositive:i,falseNegative:s}=this.getSumConfusionMatrixClasses();return(t+e)/(t+e+i+s)||0}macroAccuracy(){let t=0;return this._labels.forEach((e=>t+=this.labelAccuracy(e))),t/this._labels.length||0}weightedAccuracy(){const t=this.getLabelsPredictionsSum(),e=this.getNumberOfPredictions();let i=0;return this._labels.forEach(((e,s)=>i+=this.labelAccuracy(e)*t[s])),i/e||0}missClassificationRate(t={average:s.Weighted}){return this.validate(),(null==t?void 0:t.label)&&(null==t?void 0:t.label.length)>0?this.labelMissClassificationRate(t.label):this.matrixMissClassificationRate(null==t?void 0:t.average)}labelMissClassificationRate(t){this.validate();const{truePositive:e,trueNegative:i,falsePositive:s,falseNegative:r}=this.getConfusionMatrixClasses(t);return(s+r)/(e+i+s+r)||0}matrixMissClassificationRate(t=s.Weighted){switch(this.validate(),t){case s.Micro:return this.microMissClassificationRate();case s.Macro:return this.macroMissClassificationRate();case s.Weighted:return this.weightedMissClassificationRate()}}microMissClassificationRate(){const{truePositive:t,trueNegative:e,falsePositive:i,falseNegative:s}=this.getSumConfusionMatrixClasses();return(i+s)/(t+e+i+s)||0}macroMissClassificationRate(){let t=0;return this._labels.forEach((e=>t+=this.labelMissClassificationRate(e))),t/this._labels.length||0}weightedMissClassificationRate(){const t=this.getLabelsPredictionsSum(),e=this.getNumberOfPredictions();let i=0;return this._labels.forEach(((e,s)=>i+=this.labelMissClassificationRate(e)*t[s])),i/e||0}precision(t={average:s.Weighted}){return this.validate(),(null==t?void 0:t.label)&&(null==t?void 0:t.label.length)>0?this.labelPrecision(t.label):this.matrixPrecision(null==t?void 0:t.average)}labelPrecision(t){this.validate();const{truePositive:e,falsePositive:i}=this.getConfusionMatrixClasses(t);return e/(e+i)||0}matrixPrecision(t=s.Weighted){switch(this.validate(),t){case s.Micro:return this.microPrecision();case s.Macro:return this.macroPrecision();case s.Weighted:return this.weightedPrecision()}}microPrecision(){const{truePositive:t,falsePositive:e}=this.getSumConfusionMatrixClasses();return t/(t+e)||0}macroPrecision(){let t=0;return this._labels.forEach((e=>t+=this.labelPrecision(e))),t/this._labels.length||0}weightedPrecision(){const t=this.getLabelsPredictionsSum(),e=this.getNumberOfPredictions();let i=0;return this._labels.forEach(((e,s)=>i+=this.labelPrecision(e)*t[s])),i/e||0}recall(t={average:s.Weighted}){return this.validate(),(null==t?void 0:t.label)&&(null==t?void 0:t.label.length)>0?this.labelRecall(t.label):this.matrixRecall(null==t?void 0:t.average)}labelRecall(t){this.validate();const{truePositive:e,falseNegative:i}=this.getConfusionMatrixClasses(t);return e/(e+i)||0}matrixRecall(t=s.Weighted){switch(this.validate(),t){case s.Micro:return this.microRecall();case s.Macro:return this.macroRecall();case s.Weighted:return this.weightedRecall()}}microRecall(){const{truePositive:t,falseNegative:e}=this.getSumConfusionMatrixClasses();return t/(t+e)||0}macroRecall(){let t=0;return this._labels.forEach((e=>t+=this.labelRecall(e))),t/this._labels.length||0}weightedRecall(){const t=this.getLabelsPredictionsSum(),e=this.getNumberOfPredictions();let i=0;return this._labels.forEach(((e,s)=>i+=this.labelRecall(e)*t[s])),i/e||0}specificity(t={average:s.Weighted}){return this.validate(),(null==t?void 0:t.label)&&(null==t?void 0:t.label.length)>0?this.labelSpecificity(t.label):this.matrixSpecificity(null==t?void 0:t.average)}matrixSpecificity(t=s.Weighted){switch(this.validate(),t){case s.Micro:return this.microSpecificity();case s.Macro:return this.macroSpecificity();case s.Weighted:return this.weightedSpecificity()}}microSpecificity(){const{trueNegative:t,falsePositive:e}=this.getSumConfusionMatrixClasses();return t/(t+e)||0}macroSpecificity(){let t=0;return this._labels.forEach((e=>t+=this.labelSpecificity(e))),t/this._labels.length||0}weightedSpecificity(){const t=this.getLabelsPredictionsSum(),e=this.getNumberOfPredictions();let i=0;return this._labels.forEach(((e,s)=>i+=this.labelSpecificity(e)*t[s])),i/e||0}labelSpecificity(t){this.validate();const{trueNegative:e,falsePositive:i}=this.getConfusionMatrixClasses(t);return e/(e+i)||0}f1Score(t){return this.validate(),(null==t?void 0:t.label)&&(null==t?void 0:t.label.length)>0?this.labelF1Score(t.label):this.matrixF1Score(null==t?void 0:t.average)}matrixF1Score(t=s.Weighted){switch(this.validate(),t){case s.Micro:return this.microF1Score();case s.Macro:return this.macroF1Score();case s.Weighted:return this.weightedF1Score()}}labelF1Score(t){this.validate();const e=this.precision({label:t}),i=this.recall({label:t});return e*i/(e+i)*2||0}microF1Score(){const t=this.microPrecision(),e=this.microRecall();return this.applyF1ScoreFormula(t,e)}macroF1Score(){let t=0;return this._labels.forEach((e=>t+=this.labelF1Score(e))),t/this._labels.length||0}weightedF1Score(){const t=this.getLabelsPredictionsSum(),e=this.getNumberOfPredictions();let i=0;return this._labels.forEach(((e,s)=>i+=this.labelF1Score(e)*t[s])),i/e||0}getAllMatrixClasses(){this.validate();const t=new Array;return this._labels.forEach((e=>t.push({label:e,confusionMatrixClasses:this.getConfusionMatrixClasses(e)}))),t}getSumConfusionMatrixClasses(){const t={truePositive:0,trueNegative:0,falsePositive:0,falseNegative:0};return this.getAllMatrixClasses().forEach((e=>{t.truePositive+=e.confusionMatrixClasses.truePositive,t.trueNegative+=e.confusionMatrixClasses.trueNegative,t.falsePositive+=e.confusionMatrixClasses.falsePositive,t.falseNegative+=e.confusionMatrixClasses.falseNegative})),t}getConfusionMatrixClasses(t){if(this.validate(),!t)throw new Error("A valid label should be passed.");const e=this._labels.findIndex((e=>e===t));if(-1==e)throw new Error("The label does not exists in the matrix.");const i=this.getNumberOfPredictions(),s=this._matrix[e][e],r=this._matrix[e].reduce(((t,e)=>t+e))-s;let a=0;for(let t=0;t<this._matrix.length;t++)a+=this._matrix[t][e];return a-=s,{truePositive:s,trueNegative:i-s-r-a,falsePositive:r,falseNegative:a}}revertNormalization(){const t=this.normalizations.pop();return t?(this.addToHistory(),this.setConfusionMatrix(t),t):null}clone(t=!1){const e=new i(void 0,!0);return e._labels=this.deepCopy(this._labels),e._matrix=this.deepCopy(this._matrix),e.normalizations=this.deepCopy(this.normalizations),t||(e.history=this.deepCopy(this.history),e.historyPointer=this.deepCopy(this.historyPointer)),e}getMinAndMax(){let t=this._matrix[0][0],e=this._matrix[0][0];if(!t||!e)return null;for(let i of this._matrix)for(let s of i)e=e<s?s:e,t=t>s?s:t;return{min:t,max:e}}revertAllNormalizations(){return this.normalizations&&this.normalizations.length>0?this.setConfusionMatrix(this.normalizations[0]):this}getNumberOfPredictions(t){const e=this.getLabelsPredictionsSum();return t&&t.length>0?e[this._labels.findIndex((e=>e===t))]:e.reduce(((t,e)=>t+e))}getLabelsPredictionsSum(){let t=new Array(this._labels.length).fill(0,0,this._labels.length);return this._matrix.forEach((e=>e.forEach(((e,i)=>{t[i]+=e})))),t}validate(){if(this._labels.length!==this._matrix.length)throw new Error("The labels length should be equals to the matrix columns length.");for(let t=0;t<this._labels.length-1;t++)for(let e=t+1;e<this._labels.length;e++)if(this._labels[t]===this._labels[e])throw new Error(`The label ${this._labels[t]} appears more than once in the labels array.`);return this._matrix.forEach((t=>{if(t.length!==this._matrix.length)throw new Error("The confusion matrix does not have the columns/rows length.")})),this}transpose(){return this.addToHistory(),this._matrix=this._matrix[0].map(((t,e)=>this._matrix.map((t=>t[e])))),this}isUndoAvailable(){return this.historyPointer>-1&&this.history.length>1}undo(){if(this.isUndoAvailable())return"redo"===this.lastHistoryEvent&&this.historyPointer--,this.historyPointer===this.history.length-1&&(this.historyPointer=this.history.length-2),this.setConfusionMatrix(this.history[this.historyPointer],!1),this.historyPointer--,this.lastHistoryEvent="undo",this}isRedoAvailable(){return this.history.length>1&&this.historyPointer<this.history.length-1}redo(){if(this.isRedoAvailable())return"undo"===this.lastHistoryEvent&&this.historyPointer++,this.historyPointer++,this.setConfusionMatrix(this.history[this.historyPointer],!1),this.lastHistoryEvent="redo",this}deepCopy(t){return JSON.parse(JSON.stringify(t))}applyF1ScoreFormula(t,e){return t*e/(t+e)*2||0}addToHistory(){-1===this.historyPointer?this.historyPointer=0:this.historyPointer++,this.history.push(this.clone(!0))}}var s;e.ConfusionMatrix=i,function(t){t[t.Micro=0]="Micro",t[t.Macro=1]="Macro",t[t.Weighted=2]="Weighted"}(s=e.AverageMethod||(e.AverageMethod={}))},590:function(t,e,i){var s=this&&this.__createBinding||(Object.create?function(t,e,i,s){void 0===s&&(s=i),Object.defineProperty(t,s,{enumerable:!0,get:function(){return e[i]}})}:function(t,e,i,s){void 0===s&&(s=i),t[s]=e[i]}),r=this&&this.__exportStar||function(t,e){for(var i in t)"default"===i||Object.prototype.hasOwnProperty.call(e,i)||s(e,t,i)};Object.defineProperty(e,"__esModule",{value:!0}),r(i(975),e)}},e={};return function i(s){var r=e[s];if(void 0!==r)return r.exports;var a=e[s]={exports:{}};return t[s].call(a.exports,a,a.exports,i),a.exports}(590)})()}));