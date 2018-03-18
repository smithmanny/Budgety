/********************************* Budget Controller *********************************/
const budgetController = (function() {

    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round( (this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    const Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = function(type) {
        let sum = 0;

        data.allItems[type].forEach( (cur) => {
            sum += cur.value;
        })
        data.totals[type] = sum;
    }

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            let newItem;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            // Push to data structure
            data.allItems[type].push(newItem);

            // Return new element
            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(current => {
                return current.id;
            })

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('exp')
            calculateTotal('inc')

            // Calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp

            // Calculate percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(cur => {
                cur.calcPercentage(data.totals.inc)
            })
        },

        getPercentage: function() {
            let allPerc = data.allItems.exp.map(cur =>  cur.getPercentage())

            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data)
        }
    };


})();

/********************************* UI Controller *********************************/
const UIController = (function() {
  const DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  const formatNumber = function(num, type) {
      let numSplit, int, dec;

      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split('.');

      int = numSplit[0];

      if (int.length > 3) {
          int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
      }

      dec = numSplit[1];

      return (type === 'exp' ? sign = '-' : '+') + ' ' + int + '.' + dec
  }

  let nodeListForEach = function(list, callback) {
      for (let i = 0; i < list.length; i++) {
          callback(list[i], i)
      }
  }

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
        let html, newHtml, element;
        
        // 1. Create HTML string with placeholder text
        if (type === 'inc') {
            element = DOMStrings.incomeContainer;

            html = `<div class="item clearfix" id="inc-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
        } else {
            element = DOMStrings.expenseContainer;

            html = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`
        }

        // 2. Replace placeholder text
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

        // 3. Insert HTML into DOM 
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
        let el = document.getElementById(selectorID);

        el.parentNode.removeChild(el)
    },

    clearFields: function() {
        let fields, fieldsArr;

        fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach( (current, index, arr) => {
            current.value = '';
        })

        fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
        let type;

        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if (obj.percentage > 0) {
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
            document.querySelector(DOMStrings.percentageLabel).textContent = '---';
        }
    },

    displayPercentages: function(percentages) {
        let fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

        nodeListForEach(fields, function(current, index) {
            if (percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
            } else {
                current.textContent = '---';
            }
        });

    },

    displayMonth: function() {
        let now, year, month, months;

        // Get today's date
        now = new Date();

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
        'August', 'September', 'October', 'November', 'December'];
        month = now.getMonth();

        year = now.getFullYear();

        // Set date in label
        document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {
        let fields = document.querySelectorAll(
            DOMStrings.inputType + ',' +
            DOMStrings.inputDescription + ',' +
            DOMStrings.inputValue
        )

        nodeListForEach(fields, (cur) => {
            cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },

    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})();

/********************************* Global Controller *********************************/
const controller = (function(budgetCtrl, UICtrl) {

  const setupEventListeners = function() {
    const DOM = UIController.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keycode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
  };

  const updateBudget = function() {
    // 1. Calculate budget
    budgetController.calculateBudget();

    // 2. Return the budget
    let budget = budgetController.getBudget();

    // 3. Display budget on UI
    UIController.displayBudget(budget);
  }

  const updatePercentage = function() {
    // 1. Calculate Percentage
    budgetController.calculatePercentages();

    // 2. Read percentages from budget controller
    let percentages = budgetController.getPercentage();

    // 3. Update UI with new percentages
    UIController.displayPercentages(percentages);
  }

  const ctrlAddItem = function() {
    let input, newItem;

    // 1. Get input data
    input = UIController.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
        // 2. Add item to budget controller
        newItem = budgetController.addItem(input.type, input.description, input.value);

        // 3. Add new item to UI
        UIController.addListItem(newItem, input.type);

        // 4. Clear the fields
        UIController.clearFields();

        // 5. Caluclate and update budget
        updateBudget();

        // 6. Calculate and update percentages
        updatePercentage()
    }
  };

  const ctrlDeleteItem = function(event) {
    let itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemID) {
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // 1. Delete item from data structure
        budgetController.deleteItem(type, ID)

        // 2. Delete item from UI
        UIController.deleteListItem(itemID)

        // 3. Update and show new budget
        updateBudget();

        // 4. Calculate and update percentages
        updatePercentage()
    }
  };

  return {
      init: function() {
          UIController.displayMonth();
          UIController.displayBudget({
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
          });
          setupEventListeners();
      }
  }

})(budgetController, UIController);

controller.init();