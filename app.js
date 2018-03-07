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

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        }
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
    expenseContainer: '.expenses__list'
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: document.querySelector(DOMStrings.inputValue).value
      };
    },

    addListItem: function(obj, type) {
        let html, newHtml, element;
        // 1. Create HTML string with placeholder text

        if (type === 'inc') {
            element = DOMStrings.incomeContainer;

            html = `<div class="item clearfix" id="income-%id%">
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

            html = `<div class="item clearfix" id="expense-%id%">
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
  };

  const ctrlAddItem = function() {
    let input, newItem;

    // 1. Get input data
    input = UIController.getInput();

    // 2. Add item to budget controller
    newItem = budgetController.addItem(input.type, input.description, input.value)

    // 3. Add new item to UI
    UIController.addListItem(newItem, input.type);

    // 4. Calculate budget
    // 5. Display budget on UI
  };

  return {
      init: function() {
          setupEventListeners();
      }
  }

})(budgetController, UIController);

controller.init();