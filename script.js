/**
 * Main goal: 
 * - allow the user to write clean math expressions via mathquill and output a ready-to-paste webwork answer
 * Tasks: 
 * - Get the latex expression 
 * - Parse the latex expression
 * - output to the screen a webwork friendly answer
 */

let mathFieldSpan = document.getElementById('math-field');
let outputText = document.getElementById('outputText');
let outputLatex = document.getElementById('outputLatex')
let copy = document.getElementById('copy') 
let clear = document.getElementById('clear')
let latexCopy = document.getElementById('cp-latex')
let webwork = ""
let latex = ""
let answer = ""



function updateSaved() {
    let currentlySavedLatex = localStorage.getItem("latex") || ""
    let currentlySavedExpressions = localStorage.getItem("expression") || ""

    if (latex !== "") {
        localStorage.setItem("latex", currentlySavedLatex + " " + latex) 
        localStorage.setItem("expression", currentlySavedExpressions + " " + answer)
    }
}


outputText.onfocus = (event) => {
    event.target.select()
}
outputText.onblur = (e) => {
    outputText.value = webwork
}

let MQ = MathQuill.getInterface(2);
let mathField = MQ.MathField(mathFieldSpan, {
    autoCommands: 'pi theta sqrt sum rho phi',
    spaceBehavesLikeTab: true, 
    handlers: {
        edit: function() {
            latex = mathField.latex()
            outputLatex.value = "$" + latex + "$" 
            answer = latexToWebWork(latex)
            webwork = answer
            outputText.value = answer
        }
    }
});

clear.onclick = () => {
    let saveOnClear = document.getElementById("save-on-clear") 
    if (saveOnClear.checked) {
        saveCurrentExpression()
    }
    mathField.latex("")
}

copy.onclick = () => {
    outputText.select()
    document.execCommand("copy")
    copy.className = "btn btn-success"
    setTimeout(() => {
        copy.className = "btn btn-primary"
    }, 1000)
}


latexCopy.onclick = () => {
    outputLatex.select()
    document.execCommand("copy")
    latexCopy.className = "btn btn-success"
    setTimeout(() => {
        latexCopy.className = "btn btn-dark"
    }, 1000)
}

/**
 * @param {string} latex 
 * 
 * Latex ==> WebWork Expression
 * 
 * 1. Brackets
 * 2. Fractions
 * 3. remove all '\'
 * 
 */

function latexToWebWork(latex) {
    latex = Brackets.remove(latex)
    latex = Fractions.remove(latex)
    latex = finish(latex)
    return latex
}


/**
 * Finds every \left and \right
 * and removes them.
 */
let Brackets = {
    remove(latex) {
        let i = 0
        while (i < latex.length) {
            if (this.isLeftBracket(latex, i)) {
                latex = drop(latex, i, i+4)
            } else if (this.isRightBracket(latex, i)) {
                latex = drop(latex, i, i+5)
            }
            i++
        }
        return latex
    }, 
    isLeftBracket(l, s) {
        if (l[s] === '\\' && s + 4 < l.length) {
            return l[s + 1] === 'l' && l[s + 2] === 'e' && l[s + 3] === 'f' && l[s + 4] === 't'
        }
        return false
    }, 
    isRightBracket(l, s) {
        if (l[s] == '\\' && s + 5 < l.length) {
            return l[s + 1] === 'r' && l[s + 2] === 'i' && l[s + 3] === 'g' && l[s + 4] === 'h' && l[s + 5] === 't'
        }
        return false
    }
}



/**
 * Finds every \frac { ... } { ... } and returns { ... } / { ... }
 */
let Fractions = {
    remove(latex) {
        let i = 0 
        while (i < latex.length) {
            if (this.isFrac(latex, i)) {
                latex = drop(latex, i, i + 4) 
                let stack = []
                for (let j = i; j < latex.length; j++) {
                    if (latex[j] === '{') {
                        stack.push('{')
                    } else if (latex[j] === '}') {
                        if (stack.length < 1) {
                            alert('INVALID FRACTION')
                            return 'ERROR'
                        }
                        stack.pop()
                        if (stack.length === 0) {
                            latex = latex.substring(0, j + 1) + '/' + latex.substring(j + 1, latex.length)
                            break
                        }
                    }
                }
            }
            i++
        }
        return latex
    },
    isFrac(l, s) {
        if (l[s] === '\\' && s + 4 < l.length) {
            return l[s + 1] === 'f' && l[s + 2] === 'r' && l[s + 3] === 'a' && l[s + 4] === 'c'
        }
        return false
    }   
}



/**
 * removes all instances of '/',
 * Looks for all instances of cdot and replaces with '*'
 */
function finish(latex) {
    let output = ""
    for (let c of latex) {
        if (c !== '\\') {
            output += c
        }
    }
    return removeCDot(output)
}


function removeCDot(output) {
    let i = 0
    while (i < output.length) {
        if (isCDot(output, i)) {
            const left = output.substring(0, i) 
            const right = output.substring(i + 4, output.length) 
            output = left + "*" + right
        }
        i++
    }
    return output
}

function isCDot(l, s) {
    if (l[s] === 'c' && s + 3 < l.length) {
        return l[s + 1] === 'd' && l[s + 2] === 'o' && l[s + 3] === 't'
    }
    return false
}


/**
 * 
 * @param {string} latex 
 * @param {int} start 
 * @param {int} end 
 * 
 * returns a new string without the characters between start and end inclusive.
 * Start and end are both indices. 
 */
function drop(latex, start, end) {
    if (start > end || start < 0 || end > latex.length) {
        alert('INVALID USE OF DROP.')
        return 'ERROR'
    }
    return latex.substring(0, start) + latex.substring(end + 1, latex.length)
}

/**
 * ==============================================================================
 * ==============================================================================
 *  TESTS:
 * ==============================================================================
 * ==============================================================================
 */
