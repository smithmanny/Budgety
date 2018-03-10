/********************************* Budget Controller *********************************/
const budgetController = (function() {

    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

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
    container: '.container'
  };

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
        newHtml = newHtml.replace('%value%', obj.value);

        // 3. Insert HTML into DOM 
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
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
        document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
        document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
        document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;

        if (obj.percentage > 0) {
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
            document.querySelector(DOMStrings.percentageLabel).textContent = '---';
        }
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
  };

  const updateBudget = function() {
    // 1. Calculate budget
    budgetController.calculateBudget();

    // 2. Return the budget
    let budget = budgetController.getBudget();

    // 3. Display budget on UI
    UIController.displayBudget(budget);
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
    }
  };

  const ctrlDeleteItem = function(event) {
    let itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemID) {
        splitID = itemID.split('-');
        type = splitID[0];
        ID = splitID[1]

        // 1. Delete item from data structure

        // 2. Delete item from UI

        // 3. Update and show new budget
    }
  };

  return {
      init: function() {
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